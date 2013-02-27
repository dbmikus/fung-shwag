///////////////////
// Global Values //
///////////////////
var canvas = document.getElementById("blueprint");
var ctx = canvas.getContext("2d");
//scale = pixels/foot
var scale = 30;
// Walls is of form: {'color': string, 'coordinates': [...]}
var walls = {'status': 'unselected',
             'color': 'white',
             'coordinates': []};
// Rooms hold closed walls segments
var subrooms = [];
var roomClosed = false;
//furniture is an array of furniture objects
var furniture = [];
//walls are stored as 4 tuples in the following way
// [starting X coord, starting y coord, ending x cooord, ending y coord]
var currentTool = "none";
var currentFurniture = "none";
var currentlySelectedFurniture = -1;
//used for creating walls
var prevWallCoord = null;
//the offset of the current view from the origin
var xOffset = 0;
var yOffset = 0;

var zoomInBtn = new Image;
zoomIn.src = "static/icons/zoomIn.svg"

var resize = new Image;
resize.src = "static/icons/resize.svg"

var zoomOutBtn = new Image;
zoomOut.src = "static/icons/zoomOut.svg"

var rotate = new Image;
rotate.src = "static/icons/rotate.svg"

var move = new Image;
move.src = "static/icons/move.svg"

var delButton = new Image;
delButton.src = "static/icons/delete.svg"


var furnitureTypes =
{
    "bed":{"topdown":true,"path":"static/icons/bed.svg"},
    "bigFridge":{"topdown":false,"path":"static/icons/bigFridge.svg"},
    "bunkBed":{"topdown":false,"path":"static/icons/bunkBed.svg"},
    "chair":{"topdown":false,"path":"static/icons/chair.svg"},
    "couch":{"topdown":false,"path":"static/icons/couch.svg"},
    "desk":{"topdown":false,"path":"static/icons/desk.svg"},
    "deskChair":{"topdown":false,"path":"static/icons/deskChair.svg"},
    "door":{"topdown":false,"path":"static/icons/door.svg"},
    "doubleBed":{"topdown":true,"path":"static/icons/doubleBed.svg"},
    "dresser":{"topdown":false,"path":"static/icons/dresser.svg"},
    "hamper":{"topdown":false,"path":"static/icons/hamper.svg"},
    "lamp":{"topdown":false,"path":"static/icons/lamp.svg"},
    "microwave":{"topdown":false,"path":"static/icons/microwave.svg"},
    "miniFridge":{"topdown":false,"path":"static/icons/miniFridge.svg"},
    "poop":{"topdown":true,"path":"static/icons/poop.svg"},
    "roundTable":{"topdown":false,"path":"static/icons/roundTable.svg"},
    "rug":{"topdown":false,"path":"static/icons/rug.svg"},
    "shelves":{"topdown":false,"path":"static/icons/shelves.svg"},
    "table":{"topdown":false,"path":"static/icons/table.svg"},
    "trash":{"topdown":false,"path":"static/icons/trash.svg"},
    "twinBed":{"topdown":true,"path":"static/icons/twinBed.svg"}
}

for(key in furnitureTypes){
    var temp = new Image();
    temp.src = furnitureTypes[key]["path"];
    furnitureTypes[key]["image"] = temp;
    furnitureTypes[key].dimensions = G.point(6,3);
}


/////////////////////////////
// End of Global Variables //
/////////////////////////////
function main() {
    // Adding listeners to canvas
    canvas.addEventListener("mousedown", canvasOnMouseDown, false);
    canvas.addEventListener("mousemove", canvasMouseMove, false);
    // adding listeners to control driller
    // Focusing canvas so it can register events
    // canvas.setAttribute('tabindex','0');
    // canvas.focus();
    canvas.addEventListener('keydown', canvasKeyDown, false);

    // Adding listeners for all the tool buttons

    // Clicking on the wall_tool button toggles the wall drawing function
    $("#wall_tool").click(toggleWallTool);

    // Clicking on the zoom out button zooms out, but does not change
    // current tool
    $("#zoom_out").click(zoomOut);

    // Clicking on the zoom in button zooms in, but does not change
    // current tool
    $("#zoom_in").click(zoomIn);
    $("#load").click(loadRoom);
    $("#save").click(saveRoom);

    setUpScreen();
}

