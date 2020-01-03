const PHASES = [ "Market", "Expansion", "Harvest", "Council" ];
const EVENTS = [ "Continental Elections", "Gambler’s Gambit", "Festival of Fairies", "Global Disasters", "Midterm Elections", "Annual Restock", "Mars Attack!" ];
const NO_TILE_DETAILS = "No Tile Selected";

let game;
let selectedTile;
let currentPlayer;

/****** LOAD ******/

function loadGame() {
    if ( gameId ) {
        //$.post(
        //    "php/controller.php",
        //    {
        //        action: "loadGame",
        //        id:     gameId
        //    },
        //    loadGameCallback
        //);
        loadGameCallback( JSON.stringify( getLoadedGame() ) );
    }
}

function loadGameCallback( response ) {
    game = jsonParse( response );
    loadGameState();
    loadMap();
    loadUser();

    initializeHandlers();

    popModals();
}

function loadGameState() {
    id('roundValue').innerText = (game.state.round + 1) + "";
    id('phaseValue').innerText = getPhase(game.state.phase);
    id('turnValue').innerText = getTurn( game.state.phase, game.state.turn );
    id('eventValue').innerText = getEvent(game.state.event);
}

function loadMap() {
    for ( let i = 0; i < game.map.length; i++ ) {
        const tile = game.map[i];

        id(tile.id + "-text").innerHTML = tile.tileType.value + "";

        if ( tile.tileType.id === TILE_TYPES[ATLANTIS].id ) {
            hideById(tile.id + "-text");
            id(tile.id + "-background").setAttributeNS(null, "fill", "url(#atlantis)");
            //id(tile.id + "-polygon-s").setAttributeNS(null, "fill", "transparent");
        }
        else if ( tile.tileType.id === TILE_TYPES[CAPITAL].id ) {
            hideById(tile.id + "-text");
            id(tile.id + "-background").setAttributeNS(null, "fill", "url(#heroTile0)");
            //id(tile.id + "-polygon-s").setAttributeNS(null, "fill", "transparent");
        }
        else if ( tile.tileType.id === TILE_TYPES[VOLCANO].id ) {
            hideById(tile.id + "-text");
            id(tile.id + "-background").setAttributeNS(null, "fill", "url(#volcano)");
            //id(tile.id + "-polygon-s").setAttributeNS(null, "fill", "transparent");
        }

        const tileDetails = getTileDetails( tile.id );
        if ( tileDetails.unitSets.length > 0 ) {
            id(tile.id + "-unit").style.display = "";
        }
    }

    id('tileDetailsDiv').innerText = NO_TILE_DETAILS;

    for ( let i = 0; i < game.players.length; i++ ) {
        let player = game.players[i];
        const color = getColorFromIndex( i );
        player.districts.tiles.forEach( function( tileId ) {
            id( tileId + "-background" ).classList.add( color + (isImageTile( tileId ) ? "Image" : "") );
        } );
    }
}

function loadUser() {
    currentPlayer = getPlayer( userId );
    id('playerName').innerText = currentPlayer.username;
    id('factionName').innerText = getFaction( currentPlayer.factionId ).name;

    id('victoryPointsValue').innerText = calculateVP( currentPlayer ) + "";
    id('warBucksValue').innerText = currentPlayer.warBucks + "";
    id('technologiesValue').innerText = getStringBooleanCount( currentPlayer.advancements.technologies ) + "/" + TECHNOLOGIES.length;
    id('doctrinesValue').innerText = getStringBooleanCount( currentPlayer.advancements.doctrines ) + "/" + DOCTRINES.length;
    id('gardensValue').innerText = getStringBooleanCount( currentPlayer.advancements.gardens ) + "/" + GARDENS.length;
    id('auctionLotsValue').innerText = getStringBooleanCount( currentPlayer.advancements.auctions ) + "/" + AUCTIONS.length;
    id('politicalTokensValue').innerText = currentPlayer.initiatives.politicalTokens + "";
    id('culturalTokensValue').innerText = currentPlayer.initiatives.culturalTokens + "";
    id('chaosCardsValue').innerText = getStringBooleanCount( currentPlayer.cards.chaos ) + "";
}

