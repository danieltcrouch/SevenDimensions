/*** VIEW ***/


function viewVP() {
    const insurrectionPlayerId = getInsurrectionVictim();
    const isHighPriestActive = currentPlayer.cards.offices.includes( "0" ) || currentPlayer.selects.highPriestVictim;
    let message =
        `<div><span style='font-weight: bold'>Victory Points Total:</span> ${id('victoryPointsValue').innerText}</div>
         <div>Districts: ${currentPlayer.districts.tileIds.length}</div>
         <div>Dimensions: ${currentPlayer.dimensions.length}</div>
         <div>Wonders: ${(currentPlayer.dimensions.filter( d => !!d.wonderTileId ).length * 2)}</div>
         <div>Hero: ${(hasHero( currentPlayer.units ) ? "1" : "0")}</div>
         <div>Chaos Cards: ${currentPlayer.cards.chaos.filter( c => isHeavensGate( c ) ).length}</div>`;
    if ( isHighPriestActive ) {
        message += `<div>High Priest: ${currentPlayer.cards.offices.includes( "0" ) ? "1" : ( currentPlayer.selects.highPriestVictim ? "-1" : "0" )}</div>`;
    }
    if ( insurrectionPlayerId && insurrectionPlayerId === currentPlayer.id ) {
        message += "<div>Insurrection Event: -1</div>";
    }
    showMessage( "Victory Points", message );
}

function viewWB() {
    const resourceDisplay = currentPlayer.resources.map( r => r.count + " " + getResource(r.id).name + (r.count > 1 ? "s" : "") ).join("<br/>");
    const message =
        `<div>War-Bucks: ${currentPlayer.warBucks}</div>
         <div style='font-weight: bold; margin-top: 1em'>Resources</div>
        ${(resourceDisplay || "None")}`;
    showMessage( "War-Bucks", message );
}

function viewTechnologies() {
    //todo 8 - table poorly formatted on phone
    let message = getAdvancementTable(
        TECHNOLOGIES,
        currentPlayer.advancements.technologies,
        Technology.getCostDisplay
    );
    showMessage( "Technologies", message, {padding: ".5em 20%"} );
}

function viewDoctrines() {
    let message = getAdvancementTable(
        DOCTRINES,
        currentPlayer.advancements.doctrines,
        Doctrine.getCostDisplay
    );
    showMessage( "Doctrines", message, {padding: ".5em 20%"} );
}

function viewGardens() {
    let message = getAdvancementTable(
        GARDENS,
        currentPlayer.advancements.gardens,
        function( item ) { return item.getCostOrLocked( currentPlayer.districts.tileIds.length ); }
    );
    message += "<div style='margin-top: .5em'>(Cost calculated by 7WB times the number of districts; must have at least 2 districts.)</div>";
    showMessage( "Gardens", message, {padding: ".5em 20%"} );
}

function viewAuctions() {
    let message = getAdvancementTable(
        AUCTIONS,
        currentPlayer.advancements.auctions,
        function( item ) { return item.getCostOrLocked( game.players ); }
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

function viewInitiatives() {
    const message =
        `<div>Political Initiative Tokens: ${currentPlayer.initiatives.politicalTokens}</div>
         <div>Cultural Initiative Tokens: ${currentPlayer.initiatives.culturalTokens}</div>`;
    showMessage( "Initiative Tokens", message );
}

function viewCards() {
    let message = getCardTable(
        CHAOS,
        currentPlayer.cards.chaos
    );
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
    resultHTML += "</tbody></table>";
    return resultHTML;
}


/*** UNASSIGNED UNITS ***/


function displayUnassignedUnits() {
    const unassignedUnits = currentPlayer.units.filter( u => u.tileId === "unassigned" );
    if ( unassignedUnits.length ) {
        let unitsHTML = "";
        for ( let i = 0; i < unassignedUnits.length; i++ ) {
            const unit = unassignedUnits[i];
            const unitDisplay = getUnitDisplayName( unit.id, unit.count, currentPlayer.id );
            unitsHTML += `<div style='padding-left: 1em'><span id='units-un-${unit.id}' class='link' onclick='selectUnits("unassigned","${unit.id}")'>${unitDisplay}</span></div>\n`;
        }
        id('unassignedUnitsValue').innerHTML = unitsHTML;
        show( 'unassignedUnits' );
    }
    else {
        hide('unassignedUnits');
    }
}

/*** UNIT SELECTION ***/


class SelectUnassignedUnits extends SelectUnits {
    static isAllSelected() {
        return id('units-all-unassigned').style.background === "lightgray";
    }

    static isTypeSelected( unitTypeId ) {
        return id(`units-un-${unitTypeId}-1`).style.background === "lightgray";
    }

    static highlightAll( highlight = true ) {
        id('units-all-unassigned').style.background = highlight ? "lightgray" : "";
        document.querySelectorAll( '*[id^="units-un-"]' ).forEach( s => s.style.background = (highlight ? "lightgray" : "") );
    }

    static highlightType( unitTypeId, highlight = true ) {
        return id(`units-un-${unitTypeId}-1`).style.background = highlight ? "lightgray" : "";
    }
}