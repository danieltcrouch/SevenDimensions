let selectedTile;
let selectedUnits = [];
let suggestedPath = [];

/*** SELECT TILE ***/


function tileHoverCallback( tileId ) {
    if ( isExpansionPhase() && selectedUnits.length ) {
        moveSuggestion( tileId );
    }
}

function tileClickCallback( tileId ) {
    if ( selectedUnits.length && ( isExpansionPhase() && suggestedPath.includes( tileId ) ) ) {
        moveUnits( tileId );
    }
    else if ( selectedUnits.length && selectedUnits.every( u => u.tileId === "unassigned" ) ) {
        moveUnits( tileId );
    }
    else {
        selectTile( tileId );
    }
}

function selectTile( tileId ) {
    const isTileChange = !selectedTile || selectedTile.id !== tileId;
    selectedTile = game.map.find( t => t.id === tileId );

    highlightSelectedTile( tileId );
    displayTileDetails( tileId );
    if ( isExpansionPhase() && isTileChange ) {
        unselectUnits();
        clearMoveSuggestion();
    }
}

function clearSelectedTile() {
    selectedTile = null;

    highlightSelectedTile( null, false );
    showTileDetails( false );

    unselectUnits();
    clearMoveSuggestion();
}


/*** SELECT UNIT ***/


class SelectUnits {
    static isAllSelected();
    static isTypeSelected();
    static highlightAll();
    static highlightType();
}

function selectAllUnits( tileSelectType ) {
    const isUnassigned = tileSelectType === "unassigned";
    const tileId = isUnassigned ? "unassigned" : selectedTile.id;
    const SelectClass = isUnassigned ? SelectUnassignedUnits : SelectTileUnits;

    const isAllCurrentlySelected = SelectClass.isAllSelected();
    if ( selectedUnits.length && isAllCurrentlySelected ) {
        SelectClass.highlightAll( false );
        unselectUnits();
    }
    else {
        SelectClass.highlightAll();
        selectedUnits = getDisambiguousUnitGroup( tileId );
    }
    clearMoveSuggestion();
}

function selectUnits( tileSelectType, unitTypeId ) {
    const isUnassigned = tileSelectType === "unassigned";
    const tileId = isUnassigned ? "unassigned" : selectedTile.id;
    const SelectClass = isUnassigned ? SelectUnassignedUnits : SelectTileUnits;

    const isUnitTypeCurrentlyIncluded = SelectClass.isTypeSelected( unitTypeId );
    if ( selectedUnits.length && isUnitTypeCurrentlyIncluded ) {
        SelectClass.highlightType( unitTypeId, false );
        selectedUnits = selectedUnits.filter( u => u.unitType.id !== unitTypeId );
        if ( !selectedUnits.length ) {
            SelectClass.highlightAll( false );
            unselectUnits();
        }
    }
    else {
        SelectClass.highlightType( unitTypeId );
        const unitsInTile = getDisambiguousUnitGroup( tileId, unitTypeId );
        if ( unitsInTile.length > 1 ) {
            selectUnitsByType( unitsInTile );
        }
        else {
            selectedUnits = selectedUnits.concat( unitsInTile );
        }
    }
    clearMoveSuggestion();
}

function selectUnitsByType( units ) {
    openUnitsModal(
        units,
        function( response ) {
            if ( response ) {
                selectedUnits = selectedUnits.concat( units );
            }
        }
    );
}

function unselectUnits() {
    selectedUnits = [];
}


/*** MOVE TILE ***/


function moveSuggestion( tileId ) {
    if ( isExpansionPhase() && selectedUnits.length ) {
        highlightSuggestedTiles( null, false );

        const rootTileId = selectedTile.id;
        const destinationTileId = tileId;
        const allTiles = game.map.map( t => t.id );
        const impassableTiles = allTiles.filter( t => {
            const tileDetails = getTileDetails( t );
            return tileDetails.type === TILE_TYPES[VOLCANO].name ||
                (tileDetails.type === TILE_TYPES[CAPITAL].name && tileDetails.districtPlayerId !== currentPlayer.id ) ||
                tileDetails.unitSets.filter( s => s.id !== currentPlayer.id ).some( s => s.combat );
        } );
        const maxMove = Math.min( ...selectedUnits.map( u => u.movesRemaining ) );
        suggestedPath = calculateShortestNonCombatPath( rootTileId, destinationTileId, allTiles, impassableTiles, maxMove );

        highlightSuggestedTiles( suggestedPath );
    }
}

function clearMoveSuggestion() {
    suggestedPath = [];
    highlightSuggestedTiles( null, false );
}

function moveUnits( tileId ) {
    const rootTileId = selectedTile ? selectedTile.id : "unassigned";
    const destinationTileId = tileId;

    selectedUnits.forEach( unit => {
        unit.movesRemaining -= suggestedPath.length;
        unit.tileId = destinationTileId;
        currentPlayer.units = getConsolidatedUnits();
    } );

    updateUnitIconsFromId( destinationTileId );
    if ( rootTileId !== "unassigned" ) {
        updateUnitIconsFromId( rootTileId );
        selectTile( rootTileId );
    }
    else {
        displayUnassignedUnits();
    }

    unselectUnits();
    clearMoveSuggestion();
}