function popModals() {
    if ( game.state.phase === 0.0 && !currentPlayer.advancements.auctionBid ) {
        showAuctionActions();
    }
}


/****** HANDLERS ******/


function initializeHandlers() {
}

function tileClickCallback( tileId ) {
    //todo 3 - delete this commented code

    // if ( selectedTile && tileId !== selectedTile.id ) {
    //     cl('selectedTile').forEach( t => t.classList.remove( "selectedTile" ) );
    //     cl('selectedTileImage').forEach( t => t.classList.remove( "selectedTileImage" ) );
    // }

    //WORKED - id( tileId + "-polygon-i" ).style.display = "none";
    //WORKED - changing image/text as I do in the load function
    //WORKED - moving a polygon by its points IF the polygon has a higher z-index (by being declared) after
    //id("2-2-polygon-i").setAttributeNS(null, "fill", "url(#hem)");
    //id("2-2-polygon-s").setAttributeNS(null, "fill", "transparent");

    let polygon = id( tileId + "-border" );
    id( "selected-polygon" ).setAttributeNS(null, "points", polygon.getAttributeNS(null, "points") );

    const tileDetails = getTileDetails( tileId );
    let tileDetailsHTML =
        "Tile Type: " + tileDetails.type + "<br/>" +
        "Population: " + tileDetails.population + "<br/>";
    if ( tileDetails.districtPlayerId ) {
        tileDetailsHTML += "District: " + getPlayer( tileDetails.districtPlayerId ).username + "<br/>";
    }
    if ( tileDetails.unitSets.length ) {
        tileDetailsHTML += "<br/>";
    }
    tileDetails.unitSets.forEach( us => {
        const player = getPlayer( us.id );
        const unitDescriptions = getUnitSetDescriptions( us, tileDetails.districtPlayerId );
        tileDetailsHTML += "Units (" + player.username + "): <br/>";
        tileDetailsHTML += unitDescriptions.join("<br/>");
        tileDetailsHTML += "<br/><br/>";
    } );
    id('tileDetailsDiv').innerHTML = tileDetailsHTML;
}

function getTileDetails( id ) {
    selectedTile = game.map.find( t => t.id === id );
    const districtPlayer = game.players.find( p => p.districts.tiles.includes( id ) );
    let unitSets = [];
    game.players.forEach( p => {
        let units = p.units.filter( u => u.tile === id );
        if ( units.length > 0 ) {
            unitSets.push( { id: p.id, units: units } );
        }
    } );
    return {
        id: id,
        type: selectedTile.tileType.type,
        population: selectedTile.tileType.value,
        districtPlayerId: districtPlayer ? districtPlayer.id : null,
        unitSets: unitSets
    };
}

function getUnitSetDescriptions( unitSet ) {
    let result = [];
    unitSet.units.forEach( u => {
        const isMultiple = u.count > 1;
        const unitType = getUnitTypeFromId( u.id );
        let name = unitType.id === UNIT_TYPES[HERO].id ? getFactionHero( getPlayer( unitSet.id ).factionId ).name : unitType.name;
        name = isMultiple ? (u.count + " " + name + "s") : name;
        const unitDescription = name + " (hit: " + unitType.hit + ", move: " + unitType.move + ")";
        result.push( "<span style='margin-left: 1em'>" + unitDescription + "</span>" );
    });
    return result;
}


/****** PLAYER ******/


function viewVP() {
    const insurrectionPlayerId = getInsurrectionVictim();
    const isHighPriestActive = currentPlayer.cards.offices.includes( "0" ) || currentPlayer.selects.highPriestVictim;
    const message =
        "<span style='font-weight: bold'>Victory Points Total:</span> " + id('victoryPointsValue').innerText + "<br/>" +
        "Districts: " + currentPlayer.districts.tiles.length + "<br/>" +
        "Dimensions: " + currentPlayer.dimensions.length + "<br/>" +
        "Wonders: " + (currentPlayer.dimensions.filter( d => !!d.wonderTile ).length * 2) + "<br/>" +
        "Hero: " + (hasHero( currentPlayer.units ) ? "1" : "0") + "<br/>" +
        "Chaos Cards: " + (currentPlayer.cards.chaos.filter( c => isHeavensGate( c ) ).length) + "<br/>" +
        ( isHighPriestActive ? ( "High Priest: " + (currentPlayer.cards.offices.includes( "0" ) ? "1" : ( currentPlayer.selects.highPriestVictim ? "-1" : "0" ) ) + "<br/>" ) : "" ) +
        ( ( insurrectionPlayerId && insurrectionPlayerId === currentPlayer.id ) ? "Insurrection Event: -1" : "" );
    showMessage( "Victory Points", message );
}

