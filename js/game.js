// Manufactoria 2: The dot deliverance.

var Level = function (options) {
		// testFn: function (testString) { return true; },
		// availableTileTypes: ['mover']
	$('#level-name').text(options.name);
	$('#level-instructions').text(options.instructions);
	this.size = options.size;
	this.testFn = options.testFn;
	// do some crazy shit with options.availableTileTypes

	this.initializeGlobals();
	this.initializeBoard();
	this.initializeListeners();
	this.displayMemory();
};

Level.prototype = {
	initializeGlobals: function () {
		this.halfSize = Math.floor(this.size / 2);
		this.boardWrapper = $('#board-wrapper');
		this.boardWrapper.width(450);
		this.boardWrapper.height(450);
		this.placementInfo = $('#placement-info');
		this.tileSize = this.boardWrapper.width() / this.size;
		this.flipped = false;
		this.changeDirection('down');
		this.setTileType('mover');
		this.placingTiles = false;
	},

	initializeBoard: function () {
		this.board = this.new2DSquareArray(this.size);
		this.fillBoardWithBlankTiles();
		this.setupStartAndAcceptTiles();
	},

	new2DSquareArray: function (size) {
		return _.map(new Array(size), function () {
			return new Array(size);
		});
	},

	fillBoardWithBlankTiles: function () {
		// note: this.board[y][x] refers to the tile x to the right and y down
		this.boardEach(function (tile, i, j) {
			var newTile = $('<div class="tile" tile-type="blank">');
			this.boardWrapper.append(newTile);
			this.board[i][j] = newTile;
		}.bind(this));

		// set the width and height of all tiles on the screen to the tile size of the level
		$('.tile').width(this.tileSize);
		$('.tile').height(this.tileSize);
	},

	setupStartAndAcceptTiles: function () {
		var startingTile = this.board[0][this.halfSize];
		startingTile.attr('tile-type', 'start');
		startingTile.attr('rotation', 'down');

		var acceptTile = this.board[this.size - 1][this.halfSize];
		acceptTile.attr('tile-type', 'accept');
	},

	initializeRobot: function () {
		this.initializeTrial();

		// begin at the top middle of the board
		this.posX = this.halfSize;
		this.posY = 0;

		this.robot = $('<div id="robot">');
		this.robot.width(this.tileSize);
		this.robot.height(this.tileSize);
		this.boardWrapper.append(this.robot);
		this.updateRobotPos();
	},

	initializeTrial: function () {
		this.randomizeMemory();
		this.displayMemory();
	},

	randomizeMemory: function () {
		this.memory = '';

		_.times(_.random(9), function () {
			this.memory += _.random(1) === 0 ? 'R' : 'B';
		}, this);

		this.initialTrialMemory = this.memory;
	},

	initializeListeners: function () {
		this.initializeMouseListeners();
		this.initializeKeyboardListeners();
	},

	initializeMouseListeners: function () {
		var self = this;

		$('#test').click(this.newTest.bind(this));

		this.setupPlacementInfo();

		this.boardWrapper.mousedown(function () { self.placingTiles = true; });
		this.boardWrapper.mouseup(function () { self.placingTiles = false; });

		var boardTiles = this.boardWrapper.find('.tile');

		boardTiles.click(this.handleClick.bind(this));
		boardTiles.mousemove(function (event) {
			if (self.placingTiles) {
				self.handleClick(event);
			}
		});
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
		key('2', this.setTileType.bind(this, 'reader-blue-red'));
		key('3', this.setTileType.bind(this, 'reader-green-yellow'));
		key('4', this.setTileType.bind(this, 'push-red'));
		key('5', this.setTileType.bind(this, 'push-blue'));
		key('6', this.setTileType.bind(this, 'push-green'));
		key('7', this.setTileType.bind(this, 'push-yellow'));
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
		var currentTile = this.board[this.posY][this.posX];
		var tileRotation = currentTile.attr('rotation');
		
		switch (currentTile.attr('tile-type')) {
		case 'blank':
			this.finishTest('reject');
			break;
		case 'start':
		case 'mover':
			this.moveRobot(tileRotation);
			break;
		case 'reader-blue-red':
			var blob = this.memory[0];
			if (blob === 'R' || blob === 'B') {
				this.consumeBlobAndOutput(currentTile, blob);
			} else {
				this.moveRobot(tileRotation);
			}
			break;
		case 'reader-green-yellow':
			var blob = this.memory[0];
			if (blob === 'G' || blob === 'Y') {
				this.consumeBlobAndOutput(currentTile, blob);
			} else {
				this.moveRobot(tileRotation);
			}
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
			this.finishTest('accept');
			break;
		}
		
		this.displayMemory();
	},

	addRotation: function (rotation, clockWiseTurns) {
		var directions = ['left', 'up', 'right', 'down'];
		var index = directions.indexOf(rotation);
		var newIndex = (index + clockWiseTurns) % directions.length;
		return directions[newIndex];
	},

	consumeBlobAndOutput: function (currentTile, blob) {
		this.memory = this.memory.slice(1); // shift
		this.moveRobot( this.readerOutputDirection(currentTile, blob) );
	},

	readerOutputDirection: function (tile, blob) {
		var goingRight = (blob === 'R' || blob === 'Y');
		if (tile.attr('flipped') === 'true') {
			goingRight = !goingRight;
		}
		return this.addRotation(tile.attr('rotation'), goingRight ? 1 : 3);
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
		// this.robot.detach();
		// this.board[this.posY][this.posX].append(this.robot);
		this.robot.css('top', this.posY * this.tileSize);
		this.robot.css('left', this.posX * this.tileSize);
	},

	finishTest: function (finishState) {
		var accepted = finishState === 'accept';
		var expectedResult = this.testFn(this.initialTrialMemory);
		if (typeof expectedResult === 'string') {
			var correctAnswer = accepted && this.memory === expectedResult;
		} else {
			var correctAnswer = accepted === expectedResult;
		}

		$('#test-status').text(correctAnswer ? 'Correct!' : 'Incorrect');

		this.stopTest();
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

$(document).ready(function () {
	var levels = [
		{
			name: 'Robotoast',
			size: 5,
			testFn: function () { return true; },
			instructions: 'Accept all robots! Move the robots down to the accept tile.',
			availableTileTypes: ['mover']
		},
		{
			name: 'Robocoffee',
			size: 5,
			testFn: function (testString) { return testString[0] === 'B'; },
			instructions: 'Accept robots that start with B!',
			availableTileTypes: ['mover', 'reader-blue-red']
		},
		{
			name: 'Robolamp',
			size: 7,
			testFn: function (testString) {
				return (testString.split('B').length - 1) >= 3;
			},
			instructions: 'Accept robots with at least three Bs!',
			availableTileTypes: ['mover', 'reader-blue-red']
		}
	];

	var levelOne = new Level(levels[2]);
});

// Each level is described by a size, a function, and maybe a set of test strings. The function is given the input string and returns either true for accept, false for reject, or a string for a transformation. It might also be a good idea to have a list of allowed tile types for each level.
