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
        const canMove = isExpansionSubPhase() && us.id === currentPlayer.id && currentPlayer.special.exhaust !== tileId;
        const spanTitleAttributes = canMove ? " id='units-all-selected' class='link' onclick='selectAllUnits(\"selected\")'" : "";
        tileUnitsHTML += `<div><span${spanTitleAttributes}>Units (${player.username}): </span></div>`;

        const units = canMove ? us.units : getConsolidatedUnitsByType( us.units );
        for ( let i = 0; i < units.length; i++ ) {
            const unit = units[i];
            const spanUnitAttributes = canMove ? ` id='units-se-${unit.id}' class='link' onclick='selectUnits("selected","${unit.id}")'` : "";
            const unitDisplay = getUnitDisplayName( unit.unitTypeId, us.id, unit.count );
            const movesRemaining = canMove ? ` (Moves: ${unit.movesRemaining})` : "";
            tileUnitsHTML += `<div style='padding-left: 1em'><span${spanUnitAttributes}>${unitDisplay}${movesRemaining}</span></div>\n`;
        }
    } );
    id('tileUnits').innerHTML = tileUnitsHTML;
}

function showTileDetails( isShow = true ) {
    show( 'tileDetailsContents', isShow );
    show( 'tileDetailsNoContents', !isShow );
}


/*** UNIT SELECTION ***/


function updateExpansionButtons() {
    show( 'ability', isExpansionSubPhase() );
    show( 'annex', isExpansionSubPhase() );

    if ( selectedUnits.length === 1 ) {
        id('ability').classList.remove( "staticInverseButton" );
    }
    else {
        id('ability').classList.add( "staticInverseButton" );
    }

    if ( selectedTile && selectedUnits.length === 0 && currentPlayer.initiatives.politicalTokens > 0 ) {
        id('annex').classList.remove( "staticInverseButton" );
    }
    else {
        id('annex').classList.add( "staticInverseButton" );
    }
}

class SelectTileUnits extends SelectUnits {
    static isAllSelected() {
        return id('units-all-selected').style.background === "lightgray";
    }

    static isUnitSelected( unitId ) {
        return id(`units-se-${unitId}`).style.background === "lightgray";
    }

    static highlightAll( highlight = true ) {
        id('units-all-selected').style.background = highlight ? "lightgray" : "";
        document.querySelectorAll( '*[id^="units-se-"]' ).forEach( s => s.style.background = (highlight ? "lightgray" : "") );
    }

    static highlightUnit( unitId, highlight = true ) {
        return id(`units-se-${unitId}`).style.background = highlight ? "lightgray" : "";
    }
}