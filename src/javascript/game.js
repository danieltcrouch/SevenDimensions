//todo 6 - Click on Capital and have link to pop modal with player/faction info
//todo 7 - make battles
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
               "php/controller.php",
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
    game = jsonParse( response );
    game.map = parseMap( game.map );

    loadGameState();
    loadMap();
    loadUser();

    popModals();
}

function parseMap( map ) {
    return map.map( t => new Tile( t.id, t.tileTypeId, t.resourceIds ) );
}

function loadGameState() {
    id('roundValue').innerText = (game.state.round + 1) + "";
    id('phaseValue').innerText = getPhase(game.state.phase);
    id('turnValue').innerText = getTurn(game.state.turn);
    id('eventValue').innerText = getEvent(game.state.event);
}

function loadMap() {
    for ( let i = 0; i < game.map.length; i++ ) {
        const tile = game.map[i];
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
            "php/controller.php",
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


    displayUnassignedUnits();
    show( 'perform', isExpansionPhase() );
    disambiguateUnits( currentPlayer.units );
}

function popModals() {
    if ( isMarketAuctionPhase() && !Number.isInteger( currentPlayer.turn.auctionBid ) ) {
        showAuctionActions();
    }
    //todo 6 - show toaster if you won previous auction
    else if ( isHarvestPhase() && !currentPlayer.turn.hasReaped ) {
        showHarvestActions();
    }
    else if ( isDoomsdayClockPhase() && game.state.event <= EVENT_MARS ) {
        showToaster("Time is slipping...");
    }
}


/*** SUBMIT ***/


function submit() {
    let isValidToSubmit = true;
    if ( currentPlayer.turn.hasSubmitted ) {
        isValidToSubmit = false;
        showToaster( "Player has already submitted" );
    }
    else if ( isMarketPhase() ) {
        if ( isMarketAuctionPhase() ) {
            if ( Number.isNaN( currentPlayer.turn.auctionBid ) ) {
                isValidToSubmit = false;
                showToaster( "Must bid or pass for auction" );
            }
        }
        else {
            if ( !isCurrentPlayerTurn() ) {
                isValidToSubmit = false;
                showToaster( "It is not your turn." );
            }
            else if ( currentPlayer.units.some( u => u.tileId === DEFAULT_TILE ) ) {
                isValidToSubmit = false;
                showToaster( "Must assign purchased units" );
            }
        }
    }
    else if ( isExpansionPhase() ) {
        if ( !isCurrentPlayerTurn() ) {
            isValidToSubmit = false;
            showToaster( "It is not your turn." );
        }
    }
    else if ( isHarvestPhase() ) {
        if ( !currentPlayer.turn.hasReaped ) {
            isValidToSubmit = false;
            showToaster( "Must reap harvest" );
        }
    }
    else if ( isCouncilPhase() ) {
        if ( !isDoomsdayClockPhase() ) {
            //
        }
        else {
            //
        }
    }

    if ( isValidToSubmit ) {
        incrementTurn();
        updateGame();
    }
}

function incrementTurn() {
    currentPlayer.turn.hasSubmitted = true;

    game.state.turn++;
    if ( game.state.turn >= game.players.length ) {
        completeSubPhase();
        game.state.turn = 0;
        game.state.subPhase++;
        if ( (isMarketPhase() && game.state.subPhase > SUBPHASE_MARKET) || isExpansionPhase() || isHarvestPhase() || (isCouncilPhase() && game.state.subPhase > SUBPHASE_COUNCIL_DOOMSDAY) ) {
            game.state.subPhase = 0;
            game.state.phase++;
            if ( game.state.phase > PHASE_COUNCIL ) {
                game.state.phase = 0;
                game.state.round++;
                game.state.event++;
                if ( game.state.event >= EVENTS.length ) {
                    game.state.event = 0;
                }

                game.state.ambassador++;
                if ( game.state.ambassador >= game.players.length ) {
                   game.state.ambassador = 0;
                }
            }
        }
    }
}

function completeSubPhase() {
    if ( isMarketPhase() ) {
        if ( isMarketAuctionPhase() ) {
            const auctionLot = getNextAuction( game.players );
            if ( auctionLot ) {
                const highestBidderId = game.players.reduce( (prev, current) => {
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
        //
    }
    else if ( isHarvestPhase() ) {
        //
    }
    else if ( isCouncilPhase() ) {
        if ( !isDoomsdayClockPhase() ) {
            //
        }
        else {
            //Doomsday stuff?
            //check for winner
        }
    }

    game.players.forEach( p => p.turn.hasSubmitted = false );
}

function updateGame() {
    postCallEncoded(
        "php/controller.php",
        {
            action:    "updateGame",
            userId:    userId,
            gameId:    gameId,
            game:      JSON.stringify( game )
        },
        function( response ) {
            showToaster("Turn successfully saved.");
            reloadPage();
        },
        function( error ) {
            showToaster( "Unable to save game." );
        } );
}

function reloadPage( internal = false ) {
    if ( internal ) {
        loadGameCallback( JSON.stringify( game ) );
    }
    else {
        postCallEncoded(
           "php/controller.php",
           {
               action: "loadGame",
               id:     gameId
           },
           loadGameCallback
        );
    }
}


/*** VICTORY POINTS ***/


function calculateVP( player ) {
    let result = 0;
    result += player.districts.tileIds.length;
    result += player.dimensions.length;
    result += player.dimensions.filter( d => !!d.wonderTileId ).length * 2;
    result += hasHero( player.units ) ? 1 : 0;
    result += player.cards.offices.includes( "0" ) ? 1 : 0; //High Priest
    result -= player.selects.highPriestVictim ? 1 : 0;
    result += player.cards.chaos.filter( c => isHeavensGate( c ) ).length;
    result -= getInsurrectionVictim() === player.id ? 1 : 0;
    return result;
}

function getInsurrectionVictim() {
    let result = null;
    if ( game.state.events.disaster === INSURRECTION ) {
        game.state.events.disaster = null;
        result = game.players.reduce( (prev, current) => ( calculateVP(prev) > calculateVP(current) ) ? prev : current ).id;
        game.state.events.disaster = INSURRECTION;
    }
    return result;
}

function hasHero( units ) {
    return units.some( u => getUnitType( u.id ) === UNIT_TYPES[HERO] );
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
        return total + game.map.find( t => t.id === tileId ).getTileType().value;
    }, 0 );
    const religion = 0;
    return districts + religion;
}

function calculateResourceHarvestReward() {
    return currentPlayer.districts.tileIds.reduce( ( result, tileId ) => {
        const tileResourceIds = game.map.find( t => t.id === tileId ).resourceIds;
        if ( tileResourceIds.length ) {
            tileResourceIds.forEach( id => {
                const currentResource = result.find( cr => cr.id === id );
                if ( currentResource ) {
                    currentResource.count++;
                }
                else {
                    result.push( {id: id, count: 1} );
                }
            } );
        }
        return result;
    }, [] );
}


/*** GENERAL ***/


function getTileDetails( id ) {
    let result = null;
    let tile = game.map.find( t => t.id === id );
    if ( tile ) {
        let unitSets = [];
        game.players.forEach( p => {
            let units = p.units.filter( u => u.tileId === id );
            if ( units.length > 0 ) {
                unitSets.push( { id: p.id, combat: !units.every( u => u.id === UNIT_TYPES[APOSTLE].id ), units: units } );
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
            culturalInitiatives: culturalInitiatives,
            politicalInitiatives: politicalInitiatives,
            unitSets: unitSets
        };
    }
    return result;
}

function getPlayer( playerId ) {
    return game.players.find( p => p.id === playerId );
}

function getPhase( index ) {
    return PHASES[index].name;
}

function isMarketPhase() { return game.state.phase === PHASE_MARKET; }
function isMarketAuctionPhase() { return game.state.phase === PHASE_MARKET && game.state.subPhase === SUBPHASE_MARKET_AUCTION; }
function isMarketSubPhase() { return game.state.phase === PHASE_MARKET && game.state.subPhase === SUBPHASE_MARKET; }
function isExpansionPhase() { return game.state.phase === PHASE_EXPANSION; }
function isHarvestPhase() { return game.state.phase === PHASE_HARVEST; }
function isCouncilPhase() { return game.state.phase === PHASE_COUNCIL; }
function isCouncilSubPhase() { return game.state.phase === PHASE_COUNCIL && game.state.subPhase === SUBPHASE_COUNCIL; }
function isDoomsdayClockPhase() { return game.state.phase === PHASE_COUNCIL && game.state.subPhase === SUBPHASE_COUNCIL_DOOMSDAY; }

function getTurn( index ) {
    let result;
    if ( isMarketAuctionPhase() ) {
        result = "(Auction)";
    }
    else if ( isHarvestPhase() ) {
        result = "All";
    }
    else if ( isCouncilPhase() ) {
        result = "All";
    }
    else {
        result = game.players[index].username;
    }
    return result;
}

function getEvent( index ) {
    return Number.isInteger( index ) ? EVENTS[index].name : POST_EVENT;
}

function isCurrentPlayerTurn() {
    return isPlayerTurn( currentPlayer.id );
}

function isPlayerTurn( id ) {
    return game.players[game.state.turn].id === id;
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