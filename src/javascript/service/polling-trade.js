let currentTrades = null;

function startTrade() {
    closeModalJS( "modal" );
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
        game.players.filter( p => p.id !== currentPlayer.id ),
        "Select a player to trade with:"
    );
    //todo 7 - when I cancel, the background gray background doesn't disappear
    //todo 7 - when I submit player selection, modal does not disappear
}

function continueTrade( tradeId ) {
    closeModalJS( "modal" );
    const trade = currentTrades.find( t => t.id === tradeId );
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
    currentTrades = currentTrades || [];
    currentTrades.push( {
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
    const trade = currentTrades.find( t => t.id === tradeId );
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
        function() {
            showToaster( "Counter offer sent" );
        }
    );
}

function saveAccept( tradeId, details1, details2, isPlayer1 ) {
    const trade = currentTrades.find( t => t.id === tradeId );
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
            status1: trade.status1 || "",
            status2: trade.status2 || "",
            tradeStatus: trade.tradeStatus
        },
        function() {}
    );
}

function saveComplete( tradeId, isPlayer1, callback = function() {} ) {
    const trade = currentTrades.find( t => t.id === tradeId );
    trade.status1 = isPlayer1?'C':'A';
    trade.status2 = isPlayer1?'A':'C';
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
    const trade = currentTrades.find( t => t.id === tradeId );
    trade.status1 = isPlayer1?'D':null;
    trade.status2 = isPlayer1?null:'D';
    trade.tradeStatus = 'P';
    postCallEncoded(
        "php/trade-controller.php",
        {
            action: "saveStatus",
            tradeId: tradeId,
            status1: trade.status1 || "",
            status2: trade.status2 || "",
            tradeStatus: trade.tradeStatus
        },
        callback
    );
}

function endTrade( tradeId, callback = function() {} ) {
    const trade = currentTrades.find( t => t.id === tradeId );
    trade.details1 = {
        round: game.state.round,
        player1: trade.details1.id,
        player2: trade.details2.id,
        result1: trade.status1,
        result2: trade.status2
    };
    trade.details2 = null;
    trade.status1 = null;
    trade.status2 = null;
    trade.tradeStatus = null;
    game.trades.push( trade );
    postCallEncoded(
        "php/trade-controller.php",
        {
            action: "saveTrade",
            tradeId: tradeId,
            details1: trade.details1 || "",
            details2: trade.details2 || "",
            status1:  trade.status1 || "",
            status2:  trade.status2 || "",
            tradeStatus: trade.tradeStatus || ""
        },
        callback
    );
}

function declineActiveTrades() {
    currentTrades.forEach( t => {
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
    let hasOfferBeenResponded = false;
    let hasOfferBeenCountered = false;
    const firstView = currentTrades === null;
    const oldTrades = currentTrades;
    const tradeCount = !firstView ? oldTrades.length : 0;
    currentTrades = trades;

    currentTrades.forEach( t => {
        t.details1 = jsonParse( t.details1 );
        t.details2 = jsonParse( t.details2 );

        if ( !hasOfferBeenCountered && oldTrades ) {
            const oldTrade = oldTrades.find( ct => ct.id === t.id );
            if ( oldTrade ) {
                const isPlayer1 = t.details1.id === currentPlayer.id;
                const enemyStatusOld = isPlayer1 ? oldTrade.status2 : oldTrade.status1;
                const enemyStatusNew = isPlayer1 ? t.status2 : t.status1;
                hasOfferBeenCountered = ( enemyStatusNew === 'O' && enemyStatusOld === 'W' );
            }
        }

        hasOfferBeenResponded = performAutomaticTradeActions( t, firstView ) || hasOfferBeenResponded;
    } );

    if ( hasOfferBeenResponded ) {
        showToaster( "An offer has been accepted or declined." );
    }
    else if ( hasOfferBeenCountered || currentTrades.length > tradeCount ) {
        showToaster( "You have trade deals to view." );
    }

    refreshTrade();
}

function performAutomaticTradeActions( trade, firstView ) {
    let hasOfferBeenResponded = false;
    if ( trade.tradeStatus === 'P' ) {
        const isPlayer1 = trade.details1.id === currentPlayer.id;
        const currentStatus = isPlayer1 ? trade.status1 : trade.status2;
        const enemyStatus   = isPlayer1 ? trade.status2 : trade.status1;

        if ( firstView && currentStatus === 'A' ) {
            debitTrade( currentPlayer, isPlayer1?trade.details1:trade.details2 ); //they ended session and got back what should be debited from them
        }

        if ( currentStatus === null && enemyStatus ) { //other player has responded
            hasOfferBeenResponded = true;
            if ( enemyStatus === 'A' ) {
                if ( isTradeValid( currentPlayer, trade ) ) {
                    debitTrade(  currentPlayer, isPlayer1?trade.details1:trade.details2 );
                    creditTrade( currentPlayer, isPlayer1?trade.details2:trade.details1 );
                    saveComplete( trade.id, isPlayer1 );
                }
                else {
                    saveDecline( trade.id, isPlayer1 );
                }
            }
            else {
                endTrade( trade.id );
            }
        }
        else if ( currentStatus && enemyStatus && currentStatus !== 'C' ) { //both players have responded (and
            hasOfferBeenResponded = true;
            if ( enemyStatus === 'C' ) {
                creditTrade( currentPlayer, isPlayer1?trade.details2:trade.details1 );
            }
            else if ( currentStatus === 'A' ) {
                creditTrade( currentPlayer, isPlayer1?trade.details1:trade.details2 ); //get debit back
            }
            endTrade( trade.id );
        }
    }
    else if ( trade.tradeStatus === 'O' && !isTradeValid( currentPlayer, trade ) ) {
        const isPlayer1 = trade.details1.id === currentPlayer.id;
        saveDecline( trade.id, isPlayer1 );
    }
    return hasOfferBeenResponded;
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
    else if ( tradeDetails.advancements.technologies.some( a => !player.advancements.technologies.includes( a ) ) ) {
        isValid = false;
    }
    else if ( tradeDetails.advancements.doctrines.some( a => !player.advancements.doctrines.includes( a ) ) ) {
        isValid = false;
    }
    else if ( tradeDetails.advancements.gardens.some( a => !player.advancements.gardens.includes( a ) ) ) {
        isValid = false;
    }
    else if ( tradeDetails.advancements.auctions.some( a => !player.advancements.auctions.includes( a ) ) ) {
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
    player.advancements.technologies.push( ...tradeDetails.advancements.technologies );
    player.advancements.doctrines.push(    ...tradeDetails.advancements.doctrines );
    player.advancements.gardens.push(      ...tradeDetails.advancements.gardens );
    player.advancements.auctions.push(     ...tradeDetails.advancements.auctions );
    player.turn.purchasedAdvancementCount +=
        tradeDetails.advancements.technologies.length +
        tradeDetails.advancements.doctrines.length +
        tradeDetails.advancements.gardens.length +
        tradeDetails.advancements.auctions.length;
    player.cards.chaos.push( ...tradeDetails.chaos );
    player.turn.purchasedCardCount += tradeDetails.chaos.length

    reloadPage(true);
}

//trade: O (offer)
//  player: W/O (waiting, offer)
//trade: P (pending)
//  player: A/C/D/Null (accepted, completed (for the passive accept), declined)
//trade: Null (complete)
//  player: Null