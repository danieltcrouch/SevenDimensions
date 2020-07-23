//Differences in Online vs Board Game:
//  "Midnight" rather than continuing events
//  Festival of Fairies must choose one type
//  Scandal Disaster removes tokens evenly (no choice)
//  Chaos Cards are always played on your turn
//  Several Chaos Cards have been altered

//todo 1 - Trading
//[Push Changes and light test]
//todo 2 - Liquify Modal
//  Units (in tile?), money, initiative tokens, chaos cards, resources -- it uses whatever is passed in -> if (details.money) {}
//      Organize units by tile and tile description
//  parameters so it is useful for Mars (all units), Inquisitions (all the above), Annex (units in tile, civil resist, money)
//  Needs to return all things liquified, including an array of unit IDs, as well as the total value of all things liquified
//[Push Changes and light test]
//todo 3 - Chaos Abilities
//  need to display card descriptions somewhere
//  Only allow council-specific cards during harvest
//  Make sure abilities don't affect untouchable players and tiles
//  (add to rules: Prophetic Vision, can buy garden with only 1 district)
//  can only be played on your turn and for async turns chaos cards that only affect that player
//[Push Changes and light test]
//todo 4 - Various
//  Can't start battle while conflictId is present
//  Some stuff is set-up for "Midnight" while other stuff is not
//  Diplomatic Immunity from initiatives
//[Push Changes and light test]
//todo 5 - Faction & Office Abilities
//  Faction
//  Hero
//  Office
//[Push Changes and light test]
//todo 6 - Specific Cleaning
//  clean up test files; clean up player/state JSON to consolidate where flags are (make "global" object on each player and state?)
//  remove inline styling and add to CSS classes
//[Push Changes and light test]
//todo 7 - Modal Refactor
//  Make more modals/shadow-boxes for the game (for choosing advancements, initiative tokens)
//  Convert modals so that purchase button is at the bottom beside "Close"
//[Push Changes and light test]
//todo 8 - Lobby & Admin
//  admin page for after game has started; shows who hasn't submitted
//  settings per player to automatically use AI for defense?
//[Push Changes and light test]
//todo 9 - Grand Review
//  ...
//todo XXX - Begin testing with Brothers; Work; FWC
//todo X - refactor and clean up: Common, Seven, Reviews, Bracket, Overflow (Football and Turing can be ignored for now)

const COLORS = ["red", "green", "blue", "purple", "orange", "teal", "gold"];

let game;
let currentPlayer;

/*** LOAD ***/

function loadGame() {
    if ( gameId ) {
        if ( gameId === TEST_GAME_ID && newGame ) {
            readTestFile( loadGameCallback );
        }
        else {
            postCallEncoded(
               "php/main-controller.php",
               {
                   action: "loadGame",
                   id:     gameId
               },
               loadGameCallback
            );
        }
    }
}

function loadGameCallback( response ) {
    game = response;
    convertClasses( game );

    loadGameState();
    loadMap();
    loadUser();

    loadRecurringEffects();
    popModals();

    poll( getCurrentConflict );
    poll( getCurrentTrades );
}

function convertClasses( game ) {
    game.board = game.board.map( t => new Tile( t.id, t.tileTypeId, t.resourceIds ) );
    game.players.forEach( p => p.units = p.units.map( u => new Unit( u.id, u.unitTypeId, u.tileId ) ) );
}

function loadGameState() {
    id('roundValue').innerText = (game.state.round + 1) + "";
    id('phaseValue').innerText = getPhase(game.state.phase);
    id('turnValue').innerText = getTurn(game.state.turn);
    id('eventValue').innerText = getEvent(game.state.event);
    id('phase').innerText = getPhaseButtonText();
}

function loadMap() {
    for ( let i = 0; i < game.board.length; i++ ) {
        const tile = game.board[i];
        const tileDetails = getTileDetails( tile.id );
        fillTile( tile, tileDetails.districtPlayerId );
        addTileIcons( tile, tileDetails );
        id(tile.id).onmouseover = function() { tileHoverCallback( tile.id ); };
    }

    clearSelectedTile();
}

