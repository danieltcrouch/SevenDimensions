const PHASES = [ "Market", "Expansion", "Harvest", "Council" ];
const EVENTS = [ "Continental Elections", "Gambler’s Gambit", "Festival of Fairies", "Global Disasters", "Midterm Elections", "Annual Restock", "Mars Attack!" ];
const NO_TILE_DETAILS = "No Tile Selected";

    //CNT - Cyber-NET
    //HEM - Holy Empire
    //DNT - Dinosaur Nation
    //ATB - America the Brave
    //LVM - Living Mountain
    //MMC - Mega-Money Conglomerate
    //JUS - Justice Heroes
    //KRT - Knights of the Round Table
    //LOB - Lots of Bears
    //SDM - Space Demons

    //VOL
    //1--
    //2--
    //2-C
    //2-A
    //2-U
    //3--
    //4--
    //4-C
    //4-A
    //4-U
    //5--
    //CAP
    //ATL

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
}

function loadGameState() {
    id('roundValue').innerText = (game.state.round + 1) + "";
    id('phaseValue').innerText = getPhase(game.state.phase);
    id('turnValue').innerText = game.players[game.state.turn].username;
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
}

function loadUser() {
    currentPlayer = game.players.find( p => p.id === userId );
    id('playerName').innerText = currentPlayer.username;
    id('factionName').innerText = getFactionName( currentPlayer.factionId );

    id('victoryPointsValue').innerText = calculateVP( currentPlayer, true ) + "";
    id('warBucksValue').innerText = currentPlayer.warBucks + "";
    id('technologiesValue').innerText = currentPlayer.technologies.length + "/" + 15; //TODO
    id('doctrinesValue').innerText = currentPlayer.doctrines.length + "/" + 12;
    id('gardensValue').innerText = currentPlayer.gardens.length + "/" + 5;
    id('auctionLotsValue').innerText = currentPlayer.auction.length + "/" + 7;
    id('politicalTokensValue').innerText = currentPlayer.pitCount + "";
    id('culturalTokensValue').innerText = currentPlayer.citCount + "";
    id('chaosCardsValue').innerText = currentPlayer.chaos.length + "";
}


/****** HANDLERS ******/


function initializeHandlers() {
}

function submit() {
    showMessage( "Submit", "TODO" );
}

function showActions() {
    showMessage( "Actions", "TODO" );
}

function showTrade() {
    showMessage( "Trade", "TODO" );
}

function showHelp() {
    showMessage( "Help", "TODO" );
}

function viewVP() {
    showMessage( "Help", "TODO" );
}

function viewWB() {
    showMessage( "Help", "TODO" );
}

function viewTechnologies() {
    showMessage( "Help", "TODO" );
}

function viewDoctrines() {
    showMessage( "Help", "TODO" );
}

function viewGardens() {
    showMessage( "Help", "TODO" );
}

function viewLots() {
    showMessage( "Help", "TODO" );
}

function viewPIT() {
    showMessage( "Help", "TODO" );
}

function viewCIT() {
    showMessage( "Help", "TODO" );
}

function viewCards() {
    showMessage( "Help", "TODO" );
}

function tileClickCallback( tileId ) {
    if ( selectedTile && tileId !== selectedTile.id ) {
        cl('selectedTile').forEach( t => t.classList.remove( "selectedTile" ) );
        cl('selectedTileImage').forEach( t => t.classList.remove( "selectedTileImage" ) );
    }

    selectedTile = game.map.find( t => t.id === tileId );

    id('tileDetailsDiv').innerHTML =
        "Tile Selected: " + tileId + "<br/>" +
        "Value: " + selectedTile.value;
    if ( isImageTile( tileId ) ) {
        id( tileId + "-polygon-i" ).classList.add( "selectedTileImage" );
    }
    else {
        id( tileId + "-polygon-s" ).classList.add( "selectedTile" );
    }
}


/****** MARKET ******/


function showMarketModal() {
    showMessage( "Market Phase", "You thought" );
}


/****** EXPANSION ******/


function showExpansionModal() {
    showMessage( "Expansion Phase", "this" );
}


/****** HARVEST ******/


function showHarvestModal() {
    showMessage( "Harvest Phase", "would" );
}


/****** COUNCIL ******/


function showCouncilModal() {
    showMessage( "Council Phase", "work?" );
}


/****** UTILITY ******/


function calculateVP( player, includeHidden = false ) {
    return 0;
}


/****** HELPER ******/


function getPhase( index ) {
    return PHASES[index];
}

function getEvent( index ) {
    return EVENTS[index];
}

function isImageTile( tileId ) {
    return id(tileId + "-text").style.display === "none";
}


/****** TO-DELETE ******/


function getLoadedGame() {
    return {
        state: {
            ambassador: 0,
            round: 0,
            phase: 1,
            turn: 2,
            event: 0
        },
        map: generateRandomTiles( 3 ),
        players: [
            {
                id: "ABC",
                username: "danielt",
                factionId: "LOB",
                warBucks: 1
            },
            {
                id: "DEF",
                username: "stephens",
                factionId: "JUS",
                warBucks: 2
            },
            {
                id: "GHI",
                username: "michaell",
                factionId: "CNT",
                warBucks: 3
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