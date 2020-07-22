function startTrade() {
    //todo 7 - when I cancel, the background gray background doesn't disappear
    //todo 7 - when I submit player selection, modal does not disappear
    pickPlayers(
        false,
        false,
        function(response) {
            if ( response ) {
                openTradeModal(
                    currentPlayer,
                    getPlayer( response )
                );
            }
        },
        game.players.filter( p => p.id !== currentPlayer.id ), //todo 1 - adds players to list (needs to reset)
        "Select a player to trade with:"
    );
}

function continueTrade( tradeId ) {
    const trade = game.trades.find( t => t.id === tradeId );
    const currentId = trade.details1.id === currentPlayer.id ? '1' : '2';
    const otherPlayer = currentId === '1' ? getPlayer( trade.details2.id ) : getPlayer( trade.details1.id );
    openTradeModal(
        currentPlayer,
        otherPlayer,
        (currentId === '1' ? trade.details1 : trade.details2),
        (currentId === '1' ? trade.details2 : trade.details1),
        tradeId,
        currentId === '1'
    );
}


/*** DATABASE ***/


function createTrade( tradeFromDetails, tradeToDetails ) {
    game.trades.push( {
        details1: tradeFromDetails,
        details2: tradeToDetails,
        status1: 'O',
        status2: 'W',
        tradeStatus: 'O',
    } );

    postCallEncoded(
       "php/trade-controller.php",
       {
           action: "createTrade",
           gameId: gameId,
           details1: tradeFromDetails,
           details2: tradeToDetails
       },
       function() {
           showToaster( "Trade offer sent" );
       }
    );
}

function getCurrentTrades() {
    if ( isAsyncPhase( false ) ) {
        postCallEncoded(
            "php/trade-controller.php",
            {
                action: "getCurrentTrades",
                gameId: gameId,
                userId: userId,
            },
            updateCurrentTrades
        );
    }
}

function saveOffer( tradeId, details1, details2, isPlayer1 ) {
    const trade = game.trades.find( t => t.id === tradeId );
    trade.details1 = details1;
    trade.details1 = details2;
    trade.status1 = isPlayer1?'O':'W';
    trade.status2 = isPlayer1?'W':'O';
    trade.tradeStatus = 'O';
    postCallEncoded(
        "php/trade-controller.php",
        {
            action: "saveTrade",
            tradeId: tradeId,
            details1: details1,
            details2: details2,
            status1: trade.status1,
            status2: trade.status2,
            tradeStatus: trade.tradeStatus
        },
        function() {}
    );
}

function saveAccept( tradeId, details1, details2, isPlayer1 ) {
    const trade = game.trades.find( t => t.id === tradeId );
    trade.details1 = details1;
    trade.details1 = details2;
    trade.status1 = isPlayer1?'A':null;
    trade.status2 = isPlayer1?null:'A';
    trade.tradeStatus = 'P';
    postCallEncoded(
        "php/trade-controller.php",
        {
            action: "saveTrade",
            tradeId: tradeId,
            details1: details1,
            details2: details2,
            status1: trade.status1,
            status2: trade.status2,
            tradeStatus: trade.tradeStatus
        },
        function() {}
    );
}

function saveAcceptStatus( tradeId, isPlayer1, callback = function() {} ) {
    const trade = game.trades.find( t => t.id === tradeId );
    trade.status1 = 'A';
    trade.status2 = 'A';
    trade.tradeStatus = 'P';
    postCallEncoded(
        "php/trade-controller.php",
        {
            action: "saveStatus",
            tradeId: tradeId,
            status1: trade.status1,
            status2: trade.status2,
            tradeStatus: trade.tradeStatus
        },
        callback
    );
}

function saveDecline( tradeId, isPlayer1, callback = function() {} ) {
    const trade = game.trades.find( t => t.id === tradeId );
    trade.status1 = isPlayer1?'D':null;
    trade.status2 = isPlayer1?null:'D';
    trade.tradeStatus = 'P';
    postCallEncoded(
        "php/trade-controller.php",
        {
            action: "saveStatus",
            tradeId: tradeId,
            status1: trade.status1,
            status2: trade.status2,
            tradeStatus: trade.tradeStatus
        },
        callback
    );
}

function endTrade( tradeId, callback = function() {} ) {
    const trade = game.trades.find( t => t.id === tradeId );
    trade.status1 = null;
    trade.status2 = null;
    trade.tradeStatus = 'C';
    postCallEncoded(
        "php/trade-controller.php",
        {
            action: "saveStatus",
            tradeId: tradeId,
            status1: trade.status1,
            status2: trade.status2,
            tradeStatus: trade.tradeStatus
        },
        callback
    );
}

function declineActiveTrades() {
    game.trades.filter( t => t.tradeStatus === 'P' || t.tradeStatus === 'O' ).forEach( t => {
        const isPlayer1 = t.details1.id === currentPlayer.id;
        const hasAcceptDebited = t.tradeStatus === 'P' && (isPlayer1?t.status1==='A':t.status2==='A') && (isPlayer1?t.status2===null:t.status1===null);
        saveDecline( t.id, isPlayer1, function() {
            if ( hasAcceptDebited ) {
                creditTrade( currentPlayer, isPlayer1?t.details1:t.details2 ); //get debit back
            }
        } );
    } );
}


/*** SERVICE ***/


