var myGamePiece;
var myObstacles = [];
var myScore;


$(document).ready(function(){
	startGame();
	var pauseButton = jQuery("#pauseButton");
	pauseButton.attr("myTextColor", "black");
	pauseButton.click(function(){
		pauseGame();
		var color = pauseButton.attr("myTextColor");
		if(pauseButton.attr("myTextColor") == "red"){
			pauseButton.css("color", "black");
			pauseButton.attr("myTextColor", "black");
		}else{
			pauseButton.css("color", "red");
			pauseButton.attr("myTextColor", "red");
		}
	});
	// pauseButton.animate({
	// 	opacity: "0.5",
	// 	top: "20px",
	// }, 2000);

	// $("canvas").animate(
	// 	{
	// 		marginLeft: '500px',
	// 		marginTop: '100px'
	// 	}, 1000
	// );
	let mainContainer = jQuery("#mainContainer");
	let x = jQuery(window).width()/2 - mainContainer.width()/2;
	let y = jQuery(window).height()/2 - mainContainer.height()/2;
	mainContainer.animate({
		left: x,
		opacity: 1,
	}, 1000);

	$.ajax({
		url: "https://restcountries.eu/rest/v2/all",
		type: "GET",
		dataType: "json",
		success: function(result){
			$('<option selected="selected">Floopy Land</option>').appendTo("#countrySelector");
			for(countryObj of result){
				let countryName = countryObj.name;
				$("#countrySelector").append('<option>' + countryName + '</option>');
			}
		}
	});

});
	

function startGame(){
	myGamePiece = new component(30, 21.25, 50, 170, "bird");
	myGamePiece.gravity = 0.05;
	//NOTE: component(size, font, x, y, type)
	myScore = new component("50px", "Consolas", 293, 60, "text");
	myGameArea.start();
	pauseGame(true);
	document.body.onkeydown = function (e) {
		document.getElementById("looseContainer").style.display = "none";
		if (validToPlay()) {
			if([32, 38, 87].includes(e.keyCode)) { //Space, Up, W
				if (["Resume", "Start"].includes(document.getElementById("pauseButton").innerHTML)) {
					pauseGame();
				} else {
					accelerate(-0.2);
				}
			}

			if([13, 27, 80, 83].includes(e.keyCode)) { //Enter, Esc, P, S
			  pauseGame();
			}
		}
	};
	document.body.onkeyup = function (e) {
		if(validToPlay() && [32, 38, 87].includes(e.keyCode)) { //Space, Up, W
		  accelerate(0.05);
		}
	};
}

function restartGame(){
	clearInterval(myGameArea.interval);
	myObstacles = [];
	startGame();
}


var myGameArea = {
	canvas : document.createElement("canvas"),
	start : function(){
		// Original  580, 470
		// 4/3       600, 450
		// 16/9      608, 342
		this.canvas.width = 608;
		this.canvas.height = 342;
		this.context = this.canvas.getContext("2d");
		jQuery("#canvasContainer").append(this.canvas);
		this.frameNo = 0;
		this.interval = setInterval(updateGameArea, 13);
		myGamePiece.update();
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}

function pauseGame(first){
	var button = document.getElementById("pauseButton");
	if (button.innerHTML == "Pause"){
		clearInterval(myGameArea.interval);
		if (first) {
			button.innerHTML = "Start";
		} else {
			button.innerHTML = "Resume";
		}
		jQuery("#restartButton").attr("disabled", true);
	} else {
		myGameArea.interval = setInterval(updateGameArea, 13);
		button.innerHTML = "Pause";
		jQuery("#restartButton").attr("disabled", false);
	}
	button.blur();
	//jQuery("#restartButton").toggle();
}

function component(width, height, x, y, type){
	this.type = type;
    this.score = 0;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.gravity = 0;
    this.gravitySpeed = 0;
	this.maxGravitySpeed = 3;
	this.countedScore = false;
	this.hitTopOrBottom = false;
	this.fr = 1;
	
    this.update = function() {
        ctx = myGameArea.context;
		var sprite = new Image();
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = "white";
            ctx.fillText(this.text, this.x, this.y);
		} else if (this.type == "bird") {
			if (this.fr % 39 < 10) {
				sprite.src = "images/bird-up.png";
				}
			else if ((this.fr % 29 > 9) && (this.fr % 39 < 20)) {
				sprite.src = "images/bird-mid.png";
				}
			else if ((this.fr % 39 > 19) && (this.fr % 39 < 30)) {
				sprite.src = "images/bird-down.png";
			}
			else {
				sprite.src = "images/bird-mid.png";
				}
			ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
			this.fr += 1;
        } else {
			sprite.src = "images/"+type+".png";
			ctx.drawImage(sprite, this.x, this.y, this.width, this.height);
        }
    }
    this.newPos = function() {
		if (this.gravitySpeed + this.gravity < this.maxGravitySpeed) {
			this.gravitySpeed += this.gravity;
		} else {
			this.gravitySpeed = this.maxGravitySpeed;
		}
        //this.gravitySpeed += this.gravity;
        //this.x += this.speedX;
        this.y += this.speedY + this.gravitySpeed;
        this.hitBottom();
		this.hitTop();
    }
    this.hitBottom = function() {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
			this.hitTopOrBottom = true;
        }
    }
	this.hitTop = function() {
		var rockTop = 0;
		if(this.y < 0){
			this.y = rockTop;
			this.gravitySpeed = 0;
			this.hitTopOrBottom = true;
		}
	}
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
		if(myleft > otherright && !otherobj.countedScore){
			myScore.score += 0.5;
			otherobj.countedScore = true;
		}
        return crash;
    }
}

function youShallLoose(){
	//alert("You lost! Your score is: " + myScore.score);
	var slct = document.getElementById("countrySelector");
	var Country = slct.options[slct.selectedIndex].text;
	var Score = myScore.score;
	addPlayer(Country, Score);
	//restartGame();
	return;
}

function hasLost() {
	if(myGamePiece.hitTopOrBottom){
		youShallLoose();
		return true;
	}
    for (i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
			if(myObstacles[i].x < 0){
				myObstacles.splice(i, 1);
			}
			youShallLoose();
			return true;
        }
    }
	return false
}

function updateGameArea() {
    var x, height, gap, minHeight, maxHeight, minGap, maxGap;
	var frequency = 200; // Frequency of pipes
	if (hasLost()) {
		return;
	}
    myGameArea.clear();
    myGameArea.frameNo += 1;
    if (myGameArea.frameNo == 1 || everyinterval(frequency)) {
        x = myGameArea.canvas.width;
        minHeight = 20;
        maxHeight = myGameArea.canvas.height / 2;
        height = Math.floor(Math.random() * maxHeight + minHeight);
        minGap = myGamePiece.height * 3;
        maxGap = myGameArea.canvas.height / 4;
        gap = Math.floor(Math.random() * maxGap + minGap);
		//NOTE: component(width, height, x, y, type)
        myObstacles.push(new component(50, 300, x, height-280, "pipe-top"));
        myObstacles.push(new component(50, 300, x, height+gap, "pipe-bot"));
    }
    for (i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }
    myScore.text = myScore.score;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
}

function everyinterval(n) {
    if ((myGameArea.frameNo %n ) == 0){ // n) % 1 == 0) {
		return true;
	}
    return false;
}

function accelerate(n) {
    myGamePiece.gravity = n;
}