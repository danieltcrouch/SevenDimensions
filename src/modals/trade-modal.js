let tradeId;
let isPlayer1;
let currentPlayerTDetails; //todo 7 - remove "T" when modal namespace issue removed
let currentTradeDetails;
let enemyPlayerTDetails;
let enemyTradeDetails;
let tradeModalCallback;

function openTradeModal( currentPlayer, enemyPlayer, currentTradeValue, enemyTradeValue, tradeIdValue, isPlayer1Value = true, callback = function() {} ) {
    tradeId = tradeIdValue;
    isPlayer1 = isPlayer1Value;
    currentPlayerTDetails = currentPlayer;
    enemyPlayerTDetails = enemyPlayer;
    currentTradeDetails = currentTradeValue;
    enemyTradeDetails = enemyTradeValue;
    tradeModalCallback = callback;

    populatePlaceholders();
    populateUnits();
    populateAdvancements();
    populateCards();

    const isExistingTrade = Boolean(tradeId);
    show('offerButton',  !isExistingTrade );
    show('acceptButton',  isExistingTrade );
    show('counterButton', isExistingTrade );
    show('declineButton', isExistingTrade );
    showTradeDetails( isExistingTrade );

    show( "tradeModal", true, "block" );
    setCloseHandlersJS( "tradeModal" );
    blurBackground();
}

function populatePlaceholders() {
    id('currentWCount').placeholder  = currentPlayerTDetails.warBucks;
    id('currentWCount').max          = currentPlayerTDetails.warBucks;
    id('currentRACount').placeholder = getAetherCount(     currentPlayerTDetails.resources );
    id('currentRACount').max         = getAetherCount(     currentPlayerTDetails.resources );
    id('currentRCCount').placeholder = getChronotineCount( currentPlayerTDetails.resources );
    id('currentRCCount').max         = getChronotineCount( currentPlayerTDetails.resources );
    id('currentRUCount').placeholder = getUnobtaniumCount( currentPlayerTDetails.resources );
    id('currentRUCount').max         = getUnobtaniumCount( currentPlayerTDetails.resources );
    id('currentICCount').placeholder = currentPlayerTDetails.initiatives.culturalTokens;
    id('currentICCount').max         = currentPlayerTDetails.initiatives.culturalTokens;
    id('currentIPCount').placeholder = currentPlayerTDetails.initiatives.politicalTokens;
    id('currentIPCount').max         = currentPlayerTDetails.initiatives.politicalTokens;
    id('enemyWCount').placeholder    = enemyPlayerTDetails.warBucks;
    id('enemyWCount').max            = enemyPlayerTDetails.warBucks;
    id('enemyRACount').placeholder   = getAetherCount(     enemyPlayerTDetails.resources );
    id('enemyRACount').max           = getAetherCount(     enemyPlayerTDetails.resources );
    id('enemyRCCount').placeholder   = getChronotineCount( enemyPlayerTDetails.resources );
    id('enemyRCCount').max           = getChronotineCount( enemyPlayerTDetails.resources );
    id('enemyRUCount').placeholder   = getUnobtaniumCount( enemyPlayerTDetails.resources );
    id('enemyRUCount').max           = getUnobtaniumCount( enemyPlayerTDetails.resources );
    id('enemyICCount').placeholder   = enemyPlayerTDetails.initiatives.culturalTokens;
    id('enemyICCount').max           = enemyPlayerTDetails.initiatives.culturalTokens;
    id('enemyIPCount').placeholder   = enemyPlayerTDetails.initiatives.politicalTokens;
    id('enemyIPCount').max           = enemyPlayerTDetails.initiatives.politicalTokens;
}

function populateUnits() {
    const currentData = UNIT_TYPES.filter( ut => currentPlayerTDetails.units.some( u => u.unitTypeId === ut.id ) ).map( ut => ({id: ut.id, name: ut.name, max: currentPlayerTDetails.units.filter(u => u.unitTypeId === ut.id).length}) );
    populateUnitInputs( currentData, "currentUnitWrapper" );
    const enemyData = UNIT_TYPES.filter( ut => enemyPlayerTDetails.units.some( u => u.unitTypeId === ut.id ) ).map( ut => ({id: ut.id, name: ut.name, max: enemyPlayerTDetails.units.filter(u => u.unitTypeId === ut.id).length}) );
    populateUnitInputs( enemyData, "enemyUnitWrapper" );
}

