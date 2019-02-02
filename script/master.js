//reference elements
var roomStat = document.getElementById('room');
var monstersStat = document.getElementById('monsters');
var healthStat = document.getElementById('health');
var turnStat = document.getElementById('turn');
var skipStat = document.getElementById('skip');

var monsterSlots = document.getElementsByClassName('monster');
var attackSlots = document.getElementsByClassName('attack');
var handSlots = document.getElementsByClassName('hand');

var cardBase = document.getElementById('cards');

var instructions = document.getElementById('instructions');
var instructionsButton = document.getElementById('instructionsbutton');

var win = document.getElementById('win');
var lose = document.getElementById('lose');

var logElement = document.getElementById('log');
var logText = document.getElementById('logtext');
var logButton = document.getElementById('logbutton');

var inputBlocker = document.getElementById('inputblocker');

//slots
var mSlots = [];
var aSlots = [];
var hSlots = [];

//cards
var monsters = [];
var attacks = [];

//slot dimensions
var smallWidth = handSlots[0].offsetWidth;
var smallHeight = handSlots[0].offsetHeight;
var largeWidth = monsterSlots[0].offsetWidth;
var largeHeight = monsterSlots[0].offsetHeight;

//mouse
var cursorX = 0;
var cursorY = 0;
var holding = null;
var takenSlot = null;

//trackers and stats
var room = 1;
var health = 50;
var log = '';
var instructionsToggle = false;
var logToggle = true;

//setup on start
function setup() {
	createSlots();

	createMonsters();
	createAttacks();

	instructionsButton.addEventListener('click', toggleInstructions, true);
	logButton.addEventListener('click', toggleLog, true);

	loadRoom();
	refillHand();
	updateStats();

	updateLog('Dungeon loaded.');
}

//add new line to log
function updateLog(text) {
	log += text + '<br><br>';
	logText.innerHTML = log;
	logText.scrollTop = logText.scrollHeight;
}

//loads room - spawns monsters
function loadRoom() {

	if (liveMonsters().length <= 0) {
		winGame();
	} else {
		updateLog('Moved to next room.');
	}

	if (liveMonsters().length < 4) {
		for (var i = 0; i < liveMonsters().length; i++) {
			mSlots[i].card = createCard(liveMonsters()[i], mSlots[i], i);
			mSlots[i].data = liveMonsters()[i];
			liveMonsters()[i].slot = mSlots[i];
		}
	} else {
		for (var i = 0; i < 4; i++) {
			mSlots[i].card = createCard(liveMonsters()[i], mSlots[i], i);
			mSlots[i].data = liveMonsters()[i];
			liveMonsters()[i].slot = mSlots[i];
		}
	}

	blockSlots();
	updateStats();
}

//plays turn - calculates damage to enemies and self, death, nullifications, cleans board, loads next phase
function playTurn() {
	var hasCards = false;
	for (var i = 0; i < aSlots.length; i++) {
		if (aSlots[i].card) hasCards = true;
	}
	
	if (hasCards) {
		updateLog('<b>===<br>Turn played.</b>')

		var monster;
		
		//monster
		for (var i = 0; i < mSlots.length; i++) {
			if (mSlots[i].data) damageMonster(mSlots[i].data, i);
		}

		//self
		damageSelf();

		//load
		var empty = true;
		for (var i = 0; i < mSlots.length; i++) {
			if (mSlots[i].card) empty = false;
		}

		blockSlots();
		refillHand();

		//update
		if (empty) {
			room++;
			setTimeout(function () {
				loadRoom();
			}, 1000);
		}

		updateStats();
	} else {
		updateLog('Cannot play turn with no attack cards on the field.')
	}
}

//skip turn when only hearts remain
function skipTurn() {
	var empty = true;

	for (var i = 0; i < mSlots.length; i++) {
		if (mSlots[i].data) {
			if (mSlots[i].data.element != 'heal') empty = false;
		}
	}

	//if only healing cards remain, remove cards from the board and reshuffle into monster deck
	if (empty) {
		for (var i = 0; i < mSlots.length; i++) {
			if (mSlots[i].data) {
				mSlots[i].card.parentNode.removeChild(mSlots[i].card);
				mSlots[i].card = null;

				mSlots[i].data.slot = null;
				mSlots[i].data = null;
			}
		}

		shuffleArray(monsters);
		room++;
		setTimeout(function () {
			loadRoom();
		}, 1000);
	} else {
		updateLog('Cannot skip turn with live monsters on the field.')
	}
}

//lose game
function loseGame() {
	updateLog('You died.');
	lose.style.display = 'block';
	inputBlocker.style.display = 'block';
}

//win game
function winGame() {
	updateLog('You won.');
	win.style.display = 'block';
	inputBlocker.style.display = 'block';
}

//toggle instructions
function toggleInstructions() {
	instructionsToggle = !instructionsToggle;

	if (instructionsToggle) {
		instructions.style.display = 'block';
	} else {
		instructions.style.display = 'none';
	}
}

