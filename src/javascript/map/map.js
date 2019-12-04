//redblobgames.com/grids/hexagons/

const MAP_TILE_RADIUS = 4;
const TILE_SIDE_LENGTH = 10;

const RESOURCE_TYPES = [ "A", "C", "U" ];

const TILE_TYPES = [
//Counts inflated from real game in order to fill full hexagon map
{ type: "NATURE",   value: 0, count: 3, resourceCount: 0 },
{ type: "NATURE",   value: 1, count: 3, resourceCount: 0 },
{ type: "NATURE",   value: 2, count: 8, resourceCount: 6 },
{ type: "NATURE",   value: 3, count: 9, resourceCount: 0 },
{ type: "NATURE",   value: 4, count: 8, resourceCount: 6 },
{ type: "NATURE",   value: 5, count: 3, resourceCount: 0 },
{ type: "CAPITAL",  value: 6, count: 6, resourceCount: 0 },
{ type: "ATLANTIS", value: 7, count: 1, resourceCount: 1 }
];

function generateRandomTiles( factionCount ) {
    let rawTiles = [];
    TILE_TYPES.filter( t => t.type === "NATURE" ).forEach( function( type ) {
        for ( let i = 0; i < type.count; i++ ) {
            rawTiles.push( {
                id: null,
                type: type.type,
                value: type.value,
                resource: (i < type.resourceCount) ? RESOURCE_TYPES[Math.floor(Math.random() * RESOURCE_TYPES.length)] : null,
                description: function() { return "" + this.value + (this.resource ? (", Resource: " + this.resource) : "") }
            } );
        }
    } );

    for ( let i = rawTiles.length - 1; i > 0; i-- ) {
        const j = Math.floor(Math.random() * (i + 1));
        [rawTiles[i], rawTiles[j]] = [rawTiles[j], rawTiles[i]];
    }

    let result = [];
    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS, 0 );
    const maxTileDepth = MAP_TILE_RADIUS * 2;
    for ( let i = 0; i < maxTileDepth; i++ ) {
        for ( let j = 0; j < maxTileDepth; j++ ) {
            const hex = new Hex( i, j, 0 );
            if ( hex.calculateDistance( centerHex ) < MAP_TILE_RADIUS ) {
                if ( hex.id === centerHex.id ) {
                    const ATLANTIS_TYPE = TILE_TYPES.find( t => t.type === "ATLANTIS" );
                    result.push( {
                        id: null,
                        type: ATLANTIS_TYPE.type,
                        value: ATLANTIS_TYPE.value,
                        resource: "ALL",
                        description: function() { return "Atlantis"; }
                    } );
                }
                else if ( isCapitalHex( hex, factionCount ) ) {
                    const CAPITAL_TYPE = TILE_TYPES.find( t => t.type === "CAPITAL" );
                    result.push( {
                        id: null,
                        type: CAPITAL_TYPE.type,
                        value: CAPITAL_TYPE.value,
                        resource: null,
                        description: function() { return "Capital"; }
                    } );
                }
                else if ( isAdjacentToCapitalHex( hex, factionCount ) ) {
                    let tileIndex = rawTiles.findIndex( t => t.value > 0 );
                    result.push( rawTiles[tileIndex] );
                    rawTiles.splice( tileIndex, 1 );
                }
                else {
                    result.push( rawTiles.shift() );
                }

                result[result.length - 1].id = hex.id;
            }
        }
    }

    return result;
}

