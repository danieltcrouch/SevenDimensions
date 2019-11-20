let game;

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
    }
}

function loadGameCallback( response ) {
    game = jsonParse( response );
    loadGameState();
    loadMap();
    loadUser();
}

function loadGameState() {
    //game.state
    //roundValue
    //phase - buttons
    //turnValue
    //doomsdayValue
}

function loadMap() {
    //game.map
}

function loadUser() {
    //game.players (where id = userId)
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

function tileClickCallback( tileId ) {
    alert( tileId );
}

/****** OTHER ******/

function jsonParse( response ) {
    let result = null;
    try {
        result = JSON.parse( response );
    }
    catch ( e ) {
        result = null;
    }
    return result;
}