function populateUnitInputs( unitTypes, wrapperId ) {
    let wrapper = id(wrapperId);
    wrapper.innerHTML = unitTypes.length ? "" : "None";
    for ( let i = 0; i < unitTypes.length; i++ ) {
        let unit = unitTypes[i];
        const id = wrapperId + "-" + unit.id;
        let div = document.createElement( "DIV" );
        let label = document.createElement( "LABEL" );
        label.htmlFor = id;
        label.style.display = "inline-block";
        label.style.width = "10em";
        label.innerText = unit.name;
        let input = document.createElement( "INPUT" );
        input.id = id;
        input.name = wrapperId + "-unitCounts";
        input.type = "number";
        input.classList.add( "input" );
        input.style.width = "3em";
        input.style.margin = ".1em";
        input.style.padding = ".1em";
        input.min = "0";
        input.max = unit.max;
        input.placeholder = unit.max;
        div.appendChild( label );
        div.appendChild( input );
        wrapper.appendChild( div );
    }
}

function populateAdvancements() {
    const currentData = currentPlayerTDetails.advancements.technologies.map( a => getTechnology( a ) )
        .concat( currentPlayerTDetails.advancements.doctrines.map( a => getDoctrine( a ) ) )
        .concat( currentPlayerTDetails.advancements.gardens.map( a => getGarden( a ) ) )
        .concat( currentPlayerTDetails.advancements.auctions.map( a => getAuctionLot( a ) ) );
    populateCheckboxes( currentData, "currentAdvancementWrapper" );
    const enemyData = enemyPlayerTDetails.advancements.technologies.map( a => getTechnology( a ) )
        .concat( enemyPlayerTDetails.advancements.doctrines.map( a => getDoctrine( a ) ) )
        .concat( enemyPlayerTDetails.advancements.gardens.map( a => getGarden( a ) ) )
        .concat( enemyPlayerTDetails.advancements.auctions.map( a => getAuctionLot( a ) ) );
    populateCheckboxes( enemyData, "enemyAdvancementWrapper" );
}

function populateCards() {
    populateCheckboxes( currentPlayerTDetails.cards.chaos.map( c => getChaosCard( c ) ), "currentCardsWrapper" );

    id('enemyCardCount').placeholder = enemyPlayerTDetails.cards.chaos.length;
    id('enemyCardCount').max         = enemyPlayerTDetails.cards.chaos.length;
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
        let label = document.createElement( "LABEL" );
        label.htmlFor = id;
        label.innerHTML = data[i].name;
        div.appendChild( input );
        div.appendChild( label );
        wrapper.appendChild( div );
    }
}

