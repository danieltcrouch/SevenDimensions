const AI_TIMEOUT = 10000; //10 seconds
const SUBSEQUENT_TIMEOUT = 30000; //30 seconds
const MAX_TIMEOUT = 3600000; //1 hour


/*** SERVICE ***/


function launchBattle( tileId, attackerTileId = selectedUnits[0].tileId, attacker = currentPlayer ) {
    const enemyPlayer = game.players.find( p => p.units.some( u => u.tileId === tileId ) && p.id !== attacker.id );
    const enemyPlayerDetails = getPlayerBattleDetails( enemyPlayer, tileId, attacker );
    const currentPlayerDetails = getPlayerBattleDetails( attacker, attackerTileId, enemyPlayer, tileId ); //todo 4 - doesn't use selected units for attack
    createConflict( currentPlayerDetails, enemyPlayerDetails, function() {
        if ( attacker.id === currentPlayer.id ) {
            openBattleModal(
                attacker.username,
                enemyPlayer.username,
                currentPlayerDetails,
                enemyPlayerDetails,
                true,
                {
                    status: 'A',
                    attackStatus: null,
                    defendStatus: null
                },
                function() {}
            );
        }
    } );
}

function updateStatus( statusCode ) {
    if ( isAttacker ) {
        pollWithTimeout(
            AI_TIMEOUT,
            function(intervalId) {
                getPlayerStatusReady( function(isReady) {
                    if ( isReady ) {
                        updateBattleStatus( statusCode );
                        window.clearInterval(intervalId);
                    }
                } );
            },
            function() { updateBattleStatus( statusCode ); }
        );
    }

    return {
        status: statusCode,
        attackStatus: null,
        defendStatus: null,
    };
}

function getPlayerStatusReady( callback ) {
    postCallEncoded(
        "php/conflict-controller.php",
        {
            action: "getPlayerStatus",
            conflictId: conflictId
        },
        function( response ) {
            callback( response.attackStatus && response.defendStatus && response.attackStatus === 'R' && response.defendStatus === 'R' );
        }
    );
}

function updateBattleStatus( statusCode ) {
    postCallEncoded(
        "php/conflict-controller.php",
        {
            action: "updateBattleStatus",
            conflictId: conflictId,
            statusCode: statusCode
        },
        function() {}
    );
}

function updatePlayerStatus( isAttacker, statusCode ) {
    if ( status.status ) {
        postCallEncoded(
            "php/conflict-controller.php",
            {
                action: "updatePlayerStatus",
                conflictId: conflictId,
                isAttack: isAttacker,
                statusCode: statusCode
            },
            function() {}
        );
    }
}

function saveAttack( playerDetails, isAttacker, callback ) {
    saveAction( "Attack", playerDetails, isAttacker, callback );
}

function getAttacks( isAttacker, maxTime, callback, timeOutCallback ) {
    getAction(
        "Attacks",
        isAttacker,
        maxTime,
        callback,
        function( intervalId, result ) {
            if ( result && result.id ) {
                window.clearInterval(intervalId);
                callback( result );
            }
            else if ( result === 'D' ) {
                reset( intervalId );
            }
        },
        timeOutCallback
    );
}

function saveDisbands( playerDetails, isAttacker, callback ) {
    saveAction( "Disbands", playerDetails, isAttacker, callback );
}

function getDisbands( isAttacker, maxTime, callback, timeOutCallback ) {
    getAction(
        "Disbands",
        isAttacker,
        maxTime,
        callback,
        function( intervalId, result ) {
            if ( result && result.id ) {
                window.clearInterval(intervalId);
                callback( result );
            }
            else if ( result === 'A' ) {
                reset( intervalId );
            }
        },
        timeOutCallback
    );
}

function reset( intervalId ) {
    window.clearInterval(intervalId);
    conflictId = null;
    getCurrentBattle();
}

function end() {
    if ( isAttacker ) {
        pollWithTimeout(
            AI_TIMEOUT,
            function(intervalId) {
                getPlayerStatusReady( function(isReady) {
                    if ( isReady ) {
                        endBattle( currentPlayerDetails, enemyPlayerDetails );
                        window.clearInterval(intervalId);
                    }
                } );
            },
            function() { endBattle( currentPlayerDetails, enemyPlayerDetails ); }
        );

    }
}

