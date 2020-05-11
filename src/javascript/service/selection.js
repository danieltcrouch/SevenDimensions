let selectedTile;
let selectedUnits = [];
let suggestedPath = [];
let specialAction;

/*** SELECT TILE ***/


function tileHoverCallback( tileId ) {
    if ( specialAction ) {
        specialSuggestion( tileId );
    }
    else if ( isExpansionPhase() && selectedUnits.length ) {
        moveSuggestion( tileId );
    }
}

function tileClickCallback( tileId ) {
    if ( specialAction && specialAction.isValidTile( tileId ) ) {
        specialAction.callback( tileId );
        specialAction = null;
    }
    else if ( selectedUnits.length && ( isExpansionPhase() && suggestedPath.includes( tileId ) ) ) {
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
                const enemyPlayerDetails = getPlayerBattleDetails( enemyPlayer, tileId );
                const currentPlayerDetails = getPlayerBattleDetails( currentPlayer, selectedUnits[0].tileId );
                createBattle( currentPlayerDetails, enemyPlayerDetails, function() {
                    openBattleModal(
                        currentPlayerDetails,
                        enemyPlayerDetails,
                        true,
                        game.state.timeLimit * 60000, //convert minute to millisecond
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
}

function selectTile( tileId ) {
    const isTileChange = !selectedTile || selectedTile.id !== tileId;
    selectedTile = game.board.find( t => t.id === tileId );

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
    updatePerformAbilityButton();
    clearMoveSuggestion();
}

function selectUnits( tileSelectType, unitId ) {
    const isUnassigned = tileSelectType === "unassigned";
    const SelectClass = isUnassigned ? SelectUnassignedUnits : SelectTileUnits;

    if ( selectedUnits.length && SelectClass.isUnitSelected( unitId ) ) {
        SelectClass.highlightUnit( unitId, false );
        selectedUnits = selectedUnits.filter( u => u.unitTypeId !== unitId );
        if ( !selectedUnits.length ) {
            SelectClass.highlightAll( false );
            unselectUnits();
        }
    }
    else {
        SelectClass.highlightUnit( unitId );
        selectedUnits = selectedUnits.concat( currentPlayer.units.filter( u => u.id === unitId ) );
    }
    updatePerformAbilityButton();
    clearMoveSuggestion();
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
        const allTiles = game.board.map( t => t.id );
        const impassableTiles = allTiles.filter( t => isImpassibleTile( t ) );
        const maxMove = Math.min( ...selectedUnits.map( u => u.movesRemaining ) );
        suggestedPath = calculateShortestNonCombatPath( rootTileId, destinationTileId, allTiles, impassableTiles, maxMove );

        highlightSuggestedTiles( suggestedPath );
    }
}

function hasEnemyUnits( tileId, includeApostles = false ) {
    return !!getEnemyPlayer( tileId, includeApostles );
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