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
    else if ( selectedUnits.length && isExpansionPhase() && selectedUnits.every( u => u.tileId === "unassigned" ) && !isImpassibleTile( tileId ) ) {
        moveUnits( tileId );
    }
    else if ( selectedUnits.length && isMarketPhase() && selectedUnits.every( u => u.tileId === "unassigned" ) && currentPlayer.districts.tileIds.includes( tileId ) ) {
        moveUnits( tileId );
    }
    else if ( selectedUnits.length && getAdjacentTiles( selectedUnits[0].tileId ).includes( tileId ) && hasEnemyUnits( tileId ) && !isImpassibleTile( tileId, false ) ) {
        showConfirm( "Battle", "Are you sure you want to attack this player?", function( result ) {
            if ( result ) {
                const enemyPlayer = game.players.find( p => p.units.some( u => u.tileId === tileId ) && p.id !== currentPlayer.id );
                const enemyPlayerDetails = getPlayerBattleDetails( enemyPlayer.id, disambiguateUnits( enemyPlayer.units ), tileId );
                const currentPlayerDetails = getPlayerBattleDetails( currentPlayer.id, currentPlayerDisambiguousUnits, selectedUnits[0].tileId );
                createBattle( currentPlayerDetails, enemyPlayerDetails, function() {
                    openBattleModal(
                        currentPlayerDetails,
                        enemyPlayerDetails,
                        true,
                        game.state.timeLimit,
                        function() {}
                    );
                } );
            }
        } );
    }
    else if ( game.players.find( p => p.districts.capital === tileId && p.id !== currentPlayer.id ) ) {
        openCapitalModal(
            game.players.find( p => p.districts.capital === tileId ),
            function() {} );
    }
    else {
        selectTile( tileId );
    }
    //todo 2 - need a way to kill Apostles in same tile as your units--see game.php
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
    static isAllSelected() {};
    static isTypeSelected() {};
    static highlightAll() {};
    static highlightType() {};
}

function selectAllUnits( tileSelectType ) {
    const isUnassigned = tileSelectType === "unassigned";
    const tileId = isUnassigned ? "unassigned" : selectedTile.id;
    const SelectClass = isUnassigned ? SelectUnassignedUnits : SelectTileUnits;

    if ( selectedUnits.length && SelectClass.isAllSelected() ) {
        SelectClass.highlightAll( false );
        unselectUnits();
    }
    else {
        SelectClass.highlightAll();
        selectedUnits = getDisambiguousUnitGroup( tileId );
    }
    updatePerformAbilityButton();
    clearMoveSuggestion();
}

function selectUnits( tileSelectType, unitTypeId ) {
    const isUnassigned = tileSelectType === "unassigned";
    const tileId = isUnassigned ? "unassigned" : selectedTile.id;
    const SelectClass = isUnassigned ? SelectUnassignedUnits : SelectTileUnits;

    if ( selectedUnits.length && SelectClass.isTypeSelected( unitTypeId ) ) {
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
    updatePerformAbilityButton();
    clearMoveSuggestion();
}

function selectUnitsByType( units ) {
    openUnitsModal(
        units,
        function( response ) {
            if ( response ) {
                selectedUnits = response;
                updatePerformAbilityButton();
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
        const impassableTiles = allTiles.filter( t => isImpassibleTile( t ) );
        const maxMove = Math.min( ...selectedUnits.map( u => u.movesRemaining ) );
        suggestedPath = calculateShortestNonCombatPath( rootTileId, destinationTileId, allTiles, impassableTiles, maxMove );

        highlightSuggestedTiles( suggestedPath );
    }
}

function hasEnemyUnits( tileId ) {
    const tileDetails = getTileDetails( tileId );
    return tileDetails.unitSets.filter( s => s.id !== currentPlayer.id ).some( s => s.combat );
}

function isImpassibleTile( tileId, checkCombat = true ) {
    const tileDetails = getTileDetails( tileId );
    return !tileDetails ||
        tileDetails.type === TILE_TYPES[VOLCANO].name ||
        /*( Check for Camelot ) ||*/
        ( tileDetails.type === TILE_TYPES[CAPITAL].name && tileDetails.districtPlayerId !== currentPlayer.id ) ||
        ( checkCombat && tileDetails.unitSets.filter( s => s.id !== currentPlayer.id ).some( s => s.combat ) );
}

function clearMoveSuggestion() {
    suggestedPath = [];
    highlightSuggestedTiles( null, false );
}

function moveUnits( tileId ) {
    const rootTileId = selectedUnits[0].tileId;
    const destinationTileId = tileId;

    selectedUnits.forEach( unit => {
        unit.movesRemaining -= suggestedPath.length;
        unit.tileId = destinationTileId;
    } );
    currentPlayer.units = getConsolidatedUnits();

    updateUnitIconsFromId( destinationTileId );
    selectTile( destinationTileId );
    if ( rootTileId !== "unassigned" ) {
        updateUnitIconsFromId( rootTileId );
    }
    else {
        displayUnassignedUnits();
    }

    unselectUnits();
    clearMoveSuggestion();
}