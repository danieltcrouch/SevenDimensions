class TileType {
    constructor( id, type, name, value, count, resourceCount ) {
        this.id = id;
        this.type = type;
        this.name = name;
        this.value = value;
        this.count = count;
        this.resourceCount = resourceCount;
    }

    static getDisplayName( tileType ) {
        return tileType.isNatureTile() ? tileType.type : tileType.name;
    }

    isNatureTile( includeVolcanoes = false ) {
        return this.type === "Nature" && ( includeVolcanoes || this !== TILE_TYPES[VOLCANO] );
    }
}

function getTileType( id ) { return TILE_TYPES.find( i => i.id === id ); }

const VOLCANO  = 0;
const CAPITAL  = 6;
const ATLANTIS = 7;

const TILE_TYPES = [
    //Counts inflated from real game in order to fill full hexagon map
    new TileType( "0", "Nature",   "Volcano",  0, 3, 0 ),
    new TileType( "1", "Nature",   "Nature1",  1, 3, 0 ),
    new TileType( "2", "Nature",   "Nature2",  2, 8, 6 ),
    new TileType( "3", "Nature",   "Nature3",  3, 9, 0 ),
    new TileType( "4", "Nature",   "Nature4",  4, 8, 6 ),
    new TileType( "5", "Nature",   "Nature5",  5, 3, 0 ),
    new TileType( "6", "Capital",  "Capital",  6, 6, 0 ),
    new TileType( "7", "Atlantis", "Atlantis", 7, 1, 1 )
];


/**** ENTITY ****/


class Tile extends Entity {
    constructor( id, tileType, resources ) {
        super( id, "TILE", tileType.name, function() { return null; } );
        this.tileType = tileType;
        this.resources = resources ? ( Array.isArray( resources ) ? resources : [ resources ] ) : null;
    }

    static getRandomTile( id, tileType, index ) {
        const resourceIndex = Math.floor( index / 2 );
        const resources = (tileType.resourceCount > 0 && resourceIndex < RESOURCES.length) ? RESOURCES[resourceIndex].id : null;
        return new Tile( id, tileType, resources );
    }

    static getCapitalTile( id ) {
        return new Tile( id, TILE_TYPES[CAPITAL], null );
    }

    static getAtlantisTile( id ) {
        return new Tile( id, TILE_TYPES[ATLANTIS], RESOURCES.map( r => r.id ) );
    }
}


