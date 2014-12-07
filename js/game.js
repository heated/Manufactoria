// Manufactoria 2: The dot deliverance.
var Adder = function () {
	
}

var Part = function (rotation, flip, type) {
	this.rotation = rotation;
	this.flipped = flip;
	// Maybe these should be further objects. this.effect contains info on how
	// to process memory, outputting an effect on memory and a direction to
	// move. It also should contain the image for the tile.
	switch (type) {
		case 'convey':
			this.effect = new function () {
				// TODO fill in
		 	};
		break;
		case 'split':
			this.effect = new function () {

			};
		break;
		case 'add':
			this.effect = new function () {

			};
		break;
		//case 'start':
		//case 'accept':
	}
};

Part.prototype = {
	
};

var Game = function () {
	this.initializeGlobals();
	this.initializeBoardState();
	this.initializeListeners();
	this.displayGame();
};

Game.prototype = {
	initializeGlobals: function () {
		this.size = 9;
		this.canvas = $('#display')[0];
		this.context = this.canvas.getContext('2d');
		this.tileSize = this.canvas.width / this.size;
		this.tiles = ['blank', 'left', 'up', 'right', 'down', 'start', 'accept'];
		this.flipped = false;
		this.rotation = 'down';
	},

	initializeBoardState: function () {
		this.memory = 'aababababaab';
		this.initializeBoard();
		this.initializeRobot();
	},

	initializeBoard: function () {
		var size = this.size;
		this.board = _.map(new Array(size), function () {
			return new Array(size);
		});

		this.boardEach(function (tile, i, j) {
			this.board[i][j] = 0; //blank
		}.bind(this));

		this.board[Math.floor(this.size / 2)][this.size - 1] = 6 //accept
		this.board[Math.floor(this.size / 2)][0] = 5 //start
	},

	initializeRobot: function () {
		// begin at the top middle of the board
		this.posX = Math.floor(this.size / 2);
		this.posY = 0;
	},

	initializeListeners: function () {
		var self = this;

		$(this.canvas).click(this.handleClick.bind(this));

		// Test the machine.
		$('#run').click(function () {
			self.gameLoop = setInterval(self.iterate.bind(self), 1000);
		});

		// handle keyboard presses
		key('left', this.changeDirection.bind(this, 'left'));
		key('up', this.changeDirection.bind(this, 'up'));
		key('right', this.changeDirection.bind(this, 'right'));
		key('down', this.changeDirection.bind(this, 'down'));
		key('space', this.flipOrientation.bind(this));
	},

	changeDirection: function (direction) {
		this.rotation = direction;
		this.displayOrientation();
	},

	flipOrientation: function () {
		this.flipped = !this.flipped;
		this.displayOrientation();
	},

	handleClick: function (event) {
		// can't place while the robot is doing the robot!
		if (this.gameLoop) {
			return;
		}

		var tileX = this.convertPixelsToTiles(event.offsetX);
		var tileY = this.convertPixelsToTiles(event.offsetY);

		// increment the tile number
		this.board[tileX][tileY] = (this.board[tileX][tileY] + 1) % (this.tiles.length - 2);
		// I'm just going to say this is the stupidest idea ever and will probably have to be rewritten twice. - Edward


		this.displayGame();
	},

	convertPixelsToTiles: function (pixels) {
		return Math.floor(pixels / this.tileSize);
	},

	displayGame: function () {
		this.displayBoard();
		this.displayRobot();
		this.displayMemory();
		this.displayOrientation();
	},

	displayBoard: function () {
		this.boardEach(function (tile, i, j) {
			// Not sure if I chose great style here.
			switch (this.board[i][j]) {
			case 0: //blank
				this.context.fillStyle = 'white';
				break;
			case 1: //left
				this.context.fillStyle = 'red';
				break;
			case 2: //up
				this.context.fillStyle = 'orange';
				break;
			case 3: //right
				this.context.fillStyle = 'yellow';
				break;
			case 4: //down
				this.context.fillStyle = 'green';
				break;
			case 5: //start
				this.context.fillStyle = 'blue';
				break;
			case 6: //accept
				this.context.fillStyle = 'purple';
				break;
			}

			this.context.fillRect(i * this.tileSize, j * this.tileSize, this.tileSize, this.tileSize);
		}.bind(this));
	},

	displayRobot: function () {
		this.context.fillStyle = 'black';
		this.context.fillRect(this.posX * this.tileSize + 10,
							  this.posY * this.tileSize + 10,
							  this.tileSize - 20,
							  this.tileSize - 20);
	},

	displayMemory: function () {
		$('#memory').text(this.memory);
	},

	displayOrientation: function () {
		$('#flip').text(this.flipped ? 'flipped!' : 'not flipped!');
		$('#rotation').text(this.rotation);
	},

	iterate: function () {
		switch (this.board[this.posX][this.posY]) {
		case 0: //blank
			// you lose
			alert('Incorrect');
			this.restart();
			break;
		case 1: //left
			this.posX -= 1;
			break;
		case 2: //up
			this.posY -= 1;
			break;
		case 3: //right
			this.posX += 1;
			break;
		case 4: //down
			this.posY += 1;
			break;
		case 5: //start
			this.posY += 1;
			break;
		case 6: //accept
			// you win
			alert('Correct!');
			this.restart();
			break;
		}

		this.displayGame();
	},

	restart: function () {
		clearInterval(this.gameLoop);
		this.gameLoop = null;
		this.initializeRobot();
	},

	boardEach: function (func) {
		for (var i = 0; i < this.board.length; i++) {
			for (var j = 0; j < this.board[0].length; j++) {
				func(this.board[i][j], i, j);
			}
		}
	}
};

$(function () {
	var game = new Game();
});