function selectFurnitureType(key){
    var furnKey = key;
    return function(){
        currentFurniture = furnKey;
        if (currentTool ==="drawWall"){
            toggleWallTool();
        }
        currentTool = "placeFurniture";
    }
}




//binds ready and resize so that the canvas is alway sthe right side
//called in main
function setUpScreen(){
    $(document).ready(function(){
        $('#blueprint').attr({width: $(window).width()-300, height: $(window).height()-26});
        drawBlueprint();
});
    $(window).resize(function(){
        $('#blueprint').attr({width: $(window).width()-300, height: $(window).height()-26});
        drawBlueprint();
    });

    var furnitureList = $("#furniturelist");
    var f = Object.keys(furnitureTypes);
    for(var i=0; i<f.length; i++){
        var temp = $('<li>');
        temp.attr("id","addFurniture-"+f[i]);
        temp.html("<img class='svg' src='/"+
            furnitureTypes[f[i]]["path"]
            +"' width='50' height='50'/>");
        temp.append(f[i]);
        temp.click(selectFurnitureType(f[i]));
        furnitureList.append(temp);
    }

}


// Configures the background stuff for the blueprint
function setUpBlueprint() {
    ctx.fillStyle = "#1B438C"
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.lineWidth =1;

    // Drawing vertical grid lines
    for(var i = 0; i< (canvas.width)/scale; i++){
        if (i%4 === 0){
            ctx.strokeStyle="lightblue"
        }else
            ctx.strokeStyle = "blue";
        ctx.beginPath();
        ctx.moveTo(i*scale,0);
        ctx.lineTo(i*scale,canvas.height);
        ctx.stroke();
        ctx.closePath();
    }
    // Drawing horizontal grid lines
    for(var i = 0; i< (canvas.height)/scale; i++){
        if (i%4 === 0){
            ctx.strokeStyle="lightblue"
        }else
            ctx.strokeStyle = "blue";

        ctx.beginPath();
        ctx.moveTo(0,i*scale);
        ctx.lineTo(canvas.width,i*scale);
        ctx.stroke();
        ctx.closePath();
    }
}


// Draws a button onscreen. Draws with origin at center,
// but rotates around center of button
function drawButton(x,y, rotation) {
    var bwidth = 50;
    var bheight = 100;
    // var buttonStroke = "#1B436C";
    var buttonStroke = "#001067";
    // var buttonFill = "#0010a7";
    var buttonFill = fillStyle = "#1B43AC";
    var blineWidth = 4;

    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(rotation);

    var fontStyle = "40px Arial";
    var fontFill = "lightblue";

    ctx.fillStyle = buttonFill;
    ctx.lineWidth = blineWidth;
    ctx.strokeStyle = buttonStroke;
    drawRoundedRectangle(ctx, -bwidth/2, -bheight/2,
                         bwidth, bheight, 10);
    ctx.fillStyle = fontFill;
    ctx.font = fontStyle;
    ctx.fillText("►", 5 - bwidth/2, 65 - bheight/2);

    ctx.restore();
}

// Draws all of the onscreen buttons
function drawButtons() {
    // Drawing top button
    drawButton(canvas.width/2, 22, 3*Math.PI / 2);
    // Drawing left button
    drawButton(20, canvas.height/2, Math.PI);
    // Drawing bottom button
    drawButton(canvas.width/2, canvas.height-22, Math.PI/2);
    // Drawing right button
    drawButton(canvas.width-20, canvas.height/2, 0);
}

