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
        const minimum = auctionLot.getMinimumBid();
        showNumberPrompt(
            "Auction",
            `You currently have ${currentPlayer.warBucks}WB.<br/>
            Enter an amount to bid on ${auctionLot.name} (minimum: ${minimum}WB) or 0 to pass:`,
            function( response ) {
                const isCancel = response === undefined;
                if ( !(isCancel && hasBid) ) {
                    const benefactorAddition = currentPlayer.special.benefactor ? BENEFACTOR_VALUE : 0;
                    const value = parseInt( response ) + benefactorAddition;
                    if ( Number.isInteger( value ) && ( value >= minimum || value === 0 ) ) {
                        if ( value <= (currentPlayer.warBucks + benefactorAddition) ) {
                            currentPlayer.turn.auctionBid = value;
                            currentPlayer.special.benefactor = false;
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
             ${warBuckReward}WB<br/>
             ${resourceDisplay}`;
        showConfirm(
            "Harvest",
            message,
            function( response ) {
                if ( response ) {
                    currentPlayer.warBucks += warBuckReward * (currentPlayer.special.doubleDown?2:1);
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
        showNumberPrompt(
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
            },
        );
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
        if ( hasChaos( 35 ) ) {
            remove( currentPlayer.cards.chaos, CHAOS[35].id );
        }
        else {
            performDisaster();
        }
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
                if ( hasChaos( 6 ) ) {
                    remove( currentPlayer.cards.chaos, CHAOS[6].id );
                }
                else {
                    currentPlayer.cards.chaos = currentPlayer.cards.chaos.filter( c => isHeavensGate( c ) );
                }
                getChaosCardsAsync( game.players.indexOf( currentPlayer ), EVENT_RESTOCK_CARDS ); //Cannot use getRandomCard() since phase is Async

                currentPlayer.warBucks += currentPlayer.special.gambitBet * (hasAuctionLot( ATLANTIS_STOCK ) ? ATLANTIS_STOCK_VALUE : EVENT_GG_RETURN);
                currentPlayer.special.gambitBet = null;
            }
        );
    }
    else if ( event === EVENTS[EVENT_MARS].id ) {
        openLiquifyModal(
            {
                units: currentPlayer.units
            },
            null,
            false,
            function(total, assets) {
                currentPlayer.special.liquify.value = total;
                currentPlayer.special.liquify.units = assets.units;
            }
        );
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
                    removeUnits( currentPlayer.units.filter( u => volcanoAdjacentTileIds.includes( u.tileId ) ), currentPlayer );
                }
                else if ( disaster.id === DISASTERS[SCANDAL].id ) {
                    const districtCount = currentPlayer.districts.tileIds.length;
                    const currentCTokenCount = currentPlayer.initiatives.culturalTokens;
                    const currentPTokenCount = currentPlayer.initiatives.politicalTokens;
                    const cTokenOverCount = Math.max( currentCTokenCount - currentPTokenCount, 0 );
                    const pTokenOverCount = Math.max( currentPTokenCount - currentCTokenCount, 0 );
                    const remainingCount = districtCount - (cTokenOverCount + pTokenOverCount);
                    const remainder = (remainingCount % 2 === 0) ? 0 : 1;
                    currentPlayer.initiatives.culturalTokens  = Math.max( Math.trunc( (remainingCount / 2) + cTokenOverCount + remainder ), 0 );
                    currentPlayer.initiatives.politicalTokens = Math.max( Math.trunc( (remainingCount / 2) + pTokenOverCount ), 0 );
                }
                else if ( disaster.id === DISASTERS[THE_COST_OF_DISCIPLESHIP].id ) {
                    removeUnits( currentPlayer.units.filter( u => u.unitTypeId === UNIT_TYPES[JUGGERNAUT].id || u.unitTypeId === UNIT_TYPES[ROBOT].id ), currentPlayer );
                }
                else if ( disaster.id === DISASTERS[SHORTAGE].id ) {
                    game.state.events.shortage = true;
                }
                else if ( disaster.id === DISASTERS[INSURRECTION].id ) {
                    if ( getLeadPlayers().includes( currentPlayer.id ) ) {
                        currentPlayer.special.insurrection = true;
                    }
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
        currentPlayer.units.map( u => `${getUnitType(u.unitTypeId).name} (${u.tileId})` ), //todo 4 - instead of displaying tileId, sort units by tileId (which should be top-down, left-right)
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
                    removeUnits( currentPlayer.units.filter( u => u.disbanded ), currentPlayer );
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


function showAbilities() { //todo 3 - do these take into account Capital impassibility? what about, it being the player's turn? can exhausted units liquify?
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
        if ( hasDoctrine( DIVINE_RIGHT ) && !currentPlayer.turn.hasPerformedDivineRight ) {
            result.push( { name: "Inquisition", ability: performInquisitionAbility } );
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
                if ( hasChaos( 2 ) ) {
                    result.push( { name: CHAOS[2].name, ability: performBenefactor } );
                }
            }
            else {
                if ( hasChaos( 64 ) ) {
                    result.push( { name: CHAOS[64].name, ability: performNepotism } );
                }
                if ( hasChaos( 75 ) && currentPlayer.dimensions.some( d => !d.wonderTileId && !game.players.some( p => p.dimensions.some( pd => pd.id === d.id && pd.wonderTileId ) ) ) ) {
                    result.push( { name: CHAOS[75].name, ability: performSacred } );
                }
            }
        }
        else if ( isExpansionPhase() ) {
            if ( isPreExpansionPhase() ) {
                if ( hasChaos( 58 ) ) {
                    result.push( { name: CHAOS[58].name, ability: performMarchPreExpansion } );
                }
            }
            else {
                if ( hasChaos( 58 ) ) {
                    result.push( { name: CHAOS[58].name, ability: performMarch } );
                }
                if ( hasChaos( 91 ) ) {
                    result.push( { name: CHAOS[91].name, ability: performSquelch } );
                }
            }
            if ( hasChaos( 26 ) ) {
                result.push( { name: CHAOS[26].name, ability: performDoubleDown } );
            }
        }
        else if ( isHarvestPhase() ) {
            if ( hasChaos( 26 ) ) {
                result.push( { name: CHAOS[26].name, ability: performDoubleDownPostHarvest } );
            }
            if ( hasChaos( 69 ) ) {
                result.push( { name: CHAOS[69].name, ability: performPower } );
            }
        }

        if ( hasChaos( 0 ) ) {
            result.push( { name: CHAOS[0].name, ability: performAmnesia } );
        }
        if ( hasChaos( 1 ) ) {
            result.push( { name: CHAOS[1].name, ability: performAssimilation } );
        }
        if ( hasChaos( 3 ) ) {
            result.push( { name: CHAOS[3].name, ability: performBounty } );
        }
        if ( hasChaos( 4 ) ) {
            result.push( { name: CHAOS[4].name, ability: performBulldozer } );
        }
        if ( hasChaos( 7 ) ) {
            result.push( { name: CHAOS[7].name, ability: performCease } );
        }
        if ( hasChaos( 8 ) ) {
            result.push( { name: CHAOS[8].name, ability: performChaos } );
        }
        if ( hasChaos( 9 ) ) {
            result.push( { name: CHAOS[9].name, ability: performChurch } );
        }
        if ( hasChaos( 10 ) ) {
            result.push( { name: CHAOS[10].name, ability: performClone } );
        }
        if ( hasChaos( 11 ) ) {
            result.push( { name: CHAOS[11].name, ability: performCopy } );
        }
        if ( hasChaos( 12 ) ) {
            result.push( { name: CHAOS[12].name, ability: performCoup } );
        }
        if ( hasChaos( 14 ) ) {
            result.push( { name: CHAOS[14].name, ability: performDDay } );
        }
        if ( hasChaos( 15 ) ) {
            result.push( { name: CHAOS[15].name, ability: performDark } );
        }
        if ( hasChaos( 16 ) ) {
            result.push( { name: CHAOS[16].name, ability: performDefector } );
        }
        if ( hasChaos( 17 ) ) {
            result.push( { name: CHAOS[17].name, ability: performDeserter } );
        }
        if ( currentPlayer.cards.chaos.some( c => isDitto(c) ) ) {
            result.push( { name: CHAOS[DITTO[0]].name, ability: performDitto } );
        }
        if ( hasChaos( 24 ) ) {
            result.push( { name: CHAOS[24].name, ability: performDiversify } );
        }
        if ( hasChaos( 25 ) ) {
            result.push( { name: CHAOS[25].name, ability: performDoubleCross } );
        }
        if ( hasChaos( 28 ) ) {
            result.push( { name: CHAOS[28].name, ability: performEpiphany } );
        }
        if ( currentPlayer.cards.chaos.some( c => isEspionage(c) ) ) {
            result.push( { name: CHAOS[ESPIONAGE[0]].name, ability: performEspionage } );
        }
        if ( hasChaos( 32 ) ) {
            result.push( { name: CHAOS[32].name, ability: performExclusive } );
        }
        if ( hasChaos( 33 ) ) {
            result.push( { name: CHAOS[33].name, ability: performExhaust } );
        }
        if ( hasChaos( 34 ) ) {
            result.push( { name: CHAOS[34].name, ability: performFamine } );
        }
        if ( hasChaos( 37 ) ) {
            result.push( { name: CHAOS[37].name, ability: performFTerms } );
        }
        if ( hasChaos( 38 ) ) {
            result.push( { name: CHAOS[38].name, ability: performFrontLines } );
        }
        if ( hasChaos( 49 ) ) {
            result.push( { name: CHAOS[39].name, ability: performGamebreaker } );
        }
        if ( hasChaos( 41 ) ) {
            result.push( { name: CHAOS[41].name, ability: performGideon } );
        }
        if ( hasChaos( 42 ) ) {
            result.push( { name: CHAOS[42].name, ability: performGiveTired } );
        }
        if ( hasChaos( 43 ) ) {
            result.push( { name: CHAOS[43].name, ability: performGJail } );
        }
        if ( hasChaos( 44 ) && game.players.some( p => p.religion ) ) {
            result.push( { name: CHAOS[44].name, ability: performGAwakening } );
        }
        if ( hasChaos( 45 ) && !currentPlayer.units.some( u => u.unitTypeId === UNIT_TYPES[GODHAND].id ) ) {
            result.push( { name: CHAOS[45].name, ability: performHGod } );
        }
        if ( hasChaos( 54 ) ) {
            result.push( { name: CHAOS[54].name, ability: performIdentity } );
        }
        if ( hasChaos( 55 ) ) {
            result.push( { name: CHAOS[55].name, ability: performInspired } );
        }
        if ( hasChaos( 56 ) ) {
            result.push( { name: CHAOS[56].name, ability: performLaissez } );
        }
        if ( hasChaos( 57 ) ) {
            result.push( { name: CHAOS[57].name, ability: performManifest } );
        }
        if ( hasChaos( 59 ) ) {
            result.push( { name: CHAOS[59].name, ability: performMaster } );
        }
        if ( hasChaos( 60 ) ) {
            result.push( { name: CHAOS[59].name, ability: performMenOfSteel } );
        }
        if ( hasChaos( 61 ) ) {
            result.push( { name: CHAOS[61].name, ability: performMicro } );
        }
        if ( hasChaos( 62 ) ) {
            result.push( { name: CHAOS[62].name, ability: performMonopoly } );
        }
        if ( hasChaos( 65 ) ) {
            result.push( { name: CHAOS[65].name, ability: performParks } );
        }
        if ( hasChaos( 66 ) ) {
            result.push( { name: CHAOS[66].name, ability: performPenny } );
        }
        if ( hasChaos( 67 ) ) {
            result.push( { name: CHAOS[67].name, ability: performPersecution } );
        }
        if ( hasChaos( 68 ) && currentPlayer.districts.tileIds.length !== MAX_DISTRICTS ) {
            result.push( { name: CHAOS[68].name, ability: performPioneers } );
        }
        if ( hasChaos( 71 ) ) {
            result.push( { name: CHAOS[71].name, ability: performPublic } );
        }
        if ( hasChaos( 72 ) ) {
            result.push( { name: CHAOS[72].name, ability: performPuppeteer } );
        }
        if ( hasChaos( 73 ) ) {
            result.push( { name: CHAOS[73].name, ability: performInquisition } );
        }
        if ( hasChaos( 74 ) ) {
            result.push( { name: CHAOS[74].name, ability: performRInvestment } );
        }
        if ( hasChaos( 77 ) ) {
            result.push( { name: CHAOS[77].name, ability: performScourge } );
        }
        if ( hasChaos( 78 ) ) {
            result.push( { name: CHAOS[78].name, ability: performSeductress } );
        }
        if ( hasChaos( 79 ) ) {
            result.push( { name: CHAOS[79].name, ability: performShift } );
        }
        if ( currentPlayer.cards.chaos.some( c => isShutUp( c ) ) ) {
            result.push( { name: CHAOS[SHUT_UP[0]].name, ability: performShutUp } );
        }
        if ( hasChaos( 87 ) ) {
            result.push( { name: CHAOS[87].name, ability: performSilent } );
        }
        if ( hasChaos( 89 ) ) {
            result.push( { name: CHAOS[89].name, ability: performSpace } );
        }
        if ( hasChaos( 90 ) ) {
            result.push( { name: CHAOS[90].name, ability: performSpiritual } );
        }
        if ( hasChaos( 92 ) ) {
            result.push( { name: CHAOS[92].name, ability: performStrategic } );
        }
        if ( hasChaos( 93 ) ) {
            result.push( { name: CHAOS[93].name, ability: performStrongholds } );
        }
        if ( hasChaos( 94 ) ) {
            result.push( { name: CHAOS[94].name, ability: performTRefund } );
        }
        if ( hasChaos( 95 ) ) {
            result.push( { name: CHAOS[95].name, ability: performTClaw } );
        }
        if ( hasChaos( 96 ) ) {
            result.push( { name: CHAOS[96].name, ability: performTGTRobbery } );
        }
        if ( hasChaos( 97 ) ) {
            result.push( { name: CHAOS[97].name, ability: performTSwap } );
        }
        if ( hasChaos( 98 ) && currentPlayer.religion ) {
            result.push( { name: CHAOS[98].name, ability: performTithing } );
        }
        if ( hasChaos( 99 ) ) {
            result.push( { name: CHAOS[99].name, ability: performWay } );
        }
        resultHTML = result.length ? result.map( i => `<span class="link" onclick="${i.ability}">${i.name}</span><br/>\n` ) : "None";
    }
    return resultHTML;
}


/*** TRADE ***/


function showTrade() {
    let messageHTML = "Can only trade during certain phases before ending your turn.";
    if ( isAsyncPhase( false ) && !currentPlayer.turn.hasSubmitted ) {
        messageHTML = `
                <div style="font-weight: bold">Current Trades:</div>
                <div>${getCurrentTradesDisplay()}</div>
                <br/>
                <div class="link" onclick="startTrade()">Start Trade Deal</div>
        `;
    }
    showMessage( "Trade", messageHTML );
}

function getCurrentTradesDisplay() {
    let result;
    if ( currentTrades !== null ) {
        result = currentTrades.filter( t => t.tradeStatus === 'O' || t.tradeStatus === 'P' );
        return result.length ? result.map( t => {
            const currentId = t.details1.id === currentPlayer.id ? '1' : '2';
            const currentTurn = currentId === '1' ? (t.status1 === 'W' || !t.status1) : (t.status2 === 'W' || !t.status2); //Waiting in offer stage; Null in pending completion stage
            const enemyName = getPlayer( currentId === '1' ? t.details2.id : t.details1.id ).username;
            return `<span ${currentTurn ? "class=\"link\" onclick=\"continueTrade('" + t.id + "')\"" : ""}>${enemyName} ${!currentTurn ? "(Waiting...)" : ""}</span><br/>\n`;
        } ) : "None";
    }
    else {
        result = "Still loading...";
    }
    return result;
}

function refreshTrade() {
    if ( id('modal').style.display !== "none" && id('modal').querySelector( '#modalHeader' ).innerText === "Trade" ) {
        showTrade();
    }
}


/*** HELP ***/


function showHelp() {
    let html = "<a class='link' href='#' onclick='signOut();'>Sign out</a>";
    showMessage( "Help", html );
}
