function performAnnex() {
    setSpecialAction(
        function( tileId ) { return hasEnemyDistrict( tileId ) && !hasInitiative( selectedTile, tileId, true ) && getAdjacentTiles( selectedTile ).includes( tileId ); },
        performAnnexCallback
    );
}

function hasInitiative( fromTileId, toTileId, checkPolitical ) {
    return game.players.some( p => {
        let activeInitiatives = checkPolitical ? p.initiatives.politicalActive : p.initiatives.culturalActive;
        return activeInitiatives.includes( i => i.from === fromTileId && (!checkPolitical || i.to === toTileId) );
    }  );
}

function performAnnexCallback( tileId ) {
    let enemyPlayer = game.players.find( p => p.districts.tileIds.includes( tileId ) );
    if ( enemyPlayer ) {
        showPrompt(
            "Annexation",
            `Enter the number of Political Initiative Tokens (out of ${currentPlayer.initiatives.politicalTokens}) to use:`,
            function( response ) {
                const isCancel = response === undefined;
                if ( !isCancel ) {
                    const tokenCount = parseInt( response );
                    if ( Number.isInteger( tokenCount ) ) {
                        if ( tokenCount <= currentPlayer.initiatives.politicalTokens ) {
                            startAnnex( tokenCount, selectedTile, tileId );
                        }
                        else {
                            showToaster( "Token count too high." );
                        }
                    }
                    else {
                        showToaster( "Invalid Token count." );
                    }
                }
            },
            "1"
        );
    }
}

function startAnnex( tokenCount, fromTileId, toTileId ) {
    const value = tokenCount * VALUE_OF_ANNEX * (currentPlayer.special.assimilation?ASSIMILATION_VALUE:1);
    const currentPlayerDetails = {
        id: currentPlayer.id,
        tileId: fromTileId,
        attackStrength: value,
        politicalTokens: tokenCount
    };
    const enemyPlayer = game.players.find( p => p.districts.tileIds.includes( toTileId ) );
    const culturalActive = enemyPlayer.initiatives.culturalActive.filter( i => i.tileId === toTileId ).map( i => i.reaperCount );
    const enemyPlayerDetails = {
        id: enemyPlayer.id,
        tileId: toTileId,
        warBucks: enemyPlayer.warBucks,
        culturalTokens: enemyPlayer.initiatives.culturalTokens,
        culturalActive: culturalActive.length ? culturalActive[0] : 0, //reaperCount
        units: enemyPlayer.units.filter( u => u.tileId === toTileId )
    };
    createBattle(
        currentPlayerDetails,
        enemyPlayerDetails,
        function() {
            openAnnexDisplay(
                currentPlayer.username,
                enemyPlayer.username,
                currentPlayerDetails,
                enemyPlayerDetails,
                true
            );
        },
        'I'
    );
}

function openAnnexDisplay( currentName, enemyName, currentPlayer, enemyPlayer, isAttacker ) {
    if ( isAttacker ) {
        showMessage( "Annexation", "Waiting on defending player..." );
        getInitiative(
            isAttacker,
            FIRST_TIMEOUT,
            function( enemyPlayerDetails ) {
                endAnnex( currentPlayer, enemyPlayerDetails );
            },
            function() {
                endAnnex( currentPlayer, getLowestResistance( currentPlayer.attackStrength, enemyPlayer ) );
        } );
    }
    else {
        //todo 7 - Liquify
        //  Need to convert modal results to accepted format
        //  Don't pass in any culturalTokens if already used that round
        saveInitiative( getLowestResistance( currentPlayer.attackStrength, enemyPlayer ) /* todo 7 - use until Liquify ready */, false, function(){} );
    }
}

function saveInitiative( playerDetails, isAttacker, callback ) {
    postCallEncoded(
        "php/battle-controller.php",
        {
            action: "saveInitiative",
            battleId: battleId,
            isAttack: isAttacker,
            playerDetails: JSON.stringify( playerDetails ),
        },
        callback
    );
}

function getInitiative( isAttacker, maxTime, callback, timeOutCallback ) {
    setLimitedInterval(
        DELAY,
        maxTime,
        function( intervalId ) {
            postCallEncoded(
               "php/battle-controller.php",
               {
                   action: "getInitiative",
                   battleId: battleId,
                   isAttack: isAttacker
               },
               function( result ) {
                   result = jsonParse( result );
                   if ( result && result.id ) {
                       window.clearInterval(intervalId);
                       callback( result );
                   }
               }
            );
        },
        timeOutCallback
    );
}

