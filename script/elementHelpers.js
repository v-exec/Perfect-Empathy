//creates card - returns either monster or attack card
function createCard(card, slot, i) {
	var c = document.createElement('div');
	c.className = card.type + ' card';
	
	if (card.type === 'monster') {
		var vText = document.createTextNode(card.health);
		var v = document.createElement('span');
		v.className = 'monsterhealth';
		v.appendChild(vText);

		var g = document.createElement('img');
		g.className = 'monsterimage';
		g.src = card.form;

		if (card.element != 'heal') {
			var e = document.createElement('img');
			e.className = 'monsterelement';
			e.src = card.elementForm;
		}

		c.style.width = largeWidth + 'px';
		c.style.height = largeHeight + 'px';

		c.appendChild(v);
		if (card.element != 'heal') c.appendChild(e);
		else {
			c.className += ' hover';
			c.addEventListener('mousedown', consumeClick, false);
		}
		c.appendChild(g);
	} else {
		var pText = document.createTextNode(card.pole);
		var opText = document.createTextNode(card.opole);

		var p = document.createElement('span');
		var op = document.createElement('span');

		if (card.flipped) {
			p.className = 'attackopole';
			op.className = 'attackpole';
		} else {
			p.className = 'attackpole';
			op.className = 'attackopole';
		}

		p.appendChild(pText);
		op.appendChild(opText);

		var pg = document.createElement('img');
		var opg = document.createElement('img');

		if (card.flipped) {
			pg.className = 'poleimage';
			opg.className = 'opoleimage';
		} else {
			pg.className = 'opoleimage';
			opg.className = 'poleimage';
		}

		pg.src = card.poleForm;
		opg.src = card.opoleForm;

		var d = document.createElement('div');
		d.className = 'attackdivider';

		c.style.width = smallWidth + 'px';
		c.style.height = smallHeight + 'px';

		c.addEventListener('mousedown', mouseDown, false);
		c.addEventListener('contextmenu', rightMouseDown, false);
		c.className += ' hover';
		c.appendChild(p);
		c.appendChild(op);
		c.appendChild(pg);
		c.appendChild(opg);
		c.appendChild(d);
	}

	c.setAttribute('type', slot.type);
	c.setAttribute('slot', i);
	moveToSlot(c, slot, card, i);
	cardBase.appendChild(c);

	return c;
}

//repositions card to given slot
function repositionToSlot(card, slot) {
	slot.x = slot.htmlobject.getBoundingClientRect().left;
	slot.y = slot.htmlobject.getBoundingClientRect().top;
	card.style.left = slot.x;
	card.style.top = slot.y;
}

//repositions slots
function recalculateSlots() {
	for (var i = 0; i < mSlots.length; i++) {
		mSlots[i].x = mSlots[i].htmlobject.getBoundingClientRect().left;
		mSlots[i].y = mSlots[i].htmlobject.getBoundingClientRect().top;
	}

	for (var i = 0; i < aSlots.length; i++) {
		aSlots[i].x = aSlots[i].htmlobject.getBoundingClientRect().left;
		aSlots[i].y = aSlots[i].htmlobject.getBoundingClientRect().top;
	}

	for (var i = 0; i < hSlots.length; i++) {
		hSlots[i].x = hSlots[i].htmlobject.getBoundingClientRect().left;
		hSlots[i].y = hSlots[i].htmlobject.getBoundingClientRect().top;
	}
}

//changes card size (from hand size to attack size, or vice versa)
function changeSize(card, text, width, height) {
	card.childNodes[2].style.top = '';
	card.childNodes[3].style.top = '';
	card.childNodes[2].style.bottom = '';
	card.childNodes[3].style.bottom = '';
	card.childNodes[2].style.left = '';
	card.childNodes[3].style.left = '';
	card.childNodes[2].style.right = '';
	card.childNodes[3].style.right = '';

	card.childNodes[0].style.bottom = '';
	card.childNodes[1].style.bottom = '';

	card.style.width = width + 'px';
	card.style.height = height + 'px';

	card.childNodes[2].style.width = '40%';
	card.childNodes[3].style.width = '40%';

	card.childNodes[0].style.fontSize = text + 'px';
	card.childNodes[1].style.fontSize = text + 'px';

	card.childNodes[2].style.left = (width / 2) - (card.childNodes[2].offsetWidth / 2) + 'px';
	card.childNodes[3].style.left = (width / 2) - (card.childNodes[3].offsetWidth / 2) + 'px';

	//get data
	var type = card.getAttribute('type');
	var slot = card.getAttribute('slot');
	var data;

	switch (type) {
		case 'attack':
			data = aSlots[slot].data;
			break;

		case 'hand':
			data = hSlots[slot].data;
			break;
	}

	//using width for height since height isn't set - works due to them being square images
	if (data.flipped) {
		card.childNodes[3].style.top = (height / 4) - (card.childNodes[2].offsetWidth / 2) + 'px';
		card.childNodes[2].style.bottom = (height / 4) - (card.childNodes[3].offsetWidth / 2) + 'px';
	} else {
		card.childNodes[2].style.top = (height / 4) - (card.childNodes[3].offsetWidth / 2) + 'px';
		card.childNodes[3].style.bottom = (height / 4) - (card.childNodes[2].offsetWidth / 2) + 'px';
	}

	card.childNodes[4].style.top = (height / 2) - 15 + 'px';
	card.childNodes[4].style.display = 'block';
}

