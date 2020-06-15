//todo X - Delete if unneeded (and html)

// let eventModalEvent;
// let eventModalEventData;
// let eventModalPlayers;
// let eventModalCallback;
//
// function openEventModal( event, eventData, players, callback ) {
//     eventModalEvent = event;
//     eventModalEventData = eventData;
//     eventModalPlayers = players;
//     eventModalCallback = callback;
//
//     hideAllDivs();
//     if ( event === EVENT_ELECTION ) {
//         show('divEventElection');
//         id('eventOfficeValue').innerText = eventData.office;
//         addAllToSelect( 'eventPlayerSelect', ["Abstain"].concat( eventModalPlayers.map( p => ({text: p.username, value: p.id}) ) ) );
//         //player
//     }
//     else if ( event === EVENT_GAMBIT ) {
//         //number
//     }
//     else if ( event === EVENT_FESTIVAL ) {
//         //binary
//     }
//     else if ( event === EVENT_DISASTER ) {
//         //if payday, must select units to not die? Or just give money?
//     }
//     else if ( event === EVENT_MIDTERM ) {
//         //player
//     }
//     else if ( event === EVENT_RESTOCK ) {
//         //number (for Gambit)
//     }
//     else if ( event === EVENT_MARS ) {
//         //liquify
//     }
//
//     show( "eventModal", true, "block" );
//     setCloseHandlersJS( "eventModal" );
//     blurBackground();
// }
//
// function hideAllDivs() {
//     document.querySelectorAll( '*[id^="divEvent"]' ).forEach( d => hide( d ) );
// }
//
// function playerSubmit() {
//     closeOutEventModal();
// }
//
// function closeOutEventModal() {
//     closeModalJS( "eventModal" );
//     eventModalCallback( null );
// }