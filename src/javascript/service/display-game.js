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
        if ( isPreExpansionPhase() ) {
            showPreExpansionActions();
        }
        else {
            showExpansionActions();
        }
    }
    else if ( isHarvestPhase() ) {
        showHarvestActions();
    }
    else if ( isCouncilPhase() ) {
        if ( isCouncilSubPhase() ) {
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

function showPreExpansionActions() {
    showMessage( "Pre-Expansion", "Use this time to trade and play Chaos Cards. When done, submit turn." );
}

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
    showPicks(
        "Council",
        "Claim any dimensions you meet the requirements for:",
        DIMENSIONS.map( d => {
            return {
                value:    `<strong>${d.name}</strong> &ndash; ${d.description}`,
                disabled: currentPlayer.dimensions.map( dim => dim.id ).includes( d.id ) || !validateDimension( d.id, currentPlayer ),
                checked:  currentPlayer.dimensions.map( dim => dim.id ).includes( d.id )
            };
        } ),
        true,
        true,
        function( indexes ) {
            indexes.forEach( i => { currentPlayer.dimensions.push( {id: DIMENSIONS[i].id, wonderTileId: null } ); } );
        }
    );
}

function showDoomsdayActions() {
    const event = EVENTS[game.state.event];
    if ( event.id === EVENTS[EVENT_ELECTION].id ) {
        performElection();
    }
    else if ( event.id === EVENTS[EVENT_GAMBIT].id ) {
        showPrompt(
            event.name,
            event.description,
            function( response ) {
                if ( Number.isInteger(response) ) {
                    if ( response <= currentPlayer.warBucks ) {
                        currentPlayer.warBucks -= response;
                        currentPlayer.special.gambitBet = response;
                    }
                    else {
                        showToaster("Cannot afford.");
                    }
                }
                currentPlayer.turn.hasConvened = true;
            }
        ); //todo 4 - Allow making it a number field ad hoc
    }
    else if ( event.id === EVENTS[EVENT_FESTIVAL].id ) {
        let tokenCount = ( currentPlayer.units.length > EVENT_FF_UNITS_1 ) ? EVENT_FF_AWARD_1 :
            ( ( currentPlayer.units.length > EVENT_FF_UNITS_2 ) ? EVENT_FF_AWARD_2 : EVENT_FF_AWARD_3 );
        tokenCount *= hasAuctionLot( PROFESSIONAL_ATHLETICS ) ? PROFESSIONAL_ATHLETICS_VALUE : 1;
        showBinaryChoice(
            event.name,
            `Based on your number of units, you have been awarded ${tokenCount} initiative token(s). Choose the type you would like:`,
            "Culture",
            "Politics",
            function( response ) {
                if ( Number.isInteger(response) ) {
                    if ( response === 1 ) {
                        currentPlayer.initiatives.politicalTokens += tokenCount;
                    }
                    else {
                        currentPlayer.initiatives.culturalTokens += tokenCount;
                    }
                    currentPlayer.turn.hasConvened = true;
                }
            }
        );
    }
    else if ( event.id === EVENTS[EVENT_DISASTER].id ) {
        performDisaster();
    }
    else if ( event.id === EVENTS[EVENT_MIDTERM].id ) {
        game.state.events.shortage = false;
        game.state.events.inflation = false;

        performElection();
    }
    else if ( event.id === EVENTS[EVENT_RESTOCK].id ) {
        showConfirm(
            event.name,
            event.description,
            function() {
                currentPlayer.cards.chaos = [];
                getChaosCardsAsync( game.players.indexOf( currentPlayer ), EVENT_RESTOCK_CARDS );

                currentPlayer.warBucks += currentPlayer.special.gambitBet * (hasAuctionLot( ATLANTIS_STOCK ) ? ATLANTIS_STOCK_VALUE : EVENT_GG_RETURN);
                currentPlayer.special.gambitBet = null;
            }
        );
    }
    else if ( event === EVENTS[EVENT_MARS].id ) {
        game.players.forEach( p => p.special.insurrection = false );
        //todo 7 - liquify
    }

    showToaster("Time is slipping...");
}

function performElection() {
    const office = getOfficeCard(game.state.events.office);
    pickPlayers(
        false,
        true,
        function( response ) {
            currentPlayer.special.votePlayerId = response || null;
            currentPlayer.turn.hasConvened = true;
        },
        game.players,
        `Elect a player as ${office.name}:`
    );
}

function performDisaster() {
    const disaster = getDisasterCard(game.state.events.disaster);
    if ( disaster.id === DISASTERS[PAYDAY].id ) {
        performPayDayDisaster();
    }
    else {
        showConfirm(
            EVENTS[EVENT_DISASTER].name,
            `<strong>${disaster.name}</strong> &ndash; ${disaster.description}`,
            function() {
                if ( disaster.id === DISASTERS[ERUPTION].id ) {
                    const volcanoAdjacentTileIds = game.board.filter( t => t.name === TILE_TYPES[VOLCANO].name ).reduce( (result, t) => result.concat( t.id ).concat( getAdjacentTiles( t.id ) ), [] );
                    game.players.forEach( p => p.units.forEach( u => {
                        if ( volcanoAdjacentTileIds.includes( u.tileId ) ) {
                            removeUnit( u, currentPlayer );
                        }
                    } ) );
                }
                else if ( disaster.id === DISASTERS[SCANDAL].id ) {
                    game.players.forEach( p => {
                        const districtCount = p.districts.tileIds.length;
                        const currentCTokenCount = p.initiatives.culturalTokens;
                        const currentPTokenCount = p.initiatives.politicalTokens;
                        const cTokenOverCount = Math.max( currentCTokenCount - currentPTokenCount, 0 );
                        const pTokenOverCount = Math.max( currentPTokenCount - currentCTokenCount, 0 );
                        const remainingCount = districtCount - (cTokenOverCount + pTokenOverCount);
                        const remainder = (remainingCount % 2 === 0) ? 0 : 1;
                        p.initiatives.culturalTokens  = Math.max( Math.trunc( (remainingCount / 2) + cTokenOverCount + remainder ), 0 );
                        p.initiatives.politicalTokens = Math.max( Math.trunc( (remainingCount / 2) + pTokenOverCount ), 0 );
                    } );
                }
                else if ( disaster.id === DISASTERS[THE_COST_OF_DISCIPLESHIP].id ) {
                    game.players.forEach( p => p.units.forEach( u => {
                        if ( u.unitTypeId === UNIT_TYPES[JUGGERNAUT].id || u.unitTypeId === UNIT_TYPES[ROBOT].id ) {
                            removeUnit( u, currentPlayer );
                        }
                    } ) );
                }
                else if ( disaster.id === DISASTERS[SHORTAGE].id ) {
                    game.state.events.shortage = true;
                }
                else if ( disaster.id === DISASTERS[INSURRECTION].id ) {
                    getLeadPlayers().map( id => getPlayer(id) ).forEach( p => p.special.insurrection = true );
                }
                else if ( disaster.id === DISASTERS[INFLATION].id ) {
                    game.state.events.inflation = true;
                }
                currentPlayer.turn.hasConvened = true;
            }
        );
    }
}

function performPayDayDisaster() {
    showPicks(
        DISASTERS[PAYDAY].name,
        DISASTERS[PAYDAY].description,
        currentPlayer.units.map( u => `${getUnitType(u.unitTypeId).name} (${u.tileId})` ), //todo X - instead of displaying tileId, sort units by tileId (which should be top-down, left-right)
        true,
        true,
        function( response ) {
            if ( response ) {
                const cost = response.length * EVENT_DISASTER_PAYDAY_COST;
                if ( cost <= currentPlayer.warBucks ) {
                    currentPlayer.warBucks -= cost;
                    for ( let i = 0; i < currentPlayer.units; i++ ) {
                        if ( !response.includes( i ) ) {
                            currentPlayer.units[i].disbanded = true;
                        }
                    }
                    currentPlayer.units.filter( u => u.disbanded ).forEach( u => removeUnit( u, currentPlayer ) );
                    currentPlayer.turn.hasConvened = true;
                }
                else {
                    performPayDayDisaster();
                    showToaster("Cannot afford");
                }
            }
        }
    );
}


/*** ABILITY ***/


function showAbilities() {
    let messageHTML = "Abilities cannot be used during the Council Phase.";
    if ( !isCouncilPhase() ) {
        messageHTML = `
                <div style="font-weight: bold">Advancements:</div>
                <div>${getAdvancementAbilities()}</div>
                <div style="font-weight: bold; margin-top: .5em">Chaos:</div>
                <div>${getChaosAbilities()}</div>
        `;
    }
    showMessage( "Abilities", messageHTML );
}

function getAdvancementAbilities() {
    let result = [];
    if ( isMarketAuctionPhase() ) {
        if ( hasDoctrine( DIVINE_RIGHT ) ) {
            result.push( { name: "Inquisition", ability: performInquisition } );
        }
    }
    return result.length ? result.map( i => `<span class="link" onclick="${i.ability}">${i.name}</span><br/>\n` ) : "None";
}

function getChaosAbilities() {
    let result = [];
    let resultHTML = "Currently Blocked (Shut Up)";
    if ( !currentPlayer.special.shutUp ) {
        if ( isMarketPhase() ) {
            if ( isMarketAuctionPhase() ) {
                //
            }
            //
        }
        else if ( isExpansionPhase() ) {
            //
        }

        if ( hasChaos( 0 ) ) {
            result.push( { name: CHAOS[0].name, ability: performAmnesia } );
        }
        if ( hasChaos( 1 ) ) {
            result.push( { name: CHAOS[1].name, ability: performAssimilation } );
        }
        if ( hasChaos( 29 ) ) {
            result.push( { name: CHAOS[29].name, ability: performEpiphany } );
        }
        if ( hasChaos( 78 ) ) {
            result.push( { name: CHAOS[78].name, ability: performScourge } );
        }
        if ( currentPlayer.cards.chaos.some( c => isShutUp( c ) ) ) {
            result.push( { name: CHAOS[SHUT_UP[0]].name, ability: performShutUp } );
        }
        resultHTML = result.length ? result.map( i => `<span class="link" onclick="${i.ability}">${i.name}</span><br/>\n` ) : "None";
    }
    return resultHTML;
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
