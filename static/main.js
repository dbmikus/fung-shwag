var canvas = document.getElementById("blueprint");
var ctx = canvas.getContext("2d");
//scale = pixels/foot
var scale = 30;
var walls = [];
//furniture is an array of furniture objects
var furniture = [];
//walls are stored as 4 tuples in the following way
// [starting X coord, starting y coord, ending x cooord, ending y coord]
var currentTool="none";
//used for creating walls
var prevWallCoord = null;
//the offset of the current view from the origin
var xOffset = 0;
var yOffset = 0;

function main() {
    canvas.addEventListener("mousedown", canvasOnMouseDown, false);

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
}

// Configures the background stuff for the blueprint
function setUpBlueprint(){
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

function drawBlueprint() {
    setUpBlueprint();

    // Drawing each wall in our wall array
    for (var i =0; i<walls.length; i++){
        ctx.lineWidth= 5;
        ctx.strokeStyle="white"
        ctx.beginPath();
        ctx.moveTo((walls[i][0]+xOffset)*scale,(walls[i][1]+yOffset)*scale);
        ctx.lineTo((walls[i][2]+xOffset)*scale,(walls[i][3]+yOffset)*scale);
        ctx.stroke();
        ctx.closePath();
    }
    if(prevWallCoord){
        ctx.strokeStyle = "black";
        ctx.lineWidth   = 1;
        ctx.fillStyle= "red";
        drawRoundedRectangle(ctx, ((prevWallCoord[0]+xOffset)*scale)-scale/4,
                                ((prevWallCoord[1]+yOffset)*scale)-scale/4,
                                scale/2, scale/2,scale/4)
    }
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


// Mousedown events registered on the canvas
function canvasOnMouseDown(event) {
    var mouseX = event.x;
    // the y coordinate is offset by the height of the toolbar above it.
    // This effectively makes it so that mousedown events for the canvas use the
    // canvas's top left as the origin
    var mouseY = event.y - $("#toolbar").outerHeight(true);

    // At this point, mouseX and mouseY have their coordinate plane such that
    // their origin is in the top left of the canvas

    // Drawing top button
    drawButton(canvas.width/2, 22, 3*Math.PI / 2);
    // Drawing left button
    drawButton(20, canvas.height/2, Math.PI);
    // Drawing bottom button
    drawButton(canvas.width/2, canvas.height-22, Math.PI/2);
    // Drawing right button
    drawButton(canvas.width-20, canvas.height/2, 0);

    // Pan up
    // The center of the button's click location
    var bcenter = {"x": canvas.width/2,
                   "y": 0 + 22};
    if(mouseY >= 0 && mouseY <= bcenter.y + 50/2 &&
       mouseX >= bcenter.x - 100/2 && mouseX <= bcenter.x + 100/2) {
        yOffset+= 4;
        drawBlueprint();
        return;
    }
    // Pan left
    bcenter.x = 20;
    bcenter.y = canvas.height/2;
    if(mouseX >= 0 && mouseX <= bcenter.x + 50/2 &&
       mouseY >= bcenter.y - 100/2 && mouseY <= bcenter.y + 100/2) {
        xOffset+= 4;
        drawBlueprint();
        return;
    }
    // Pan down
    bcenter.x = canvas.width/2;
    bcenter.y = canvas.height - 22;
    if(mouseX >= bcenter.x - 100/2 && mouseX <=  bcenter.x + 100/2 &&
       mouseY >= bcenter.y - 50/2 && mouseY <= canvas.height){
        yOffset-= 4;
        drawBlueprint();
        return;
    }
    // Pan right
    bcenter.x = canvas.width - 20;
    bcenter.y = canvas.height/2;
    if(mouseX >= bcenter.x - 50/2 && mouseX <= canvas.width &&
       mouseY >= bcenter.y - 100/2 && mouseY <= bcenter.y + 100/2){
        xOffset-= 4;
        drawBlueprint();
        return;
    }

    if(currentTool==="drawWall"){
        if(prevWallCoord===null){
            prevWallCoord= [Math.round(mouseX/scale)-xOffset,
                    Math.round(mouseY/scale)-yOffset];
        }else{
            var newWallCoord = [Math.round(mouseX/scale)-xOffset,
                        Math.round(mouseY/scale)-yOffset]
            walls.push([prevWallCoord[0],prevWallCoord[1],
                newWallCoord[0],newWallCoord[1]]);
            prevWallCoord=newWallCoord;
        }
        drawBlueprint();
    }else{
        prevWallCoord = null;
    }
}


// Tool stuff
function toggleWallTool(event) {
    var wallButton = $(event.currentTarget);
    if (currentTool === "drawWall") {
        currentTool = "none";
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

function loadRoom(){
    var roomId = $("#load-input").val();
    $.ajax({
      type: "get",
      url: "/room/"+roomId,
      success: function(data) {
        walls = data.room["walls"];
        furniture = data.room["furniture"];
        drawBlueprint();
      }
    });
}


function saveRoom(){
    var saveName = $("#save-input").val();
    console.log(walls);
    $.ajax({
            type: "post",
            url: "/room/"+saveName,
            data: {sendWalls: walls, sendFurniture: furniture},
            success: function(data) {
                // todo on good save
            }
    });
}

// Adding listeners to buttons
$(document).ready(main);