function loadUser() {
    if ( testPlayerId ) {
        loadUserCallback( testPlayerId );
    }
    else {
        postCallEncoded(
            "php/main-controller.php",
            {
                action: "getPlayer",
                gameId: gameId,
                userId: userId,
            },
            loadUserCallback,
            function() { showToaster( "User not found." ); }
        );
    }
}

function loadUserCallback( playerId ) {
    currentPlayer = getPlayer( playerId );

    id('playerName').innerText = currentPlayer.username;
    populatePlayerDisplay();

    displayUnassignedAssets();
    updateExpansionButtons();
}

function loadRecurringEffects() {
    if ( isExpansionSubPhase() && isFirstTurn() ) {
        game.players.forEach( p => {
            if ( hasGarden( HANGING_GARDEN, p ) ) {
                p.units.forEach( u => u.hitDeflectionsHG = 1 );
            }
            if ( hasTechnology( SUBTERRANEAN_RAILS, p ) ) {
                p.units.forEach( u => u.movesRemaining++ );
            }
            if ( hasTechnology( WARP_DRIVES, p ) ) {
                p.units.filter( u => u.unitTypeId === UNIT_TYPES[SPEEDSTER].id || u.unitTypeId === UNIT_TYPES[GODHAND].id ).forEach( u => u.movesRemaining++ );
            }
            if ( p.special.march ) {
                performMarch( p );
                p.special.march = false;
            }
        } );
    }
}

function popModals() {
    if ( isMarketAuctionPhase() && !Number.isInteger( currentPlayer.turn.auctionBid ) ) {
        showAuctionActions();
        if ( currentPlayer.advancements.auctionWins.includes( AUCTIONS[game.state.round].id ) ) {
            showToaster("You won this round's auction!");
        }
    }
    else if ( isHarvestPhase() && !currentPlayer.turn.hasReaped ) {
        showHarvestActions();
    }
    else if ( isDoomsdayClockPhase() && game.state.event <= EVENT_MARS && !currentPlayer.turn.hasSubmitted ) {
        showDoomsdayActions();
    }

    if ( game.trades.filter( t => (t.tradeStatus === 'O' || t.tradeStatus === 'P') && (t.details1.id === currentPlayer.id || t.details2.id === currentPlayer.id) ).length ) {
        showToaster("You have current trades.");
    }
}


/*** SUBMIT ***/


function submit() {
    let isValidToSubmit = true;

    const isAsyncTurn = isAsyncPhase();
    if ( !isAsyncTurn && !isPlayerTurn() ) {
        isValidToSubmit = false;
        showToaster( "It is not your turn." );
    }
    else if ( currentPlayer.turn.hasSubmitted ) {
        isValidToSubmit = false;
        showToaster( "Player has already submitted." );
    }
    else if ( game.trades.filter( t => t.details1.id === currentPlayer.id || t.details2.id === currentPlayer.id ).some( t => t.tradeStatus === 'O' || t.tradeStatus === 'P' ) ) {
        isValidToSubmit = false;
        showConfirm(
            "Warning",
            "You currently have outstanding trade deals. By ending your turn, all deals will be declined. Are you sure you would like to end your turn?",
            function(response) {
                if ( response ) {
                    declineActiveTrades();
                    game.trades.filter( t => t.details1.id === currentPlayer.id || t.details2.id === currentPlayer.id ).forEach( t => t.tradeStatus = 'C' );
                    submit();
                }
            }
        );
    }
    else if ( isMarketPhase() ) {
        if ( isMarketAuctionPhase() ) {
            if ( !Number.isInteger( currentPlayer.turn.auctionBid ) ) {
                isValidToSubmit = false;
                showToaster( "Must bid or pass for auction." );
            }
        }
        else {
            if ( currentPlayer.units.some( u => u.tileId === DEFAULT_TILE ) ) {
                isValidToSubmit = false;
                showToaster( "Must assign purchased units." );
            }
            else if ( currentPlayer.dimensions.some( d => d.wonderTileId === DEFAULT_TILE ) ) {
                isValidToSubmit = false;
                showToaster( "Must assign purchased Wonders." );
            }
            else if ( currentPlayer.special.free.technologiesOrDoctrines ) {
                isValidToSubmit = false;
                showToaster( "Must pick free advancements." );
            }
            else if ( currentPlayer.special.free.initiativeTokens ) {
                isValidToSubmit = false;
                showToaster( "Must pick free initiative tokens." );
            }
        }
    }
    else if ( isExpansionPhase() ) {
        //
    }
    else if ( isHarvestPhase() ) {
        if ( !currentPlayer.turn.hasReaped ) {
            isValidToSubmit = false;
            showToaster( "Must reap harvest." );
        }
    }
    else if ( isCouncilPhase() ) {
        if ( !isDoomsdayClockPhase() ) {
            //
        }
        else {
            if ( !currentPlayer.turn.hasConvened ) {
                isValidToSubmit = false;
                showToaster( "Must participate in Doomsday Event." );
            }
        }
    }

    if ( isValidToSubmit ) {
        submitTurn( isAsyncTurn );
    }
}