function endBattle( attackPlayerDetails, defendPlayerDetails ) {
    const attackResult = defendPlayerDetails.units.filter( u => !u.disbanded ).length ?
                        ( attackPlayerDetails.units.filter( u => !u.disbanded ).length ? "D" : "L" ) :
                        ( attackPlayerDetails.units.filter( u => !u.disbanded ).length ? "W" : "D" );
    endConflict(
        attackPlayerDetails,
        defendPlayerDetails,
        attackResult,
        attackPlayerDetails.units.filter( u => u.disbanded ).length,
        defendPlayerDetails.units.filter( u => u.disbanded ).length,
        null,
        function( battleLog, attackPlayerDetails, defendPlayerDetails, attackResult ) {
            game.battles.push( battleLog );

            const tileId = defendPlayerDetails.tileId;
            attackPlayerDetails.units.forEach( u => {
                let unit = currentPlayer.units.find( du => du.id === u.id );
                if ( u.disbanded ) {
                    removeUnit( unit, currentPlayer );
                    if ( game.state.special.dDay === tileId ) {
                        currentPlayer.warBucks++;
                    }
                    if ( Number.isInteger( currentPlayer.special.wayOfTheSamurai ) ) {
                        currentPlayer.warBucks++;
                    }
                }
                else {
                    let unit = currentPlayer.units.find( du => du.id === u.id );
                    unit.hitDeflections = u.hitDeflections;
                    if ( attackResult === "W" && u.roll ) {
                        unit.tileId = tileId;
                    }
                }
            } );

            const defendPlayer = game.players.find( p => p.id === defendPlayerDetails.id );
            defendPlayerDetails.units.forEach( u => {
                let unit = defendPlayer.units.find( du => du.id === u.id );
                if ( u.disbanded ) {
                    removeUnit( unit, defendPlayer );
                    if ( Number.isInteger( defendPlayer.special.wayOfTheSamurai ) ) {
                        defendPlayer.warBucks++;
                    }
                }
                else {
                    if ( defendPlayer.districts.tileIds.includes( tileId ) ) {
                        const original = (unit.hitDeflections + unit.hitDeflectionsHG);
                        const used = original - u.hitDeflections;
                        unit.hitDeflectionsHG = Math.max(unit.hitDeflectionsHG - used, 0);
                        unit.hitDeflections = Math.min(original - used, unit.hitDeflections);
                    }
                    else {
                        unit.hitDeflections = u.hitDeflections;
                    }
                }
                if ( defendPlayerDetails.bonuses.potential.culturalTokens < 0 ) {
                    defendPlayer.initiatives.culturalTokens += defendPlayerDetails.bonuses.potential.culturalTokens;
                    const remainingReaperCount = defendPlayerDetails.units.filter( u => u.unitTypeId === UNIT_TYPES[REAPER].id && !defendPlayer.units.some( un => un.id === u.id ) ).length;
                    defendPlayer.initiatives.culturalActive.push( {tileId: tileId, reaperCount: remainingReaperCount} );
                }
            } );

            if ( attackResult === "W" ) {
                attackPlayerDetails.units.filter( u => u.roll && !u.disbanded ).forEach( u => {
                    let unit = currentPlayer.units.find( du => du.id === u.id );
                    unit.tileId = tileId;
                    unit.movesRemaining--;
                } );
                if ( getTileDetails(tileId).districtPlayerId ) {
                    swapDistrict( defendPlayerDetails.id, attackPlayerDetails.id, tileId );
                }
                if ( game.state.special.bounty === defendPlayerDetails.id ) {
                    currentPlayer.warBucks += BOUNTY_VALUE;
                    game.state.special.bounty = null;
                }
            }
        }
    );
}


/*** HELPER ***/


