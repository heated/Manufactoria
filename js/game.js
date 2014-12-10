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
		this.halfSize = Math.floor(this.size / 2);
		this.boardWrapper = $('#board-wrapper');
		this.placementInfo = $('#placement-info');
		this.tileSize = this.boardWrapper.width() / this.size;
		this.flipped = false;
		this.changeDirection('down');
		this.setTileType('mover');
	},

	initializeBoardState: function () {
		this.memory = 'aababababaab';
		this.initializeBoard();
	},

	initializeBoard: function () {
		this.board = _.map(new Array(this.size), function () {
			return new Array(this.size);
		}, this);

		this.fillBoardWithBlankTiles();

		var startingTile = this.board[0][this.halfSize];
		startingTile.attr('tile-type', 'start');
		startingTile.attr('rotation', 'down');

		var acceptTile = this.board[this.size - 1][this.halfSize];
		acceptTile.attr('tile-type', 'accept');
	},

	fillBoardWithBlankTiles: function () {
		// note: this.board[y][x] refers to the tile x to the right and y down
		this.boardEach(function (tile, i, j) {
			var newTile = $('<div class="tile" tile-type="blank">');
			this.boardWrapper.append(newTile);
			this.board[i][j] = newTile;
		}.bind(this));
	},

	initializeRobot: function () {
		// begin at the top middle of the board
		this.posX = this.halfSize;
		this.posY = 0;

		this.robot = $('<div id="robot">');
		this.updateRobotPos();
	},

	initializeListeners: function () {
		this.initializeMouseListeners();
		this.initializeKeyboardListeners();
	},

	initializeMouseListeners: function () {
		var self = this;

		$('#board-wrapper .tile').click(this.handleClick.bind(this))

		// Test the machine.
		$('#run').click(function () {
			self.initializeRobot();
			self.gameLoop = setInterval(self.iterate.bind(self), 1000);
		});

		this.setupPlacementInfo();
	},

	// create hovering tile placement indicator
	setupPlacementInfo: function () {
		var self = this;

		$(document).mousemove(this.updatePlacementInfoLocation.bind(this));
		this.boardWrapper.mouseover(function () { self.placementInfo.show() });
		this.boardWrapper.mouseout(function () { self.placementInfo.hide() });
		this.placementInfo.hide();
	},

	updatePlacementInfoLocation: function (event) {
		this.placementInfo.css({
			left:  event.pageX - this.placementInfo.width() / 2,
			top:   event.pageY - this.placementInfo.height() / 2
		});
	},

	initializeKeyboardListeners: function () {
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
		this.placementInfo.attr('rotation', direction);
	},

	flipOrientation: function () {
		this.flipped = !this.flipped;
		this.placementInfo.attr('flipped', this.flipped);
	},

	setTileType: function (tileType) {
		this.tileType = tileType;
		this.placementInfo.attr('tile-type', tileType);
	},

	handleClick: function (event) {
		// can't place while the robot is doing the robot!
		if (this.gameLoop) {
			return;
		}

		var tile = $(event.target);
		var tileType = tile.attr('tile-type');

		// can't overwrite start and accept tiles!
		if (tileType === 'start' || tileType === 'accept') {
			return;
		}

		tile.attr('rotation', this.rotation);
		tile.attr('flipped', this.flipped);
		tile.attr('tile-type', this.tileType);
	},

	displayGame: function () {
		this.displayMemory();
	},

	displayMemory: function () {
		$('#memory').text(this.memory);
	},

	iterate: function () {
		var currentTile = this.board[this.posY][this.posX];
		switch (currentTile.attr('tile-type')) {
		case 'blank':
			// reject
			alert('Incorrect');
			this.stop();
			break;
		case 'mover':
			this.moveRobot(currentTile.attr('rotation'));
			break;
		case 'reader':
			this.moveRobot(currentTile.attr('rotation'));
			break;
		case 'start':
			this.moveRobot(currentTile.attr('rotation'));
			break;
		case 'accept':
			alert('Correct!');
			this.stop();
			break;
		}

		this.displayGame();
	},

	moveRobot: function (direction) {
		switch (direction) {
		case 'left':
			this.posX--;
			break;
		case 'up':
			this.posY--;
			break;
		case 'right':
			this.posX++;
			break;
		case 'down':
			this.posY++;
			break;
		}

		this.updateRobotPos();
	},

	updateRobotPos: function () {
		this.robot.detach();
		this.board[this.posY][this.posX].append(this.robot);
	},

	stop: function () {
		clearInterval(this.gameLoop);
		this.gameLoop = null;
		this.robot.detach();
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