function submitTurn( isAsyncTurn ) {
    currentPlayer.turn.hasSubmitted = true;
    if ( isAsyncTurn ) {
        updatePlayer();
    }
    else {
        incrementTurn();
        updateGame();
    }
}

function updatePlayer() {
    postCallEncoded(
        "php/main-controller.php",
        {
            action:    "updatePlayer",
            userId:    userId,
            gameId:    gameId,
            player:    currentPlayer
        },
        updatePlayerCallback,
        function( error ) {
            showToaster( "Unable to save game." );
        }
    );
}

function updatePlayerCallback() {
    postCallEncoded(
        "php/main-controller.php",
        {
            action: "loadGame",
            id:     gameId
        },
        function( response ) {
            game = response;
            incrementTurn();
            updateGame();
        },
        function( error ) {
            showToaster( "Unable to save turn." );
        }
    );
}

function incrementTurn() {
    incrementTurnIndex();
    if ( game.players.every( p => p.turn.hasSubmitted ) ) {
        completeSubPhase();
        game.state.turn = game.state.ambassador;
        game.state.subPhase++;
        const MAX_SUB_PHASES = 2;
        if ( !isGameOver() && (isHarvestPhase() || game.state.subPhase >= MAX_SUB_PHASES) ) {
            game.state.subPhase = 0;
            game.state.phase++;
            if ( game.state.phase > PHASE_COUNCIL ) {
                game.state.phase = 0;
                game.state.round++;
                incrementEventIndex();
                incrementAmbassadorIndex();
            }
        }
    }
}