function drawWall (walls) {
    // Drawing each wall in our wall array
    var coords = walls.coordinates;
    var prevCoord = null;
    ctx.lineWidth = 5;
    ctx.strokeStyle = walls.color;
    ctx.beginPath();

    for (var i = 0; i< coords.length; i++){
        var unscaled = unscalePoint(coords[i].x, coords[i].y);
        // If there was no previous coordinate, we just move to the first one
        if (prevCoord === null) {
            ctx.moveTo(unscaled.x, unscaled.y);
            prevCoord = coords[i];
        }
        // Otherwise, draw from the previous to the current and then move to
        // the current
        else {
            ctx.lineTo(unscaled.x, unscaled.y);
        }
    }
    ctx.stroke();
    ctx.closePath();
}

function drawFurnitureButtons(furn){
    var p = furn.location;
    var unscaledP = unscalePoint(p.x, p.y);
    var unscaledDims = unscaleDim(furn.dimensions.x, furn.dimensions.y);
    var innerIcon = getInnerIconPosition(furn);

    F.drawCircle(ctx, [innerIcon[0],innerIcon[2]],"red",[0,scale/2]);
	ctx.drawImage(delButton, innerIcon[0] -scale/3, innerIcon[2]-scale/3,
        scale*.66,  scale*.66);

    F.drawCircle(ctx,[(innerIcon[0]+innerIcon[1])/2,
                      (innerIcon[2]+innerIcon[3])/2], "purple",[0,scale/2]);
	ctx.drawImage(move,(innerIcon[0] +innerIcon[1])/2 - scale/3,
					(innerIcon[2] + innerIcon[3])/2 -scale/3,
						scale*.66,  scale*.66);

    F.drawCircle(ctx,[innerIcon[1]+20,
                      (innerIcon[2]+innerIcon[3])/2], "yellow",[0,scale/2]);
	ctx.drawImage(rotate, innerIcon[1]+20 -scale/3,
					(innerIcon[2] + innerIcon[3])/2 - scale/3,
						scale*.66, scale*.66);
    F.drawCircle(ctx,[innerIcon[1],
                      innerIcon[3]], "green",[0,scale/2]);
	ctx.drawImage(resize, innerIcon[1]-scale/3, innerIcon[3] - scale/3,
					scale*.66,scale*.66);



}


// Draws an array of furniture objects
function drawFurniture(furniture) {
    furniture.forEach(function (furn,index) {
        var p = furn.location;
        var unscaledP = unscalePoint(p.x, p.y);
        var unscaledDims = unscaleDim(furn.dimensions.x, furn.dimensions.y);

        F.drawFurniture(unscaledP, unscaledDims, furn.orientation, furn.image);

        if (index === currentlySelectedFurniture){
            drawFurnitureButtons(furn)
        }

    });
}

// Draws everything on the blueprint
function drawBlueprint() {
    setUpBlueprint();

    // Draw all stored, closed-wall shapes
    subrooms.forEach(function (walls) {
        drawWall(walls);
    });
    // draw current working open-wall shape
    drawWall(walls);

    // Draw current wall dot
    if(prevWallCoord && currentTool === "drawWall") {
        ctx.strokeStyle = "black";
        ctx.lineWidth   = 1;
        ctx.fillStyle   = "red";

        var unscaled = unscalePoint(prevWallCoord.x, prevWallCoord.y);

        drawRoundedRectangle(ctx, unscaled.x - scale/4, unscaled.y - scale/4,
                             scale/2, scale/2, scale/4);
    }

    // Draw the furniture
    drawFurniture(furniture);

    drawButtons();
}


