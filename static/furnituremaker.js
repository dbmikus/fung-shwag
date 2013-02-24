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

function drawEllipse(ctx, location, orientation, color, dimensions) {
    var x = location[0];
    var y = location[1];
    var w = dimensions[0];
    var h = dimensions[1];

    var kappa = .5522848;
    ox = (w / 2) * kappa, // control point offset horizontal
    oy = (h / 2) * kappa, // control point offset vertical
    xe =  w,           // x-end
    ye =  h,           // y-end
    xm =  w / 2,       // x-middle
    ym =  h / 2;       // y-middle
	//save original coordinates
	ctx.save();
	
    ctx.fillStyle = color;
	//Move context to the point you are rotating around (the center of your drawing)
	ctx.translate(location[0], location[1]);
	//Rotate the canvas(angle in radians)
	ctx.rotate(orientation);
	
	//draw the ellipse
    ctx.beginPath();
    ctx.moveTo(0, ym);
    ctx.bezierCurveTo(0, ym - oy, xm - ox, 0, xm, 0);
    ctx.bezierCurveTo(xm + ox, 0, xe, ym - oy, xe, ym);
    ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    ctx.bezierCurveTo(xm - ox, ye, 0, ym + oy, 0, ym);
    ctx.closePath();
    ctx.fill();
	
	//rotate back
	ctx.rotate(-(orientation));
	//restore the canvas origin
	ctx.restore();
}


function drawOval(ctx, location, orientation, color, dimensions){
	//save the context
	ctx.save();

	//move the origin to where we are drawing
	ctx.translate(location[0], location[1]);
	//scale the dimensions so we can make an oval
	ctx.scale(dimensions[0] / 4 , 1);
	//rotate the canvas so we get the desired orientation
	ctx.rotate(orientation);

	ctx.fillStyle = color;
	// draw the oval
	ctx.beginPath();
    // We draw with the x and y coordinates set to 0 since we moved our origin
	ctx.arc(0, 0, dimensions[1], 0, 2 * Math.PI, false);
	//rotate the canvas back in the opposite (might not be necesarry with ctx.restore();
	ctx.rotate(-(orientation));
    ctx.fill();

	//restore the canvas to its unstretched state
	ctx.restore();
}
