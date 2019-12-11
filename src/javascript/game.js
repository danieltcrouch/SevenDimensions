const PHASES = [ "Market", "Expansion", "Harvest", "Council" ];
const EVENTS = [ "Continental Elections", "Gambler’s Gambit", "Festival of Fairies", "Global Disasters", "Midterm Elections", "Annual Restock", "Mars Attack!" ];
const NO_TILE_DETAILS = "No Tile Selected";

let game;
let selectedTile;
let currentPlayer;

/****** LOAD ******/

function loadGame( gameId ) {
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

        id(tile.id + "-text").innerHTML = tile.value + "";

        if ( tile.type === "ATLANTIS" ) {
            hideById(tile.id + "-text");
            id(tile.id + "-polygon-i").setAttributeNS(null, "fill", "url(#atlantis)");
            id(tile.id + "-polygon-s").setAttributeNS(null, "fill", "transparent");
        }
        else if ( tile.type === "CAPITAL" ) {
            hideById(tile.id + "-text");
            id(tile.id + "-polygon-i").setAttributeNS(null, "fill", "url(#hem)");
            id(tile.id + "-polygon-s").setAttributeNS(null, "fill", "transparent");
        }
        else if ( tile.value === 0 ) {
            hideById(tile.id + "-text");
            id(tile.id + "-polygon-i").setAttributeNS(null, "fill", "url(#volcano)");
            id(tile.id + "-polygon-s").setAttributeNS(null, "fill", "transparent");
        }
    }

    id('tileDetailsDiv').innerText = NO_TILE_DETAILS;

    for ( let i = 0; i < game.players.length; i++ ) {
        let player = game.players[i];
        const color = getColorFromIndex( i );
        player.districts.tiles.forEach( function( tileId ) {
            if ( isImageTile( tileId ) ) {
                id( tileId + "-polygon-i" ).classList.add( color + "Image" );
            }
            else {
                id( tileId + "-polygon-s" ).classList.add( color );
            }
        } );
    }

    loadUnits();
}

function loadUnits() {
    //
}

function loadUser() {
    currentPlayer = game.players.find( p => p.id === userId );
    id('playerName').innerText = currentPlayer.username;
    id('factionName').innerText = getFactionName( currentPlayer.factionId );

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
    if ( selectedTile && tileId !== selectedTile.id ) {
        cl('selectedTile').forEach( t => t.classList.remove( "selectedTile" ) );
        cl('selectedTileImage').forEach( t => t.classList.remove( "selectedTileImage" ) );
    }

    if ( isImageTile( tileId ) ) {
        id( tileId + "-polygon-i" ).classList.add( "selectedTileImage" );
    }
    else {
        id( tileId + "-polygon-s" ).classList.add( "selectedTile" );
    }

    selectedTile = game.map.find( t => t.id === tileId );
    id('tileDetailsDiv').innerHTML =
        "Tile Selected: " + tileId + "<br/>" +
        "Value: " + selectedTile.value;
    //todo 5 - Complete selected Tile section
    //  display unit hit/move values (show additions/buffs as well)
}


/****** PLAYER ******/


//todo 3 - in Common, make modal remove custom css on close
function viewVP() {
    const insurrectionPlayerId = getInsurrectionVictim();
    const isHighPriestActive = currentPlayer.cards.offices.includes( "0" ) || currentPlayer.selects.highPriestVictim;
    const message =
        "<span style='font-weight: bold'>Victory Points Total:</span> " + id('victoryPointsValue').innerText + "<br/>" +
        "Districts: " + currentPlayer.districts.tiles.length + "<br/>" +
        "Dimensions: " + currentPlayer.dimensions.length + "<br/>" +
        "Wonders: " + (currentPlayer.dimensions.filter( d => !!d.wonderTile ).length * 2) + "<br/>" +
        "Hero: " + (!!currentPlayer.units.hero ? "1" : "0") + "<br/>" +
        "Chaos Cards: " + (currentPlayer.cards.chaos.charAt(48) === "1" ? "1" : "0") + "<br/>" + //todo 6 - if they have Heaven's Gate cards
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
        const ownedClass = ( userData.charAt(i) === "1" ) ? "owned" : "";
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
    showMessage( "Submit", "TODO" );
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
    showMessage( "Help", "TODO" );
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
    openMarketModal( {
        resources: currentPlayer.resources
    } );
}


/****** EXPANSION ******/


function showExpansionActions() {
    showMessage( "Expansion", "" );
}


/****** HARVEST ******/