function changeHidden(card, text, width, height) {
	changeSize(card, text, width, height);

	card.childNodes[2].style.top = '';
	card.childNodes[3].style.top = '';
	card.childNodes[2].style.left = '';
	card.childNodes[3].style.left = '';
	card.childNodes[2].style.right = '';
	card.childNodes[3].style.right = '';

	card.childNodes[0].style.fontSize = '12px';
	card.childNodes[1].style.fontSize = '12px';

	card.childNodes[0].style.bottom = '1.5px';
	card.childNodes[1].style.bottom = '1.5px';

	card.childNodes[2].style.width = '17px';
	card.childNodes[3].style.width = '17px';

	card.childNodes[2].style.bottom = '1px';
	card.childNodes[3].style.bottom = '1px';

	//get data
	var type = card.getAttribute('type');
	var slot = card.getAttribute('slot');
	var data;

	switch (type) {
		case 'attack':
			data = aSlots[slot].data;
			break;

		case 'hand':
			data = hSlots[slot].data;
			break;
	}

	if (data.flipped) {
		card.childNodes[3].style.left = '32px';
		card.childNodes[2].style.right = '32px';
	} else {
		card.childNodes[3].style.right = '32px';
		card.childNodes[2].style.left = '32px';
	}

	card.childNodes[4].style.display = 'none';
}

//flip attack card
function flipCard(card, attack) {
	attack.flipped = !attack.flipped;

	//check if in hidden slot
	var hidden = false;
	if (card.getAttribute('slot') > 3 && card.getAttribute('type') == 'attack') hidden = true;

	if (attack.flipped) {
		card.childNodes[0].className = 'attackopole';
		card.childNodes[1].className = 'attackpole';
		card.childNodes[2].className = 'opoleimage';
		card.childNodes[3].className = 'poleimage';

		var s = card.childNodes[2].style.top;
		var s1 = card.childNodes[3].style.bottom;

		card.childNodes[3].style.top = s1;
		card.childNodes[3].style.bottom = '';
		card.childNodes[2].style.bottom = s;
		card.childNodes[2].style.top = '';
	} else {
		card.childNodes[0].className = 'attackpole';
		card.childNodes[1].className = 'attackopole';
		card.childNodes[2].className = 'poleimage';
		card.childNodes[3].className = 'opoleimage';

		var s = card.childNodes[2].style.bottom;
		var s1 = card.childNodes[3].style.top;

		card.childNodes[2].style.top = s1;
		card.childNodes[2].style.bottom = '';
		card.childNodes[3].style.bottom = s;
		card.childNodes[3].style.top = '';
	}

	if (hidden) changeHidden(card, 30, largeWidth, largeHeight);
}

//set slot visuals
function blockSlots() {
	for (var i = 0; i < mSlots.length; i++) {
		if (mSlots[i].card) {
			if (mSlots[i].data.element == 'heal') {
				aSlots[i].htmlobject.style.backgroundColor = '#333';
				aSlots[i + 4].htmlobject.style.backgroundColor = '#333';
			} else {
				aSlots[i].htmlobject.style.backgroundColor = '#222';
				aSlots[i + 4].htmlobject.style.backgroundColor = '#222';
			}
		} else {
			aSlots[i].htmlobject.style.backgroundColor = '#333';
			aSlots[i + 4].htmlobject.style.backgroundColor = '#333';
		}
	}
}

//updates statistics
function updateStats() {
	roomStat.innerHTML = 'Room: ' + room;
	monstersStat.innerHTML = 'Monsters: ' + liveMonsters().length;
	healthStat.innerHTML = health + 'HP';

	if (health <= 0) loseGame();
}