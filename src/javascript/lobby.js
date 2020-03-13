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
    //location.href = "https://seven.religionandstory.com/game.php?id=" + TEST_GAME_ID;
    location.href = "https://seven.religionandstory.com/game.php?id=" + "00000000000000000000000000000000" + "&testPlayerId=" + "00000000000000000000000000000001"; //todo 10 - use .assign() everywhere instead of assigning to href
}

function initializeGame( gameData ) {
    postCallEncoded(
        "php/controller.php",
        {
            action:    "createGame",
            game:      JSON.stringify( gameData ) //todo 11 - can calling JSON.stringify be built into helper?
        },
        function( response ) {},
        function( error ) {} );
}