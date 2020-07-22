/*** EVALUATE ***/


function getTilesByThreat( enemyPlayerId = null, player = currentPlayer ) { //todo 4 - I can't remember; if you're sorting based on proximity to enemy units, sort instead based on proximity to Capital
    let result = [];
    const allTiles = game.board.map( t => t.id );
    const checkVolcano = enemyPlayerId ? !hasTechnology( ADAPTIVE_MAPPING, getPlayer( enemyPlayerId ) ) : true;
    const impassableTiles = allTiles.filter( t => isImpassibleTile( t, checkVolcano, false ) );
    const controlledTiles = getControlledTiles( player );
    const enemyTiles = getEnemyTiles( enemyPlayerId )
    enemyTiles.forEach( et => {
        const tile = {
            tileId: et,
            distance: Number.POSITIVE_INFINITY
        };
        controlledTiles.forEach( ct => {
            const distance = calculateShortestPath( ct, et, allTiles, impassableTiles, 10 ).length;
            if ( distance > 0 && distance < tile.distance ) {
                tile.distance = distance;
            }
        } );
        result.push( tile );
    } );
    return result.sort( (t1,t2) => t1.distance - t2.distance ).map( t => t.tileId );
}

function getUnitsByExposure( player = currentPlayer, enemyPlayerId = null, prioritizeValue = true, includeApostle = true ) {
    let result = [];
    const allTiles = game.board.map( t => t.id );
    const checkVolcano = enemyPlayerId ? !hasTechnology( ADAPTIVE_MAPPING, getPlayer( enemyPlayerId ) ) : true;
    const impassableTiles = allTiles.filter( t => isImpassibleTile( t, checkVolcano, false ) );
    const enemyUnits = getEnemyUnits( player, enemyPlayerId );
    const controlledTiles = player.units.map( u => u.tileId )
        .filter( (t, i, tiles) => tiles.indexOf(t) === i )
        .map( t => ({ tileId: t, defensePower: player.units.filter( u => u.tileId === t ).reduce( (total, u) => total + getUnitPower( u.hit ), 0 ) }) );

    let powerByTile = {};
    player.units.filter( u => includeApostle || u.unitTypeId !== UNIT_TYPES[APOSTLE].id ).forEach( u => {
        const unit = {
            id: u.id,
            rating: Number.POSITIVE_INFINITY
        };

        let value = prioritizeValue ? u.getCost() : u.hit; //if prioritizeValue is false, weaker units will rate higher
        if ( u.id === UNIT_TYPES[APOSTLE].id && !prioritizeValue ) {
            value = 13;
        }

        let defensePower = controlledTiles.find( t => t.tileId === u.tileId ).defensePower;

        let strikingPower = powerByTile[u.tileId];
        if ( isNaN(strikingPower) ) {
            let distanceByTile = {};
            enemyUnits.forEach( eu => {
                let distance = distanceByTile[eu.tileId];
                if ( isNaN(distance) ) {
                    distance = calculateShortestPath( u.tileId, eu.tileId, allTiles, impassableTiles, 10 ).length;
                    distanceByTile[eu.tileId] = distance;
                }

                if ( distance > 0 && distance <= eu.movesRemaining ) {
                    strikingPower += getUnitPower( eu.hit );
                }
            } );
            powerByTile[u.tileId] = strikingPower;
        }

        unit.rating = ( defensePower - strikingPower ) - value;
        result.push( unit );
    } );
    return result.sort( (u1,u2) => u1.rating - u2.rating ).map( u => u.id );
}