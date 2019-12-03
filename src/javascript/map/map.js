const MAP_TILE_RADIUS = 4;
const TILE_SIDE_LENGTH = 10;

let tiles = [];

function generateRandomTiles( factionCount ) {
    //space out factions
    //don't place volcanoes next to capitals
    return [
        {
            id: "1,2",
            terrain: "1--"
        },
        {
            id: "1,3",
            terrain: "4--"
        },
        {
            id: "1,4",
            terrain: "3--"
        },
        {
            id: "1,5",
            terrain: "CAP"
        },
        {
            id: "2,2",
            terrain: "4--"
        },
        {
            id: "2,3",
            terrain: "3--"
        },
        {
            id: "2,4",
            terrain: "2--"
        },
        {
            id: "2,5",
            terrain: "1--"
        },
        {
            id: "2,6",
            terrain: "4--"
        },
        {
            id: "3,1",
            terrain: "3--"
        },
        {
            id: "3,2",
            terrain: "4--"
        },
        {
            id: "3,3",
            terrain: "5--"
        },
        {
            id: "3,4",
            terrain: "VOL"
        },
        {
            id: "3,5",
            terrain: "5--"
        },
        {
            id: "3,6",
            terrain: "2--"
        },
        {
            id: "4,1",
            terrain: "CAP"
        },
        {
            id: "4,2",
            terrain: "2--"
        },
        {
            id: "4,3",
            terrain: "1--"
        },
        {
            id: "4,4",
            terrain: "ATL"
        },
        {
            id: "4,5",
            terrain: "1--"
        },
        {
            id: "4,6",
            terrain: "4--"
        },
        {
            id: "4,7",
            terrain: "3--"
        },
        {
            id: "5,1",
            terrain: "4--"
        },
        {
            id: "5,2",
            terrain: "VOL"
        },
        {
            id: "5,3",
            terrain: "5--"
        },
        {
            id: "5,4",
            terrain: "4--"
        },
        {
            id: "5,5",
            terrain: "3--"
        },
        {
            id: "5,6",
            terrain: "2--"
        },
        {
            id: "6,2",
            terrain: "1--"
        },
        {
            id: "6,3",
            terrain: "2--"
        },
        {
            id: "6,4",
            terrain: "3--"
        },
        {
            id: "6,5",
            terrain: "4--"
        },
        {
            id: "6,6",
            terrain: "5--"
        },
        {
            id: "7,2",
            terrain: "2--"
        },
        {
            id: "7,3",
            terrain: "3--"
        },
        {
            id: "7,4",
            terrain: "2--"
        },
        {
            id: "7,5",
            terrain: "CAP"
        },
    ];
}

function createMap( divId, callbackFunction ) {
    let div = id( divId );
    let svg = document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
    const viewBoxWidth = (TILE_SIDE_LENGTH * 12);
    const viewBoxHeight = (TILE_SIDE_LENGTH * 13); //todo - what's special about these numbers?
    svg.setAttributeNS(null, "width", "100%" );
    svg.setAttributeNS(null, "viewBox", "0 0 " + viewBoxWidth + " " + viewBoxHeight );
    div.appendChild( svg );

    appendDefinitions( svg );

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

function appendDefinitions( svg ) {
    //todo - change patterns to hard-coded (do the same for the map? probably not)

    const tileImageNames = [
        { name: "atlantis", path: "atlantis.png" },
        { name: "volcano", path: "volcano.png" },
        //{ name: "cnt", path: "heroes/cnt.png" },
        //{ name: "hem", path: "heroes/hem.png" },
        //{ name: "dnt", path: "heroes/dnt.png" },
        //{ name: "atb", path: "heroes/atb.png" },
        //{ name: "lvm", path: "heroes/lvm.png" },
        //{ name: "mmc", path: "heroes/mmc.png" },
        //{ name: "jus", path: "heroes/jus.png" },
        //{ name: "krt", path: "heroes/krt.png" },
        //{ name: "lob", path: "heroes/lob.png" },
        { name: "sdm", path: "heroes/sdm.png" }
    ];

    let defs = document.createElementNS( "http://www.w3.org/2000/svg", "defs" );

    for ( let i = 0; i < tileImageNames.length * 2; i++ ) {
        const index = Math.floor( i / 2 );
        let pattern = document.createElementNS( "http://www.w3.org/2000/svg", "pattern" );
        pattern.id = tileImageNames[index].name + ( ( i % 2 === 0 ) ? "" : "-hover" );
        pattern.setAttributeNS(null, "patternUnits", "objectBoundingBox" );
        pattern.setAttributeNS(null, "x", "0" );
        pattern.setAttributeNS(null, "y", "0" );
        pattern.setAttributeNS(null, "width", "1" );
        pattern.setAttributeNS(null, "height", "1" );
        let image = document.createElementNS( "http://www.w3.org/2000/svg", "image" );
        image.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "https://seven.religionandstory.com/images/" + tileImageNames[index].path );
        image.setAttributeNS(null, "x", "0" );
        image.setAttributeNS(null, "y", "0" );
        image.setAttributeNS(null, "width", "20px" );
        image.setAttributeNS(null, "height", "18px" );
        if ( i % 2 !== 0 ) {
            image.setAttributeNS(null, "filter", "url(#hover)" );
        }
        pattern.appendChild( image );
        defs.appendChild( pattern );
    }

    //todo
    const grayMatrix =
        " 0 1 0 0 .5 " +
        " 0 1 0 0 .5 " +
        " 0 1 0 0 .5 " +
        " 0 1 0 1  0 ";
    let filter = document.createElementNS( "http://www.w3.org/2000/svg", "filter" );
    filter.id = "hover";
    filter.setAttributeNS(null, "x", "0" );
    filter.setAttributeNS(null, "y", "0" );
    let feColorMatrix = document.createElementNS( "http://www.w3.org/2000/svg", "feColorMatrix" );
    feColorMatrix.setAttributeNS(null, "in", "SourceGraphic" );
    feColorMatrix.setAttributeNS(null, "type", "matrix" );
    feColorMatrix.setAttributeNS(null, "values", grayMatrix );
    filter.appendChild( feColorMatrix );
    defs.appendChild( filter );

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