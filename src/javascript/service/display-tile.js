function displayTileDetails( tileId ) {
    showTileDetails();

    const tileDetails = getTileDetails( tileId );
    id('tileTypeValue').innerText = tileDetails.type;
    id('tilePopulationValue').innerText = tileDetails.population;
    show( 'tileDistrict', tileDetails.districtPlayerId );
    id('tileDistrictValue').innerText = tileDetails.districtPlayerId ? getPlayer( tileDetails.districtPlayerId ).username : "";
    show( 'tileCR', tileDetails.culturalInitiatives );
    id('tileCRValue').innerText = tileDetails.culturalInitiatives + " Reaper(s)";

    let tileUnitsHTML = "";
    show( 'tileUnits', tileDetails.unitSets.length );
    tileDetails.unitSets.forEach( us => {
        const player = getPlayer( us.id );
        const isExpansionPlayer = isExpansionPhase() && us.id === currentPlayer.id;
        const spanTitleAttributes = isExpansionPlayer ? " id='units-all-selected' class='link' onclick='selectAllUnits(\"selected\")'" : "";
        tileUnitsHTML += `<div><span${spanTitleAttributes}>Units (${player.username}): </span></div>`;

        const units = isExpansionPlayer ? getConsolidatedUnits().filter( u => u.tileId === tileId ) : us.units;
        for ( let i = 0; i < units.length; i++ ) {
            const unit = units[i];
            const spanUnitAttributes = isExpansionPlayer ? ` id='units-${unit.id}' class='link' onclick='selectUnits("selected","${unit.id}")'` : "";
            const unitDisplay = getUnitDisplayName( unit.id, unit.count, us.id );
            tileUnitsHTML += `<div style='padding-left: 1em'><span${spanUnitAttributes}>${unitDisplay}</span></div>\n`;
        }
    } );
    id('tileUnits').innerHTML = tileUnitsHTML;
}

function showTileDetails( isShow = true ) {
    show( 'tileDetailsContents', isShow );
    show( 'tileDetailsNoContents', !isShow );
}


/*** UNIT SELECTION ***/


class SelectTileUnits extends SelectUnits {
    static isAllSelected() {
        return id('units-all-selected').style.background === "lightgray";
    }

    static isTypeSelected( unitTypeId, movesRemaining ) {
        return id(`units-${unitTypeId}-${movesRemaining}`).style.background === "lightgray";
    }

    static highlightAll( highlight = true ) {
        id('units-all-selected').style.background = highlight ? "lightgray" : "";
        document.querySelectorAll( '*[id^="units-un-"]' ).forEach( s => s.style.background = (highlight ? "lightgray" : "") );
    }

    static highlightType( unitTypeId, movesRemaining, highlight = true ) {
        return id(`units-${unitTypeId}-${movesRemaining}`).style.background = highlight ? "lightgray" : "";
    }
}