function showTradeDetails( isExistingTrade ) {
    if ( isExistingTrade ) {
        id('currentWCount').value = currentTradeDetails.warBucks;
        id('currentRUCount').value = currentTradeDetails.resources.find( r => r.id === RESOURCES[0].id ).count || null;
        id('currentRCCount').value = currentTradeDetails.resources.find( r => r.id === RESOURCES[1].id ).count || null;
        id('currentRACount').value = currentTradeDetails.resources.find( r => r.id === RESOURCES[2].id ).count || null;
        id('currentICCount').value = currentTradeDetails.culturalTokens  || null;
        id('currentIPCount').value = currentTradeDetails.politicalTokens || null;
        currentTradeDetails.units.filter( u => u.count ).forEach( u => id(`currentUnitWrapper-${u.id}`).value = u.count );
        currentTradeDetails.advancements.technologies.forEach( a => id(`currentAdvancementWrapper-Technology-${a}` ).checked = true );
        currentTradeDetails.advancements.doctrines.forEach(    a => id(`currentAdvancementWrapper-Doctrine-${a}`   ).checked = true );
        currentTradeDetails.advancements.gardens.forEach(      a => id(`currentAdvancementWrapper-Garden-${a}`     ).checked = true );
        currentTradeDetails.advancements.auctions.forEach(     a => id(`currentAdvancementWrapper-Auction Lot-${a}`).checked = true );
        currentTradeDetails.chaos.forEach( c => id(`currentCardsWrapper-Chaos-${c}`).checked = true );

        id('enemyWCount').value = enemyTradeDetails.warBucks;
        id('enemyRUCount').value = enemyTradeDetails.resources.find( r => r.id === RESOURCES[0].id ).count || null;
        id('enemyRCCount').value = enemyTradeDetails.resources.find( r => r.id === RESOURCES[1].id ).count || null;
        id('enemyRACount').value = enemyTradeDetails.resources.find( r => r.id === RESOURCES[2].id ).count || null;
        id('enemyICCount').value = enemyTradeDetails.culturalTokens  || null;
        id('enemyIPCount').value = enemyTradeDetails.politicalTokens || null;
        enemyTradeDetails.units.filter( u => u.count ).forEach( u => id(`enemyUnitWrapper-${u.id}`).value = u.count );
        enemyTradeDetails.advancements.technologies.forEach( a => id(`enemyAdvancementWrapper-Technology-${a}` ).checked = true );
        enemyTradeDetails.advancements.doctrines.forEach(    a => id(`enemyAdvancementWrapper-Doctrine-${a}`   ).checked = true );
        enemyTradeDetails.advancements.gardens.forEach(      a => id(`enemyAdvancementWrapper-Garden-${a}`     ).checked = true );
        enemyTradeDetails.advancements.auctions.forEach(     a => id(`enemyAdvancementWrapper-Auction Lot-${a}`).checked = true );
        id(`enemyCardCount`).value = enemyTradeDetails.chaos.length || null;
    }
}

function updateDetails() {
    currentTradeDetails = {
        id:                 currentPlayerTDetails.id,
        warBucks:           parseInt( id('currentWCount').value || 0 ),
        resources:          [
            {id: RESOURCES[0].id, count: parseInt( id('currentRUCount').value || 0 )},
            {id: RESOURCES[1].id, count: parseInt( id('currentRCCount').value || 0 )},
            {id: RESOURCES[2].id, count: parseInt( id('currentRACount').value || 0 )}
        ],
        culturalTokens:     parseInt( id('currentICCount').value || 0 ),
        politicalTokens:    parseInt( id('currentIPCount').value || 0 ),
        units:              nm('currentUnitWrapper-unitCounts').map( ui => ({id: ui.id.split('-')[1], count: (ui.value || 0)}) ),
        advancements: {
            technologies:       nm('currentAdvancementWrapper').filter( a => a.id.split('-')[1] === TECHNOLOGIES[0].type ).filter( a => a.checked ).map( a => a.id.split('-')[2] ),
            doctrines:          nm('currentAdvancementWrapper').filter( a => a.id.split('-')[1] === DOCTRINES[0].type    ).filter( a => a.checked ).map( a => a.id.split('-')[2] ),
            gardens:            nm('currentAdvancementWrapper').filter( a => a.id.split('-')[1] === GARDENS[0].type      ).filter( a => a.checked ).map( a => a.id.split('-')[2] ),
            auctions:           nm('currentAdvancementWrapper').filter( a => a.id.split('-')[1] === AUCTIONS[0].type     ).filter( a => a.checked ).map( a => a.id.split('-')[2] )
        },
        chaos:              nm('currentCardsWrapper').filter( c => c.checked ).map( c => c.id.split('-')[2] )
    };
    enemyTradeDetails = {
        id:                 enemyPlayerTDetails.id,
        warBucks:           parseInt( id('enemyWCount').value || 0 ),
        resources:          [
            {id: RESOURCES[0].id, count: parseInt( id('enemyRUCount').value || 0 )},
            {id: RESOURCES[1].id, count: parseInt( id('enemyRCCount').value || 0 )},
            {id: RESOURCES[2].id, count: parseInt( id('enemyRACount').value || 0 )}
        ],
        culturalTokens:     parseInt( id('enemyICCount').value || 0 ),
        politicalTokens:    parseInt( id('enemyIPCount').value || 0 ),
        units:              nm('enemyUnitWrapper-unitCounts').map( ui => ({id: ui.id.split('-')[1], count: (ui.value || 0)}) ),
        advancements: {
            technologies: nm('enemyAdvancementWrapper').filter( a => a.id.split('-')[1] === TECHNOLOGIES[0].type ).filter( a => a.checked ).map( a => a.id.split('-')[2] ),
            doctrines:    nm('enemyAdvancementWrapper').filter( a => a.id.split('-')[1] === DOCTRINES[0].type    ).filter( a => a.checked ).map( a => a.id.split('-')[2] ),
            gardens:      nm('enemyAdvancementWrapper').filter( a => a.id.split('-')[1] === GARDENS[0].type      ).filter( a => a.checked ).map( a => a.id.split('-')[2] ),
            auctions:     nm('enemyAdvancementWrapper').filter( a => a.id.split('-')[1] === AUCTIONS[0].type     ).filter( a => a.checked ).map( a => a.id.split('-')[2] )
        },
        chaos:              updateEnemyCardDetails()
    };
}

