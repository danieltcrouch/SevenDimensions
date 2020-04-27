//todo 6 - Put all modals into classes to avoid polluting the namespace

let councilModalValues;
let councilModalCallback;

function openCouncilModal( currentPlayer, callback ) {
    councilModalValues = currentPlayer;
    councilModalCallback = callback;

    populateDimensionCheckboxes();

    show( "councilModal", true, "block" );
    setCloseHandlersJS( "councilModal" );
    blurBackground();
}

function populateDimensionCheckboxes() {
    let wrapper = id( 'dimensions' );
    wrapper.innerHTML = "";
    for ( let i = 0; i < DIMENSIONS.length; i++ ) {
        const dimension = DIMENSIONS[i];
        const id = "dimension" + i;
        let div = document.createElement( "DIV" );
        let input = document.createElement( "INPUT" );
        input.id = id;
        input.name = "dimensions";
        input.type = "checkbox";
        input.onchange = dimensionChange;
        let label = document.createElement( "LABEL" );
        let cost = dimension.costFunction();
        label.for = id;
        label.innerHTML = dimension.name + " (" + cost + ") ";
        div.appendChild( input );
        div.appendChild( label );
        wrapper.appendChild( div );
    }
}

function dimensionChange() {
    let total = 0;
    let dimensionChecks = nm('dimensions');
    for ( let i = 0; i < dimensionChecks.length; i++ ) {
        if ( dimensionChecks[i].checked ) {
            total += Dimension.getCost();
        }
    }
    id('totalDimensionCost').innerText = total + "";
}

function purchaseDimensions() {
    const councilTotal = parseInt( id('totalDimensionCost').innerText );
    if ( councilTotal > councilModalValues.warBucks ) {
        showToaster( "Cannot afford purchase" );
    }
    else {
        councilModalValues.warBucks -= councilTotal;
        closeOutCouncilModal();
    }
}

function closeOutCouncilModal() {
    closeModalJS( "councilModal" );
    councilModalCallback( councilModalValues );
}