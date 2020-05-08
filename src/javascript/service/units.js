let currentPlayerDisambiguousUnits = [];


/*** CALCULATE ***/


function calculateShortestNonCombatPath( rootTileId, destinationTileId, allTileIds, impassableTileIds, maxMove = 100 ) {
    let result = [];

    if ( getHexFromId( rootTileId ).calculateDistance( getHexFromId( destinationTileId ) ) <= maxMove ) {
        let allTiles = allTileIds.map( t => { return {id: t, visited: false, distance: Number.POSITIVE_INFINITY, prev: null }; } );
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


function getUnitDisplayName( unitTypeId, unitCount, playerId ) {
    const isMultiple = unitCount > 1;
    const unitType = getUnitType( unitTypeId );
    let name = unitTypeId === UNIT_TYPES[HERO].id ? ( playerId ? Faction.getHero( getPlayer( playerId ).factionId ).name : UNIT_TYPES[HERO].name ) : unitType.name;
    name = isMultiple ? (unitCount + " " + name + "s") : name;
    return name;
}

function disambiguateCurrentUnits( units ) {
    currentPlayerDisambiguousUnits = disambiguateUnits( units );
}

function disambiguateUnits( units ) {
    let result = [];
    for ( let i = 0; i < units.length; i++ ) {
       const unitStack = units[i];
       for ( let j = 0; j < unitStack.count; j++ ) {
           const id = ( Math.floor( Math.random() * 100000 ) + "" ).padStart( 4, '0' );
           result.push( new Unit( id, getUnitType( unitStack.unitTypeId ), unitStack.tileId ) );
       }
    }
    return result;
}

function getDisambiguousUnitGroup( tileId, unitTypeIds = "" ) {
    let result = currentPlayerDisambiguousUnits.filter( u => u.tileId === tileId );
    unitTypeIds = Array.isArray( unitTypeIds ) ? unitTypeIds : ( unitTypeIds ? [unitTypeIds] : [] );
    if ( unitTypeIds.length ) {
        result = result.filter( u => unitTypeIds.includes( u.unitType.id ) );
    }
    return result.sort( (u1, u2) => u1.unitType.id === u2.unitType.id ? u1.movesRemaining - u2.movesRemaining : u1.unitType.id - u2.unitType.id );
}

function getConsolidatedUnits() {
    return currentPlayerDisambiguousUnits.reduce( ( units, nextUnit ) => {
        let unit = units.find( u => u.id === nextUnit.unitType.id && u.tileId === nextUnit.tileId );
        if ( unit ) {
            unit.count++;
        }
        else {
            units.push( {id: nextUnit.unitType.id, tileId: nextUnit.tileId, count: 1 } );
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
    const unitsToAdd = unit.count || 1;
    let unitStack = player.units.find( us => us.unitTypeId === unit.unitTypeId );
    if ( unitStack ) {
        unitStack.count += unitsToAdd;
    }
    else {
        player.units.push( {unitTypeId: unit.unitTypeId, count: unitsToAdd, tileId: tileId} );
    }

    if ( player.id === currentPlayer.id && isExpansionPhase() ) {
        disambiguateCurrentUnits( player.units );
    }

    if ( updateDisplay ) {
        updateUnitIconsFromId( tileId );
    }
}

function removeUnit( unit, player, updateDisplay = true ) {
    const tileId = unit.tileId;
    const unitsToRemove = unit.count || 1;
    let unitStack = player.units.find( us => us.unitTypeId === unit.unitTypeId );
    unitStack.count -= unitsToRemove;
    player.units = player.units.filter( us => us.count <= 0 );

    if ( player.id === currentPlayer.id && isExpansionPhase() ) {
        disambiguateCurrentUnits( player.units );
    }

    if ( updateDisplay ) {
        updateUnitIconsFromId( tileId );
    }
}


/*** SPECIAL ABILITIES ***/


function performUnitAbilities() {
    if ( selectedUnits.length === 1 ) {
        const selectedUnit = selectedUnits[0];
        if ( selectedUnit.unitType.id === UNIT_TYPES[APOSTLE].id ) {
            showBinaryChoice( //todo 4 - make a new modal that allows infinite button adding
                "Apostle",
                "Choose an ability or cancel to move:",
                "Found District",
                "Evangelize",
                function( response ) {
                    performApostleAbility( response ? "0" : "1", selectedUnit );
            });
        }
    }
    else {
        showToaster("Must have only 1 unit selected.");
    }
}


/*** APOSTLE ***/


const APOSTLE_FOUND = "0";
const APOSTLE_EVANG = "1";

function performApostleAbility( abilityId, unit ) {
    const tileId = unit.tileId;
    if ( abilityId === APOSTLE_FOUND ) {
        removeUnit( unit, currentPlayer );
        addDistrict( currentPlayer, tileId );
    }
    else if ( abilityId === APOSTLE_EVANG ) {
        if ( currentPlayer.religion ) {
            addReligion( currentPlayer, tileId );
        }
        else {
            showToaster( "Must have founded a religion." );
        }
    }
}