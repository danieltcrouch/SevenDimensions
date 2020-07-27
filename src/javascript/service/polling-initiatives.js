/*** GUI ***/


function performAnnex() {
    setSpecialAction(
        function( tileId ) { return hasEnemyDistrict( tileId ) && !hasInitiative( selectedTile.id, tileId, true ) && getAdjacentTiles( selectedTile.id ).includes( tileId ); },
        performAnnexCallback
    );
}

function performAnnexCallback( tileId ) {
    let enemyPlayer = game.players.find( p => p.districts.tileIds.includes( tileId ) );
    if ( enemyPlayer ) {
        showNumberPrompt(
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


/*** SERVICE ***/


function startAnnex( tokenCount, fromTileId, toTileId ) {
    const value = tokenCount * VALUE_OF_ANNEX * (currentPlayer.special.assimilation?ASSIMILATION_VALUE:1);
    currentPlayer.special.assimilation = false;
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
        culturalTokens: enemyPlayer.special.squelched ? 0 : enemyPlayer.initiatives.culturalTokens,
        culturalActive: culturalActive.length ? culturalActive[0] : 0, //reaperCount
        units: enemyPlayer.units.filter( u => u.tileId === toTileId )
    };
    createConflict(
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

    enemyPlayer.special.squelched = false;
}

function openAnnexDisplay( currentName, enemyName, currentPlayer, enemyPlayer, isAttacker ) {
    if ( isAttacker ) {
        showMessage( "Annexation", "Waiting on defending player..." );
        getInitiative(
            isAttacker,
            CONFLICT_TIMEOUT,
            function( enemyPlayerDetails ) {
                endAnnex( currentPlayer, enemyPlayerDetails );
                if ( id('modal').style.display !== "none" && id('modal').querySelector( '#modalHeader' ).innerText === "Annexation" ) {
                    closeModalJS( "modal" ); //todo X - get Modal guid that you can close if it is still displaying
                }
            },
            function() {
                endAnnex( currentPlayer, getLowestResistance( currentPlayer.attackStrength, enemyPlayer ) );
                if ( id('modal').style.display !== "none" && id('modal').querySelector( '#modalHeader' ).innerText === "Annexation" ) {
                    closeModalJS( "modal" );
                }
        } );
    }
    else {
        const useTokens = currentPlayer.culturalActive === 0;
        openLiquifyModal(
            {
                warBucks: currentPlayer.warBucks,
                initiativeTokens: useTokens ? currentPlayer.initiativeTokens : ( currentPlayer.initiatives.culturalActive.find( c => c.tileId === currentPlayer.tileId ).reaperCount / REAPERS_IN_CR ),
                units: currentPlayer.units.filter( u => u.tileId === currentPlayer.tileId ).map( u => new Unit( u.id, u.unitTypeId, u.tileId ) ),
            },
            currentPlayer.attackStrength,
            function( total, assets ) {
                const isSuccess = total >= currentPlayer.attackStrength;
                saveInitiative(
                    {
                        id: currentPlayer.id,
                        tileId: currentPlayer.tileId,
                        isSuccess: isSuccess,
                        defendStrength: isSuccess ? total : 0,
                        defense: {
                            warBucks: isSuccess ? assets.warBucks : 0,
                            culturalTokens: ( isSuccess && useTokens )  ? assets.initiatives.culturalTokens : 0,
                            culturalActive: ( isSuccess && !useTokens ) ? ( assets.initiatives.culturalTokens * REAPERS_IN_CR ) : 0,
                            units: isSuccess ? assets.units : [],
                        }
                    },
                    false,
                    function(){
                        conflictId = null;
                    }
                );
            }
        );
    }
}

function saveInitiative( playerDetails, isAttacker, callback ) {
    saveAction( "Initiative", playerDetails, isAttacker, callback );
}

function getInitiative( isAttacker, maxTime, callback, timeOutCallback ) {
    getAction(
        "Initiative",
        isAttacker,
        maxTime,
        callback,
        function( intervalId, result ) {
            if ( result && result.id ) {
                window.clearInterval(intervalId);
                callback( result );
            }
        },
        timeOutCallback
    );
}

function endAnnex( attackPlayerDetails, defendPlayerDetails ) {
    const annexResult = !defendPlayerDetails.isSuccess ? "W" : "L";
    endConflict(
        attackPlayerDetails,
        defendPlayerDetails,
        annexResult,
        null,
        null,
        attackPlayerDetails.attackStrength,
        function( annexLog, attackPlayerDetails, defendPlayerDetails, annexResult ) {
            currentPlayer.initiatives.politicalTokens -= attackPlayerDetails.politicalTokens;
            currentPlayer.initiatives.politicalActive.push({from: attackPlayerDetails.tileId, to: defendPlayerDetails.tileId});

            const defendPlayer = getPlayer( defendPlayerDetails.id );
            if ( annexResult === "W" ) {
                swapDistrict( defendPlayer, currentPlayer, defendPlayerDetails.tileId );
                defendPlayer.units.forEach( u => {
                    if ( u.tileId === defendPlayerDetails.tileId && u.unitTypeId !== UNIT_TYPES[APOSTLE].id ) {
                        removeUnit( u, defendPlayer );
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


/*** HELPER ***/


function hasInitiative( fromTileId, toTileId, checkPolitical ) {
    return game.players.some( p => {
        let activeInitiatives = checkPolitical ? p.initiatives.politicalActive : p.initiatives.culturalActive;
        return activeInitiatives.includes( i => i.from === fromTileId && (!checkPolitical || i.to === toTileId) );
    }  );
}