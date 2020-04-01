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


/*** HELPER ***/


function getUnitDisplayName( unitTypeId, unitCount, playerId ) {
    const isMultiple = unitCount > 1;
    const unitType = getUnitType( unitTypeId );
    let name = unitTypeId === UNIT_TYPES[HERO].id ? ( playerId ? Faction.getHero( getPlayer( playerId ).factionId ).name : UNIT_TYPES[HERO].name ) : unitType.name;
    name = isMultiple ? (unitCount + " " + name + "s") : name;
    return name;
}

function disambiguateUnits( units ) {
    for ( let i = 0; i < units.length; i++ ) {
       const unitStack = units[i];
       for ( let j = 0; j < unitStack.count; j++ ) {
           const id = ( Math.floor( Math.random() * 100000 ) + "" ).padStart( 4, '0' );
           currentPlayerDisambiguousUnits.push( new Unit( id, getUnitType( unitStack.id ), unitStack.tileId ) );
       }
    }
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

function addUnit( unit, player ) {
    //todo 13
}

function removeUnit() {
    //todo 13
}


/*** SPECIAL ABILITIES ***/


function performUnitAbilities() {
    if ( selectedUnits.length === 1 ) {
        const selectedUnit = selectedUnits[0];
        if ( selectedUnit.unitType.id === UNIT_TYPES[APOSTLE].id ) {
            showBinaryChoice( //todo 10 - make a new modal that allows infinite button adding
                "Apostle",
                "Choose an ability or cancel to move:",
                "Found District",
                "Evangelize",
                function( response ) {
                    performApostleAbility( response ? "0" : "1" );
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

function performApostleAbility( abilityId, unit, player ) {
    //todo 13
    if ( abilityId === APOSTLE_FOUND ) {
        //remove unit in both places (ambiguous and disambiguous)
        //add district to player
        //remove unit display (combine to killing in object in abstracted method for adding/removing units)
        //add district display
    }
    else if ( abilityId === APOSTLE_EVANG ) {
        //add religion to player
        //add religion display
    }
}