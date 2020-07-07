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
    //location.assign( "https://seven.religionandstory.com/game.php?id=" + "00000000000000000000000000000000" );
    location.assign( "https://seven.religionandstory.com/game.php?id=" + "00000000000000000000000000000000" + "&testPlayerId=" + "00000000000000000000000000000001" );
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