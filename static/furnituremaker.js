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

//orientation is stored as radians, color as a hex, location as an array [x,y], dimensions stored as an array [width, height]
function drawRectangle( location , orientation, color, dimensions ) {

	ctx.fill = color;
	
	//Move context to the point you are rotating around (the center of your drawing) 
	ctx.translate(location[0], location[1]);
	//Rotate the canvas(angle in radians)
	ctx.rotate(orientation);
	//draw the object
	ctx.fillRect(dimensions[0]/2, dimensions[1]/2, dimensions[0], dimensions[1]);
	//rotate the canvas back in the opposite direction
	ctx.rotate(-(orientation)); 
}

function drawCircle( location, color, dimensions) {
	ctx.arc(location[0], location[1], dimensions[1] , 0 , 2 * Math.PI, false)
}

function drawOval(location, orientation, color, dimensions){
	ctx.fill = color; 
	//save the context
	ctx.save();
	//move the origin to where we are drawing
	ctx.translate(location[0], location[1]);
	//scale the dimensions so we can make an oval
	ctx.scale( dimensions[0] * dimensions[1] / 4 , 1);
	
	//rotate the canvas so we get the desired orientation
	ctx.rotate(orientation); 
	// draw the oval
	ctx.beginPath();
	ctx.arc(location[0], location[1], dimensions[1] , 0 , 2 * Math.PI, false);
	//rotate the canvas back in the opposite (might not be necesarry with ctx.restore();
	ctx.rotate(-(orientation));
	//restore the canvas to its unstretched state
	ctx.restore();
	//style things can go here
	//
	//
	
}