function viewWB() {
    const message =
        "War-Bucks: " + currentPlayer.warBucks + "<br/><br/>" +
        "<div style='font-weight: bold'>Resources</div>" +
        "Aether: " + currentPlayer.resources.aether + "<br/>" +
        "Chronotine: " + currentPlayer.resources.chronotine + "<br/>" +
        "Unobtanium: " + currentPlayer.resources.unobtanium;
    showMessage( "War-Bucks", message );
}

function viewTechnologies() {
    //todo 8 - table poorly formatted on phone
    let message = getAdvancementTable(
        TECHNOLOGIES,
        currentPlayer.advancements.technologies,
        function( item ) { return "7WB" }
    );
    showMessage( "Technologies", message, {padding: ".5em 20%"} );
}

function viewDoctrines() {
    let message = getAdvancementTable(
        DOCTRINES,
        currentPlayer.advancements.doctrines,
        function( item ) { return "7WB" }
    );
    showMessage( "Doctrines", message, {padding: ".5em 20%"} );
}

function viewGardens() {
    let message = getAdvancementTable(
        GARDENS,
        currentPlayer.advancements.gardens,
        function( item ) { return ( item.cost * currentPlayer.districts.tiles.length ) + "WB"; }
    );
    message += "<div style='margin-top: .5em'>(Cost calculated by 7WB times the number of districts; must have at least 2 districts.)</div>";
    showMessage( "Gardens", message, {padding: ".5em 20%"} );
}

function viewAuctions() {
    let message = getAdvancementTable(
        AUCTIONS,
        currentPlayer.advancements.auctions,
        function( item ) {
            const isLocked = !game.players.some( p => p.advancements.auctionWins[ AUCTIONS.indexOf( item ) ] === "1" );
            return isLocked ? "<span style='font-style: italic'>Locked</span>" : (item.cost + "WB");
        }
    );
    showMessage( "Auction Lots", message, {padding: ".5em 20%"} );
}

function getAdvancementTable( data, userData, costFunction ) {
    let resultHTML = "<table class='advancements'><tbody>";
    for ( let i = 0; i < data.length; i++ ) {
        const item = data[i];
        const ownedClass = ( userData.some( id => id === item.id ) ) ? "owned" : "";
        resultHTML += "<tr class='" + ownedClass + "'><td>" + item.name + "</td>" +
            "<td>" + item.description + "</td>" +
            "<td>" + costFunction( item ) + "</td></tr>";
    }
    resultHTML += "</tbody></table>";
    return resultHTML;
}

function viewPIT() {
    const message =
        "Political Initiative Tokens: " + currentPlayer.initiatives.politicalTokens + "<br/>" +
        "Tokens currently on map: " + currentPlayer.initiatives.politicalActive.length;
    showMessage( "Political Tokens", message );
}

function viewCIT() {
    const message =
        "Cultural Initiative Tokens: " + currentPlayer.initiatives.culturalTokens + "<br/>" +
        "Tokens currently on map: " + currentPlayer.initiatives.culturalActive.length;
    showMessage( "Cultural Tokens", message );
}

function viewCards() {
    //show Chaos cards as well as others (Office, etc.)
    showMessage( "Cards", "TODO" );
}


/****** ACTIONS ******/


function submit() {
    let isValidToSubmit = true;
    if ( game.state.phase === 0.0 || game.state.phase === 0.5 ) {
        if ( currentPlayer.units.some( u => u.tile === "unassigned" ) ) {
            showToaster( "Must assign purchased units" );
        }
    }
    else if ( game.state.phase === 1 ) {
        //
    }
    else if ( game.state.phase === 2 ) {
        //
    }
    else if ( game.state.phase === 3 ) {
        //
    }
}

