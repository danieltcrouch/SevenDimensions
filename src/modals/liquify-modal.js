let liquifyTotal;
let liquifyRequired;
let liquifyModalValues;
let liquifyModalCallback;

function openLiquifyModal( currentPlayer, requiredValue, callback = function() {} ) {
    liquifyModalValues = currentPlayer;
    liquifyRequired = requiredValue;
    liquifyModalCallback = callback;

    populatePlaceholders();
    populateUnits();
    populateCards();

    show( "liquifyModal", true, "block" );
    setCloseHandlersJS( "liquifyModal" );
    blurBackground();
}

function populatePlaceholders() {
    const hasInitiatives = Boolean( liquifyModalValues.initiatives );

    show( 'displayWB', Boolean( liquifyModalValues.warBucks ) );
    show( 'displayR',  Boolean( liquifyModalValues.resources ) );
    show( 'displayIC', hasInitiatives && Boolean( liquifyModalValues.initiatives.culturalTokens ) );

    id('countWB').placeholder  = liquifyModalValues.warBucks || 0;
    id('countWB').max          = liquifyModalValues.warBucks || 0;
    id('countRA').placeholder = getAetherCount(     liquifyModalValues.resources );
    id('countRA').max         = getAetherCount(     liquifyModalValues.resources );
    id('countRC').placeholder = getChronotineCount( liquifyModalValues.resources );
    id('countRC').max         = getChronotineCount( liquifyModalValues.resources );
    id('countRU').placeholder = getUnobtaniumCount( liquifyModalValues.resources );
    id('countRU').max         = getUnobtaniumCount( liquifyModalValues.resources );
    id('countIC').placeholder = hasInitiatives ? liquifyModalValues.initiatives.culturalTokens : 0;
    id('countIC').max         = hasInitiatives ? liquifyModalValues.initiatives.culturalTokens : 0;
}

function populateUnits() {
    const isOneTile = liquifyModalValues.units.every( u => u.tileId === liquifyModalValues.units[0].tileId );
    const data = liquifyModalValues.units.map( u => ({id: u.id, type: "Unit", name: u.getUnitType().name + (!isOneTile?` (Tile ${u.tileId})`:"")}) );
    populateCheckboxes( data, "unitWrapper" );
}

function populateCards() {
    const data = liquifyModalValues.cards.chaos.map( c => getChaosCard( c ) ).map( c => ({id: c.id, type: "Chaos", name: c.name}) );
    populateCheckboxes( data, "cardWrapper" );
}

function populateCheckboxes( data, wrapperId ) {
    let wrapper = id( wrapperId );
    wrapper.innerHTML = data.length ? "" : "None";
    for ( let i = 0; i < data.length; i++ ) {
        const id = wrapperId + "-" + data[i].type + "-" + data[i].id;
        let div = document.createElement( "DIV" );
        let input = document.createElement( "INPUT" );
        input.id = id;
        input.name = wrapperId;
        input.type = "checkbox";
        input.onchange = updateTotal;
        let label = document.createElement( "LABEL" );
        label.htmlFor = id;
        label.innerHTML = data[i].name;
        div.appendChild( input );
        div.appendChild( label );
        wrapper.appendChild( div );
    }
}

function updateTotal() {
    liquifyTotal =
        parseInt( id('countWB').value || 0 ) +
        ( parseInt( id('countRA').value || 0 ) * RESOURCE_UNIT_VALUE ) +
        ( parseInt( id('countRC').value || 0 ) * RESOURCE_UNIT_VALUE ) +
        ( parseInt( id('countRU').value || 0 ) * RESOURCE_UNIT_VALUE ) +
        ( parseInt( id('countIC').value || 0 ) * REAPERS_IN_CR ) +
        ( nm('cardWrapper').filter( c => c.checked ).length * DEFAULT_CHAOS_COST ) +
        nm('unitWrapper').filter( u => u.checked ).reduce( (t,u) => liquifyModalValues.units.find( cu => cu.id === u.id.split('-')[2] ).getCost() + t, 0 );
    id('liquifyTotal').innerText = liquifyTotal;
}

function getSelectedLiquify() {
    return {
        warBucks: parseInt( id('countWB').value || 0 ),
        resources: [
            {id: RESOURCES[0].id, count: parseInt( id('countRU').value || 0 )},
            {id: RESOURCES[1].id, count: parseInt( id('countRC').value || 0 )},
            {id: RESOURCES[2].id, count: parseInt( id('countRA').value || 0 )}
        ],
        initiatives: {
            culturalTokens: parseInt( id('countIC').value || 0 )
        },
        units: nm('unitWrapper').filter( u => u.checked ).map( u => u.id.split('-')[2] ),
        chaos: nm('cardWrapper').filter( c => c.checked ).map( c => c.id.split('-')[2] )
    }
}

function submitLiquify() {
    const resourceValue = liquifyModalValues.resources ? (
            ( getAetherCount( liquifyModalValues.resources )     * RESOURCE_UNIT_VALUE ) +
            ( getChronotineCount( liquifyModalValues.resources ) * RESOURCE_UNIT_VALUE ) +
            ( getUnobtaniumCount( liquifyModalValues.resources ) * RESOURCE_UNIT_VALUE )
        ) : 0;
    const initiativeValue = liquifyModalValues.initiatives ? ( liquifyModalValues.initiatives.culturalTokens * REAPERS_IN_CR ) : 0;
    const cardValue = liquifyModalValues.cards ? ( liquifyModalValues.cards.chaos * DEFAULT_CHAOS_COST ) : 0;
    const maxValue =
        liquifyModalValues.warBucks +
        resourceValue +
        initiativeValue +
        cardValue +
        liquifyModalValues.units.reduce( (t,u) => u.getCost() + t, 0 );

    if ( isNaN( liquifyRequired ) || ( liquifyTotal >= liquifyRequired ) || ( liquifyTotal === maxValue ) ) {
        closeOutTradeModal();
    }
    else {
        showToaster( `Must select ${liquifyRequired || maxValue}WB worth of assets to liquify.` );
    }
}

function closeOutTradeModal() {
    closeModalJS( "liquifyModal" );
    liquifyModalCallback( liquifyTotal, getSelectedLiquify() );
}