//This could maybe use WebSocket technology or something similar, but I opted for polling
//https://stackoverflow.com/questions/11077857/what-are-long-polling-websockets-server-sent-events-sse-and-comet
//https://phppot.com/php/simple-php-chat-using-websocket/
let battleId;

const DELAY = 2000;
const AI_TIMEOUT = 10000;
const NORMAL_TIMEOUT = 30000;
const MAX_TIMEOUT = 3600000;

const KAMIKAZE_HIT = 3;

function getPlayerBattleDetails( player, tileId ) {
    const tileUnits = player.units.filter( u => u.tileId === tileId );
    const isPlayerDistrict = player.districts.tileIds.includes( tileId );
    const isDefending = player.id !== currentPlayer.id;
    return {
        id: player.id,
        tileId: tileId,
        bonuses: {
            kamikaze: player.advancements.doctrines.includes(DOCTRINES[HUMAN_SACRIFICE].id),
            hangingGardens: false,
            menOfSteel: false,
            potential: {
                menOfSteel: player.cards.chaos.includes( CHAOS[61].id )
            }
        },
        units: tileUnits.filter( u => u.unitTypeId !== UNIT_TYPES[APOSTLE].id ).map( u => ({
            id: u.id,
            unitTypeId: u.unitTypeId,
            roll: null,
            hit: false,
            hitDeflections: u.hitDeflections + ((isPlayerDistrict && isDefending) ? u.hitDeflectionsHG : 0),
            disbanded: false
        }) )
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
        const attackDetails = jsonParse( battleDetails.attackDetails );
        const defendDetails = jsonParse( battleDetails.defendDetails );
        const isAttacker = attackDetails.id === currentPlayer.id;
        openBattleModal(
            isAttacker ? attackDetails : defendDetails,
            !isAttacker ? attackDetails : defendDetails,
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
           attackPlayerDetails: JSON.stringify( attackPlayerDetails ),
           defendPlayerDetails: JSON.stringify( defendPlayerDetails )
       },
       function( result ) {
           battleId = jsonParse( result );
           callback();
       }
    );
}

function rollForUnits( units, kamikazes = [] ) {
    let result = [];
    units.forEach( u => {
        if ( !u.disbanded ) {
            const hitValue = kamikazes.includes( u.id ) ? KAMIKAZE_HIT : getUnitType( u.unitTypeId ).hit;
            const rollResult = roll();
            result.push( {
                id: u.id,
                roll: rollResult,
                isHit: rollResult >= hitValue,
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

function addDisbandsToDetails( playerDetails, disbands, deflections = [] ) {
    disbands.forEach( d => {
        let unit = playerDetails.units.find( u => u.id === d.id );
        if ( deflections.includes( unit.id ) ) {
            unit.disbanded = true;
        }
        else {
            unit.hitDeflections--;
        }
    } );
    return playerDetails;
}

function countHits( units ) {
    return units.filter( u => u.hit ).length;
}

function getLowestDisbands( units, disbandCount ) {
    return units.sort( (a,b) => parseInt(a.unitTypeId) - parseInt(b.unitTypeId) ).slice(0, disbandCount);
}

function saveHits( playerDetails, isAttack, callback ) {
    postCallEncoded(
        "php/battle-controller.php",
        {
            action: "saveHits",
            battleId: battleId,
            isAttack: isAttack,
            playerDetails: JSON.stringify( playerDetails ),
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
            playerDetails: JSON.stringify( playerDetails ),
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
           battleInfo: JSON.stringify( battleLog )
       },
       function() {
           game.battles.push( battleLog );
           updatePlayerUnits( attackPlayerDetails, defendPlayerDetails, attackResult );
       }
    );
}

function updatePlayerUnits( attackPlayerDetails, defendPlayerDetails, attackResult ) {
    const tileId = defendPlayerDetails.tileId;
    attackPlayerDetails.units.forEach( u => {
        if ( u.disbanded ) {
            removeUnit( u, currentPlayer );
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
        if ( u.disbanded ) {
            removeUnit( u, defendPlayer );
        }
        else {
            let unit = defendPlayer.units.find( du => du.id === u.id );
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
    } );

    if ( attackResult === "W" ) {
        attackPlayerDetails.units.filter( u => u.roll && !u.disbanded ).forEach( u => {
            currentPlayer.units.find( du => du.id === u.id ).tileId = tileId;
        } );
        if ( getTileDetails(defendPlayerDetails.tileId).districtPlayerId ) {
            swapDistrict( defendPlayerDetails.id, attackPlayerDetails.id, tileId );
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