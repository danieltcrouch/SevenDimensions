let capitalPlayer;
let capitalModalCallback;

function openCapitalModal( selectedCapitalPlayer, callback ) {
    capitalPlayer = selectedCapitalPlayer;
    capitalModalCallback = callback;

    id('modalHeader').innerText = capitalPlayer.username;
    populatePlayerDisplay( capitalPlayer, "Capital" ); //todo 6 - is this ok for the modal to do?
    //todo 6 - develop modal switcher for one one modal calls to another modal--or is that not necessary? Should returning to parent modal just be in callback function?

    show( "capitalModal", true, "block" );
    setCloseHandlersJS( "capitalModal" );
    blurBackground();
}

function closeOutCapitalModal() {
    closeModalJS( "capitalModal" );
    capitalModalCallback( capitalPlayer );
}