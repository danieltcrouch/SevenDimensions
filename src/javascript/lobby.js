function setUserType( userType ) {
    if ( userType === "single" ) {
        //
    }
    else {
        showToaster( "Multi-Player is not currently supported." );
    }
}

function startGame() {
    const gameId = "PREVIEW";
    window.location = "https://seven.religionandstory.com/gameSingle.php?id=" + gameId;
}