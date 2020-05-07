let marketModalValues;
let marketModalCallback;
let marketTotal;

function openMarketModal( currentPlayer, callback ) {
    marketModalValues = currentPlayer;
    marketModalCallback = callback;

    populateUnits();
    populateAdvancements();
    populateData();

    show( "marketModal", true, "block" );
    setCloseHandlersJS( "marketModal" );
    blurBackground();
}

function populateUnits() {
    let wrapper = id('unitsWrapper');
    wrapper.innerHTML = "";
    for ( let i = 0; i < UNIT_TYPES.length; i++ ) {
        let unit = UNIT_TYPES[i];
        const id = "unitCount" + i;
        let div = document.createElement( "DIV" );
        let label = document.createElement( "LABEL" );
        label.for = id;
        label.style.display = "inline-block";
        label.style.width = "10em";
        label.innerText = unit.name + " (" + unit.cost + "WB) ";
        let input = document.createElement( "INPUT" );
        input.id = id;
        input.name = "unitCounts";
        input.type = "number";
        input.classList.add( "input" );
        input.style.width = "3em";
        input.style.margin = ".1em";
        input.style.padding = ".1em";
        input.min = "0";
        if ( unit.max ) {
            input.max = unit.max;
            input.disabled = unit.max === marketModalValues.units.filter( u => u.id === unit.id ).length;
        }
        input.placeholder = "0";
        input.onchange = unitChange;
        div.appendChild( label );
        div.appendChild( input );
        wrapper.appendChild( div );
    }
}

function populateAdvancements() {
    const availableTechnologies = TECHNOLOGIES.filter( t => !marketModalValues.advancements.technologies.includes( t.id ) );
    const availableDoctrines = DOCTRINES.filter( d => !marketModalValues.advancements.doctrines.includes( d.id ) );
    const availableGardens = GARDENS.filter( g => !marketModalValues.advancements.gardens.includes( g.id ) );
    const availableAuctions = AUCTIONS.filter( a => !marketModalValues.advancements.auctions.includes( a.id ) );
    //todo 4 - Add "None" option to Common?
    addAllToSelect( 'technologySelect', [{text: "None", value: null}].concat( availableTechnologies.map( (t) => { return {text: t.name, value: t.id}; } ) ) );
    addAllToSelect( 'doctrineSelect', [{text: "None", value: null}].concat( availableDoctrines.map( (d) => { return {text: d.name, value: d.id}; } ) ) );
    populateAdvancementCheckboxes( availableGardens, "gardens", function( item ) { return item.getCostOrLocked( currentPlayer.districts.tileIds.length ); } );
    populateAdvancementCheckboxes( availableAuctions, "auctions", function( item ) { return item.getCostOrLocked( game.players ); } );
}

function populateAdvancementCheckboxes( data, wrapperId, costFunction ) {
    let wrapper = id( wrapperId );
    wrapper.innerHTML = "";
    for ( let i = 0; i < data.length; i++ ) {
        const id = wrapperId + "-" + data[i].id;
        let div = document.createElement( "DIV" );
        let input = document.createElement( "INPUT" );
        input.id = id;
        input.name = wrapperId;
        input.type = "checkbox";
        input.onchange = function() { advancementChange( data, costFunction, wrapperId ); };
        let label = document.createElement( "LABEL" );
        let cost = costFunction( data[i] );
        let isLocked = Number.isNaN(parseInt(cost));
        label.for = id;
        label.innerHTML = data[i].name + " (" + cost + ")";
        input.disabled = isLocked;
        div.appendChild( input );
        div.appendChild( label );
        wrapper.appendChild( div );
    }
}

function populateData() {
    const aetherCount     = getAetherCount(     marketModalValues.resources );
    const chronotineCount = getChronotineCount( marketModalValues.resources );
    const unobtaniumCount = getUnobtaniumCount( marketModalValues.resources );
    id('resourceAMax').max       = aetherCount;
    id('resourceAMax').innerText = aetherCount + "";
    id('resourceCMax').max       = chronotineCount;
    id('resourceCMax').innerText = chronotineCount + "";
    id('resourceUMax').max       = unobtaniumCount;
    id('resourceUMax').innerText = unobtaniumCount + "";

    id('currentFunds').innerText = marketModalValues.warBucks;
}

function unitChange() {
    let total = 0;
    let unitCounts = nm('unitCounts');
    for ( let i = 0; i < unitCounts.length; i++ ) {
        total += UNIT_TYPES[i].cost * unitCounts[i].value;
    }
    id('unitsCost').innerText = total + "";
    updateTotal();
}

function technologyChange() {
    let total = ( getSelectedOption( 'technologySelect' ).index ) * TECHNOLOGIES[0].costFunction();
    id('technologyCost').innerText = total + "";
    updateTotal();
}

function doctrineChange() {
    let total = ( getSelectedOptionValue( 'doctrineSelect' ).index ) * DOCTRINES[0].costFunction();
    id('doctrineCost').innerText = total + "";
    updateTotal();
}