function drawRoundedRectangle(ctx,x,y,width,height,radius) {
    ctx.beginPath();
    ctx.moveTo(x,y+radius);
    ctx.lineTo(x,y+height-radius);
    ctx.quadraticCurveTo(x,y+height,x+radius,y+height);
    ctx.lineTo(x+width-radius,y+height);
    ctx.quadraticCurveTo(x+width,y+height,x+width,y+height-radius);
    ctx.lineTo(x+width,y+radius);
    ctx.quadraticCurveTo(x+width,y,x+width-radius,y);
    ctx.lineTo(x+radius,y);
    ctx.quadraticCurveTo(x,y,x,y+radius);
    ctx.fill();
    ctx.stroke();
}

// Checks for a click on canvas can buttons.
// Pans if there was such a click, and returns true to indicate click.
// Returns false if we did not click on a button.
function checkPanClick(mouseX, mouseY) {
    // Pan up
    // The center of the button's click location
    var bcenter = G.point(canvas.width/2, 0 + 22);
    if(mouseY >= 0 && mouseY <= bcenter.y + 50/2 &&
       mouseX >= bcenter.x - 100/2 && mouseX <= bcenter.x + 100/2) {
        yOffset+= 4;
        drawBlueprint();
        return true;
    }
    // Pan left
    bcenter.x = 20;
    bcenter.y = canvas.height/2;
    if (mouseX >= 0 && mouseX <= bcenter.x + 50/2 &&
        mouseY >= bcenter.y - 100/2 && mouseY <= bcenter.y + 100/2) {
        xOffset+= 4;
        drawBlueprint();
        return true;
    }
    // Pan down
    bcenter.x = canvas.width/2;
    bcenter.y = canvas.height - 22;
    if (mouseX >= bcenter.x - 100/2 && mouseX <=  bcenter.x + 100/2 &&
        mouseY >= bcenter.y - 50/2 && mouseY <= canvas.height) {
        yOffset-= 4;
        drawBlueprint();
        return true;
    }
    // Pan right
    bcenter.x = canvas.width - 20;
    bcenter.y = canvas.height/2;
    if (mouseX >= bcenter.x - 50/2 && mouseX <= canvas.width &&
        mouseY >= bcenter.y - 100/2 && mouseY <= bcenter.y + 100/2) {
        xOffset-= 4;
        drawBlueprint();
        return true;
    }

    return false;
}


// Check that the line p1<-->p2 does not intersect any other lines
// We guarantee that walls.length mod 2 === 0
// Return true if there is a line intersection
function checkLineIntersection(walls, p1, p2) {
    var i;
    var coords = walls.coordinates;

    for (i = 0; i < coords.length; i += 2) {
        var intersection = G.lineIntersection(p1, p2,
                                              coords[i], coords[i+1]);
        if (intersection !== null) {
            return true;
        }
    }
    return false;
}

// Creates a point that is rounded to fit on the grid by the scale of the grid
// and is offset by the change in our blueprint/canvas viewport.
// Assume that we start at the top left of the canvas
function scalePoint(x, y) {
    return G.point(Math.round(x/scale) - xOffset,
                   Math.round(y/scale) - yOffset);
}

function unscalePoint(x,y) {
    return G.point((x + xOffset) * scale,
                   (y + yOffset) * scale);
}

function unscaleDim(x,y){
    return G.point((x) * scale,
                   (y) * scale);
}

// Plots the wall coordinates on the map and then draws them
function plotWall (mouseX, mouseY) {
    walls.status = 'selected';
    if (prevWallCoord === null) {
        prevWallCoord = scalePoint(mouseX, mouseY);
        drawBlueprint();
    }
    else {
        var newWallCoord = scalePoint(mouseX, mouseY);

        // if there is no intersection,
        // then plot the point
        //if (!checkLineIntersection(walls, prevWallCoord, newWallCoord)) {
        // TODO Temporarily disabled intersection checking. Debug intersection
        if (true) {
            walls.coordinates.push(prevWallCoord, newWallCoord);
            // If we click on the start, close the room and finish
            // drawing walls
            if (newWallCoord.equals(walls.coordinates[0])) {
                roomClosed = true;
                toggleWallTool();
            }
            else {
                prevWallCoord = newWallCoord;
            }
            drawBlueprint();
        }
    }
}