function showHarvestActions() {
    showMessage( "Harvest", "" );
}


/****** COUNCIL ******/


function showCouncilActions() {
    showMessage( "Council", "" );
}


/****** UTILITY ******/


function calculateVP( player ) {
    let result = 0;
    result += player.districts.tiles.length;
    result += player.dimensions.length;
    result += player.dimensions.filter( d => !!d.wonderTile ).length * 2;
    result += !!player.units.hero ? 1 : 0;
    result += player.cards.offices.includes( "0" ) ? 1 : 0; //High Priest
    result -= player.selects.highPriestVictim ? 1 : 0;
    result += player.cards.chaos.charAt(48) === "1" ? 1 : 0; //todo 6 - if they have Heaven's Gate cards
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
        map: generateRandomTiles( 3 ),
        players: [
            {
                id: "1",
                username: "daniel",
                factionId: "HEM",
                warBucks: 12,
                resources: {
                    unobtanium: 0,
                    chronotine: 0,
                    aether: 0
                },
                advancements: {
                    technologies: "1100000000" + "0000",
                    doctrines: "1000000000" + "0",
                    gardens: "00000",
                    auctions: "0000000",
                    auctionWins: "0000000",
                    auctionBid: null
                },
                initiatives: {
                    politicalTokens: 5,
                    culturalTokens: 0,
                    politicalActive: [ { tile: "1-2", count: 3 } ],
                    culturalActive: [],
                },
                cards: {
                    //todo 6 - or use array of IDs?
                    chaos: "1000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000",
                    //todo 6 - or use String of Bits?
                    offices: []
                },
                units: {
                    apostle: [],
                    reaper: [ { tile: "1-2", count: 3 } ],
                    boomer: [],
                    speedster: [],
                    juggernaut: [],
                    robot: [],
                    godhand: null,
                    hero: "1-2"
                },
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
                factionId: "JUS",
                warBucks: 12,
                resources: {
                    unobtanium: 0,
                    chronotine: 0,
                    aether: 0
                },
                advancements: {
                    technologies: "1000000000" + "0000",
                    doctrines: "1100000000" + "0",
                    gardens: "00000",
                    auctions: "0000000",
                    auctionWins: "0000000",
                    auctionBid: null
                },
                initiatives: {
                    politicalTokens: 0,
                    culturalTokens: 5,
                    politicalActive: [],
                    culturalActive: [],
                },
                cards: {
                    chaos: "0100000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000",
                    offices: []
                },
                units: {
                    apostle: [ { tile: "7-2", count: 1 } ],
                    reaper: [ { tile: "7-2", count: 1 } ],
                    boomer: [],
                    speedster: [],
                    juggernaut: [],
                    robot: [],
                    godhand: null,
                    hero: "7-2"
                },
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
                factionId: "LOB",
                warBucks: 10,
                resources: {
                    unobtanium: 0,
                    chronotine: 0,
                    aether: 0
                },
                advancements: {
                    technologies: "1000000000" + "0000",
                    doctrines: "1000000000" + "0",
                    gardens: "00000",
                    auctions: "1000000",
                    auctionWins: "0000000",
                    auctionBid: null
                },
                initiatives: {
                    politicalTokens: 0,
                    culturalTokens: 0,
                    politicalActive: [],
                    culturalActive: [],
                },
                cards: {
                    chaos: "0010000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000" + "0000000000",
                    offices: []
                },
                units: {
                    apostle: [],
                    reaper: [],
                    boomer: [],
                    speedster: [],
                    juggernaut: [],
                    robot: [],
                    godhand: null,
                    hero: null
                },
                districts: {
                    capital: "4-7",
                    tiles: ["4-7"]
                },
                dimensions: [],
                religion: {},
                selects: {
                    highPriestVictim: null
                }
            },
        ]
    };
}

function getFactionName( factionId ) {
    let result = "";
    switch ( factionId ) {
        case "CNT":
            result = "Cyber-NET";
            break;
        case "HEM":
            result = "Holy Empire";
            break;
        case "DNT":
            result = "Dinosaur Nation";
            break;
        case "ATB":
            result = "America the Brave";
            break;
        case "LVM":
            result = "Living Mountain";
            break;
        case "MMC":
            result = "Mega-Money Conglomerate";
            break;
        case "JUS":
            result = "Justice Heroes";
            break;
        case "KRT":
            result = "Knights of the Round Table";
            break;
        case "LOB":
            result = "Lots of Bears";
            break;
        case "SDM":
            result = "Space Demons";
            break;
    }
    return result;
}