function advancementChange( data, costFunction, wrapperId ) {
    let total = 0;
    let advancementChecks = nm(wrapperId);
    for ( let i = 0; i < advancementChecks.length; i++ ) {
        if ( advancementChecks[i].checked ) {
            total += parseInt( costFunction( data[i] ) );
        }
    }
    id(wrapperId + 'Cost').innerText = total + "";
    updateTotal();
}

function chaosChange() {
    let total = 4 * id('cardCount').value;
    id('cardCost').innerText = total + "";
    updateTotal();
}

function updateTotal() {
    marketTotal = parseInt( id('unitsCost').innerText ) + parseInt( id('technologyCost').innerText ) + parseInt( id('doctrineCost').innerText ) + parseInt( id('gardensCost').innerText ) + parseInt( id('auctionsCost').innerText ) + parseInt( id('cardCost').innerText );
    id('totalCost').innerText = marketTotal + "";
}

function convert() {
    //todo
}

function purchase() {
    if ( marketTotal > marketModalValues.warBucks ) {
        showToaster( "Cannot afford purchase" );
    }
    else {
        const maxAdvancements = 7;
        const maxCards = 7;
        const advancementsInCartCount =
            getSelectedOption( "technologySelect" ).index +
            getSelectedOption( "doctrineSelect" ).index +
            nm('gardens').filter( c => c.checked ).length +
            nm('auctions').filter( c => c.checked ).length;
        if ( advancementsInCartCount + marketModalValues.turn.purchasedAdvancementCount > maxAdvancements ) {
            showToaster( "Cannot purchase more than " + maxAdvancements + " advancements" );
        }
        else if ( parseInt( id('cardCount').value ) + marketModalValues.turn.purchasedCardCount > maxCards ) {
            showToaster( "Cannot purchase more than " + maxCards + " cards" );
        }
        else {
            let isValid = true;
            let unitCounts = nm('unitCounts');
            for ( let i = 0; i < unitCounts.length; i++ ) {
                const unitInput = unitCounts[i];
                const currentCount = marketModalValues.units.filter( u => u.id === (i + "") ).length + unitInput.value;
                if ( unitInput.max && currentCount > unitInput.max ) {
                    isValid = false;
                    showToaster( "Too many units of a type" );
                }
            }

            if ( isValid ) {
                marketModalValues.warBucks -= marketTotal;
                assignPurchases();
                closeOutMarketModal();
            }
        }
    }
}

function assignPurchases() {
    let unitInputs = nm('unitCounts');
    for ( let i = 0; i < unitInputs.length; i++ ) {
        const unitInput = unitInputs[i];
        const unitCount = parseInt( unitInput.value ) || 0;
        const unitTypeId = i + "";
        if ( unitCount > 0 ) {
            marketModalValues.units.push( {id: unitTypeId, count: unitCount, tileId: DEFAULT_TILE} );
        }
    }

    const newTechnologyCount = getSelectedOption( "technologySelect" ).index;
    const newTechnologyIds = TECHNOLOGIES.filter( t => !marketModalValues.advancements.technologies.includes( t.id ) ).slice( 0, newTechnologyCount ).map( t => t.id );
    const newDoctrineCount = getSelectedOption( "doctrineSelect" ).index;
    const newDoctrineIds = DOCTRINES.filter( d => !marketModalValues.advancements.doctrines.includes( d.id ) ).slice( 0, newDoctrineCount ).map( d => d.id );
    const newGardenIds = nm('gardens').filter( c => c.checked ).map( c => c.id.split('-')[1] );
    const newAuctionIds = nm('auctions').filter( c => c.checked ).map( c => c.id.split('-')[1] );
    marketModalValues.advancements.technologies = marketModalValues.advancements.technologies.concat( newTechnologyIds );
    marketModalValues.advancements.doctrines    = marketModalValues.advancements.doctrines.concat( newDoctrineIds );
    marketModalValues.advancements.gardens      = marketModalValues.advancements.gardens.concat( newGardenIds );
    marketModalValues.advancements.auctions     = marketModalValues.advancements.auctions.concat( newAuctionIds );

    const newCards = Deck.getCurrentDeck( CHAOS, game.players.map( p => p.cards.chaos.map( c => c.id ) ) ).getRandomCards( parseInt( id('cardCount').value ) ).map( c => c.id );
    marketModalValues.cards.chaos = marketModalValues.cards.chaos.concat( newCards );
}

function clearTotals() {
    id('unitsCost').innerText      = "0";
    id('technologyCost').innerText = "0";
    id('doctrineCost').innerText   = "0";
    id('gardensCost').innerText    = "0";
    id('auctionsCost').innerText   = "0";
    id('cardCost').innerText       = "0";
    id('totalCost').innerText      = "0";
}

function closeOutMarketModal() {
    clearTotals();
    closeModalJS( "marketModal" );
    marketModalCallback( marketModalValues );
}