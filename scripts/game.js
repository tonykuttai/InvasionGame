window.onload = function loadCanvas(){
	var gameCan = document.createElement('canvas');
	var div = document.getElementById("gameid");
	gameCan.id = "gameCanvas";
	gameCan.width = 600;
	gameCan.height = 600;	
	div.appendChild(gameCan);	
	//swal("Click to STart the Game");	
}

var CANVAS_WIDTH = 600;
var CANVAS_HEIGHT = 600;
var playerBullets = [];
var enemies = [];
var enemies_2 = [];
var FPS = 30;
var score = 0;
var life = 3;
var alternate = 0;
var level = 1;
var count = 0;
var kill = 0;
var isPaused = false;
// var highScore = 0;


var testInterval = window.setInterval(function(){
	if(!isPaused){
		update();
		draw();
	}		
	},1000/(FPS));


var player = {
	color: "#B22222",
	x: 300,
	y: 540,
	width: 32,
	height: 32,

	sprite: Sprite("player"),
	count: 0,
	draw: function(){		
		var can = document.getElementById('gameCanvas');
		var ctx = can.getContext('2d');
		this.sprite.draw(ctx, this.x, this.y);	

		playerBullets.forEach(function(bullet){
			bullet.draw();
		});
		enemies.forEach(function(enemy) {
			enemy.draw();
		});
		
		enemies_2.forEach(function(enemy_2) {
		enemy_2.draw();
		
		});
	},
	update: function(){		
		//console.log(this.x);
		
		if(kill > 100 && level < 5){			
				isPaused = true;				
				levelIncrease();							
		}
		if(keydown.space) {
			this.shoot();
		}
		if(keydown.left) {

			if(this.x >= 60){		
				this.x -= 5;
			}
		}	

		if(keydown.right) {
			if(this.x <= 505){
				this.x += 5;
			}			
		}
		this.x = this.x.clamp(0, CANVAS_WIDTH - this.width);

		playerBullets.forEach(function(bullet){
			bullet.update();
		});
		playerBullets = playerBullets.filter(function(bullet){
			return bullet.active;
		});
		enemies.forEach(function(enemy) {
			enemy.update();
		});
		enemies = enemies.filter(function(enemy) {
			return enemy.active;
		});
	
		enemies_2.forEach(function(enemy_2)
				{
					enemy_2.update();
				});
			enemies_2 = enemies_2.filter(function(enemy_2) {
				return enemy_2.active;
			});	
		
		alternate = alternate + 1;

		if(Math.random() < 0.1) {
			enemies.push(Enemy());
			if(alternate % 25 == 0){
				enemies_2.push(Enemy_2());
			}
			
		}
		handleCollision();
	},
	shoot: function() {
		Sound.play("shoot");
		var bulletPostion = this.midpoint();
		playerBullets.push(Bullet({
			speed: 5,
			x: bulletPostion.x,
			y: bulletPostion.y
		}));
	},
	midpoint: function(){
		return {
			x: this.x + this.width/2,
			y: this.y + this.height/2
		};
	},
	explode: function() {		
		
		var can = document.getElementById('gameCanvas');
		var ctx = can.getContext('2d');
		ctx.clearRect(0,0,can.width,can.height);
		clearInterval(testInterval);		
		Sound.play("gameover");
		var highScore = 0;
		highScore = score;
		if (typeof(Storage) !== "undefined") {
			var length = localStorage.length;	
			console.log("Length : "+length);	
			if(length > 0){
				highScore = localStorage.getItem("HighScore");
				if(score > highScore){
					highScore = score;
					localStorage.setItem("HighScore",highScore);
				}
			}else{
				localStorage.setItem("HighScore",score);
				highScore = score;
			}

    	} 	
			//highScore = Score;
			swal({
				title: "Game Over. You Lost.",
				text: "Your Score "+score+" \n High Score : "+highScore,
				type: "warning",
				showCancelButton: false,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: "Play Again",
				closeOnConfirm: false
			},
			function(){
				window.location.reload();				
				
			});
		
		
	}

};
function draw(){	
	var can = document.getElementById('gameCanvas');
	var ctx = can.getContext('2d');
	ctx.clearRect(0,0,can.width,can.height);		 
	ctx.fill();
	scoreDisplay();
	lifeDisplay();
	levelDisplay();
	player.draw();
}
function update(){	
	player.update();
}

function Bullet(I){
	var can = document.getElementById('gameCanvas');
	var canvas = can.getContext('2d');
	I.active =true;
	I.xVelocity = 0;
	I.yVelocity = -I.speed;
	I.width = 3;
	I.height = 3;
	I.color = "##D2691E";
	I.inBounds = function(){
		return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};
	
	I.draw = function(){		
		canvas.fillRect(this.x,this.y,this.width,this.height);
	};
	I.update = function(){
		I.x += I.xVelocity;
		I.y += I.yVelocity;
		I.active = I.active && I.inBounds();
	};
	return I;
}		

