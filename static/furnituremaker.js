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

var F = (function () {

var F = {};

// orientation is stored as radians, color as a hex, location as an array [x,y],
// dimensions stored as an array [width, height]
// ctx should be a 2d canvas context
F.drawRectangle = function(ctx, location, orientation, color, dimensions) {
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

F.drawCircle = function(ctx, location, color, dimensions) {
    ctx.fillStyle = color;
    ctx.beginPath();
	ctx.arc(location[0], location[1], dimensions[1], 0, 2 * Math.PI, false);
    ctx.fill();
}

// Source from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
// Author: Steve Tranby on StackOverflow
F.drawEllipse = function(ctx, location, orientation, color, dimensions) {
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

F.addFurniture = function(type, mouseX, mouseY, dimensionX, dimensionY, orientation, color) {
	furniture.push({
	'type': type,
	'location' : [mouseX,mouseY] ,
	'dimensions': [dimensionX,dimensionY],
	'orientation': orientation,
	'color' : color
	});
}

//assuming arguments are passed in the form (position of furniture object in furniture array, mode, new value)
F.editFurniture = function( arguments) {
	var mode = arguments[1];
	var i = arguments[0];

	//assuming clicking with this tool activated calls the function properly.
	if (mode === 'move') {
		furniture[i].location = [mouseX,mouseY];
	}
	//assuming resize buttons call this function with arguments (i, 'resize', +-x)
	if (mode === 'resize') {
		furniture[i].dimensions = [furniture.dimensions[0] + arguments[2],
                                   furniture.dimensions[1] + arguments[2]];
	}
	//assuming after rotation is completed, calls function with arguments (i , 'rotate' , orientation)
	if (mode === 'rotate') {
		furniture[i].orientation = arguments[2];
	}
	//assuming button calls with arguments ( i, 'paint', hexcolor)
	if (mode ==='paint'){
		furniture[i].color = arguments[2];
	}
}


F.drawFurniture = function(location, dimensions, orientation, svg){
    // I'm not sure if this function is part of the script loaded or if its built into canvas
    // or if it even works. and how

    //save canvas state
	ctx.save();

    // translate canvas to spot to be rotated around
    // We draw the furniture around the center of the x and y coordinates
	ctx.translate(location.x, location.y);

    //Rotate the canvas(angle in radians)
	ctx.rotate(orientation);

    // draw it. This assumes the object svg is an image object with svg.source set as
    // the path to the svg file.
	ctx.drawImage(svg, -(dimensions[0]/4), -(dimensions[1]/4));

    //rotate it back
	ctx.rotate(-(orientation));

    //restore canvas
	ctx.restore();
}

return F;

})();
