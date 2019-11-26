const MAP_TILE_RADIUS = 4;
const TILE_SIDE_LENGTH = 10;

let tiles = [];

function createMap( divId, callbackFunction ) {
    let div = id( divId );
    let svg = document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
    const viewBoxWidth = (TILE_SIDE_LENGTH * 12);
    const viewBoxHeight = (TILE_SIDE_LENGTH * 13); //todo - what's special about these numbers?
    svg.setAttributeNS(null, "width", "100%" );
    svg.setAttributeNS(null, "viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight );
    div.appendChild( svg );

    appendPatterns( svg );

    const centerHex = new Hex( MAP_TILE_RADIUS, MAP_TILE_RADIUS, TILE_SIDE_LENGTH );
    const maxTileDepth = MAP_TILE_RADIUS * 2;
    for ( let i = 0; i < maxTileDepth; i++ ) {
       for ( let j = 0; j < maxTileDepth; j++ ) {
           const hex = new Hex( i, j, TILE_SIDE_LENGTH );
           if ( hex.calculateDistance( centerHex ) < MAP_TILE_RADIUS ) {
               tiles.push( hex );

               let tile = document.createElementNS( "http://www.w3.org/2000/svg", "g" );
               tile.setAttributeNS(null, "id", hex.id );
               tile.setAttributeNS(null, "class", "tile" );
               tile.setAttributeNS(null, "onclick", callbackFunction.name + "('" + hex.id + "')" );

               let polygon = document.createElementNS( "http://www.w3.org/2000/svg", "polygon" );
               polygon.setAttributeNS(null, "id", hex.id + "-polygon" );
               polygon.setAttributeNS(null, "points", hex.vertices.map( p => (p.x + "," + p.y) ).join(" ") );
               tile.appendChild( polygon );

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

function appendPatterns( svg ) {
    let defs = document.createElementNS( "http://www.w3.org/2000/svg", "defs" );

    //todo - make into loop that reads file names
    let pattern = document.createElementNS( "http://www.w3.org/2000/svg", "pattern" );
    pattern.id = "volcano";
    pattern.setAttributeNS(null, "patternUnits", "objectBoundingBox" );
    pattern.setAttributeNS(null, "x", "0" );
    pattern.setAttributeNS(null, "y", "0" );
    pattern.setAttributeNS(null, "width", "1" );
    pattern.setAttributeNS(null, "height", "1" );
    let image = document.createElementNS( "http://www.w3.org/2000/svg", "image" );
    image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "https://seven.religionandstory.com/images/volcano.png" );
    image.setAttributeNS(null, "x", "0" );
    image.setAttributeNS(null, "y", "0" );
    image.setAttributeNS(null, "width", "20px" );
    image.setAttributeNS(null, "height", "18px" );
    pattern.appendChild( image );
    defs.appendChild( pattern );

    let pattern2 = document.createElementNS( "http://www.w3.org/2000/svg", "pattern" );
    pattern2.id = "atlantis";
    pattern2.setAttributeNS(null, "patternUnits", "objectBoundingBox" );
    pattern2.setAttributeNS(null, "x", "0" );
    pattern2.setAttributeNS(null, "y", "0" );
    pattern2.setAttributeNS(null, "width", "1" );
    pattern2.setAttributeNS(null, "height", "1" );
    let image2 = document.createElementNS( "http://www.w3.org/2000/svg", "image" );
    image2.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "https://seven.religionandstory.com/images/atlantis.png" );
    image2.setAttributeNS(null, "x", "0" );
    image2.setAttributeNS(null, "y", "0" );
    image2.setAttributeNS(null, "width", "20px" );
    image2.setAttributeNS(null, "height", "18px" );
    pattern2.appendChild( image2 );
    defs.appendChild( pattern2 );

    svg.appendChild( defs );
}

class Hex {
    constructor( x, y, sideLength ) {
        this.x = x;
        this.y = y;
        this.id = x + "," + y;
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