// Plots furniture snapped to the grid and adds it to our store
// of furniture in the room
function plotFurniture(x, y) {
    var snappedPoint = scalePoint(x,y);

    var furnObj = {'type': currentFurniture,
                   'path': furnitureTypes[currentFurniture].path,
                   'image': furnitureTypes[currentFurniture].image,
                   'location': snappedPoint,
                   'orientation': 0,
                   'dimensions': furnitureTypes[currentFurniture].dimensions};

    furniture.push(furnObj);
    currentFurniture = "none";
    currentTool = "none";
    drawBlueprint();
}

function deleteWallInProgress() {
    // If we are working on a current wall, then just delete the last
    // coordinate
    // We expect that walls.coordinates mod 2 === 0
    if (walls.coordinates.length > 0) {
        console.log('should delete');
        prevWallCoord = walls.coordinates[walls.coordinates.length - 2];
        walls.coordinates.splice(walls.coordinates.length - 2, 2);
    }
    else {
        prevWallCoord = null;
    }
}

function canvasKeyDown(event) {
    var dKey = 68;
    var keyCode = event.keyCode;

    // if we hit the "d" key,
    if (keyCode === dKey) {
        // Go through each finished subroom, and if it is selected, delete it
        for(var i = 0; i < subrooms.length; i++) {
            var subroom = subrooms[i];
            if (subroom.status === 'selected') {
                subrooms.splice(i,1);
                i--;
            }
        }

        deleteWallInProgress();

        drawBlueprint();
    }
}

function onPrevWallCoord(x,y) {
    var unscaled = unscalePoint(prevWallCoord.x, prevWallCoord.y);
    var leftX = unscaled.x - scale/4;
    var rightX = unscaled.x + scale/4;
    var topY = unscaled.y - scale/4;
    var botY = unscaled.y + scale/4;

    return (leftX <= x && x <= rightX
            && topY <= y && y <= botY);
}

function canvasMouseMove(event){
    var mouseX = event.x;
    var mouseY = event.y - $("#toolbar").outerHeight(true);

    if(currentTool==="placeFurniture"){
        drawBlueprint();

        // Round and unround the point to snap it to grid
        var pscaled = scalePoint(mouseX, mouseY);
        var psnappedPixels = unscalePoint(pscaled.x, pscaled.y);
        var scaledDims = furnitureTypes[currentFurniture].dimensions;
        var unscaledDims = unscaleDim(scaledDims.x, scaledDims.y);
        // TODO: why are dimensions a constant (200, 200)
         F.drawFurniture(psnappedPixels, unscaledDims, 0,
                         furnitureTypes[currentFurniture]['image']);
    }

    if (prevWallCoord !== null && prevWallCoord !== undefined) {
        drawBlueprint();

        var unscaled = unscalePoint(prevWallCoord.x, prevWallCoord.y);

        if (onPrevWallCoord(mouseX, mouseY)) {
            F.drawRectangle(ctx,
                            [unscaled.x, unscaled.y],
                            Math.PI/4, 'black',
                            [scale/2 - 2, 4]);
            F.drawRectangle(ctx,
                            [unscaled.x, unscaled.y],
                            Math.PI*3/4, 'black',
                            [scale/2 - 2, 4]);
        }
    }
    if(currentTool==="moveFurniture"){
        var mouseX = event.x;
        var mouseY = event.y - $("#toolbar").outerHeight(true);
        drawBlueprint();

        // Round and unround the point to snap it to grid
        var pscaled = scalePoint(mouseX, mouseY);
        var psnappedPixels = unscalePoint(pscaled.x, pscaled.y);
        var scaledDims = furniture[currentlySelectedFurniture].dimensions;
        var unscaledDims = unscaleDim(scaledDims.x, scaledDims.y);
        F.drawFurniture(psnappedPixels, unscaledDims,
                furniture[currentlySelectedFurniture]["orientation"],
                furniture[currentlySelectedFurniture]['image']);
    }

    if(currentTool==="rotateFurniture"){
        var mouseX = event.x;
        var mouseY = event.y - $("#toolbar").outerHeight(true);
        drawBlueprint();
        var p = furniture[currentlySelectedFurniture].location;
        var unscaledP = unscalePoint(p.x, p.y);
        var unscaledDims = unscaleDim(
            furniture[currentlySelectedFurniture].dimensions.x,
            furniture[currentlySelectedFurniture].dimensions.y);
        // Rounds the angle to a multiple of Math.PI / 8
        // base on trigonometry stuff
        var angle = G.roundTo(Math.PI/8,
                              Math.atan((unscaledP.y-mouseY) /
                                        (unscaledP.x-mouseX)));

        F.drawFurniture(unscaledP, unscaledDims,
                angle,
                furniture[currentlySelectedFurniture]['image']);
    }
    if(currentTool === "resizeFurniture"){
        var mouseX = event.x;
        var mouseY = event.y - $("#toolbar").outerHeight(true);
        drawBlueprint();

        // Round and unround the point to snap it to grid
        var p = furniture[currentlySelectedFurniture].location;
        var unscaledP = unscalePoint(p.x, p.y);
        var scaledDims = G.point(
            2*Math.abs(Math.round((mouseX-unscaledP.x)/scale)),
            2*Math.abs(Math.round((mouseY-unscaledP.y)/scale)));
        var unscaledDims = unscaleDim(scaledDims.x, scaledDims.y);
        // TODO: why are dimensions a constant (200, 200)
         F.drawFurniture(unscaledP, unscaledDims,
                furniture[currentlySelectedFurniture]["orientation"],
                furniture[currentlySelectedFurniture]['image']);
    }


}

