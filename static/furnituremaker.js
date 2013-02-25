//assuming a canvas is written. and a furniture object is of the following form

/*
{
location : [x,y],
orientation : radians,
color : color,
dimensions : [width, height] ,
metadata : { author : author, date: date, category} ,
assembly : []
}


*/

// orientation is stored as radians, color as a hex, location as an array [x,y],
// dimensions stored as an array [width, height]
// ctx should be a 2d canvas context
function drawRectangle(ctx, location, orientation, color, dimensions) {
    ctx.save();

	//Move context to the point you are rotating around (the center of your drawing)
	ctx.translate(location[0], location[1]);
	//Rotate the canvas(angle in radians)
	ctx.rotate(orientation);

	ctx.fillStyle = color;
	//draw the object
	ctx.fillRect(dimensions[0]/2, dimensions[1]/2, dimensions[0], dimensions[1]);
	//rotate the canvas back in the opposite direction
	ctx.rotate(-(orientation));

    ctx.restore();
}

function drawCircle(ctx, location, color, dimensions) {
    ctx.fillStyle = color;
    ctx.beginPath();
	ctx.arc(location[0], location[1], dimensions[1], 0, 2 * Math.PI, false);
    ctx.fill();
}

// Source from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
// Author: Steve Tranby on StackOverflow
function drawEllipse(ctx, location, orientation, color, dimensions) {
    var x = location[0];
    var y = location[1];
    var w = dimensions[0];
    var h = dimensions[1];
    var kappa = .5522848;

	//save original coordinates
	ctx.save();

    ctx.fillStyle = color;
	//Move context to the point you are rotating around (the center of your drawing)
	ctx.translate(location[0], location[1]);

    // Redefining variables so that we draw around origin
    x = -(w/2);
    y = -(h/2);
    var ox = (w / 2) * kappa; // control point offset horizontal
    var oy = (h / 2) * kappa; // control point offset vertical
    var xe = x + w;           // x-end
    var ye = y + h;           // y-end
    var xm = x + w / 2;       // x-middle
    var ym = y + h / 2;       // y-middle

	//Rotate the canvas(angle in radians)
	ctx.rotate(orientation);

	//draw the ellipse
    ctx.beginPath();
    ctx.moveTo(x, ym);
    ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

    ctx.closePath();
    ctx.fill();

	//rotate back
	ctx.rotate(-(orientation));
	//restore the canvas origin
	ctx.restore();
}