//toggle log
function toggleLog() {
	logToggle = !logToggle;

	if (logToggle) {
		logElement.style.display = 'block';
	} else {
		logElement.style.display = 'none';
	}
}

//on mouse up - check location of drop
function mouseUp(e) {
	if (e.which === 1) {

		if (holding) {
			var target = false;

			//if drop is on empty slot, move card to slot and update slot and card data to reflect position change
			for (var i = 0; i < aSlots.length; i++) {
				if (cursorX > aSlots[i].x && cursorX < aSlots[i].x + aSlots[i].width && cursorY > aSlots[i].y && cursorY < aSlots[i].y + aSlots[i].height) {
					if (!aSlots[i].card) {
						var index;
						if (i < 4) index = i;
						else index = i - 4;

						if (mSlots[index].card && mSlots[index].data.element !== 'heal') {
							target = true;
							moveToSlot(holding, aSlots[i], takenSlot.data, i);
							changeSize(holding, 30, largeWidth, largeHeight);
							updateLog('Moved card to attack slot ' + i + '.');
						}
					}
					break;
				}
			}

			for (var i = 0; i < hSlots.length; i++) {
				if (cursorX > hSlots[i].x && cursorX < hSlots[i].x + hSlots[i].width && cursorY > hSlots[i].y && cursorY < hSlots[i].y + hSlots[i].height) {
					if (!hSlots[i].card) {
						target = true;
						moveToSlot(holding, hSlots[i], takenSlot.data, i);
						changeSize(holding, 20, smallWidth, smallHeight);
						updateLog('Moved card to hand slot ' + i + '.');
					}
					break;
				}
			}

			//if drop is not on empty slot, revert card to default location
			if (!target) {
				switch (takenSlot.type) {
					case 'attack':
						changeSize(holding, 30, largeWidth, largeHeight);
						break;

					case 'hand':
						changeSize(holding, 20, smallWidth, smallHeight);
						break;
				}

				moveToSlot(holding, takenSlot, takenSlot.data, holding.getAttribute('slot'));
			}
			else if (takenSlot) {
				takenSlot.card = null;
				takenSlot.data = null;
				takenSlot = null;
			}
			holding.style.zIndex = 2;
			holding.style.opacity = 1;
			holding = null;
		}

		window.removeEventListener('mousemove', moveCard, true);
	}
}

//on mouse down (event listener on card) - check where card was taken from, and move it to mouse position
function mouseDown(e) {
	if (e.which == 1) {
		holding = e.target;

		holding.style.zIndex = 10;

		var type = holding.getAttribute('type');
		var slot = holding.getAttribute('slot');

		switch (type) {
			case 'monster':
				takenSlot = mSlots[slot];
				break;

			case 'attack':
				takenSlot = aSlots[slot];
				break;

			case 'hand':
				takenSlot = hSlots[slot];
				break;
		}

		holding.style.opacity = 0.5;
		changeSize(holding, 35, largeWidth + 20, largeHeight + 20);

		window.addEventListener('mousemove', moveCard, true);
	}
}

//flip card on right click
function rightMouseDown(e) {
	e.preventDefault();

	var type = e.target.getAttribute('type');
	var slot = e.target.getAttribute('slot');
	var c;

	switch (type) {
		case 'attack':
			c = aSlots[slot].data;
			break;

		case 'hand':
			c = hSlots[slot].data;
			break;
	}

	flipCard(e.target, c);
}

//move card to mouse position
function moveCard(e) {
	holding.style.left = cursorX - (holding.offsetWidth / 2) + 'px';
	holding.style.top = cursorY - (holding.offsetHeight / 2) + 'px';
}

//consume card (for health)
function consumeClick(e) {
	consumeHealth(mSlots[e.target.getAttribute('slot')]);
	blockSlots();
	updateStats();
}

//setup on start
window.addEventListener('DOMContentLoaded', function() {
	setup();
});

//play turn when 'play turn' is clicked
turnStat.addEventListener('click', function() {
	playTurn();
});

//skip room when only hearts remain
skipStat.addEventListener('click', function() {
	skipTurn();
});

//update mouse coordinates
document.onmousemove = function(event) {
	cursorX = event.pageX;
	cursorY = event.pageY;
}

//reposition cards and slots on window resize
window.onresize = function() {
	recalculateSlots();

	for (var i = 0; i < mSlots.length; i++) {
		if (mSlots[i].card)	repositionToSlot(mSlots[i].card, mSlots[i]);
	}

	for (var i = 0; i < hSlots.length; i++) {
		if (hSlots[i].card) repositionToSlot(hSlots[i].card, hSlots[i]);
	}

	for (var i = 0; i < aSlots.length; i++) {
		if (aSlots[i].card) repositionToSlot(aSlots[i].card, aSlots[i]);
	}
}

//listen for mouse up
window.addEventListener('mouseup', mouseUp, false);