function showActions() {
    switch ( game.state.phase ) {
        case 0.0:
            showAuctionActions();
            break;
        case 0.5:
            showMarketActions();
            break;
        case 1:
            showExpansionActions();
            break;
        case 2:
            showHarvestActions();
            break;
        case 3:
            showCouncilActions();
            break;
    }
}

function showTrade() {
    showMessage( "Trade", "TODO" );
}

function showHelp() {
    let html = "<a class='link' href='#' onclick='signOut();'>Sign out</a>";
    showMessage( "Help", html );
}


/****** MARKET ******/


function showAuctionActions() {
    const auctionIndex = getNextAuction( game.players );
    const minimum = Math.floor( AUCTIONS[auctionIndex].cost / 2 );
    showPrompt( "Auction", "Enter an amount to bid on " + AUCTIONS[auctionIndex].name + " (minimum: " + minimum + "WB):", function( response ) {
        response = parseInt( response );
        if ( Number.isInteger( response ) ) {
            if ( response <= currentPlayer.warBucks ) {
                currentPlayer.advancements.auctionBid = response;
            }
            else {
                showToaster( "Bid too high." );
            }
        }
    });
}

function showMarketActions() {
    openMarketModal(
        currentPlayer,
        function( response ) {
            currentPlayer = response;
        }
    );
}


/****** EXPANSION ******/


//todo 4
function showExpansionActions() {
    showMessage( "Expansion", "" );
}


/****** HARVEST ******/


//todo 5
function showHarvestActions() {
    showMessage( "Harvest", "" );
}


/****** COUNCIL ******/


//todo 6
function showCouncilActions() {
    showMessage( "Council", "" );
}


/****** UTILITY ******/


//todo 7 - make battles

function calculateVP( player ) {
    let result = 0;
    result += player.districts.tiles.length;
    result += player.dimensions.length;
    result += player.dimensions.filter( d => !!d.wonderTile ).length * 2;
    result += hasHero( player.units ) ? 1 : 0;
    result += player.cards.offices.includes( "0" ) ? 1 : 0; //High Priest
    result -= player.selects.highPriestVictim ? 1 : 0;
    result += player.cards.chaos.filter( c => isHeavensGate( c ) ).length;
    result -= getInsurrectionVictim() === player.id ? 1 : 0;
    return result;
}

function getInsurrectionVictim() {
    let result = null;
    if ( game.state.disaster === 5 ) {
        game.state.disaster = null;
        result = game.players.reduce((prev, current) => ( calculateVP(prev) > calculateVP(current) ) ? prev : current).id;
        game.state.disaster = 5;
    }
    return result;
}

function getNextAuction( players ) {
    let result = 0;
    players.forEach( function( player ) {
        for ( let i = 0; i < player.advancements.auctionWins.length; i++ ) {
            if ( player.advancements.auctionWins[i] === "1" && i > result ) {
                result = i;
            }
        }
    } );
    return result;
}


/****** HELPER ******/


function getPlayer( id ) {
    return game.players.find( p => p.id === id );
}

function getPhase( index ) {
    return PHASES[ Math.floor( index ) ];
}

function getTurn( phase, turn ) {
    let result;
    if ( phase === 0.0 ) {
        result = "(Auction)";
    }
    else if ( phase === 3 ) {
        result = "All";
    }
    else {
        result = game.players[turn].username;
    }
    return result;
}

function getEvent( index ) {
    return EVENTS[index];
}

function isImageTile( tileId ) {
    return id(tileId + "-text").style.display === "none";
}

function getColorFromIndex( index ) {
    let result = "";
    switch ( index ) {
        case 0:
            result = "red";
            break;
        case 1:
            result = "green";
            break;
        case 2:
            result = "blue";
            break;
        case 3:
            result = "purple";
            break;
        case 4:
            result = "orange";
            break;
        case 5:
            result = "gray";
            break;
        case 6:
            result = "gold";
            break;
    }
    return result;
}

