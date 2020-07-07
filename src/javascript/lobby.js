function setUserType( userType ) {
    if ( userType === "single" ) {
        showToaster( "Single-Player is not currently supported." );
    }
    else {
        //showToaster( "Multi-Player is not currently supported." );
    }

    show('start');
}

function startGame() {
    //const gameId = "";
    //location.assign( "https://seven.religionandstory.com/game.php?id=" + TEST_GAME_ID );
    location.assign( "https://seven.religionandstory.com/game.php?id=" + TEST_GAME_ID + "&testPlayerId=" + TEST_USERS[0].id );
}

function initializeGame( gameData ) {
    postCallEncoded(
        "php/main-controller.php",
        {
            action:    "createGame",
            game:      gameData
        },
        function( response ) {},
        function( error ) {} );
}