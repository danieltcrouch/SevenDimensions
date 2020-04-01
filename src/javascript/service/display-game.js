/*** SUBMIT ***/


//Submit Code in game.js


/*** ACTIONS ***/


function showActions() {
    if ( isMarketPhase() ) {
        if ( isMarketAuctionPhase() ) {
            showAuctionActions();
        }
        else {
            showMarketActions();
        }
    }
    else if ( isExpansionPhase() ) {
        showExpansionActions();
    }
    else if ( isHarvestPhase() ) {
        showHarvestActions();
    }
    else if ( isCouncilPhase() ) {
        if ( !isDoomsdayClockPhase() ) {
            showCouncilActions();
        }
        else {
            showDoomsdayActions();
        }
    }
}

/* MARKET */

function showAuctionActions() {
    const hasBid = Number.isInteger( currentPlayer.turn.auctionBid );
    const auctionLot = getNextAuction( game.players );
    if ( auctionLot && !currentPlayer.advancements.auctions.includes( auctionLot.id ) ) {
        const minimum = Math.floor( auctionLot.costFunction() / 2 );
        showPrompt( "Auction",
            "Enter an amount to bid on " + auctionLot.name + " (minimum: " + minimum + "WB):",
            function( response ) {
                const isCancel = response === undefined;
                if ( !(isCancel && hasBid) ) {
                    const value = parseInt( response );
                    if ( Number.isInteger( value ) && ( value >= minimum || value === 0 ) ) {
                        if ( value <= currentPlayer.warBucks ) {
                            currentPlayer.turn.auctionBid = value;
                        }
                        else {
                            showToaster( "Bid too high." );
                        }
                    }
                    else {
                        showToaster( "Invalid Bid." );
                    }
                }
            },
            hasBid ? currentPlayer.turn.auctionBid : ""
        );
    }
}

function showMarketActions() {
    openMarketModal(
        currentPlayer,
        function( response ) {
            currentPlayer = response;
            reloadPage( true );
        }
    );
}

/* EXPANSION */

function showExpansionActions() {
    showMessage( "Expansion", "Click on a tile, then click on the units you would like to move." );
}

/* HARVEST */

function showHarvestActions() {
    if ( !currentPlayer.turn.hasReaped ) {
        const warBuckReward = calculateWarBuckHarvestReward();
        const resourceReward = calculateResourceHarvestReward();
        const resourceDisplay = resourceReward.map( r => r.count + " " + getResource(r.id).name + (r.count > 1 ? "s" : "") ).join(", ");
        const message =
            `This harvest, you are rewarded:<br/>
             ${warBuckReward}WB from districts<br/>
             ${resourceDisplay}`;
        showConfirm(
            "Harvest",
            message,
            function( response ) {
                if ( response ) {
                    currentPlayer.warBucks += warBuckReward;
                    id('warBucksValue').innerText = currentPlayer.warBucks;
                    resourceReward.forEach( r => {
                        const currentResource = currentPlayer.resources.find( cr => cr.id === r.id );
                        if ( currentResource ) {
                            currentResource.count += r.count;
                        }
                        else {
                            currentPlayer.resources.push( {id: r.id, count: r.count} );
                        }
                    } );
                    currentPlayer.turn.hasReaped = true;
                }
        } );
    }
    else {
        showMessage( "Harvest", "You have already reaped your harvest this phase." );
    }
}

/* COUNCIL */

function showCouncilActions() {
    openCouncilModal(
        currentPlayer,
        function( response ) {
            currentPlayer = response;
        }
    );
}

function showDoomsdayActions() {
    game.state.events.office = OFFICES[Math.floor(Math.random() * OFFICES.length)].id;
    openEventModal(
        currentPlayer,
        game.state.event,
        game.state.events,
        function( response ) {
            //
        }
    );
}


/*** TRADE ***/


function showTrade() {
    showMessage( "Trade", "TODO" );
}


/*** HELP ***/


function showHelp() {
    let html = "<a class='link' href='#' onclick='signOut();'>Sign out</a>";
    showMessage( "Help", html );
}
