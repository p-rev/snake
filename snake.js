var animate = function(callback) {window.setTimeout(callback, 1000/10)};

Number.prototype.mod = function(n) {
	var m = (( this % n) + n) % n;
	return m < 0 ? m + Math.abs(n) : m;
}

function rand(max) {
  return Math.round(Math.random() * max);
}

var canvas = document.createElement('canvas');
var width = 600;
var height = 400;
var square = 20;
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

var keysDown = {};

window.addEventListener("keydown", function(event) {
	keysDown[event.keyCode] = true;
});

function Block(x, y) {
	this.x = x;
	this.y = y;
	this.color;
}

Block.prototype.render = function() {
	context.fillStyle = "#55FF55";
	context.fillRect(this.x * square, this.y * square, square, square);
	context.fillStyle = "rgba(0," + this.color + ",0, 1)";
	context.fillRect(this.x * square + 1, this.y * square + 1 , square - 2, square - 2);
};

function Apple() {
	this.x = 0;
	this.y = 0;
}

Apple.prototype.place = function() {
	this.x = rand(width / square - 1);
	this.y = rand(height / square - 1);
};

Apple.prototype.render = function() {
	context.fillStyle = "#FF4444";
	context.fillRect(this.x * square, this.y * square, square, square);
};

function Snake(x, y) {
	this.x_speed = 1;
	this.y_speed = 1;
	this.tail = new Array();
	this.addBlock(x,y);
};

Snake.prototype.calculateColor = function() {
	max = 200;
	min = 100;
	gradient = (max - min) / this.tail.length;
	currentColor = min;
	for (var i = 0; i < this.tail.length ; i++) {
		this.tail[i].color = currentColor;
		currentColor += gradient;
	}
}

Snake.prototype.addBlock = function(x,y) {
	this.tail.push(new Block(x,y));
	this.calculateColor();
};

Snake.prototype.renderHead = function() {
	x = this.tail[0].x;
	y = this.tail[0].y;

	if(this.y_speed != 0) {
		context.fillStyle = "#FFFFFF";
		context.fillRect(x * square + square / 2 - 2 - 3, y * square + square / 2 - 2 + this.y_speed * 4, 4, 4);
		context.fillStyle = "#FFFFFF";
		context.fillRect(x * square + square / 2 - 2 + 3, y * square + square / 2 - 2 + this.y_speed * 4, 4, 4);
	} else {
		context.fillStyle = "#FFFFFF";
		context.fillRect(x * square + square / 2 - 2 + this.x_speed * 4, y * square + square / 2 - 2 - 3, 4, 4);
		context.fillStyle = "#FFFFFF";
		context.fillRect(x * square + square / 2 - 2 + this.x_speed * 4, y * square + square / 2 - 2 + 3, 4, 4);
	}
}

Snake.prototype.render = function() {
	for (var i = 0; i < this.tail.length; i++) {
		this.tail[i].render();
	}
	this.renderHead();
};

Snake.prototype.move = function(x, y) {
	this.x_speed = x;
	this.y_speed = y;
};

Snake.prototype.updateTail = function() {
	for (var i = this.tail.length - 1; i > 0; i--) {
		this.tail[i].x = this.tail[i-1].x;
		this.tail[i].y = this.tail[i-1].y;
	}
};

Snake.prototype.checkCollision = function() {
	if (this.tail[0].x < 0
		|| this.tail[0].y < 0
		|| this.tail[0].x * square + square > width
		|| this.tail[0].y * square + square > height) {
		return true;
	}
	for (var i = this.tail.length - 1; i > 0; i--) {
		if(this.tail[0].x == this.tail[i].x && this.tail[0].y == this.tail[i].y) {
			return true;
		}
	}
	return false
}

Snake.prototype.eat = function(apple) {
	if (this.tail[0].x == apple.x && this.tail[0].y == apple.y) {
		apple.place();
		this.addBlock(0,0);
		incrementScore();
	}
};

Snake.prototype.update = function(apple) {
	for(var key in keysDown) {
		var value = Number(key);
		if(value == 38 && this.y_speed != 1) { // up arrow
			this.move(0,-1);
			pause = false;
		} else if (value == 40 && this.y_speed != -1) { // down arrow
			this.move(0,1);
			pause = false;
		} else if (value == 37 && this.x_speed != 1) { // left arrow
			this.move(-1,0);
			pause = false;
		} else if (value == 39 && this.x_speed != -1) { // right arrow
			this.move(1,0);
			pause = false;
		} else if (value == 80) { // P -> pause
			pause = !pause;
		}
		delete keysDown[key];
	}

	if(!pause) {
		this.eat(apple);

		this.updateTail();

		//TODO ajouter super pouvoir pour traverser les murs
		//this.tail[0].x = parseInt(this.tail[0].x + this.x_speed).mod(width / square);
		//this.tail[0].y = parseInt(this.tail[0].y + this.y_speed).mod(height / square);
		this.tail[0].x += this.x_speed;
		this.tail[0].y += this.y_speed;

		finJeux = this.checkCollision();
	}
};

var renderBackground = function() {
	context.fillStyle = 'rgba(255, 255, 126, 1)';
	context.fillRect(0, 0, width, height);

	context.fillStyle = 'rgba(126, 126, 32, 0.2)';
	for(i = 0; i < width / square; i += 1) {
		for(j = i % 2; j < height / square; j += 2) {
			context.fillRect(i * square, j * square, square, square);
		}
	}

}

var finJeux = false;
var pause = true;
var score = 0;
var scoreText;

var snake = new Snake(5,5);
snake.addBlock(5,4);
snake.addBlock(5,3);

var apple = new Apple();
apple.place();

var incrementScore = function() {
	score++;
	scoreText.innerHTML = "Score : " + score;
}

var render = function() {
	renderBackground();
	apple.render();
	snake.render();

	if(pause) {
		context.fillStyle = 'rgba(0,0,0, 0.5)';
		context.fillRect(0, 0, width, height);

		context.fillStyle = '#FFFFFF';
		context.fillRect(width / 2 - 20 - 30, height / 2 - 50, 40, 100);
		context.fillStyle = '#FFFFFF';
		context.fillRect(width / 2 - 20 + 30, height / 2 - 50, 40, 100);
	}
};

var update = function() {
	snake.update(apple);
};

var end = function() {
	context.fillStyle = '#000000';
	context.fillRect(0, 0, width, height);
	apple.render();
	snake.render();
};1000/60

var step = function() {
	update();
	if(!finJeux) {
		render();
		animate(step);
	} else {
		end();
	}
};

window.onload = function() {
	document.getElementById("snake").appendChild(canvas);
	scoreText = document.getElementById("score");
	animate(step);
};
