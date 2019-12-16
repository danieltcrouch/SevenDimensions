const VOLCANO  = 0;
const CAPITAL  = 1;
const ATLANTIS = 2;

function isNatureTile( tile, includeVolcanoes = false ) {
    return tile.type === "Nature" && !( includeVolcanoes && tile.id === VOLCANO );
}

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