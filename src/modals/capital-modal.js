let capitalPlayer;
let capitalModalCallback;

function openCouncilModal( selectedCapitalPlayer, callback ) {
    capitalPlayer = selectedCapitalPlayer;
    capitalModalCallback = callback;

    id('modalHeader').innerText = capitalPlayer.username;
    populatePlayerDisplay( capitalPlayer, "Capital" );

    show( "capitalModal", true, "block" );
    setCloseHandlersJS( "capitalModal" );
    blurBackground();
}

function closeOutCapitalModal() {
    closeModalJS( "capitalModal" );
    councilModalCallback( councilModalValues );
}