function endAnnex( attackPlayerDetails, defendPlayerDetails ) {
    const attackResult = !defendPlayerDetails.isSuccess ? "W" : "L";
    const battleLog = {
        id: battleId,
        round: game.state.round,
        result: attackResult,
        attackTile: attackPlayerDetails.tileId,
        defendTile: defendPlayerDetails.tileId,
        attackPlayerId: attackPlayerDetails.id,
        defendPlayerId: defendPlayerDetails.id,
        attackStrength: attackPlayerDetails.attackStrength
    };
    postCallEncoded(
       "php/battle-controller.php",
       {
           action: "endBattle",
           battleId: battleId,
           battleInfo: JSON.stringify( battleLog )
       },
       function() {
           //game.battles.push( battleLog );

           currentPlayer.initiatives.politicalTokens -= attackPlayerDetails.politicalTokens;
           currentPlayer.initiatives.politicalActive.push({from: attackPlayerDetails.tileId, to: defendPlayerDetails.tileId});

           const defendPlayer = getPlayer( defendPlayerDetails.id );
           if ( attackResult === "W" ) {
               swapDistrict( defendPlayerDetails.id, attackPlayerDetails.id, defendPlayerDetails.tileId );
               defendPlayer.units.forEach( u => {
                   if ( u.tileId === defendPlayerDetails.tileId && u.unitTypeId !== UNIT_TYPES[APOSTLE].id ) {
                       removeUnit( u, currentPlayer );
                   }
               } );
           }
           else {
               defendPlayer.warBucks -= defendPlayerDetails.defense.warBucks;
               defendPlayer.units.forEach( u => {
                   if ( defendPlayerDetails.defense.units.includes( u.id ) ) {
                       removeUnit( u, defendPlayer );
                   }
               } );

               if ( defendPlayerDetails.defense.culturalTokens ) {
                   defendPlayer.initiatives.culturalTokens -= defendPlayerDetails.defense.culturalTokens;
                   const remainingReapers = Math.min( (defendPlayerDetails.defense.culturalTokens * REAPERS_IN_CR), (defendPlayerDetails.defendStrength - attackPlayerDetails.attackStrength) );
                   defendPlayer.initiatives.culturalActive.push( {
                       tileId: defendPlayerDetails.tileId,
                       reaperCount: remainingReapers
                   } );
               }
               else {
                   defendPlayer.initiatives.culturalActive.find( i => i.tileId === defendPlayerDetails.tileId ).reaperCount -= defendPlayerDetails.defense.culturalActive;
               }
           }
       }
    );
}

function getLowestResistance( annexStrength, playerDetails ) {
    let runningTotal = 0;

    let tokensUsed = 0;
    if ( playerDetails.culturalTokens ) {
        tokensUsed = Math.min( Math.floor( annexStrength / REAPERS_IN_CR ), playerDetails.culturalTokens );
        runningTotal += tokensUsed * REAPERS_IN_CR;
    }
    let reapersUsed = 0;
    if ( playerDetails.culturalActive ) {
        reapersUsed = Math.min( (annexStrength - runningTotal), playerDetails.culturalActive );
        runningTotal += reapersUsed;
    }
    let bucksUsed = 0;
    if ( playerDetails.warBucks ) {
        bucksUsed = Math.min( (annexStrength - runningTotal), playerDetails.warBucks );
        runningTotal += bucksUsed;
    }
    let unitsUsed = [];
    if ( playerDetails.units.length ) {
        playerDetails.units.sort( (u1,u2) => u1.getCost() - u2.getCost() );
        for ( let i = 0; i < playerDetails.units.length && runningTotal < annexStrength; i++ ) {
            const unit = playerDetails.units[i];
            unitsUsed.push( unit );
            runningTotal += unit.getCost();
        }
    }

    const isSuccess = runningTotal >= annexStrength;
    return {
        id: playerDetails.id,
        tileId: playerDetails.tileId,
        isSuccess: isSuccess,
        defendStrength: isSuccess ? runningTotal : 0,
        defense: {
            warBucks: isSuccess ? bucksUsed : 0,
            culturalTokens: isSuccess ? tokensUsed : 0,
            culturalActive: isSuccess ? reapersUsed : 0,
            units: isSuccess ? unitsUsed : [],
        }
    };
}