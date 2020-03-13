let eventModalEvent;
let eventModalEventData;
let eventModalPlayers;
let eventModalCallback;

function openEventModal( event, eventData, players, callback ) {
    eventModalEvent = event;
    eventModalEventData = eventData;
    eventModalPlayers = players;
    eventModalCallback = callback;

    hideAllDivs();
    if ( event === EVENT_ELECTION ) {
        show('divEventElection');
        id('eventOfficeValue').innerText = eventData.office;
        addAllToSelect( 'eventPlayerSelect', ["Abstain"].concat( eventModalPlayers.map( p => { return {text: p.username, value: p.id}; } ) ) );
    }
    else if ( event === EVENT_GAMBIT ) {
        //
    }
    else if ( event === EVENT_FESTIVAL ) {
        //
    }
    else if ( event === EVENT_DISASTER ) {
        //
    }
    else if ( event === EVENT_MIDTERM ) {
        //
    }
    else if ( event === EVENT_RESTOCK ) {
        //
    }
    else if ( event === EVENT_MARS ) {
        //
    }

    show( "eventModal", true, "block" );
    setCloseHandlersJS( "eventModal" );
    blurBackground();
}

function hideAllDivs() {
    document.querySelectorAll( '*[id^="divEvent"]' ).forEach( d => hide( d ) );
}

function playerSubmit() {
    closeOutEventModal();
}

function closeOutEventModal() {
    closeModalJS( "eventModal" );
    eventModalCallback( null );
}