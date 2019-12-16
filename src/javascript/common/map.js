//redblobgames.com/grids/hexagons/

const MAP_TILE_RADIUS = 4;
const TILE_SIDE_LENGTH = 10;


/*** GENERATE NEW MAP ***/


function generateNewMap( factionCount ) {
    let natureDeck = new Deck();
    TILE_TYPES.filter( t => isNatureTile( t, true ) ).forEach( function( tileType ) {
        for ( let i = 0; i < tileType.count; i++ ) {
            natureDeck.insertCard( Tile.getNewTile( null, tileType, i ), true );
        }
    } );

    let result = [];
    let natureTiles = natureDeck.cards;
    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS, 0 );
    const maxTileDepth = MAP_TILE_RADIUS * 2;
    const capitalHexIds = getCapitalHexes( factionCount );
    for ( let i = 0; i < maxTileDepth; i++ ) {
        for ( let j = 0; j < maxTileDepth; j++ ) {
            const hex = new Hex( i, j, 0 );
            if ( hex.calculateDistance( centerHex ) < MAP_TILE_RADIUS ) {
                //todo 2 - volcanoes are appearing next to capitals
                if ( hex.id === centerHex.id ) {
                    result.push( Tile.getAtlantisTile( hex.id ) );
                }
                else if ( capitalHexIds.includes( hex.id ) ) {
                    result.push( Tile.getCapitalTile( hex.id ) );
                }
                else if ( isAdjacentToCapitalHex( hex, capitalHexIds ) ) {
                    let natureTile = natureTiles.splice( natureTiles.findIndex( t => t.tileType.id !== VOLCANO ), 1 )[0];
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
    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS, 0 );
    const maxTileDepth = MAP_TILE_RADIUS * 2;
    for ( let i = 0; i < maxTileDepth; i++ ) {
        for ( let j = 0; j < maxTileDepth; j++ ) {
            const hex = new Hex( i, j, 0 );
            if ( hex.calculateDistance( centerHex ) === MAP_TILE_RADIUS - 1 ) {
                if ( getAllAdjacentHexes( hex ).filter( h => h.calculateDistance( centerHex ) < MAP_TILE_RADIUS ).length <= 3 ) { //Corner hex
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

function getAllAdjacentHexes( hex ) {
    const shiftValue = (hex.x % 2 === 0) ? -1 : 0;
    return [
        new Hex( hex.x-1, hex.y+shiftValue, 0 ),
        new Hex( hex.x, hex.y-1, 0 ),
        new Hex( hex.x+1, hex.y+shiftValue, 0 ),
        new Hex( hex.x-1, hex.y+1+shiftValue, 0 ),
        new Hex( hex.x, hex.y+1, 0 ),
        new Hex( hex.x+1, hex.y+1+shiftValue, 0 )
    ];
}


/*** GENERATE MAP DISPLAY ***/


function generateMapSVG( callbackFunction ) {
    //todo 2 - Finish all Map work, including making image tiles, adding units, highlighting tiles, displaying icons
    //  You don't have to finish the actual images for each thing, just make placeholders that can be easily subbed out later
    let svg = id( "map" );
    const maxTileDepth = MAP_TILE_RADIUS * 2;
    const viewBoxWidth = (TILE_SIDE_LENGTH * 1.5 * maxTileDepth); //point-to-point hexagon height
    const viewBoxHeight = (TILE_SIDE_LENGTH * Math.sqrt( 3 ) * maxTileDepth); //flat hexagon height
    svg.setAttributeNS(null, "viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight );

    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS, TILE_SIDE_LENGTH );
    for ( let i = 0; i < maxTileDepth; i++ ) {
       for ( let j = 0; j < maxTileDepth; j++ ) {
           const hex = new Hex( i, j, TILE_SIDE_LENGTH );
           if ( hex.calculateDistance( centerHex ) < MAP_TILE_RADIUS ) {
               let tile = document.createElementNS( "http://www.w3.org/2000/svg", "g" );
               tile.setAttributeNS(null, "id", hex.id );
               tile.setAttributeNS(null, "onclick", callbackFunction.name + "('" + hex.id + "')" );
               tile.classList.add( "tile" );

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

    let selectedShape = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
    selectedShape.setAttributeNS(null, "id", "selected-polygon" );
    selectedShape.setAttributeNS(null, "fill", "transparent");
    selectedShape.classList.add( "tile" );
    selectedShape.style.stroke = "gold";
    selectedShape.style.fill = "transparent";
    svg.appendChild( selectedShape );
}


/*** HEX & POINT CLASSES ***/


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