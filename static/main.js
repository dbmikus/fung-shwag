var canvas = document.getElementById("blueprint");
var ctx = canvas.getContext("2d");


function main() {
	setUpScreen();
	setUpBlueprint();
}

function setUpScreen(){
	$(document).ready(function(){
		$('#drawtable').css('width'," "+ $(window).width()-300+"px");
	})
	$(window).resize(function(){
		$('#drawtable').css('width'," "+ $(window).width()-300+"px");
	})
}


function setUpBlueprint(){
	ctx.fillStyle = "#001087"
	ctx.fillRect(0,0,canvas.width,canvas.height);
}





main();