// Mousedown events registered on the canvas
function canvasOnMouseDown(event) {
    // Focusing canvas so it can register key events
    canvas.setAttribute('tabindex','0');
    canvas.focus();

    var mouseX = event.x;
    // the y coordinate is offset by the height of the toolbar above it.
    // This effectively makes it so that mousedown events for the canvas use the
    // canvas's top left as the origin
    var mouseY = event.y - $("#toolbar").outerHeight(true);

    // At this point, mouseX and mouseY have their coordinate plane such that
    // their origin is in the top left of the canvas

    // Checks for clicks on the pan button, and pans canvas viewport if click
    // cooresponds to a pan button
    var pannedCanvas = checkPanClick(mouseX, mouseY);

    // If we panned the canvas, we shouldn't draw a wall part.
    // You should be able to click on the pan buttons even with the wall tool
    // functioning
    if (!pannedCanvas) {
        if (currentTool === "drawWall") {
            currentlySelectedFurniture = -1;
            if  (prevWallCoord !== null && prevWallCoord !== undefined
                 && onPrevWallCoord(mouseX, mouseY)) {
                deleteWallInProgress();
            }
            // We must store wasOnPrev so that when we delete a coordinate we
            // don't just readd that coordinate
            else {
                plotWall(mouseX, mouseY);
            }
            drawBlueprint();
            return;
        }
        // If we turned off the wall drawing function,
        // then it resets the previous wall coordinate
        else {
            prevWallCoord = null;
        }

        if (currentTool === "placeFurniture") {
            plotFurniture(mouseX, mouseY);
            drawBlueprint();
            return;
        }

        if (currentTool === "moveFurniture"){
            furniture[currentlySelectedFurniture]["location"]
                    = scalePoint(mouseX,mouseY);
            currentTool = "none";
            drawBlueprint();
            return;
        }

        if (currentTool === "rotateFurniture"){
            var p = furniture[currentlySelectedFurniture].location;
            var unscaledP = unscalePoint(p.x, p.y);
            var angle = G.roundTo(Math.PI/8,
                                  Math.atan((unscaledP.y-mouseY) /
                                            (unscaledP.x-mouseX)));

            furniture[currentlySelectedFurniture]["orientation"]
                = angle;
            currentTool = "none";
            drawBlueprint();
            return;
        }
        if (currentTool === "resizeFurniture"){
            var p = furniture[currentlySelectedFurniture].location;
            var unscaledP = unscalePoint(p.x, p.y);
            var scaledDims = G.point(
                2*Math.abs(Math.round((mouseX-unscaledP.x)/scale)),
                2*Math.abs(Math.round((mouseY-unscaledP.y)/scale)));

            furniture[currentlySelectedFurniture].dimensions
                = scaledDims;
            currentTool = "none";
            drawBlueprint();
            return;
        }


        if(currentlySelectedFurniture!==-1) {
            // first set up coordinates for the centers of all 4 buttons
            var innerIcon = getInnerIconPosition(furniture[currentlySelectedFurniture]);
            var DelCoords = [innerIcon[0],innerIcon[2]];
            var MoveCoords= [(innerIcon[0]+innerIcon[1])/2,
                            (innerIcon[2]+innerIcon[3])/2];
            var RotateCoords= [innerIcon[1]+20,
                            (innerIcon[2]+innerIcon[3])/2];
            var ResizeCoords= [innerIcon[1],innerIcon[3]];
            var radius = scale/2;

            //check for clicks

            //clicked the delete button
            if(distance(DelCoords[0],DelCoords[1],mouseX,mouseY)<radius){
                furniture.splice(currentlySelectedFurniture,1);
                currentlySelectedFurniture= -1;
                drawBlueprint();
                return;
            }
            //clicked the move button
            if(distance(MoveCoords[0],MoveCoords[1],mouseX,mouseY)<radius){
                currentTool = "moveFurniture";
                return;
            }
            //clicked the rotate button
            if(distance(RotateCoords[0],RotateCoords[1],mouseX,mouseY)<radius){
                currentTool = "rotateFurniture";
                return;
            }
            //clicked the resize button
            if(distance(ResizeCoords[0],ResizeCoords[1],mouseX,mouseY)<radius){
                currentTool = "resizeFurniture";
                return;
            }
        }



        // check for selecting furniture
        var selectedOne = false;
        furniture.forEach(function (furn,index) {
            var innerPos = getInnerIconPosition(furn);
            if(mouseX> innerPos[0] && mouseX < innerPos[1]
            && mouseY> innerPos[2] && mouseY < innerPos[3] ){
                currentlySelectedFurniture = index;
                selectedOne = true;
                drawBlueprint();
                return
            }
        });
        if (selectedOne=== false){
            currentlySelectedFurniture = -1;
            drawBlueprint();
        }
    }
}

