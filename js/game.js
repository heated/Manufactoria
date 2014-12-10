// Manufactoria 2: The dot deliverance.

var Game = function () {
	this.initializeGlobals();
	this.initializeBoard();
	this.initializeListeners();
	this.displayMemory();
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
		this.initializeTrial();

		// begin at the top middle of the board
		this.posX = this.halfSize;
		this.posY = 0;

		this.robot = $('<div id="robot">');
		this.updateRobotPos();
	},

	initializeTrial: function () {
		var memoryLength = Math.floor(Math.random() * 10);
		this.memory = '';
		for (var i = 0; i < memoryLength; i++) {
			this.memory += (Math.random() < 0.5) ? 'a' : 'b';
		}
		this.displayMemory();
	},

	initializeListeners: function () {
		this.initializeMouseListeners();
		this.initializeKeyboardListeners();
	},

	initializeMouseListeners: function () {
		var self = this;

		$('#board-wrapper .tile').click(this.handleClick.bind(this))

		$('#test').click(this.newTest.bind(this));

		this.setupPlacementInfo();
	},

	newTest: function () {
		// no multiple game loops running!
		if (this.gameLoop) {
			return;
		}

		this.initializeRobot();
		this.gameLoop = setInterval(this.iterate.bind(this), 1000);
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
		key('3', this.setTileType.bind(this, 'push-red'));
		key('4', this.setTileType.bind(this, 'push-blue'));
		key('5', this.setTileType.bind(this, 'push-green'));
		key('6', this.setTileType.bind(this, 'push-yellow'));
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

	displayMemory: function () {
		$('#memory').text(this.memory);
	},

	iterate: function () {
		this.displayMemory();

		var currentTile = this.board[this.posY][this.posX];
		var tileRotation = currentTile.attr('rotation');
		switch (currentTile.attr('tile-type')) {
		case 'blank':
			// reject
			$('#test-status').text('Incorrect');
			this.stopTest();
			break;
		case 'start':
			this.moveRobot(tileRotation);
			break;
		case 'mover':
			this.moveRobot(tileRotation);
			break;
		case 'reader':
			this.moveRobot(tileRotation);
			break;
		case 'push-red':
			this.memory += 'R';
			this.moveRobot(tileRotation);
			break;
		case 'push-blue':
			this.memory += 'B';
			this.moveRobot(tileRotation);
			break;
		case 'push-green':
			this.memory += 'G';
			this.moveRobot(tileRotation);
			break;
		case 'push-yellow':
			this.memory += 'Y';
			this.moveRobot(tileRotation);
			break;
		case 'accept':
			$('#test-status').text('Correct!');
			this.stopTest();
			break;
		}
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

	stopTest: function () {
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