function getStringBooleanCount( value ) {
    let result = 0;
    for ( let i = 0; i < value.length; result += +( "1" === value[i++] ) );
    return result;
}

function getArrayItemsFromString( array, value ) {
    let result = [];
    for ( let i = 0; i < value.length; i++ ) {
        if ( value[i] === "1" ) {
            result.push( array[i] )
        }
    }
    return result;
}

function hasHero( units ) {
    return units.some( u => getUnitTypeFromId( u.id ) === UNIT_TYPES[HERO] );
}


/****** TO-DELETE ******/


function getLoadedGame() {
    return {
        state: {
            ambassador: 0,
            round: 0,
            phase: 0.5,
            turn: 0,
            event: 0,
            disaster: null
        },
        map: generateNewMap( 3 ),
        players: [
            {
                id: "113295997427531114332",
                username: "daniel",
                factionId: "1",
                warBucks: 12,
                resources: {
                    unobtanium: 0,
                    chronotine: 0,
                    aether: 0
                },
                advancements: {
                    technologies: ["0", "1"], //todo - for most arrays, use String of Bits in DB
                    doctrines: ["0"],
                    gardens: [],
                    auctions: [],
                    auctionWins: [],
                    auctionBid: null,
                    purchasedCount: 0
                },
                initiatives: {
                    politicalTokens: 5,
                    culturalTokens: 0,
                    politicalActive: [ { tile: "1-2", count: 3 } ],
                    culturalActive: [],
                },
                cards: {
                    chaos: ["0", "1"],
                    offices: [],
                    purchasedCount: 0
                },
                units: [
                    { id: "1", tile: "1-2", count: 3 },
                    { id: "1", tile: "2-3", count: 1 },
                    { id: "7", tile: "1-2", count: 1 }
                ],
                districts: {
                    capital: "1-2",
                    tiles: ["1-2", "2-3"]
                },
                dimensions: [ { id: 0, wonderTile: "1-2" } ],
                religion: {
                    id: 0,
                    tiles: ["1-2"]
                },
                selects: {
                    highPriestVictim: null
                }

            },
            {
                id: "2",
                username: "michael",
                factionId: "6",
                warBucks: 12,
                resources: {
                    unobtanium: 0,
                    chronotine: 0,
                    aether: 0
                },
                advancements: {
                    technologies: ["0"],
                    doctrines: ["0", "1"],
                    gardens: [],
                    auctions: [],
                    auctionWins: [],
                    auctionBid: null,
                    purchasedCount: 0
                },
                initiatives: {
                    politicalTokens: 0,
                    culturalTokens: 5,
                    politicalActive: [],
                    culturalActive: [],
                },
                cards: {
                    chaos: ["1", "48"],
                    offices: [],
                    purchasedCount: 0
                },
                units: [
                    { id: "0", tile: "7-2", count: 1 },
                    { id: "0", tile: "1-2", count: 1 },
                    { id: "1", tile: "7-2", count: 1 },
                    { id: "7", tile: "7-2", count: 1 }
                ],
                districts: {
                    capital: "7-2",
                    tiles: ["7-2"]
                },
                dimensions: [],
                religion: {},
                selects: {
                    highPriestVictim: null
                }
            },
            {
                id: "3",
                username: "stephen",
                factionId: "8",
                warBucks: 10,
                resources: {
                    unobtanium: 0,
                    chronotine: 0,
                    aether: 0
                },
                advancements: {
                    technologies: ["0"],
                    doctrines: ["0"],
                    gardens: ["1"],
                    auctions: [],
                    auctionWins: [],
                    auctionBid: null,
                    purchasedCount: 0
                },
                initiatives: {
                    politicalTokens: 0,
                    culturalTokens: 0,
                    politicalActive: [],
                    culturalActive: [],
                },
                cards: {
                    chaos: ["2"],
                    offices: [],
                    purchasedCount: 0
                },
                units: [],
                districts: {
                    capital: "4-7",
                    tiles: ["4-7"]
                },
                dimensions: [],
                religion: {},
                selects: {
                    highPriestVictim: null
                }
            }
        ]
    };
}