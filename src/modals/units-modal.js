//todo X - Delete if not needed
// let unitModalResult;
// let unitModalValues;
// let unitModalCallback;
//
// function openUnitsModal( units, callback ) {
//     unitModalValues = units;
//     unitModalCallback = callback;
//     unitModalResult = [];
//
//     populateUnitChoices();
//
//     show( "unitsModal", true, "block" );
//     setCloseHandlersJS( "unitsModal" );
//     blurBackground();
// }
//
// function populateUnitChoices() {
//     const groupId = "unitOptions";
//     let wrapper = id(groupId);
//     wrapper.innerHTML = "";
//     for ( let i = 0; i < unitModalValues.length; i++ ) {
//         const unit = unitModalValues[i];
//         const id = `${groupId}-${unit.id}`;
//         let div = document.createElement( "DIV" );
//         let input = document.createElement( "INPUT" );
//         input.id = id;
//         input.name = groupId;
//         input.type = "checkbox";
//         let label = document.createElement( "LABEL" );
//         label.htmlFor = id;
//         label.innerHTML = `${unit.getUnitType().name} (Moves: ${unit.movesRemaining})`;
//         div.appendChild( input );
//         div.appendChild( label );
//         wrapper.appendChild( div );
//     }
// }
//
// function checkAllUnits() {
//     const isAllChecked = id('allUnitsCheckbox').checked;
//     nm('unitOptions').forEach( c => c.checked = isAllChecked );
// }
//
// function submitUnits() {
//     const checkedUnitIds = nm('unitOptions').filter( c => c.checked ).map( c => c.id.split('-')[1] );
//     unitModalResult = unitModalValues.filter( u => checkedUnitIds.includes( u.id ) );
//
//     closeOutUnitsModal();
// }
//
// function uncheckUnits() {
//     id('allUnitsCheckbox').checked = false;
//     nm('unitOptions').forEach( c => c.checked = false );
// }
//
// function closeOutUnitsModal() {
//     uncheckUnits();
//     closeModalJS( "unitsModal" );
//     unitModalCallback( unitModalResult );
// }