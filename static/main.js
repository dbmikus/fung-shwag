///////////////////
// Global Values //
///////////////////
var canvas = document.getElementById("blueprint");
var ctx = canvas.getContext("2d");
//scale = pixels/foot
var scale = 30;
var walls = [];
// Rooms hold closed walls segments
var subrooms = [];
var roomClosed = false;
//furniture is an array of furniture objects
var furniture = [];
//walls are stored as 4 tuples in the following way
// [starting X coord, starting y coord, ending x cooord, ending y coord]
var currentTool = "none";
var currentFurniture = "none";
//used for creating walls
var prevWallCoord = null;
//the offset of the current view from the origin
var xOffset = 0;
var yOffset = 0;


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
    furnitureTypes[key].dimensions = G.point(3,3);
}


/////////////////////////////
// End of Global Variables //
/////////////////////////////
function main() {
    canvas.addEventListener("mousedown", canvasOnMouseDown, false);
    canvas.addEventListener("mousemove", onMouseMove, false);
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
    var prevCoord = null;
    ctx.lineWidth= 5;
    ctx.strokeStyle="white"
    ctx.beginPath();
    for (var i = 0; i<walls.length; i++){
        var unscaled = unscalePoint(walls[i].x, walls[i].y);
        // If there was no previous coordinate, we just move to the first one
        if (prevCoord === null) {
            ctx.moveTo(unscaled.x, unscaled.y);
            prevCoord = walls[i];
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

// Draws an array of furniture objects
function drawFurniture(furniture) {
    furniture.forEach(function (furn) {
        var p = furn.location;
        var unscaledP = unscalePoint(p.x, p.y);
        var unscaledDims = unscaleDim(furn.dimensions.x, furn.dimensions.y);

        // TODO why are dimensions a constant?
        F.drawFurniture(unscaledP, unscaledDims, 0, furn.image);
    });
}

// Draws everything on the blueprint
function drawBlueprint() {
    setUpBlueprint();

    // Draw all stored, closed-wall shapes
    subrooms.forEach(drawWall);
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
function checkLineIntersection(p1, p2) {
    var i;
    for (i = 0; i < walls.length; i += 2) {
        var intersection = G.lineIntersection(p1, p2,
                                              walls[i], walls[i+1]);
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
    if (prevWallCoord === null) {
        prevWallCoord = scalePoint(mouseX, mouseY);
        drawBlueprint();
    }
    else {
        var newWallCoord = scalePoint(mouseX, mouseY);

        // if there is no intersection,
        // then plot the point
        //if (!checkLineIntersection(prevWallCoord, newWallCoord)) {
        // TODO Temporarily disabled intersection checking. Debug intersection
        if (true) {
            walls.push(prevWallCoord, newWallCoord);
            // If we click on the start, close the room and finish
            // drawing walls
            if (newWallCoord.equals(walls[0])) {
                roomClosed = true;
                toggleWallTool();
                // subrooms.push(walls);
                // prevWallCoord = null;
                // walls = [];
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
                   'dimensions': furnitureTypes[currentFurniture].dimensions};

    furniture.push(furnObj);
    currentFurniture = "none";
    currentTool = "none";

    drawBlueprint();
}

function onMouseMove(event){
    if(currentTool==="placeFurniture"){
        var mouseX = event.x;
        var mouseY = event.y - $("#toolbar").outerHeight(true);
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
}

// Mousedown events registered on the canvas
function canvasOnMouseDown(event) {
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
            plotWall(mouseX, mouseY);
        }
        // If we turned off the wall drawing function,
        // then it resets the previous wall coordinate
        else {
            prevWallCoord = null;
        }

        if (currentTool === "placeFurniture") {
            plotFurniture(mouseX, mouseY);
        }
    }
}


// Tool stuff
function toggleWallTool(event) {
    var wallButton = $('#wall_tool');
    if (currentTool === "drawWall") {
        currentTool = "none";
        subrooms.push(walls);
        walls = [];
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
    if(scale>10)
        scale-=10;
    drawBlueprint();
}

// Zooms the canvas out
function zoomIn(event) {
    if(scale<80)
        scale+=10;
    drawBlueprint();
}


// from https://developer.mozilla.org/en-US/
// docs/JavaScript/Reference/Global_Objects/Array/map
function returnInt(element){
    return parseInt(element, 10);
}

// Adds in object functions so that the point can be used again
function loadFormatRooms(subrooms) {
    return subrooms.map(function (walls) {
        return walls.map(function (point) {
            // parse the string ints to actual numbers
            return G.point(returnInt(point.x),
                           returnInt(point.y));
        });
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
            'path': furn.path
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
        return walls.map(function (point) {
            return saveFormatPoint(point);
        });
    });
}

function saveFormatFurniture(furniture) {
    return furniture.map(function (furn) {
        return {'type': furn.type,
                'location': saveFormatPoint(furn.location),
                'dimensions': saveFormatPoint(furn.dimensions),
                'path': furn.path};
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
