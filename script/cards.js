//abstract card class
function Card(type) {
	this.type = type;
	this.slot;
}

//monster class - holds all monster class data
function Monster(type, element, health) {
	Card.call(this, type);

	this.health = health;
	this.element = element;
	this.live = true;

	this.form;
	this.elementForm = null;

	if (element != 'heal') {
		this.form = 'assets/monsters/5.svg';
		//this.form = 'assets/monsters/' + health + '.svg';
		this.elementForm = 'assets/elements/' + element + '.svg';
	} else {
		this.form = 'assets/elements/heal.svg';
	}
}

//attack class - holds all attack card data
function Attack(type, poleType, pole, opoleType, opole) {
	Card.call(this, type);

	this.pole = pole;
	this.poleType = poleType;
	this.opole = opole;
	this.opoleType = opoleType;
	this.flipped = false;
	this.inPair = false;
	this.live = true;
	this.poleForm = 'assets/elements/' + poleType + '.svg';
	this.opoleForm = 'assets/elements/' + opoleType + '.svg';
}

//slot class - holds all slot data
function Slot(type, element, x, y, width, height) {
	this.type = type; //monster, attack, hand
	this.element = element;
	this.card = null;
	this.data = null;
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
}