function completeSubPhase() {
    if ( isMarketPhase() ) {
        if ( isMarketAuctionPhase() ) {
            const auctionLot = getNextAuction( game.players );
            if ( auctionLot ) {
                const highestBidderId = game.players.filter( p => !p.special.silentAuction ).reduce( (prev, current) => {
                    return ( current.turn.auctionBid > prev.turn.auctionBid || (current.turn.auctionBid === prev.turn.auctionBid && getPlayerNumber(current.id) < getPlayerNumber(prev.id)) ) ? current : prev },
                    game.players[game.state.ambassador]
                ).id;
                const winner = getPlayer( highestBidderId );
                if ( !winner.advancements.auctions.includes( auctionLot.id ) ) {
                    winner.advancements.auctions.push( auctionLot.id );
                }
                winner.advancements.auctionWins.push( auctionLot.id );
                winner.warBucks -= winner.turn.auctionBid;
                game.players.forEach( p => {
                    p.turn.auctionBid = null;
                });
            }
        }
        else {
            //
        }
    }
    else if ( isExpansionPhase() ) {
        if ( isPreExpansionPhase() ) {
            //
        }
        else {
            game.players.forEach( p => {
                p.units.forEach( u => u.hitDeflections = 0 );
                p.initiatives.politicalActive = [];
                p.initiatives.culturalActive = [];

                if ( hasTechnology( GENETIC_RESURRECTION, p ) && p.special.disbandedUnits.length ) {
                    const unit = p.special.disbandedUnits.sort( (a,b) => parseInt(b.unitTypeId) - parseInt(a.unitTypeId) ).slice(0, 1);
                    const controlPlayerId = getTileDetails( unit.tileId ).controlPlayerId;
                    if ( controlPlayerId !== p.id ) {
                        unit.tileId = p.districts.capital;
                    }
                    p.units.push( unit );
                }
                p.special.disbandedUnits = [];
            } );

            game.board.tiles.forEach( t => {
                const tileDetails = getTileDetails( t.id );
                tileDetails.unitSets.forEach( us => {
                    const player = getPlayer( us.id );
                    const unitMax = MAX_UNITS_TILE + (player.special.micro?MICRONIZATION_VALUE:0);
                    if ( us.units.length > unitMax ) {
                        const disbands = getLowestDisbands( us.units, us.units.length - unitMax );
                        disbands.forEach( u => removeUnit( u, player, false ) );
                    }
                } );
            } );
        }
    }
    else if ( isHarvestPhase() ) {
        //
    }
    else if ( isCouncilPhase() ) {
        if ( isCouncilSubPhase() ) {
            let winners = getWinners();
            if ( winners.length && !game.state.special.powerStruggle ) {
                game.state.winners = winners;
                endGame();
            }
            else if ( game.state.event >= 0 ) {
                const event = EVENTS[game.state.event];
                if ( event.id === EVENTS[EVENT_ELECTION].id ) {
                    game.players.forEach( p => {p.cards.offices = []; p.special.highPriestReward = false; p.special.highPriestVictim = false;} );
                    game.state.events.office = (new Deck(OFFICES)).getRandomCards( 1 ).map( c => c.id )[0];
                }
                else if ( event.id === EVENTS[EVENT_DISASTER].id ) {
                    game.state.events.disaster = (new Deck(DISASTERS)).getRandomCards( 1 ).map( c => c.id )[0];
                }
                else if ( event.id === EVENTS[EVENT_MIDTERM].id ) {
                    game.state.events.office = Deck.getCurrentDeck( OFFICES, game.players.map( p => p.cards.offices ) ).getRandomCards( 1 ).map( c => c.id )[0];
                }
                else if ( event.id === EVENTS[EVENT_MARS].id ) {
                    const multiplier = roll( 6 );
                    game.state.events.marsStrength = multiplier * game.players.reduce( (total, p) => total + p.districts.tileIds.length, 0 );
                }
            }
        }
        else {
            if ( game.state.event >= 0 ) {
                const event = EVENTS[game.state.event];
                if ( event.id === EVENTS[EVENT_ELECTION].id ) {
                    const winner = getElectionWinner();
                    winner.cards.offices.push(game.state.events.office);
                    game.players.forEach( p => p.special.votePlayerId = null );
                    assignOracleOffices( winner.id );
                }
                else if ( event.id === EVENTS[EVENT_MIDTERM].id ) {
                    const winner = getElectionWinner();
                    winner.cards.offices.push(game.state.events.office);
                    game.players.forEach( p => p.special.votePlayerId = null );
                    assignOracleOffices( winner.id );
                }
                else if ( event.id === EVENTS[EVENT_MARS].id ) {
                    const combinedStrength = game.players.reduce( (result, p) => {return result + p.special.liquify.value}, 0 );
                    if ( combinedStrength >= game.state.events.marsStrength ) {
                        game.players.filter( p => p.special.liquify.value ).forEach( p => p.warBucks += EVENT_MARS_REWARD );
                        const winners = game.players.reduce( (w, p) => {
                            let currentValue = w[0].special.liquify.value;
                            return currentValue > p.special.liquify.value ? w : ( currentValue < p.special.liquify.value ? [p] : w.concat(p) )
                        }, [] );
                        winners.forEach( p => p.warBucks += (EVENT_MARS_GRAND_REWARD / winners.length) );
                    }
                    else {
                        game.players.forEach( p => p.warBucks = Math.max( (p.warBucks - EVENT_MARS_COST), 0 ) );
                        //todo 2 - liquify units - helper function
                    }
                    game.players.forEach( p => p.special.liquify = null );
                }

                game.state.events.office = null;
                game.state.events.disaster = null;
                game.state.events.marsStrength = null;
            }

            //Round End
            game.players.forEach( p => {
                p.special.bulldozer = false;
                p.special.cease = false;
                p.special.dark = false;
                p.special.exhaust = null;
                p.special.scourge = false;
                p.special.shutUp = false;
                p.special.shutUpProtect = false;
                p.special.silentAuction = false;
                p.special.wayOfTheSamurai = null;

                if ( p.special.copy ) {
                    p.factionId = p.special.copy;
                    p.special.copy = null;
                }
                if ( p.special.friendlyTerms ) {
                    game.players.filter( pl => pl.id !== p.id && !game.battles.some( b => b.round === game.state.round && [b.attackPlayerId, b.defendPlayerId].includes( p.id ) && [b.attackPlayerId, b.defendPlayerId].includes( pl.id ) ) ).forEach( pl => {
                        const warBucks = Math.min( FRIENDLY_TERMS_VALUE, pl.warBucks );
                        pl.warBucks -= warBucks;
                        p.warBucks += warBucks;
                    } );
                    p.special.friendlyTerms = false;
                }
                if ( p.special.identity ) {
                    p.factionId = p.special.identity;
                    p.special.identity = null;
                }
            } );
            game.state.special.dDay = null;
            game.state.special.exclusiveCardClub = null;
            game.state.special.powerStruggle = false;
        }
    }

    if ( !isGameOver() ) {
        game.players.forEach( p => p.turn.hasSubmitted = false );
    }
}

