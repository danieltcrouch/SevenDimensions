const LINE_WIDTH = "2px";

let canvas;
let context;
let tiles = [];

let hexHeight;
let hexWidth;

function createMap( divId, callbackFunction ) {
    let div = id( divId );
    //const computedStyle = getComputedStyle( div );
    canvas = document.createElement( "CANVAS" );
    div.appendChild( canvas );
    //canvas.width  = computedStyle.width  - 1;
    //canvas.height = computedStyle.height - 1;
    canvas.width  = 250;
    canvas.height = 250;
    let context = canvas.getContext("2d");

    const centerHex = new Hex( 3, 3, 20 );
    for ( let i = 0; i < 7; i++ ) {
        for ( let j = 0; j < 7; j++ ) {
            const hex = new Hex( i, j, 20 );
            if ( hex.calculateDistance( centerHex ) < 4 ) {
                tiles.push( hex );

                context.beginPath();
                context.moveTo( hex.vertices[0].x + 20, hex.vertices[0].y + 5 );
                for ( let k = 1; k < hex.vertices.length; k++ ) {
                    context.lineTo( hex.vertices[k].x + 20, hex.vertices[k].y + 5 );
                }
                context.closePath();
                context.stroke();

                context.fillStyle = "black";
                context.fillText( hex.id, hex.midPoint.x + 15, hex.midPoint.y + 5 );
            }
        }
    }
}

class Hex {
    constructor( x, y, diameter ) {
        this.x = x;
        this.y = y;
        this.id = x + "," + y;
        this.diameter = diameter;
        this.midPoint = Hex.calculateMidpoint( x, y, diameter );
        this.vertices = Hex.calculateVertices( this.midPoint, diameter );
    }

    static calculateMidpoint( x, y, size ) {
        const offSetX = (size / 2 * x) * -1;
        const offSetY = ( x % 2 === 1 ) ? Math.sqrt( 3 ) / 2 * size : 0;

        return new Point(
            x * size * 2 + offSetX,
            y * Math.sqrt( 3 ) / 2 * size * 2 + offSetY
        );
    }

    static calculateVertices( midPoint, size ) {
        let result = [];
        for ( let i = 0; i < 6; i++ ) {
            const degree = 60 * i;
            const radian = Math.PI / 180 * degree;
            result.push( new Point(
                midPoint.x + size * Math.cos( radian ),
                midPoint.y + size * Math.sin( radian )
            ) );
        }
        return result;
    }

    calculateDistance( hex ) {
        let result = 0;
        const xDistance = Math.abs( hex.x - this.x );
        const yDistance = Math.abs( hex.y - this.y );
        if ( this.x === hex.x ) {
            result = yDistance;
        }
        else if ( this.y === hex.y ) {
            result = xDistance;
        }
        else if ( this.y < hex.y ) {
            result = xDistance + yDistance - Math.floor( xDistance / 2.0 );
        }
        else {
            result = xDistance + yDistance - Math.ceil( xDistance / 2.0 );
        }
        return result;
    }
}

class Point {
    constructor( x, y ) {
        this.x = x;
        this.y = y;
    }
}