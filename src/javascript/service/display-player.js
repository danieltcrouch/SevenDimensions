/*** VIEW ***/


function populatePlayerDisplay( player = currentPlayer, idSuffix = "" ) {
    id('factionName' + idSuffix).innerText = getFaction( player.factionId ).name;
    id('victoryPointsValue' + idSuffix).innerText      = calculateVP( player ) + "";
    id('warBucksValue' + idSuffix).innerText           = player.warBucks + "";
    id('technologiesValue' + idSuffix).innerText       = player.advancements.technologies.length + "/" + TECHNOLOGIES.length;
    id('doctrinesValue' + idSuffix).innerText          = player.advancements.doctrines.length    + "/" + DOCTRINES.length;
    id('gardensValue' + idSuffix).innerText            = player.advancements.gardens.length      + "/" + GARDENS.length;
    id('auctionLotsValue' + idSuffix).innerText        = player.advancements.auctions.length     + "/" + AUCTIONS.length;
    id('initiativeTokensValue' + idSuffix).innerText   = ( player.initiatives.politicalTokens + player.initiatives.culturalTokens ) + "";
    id('chaosCardsValue' + idSuffix).innerText         = player.cards.chaos.length + "";
}

function viewVP( player = currentPlayer ) {
    let message =
        `<div><span style='font-weight: bold'>Victory Points Total:</span> ${id('victoryPointsValue').innerText}</div>
         <div>Districts: ${player.districts.tileIds.length}</div>
         <div>Dimensions: ${player.dimensions.length}</div>
         <div>Wonders: ${(player.dimensions.filter( d => Boolean( d.wonderTileId ) ).length * 2)}</div>
         <div>Hero: ${(hasHero( player.units ) ? "1" : "0")}</div>
         <div>Chaos Cards: ${player.cards.chaos.filter( c => isHeavensGate( c ) ).length}</div>`;
    if ( player.special.highPriestReward || player.special.highPriestVictim ) {
        message += `<div>High Priest: ${player.special.highPriestReward ? "1" : "-1"}</div>`;
    }
    if ( player.special.insurrection ) {
        message += "<div>Insurrection Event: -1</div>";
    }
    showMessage( "Victory Points", message );
}

function viewWB( player = currentPlayer ) {
    const resourceDisplay = player.resources.map( r => r.count + " " + getResource(r.id).name + (r.count > 1 ? "s" : "") ).join("<br/>");
    const message =
        `<div>War-Bucks: ${player.warBucks}</div>
         <div style='font-weight: bold; margin-top: 1em'>Resources</div>
        ${(resourceDisplay || "None")}`;
    showMessage( "War-Bucks", message );
}

function viewTechnologies( player = currentPlayer ) {
    //todo 8 - table poorly formatted on phone
    let message = getAdvancementTable(
        TECHNOLOGIES,
        player.advancements.technologies,
        function( item ) { return Purchasable.displayCost( item.defaultCost() ); }
    );
    showMessage( "Technologies", message, {padding: ".5em 20%"} );
}

function viewDoctrines( player = currentPlayer ) {
    let message = getAdvancementTable(
        DOCTRINES,
        player.advancements.doctrines,
        function( item ) { return Purchasable.displayCost( item.defaultCost() ); }
    );
    showMessage( "Doctrines", message, {padding: ".5em 20%"} );
}

function viewGardens( player = currentPlayer ) {
    let message = getAdvancementTable(
        GARDENS,
        player.advancements.gardens,
        function( item ) { return item.getCostOrLocked( player.districts.tileIds.length, hasTechnology( BIODOMES, player ), getEdenCount() ); }
    );
    message += "<div style='margin-top: .5em'>(Cost calculated by 7WB times the number of districts; must have at least 2 districts.)</div>";
    showMessage( "Gardens", message, {padding: ".5em 20%"} );
}

function viewAuctions( player = currentPlayer ) {
    let message = getAdvancementTable(
        AUCTIONS,
        player.advancements.auctions,
        function( item ) { return item.getCostOrLocked( game.players, getEdenCount() ); }
    );
    showMessage( "Auction Lots", message, {padding: ".5em 20%"} );
}

function getAdvancementTable( data, userData, costFunction ) {
    let resultHTML = "<table class='advancements'><tbody>";
    for ( let i = 0; i < data.length; i++ ) {
        const item = data[i];
        const ownedClass = ( userData.some( id => id === item.id ) ) ? "owned" : "";
        resultHTML +=
            `<tr class='${ownedClass}'><td>${item.name}</td>
             <td>${item.description}</td>
             <td>${costFunction( item )}</td></tr>`;
    }
    resultHTML += "</tbody></table>";
    return resultHTML;
}

