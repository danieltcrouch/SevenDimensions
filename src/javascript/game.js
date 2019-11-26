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
        if ( tile.terrain === "ATL" ) {
            hideById(tile.id + "-text");
            id(tile.id + "-polygon").setAttributeNS(null, "fill", "url(#atlantis)");
        }
        else if ( tile.terrain === "VOL" ) {
            hideById(tile.id + "-text");
            id(tile.id + "-polygon").setAttributeNS(null, "fill", "url(#volcano)");
        }
        else {
            id(tile.id + "-text").innerHTML = tile.terrain.charAt(0);
        }
    }

    id('tileDetailsDiv').innerText = NO_TILE_DETAILS;
}

function loadUser() {
    currentPlayer = game.players.find( p => p.id === userId );
    id('playerName').innerText = currentPlayer.username;
    id('factionName').innerText = getFactionName( currentPlayer.factionId );

    //victoryPointsValue
    //warBucksValue
    //technologiesValue
    //doctrinesValue
    //gardensValue
    //auctionLotsValue
    //politicalTokensValue
    //culturalTokensValue
    //chaosCardsValue
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

function tileClickCallback( tileId ) {
    if ( selectedTile && tileId !== selectedTile.id ) {
        cl('selectedTile').forEach( t => t.classList.remove( "selectedTile" ) );
    }

    selectedTile = game.map.find( t => t.id === tileId );

    id('tileDetailsDiv').innerHTML =
        "Tile Selected: " + tileId + "<br/>" +
        "Value: " + selectedTile.terrain.charAt(0);
    id(tileId).classList.add( "selectedTile" );
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


/****** HELPER ******/

function getPhase( index ) {
    return PHASES[index];
}

function getEvent( index ) {
    return EVENTS[index];
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
        map: [
            {
                id: "1,2",
                terrain: "1--"
            },
            {
                id: "1,3",
                terrain: "4--"
            },
            {
                id: "1,4",
                terrain: "3--"
            },
            {
                id: "1,5",
                terrain: "CAP"
            },
            {
                id: "2,2",
                terrain: "4--"
            },
            {
                id: "2,3",
                terrain: "3--"
            },
            {
                id: "2,4",
                terrain: "2--"
            },
            {
                id: "2,5",
                terrain: "1--"
            },
            {
                id: "2,6",
                terrain: "4--"
            },
            {
                id: "3,1",
                terrain: "3--"
            },
            {
                id: "3,2",
                terrain: "4--"
            },
            {
                id: "3,3",
                terrain: "5--"
            },
            {
                id: "3,4",
                terrain: "VOL"
            },
            {
                id: "3,5",
                terrain: "5--"
            },
            {
                id: "3,6",
                terrain: "2--"
            },
            {
                id: "4,1",
                terrain: "CAP"
            },
            {
                id: "4,2",
                terrain: "2--"
            },
            {
                id: "4,3",
                terrain: "1--"
            },
            {
                id: "4,4",
                terrain: "ATL"
            },
            {
                id: "4,5",
                terrain: "1--"
            },
            {
                id: "4,6",
                terrain: "4--"
            },
            {
                id: "4,7",
                terrain: "3--"
            },
            {
                id: "5,1",
                terrain: "4--"
            },
            {
                id: "5,2",
                terrain: "VOL"
            },
            {
                id: "5,3",
                terrain: "5--"
            },
            {
                id: "5,4",
                terrain: "4--"
            },
            {
                id: "5,5",
                terrain: "3--"
            },
            {
                id: "5,6",
                terrain: "2--"
            },
            {
                id: "6,2",
                terrain: "1--"
            },
            {
                id: "6,3",
                terrain: "2--"
            },
            {
                id: "6,4",
                terrain: "3--"
            },
            {
                id: "6,5",
                terrain: "4--"
            },
            {
                id: "6,6",
                terrain: "5--"
            },
            {
                id: "7,2",
                terrain: "2--"
            },
            {
                id: "7,3",
                terrain: "3--"
            },
            {
                id: "7,4",
                terrain: "2--"
            },
            {
                id: "7,5",
                terrain: "CAP"
            },
        ],
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