function getElectionWinner() {
    let votePlayerIds = game.players.map( p => p.special.votePlayerId );
    let maxVoteCount = 0;
    let playerVoteCounts = votePlayerIds.reduce( (result, p) => {
        let voteCount = result.find( r => r.playerId === p );
        if ( voteCount ) {
            voteCount.count++;
        }
        else {
            voteCount = {playerId: p, count: 1};
            result.push( voteCount );
        }
        maxVoteCount = ( voteCount.count > maxVoteCount ) ? voteCount.count : maxVoteCount;
        return result;
    }, [] );

    let ambassador = game.players[game.state.ambassador];
    let ambassadorVote = ambassador.special.votePlayerId;
    let maxVotePlayerIds = playerVoteCounts.filter( c => c.count === maxVoteCount ).map( p => p.playerId );
    let winner = ( maxVotePlayerIds.length === 1 ) ? maxVotePlayerIds[0] : ( maxVotePlayerIds.includes( ambassadorVote ) ? ambassadorVote : ambassador.id );
    return getPlayer(winner)
}

function assignOracleOffices( winningPlayerId ) {
    let currentOffices = Deck.getCurrentDeck( OFFICES, game.players.map( pl => pl.cards.offices ) );
    currentOffices.shuffle();
    game.players.forEach( p => {
        if ( p.id !== winningPlayerId && hasDoctrine( DIVINE_ORACLES, p ) ) {
            //todo 4 - make a helper method that returns players in order (and then TODO to use it elsewhere)
            const unusedOffice = currentOffices.getTopCard();
            if ( unusedOffice ) {
                p.cards.offices.push( unusedOffice );
            }
        }
    } );
}

function updateGame() {
    postCallEncoded(
        "php/main-controller.php",
        {
            action:    "updateGame",
            userId:    userId,
            gameId:    gameId,
            game:      game
        },
        function() {
            showToaster("Turn successfully saved.");
            reloadPage();
        },
        function() {
            showToaster( "Unable to save game." );
        }
    );
}

function reloadPage( internal = false ) {
    if ( internal ) {
        loadGameCallback( game );
    }
    else {
        postCallEncoded(
           "php/main-controller.php",
           {
               action: "loadGame",
               id:     gameId
           },
           loadGameCallback
        );
    }
}

function endGame() {
    postCallEncoded(
       "php/main-controller.php",
       {
           action: "endGame",
           id:     gameId,
           state:  game.state
       },
       loadGameCallback
    );
}


/*** VICTORY POINTS ***/


function calculateVP( player ) {
    let result = 0;
    result += player.districts.tileIds.length;
    result += player.dimensions.length;
    result += player.dimensions.filter( d => Boolean( d.wonderTileId ) ).length * 2;
    result += hasHero( player.units ) ? 1 : 0;
    result += player.cards.chaos.filter( c => isHeavensGate( c ) ).length;
    result += player.special.highPriestReward ? 1 : 0;
    result -= player.special.highPriestVictim ? 1 : 0;
    result -= player.special.insurrection ? 1 : 0;
    return result;
}

function hasHero( units ) {
    return units.some( u => u.unitTypeId === UNIT_TYPES[HERO].id );
}

