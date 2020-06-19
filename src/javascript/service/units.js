/*** CALCULATE ***/


function calculateShortestNonCombatPath( rootTileId, destinationTileId, allTileIds, impassableTileIds, maxMove, bonuses ) {
    let result = [];

    if ( getHexFromId( rootTileId ).calculateDistance( getHexFromId( destinationTileId ) ) <= maxMove ) {
        let allTiles = allTileIds.map( t => ({id: t, visited: false, distance: Number.POSITIVE_INFINITY, prev: null }) );
        let initialTile = allTiles.find( t => t.id === rootTileId );
        const destinationTile = allTiles.find( t => t.id === destinationTileId );
        initialTile.distance = 0;

        while ( !destinationTile.visited ) {
            let currentTile = allTiles.filter( t => !t.visited ).reduce((a, b) => a.distance < b.distance ? a : b );
            let adjacentHexes = getAllAdjacentHexes( getHexFromId( currentTile.id ) );
            if ( bonuses.hasGlobalTravel && bonuses.districtTileIds.includes( currentTile.id ) ) {
                adjacentHexes.push( bonuses.districtTileIds.filter( t => t !== currentTile.id ).map( t => getHexFromId( t ) ) );
            }
            adjacentHexes = adjacentHexes.filter( h => allTiles.some( t => t.id === h.id && !t.visited ) ).filter( h => !impassableTileIds.some( tileId => tileId === h.id ) );
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

function getAdjacentTiles( tileId, checkImpassible = false, checkVolcano = true, checkCombat = false ) {
    return getRelevantAdjacentHexes( getHexFromId( tileId ) ).map( h => h.id ).filter( t => !(checkImpassible && isImpassibleTile( t, checkVolcano, checkCombat ) ) );
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
                function( aIndex ) { abilities[aIndex].callback( selectedUnit ); }
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
        if ( !tileDetails.districtPlayerId && currentPlayer.districts.tileIds.length < MAX_DISTRICTS ) {
            result.push( { text: "Found District", callback: found } );
        }
        if ( currentPlayer.religion && tileDetails.districtPlayerId && !tileDetails.religionIds.includes( currentPlayer.religion.id ) ) {
            result.push( { text: "Evangelize", callback: evangelize } );
        }
    }
    else {
        if ( tileDetails.districtPlayerId !== currentPlayer.id ) {
            result.push( { text: "Conquer", callback: conquer } );
        }
        if ( tileDetails.unitSets.filter( us => !us.combat ).length ) {
            result.push( { text: "Kill Apostle", callback: killApostle } );
        }
        if ( hasTechnology( LONG_RANGE_ROCKETRY ) && (
            unit.unitTypeId === UNIT_TYPES[BOOMER].id ||
            unit.unitTypeId === UNIT_TYPES[JUGGERNAUT].id ||
            unit.unitTypeId === UNIT_TYPES[GODHAND].id
        ) ) {
            result.push( { text: "Bombard", callback: pickBombardTile } );
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

function conquer( unit ) {
    const tileId = unit.tileId;
    const tileDetails = getTileDetails( tileId );
    swapDistrict( tileDetails.districtPlayerId, currentPlayer, tileId );
}

function killApostle( unit ) {
    const tileId = unit.tileId;
    const enemyPlayers = game.players.filter( p => p.units.some( u => u.unitTypeId === UNIT_TYPES[APOSTLE].id && u.tileId === tileId ) );
    if ( enemyPlayers.length > 1 ) {
        pickPlayers(
            true,
            false,
            function( playerIds ) {
                enemyPlayers.filter( p => playerIds.includes( p.id ) ).forEach( p => {
                    p.units.filter( u => u.unitTypeId === UNIT_TYPES[APOSTLE].id && u.tileId === tileId ) .forEach( u => removeUnit( u, p ) );
                } );
            },
            enemyPlayers
        );
    }
    else {
        const enemyPlayer = enemyPlayers[0];
        enemyPlayer.units.filter( u => u.unitTypeId === UNIT_TYPES[APOSTLE].id && u.tileId === tileId ).forEach( u => removeUnit( u, enemyPlayer ) );
    }
}

function pickBombardTile( unit ) {
    const rootTileId = unit.tileId;
    setSpecialAction(
        function( tileId ) { return hasEnemyUnits( tileId ) && getAdjacentTiles( rootTileId ).includes( tileId ); },
        function( tileId ) { bombard( unit, tileId ); }
    );
}

function bombard( unit, tileId ) {
    const rolls = rollForUnits( [unit] );
    if ( rolls[0].isHit ) {
        const enemyPlayer = getEnemyPlayer( tileId );
        let enemyUnit = getLowestDisbands( enemyPlayer.units, 1 );
        removeUnit( enemyUnit, enemyPlayer );
        showToaster( "You successfully bombarded their weakest unit." );
    }
    else {
        showToaster( "You missed." );
    }
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

function addUnitGroup( count, unitTypeId, tileId, player, updateDisplay = true ) {
    for ( let j = 0; j < count; j++ ) {
        addUnit( new Unit( getRandomUnitId(), unitTypeId, tileId ), player, false );
    }

    if ( updateDisplay ) {
        updateUnitIconsFromId( tileId );
        displayTileDetails( tileId );
    }
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
    if ( player.units.some( u => u.id === unit.id ) ) {
        player.units.splice( p.units.findIndex( u => u.id === unit.id ), 1 );
        player.special.disbandedUnits.push( unit );
    }
    if ( selectedUnits.some( u => u.id === unit.id ) ) {
        selectedUnits.splice( selectedUnits.findIndex( u => u.id === unit.id ), 1 );
    }

    if ( updateDisplay ) {
        const tileId = unit.tileId;
        updateUnitIconsFromId( tileId );
        displayTileDetails( tileId );
    }
}

function getRandomUnitId() {
    return ( Math.floor( Math.random() * 10000 ) + "" ).padStart( 4, '0' );
}