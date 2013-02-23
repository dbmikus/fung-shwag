var canvas = document.getElementById("blueprint");
var ctx = canvas.getContext("2d");
//scale = pixels/foot
var scale = 30;
var walls = [];
//walls are stored as 4 tuples in the following way
// [starting X coord, starting y coord, ending x cooord, ending y coord]
var currentTool="none";
//used for creating walls
var firstWallCoord = null;
//the offset of the current view from the origin
var xOffset = 0;
var yOffset = 0;

function main() {
    canvas.addEventListener("mousedown", onMouseDown, false);
    setUpScreen();
}


//binds ready and resize so that the canvas is alway sthe right side
//called in main
function setUpScreen(){
    $(document).ready(function(){
        $('#blueprint').attr({width: $(window).width()-300, height: $(window).height()});
        drawBlueprint();
});
    $(window).resize(function(){
        $('#blueprint').attr({width: $(window).width()-300, height: $(window).height()});
        drawBlueprint();
    });
}

function setUpBlueprint() {
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

function drawButtons(){
    ctx.fillStyle = "#0010a7";
    if(currentTool==="drawWall"){
        ctx.fillStyle= "purple";
    }

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

    for (var i =0; i<walls.length; i++){
        ctx.lineWidth= 5;
        ctx.strokeStyle="white"
        ctx.beginPath();
        ctx.moveTo((walls[i][0]+xOffset)*scale,(walls[i][1]+yOffset)*scale);
        ctx.lineTo((walls[i][2]+xOffset)*scale,(walls[i][3]+yOffset)*scale);
        ctx.stroke();
        ctx.closePath();
    }
    if(firstWallCoord){
        ctx.strokeStyle = "black";
        ctx.fillStyle= "red";
        drawRoundedRectangle(ctx, ((firstWallCoord[0]+xOffset)*scale)-scale/4,
                                ((firstWallCoord[1]+yOffset)*scale)-scale/4,
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

function onMouseDown(event){
    var mouseX = event.x;
    var mouseY = event.y;
    if(mouseY>0 && mouseY<40){
        if(mouseX>820 && mouseX<920){
            yOffset+= 4;
            drawBlueprint();
            return;
        }
    }
    if(mouseX>0 && mouseX<40
        && mouseY> 320 && mouseY<420){
        xOffset+= 4;
        drawBlueprint();
        return;
    }
    if(mouseX>820 && mouseX<920
        && mouseY>canvas.height-40 && mouseY<canvas.height){
        yOffset-= 4;
        drawBlueprint();
        return;
    }
    if(mouseX>canvas.width-40 && mouseX<canvas.width
        && mouseY> 320 && mouseY<420){
        xOffset-= 4;
        drawBlueprint();
        return;
    }

    if(currentTool==="drawWall"){
        if(firstWallCoord===null){
            firstWallCoord= [Math.round(mouseX/scale)+xOffset,
                    Math.round(mouseY/scale)+yOffset];
        }else{
            walls.push([firstWallCoord[0],firstWallCoord[1],
                Math.round(mouseX/scale)+xOffset,Math.round(mouseY/scale)+yOffset]);
            firstWallCoord=null;
        }
        drawBlueprint();
    }

}


// Tool stuff
function toggleWallTool(event) {
    if (currentTool === "drawWall") {
        currentTool = "none";
    } else {
        currentTool = "drawWall";
    }

    // This is necessary if toggling the wall tool changes anything on
    // the canvas
    drawBlueprint();
}

function zoomOut(event) {
    if(scale>10)
        scale-=10;
    drawBlueprint();
}

function zoomIn(event) {
    if(scale<80)
        scale+=10;
    drawBlueprint();
}

// Adding listeners to tool buttons
$(document).ready(function() {
    // Adding listeners for all the tool buttons

    // Clicking on the wall_tool button toggles the wall drawing function
    $("#wall_tool").click(toggleWallTool);

    // Clicking on the zoom out button zooms out, but does not change
    // current tool
    $("#zoom_out").click(zoomOut);

    // Clicking on the zoom out button zooms out, but does not change
    // current tool
    $("#zoom_in").click(zoomIn);
});

main();