function getLeadPlayers( mustBeOverWinCondition = false ) {
    let playerIds = [];
    let maxScore = 0;
    for ( let i = 0; i < game.players.length; i++ ) {
        let player = game.players[i];
        let score = calculateVP( player );
        if ( score >= maxScore && (!mustBeOverWinCondition || score >= MAX_VP) ) {
            if ( score > maxScore ) {
                playerIds = [];
            }
            maxScore = score;
            playerIds.push( player.id );
        }
    }
    if ( playerIds.length > 1 ) {
        const maxDimensions = Math.max( ...playerIds.map( p => getPlayer( p ).dimensions.length ) );
        playerIds = playerIds.filter( p => getPlayer( p ).dimensions.length === maxDimensions );
        if ( playerIds.length > 1 ) {
            const maxWonders = Math.max( ...playerIds.map( p => getPlayer( p ).dimensions.filter( d => d.wonderTileId ).length ) );
            playerIds = playerIds.filter( p => getPlayer( p ).dimensions.filter( d => d.wonderTileId ).length === maxWonders );
        }
    }
    return playerIds;
}

function getWinners() {
    return getLeadPlayers( true );
}


/*** AUCTIONS ***/


function getNextAuction( players ) {
    let auctionIndex = null;
    for ( let i = 0; i < AUCTIONS.length; i++ ) {
        if ( !players.some( p => p.advancements.auctionWins.includes( AUCTIONS[i].id ) ) ) {
            auctionIndex = i;
            break;
        }
    }
    return Number.isInteger( auctionIndex ) ? AUCTIONS[auctionIndex] : null;
}


/*** HARVEST ***/


function calculateWarBuckHarvestReward() {
    const districts = currentPlayer.districts.tileIds.reduce( ( total, tileId ) => {
        total += game.board.find( t => t.id === tileId ).getTileType().value;
        total += hasGarden( FLOWER_GARDEN ) ? 1 : 0;
        return total;
    }, 0 );
    const internalReligion = game.players.map( p => p.religion.tileIds ).reduce( ( total, r ) => ( total + r.filter( t => currentPlayer.districts.tileIds.includes( t ) ).length ), 0 );
    const externalReligion = currentPlayer.religion ? currentPlayer.religion.tileIds.filter( t => !currentPlayer.districts.tileIds.includes( t ) ).length : 0;
    const coastalProperty = hasAuctionLot( COASTAL_PROPERTY ) ? currentPlayer.districts.tileIds.filter( t => t !== currentPlayer.districts.capital ).reduce( ( max, tileId ) => Math.max( max, game.board.find( t => t.id === tileId ).getTileType().value ), 0 ) : 0;
    const multiLevel = hasAuctionLot( MULTI_LEVEL_MARKET ) ? (Math.min(MULTI_LEVEL_MARKET_VALUE, getAdjacentPlayer().warBucks) + Math.min(MULTI_LEVEL_MARKET_VALUE, getAdjacentPlayer( currentPlayer, false ).warBucks)) : 0;
    return districts + internalReligion + externalReligion + coastalProperty + multiLevel;
}

function calculateResourceHarvestReward() {
    return currentPlayer.districts.tileIds.reduce( ( result, tileId ) => {
        const tileResourceIds = game.board.find( t => t.id === tileId ).resourceIds;
        if ( tileResourceIds.length && !game.state.events.shortage ) {
            tileResourceIds.forEach( id => {
                const currentResource = result.find( cr => cr.id === id );
                const resourceCount = hasGarden( VEGETABLE_GARDEN ) ? VEGETABLE_GARDEN_VALUE : 1;
                if ( currentResource ) {
                    currentResource.count += resourceCount;
                }
                else {
                    result.push( {id: id, count: resourceCount} );
                }
            } );
        }
        return result;
    }, [] );
}


/*** GENERAL ***/


