let marketModalValues;
let marketModalCallback;
let marketTotal;
let currentVP;

function openMarketModal( currentPlayer, callback ) {
    marketModalValues = currentPlayer;
    marketModalCallback = callback;
    currentVP = calculateVP( currentPlayer );

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
        const id = "unitCount-" + unit.id;
        let div = document.createElement( "DIV" );
        let label = document.createElement( "LABEL" );
        label.htmlFor = id;
        label.style.display = "inline-block";
        label.style.width = "10em";
        label.innerText = unit.name + " (" + unit.getAdjustedCost( game.state.events.inflation ) + "WB) ";
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
    addAllToSelect( 'technologySelect', [{text: "None", value: null}].concat( availableTechnologies.map( (t) => ({text: t.name, value: t.id}) ) ) );
    addAllToSelect( 'doctrineSelect', [{text: "None", value: null}].concat( availableDoctrines.map( (d) => ({text: d.name, value: d.id}) ) ) );
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
        label.htmlFor = id;
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
    id('resourceACount').max     = aetherCount;
    id('resourceAMax').innerText = aetherCount + "";
    id('resourceCCount').max     = chronotineCount;
    id('resourceCMax').innerText = chronotineCount + "";
    id('resourceUCount').max     = unobtaniumCount;
    id('resourceUMax').innerText = unobtaniumCount + "";

    id('currentFunds').innerText = marketModalValues.warBucks;
}

function cInitTokenChange() {
    let total = id( 'cInitTokenCount' ).value * currentVP;
    id('cInitTokenCost').innerText = total + "";
    updateTotal();
}

function pInitTokenChange() {
    let total = id( 'pInitTokenCount' ).value * currentVP;
    id('pInitTokenCost').innerText = total + "";
    updateTotal();
}

function unitChange() {
    let total = 0;
    let unitCounts = nm('unitCounts');
    for ( let i = 0; i < unitCounts.length; i++ ) {
        total += UNIT_TYPES[i].getAdjustedCost( game.state.events.inflation ) * unitCounts[i].value;
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
    marketTotal =
        parseInt( id('cInitTokenCount').innerText ) +
        parseInt( id('pInitTokenCount').innerText ) +
        parseInt( id('unitsCost').innerText ) +
        parseInt( id('technologyCost').innerText ) +
        parseInt( id('doctrineCost').innerText ) +
        parseInt( id('gardensCost').innerText ) +
        parseInt( id('auctionsCost').innerText ) +
        parseInt( id('cardCost').innerText );
    id('totalCost').innerText = marketTotal + "";
}

function convert() {
    let isValid = true;

    let totalResourceCount = 0;
    const allowResourceMixing = marketModalValues.advancements.doctrines.includes( DOCTRINES[IDOL_WORSHIP].id );
    const setSize = marketModalValues.advancements.technologies.includes( TECHNOLOGIES[ORE_PROCESSING].id ) ? (RESOURCE_EXCHANGE - 1) : RESOURCE_EXCHANGE;
    for ( let i = 0; i < RESOURCES.length; i++ ) {
        const resource = RESOURCES[i];
        const resourceInput = id(`resource${resource.name.charAt(0)}Count`);
        const resourceCount = parseInt( resourceInput.value );
        if ( Number.isInteger( resourceCount ) && resourceCount >= 0 && resourceCount <= resourceInput.max ) {
            showToaster( `${resource.name} count is invalid.` );
            isValid = false;
            break;
        }

        if ( !allowResourceMixing ) {
            if ( resourceCount % setSize !== 0 ) {
                showToaster( `${resource.name} count is not a multiple of ${setSize}.` );
                isValid = false;
                break;
            }
        }
    }

    if ( isValid && allowResourceMixing ) {
        if ( totalResourceCount % setSize !== 0 ) {
            showToaster( `Resource count is not a multiple of ${setSize}.` );
            isValid = false;
        }
    }

    if ( isValid ) {
        marketModalValues.warBucks += ( totalResourceCount / setSize ) * RESOURCE_EXCHANGE_VALUE;
        for ( let i = 0; i < RESOURCES.length; i++ ) {
            const resource = RESOURCES[i];
            const resourceInput = id(`resource${resource.name.charAt(0)}Count`);
            const resourceCount = parseInt( resourceInput.value );
            marketModalValues.resources.find( r => r.id === resource.id ).count -= resourceCount;
        }
    }
}

function purchase() {
    if ( marketTotal > marketModalValues.warBucks ) {
        showToaster( "Cannot afford purchase" );
    }
    else {
        const advancementsInCartCount =
            getSelectedOption( "technologySelect" ).index +
            getSelectedOption( "doctrineSelect" ).index +
            nm('gardens').filter( c => c.checked ).length +
            nm('auctions').filter( c => c.checked ).length;
        if ( advancementsInCartCount + marketModalValues.turn.purchasedAdvancementCount > MAX_ADVANCEMENTS ) {
            showToaster( "Cannot purchase more than " + MAX_ADVANCEMENTS + " advancements" );
        }
        else if ( parseInt( id('cardCount').value ) + marketModalValues.turn.purchasedCardCount > MAX_CARDS ) {
            showToaster( "Cannot purchase more than " + MAX_CARDS + " cards" );
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
    marketModalValues.initiatives.culturalTokens +=  id('cInitTokenCount').value;
    marketModalValues.initiatives.politicalTokens += id('pInitTokenCount').value;

    const unitInputs = nm('unitCounts');
    for ( let i = 0; i < unitInputs.length; i++ ) {
        const unitInput = unitInputs[i];
        const unitTypeId = unitInput.id.split('-')[1];
        const count = unitInput.value || 0;
        addUnitGroup( count, unitTypeId, DEFAULT_TILE, marketModalValues, false );
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

    //todo 9 - assign bonuses and religion

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