function updateCurrentTrades( trades ) {
    let hasReceivedOffer = false;
    let hasOfferChanged = false;
    trades.forEach( t => {
        if ( game.trades.some( gt => gt.id === t.id ) ) {
            const index = game.trades.findIndex( gt => gt.id === t.id );
            if ( game.trades[index].status1 !== t.status1 ||
                 game.trades[index].status2 !== t.status2 ||
                 game.trades[index].tradeStatus !== t.tradeStatus ) {
                hasOfferChanged = true;
            }
            game.trades[index] = t;
        }
        else {
            game.trades.push( t );
            hasReceivedOffer = true;
        }

        performAutomaticTradeActions( t );
    } );

    if ( hasOfferChanged ) {
        showToaster( "Your trade offer status has changed." );
    }
    else if ( hasReceivedOffer ) {
        showToaster( "You have received a new trade offer." );
    }
    if ( hasOfferChanged || hasReceivedOffer ) {
        refreshTrade();
    }
}

function performAutomaticTradeActions( trade ) {
    if ( trade.tradeStatus === 'P' ) {
        const isPlayer1 = trade.details1.id === currentPlayer.id;
        const currentStatus = isPlayer1 ? trade.status1 : trade.status2;
        const enemyStatus   = isPlayer1 ? trade.status2 : trade.status1;
        if ( currentStatus === null && enemyStatus ) { //other player has responded
            if ( enemyStatus === 'A' ) {
                if ( isTradeValid( currentPlayer, trade ) ) {
                    debitTrade(  currentPlayer, isPlayer1?trade.details1:trade.details2 );
                    creditTrade( currentPlayer, isPlayer1?trade.details2:trade.details1 );
                    saveAcceptStatus( trade.id, isPlayer1 );
                }
                else {
                    saveDecline( trade.id, isPlayer1 );
                }
            }
            else {
                endTrade( trade.id );
            }
        }
        else if ( currentStatus && enemyStatus ) { //both players have responded
            if ( enemyStatus === 'A' ) {
                creditTrade( currentPlayer, isPlayer1?trade.details2:trade.details1 );
            }
            else {
                creditTrade( currentPlayer, isPlayer1?trade.details1:trade.details2 ); //get debit back
            }
            endTrade( trade.id );
        }
    }
    else if ( trade.tradeStatus === 'O' && !isTradeValid( currentPlayer, trade ) ) {
        const isPlayer1 = trade.details1.id === currentPlayer.id;
        saveDecline( trade.id, isPlayer1 );
    }
}

function isTradeValid( player, trade ) {
    let isValid = true;
    const tradeDetails = trade.details1.id === player.id ? trade.details1 : trade.details2;

    if ( tradeDetails.warBucks > player.warBucks ) {
        isValid = false;
    }
    else if ( tradeDetails.resources.some( r => r.count > getResourceCount( r.id, player.resources ) ) ) {
        isValid = false;
    }
    else if ( tradeDetails.culturalTokens > player.initiatives.culturalTokens ) {
        isValid = false;
    }
    else if ( tradeDetails.politicalTokens > player.initiatives.politicalTokens ) {
        isValid = false;
    }
    else if ( tradeDetails.units.some( u => u.count > player.units.filter( cu => cu.unitTypeId === u.id ).length ) ) {
        isValid = false;
    }
    else if ( tradeDetails.technologies.some( a => !player.advancements.technologies.includes( a ) ) ) {
        isValid = false;
    }
    else if ( tradeDetails.doctrines.some( a => !player.advancements.doctrines.includes( a ) ) ) {
        isValid = false;
    }
    else if ( tradeDetails.gardens.some( a => !player.advancements.gardens.includes( a ) ) ) {
        isValid = false;
    }
    else if ( tradeDetails.auctions.some( a => !player.advancements.auctions.includes( a ) ) ) {
        isValid = false;
    }
    else if ( tradeDetails.chaos.length > player.cards.chaos.length ) {
        isValid = false;
    }

    return isValid;
}

function debitTrade( player, tradeDetails ) {
    player.warBucks -= tradeDetails.warBucks;
    tradeDetails.resources.forEach( r => {
        if ( r.count ) {
            player.resources.find( cr => cr.id === r.id ).count -= r.count;
        }
    } );
    player.initiatives.culturalTokens -= tradeDetails.culturalTokens;
    player.initiatives.politicalTokens -= tradeDetails.politicalTokens;
    tradeDetails.units.forEach( u => {
        for ( let i = 0; i < u.count; i ++ ) {
            removeUnit( getUnitsByExposure( player ), player, false );
        }
    } );
    tradeDetails.chaos.forEach( c => remove( player.cards.chaos, c ) );
}

function creditTrade( player, tradeDetails ) {
    player.warBucks += tradeDetails.warBucks;
    tradeDetails.resources.forEach( r => {
        if ( r.count ) {
            player.resources.find( cr => cr.id === r.id ).count += r.count;
        }
    } );
    player.initiatives.culturalTokens  += tradeDetails.culturalTokens;
    player.initiatives.politicalTokens += tradeDetails.politicalTokens;
    tradeDetails.units.forEach( u => {
        addUnitGroup( u.count, u.id, DEFAULT_TILE, player, false );
    } );
    player.advancements.technologies.concat( tradeDetails.technologies );
    player.advancements.doctrines.concat(    tradeDetails.doctrines );
    player.advancements.gardens.concat(      tradeDetails.gardens );
    player.advancements.auctions.concat(     tradeDetails.auctions );
    player.turn.purchasedAdvancementCount += tradeDetails.technologies.length + tradeDetails.doctrines.length + tradeDetails.gardens.length + tradeDetails.auctions.length;
    player.cards.chaos.concat( tradeDetails.chaos );
    player.turn.purchasedCardCount += tradeDetails.chaos.length

    reloadPage(true);
}

//trade: O (Offer)
//  player: W/O (waiting, offer)
//trade: P (pending)
//  player: A/D/Null (accepted, declined)
//trade: C (complete)
//  player: Null