function getTileDetails( id ) {
    let result = null;
    let tile = game.board.find( t => t.id === id );
    if ( tile ) {
        let unitSets = [];
        game.players.forEach( p => {
            let units = p.units.filter( u => u.tileId === id );
            if ( units.length > 0 ) {
                unitSets.push( { id: p.id, combat: !units.every( u => u.unitTypeId === UNIT_TYPES[APOSTLE].id ), units: units } );
            }
        } );

        const type = TileType.getDisplayName( tile.getTileType() );
        const population = tile.getTileType().value;
        const resourceIds = tile.resourceIds;
        const districtPlayer = game.players.find( p => p.districts.tileIds.includes( id ) );
        const districtPlayerId = districtPlayer ? districtPlayer.id : null;
        const controlPlayerId = districtPlayerId || unitSets.reduce( (id, set) => set.combat ? set.id : ( id || set.id ), null ); //district > combat > any unit > null
        const wonderIds = districtPlayer ? districtPlayer.dimensions.filter( d => d.wonderTileId && d.wonderTileId === id ).map( d => WONDERS[getDimension(d.id).wonderIndex].id ) : null;
        const wonderId = wonderIds ? wonderIds[0] : null;
        const religionIds = game.players.map( p => p.religion ).filter( r => r && r.tileIds.includes( id ) ).map( r => r.id );
        const culturalInitiatives = game.players.map( p => p.initiatives.culturalActive ).flat().filter( i => i.tileId === id ).reduce( (total, i) => total + i.reaperCount, 0 );
        const politicalInitiatives = game.players.map( p => p.initiatives.politicalActive ).flat().filter( i => i.from === id ).map( i => ({ from: i.from, to: i.to }) );

        result = {
            id: id,
            type: type,
            population: population,
            resourceIds: resourceIds,
            districtPlayerId: districtPlayerId,
            controlPlayerId: controlPlayerId,
            wonderId: wonderId,
            religionIds: religionIds,
            culturalInitiatives: culturalInitiatives, //reaperCount
            politicalInitiatives: politicalInitiatives,
            unitSets: unitSets
        };
    }
    return result;
}

function getEnemyPlayer( tileId, includeApostles = false ) {
    let result = null;
    const enemyPlayer = game.players.find( p => p.units.some( u => u.tileId === tileId && (includeApostles || u.unitTypeId !== UNIT_TYPES[APOSTLE].id) ) );
    if ( enemyPlayer ) {
        result = {
            id: enemyPlayer.id,
            units: enemyPlayer.units.filter( u => u.tileId === tileId && (includeApostles || u.unitTypeId !== UNIT_TYPES[APOSTLE].id) )
        };
    }
    return result;
}

function pickPlayers( allowMultiple, allowSelectAllOrNone, callback, players = game.players, message = "" ) {
    message = message || (allowMultiple ? "Choose players to target:" : "Choose a player to target:");
    showPicks(
        "Enemy Players",
        message,
        players.map( p => p.username ),
        allowMultiple,
        allowSelectAllOrNone,
        function( index ) {
            let playerIds = index;
            if ( Number.isInteger( index ) || Array.isArray( index ) ) {
                if ( allowMultiple ) {
                    playerIds = index.map( i => players[i].id );
                }
                else {
                    playerIds = players[index].id;
                }
            }
            callback( playerIds );
        },
    );
}

function getPlayer( playerId ) {
    return game.players.find( p => p.id === playerId );
}

function isGameOver() {
    return game.state.winners && game.state.winners.length;
}

function getPhaseButtonText() {
    let result = "Phase";
    if ( isMarketAuctionPhase() ) {
        result = "Auction";
    }
    else if ( isMarketSubPhase() ) {
        result = "Market";
    }
    else if ( isExpansionPhase() ) {
        result = "Expansion";
    }
    else if ( isHarvestPhase() ) {
        result = "Harvest";
    }
    else if ( isCouncilSubPhase() ) {
        result = "Council";
    }
    else if ( isDoomsdayClockPhase() ) {
        result = "Doomsday";
    }
    return result;
}

function getPhase( index ) {
    return PHASES[index].name;
}

