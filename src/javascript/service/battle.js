//This could maybe use WebSocket technology or something similar, but I opted for polling
//https://stackoverflow.com/questions/11077857/what-are-long-polling-websockets-server-sent-events-sse-and-comet
//https://phppot.com/php/simple-php-chat-using-websocket/
let battleId;

const DELAY = 2000;
const AI_TIMEOUT = 10000;
const NORMAL_TIMEOUT = 30000;
const MAX_TIMEOUT = 3600000;

function getPlayerBattleDetails( playerId, units, tileId ) {
    return {
        id: playerId,
        tileId: tileId,
        units: units.filter( u => u.tileId === tileId ).map( u => { return {
            id: u.id,
            unitTypeId: u.unitType.id,
            roll: null,
            hit: false,
            hitDeflectionsUsed: 0,
            disbanded: false
        }; } )
    };
}

function getCurrentBattle() {
    if ( !battleId ) {
        postCallEncoded(
           "php/battle-controller.php",
           {
               action: "getCurrentBattle",
               gameId: gameId,
               userId: userId,
           },
           checkBattle
        );
    }
}

function checkBattle( battleDetails ) {
    battleDetails = jsonParse( battleDetails );
    if ( battleDetails.id ) {
        battleId = battleDetails.id;
        const isAttacker = battleDetails.attackDetails.id === currentPlayer.id;
        openBattleModal(
            isAttacker ? battleDetails.attackDetails : battleDetails.defendDetails,
            !isAttacker ? battleDetails.attackDetails : battleDetails.defendDetails,
            isAttacker,
            null,
            function() {}
        );
    }
}

function createBattle( attackPlayerDetails, defendPlayerDetails, callback ) {
    postCallEncoded(
       "php/battle-controller.php",
       {
           action: "createBattle",
           gameId: gameId,
           attackPlayerDetails: attackPlayerDetails,
           defendPlayerDetails: defendPlayerDetails
       },
       function( result ) {
           battleId = result;
           callback();
       }
    );
}

