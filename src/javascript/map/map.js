const LINE_WIDTH = "2px";

let canvas;
let context;
let grid = [];

let hexHeight;
let hexWidth;

function createMap( divId, callbackFunction ) {
    let div = id( divId );
    canvas = div.createElement( "CANVAS" );
    //canvas.width = div.width;
    canvas.width = 200;
    canvas.height = 200;
    var context = canvas.getContext("2d");

    for ( let i = 0; i < 7; i++ ) {
        for ( let j = 0; j < 7; j++ ) {
            grid.push( new Hex( i, j, 20 ) )
        }
    }

    for ( let hex in grid ) {
        var item = grid[hex];
        context.beginPath();
        context.moveTo( item.points[0].x, item.points[0].y );

        for ( var k = 1; k < item.points.length; k++ ) {
            ctx.lineTo( item.points[k].x, item.points[k].y );
        }

        context.closePath();
        context.stroke();

        var text = item.id;
        context.fillStyle = "black";
        context.fillText( text, item.midPoint.x - 7, item.midPoint.y - item.size / 2.2 );
    }
}

function Point( x, y ) {
    this.x = x;
    this.y = y;
}

function Hex( x, y, size ) {
    this.size = 20;
    this.x = x;
    this.y = y;
    this.points = [];
    this.id = [];

    this.create = function( x, y ) {
        var offSetX = (size / 2 * x) * -1
        var offSetY = 0;

        if ( x % 2 == 1 ) {
            offSetY = Math.sqrt( 3 ) / 2 * this.size;
        }

        var center = new Point(
            x * this.size * 2 + offSetX,
            y * Math.sqrt( 3 ) / 2 * this.size * 2 + offSetY
        );

        this.midPoint = center;

        this.id[0] = x;
        this.id[1] = y;

        for ( var i = 0; i < 6; i++ ) {
            var degree = 60 * i;
            var radian = Math.PI / 180 * degree;

            var point = new Point(
                center.x + size * Math.cos( radian ),
                center.y + size * Math.sin( radian )
            );

            this.points.push( point );
        }
    };

    this.create( x, y );
}