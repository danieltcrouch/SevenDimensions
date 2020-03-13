//redblobgames.com/grids/hexagons/
const MAP_TILE_RADIUS = 4;
const TILE_SIDE_LENGTH = 10;


/*** GENERATE NEW MAP ***/


function generateNewMap( factionCount ) {
    let natureDeck = new Deck();
    TILE_TYPES.filter( t => t.isNatureTile( true ) ).forEach( tileType => {
        for ( let i = 0; i < tileType.count; i++ ) {
            natureDeck.insertCard( Tile.getRandomTile( null, tileType.id, i ), true );
        }
    } );

    let result = [];
    let natureTiles = natureDeck.cards;
    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS );
    const maxTileDepth = MAP_TILE_RADIUS * 2;
    const capitalHexIds = getCapitalHexes( factionCount );
    for ( let i = 0; i < maxTileDepth; i++ ) {
        for ( let j = 0; j < maxTileDepth; j++ ) {
            const hex = new Hex( i, j );
            if ( hex.calculateDistance( centerHex ) < MAP_TILE_RADIUS ) {
                if ( hex.id === centerHex.id ) {
                    result.push( Tile.getAtlantisTile( hex.id ) );
                }
                else if ( capitalHexIds.includes( hex.id ) ) {
                    result.push( Tile.getCapitalTile( hex.id ) );
                }
                else if ( isAdjacentToCapitalHex( hex, capitalHexIds ) ) {
                    let natureTile = natureTiles.splice( natureTiles.findIndex( t => t.getTileType().isNatureTile() ), 1 )[0];
                    natureTile.id = hex.id;
                    result.push( natureTile );
                }
                else {
                    let natureTile = natureTiles.shift();
                    natureTile.id = hex.id;
                    result.push( natureTile );
                }
            }
        }
    }

    return result;
}

function getCapitalHexes( factionCount ) {
    let result = [];
    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS );
    const maxTileDepth = MAP_TILE_RADIUS * 2;
    for ( let i = 0; i < maxTileDepth; i++ ) {
        for ( let j = 0; j < maxTileDepth; j++ ) {
            const hex = new Hex( i, j );
            if ( hex.calculateDistance( centerHex ) === MAP_TILE_RADIUS - 1 ) {
                if ( getRelevantAdjacentHexes( hex ).length <= 3 ) { //Corner hex
                    const isVerticalTop      = hex.y < MAP_TILE_RADIUS;
                    const isHorizontalLeft   = hex.x < MAP_TILE_RADIUS;
                    const isHorizontalRight  = hex.x > MAP_TILE_RADIUS;
                    const isHorizontalMiddle = hex.x === MAP_TILE_RADIUS;
                    if ( ( isVerticalTop  && isHorizontalLeft ) || //top-left
                         ( isVerticalTop  && isHorizontalMiddle && factionCount >=  5 ) || //top-middle
                         ( isVerticalTop  && isHorizontalRight  && factionCount >=  3 ) || //top-right
                         ( !isVerticalTop && isHorizontalLeft   && factionCount >=  4 ) || //bottom-left
                         ( !isVerticalTop && isHorizontalMiddle && factionCount === 3 ) || //bottom-middle
                         ( !isVerticalTop && isHorizontalRight  && factionCount !== 3 ) || //bottom-right
                         ( factionCount === 6 ) ) {
                        result.push( hex.id );
                    }
                }
            }
        }
    }
    return result;
}

function isAdjacentToCapitalHex( hex, capitalHexIds ) {
    return getAllAdjacentHexes( hex ).some( h => capitalHexIds.includes( h.id ) );
}


/*** UTILITY ***/


function getHexFromId( id ) {
    const indexes = id.split("-");
    return new Hex( parseInt( indexes[0] ), parseInt( indexes[1] ) );
}

function getRelevantAdjacentHexes( hex ) {
    return getAllAdjacentHexes( hex ).filter( h => h.calculateDistance( new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS ) ) < MAP_TILE_RADIUS );
}

function getAllAdjacentHexes( hex ) {
    const shiftValue = (hex.x % 2 === 0) ? -1 : 0;
    return [
        new Hex( hex.x-1, hex.y+shiftValue ),
        new Hex( hex.x, hex.y-1 ),
        new Hex( hex.x+1, hex.y+shiftValue ),
        new Hex( hex.x-1, hex.y+1+shiftValue ),
        new Hex( hex.x, hex.y+1 ),
        new Hex( hex.x+1, hex.y+1+shiftValue )
    ];
}


/*** HEX & POINT CLASSES ***/


class Hex {
    constructor( xIndex, yIndex, sideLength = 0 ) {
        this.x = xIndex;
        this.y = yIndex;
        this.id = xIndex + "-" + yIndex;
        this.sideLength = sideLength;
        this.midPoint = Hex.calculateMidpoint( xIndex, yIndex, sideLength );
        this.vertices = Hex.calculateVertices( this.midPoint, sideLength );
    }

    static calculateMidpoint( x, y, sideLength ) {
        const offSetX = (sideLength / 2 * x) * -1;
        const offSetY = ( x % 2 === 1 ) ? Math.sqrt( 3 ) / 2 * sideLength : 0;

        return new Point(
            x * sideLength * 2 + offSetX,
            y * Math.sqrt( 3 ) / 2 * sideLength * 2 + offSetY
        );
    }

    static calculateVertices( midPoint, sideLength ) {
        let result = [];
        for ( let i = 0; i < 6; i++ ) {
            const degree = 60 * i;
            const radian = Math.PI / 180 * degree;
            result.push( new Point(
                midPoint.x + sideLength * Math.cos( radian ),
                midPoint.y + sideLength * Math.sin( radian )
            ) );
        }
        return result;
    }

    calculateDistance( hex ) {
        const xCoordinateThis = this.y - (this.x - this.x % 2) / 2;
        const adjustedCoordinatesThis = [
            xCoordinateThis,
            this.x,
            (0 - xCoordinateThis - this.x)
        ];
        const xCoordinateHex = hex.y - (hex.x - hex.x % 2) / 2;
        const adjustedCoordinatesHex = [
            xCoordinateHex,
            hex.x,
            (0 - xCoordinateHex - hex.x)
        ];
        return Math.max(
            Math.abs( adjustedCoordinatesThis[0] - adjustedCoordinatesHex[0]),
            Math.abs( adjustedCoordinatesThis[1] - adjustedCoordinatesHex[1]),
            Math.abs( adjustedCoordinatesThis[2] - adjustedCoordinatesHex[2])
        );
    }
}

class Point {
    constructor( x, y ) {
        this.x = x;
        this.y = y;
    }
}