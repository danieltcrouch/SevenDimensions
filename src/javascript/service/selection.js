let selectedTile;
let selectedUnits = [];
let suggestedPath = [];
let specialAction;

/*** SELECT TILE ***/


function tileHoverCallback( tileId ) {
    if ( specialAction ) {
        specialSuggestion( tileId );
        //todo X - special animation for these actions
    }
    else if ( isExpansionSubPhase() && selectedUnits.length ) {
        moveSuggestion( tileId );
    }
    //todo X - special "X" animation for attacking
}

function tileClickCallback( tileId ) {
    //todo X - some of these checks below could be abstracted to constants at the top of the file? Or is that to much less efficient?
    if ( specialAction && specialAction.isValidTile( tileId ) ) {
        specialAction.callback( tileId );
        specialAction = null;
    }
    else if ( selectedUnits.length &&  (
            ( isExpansionSubPhase() && ( suggestedPath.includes( tileId ) || (selectedUnits.every( u => u.tileId === "unassigned" ) && !isImpassibleTile( tileId, !hasTechnology( ADAPTIVE_MAPPING ) )) ) ) ||
            ( isMarketPhase() && selectedUnits.every( u => u.tileId === "unassigned" ) && currentPlayer.districts.tileIds.includes( tileId ) )
        ) ) {
        moveUnits( tileId );
    }
    else if ( selectedUnits.length && getAdjacentTiles( selectedUnits[0].tileId, true, !hasTechnology( ADAPTIVE_MAPPING ) ).includes( tileId ) && hasEnemyUnits( tileId ) ) {
        showConfirm( "Battle", "Are you sure you want to attack this player?", function( result ) {
            if ( result ) {
                launchBattle( tileId );
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
}

function selectTile( tileId ) {
    const isTileChange = !selectedTile || selectedTile.id !== tileId;
    selectedTile = game.board.find( t => t.id === tileId );

    highlightSelectedTile( tileId );
    displayTileDetails( tileId );
    if ( isExpansionSubPhase() && isTileChange ) {
        unselectUnits();
        clearMoveSuggestion();
        updateExpansionButtons();
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
    static isUnitSelected() {};
    static highlightAll() {};
    static highlightUnit() {};
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
        selectedUnits = currentPlayer.units.filter( u => u.tileId === tileId );
    }
    updateExpansionButtons();
    clearMoveSuggestion();
}

function selectUnits( tileSelectType, unitId ) {
    const isUnassigned = tileSelectType === "unassigned";
    const SelectClass = isUnassigned ? SelectUnassignedUnits : SelectTileUnits;

    if ( selectedUnits.length && SelectClass.isUnitSelected( unitId ) ) {
        SelectClass.highlightUnit( unitId, false );
        selectedUnits = selectedUnits.filter( u => u.id !== unitId );
        if ( !selectedUnits.length ) {
            SelectClass.highlightAll( false );
            unselectUnits();
        }
        //todo X - not working properly (I unselected all units but it still thought there was one)
    }
    else {
        SelectClass.highlightUnit( unitId );
        selectedUnits = selectedUnits.concat( currentPlayer.units.filter( u => u.id === unitId ) );
    }
    updateExpansionButtons();
    clearMoveSuggestion();
}

function unselectUnits() {
    selectedUnits = [];
}


/*** MOVE TILE ***/


function moveSuggestion( tileId ) {
    if ( isExpansionSubPhase() && selectedUnits.length ) {
        highlightSuggestedTiles( null, false );

        const rootTileId = selectedTile.id;
        const destinationTileId = tileId;
        const allTiles = game.board.map( t => t.id );
        const impassableTiles = allTiles.filter( t => isImpassibleTile( t, !hasTechnology( ADAPTIVE_MAPPING ) ) );
        const maxMove = getMaxMovesForUnits( selectedUnits, hasTechnology( ADVANCED_FLIGHT ) );
        const bonuses = {
            hasGlobalTravel: hasTechnology( GLOBAL_TRAVEL ),
            districtTileIds: currentPlayer.districts.tileIds
        };
        suggestedPath = calculateShortestNonCombatPath( rootTileId, destinationTileId, allTiles, impassableTiles, maxMove, bonuses );

        highlightSuggestedTiles( suggestedPath );
    }
}

function getMaxMovesForUnits( units, hasAdvancedFlight ) {
    return Math.min( ...getMovingUnits( units, hasAdvancedFlight ).map( u => u.movesRemaining ) );
}

function getMovingUnits( units, hasAdvancedFlight ) {
    let unitsToCheck = units.slice();
    if ( hasAdvancedFlight ) {
        const speedsterCount = unitsToCheck.filter( u => u.unitTypeId === UNIT_TYPES[SPEEDSTER].id ).length;
        for ( let i = 0; i < speedsterCount; i++ ) {
            for ( let j = 0; j < ADVANCED_FLIGHT_CAPACITY; j++ ) {
                const unit = unitsToCheck.find( u => u.unitTypeId === UNIT_TYPES[APOSTLE].id || u.unitTypeId === UNIT_TYPES[REAPER].id );
                if ( unit ) {
                    removeObject( unitsToCheck, (u => u.id === unit.id) );
                }
            }
        }
    }
    return unitsToCheck;
}

function hasEnemyUnits( tileId, includeApostles = false ) {
    return !!getEnemyPlayer( tileId, includeApostles );
}

function hasEnemyDistrict( tileId ) {
    const districtPlayers = game.players.filter( p => p.districts.tileIds.includes( tileId ) ).map( p => p.id );
    return districtPlayers.length && districtPlayers[0] !== currentPlayer.id;
}

function isImpassibleTile( tileId, checkVolcano = true, checkCombat = true ) { //todo 3
    const tileDetails = getTileDetails( tileId );
    return !tileDetails ||
        /*( Check for Camelot ) ||*/
        ( tileDetails.type === TILE_TYPES[CAPITAL].name && tileDetails.districtPlayerId !== currentPlayer.id ) ||
        ( checkVolcano && tileDetails.type === TILE_TYPES[VOLCANO].name ) ||
        ( checkCombat && tileDetails.unitSets.filter( s => s.id !== currentPlayer.id ).some( s => s.combat ) );
}

function clearMoveSuggestion() {
    suggestedPath = [];
    highlightSuggestedTiles( null, false );
}

function moveUnits( tileId ) {
    const rootTileId = selectedUnits[0].tileId;
    const destinationTileId = tileId;

    const hasAdvancedFlight = hasTechnology( ADVANCED_FLIGHT );
    selectedUnits.forEach( unit => {
        if ( getMovingUnits( selectedUnits, hasAdvancedFlight ).includes( unit ) ) {
            unit.movesRemaining -= suggestedPath.length;
        }
        unit.tileId = destinationTileId;
    } );

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


/*** SPECIAL ACTION ***/


function setSpecialAction( isValidTile, callback ) {
    specialAction = {
        isValidTile: isValidTile,
        callback: callback,
    };
}

function specialSuggestion( tileId ) {
    if ( specialAction ) {
        highlightSuggestedTiles( null, false );
        let tilesToHighlight = [];
        if ( specialAction.isValidTile( tileId ) ) {
            tilesToHighlight.push( tileId );
        }
        highlightSuggestedTiles( tilesToHighlight );
    }
}