function isCapitalHex( hex, factionCount ) {
    let result = false;
    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS, 0 );
    if ( hex.calculateDistance( centerHex ) === MAP_TILE_RADIUS - 1 )
    {
        let isActiveCapital = false;
        const isCorner = getAllAdjacentHexes( hex ).filter( h => h.calculateDistance( centerHex ) < MAP_TILE_RADIUS ).length <= 3;
        if ( isCorner )
        {
            const isVerticalTop = hex.y < MAP_TILE_RADIUS;
            const isHorizontalMiddle = hex.x === MAP_TILE_RADIUS;
            const isHorizontalLeft = hex.x < MAP_TILE_RADIUS;
            const isHorizontalRight = hex.x > MAP_TILE_RADIUS;

            if ( ( isVerticalTop  && isHorizontalLeft ) || //top-left
                 ( isVerticalTop  && isHorizontalMiddle && factionCount >=  5 ) || //top-middle
                 ( isVerticalTop  && isHorizontalRight  && factionCount >=  3 ) || //top-right
                 ( !isVerticalTop && isHorizontalLeft   && factionCount >=  4 ) || //bottom-left
                 ( !isVerticalTop && isHorizontalMiddle && factionCount === 3 ) || //bottom-middle
                 ( !isVerticalTop && isHorizontalRight  && factionCount !== 3 ) || //bottom-right
                 ( factionCount === 6 ) ) {
                isActiveCapital = true;
            }
        }
        result = isActiveCapital;
    }
    return result;
}

function isAdjacentToCapitalHex( hex, factionCount ) {
    return getAllAdjacentHexes( hex ).some( h => isCapitalHex( h, factionCount ) );
}

function getAllAdjacentHexes( hex ) {
    const shiftValue = (hex.x % 2 === 0) ? -1 : 0;
    return [
        new Hex( hex.x-1, hex.y+shiftValue, 0 ),
        new Hex( hex.x,      hex.y-1, 0 ),
        new Hex( hex.x+1, hex.y+shiftValue, 0 ),
        new Hex( hex.x-1, hex.y+1+shiftValue, 0 ),
        new Hex( hex.x,      hex.y+1, 0 ),
        new Hex( hex.x+1, hex.y+1+shiftValue, 0 )
    ];
}

function createMap( callbackFunction ) {
    let svg = id( "map" );
    const viewBoxWidth = (TILE_SIDE_LENGTH * 12);
    const viewBoxHeight = (TILE_SIDE_LENGTH * 13.5); //todo - what's special about these numbers?
    svg.setAttributeNS(null, "viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight );

    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS, TILE_SIDE_LENGTH );
    const maxTileDepth = MAP_TILE_RADIUS * 2;
    for ( let i = 0; i < maxTileDepth; i++ ) {
       for ( let j = 0; j < maxTileDepth; j++ ) {
           const hex = new Hex( i, j, TILE_SIDE_LENGTH );
           if ( hex.calculateDistance( centerHex ) < MAP_TILE_RADIUS ) {
               let tile = document.createElementNS( "http://www.w3.org/2000/svg", "g" );
               tile.setAttributeNS(null, "id", hex.id );
               tile.setAttributeNS(null, "class", "tile" );
               tile.setAttributeNS(null, "onclick", callbackFunction.name + "('" + hex.id + "')" );

               let polygonImage = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
               polygonImage.setAttributeNS(null, "id", hex.id + "-polygon-i" );
               polygonImage.setAttributeNS(null, "points", hex.vertices.map( p => (p.x + "," + p.y) ).join(" ") );
               polygonImage.classList.add( "polygonImage" );
               tile.appendChild( polygonImage );

               let polygonShape = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
               polygonShape.setAttributeNS(null, "id", hex.id + "-polygon-s" );
               polygonShape.setAttributeNS(null, "points", hex.vertices.map( p => (p.x + "," + p.y) ).join(" ") );
               polygonShape.classList.add( "polygonShape" );
               tile.appendChild( polygonShape );

               let text = document.createElementNS( "http://www.w3.org/2000/svg", "text" );
               text.setAttributeNS(null, "id", hex.id + "-text" );
               text.setAttributeNS(null, "x", hex.midPoint.x );
               text.setAttributeNS(null, "y", hex.midPoint.y );
               text.setAttributeNS(null, "class", "tileText" );
               text.innerHTML = "" + j;
               tile.appendChild( text );

               svg.appendChild( tile );
           }
       }
    }
}

class Hex {
    constructor( x, y, sideLength ) {
        this.x = x;
        this.y = y;
        this.id = x + "-" + y;
        this.sideLength = sideLength;
        this.midPoint = Hex.calculateMidpoint( x, y, sideLength );
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