function Enemy(I) {
	var can = document.getElementById('gameCanvas');
	var canvas = can.getContext('2d');
	I = I || {};
	I.active = true;
	I.age = Math.floor(Math.random() * 128);
	I.color = "#ff0";
	I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
	I.y = 0;
	I.xVelocity = 0;
	I.yVelocity = level;
	I.width = 32;
	I.height = 32;
	I.sprite = Sprite("enemy");

	I.inBounds = function() {
		return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};

	I.draw = function() {
		/*canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);*/
		this.sprite.draw(canvas, this.x, this.y);
	};

	

	I.update = function() {
		I.x += I.xVelocity;
		I.y += I.yVelocity;

		I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);

		I.age ++;

		I.active = I.active && I.inBounds();
		
	};

	I.explode = function() {
		Sound.play("explosion");
		this.active = false;
	};

	return I;
}
function Enemy_2(I) {
	var can = document.getElementById('gameCanvas');
	var canvas = can.getContext('2d');
	I = I || {};
	I.active = true;
	I.age = Math.floor(Math.random() * 128);
	I.color = "#ff0";
	I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
	I.y = 0;
	I.xVelocity = 0;
	I.yVelocity = 1+level;
	I.width = 32;
	I.height = 32;
	I.sprite = Sprite("enemy_2");

	I.inBounds = function() {
		return I.x >= 0 && I.x <= CANVAS_WIDTH && I.y >= 0 && I.y <= CANVAS_HEIGHT;
	};

	I.draw = function() {
		/*canvas.fillStyle = this.color;
		canvas.fillRect(this.x, this.y, this.width, this.height);*/
		this.sprite.draw(canvas, this.x, this.y);
	};

	I.update = function() {
		I.x += I.xVelocity ;
		I.y += I.yVelocity;

		I.xVelocity = 3 * Math.sin(I.age * Math.PI / 64);

		I.age++;

		I.active = I.active && I.inBounds();
		if(I.active == false){
			//reset
			//console.log("Reset enemy 2");
			I.active = true;
			I.x = CANVAS_WIDTH / 4 + Math.random() * CANVAS_WIDTH / 2;
			I.y = 0;
			I.xVelocity = 0;
			I.yVelocity = 2;
			
		}
	};

	I.explode = function() {
		Sound.play("explosion");
		this.active = false;
	};

	return I;
}

function collides(a, b) {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function handleCollision() {
	playerBullets.forEach(function(bullet) {
		enemies.forEach(function(enemy) {
			if(collides(bullet, enemy)) {
				
				enemy.explode();
				score += 10; //score Variable
				kill += 1;
				bullet.active = false;
			}
		});
		enemies_2.forEach(function(enemy_2) {
			if(collides(bullet, enemy_2)) {
				
				enemy_2.explode();
				score += 100; //score Variable
				kill += 1;
				bullet.active = false;
			}
		});
	});

	enemies.forEach(function(enemy) {
		if (collides(enemy, player)) {
			enemy.active = false;			
			life = life - 1;
		    if (life < 0) {
			  player.active = false;
			  player.explode();
		    }
		}
	});
	enemies_2.forEach(function(enemy_2) {
		if (collides(enemy_2, player)) {
			enemy_2.active = false;			
			life = life - 1;
		    if (life < 0) {
			  player.active = false;
			  player.explode();
		    }
		}
	});
}

function scoreDisplay(){
	//score
	var ctx = document.getElementById('gameCanvas').getContext('2d');
	ctx.fillStyle = "#FF4500";
	ctx.font = "14px Courier New";
	ctx.fillText("Score : "+score,445,20);	
	ctx.fill();
}
function lifeDisplay(){
	//life
	var ctx = document.getElementById('gameCanvas').getContext('2d');
	ctx.fillStyle = "##E9967A";		
	ctx.font = "14px Courier New";	
	ctx.fillText("Life Remaining : "+life,445,35);
	ctx.fill();
}
function levelDisplay(){
	//Level
	var ctx = document.getElementById('gameCanvas').getContext('2d');
	ctx.fillStyle = "#FF4500";		
	ctx.font = "14px Courier New";	
	ctx.fillText("Level : "+level,445,50);
	ctx.fill();
}

function levelIncrease(){		
	kill = 0;
	swal({
		title: "Good Job!",
		text: "Level Up!",
		timer: 500,
  		showConfirmButton: false		
	});	
	enemies.forEach(function(enemy) {
				enemy.explode();
			});
			enemies_2.forEach(function(enemy_2) {
				enemy_2.explode();
			});
			if(level < 5){
				level = level + 1;
			}		
			isPaused = false;
}