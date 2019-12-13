class TileType {
    constructor( id, type, name, value, count, resourceCount ) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.value = value;
        this.count = count;
        this.resourceCount = resourceCount;
    }
}

class Tile extends Entity {
    constructor( id, tileType, resources ) {
        super( id, "TILE", tileType.name, function() { return null; } );
        this.tileType = tileType;
        this.resources = resources ? ( Array.isArray( resources ) ? resources : [ resources ] ) : null;
    }

    static getNewTile( id, tileType, index ) {
        const resourceIndex = Math.floor( index / 2 );
        const resources = (tileType.resourceCount > 0 && resourceIndex < RESOURCES.length) ? RESOURCES[resourceIndex] : null;
        //const resources = (index < tileType.resourceCount) ? RESOURCES[Math.floor(Math.random() * RESOURCES.length)] : null; //use for random resource distribution
        return new Tile( id, tileType, resources );
    }

    static getCapitalTile( id ) {
        return new Tile( id, TILE_TYPES[CAPITAL], null );
    }

    static getAtlantisTile( id ) {
        return new Tile( id, TILE_TYPES[ATLANTIS], RESOURCES );
    }
}