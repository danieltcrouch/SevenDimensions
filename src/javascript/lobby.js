function setUserType( userType ) {
    if ( userType === "single" ) {
        showToaster( "Single-Player is not currently supported." );
    }
    else {
        //showToaster( "Multi-Player is not currently supported." );
    }

    id('start').style.display = "";
    //todo 11 - add to Common show and hide functions (allow show to pass in parameter to set specific kind of display (e.g. block))
}

function startGame() {
    //const gameId = "";
    //location.href = "https://seven.religionandstory.com/game.php?id=" + TEST_GAME_ID;
    location.href = "https://seven.religionandstory.com/game.php?id=" + TEST_GAME_ID + "&testUserId=" + TEST_USERS[0].id;
}