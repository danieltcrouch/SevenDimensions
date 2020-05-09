/*** CALCULATE ***/


function calculateShortestNonCombatPath( rootTileId, destinationTileId, allTileIds, impassableTileIds, maxMove = 100 ) {
    let result = [];

    if ( getHexFromId( rootTileId ).calculateDistance( getHexFromId( destinationTileId ) ) <= maxMove ) {
        let allTiles = allTileIds.map( t => ({id: t, visited: false, distance: Number.POSITIVE_INFINITY, prev: null }) );
        let initialTile = allTiles.find( t => t.id === rootTileId );
        const destinationTile = allTiles.find( t => t.id === destinationTileId );
        initialTile.distance = 0;

        while ( !destinationTile.visited ) {
            let currentTile = allTiles.filter( t => !t.visited ).reduce((a, b) => a.distance < b.distance ? a : b );
            let adjacentHexes = getAllAdjacentHexes( getHexFromId( currentTile.id ) ).filter( h => allTiles.some( t => t.id === h.id && !t.visited ) ).filter( h => !impassableTileIds.some( tileId => tileId === h.id ) );
            allTiles.filter( t => adjacentHexes.some( h => h.id === t.id ) ).forEach( t => {
                if ( currentTile.distance + 1 < t.distance) {
                    t.distance = currentTile.distance + 1;
                    t.prev = currentTile.id;
                }
            } );
            currentTile.visited = true;

            if ( currentTile.distance > maxMove ) {
                impassableTileIds.push( currentTile.id );
            }
        }

        if ( destinationTile.distance && destinationTile.distance < Number.POSITIVE_INFINITY ) {
            let currentTile = destinationTile;
            while ( currentTile !== initialTile ) {
                result.push( currentTile.id );
                currentTile = allTiles.find( t => t.id === currentTile.prev );
            }
        }
    }

    return result;
}

function getAdjacentTiles( tileId, checkImpassible = true, checkCombat = false ) {
    return getAllAdjacentHexes( getHexFromId( tileId ) ).map( h => h.id ).filter( t => !checkImpassible || isImpassibleTile( t, checkCombat ) );
}


/*** HELPER ***/


function getUnitDisplayName( unitTypeId, playerId, unitCount = 1 ) {
    const isMultiple = unitCount > 1;
    const unitType = getUnitType( unitTypeId );
    let name = unitTypeId === UNIT_TYPES[HERO].id ? ( playerId ? Faction.getHero( getPlayer( playerId ).factionId ).name : UNIT_TYPES[HERO].name ) : unitType.name;
    name = isMultiple ? (unitCount + " " + name + "s") : name;
    return name;
}

function getConsolidatedUnitsByType( units ) {
    return units.reduce( ( units, nextUnit ) => {
        let unitStack = units.find( u => u.unitTypeId === nextUnit.unitTypeId && u.tileId === nextUnit.tileId );
        if ( unitStack ) {
            unitStack.count++;
        }
        else {
            units.push( {unitTypeId: nextUnit.unitTypeId, tileId: nextUnit.tileId, count: 1 } );
        }
        return units;
    }, [] ).sort( (u1, u2) => u1.id - u2.id );
}

function swapUnit( unit, fromPlayer, toPlayer ) {
    removeUnit( unit, fromPlayer, false );
    addUnit( unit, toPlayer, false );
    updateUnitIconsFromId( unit.tileId );
}

function addUnit( unit, player, updateDisplay = true ) {
    const tileId = unit.tileId;
    player.units.push( unit );

    if ( updateDisplay ) {
        updateUnitIconsFromId( tileId );
        displayTileDetails( tileId );
    }
}

function removeUnit( unit, player, updateDisplay = true ) {
    const tileId = unit.tileId;
    player.units.splice( player.units.findIndex( u => u.id === unit.id ), 1 );

    if ( selectedUnits.some( u => u.id === unit.id ) ) {
        selectedUnits.splice( selectedUnits.findIndex( u => u.id === unit.id ), 1 );
    }

    if ( updateDisplay ) {
        updateUnitIconsFromId( tileId );
        displayTileDetails( tileId );
    }
}


/*** SPECIAL ABILITIES ***/


function performUnitAbilities() {
    if ( selectedUnits.length === 1 ) {
        const selectedUnit = selectedUnits[0];
        let abilities = getAbilitiesForUnit( selectedUnit );
        if ( abilities.length > 0 ) {
            showChoices(
                getUnitDisplayName( selectedUnit.unitTypeId, currentPlayer.id ),
                "",
                abilities.map( a => a.text ),
                function( aIndex ) { abilities[aIndex].aFunction( selectedUnit ); }
            );
        }
        else {
            showToaster("This unit has no current abilities.");
        }
    }
    else {
        showToaster("Must have only 1 unit selected.");
    }
}

function getAbilitiesForUnit( unit ) {
    let result = [];
    const tileDetails = getTileDetails( unit.tileId );

    if ( unit.unitTypeId === UNIT_TYPES[APOSTLE].id ) {
        if ( !tileDetails.districtPlayerId ) {
            result.push( { text: "Found District", aFunction: found } );
        }
        if ( currentPlayer.religion && tileDetails.districtPlayerId && !tileDetails.religionIds.includes( currentPlayer.religion.id ) ) {
            result.push( { text: "Evangelize", aFunction: evangelize } );
        }
    }
    else {
        if ( tileDetails.unitSets.filter( us => !us.combat ).length ) {
            result.push( { text: "Kill Apostle", aFunction: killApostle } );
        }
    }

    return result;
}

function found( unit ) {
    const tileId = unit.tileId;
    addDistrict( currentPlayer, tileId );
    removeUnit( unit, currentPlayer );
}

function evangelize( unit ) {
    const tileId = unit.tileId;
    addReligion( currentPlayer, tileId );
}

function killApostle( unit ) {
    const tileId = unit.tileId;
    const enemyPlayer = game.players.find( p => p.units.some( u => u.unitTypeId === UNIT_TYPES[APOSTLE].id && u.tileId === tileId ) ); //todo 4 - build a modal for checkboxes/radio buttons; helper function in this project to pick applicable player
    if ( enemyPlayer ) {
        showBinaryChoice(
            "Kill Apostle?",
            "Would you like to kill the apostle(s) in this tile?",
            "No",
            "Yes",
            function( isYes ) {
                if ( isYes ) {
                    enemyPlayer.units.filter( u => u.unitTypeId === UNIT_TYPES[APOSTLE].id && u.tileId === tileId ).forEach( u =>
                        removeUnit( u, enemyPlayer )
                    );
                }
            }
        );
    }
}


/*** OTHER ***/


function getRandomUnitId() {
    return ( Math.floor( Math.random() * 10000 ) + "" ).padStart( 4, '0' );
}