function distance (x,y,a,b){
    return Math.sqrt( Math.pow(x-a,2)+Math.pow(y-b,2));

}


// returns the position of the inner icon
// [left, right, top, bottom]
function getInnerIconPosition(furn){
    var fX = (furn.location.x+xOffset)*scale;
    var fY = (furn.location.y+yOffset)*scale;
    var squareWidth = Math.min(furn.dimensions.x,furn.dimensions.y);
    squareWidth = squareWidth *scale;
    var left = fX- (squareWidth)/2;
    var right= fX+ (squareWidth)/2;
    var top  = fY- (squareWidth)/2;
    var btm  = fY+ (squareWidth)/2;
    return [left,right,top,btm];
}


// Tool stuff
function toggleWallTool(event) {
    var wallButton = $('#wall_tool');
    if (currentTool === "drawWall") {
        currentTool = "none";
        walls.status = 'unselected';
        subrooms.push(walls);
        walls = {'status': 'unselected',
                 'color': 'white',
                 'coordinates': []};
        prevWallCoord = null;
        wallButton.css("background-color", "");
    } else {
        currentTool = "drawWall";
        wallButton.css("background-color", "white");
    }

    // This is necessary if toggling the wall tool changes anything on
    // the canvas
    drawBlueprint();
}

// Zooms the canvas out
function zoomOut(event) {
    var oldCols = canvas.width/scale;
    var oldRows = canvas.height/scale;
    if(scale>10){
        scale-=10;
        var newCols = canvas.width/scale;
        var newRows = canvas.height/scale;
        xOffset += Math.round((newCols - oldCols)/2);
        yOffset += Math.round((newRows - oldRows)/2);
    }
    drawBlueprint();
}