function viewInitiatives( player = currentPlayer ) {
    const message =
        `<div>Political Initiative Tokens: ${player.initiatives.politicalTokens}</div>
         <div>Cultural Initiative Tokens: ${player.initiatives.culturalTokens}</div>`;
    showMessage( "Initiative Tokens", message );
}

function viewCards( player = currentPlayer ) {
    let message = player.cards.chaos.length + " Cards";
    if ( player.id === currentPlayer.id ) {
        message = getCardTable(
            CHAOS,
            player.cards.chaos
        );
    }
    showMessage( "Cards", message, {padding: ".5em 20%"} );
}

function getCardTable( data, userData ) {
    let resultHTML = "<table class='advancements'><tbody>";
    for ( let i = 0; i < data.length; i++ ) {
        const item = data[i];
        if ( userData.includes( item.id ) ) {
            resultHTML +=
                `<tr><td>${item.name}</td>
                 <td>${item.description}</td></tr>`;
        }
    }
    if ( !userData.length ) {
        resultHTML += "<tr><td></td><td>There are no cards to display.</td></tr>"
    }
    resultHTML += "</tbody></table>";
    return resultHTML;
}


/*** UNASSIGNED ***/


function displayUnassignedAssets() {
    if ( !isCouncilPhase() ) {
        displayUnassignedUnits();
        displayUnassignedWonders();
        displayUnassignedAdvancements();
        displayUnassignedInitiatives();
    }
    else {
        hide('unassignedUnits');
        hide('unassignedWonders');
        hide('unassignedAdvancements');
        hide('unassignedInitiatives');
    }
}

function displayUnassignedUnits() {
    const unassignedUnits = currentPlayer.units.filter( u => u.tileId === DEFAULT_TILE );
    if ( unassignedUnits.length ) {
        let unitsHTML = "";
        for ( let i = 0; i < unassignedUnits.length; i++ ) {
            const unit = unassignedUnits[i];
            const unitDisplay = getUnitDisplayName( unit.unitTypeId, currentPlayer.id );
            unitsHTML += `<div style='padding-left: 1em'><span id='units-un-${unit.id}' class='link' onclick='selectUnits("${DEFAULT_TILE}","${unit.id}")'>${unitDisplay}</span></div>\n`;
        }
        id('unassignedUnitsValue').innerHTML = unitsHTML;
        show( 'unassignedUnits' );
    }
    else {
        hide('unassignedUnits');
    }
}

function displayUnassignedWonders() {
    const unassignedWonders = currentPlayer.dimensions.filter( d => d.wonderTileId === DEFAULT_TILE );
    if ( unassignedWonders.length ) {
        let wondersHTML = "";
        for ( let i = 0; i < unassignedWonders.length; i++ ) {
            const wonder = unassignedWonders[i];
            wondersHTML += `<div style='padding-left: 1em'><span id='wonders-un-${wonder.id}' class='link' onclick='selectWonder("${wonder.id}")'>${wonder.name}</span></div>\n`;
        }
        id('unassignedWondersValue').innerHTML = wondersHTML;
        show( 'unassignedWonders' );
    }
    else {
        hide('unassignedWonders');
    }
}

function selectWonder( wonderId ) {
    setSpecialAction(
        function( tileId ) { return currentPlayer.districts.tileIds.includes( tileId ) && !currentPlayer.dimensions.map( d => d.wonderTileId ).includes( tileId ); },
        function( tileId ) {
            const dimensionId = getWonder( wonderId ).getDimensionId();
            currentPlayer.dimensions.find( d => d.id === dimensionId ).wonderTileId = tileId;
            displayUnassignedWonders();
            updateWonderIcons( tileId, wonderId );
        }
    );
}

function displayUnassignedAdvancements() {
    show('unassignedAdvancements', currentPlayer.special.free.technologiesOrDoctrines );
}

function displayUnassignedInitiatives() {
    show('unassignedInitiatives', currentPlayer.special.free.initiativeTokens );
}

/*** UNIT SELECTION ***/


class SelectUnassignedUnits extends SelectUnits {
    static isAllSelected() {
        return id('units-all-unassigned').style.background === "lightgray";
    }

    static isUnitSelected( unitId ) {
        return id(`units-un-${unitId}`).style.background === "lightgray";
    }

    static highlightAll( highlight = true ) {
        id('units-all-unassigned').style.background = highlight ? "lightgray" : "";
        document.querySelectorAll( '*[id^="units-un-"]' ).forEach( s => s.style.background = (highlight ? "lightgray" : "") );
    }

    static highlightUnit( unitId, highlight = true ) {
        return id(`units-un-${unitId}`).style.background = highlight ? "lightgray" : "";
    }
}