function updateEnemyCardDetails() {
    const cardCount = Math.min( parseInt( id('enemyCardCount').value || 0 ), enemyPlayerTDetails.cards.chaos.length );
    let result = enemyTradeDetails ? enemyTradeDetails.cards : [];
    if ( result.length < cardCount ) {
        const availableCards = enemyPlayerTDetails.cards.chaos.filter( c => !result.includes( c ) );
        for ( let i = 0; i < (cardCount - result.length); i++ ) {
            result.push( availableCards[i] );
        }
    }
    return result;
}

function validateOffer() {
    updateDetails();
    const trade = {
        details1: isPlayer1?currentTradeDetails:enemyTradeDetails,
        details2: isPlayer1?enemyTradeDetails:currentTradeDetails
    }

    let isValid = true;
    if ( !isTradeValid( currentPlayerTDetails, trade ) ) {
        isValid = false;
        showToaster( "Your trade details are invalid" );
    }
    else if ( !isTradeValid( enemyPlayerTDetails, trade ) ) {
        isValid = false;
        showToaster( "The other player’s trade details are invalid" );
    }
    else if ( !validateReception( currentPlayerTDetails, enemyTradeDetails, true ) ) {
        isValid = false;
    }
    else if ( !validateReception( enemyPlayerTDetails, currentTradeDetails, false ) ) {
        isValid = false;
    }

    return isValid;
}

function acceptTrade() {
    if ( validateOffer() ) {
        const selectedCards = nm('currentCardsWrapper').map( c => c.id.split('-')[2] );
        if ( selectedCards.length >= currentTradeDetails.chaos.length ) {
            currentTradeDetails.chaos = selectedCards.slice( 0, currentTradeDetails.chaos.length );
        }

        debitTrade( currentPlayerTDetails, currentTradeDetails );

        saveAccept( tradeId, (isPlayer1?currentTradeDetails:enemyTradeDetails), (isPlayer1?enemyPlayerTDetails:currentTradeDetails), isPlayer1 );
        tradeModalCallback = function( currentPlayerDetailsValue ) {
            currentPlayer = currentPlayerDetailsValue;
            reloadPage( true );
            showMessage( "Warning", "Your half of the trade has been debited from you.<br/>Before the trade can fully go through, the other player must ensure that they did not trade away their offer. Do not end your turn until the trade has gone all the way through." );
        }
        closeOutTradeModal();
    }
}

function declineTrade() {
    saveDecline( tradeId, isPlayer1 );
    closeOutTradeModal();
}

function counterTrade() {
    if ( validateOffer() ) {
        saveOffer( tradeId, (isPlayer1?currentTradeDetails:enemyTradeDetails), (isPlayer1?enemyPlayerTDetails:currentPlayerTDetails), isPlayer1 );
        closeOutTradeModal();
    }
}

function submitTrade() {
    if ( validateOffer() ) {
        createTrade( currentTradeDetails, enemyTradeDetails );
        closeOutTradeModal();
    }
}

function closeOutTradeModal() {
    closeModalJS( "tradeModal" );
    tradeModalCallback( currentPlayerTDetails, enemyPlayerTDetails );
}