// Zooms the canvas in
function zoomIn(event) {
    var oldCols = canvas.width/scale;
    var oldRows = canvas.height/scale;
    if(scale<80){
        scale+=10;
        var newCols = canvas.width/scale;
        var newRows = canvas.height/scale;
        xOffset -= Math.round((oldCols - newCols)/2);
        yOffset -= Math.round((oldRows - newRows)/2);
    }
    drawBlueprint();}



// from https://developer.mozilla.org/en-US/
// docs/JavaScript/Reference/Global_Objects/Array/map
function returnInt(element){
    return parseInt(element, 10);
}

function returnFloat(element){
    return parseFloat(element,10);
}

// Adds in object functions so that the point can be used again
function loadFormatRooms(subrooms) {
    return subrooms.map(function (walls) {
        return {
            'status': 'unselected',
            'color': walls.color,
            'coordinates': walls.coordinates.map(function (point) {
                // parse the string ints to actual numbers
                return G.point(returnInt(point.x),
                               returnInt(point.y));
            })
        };
    });
}

// Adds back in necessary methods and data we didn't pass over to server
function loadFormatFurniture(furniture) {
    return furniture.map(function (furn) {
        var furnObj = {
            'type': furn.type,
            'location': G.point(returnInt(furn.location.x),
                                returnInt(furn.location.y)),
            'dimensions': G.point(returnInt(furn.dimensions.x),
                                  returnInt(furn.dimensions.y)),
            'path': furn.path,
            'orientation':returnFloat(furn.orientation)
        };
        var temp = new Image();
        temp.src = furnObj.path;
        furnObj.image = temp;
        furnObj.image.onload = function () { drawBlueprint(); };

        return furnObj;
    });
}

// TODO convert the loaded points back to actual points
function loadRoom() {
    var roomId = $("#load-input").val();
    $.ajax({
        type: "get",
        url: "/room/"+roomId,
        success: function(data) {
            if (data.room['subrooms'] === undefined) {
                subrooms = [];
            }
            else {
                subrooms = loadFormatRooms(data.room["subrooms"]);
            }
            if (data.room['furniture'] === undefined) {
                furniture = [];
            }
            else {
                furniture = loadFormatFurniture(data.room["furniture"]);
            }
            drawBlueprint();
        }
    });
}


function saveFormatPoint(p) {
    return {'x': p.x, 'y': p.y};
}

// Removes object functions so that the point can be JSONified
function saveFormatRooms(subrooms) {
    return subrooms.map(function (walls) {
        return {
            'color': walls.color,
            'coordinates': walls.coordinates.map(function (point) {
                return saveFormatPoint(point);
            })
        };
    });
}

function saveFormatFurniture(furniture) {
    return furniture.map(function (furn) {
        return {'type': furn.type,
                'location': saveFormatPoint(furn.location),
                'dimensions': saveFormatPoint(furn.dimensions),
                'path': furn.path,
                'orientation': furn.orientation};
    });
}

function saveRoom() {
    var saveName = $("#save-input").val();
    $.ajax({
            type: "post",
            url: "/room/" + saveName,
            data: {'sendSubRooms': saveFormatRooms(subrooms),
                   'sendFurniture': saveFormatFurniture(furniture)},
            success: function(data) {
                // todo on good save
            }
    });
}

// Adding listeners to buttons
$(document).ready(main);