function getPlayerBattleDetails( player, tileId, enemyPlayer, toTileId = null ) {
    const tileUnits = player.units.filter( u => u.tileId === tileId );
    const isPlayerDistrict = player.districts.tileIds.includes( tileId );
    const isAttacking = Boolean( toTileId );
    const isDefending = !isAttacking;
    const combatUnits = tileUnits.filter( u => u.unitTypeId !== UNIT_TYPES[APOSTLE].id && (isDefending || u.movesRemaining > 0) );
    if ( isDefending && player.initiatives.culturalActive ) {
        let currentCR = player.initiatives.culturalActive.find( i => i.tileId === tileId );
        for ( let i = 0; currentCR && i < currentCR.reaperCount; i++ ) {
            combatUnits.push( new Unit( getRandomUnitId(), UNIT_TYPES[REAPER].id, tileId ) ); //todo 4 - make a special unit so name displays in modal as "Civil Resistor"
        }
    }
    const isHangingGardenDefense = isDefending && hasGarden( HANGING_GARDEN, player ) && !combatUnits.length && !enemyPlayer.special.scourge;
    if ( isHangingGardenDefense ) {
        combatUnits.push( new Unit( getRandomUnitId(), UNIT_TYPES[BOOMER].id, tileId ) ); //todo 4 - make a special unit so name displays in modal as "Hanging Garden"
    }
    return {
        id: player.id,
        tileId: tileId,
        bonuses: {
            kamikaze: hasDoctrine( HUMAN_SACRIFICE, player ),
            militaryTactics: hasTechnology( MILITARY_TACTICS, player ),
            timeTravel: hasTechnology( TIME_TRAVEL, player ),
            crusade: hasDoctrine( CRUSADES, player ) && isAttacking && player.religion && player.religion.tileIds.includes( toTileId ),
            waterGardens: hasGarden( WATER_GARDEN, player ) && isDefending && player.districts.tileIds.includes( tileId ) && !enemyPlayer.special.scourge,
            hangingGardens: hasGarden( HANGING_GARDEN, player ) && isDefending && player.districts.tileIds.includes( tileId ) && !isHangingGardenDefense && !enemyPlayer.special.scourge, //bonus for additional hit deflections, not undefended district
            bulldozer: player.special.bulldozer,
            dDay: isAttacking && game.state.special.dDay === toTileId,
            menOfSteel: false,
            potential: {
                criticalHit: hasChaos( 14, player ),
                menOfSteel: hasChaos( 61, player ),
                culturalTokens: player.initiatives.culturalActive.find( i => i.tileId === tileId ) ? player.initiatives.culturalTokens : 0
            }
        },
        units: combatUnits.map( u => ({
            id: u.id,
            unitTypeId: u.unitTypeId,
            roll: null,
            hits: 0,
            hitDeflections: u.hitDeflections + ((isPlayerDistrict && isDefending) ? u.hitDeflectionsHG : 0),
            disbanded: false
        }) )
    };
}

function rollForUnits( units, bonuses = {} ) {
    let result = [];
    units.forEach( u => {
        if ( !u.disbanded ) {
            let hitValue = getUnitType( u.unitTypeId ).hit;
            if ( bonuses.kamikaze && bonuses.kamikaze.includes( u.id ) ) {
                hitValue = KAMIKAZE_HIT;
            }
            else {
                if ( bonuses.militaryTactics && u.unitTypeId === UNIT_TYPES[REAPER].id ) {
                    hitValue++;
                }
                if ( bonuses.crusade ) {
                    hitValue += CRUSADE_HIT;
                }
                if ( bonuses.waterGardens ) {
                    hitValue += WATER_GARDEN_HIT;
                }
                if ( bonuses.bulldozer ) {
                    hitValue ++;
                }
                if ( bonuses.dDay ) {
                    hitValue ++;
                }
            }

            let rollResult = roll();
            result.push( {
                id: u.id,
                roll: rollResult,
                isHit: rollResult >= hitValue,
            } );
            if ( bonuses.timeTravel && u.unitTypeId === UNIT_TYPES[ROBOT].id ) {
                rollResult = roll();
                result.push( {
                    id: u.id,
                    roll: rollResult,
                    isHit: rollResult >= hitValue,
                } );
            }
        }
    } );
    return result;
}

function roll( dieMax = 12 ) {
    return Math.floor( Math.random() * dieMax ) + 1;
}

function addRollsToDetails( playerDetails, rolls ) {
    rolls.forEach( r => {
        let unit = playerDetails.units.find( u => u.id === r.id );
        const hasRolled = Boolean( unit.roll );
        const hitValue = r.isHit ? 1 : 0;
        unit.roll = hasRolled ? Math.min(unit.roll, r.roll) : r.roll;
        unit.hits = hasRolled ? (unit.hits + hitValue) : hitValue;
    } );
    return playerDetails;
}

function addDisbandsToDetails( playerDetails, disbands, deflections = [] ) {
    disbands.forEach( d => {
        let unit = playerDetails.units.find( u => u.id === d.id );
        if ( deflections.includes( unit.id ) ) {
            unit.hitDeflections--;
        }
        else {
            unit.disbanded = true;
        }
    } );
    return playerDetails;
}

function countHits( currentUnits, enemyUnits ) {
    const hits = enemyUnits.filter( (total, u) => total + u.hits, 0 );
    const livingUnits = currentUnits.filter( u => !u.disbanded ).length;
    return Math.min( hits, livingUnits );
}