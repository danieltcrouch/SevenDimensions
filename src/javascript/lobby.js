function setUserType( userType ) {
    if ( userType === "single" ) {
        showToaster( "Single-Player is not currently supported." );
    }
    else {
        //showToaster( "Multi-Player is not currently supported." );
    }
}

function startGame() {
    const gameId = "PREVIEW";
    window.location = "https://seven.religionandstory.com/game.php?id=" + gameId;
}