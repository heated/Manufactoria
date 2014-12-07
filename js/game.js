// Manufactoria 2: The dot deliverance.

// var Adder = function () {
	
// }

// var Part = function (rotation, flip, type) {
// 	this.rotation = rotation;
// 	this.flipped = flip;
// 	// Maybe these should be further objects. this.effect contains info on how
// 	// to process memory, outputting an effect on memory and a direction to
// 	// move. It also should contain the image for the tile.
// 	switch (type) {
// 		case 'convey':
// 			this.effect = new function () {
// 				// TODO fill in
// 		 	};
// 		break;
// 		case 'split':
// 			this.effect = new function () {

// 			};
// 		break;
// 		case 'add':
// 			this.effect = new function () {

// 			};
// 		break;
// 		//case 'start':
// 		//case 'accept':
// 	}
// };

// Part.prototype = {
	
// };

var Game = function () {
	this.initializeGlobals();
	this.initializeBoardState();
	this.initializeListeners();
	this.displayGame();
};

Game.prototype = {
	initializeGlobals: function () {
		this.size = 9;
		this.boardWrapper = $('#board-wrapper');
		this.tileSize = this.boardWrapper.width() / this.size;
		this.tiles = ['blank', 'left', 'up', 'right', 'down', 'start', 'accept'];
		this.flipped = false;
		this.rotation = 'down';
		this.tileType = 'mover';
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

		// fill the board with blank tiles
		this.boardEach(function (tile, i, j) {
			var newTile = $('<div class="tile" tile-type="blank">');
			this.boardWrapper.append(newTile);
			this.board[i][j] = newTile;
		}.bind(this));

		this.board[this.size - 1][Math.floor(this.size / 2)].attr('tile-type', 'accept');
		this.board[0][Math.floor(this.size / 2)].attr('tile-type', 'start');
	},

	initializeRobot: function () {
		// begin at the top middle of the board
		this.posX = Math.floor(this.size / 2);
		this.posY = 0;
	},

	initializeListeners: function () {
		var self = this;

		this.boardEach(function (tile, i, j) {
			tile.click(self.handleClick.bind(self));
		});

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
		key('0', this.setTileType.bind(this, 'blank'));
		key('1', this.setTileType.bind(this, 'mover'));
		key('2', this.setTileType.bind(this, 'reader'));
	},

	changeDirection: function (direction) {
		this.rotation = direction;
		this.displayPlacementInfo();
	},

	flipOrientation: function () {
		this.flipped = !this.flipped;
		this.displayPlacementInfo();
	},

	setTileType: function (tileType) {
		this.tileType = tileType;
		this.displayPlacementInfo();
	},

	handleClick: function (event) {
		// can't place while the robot is doing the robot!
		if (this.gameLoop) {
			return;
		}

		var tile = $(event.target);
		tile.attr('rotation', this.rotation);
		tile.attr('flipped', this.flipped);
		tile.attr('tile-type', this.tileType);


		// increment the tile number
		// this.board[tileX][tileY] = (this.board[tileX][tileY] + 1) % (this.tiles.length - 2);
		// I'm just going to say this is the stupidest idea ever and will probably have to be rewritten twice. - Edward
	},

	displayGame: function () {
		// this.displayBoard();
		this.displayRobot();
		this.displayMemory();
		this.displayPlacementInfo();
	},

	// displayBoard: function () {
	// 	this.boardEach(function (tile, i, j) {
	// 		// Not sure if I chose great style here.
	// 		// switch (this.board[i][j]) {
	// 		// case 0: //blank
	// 		// 	this.context.fillStyle = 'white';
	// 		// 	break;
	// 		// case 1: //left
	// 		// 	this.context.fillStyle = 'red';
	// 		// 	break;
	// 		// case 2: //up
	// 		// 	this.context.fillStyle = 'orange';
	// 		// 	break;
	// 		// case 3: //right
	// 		// 	this.context.fillStyle = 'yellow';
	// 		// 	break;
	// 		// case 4: //down
	// 		// 	this.context.fillStyle = 'green';
	// 		// 	break;
	// 		// case 5: //start
	// 		// 	this.context.fillStyle = 'blue';
	// 		// 	break;
	// 		// case 6: //accept
	// 		// 	this.context.fillStyle = 'purple';
	// 		// 	break;
	// 		// }

	// 		// this.context.fillRect(i * this.tileSize, j * this.tileSize, this.tileSize, this.tileSize);
	// 	}.bind(this));
	// },

	displayRobot: function () {
		// this.context.fillStyle = 'black';
		// this.context.fillRect(this.posX * this.tileSize + 10,
							  // this.posY * this.tileSize + 10,
							  // this.tileSize - 20,
							  // this.tileSize - 20);
	},

	displayMemory: function () {
		$('#memory').text(this.memory);
	},

	displayPlacementInfo: function () {
		$('#flip').text(this.flipped ? 'flipped!' : 'not flipped!');
		$('#rotation').text(this.rotation);
		$('#tile-type').text(this.tileType);
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