function rollForUnits( units ) {
    let result = [];
    units.forEach( u => {
        if ( !u.disbanded ) {
            const roll = roll();
            result.push( {
                id: u.id,
                roll: roll,
                isHit: roll > u.unitType.hit,
            } );
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
        unit.roll = r.roll;
        unit.hit = r.isHit;
    } );
    return playerDetails;
}

function addDisbandsToDetails( playerDetails, disbands ) {
    disbands.forEach( d => {
        let unit = playerDetails.units.find( u => u.id === d.id );
        unit.disbanded = true;
    } );
    return playerDetails;
}

function countHits( units ) {
    return units.filter( u => u.hit ).length;
}

function getLowestDisbands( units, disbandCount ) {
    return units.sort( (a,b) => parseInt(a.unitType.id) - parseInt(b.unitType.id) ).slice(0, disbandCount);
}

function saveHits( playerDetails, isAttack, callback ) {
    postCallEncoded(
        "php/battle-controller.php",
        {
            action: "saveHits",
            battleId: battleId,
            isAttack: isAttack,
            playerDetails: playerDetails,
        },
        callback
    );
}

function getHits( isAttack, maxTime, callback, timeOutCallback ) {
    setLimitedInterval(
        DELAY,
        maxTime,
        function( intervalId ) {
            postCallEncoded(
               "php/battle-controller.php",
               {
                   action: "getHits",
                   battleId: battleId,
                   isAttack: isAttack
               },
               function( result ) {
                   result = jsonParse( result );
                   if ( result ) {
                       window.clearInterval(intervalId);
                       callback( result );
                   }
               }
            );
        },
        timeOutCallback
    );
}

function updateStatus( statusCode ) {
    postCallEncoded(
       "php/battle-controller.php",
       {
           action: "updateStatus",
           battleId: battleId,
           statusCode: statusCode,
       },
       function() {}
    );
}

function saveDisbands( playerDetails, isAttack, callback ) {
    postCallEncoded(
        "php/battle-controller.php",
        {
            action: "saveDisbands",
            battleId: battleId,
            isAttack: isAttack,
            playerDetails: playerDetails,
        },
        callback
    );
}

function getDisbands( isAttack, maxTime, callback, timeOutCallback ) {
    setLimitedInterval(
        DELAY,
        maxTime,
        function( intervalId ) {
            postCallEncoded(
               "php/battle-controller.php",
               {
                   action: "getDisbands",
                   battleId: battleId,
                   isAttack: isAttack
               },
               function( result ) {
                   result = jsonParse( result );
                   if ( result ) {
                       window.clearInterval(intervalId);
                       callback( result );
                   }
               }
            );
        },
        timeOutCallback
    );
}

function endBattle( attackPlayerDetails, defendPlayerDetails ) {
    const attackResult = defendPlayerDetails.units.filter( u => !u.disbanded ).length ?
                        ( attackPlayerDetails.units.filter( u => !u.disbanded ).length ? "D" : "L" ) :
                        ( attackPlayerDetails.units.filter( u => !u.disbanded ).length ? "W" : "D" );
    const battleLog = {
        id: battleId,
        round: game.state.round,
        result: attackResult,
        attackTile: attackPlayerDetails.tileId,
        defendTile: defendPlayerDetails.tileId,
        attackPlayerId: attackPlayerDetails.id,
        defendPlayerId: defendPlayerDetails.id,
        attackDisbands: attackPlayerDetails.units.filter( u => u.disbanded ).length,
        defendDisbands: defendPlayerDetails.units.filter( u => u.disbanded ).length
    };
    postCallEncoded(
       "php/battle-controller.php",
       {
           action: "endBattle",
           battleId: battleId,
           battleInfo: battleLog
       },
       function() {
           game.battles.push( battleLog );
           updatePlayerUnits( attackPlayerDetails, defendPlayerDetails, attackResult );
       }
    );
}

function updatePlayerUnits( attackPlayerDetails, defendPlayerDetails, attackResult ) {
    attackPlayerDetails.units.forEach( u => {
        if ( u.disbanded ) {
            removeUnit( u, currentPlayer );
        }
        else {
            let unit = currentPlayerDisambiguousUnits.find( du => du.id === u.id );
            if ( u.hitDeflectionsUsed ) {
                unit.hitDeflection = u.hitDeflectionsUsed;
            }
            if ( attackResult === "W" && u.roll ) {
                unit.tileId = defendPlayerDetails.tileId;
            }
        }
    } );

    const defendPlayer = game.players.find( p => p.id === defendPlayerDetails.id );
    defendPlayerDetails.units.forEach( u => {
        if ( u.disbanded ) {
            removeUnit( u, defendPlayer );
        }
        else {
            let unitStack = defendPlayer.units.find( us => us.unitTypeId === u.unitTypeId );
            if ( u.hitDeflectionsUsed ) {
                unitStack.hitDeflection = u.hitDeflectionsUsed;
            }
        }
    } );

    if ( attackResult === "W" ) {
        attackPlayerDetails.units.filter( u => u.roll && !u.disbanded ).forEach( u => {
            currentPlayerDisambiguousUnits.find( du => du.id === u.id ).tileId = defendPlayerDetails.tileId;
        } );
        if ( getTileDetails(defendPlayerDetails.tileId).districtPlayerId ) {
            swapDistrict( defendPlayerDetails.id, attackPlayerDetails.id, defendPlayerDetails.tileId );
        }
    }
}

function setLimitedInterval( delay, maxTime, callback, timeOutCallback ) {
    const maxRepetitions = maxTime / delay;
    let x = 0;
    const intervalId = window.setInterval( function () {
       if ( ++x <= maxRepetitions ) {
           callback( intervalId );
       }
       else {
           window.clearInterval( intervalId );
           timeOutCallback();
       }
    }, delay );
}