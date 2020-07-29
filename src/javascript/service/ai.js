/*** EVALUATE ***/


//returns a list of tiles with enemy units sorted by proximity to player's tiles
function getTilesByThreat( enemyPlayerId = null, player = currentPlayer ) {
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

//todo 4 - make getTilesByProximity where they're sorted by closeness to player Capital (should this be used instead of getTilesByThreat() in some instances?)

function getFarthestTile( tileId, playersToAllow = [] ) {
    let result = {
        tileId: DEFAULT_TILE,
        maxDistance: 0
    };
    const allTiles = game.board.map( t => t.id );
    const availableTiles = allTiles.filter( t => !game.players.filter( p => !(playersToAllow.includes( p.id ) || p.id === currentPlayer.id) ).some( p => p.units.some( u => u.tileId === t ) ) );
    const checkVolcano = !playersToAllow.some( p => hasTechnology( ADAPTIVE_MAPPING, getPlayer( p ) ) );
    const impassableTiles = allTiles.filter( t => isImpassibleTile( t, checkVolcano, false ) );
    availableTiles.forEach( t => {
        const distance = calculateShortestPath( t, tileId, allTiles, impassableTiles, 10 ).length;
        if ( distance > 0 && distance > result.maxDistance ) {
            result.tileId = t;
            result.maxDistance = distance;
        }
    } );
    return result.tileId;
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

function getLowestResistance( annexStrength, playerDetails ) {
    let runningTotal = 0;

    let tokensUsed = 0;
    if ( playerDetails.culturalTokens ) {
        tokensUsed = Math.min( Math.floor( annexStrength / REAPERS_IN_CR ), playerDetails.culturalTokens );
        runningTotal += tokensUsed * REAPERS_IN_CR;
    }
    let reapersUsed = 0;
    if ( playerDetails.culturalActive ) {
        reapersUsed = Math.min( (annexStrength - runningTotal), playerDetails.culturalActive );
        runningTotal += reapersUsed;
    }
    let bucksUsed = 0;
    if ( playerDetails.warBucks ) {
        bucksUsed = Math.min( (annexStrength - runningTotal), playerDetails.warBucks );
        runningTotal += bucksUsed;
    }
    let unitsUsed = [];
    if ( playerDetails.units.length ) {
        playerDetails.units.sort( (u1,u2) => u1.getCost() - u2.getCost() );
        for ( let i = 0; i < playerDetails.units.length && runningTotal < annexStrength; i++ ) {
            const unit = playerDetails.units[i];
            unitsUsed.push( unit );
            runningTotal += unit.getCost();
        }
    }

    const isSuccess = runningTotal >= annexStrength;
    return {
        id: playerDetails.id,
        tileId: playerDetails.tileId,
        isSuccess: isSuccess,
        defendStrength: isSuccess ? runningTotal : 0,
        defense: {
            warBucks: isSuccess ? bucksUsed : 0,
            culturalTokens: isSuccess ? tokensUsed : 0,
            culturalActive: isSuccess ? reapersUsed : 0,
            units: isSuccess ? unitsUsed : [],
        }
    };
}

function getLowestDisbands( units, disbandCount ) {
    return units.sort( (a,b) => parseInt(a.unitTypeId) - parseInt(b.unitTypeId) ).slice(0, disbandCount);
}

function getLowestAssets( value ) {
    //
}