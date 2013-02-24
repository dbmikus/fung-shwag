var canvas = document.getElementById("blueprint");
var ctx = canvas.getContext("2d");
//scale = pixels/foot
var scale = 30;
var walls = [];
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

    // Clicking on the zoom out button zooms out, but does not change
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

function setUpBlueprint(){
    ctx.fillStyle = "#001087"
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.lineWidth =1;

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

// Draws all of the onscreen buttons
function drawButtons(){
    // ctx.fillStyle = "#0010a7";
    // if(currentTool==="drawWall"){
    //     ctx.fillStyle= "purple";
    // }

    ctx.fillStyle = "#0010a7"
    ctx.lineWidth= 4;
    ctx.strokeStyle= "#001067"
    drawRoundedRectangle(ctx,820,-20,100,60,10);
    ctx.fillStyle="lightblue";
    ctx.font = "40px Arial";
    ctx.fillText("▲",850,32);

    ctx.fillStyle = "#0010a7"
    ctx.lineWidth= 4;
    ctx.strokeStyle= "#001067"
    drawRoundedRectangle(ctx,-20,320,60,100,10);
    ctx.fillStyle="lightblue";
    ctx.font = "40px Arial";
    ctx.fillText("◄",0,385);

    ctx.fillStyle = "#0010a7"
    ctx.lineWidth= 4;
    ctx.strokeStyle= "#001067"
    drawRoundedRectangle(ctx,820,canvas.height-40,100,canvas.height+20,10);
    ctx.fillStyle="lightblue";
    ctx.font = "40px Arial";
    ctx.fillText("▼",850,canvas.height-6);

    ctx.fillStyle = "#0010a7"
    ctx.lineWidth= 4;
    ctx.strokeStyle= "#001067"
    drawRoundedRectangle(ctx,canvas.width-40,320,60,100,10);
    ctx.fillStyle="lightblue";
    ctx.font = "40px Arial";
    ctx.fillText("►",canvas.width-35,385);

}

function drawBlueprint(){
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



function drawRoundedRectangle(ctx,x,y,width,height,radius){
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


    // Pan up
    if(mouseY>0 && mouseY<40){
        if(mouseX>820 && mouseX<920){
            yOffset+= 4;
            drawBlueprint();
            return;
        }
    }
    // Pan left
    if(mouseX>0 && mouseX<40
       && mouseY> 320 && mouseY<420){
        xOffset+= 4;
        drawBlueprint();
        return;
    }
    // Pan down
    if(mouseX>820 && mouseX<920
       && mouseY>canvas.height-40 && mouseY<canvas.height){
        yOffset-= 4;
        drawBlueprint();
        return;
    }
    // Pan right
    if(mouseX>canvas.width-40 && mouseX<canvas.width
       && mouseY> 320 && mouseY<420){
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
