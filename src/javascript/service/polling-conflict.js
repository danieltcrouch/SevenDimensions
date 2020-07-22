let conflictId;

const CONFLICT_TIMEOUT = 300000; //5 minutes

function createConflict( attackPlayerDetails, defendPlayerDetails, callback, conflictStatus = 'A' ) {
    postCallEncoded(
       "php/conflict-controller.php",
       {
           action: "createConflict",
           gameId: gameId,
           attackPlayerDetails: attackPlayerDetails,
           defendPlayerDetails: defendPlayerDetails,
           conflictStatus: conflictStatus
       },
       function( result ) {
           //todo 4 - notify defender of battle
           conflictId = result;
           callback();
       }
    );
}

function getCurrentConflict() {
    if ( !conflictId ) {
        postCallEncoded(
           "php/conflict-controller.php",
           {
               action: "getCurrentConflict",
               gameId: gameId,
               userId: userId,
           },
           function( conflictDetails ) {
               if ( conflictDetails.id ) {
                   conflictId = conflictDetails.id;
                   const attackDetails = jsonParse( conflictDetails.attackDetails );
                   const defendDetails = jsonParse( conflictDetails.defendDetails );
                   const isAttacker = attackDetails.id === currentPlayer.id;
                   let currentPlayerDetails = isAttacker ? attackDetails : defendDetails;
                   let enemyPlayerDetails = !isAttacker ? attackDetails : defendDetails;

                   const isInitiative = conflictDetails.conflictStatus === "I";
                   if ( isInitiative ) {
                       openAnnexDisplay(
                           currentPlayer.username,
                           getPlayer( enemyPlayerDetails.id ).username,
                           currentPlayerDetails,
                           enemyPlayerDetails,
                           isAttacker
                       );
                   }
                   else {
                       openBattleModal(
                           currentPlayer.username,
                           getPlayer( enemyPlayerDetails.id ).username,
                           currentPlayerDetails,
                           enemyPlayerDetails,
                           isAttacker,
                           {
                               status: conflictDetails.conflictStatus,
                               attackStatus: conflictDetails.attackStatus,
                               defendStatus: conflictDetails.defendStatus
                           },
                           function() {}
                       );
                   }
               }
           }
        );
    }
}

function saveAction( actionType, playerDetails, isAttacker, callback ) {
    postCallEncoded(
        "php/conflict-controller.php",
        {
            action: `save${actionType}`,
            conflictId: conflictId,
            isAttack: isAttacker,
            playerDetails: playerDetails
        },
        callback
    );
}

function getAction( actionType, isAttacker, maxTime, callback, successCallback, timeOutCallback ) {
    pollWithTimeout(
        maxTime,
        function( intervalId ) {
            postCallEncoded(
                "php/conflict-controller.php",
                {
                    action: `get${actionType}`,
                    conflictId: conflictId,
                    isAttack: isAttacker
                },
                function( result ) {
                    successCallback( intervalId, result );
                }
            );
        },
        timeOutCallback
    );
}

function endConflict( attackPlayerDetails, defendPlayerDetails, conflictResult, attackDisbands, defendDisbands, attackStrength, callback ) {
    const conflictLog = {
        id: conflictId,
        round: game.state.round,
        result: conflictResult,
        attackTile: attackPlayerDetails.tileId,
        defendTile: defendPlayerDetails.tileId,
        attackPlayerId: attackPlayerDetails.id,
        defendPlayerId: defendPlayerDetails.id,
        attackDisbands: attackDisbands,
        defendDisbands: defendDisbands,
        attackStrength: attackStrength
    };
    postCallEncoded(
       "php/conflict-controller.php",
       {
           action: "endConflict",
           conflictId: conflictId,
           conflictInfo: conflictLog
       },
       function() {
           callback( conflictLog, attackPlayerDetails, defendPlayerDetails, conflictResult );
       }
    );
}