function isMarketPhase() { return game.state.phase === PHASE_MARKET; }
function isMarketAuctionPhase() { return game.state.phase === PHASE_MARKET && game.state.subPhase === SUBPHASE_MARKET_AUCTION; }
function isMarketSubPhase() { return game.state.phase === PHASE_MARKET && game.state.subPhase === SUBPHASE_MARKET; }
function isExpansionPhase() { return game.state.phase === PHASE_EXPANSION; }
function isPreExpansionPhase() { return game.state.phase === PHASE_EXPANSION && game.state.subPhase === SUBPHASE_PRE_EXPANSION; }
function isExpansionSubPhase() { return game.state.phase === PHASE_EXPANSION && game.state.subPhase === SUBPHASE_EXPANSION; }
function isHarvestPhase() { return game.state.phase === PHASE_HARVEST; }
function isCouncilPhase() { return game.state.phase === PHASE_COUNCIL; }
function isCouncilSubPhase() { return game.state.phase === PHASE_COUNCIL && game.state.subPhase === SUBPHASE_COUNCIL; }
function isDoomsdayClockPhase() { return game.state.phase === PHASE_COUNCIL && game.state.subPhase === SUBPHASE_COUNCIL_DOOMSDAY; }

function isAsyncPhase( includeCouncil = true ) {
    return isMarketAuctionPhase() || isPreExpansionPhase() || isHarvestPhase() || (includeCouncil && isCouncilPhase());
}

function getTurn( index ) {
    let result;
    if ( isMarketAuctionPhase() ) {
        result = "All (Auction)";
    }
    else if ( isPreExpansionPhase() ) {
        result = "All";
    }
    else if ( isHarvestPhase() ) {
        result = "All";
    }
    else if ( isCouncilSubPhase() ) {
        result = "All";
    }
    else if ( isDoomsdayClockPhase() ) {
        result = "All (Doomsday)";
    }
    else {
        result = game.players[index].username;
    }
    return result;
}

function getEvent( index ) {
    return Number.isInteger( index ) ? EVENTS[index].name : POST_EVENT;
}

function isPlayerTurn( id = currentPlayer.id ) {
    return game.players[game.state.turn].id === id;
}

function isFirstTurn() {
    return game.state.turn === game.state.ambassador;
}

function incrementTurnIndex() {
    game.state.turn = incrementIndex( game.state.turn, game.players.length );
    if ( game.players[game.state.turn].special.jail && isExpansionSubPhase() ) {
        game.state.turn = incrementIndex( game.state.turn, game.players.length );
        game.players[game.state.turn].special.jail = false;
    }
}

function incrementAmbassadorIndex() {
    game.state.ambassador = incrementIndex( game.state.ambassador, game.players.length );
}

function incrementEventIndex() {
    game.state.event = incrementIndex( game.state.event, EVENTS.length );
}

function incrementIndex( index, max ) {
    index++;
    if ( index === max ) {
        index = 0;
    }
    return index;
}

function hasTechnology( index, player = currentPlayer ) {
    return hasAdvancement( index, player.advancements.technologies, TECHNOLOGIES );
}

function hasDoctrine( index, player = currentPlayer ) {
    return hasAdvancement( index, player.advancements.doctrines, DOCTRINES );
}

function hasGarden( index, player = currentPlayer ) {
    return hasAdvancement( index, player.advancements.gardens, GARDENS );
}

function hasAuctionLot( index, player = currentPlayer ) {
    return hasAdvancement( index, player.advancements.auctions, AUCTIONS );
}

function hasAdvancement( index, playerAdvancements, advancementSet ) {
    return playerAdvancements.includes( advancementSet[index].id );
}

function hasChaos( index, player = currentPlayer ) {
    return hasCard( index, player.cards.chaos, CHAOS );
}

function hasOffice( index, player = currentPlayer ) {
    return hasCard( index, player.cards.offices, OFFICES );
}

function hasCard( index, playerCards, cardSet ) {
    return playerCards.includes( cardSet[index].id );
}

function getAdjacentPlayer( player = currentPlayer, next = true ) {
    let playerIndex = game.players.findIndex( p => p.id === player.id );
    playerIndex += next ? 1 : -1;
    if ( playerIndex >= game.players.length ) {
        playerIndex = 0;
    }
    else if ( playerIndex < 0 ) {
        playerIndex = game.players.length - 1;
    }
    return game.players[playerIndex];
}

function getPlayerNumber( id ) {
    let result = game.players.findIndex( p => p.id === id ) - game.state.ambassador;
    if ( result < 0 ) {
        result = game.players.length + result;
    }
    return result;
}

function getColorFromPlayerId( playerId ) {
    const index = game.players.findIndex( p => p.id === playerId );
    return (Number.isInteger(index) && index < COLORS.length) ? COLORS[index] : null;
}