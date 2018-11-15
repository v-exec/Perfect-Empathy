//creates arrays of all slots
function createSlots() {
	for (var i = 0; i < monsterSlots.length; i++) {
		var m = new Slot('monster', monsterSlots[i], monsterSlots[i].getBoundingClientRect().left, monsterSlots[i].getBoundingClientRect().top, largeWidth, largeHeight);
		mSlots.push(m);
	}

	for (var i = 0; i < attackSlots.length; i++) {
		var a = new Slot('attack', attackSlots[i], attackSlots[i].getBoundingClientRect().left, attackSlots[i].getBoundingClientRect().top, largeWidth, largeHeight);
		aSlots.push(a);
	}

	for (var i = 0; i < handSlots.length; i++) {
		var h = new Slot('hand', handSlots[i], handSlots[i].getBoundingClientRect().left, handSlots[i].getBoundingClientRect().top, smallWidth, smallHeight);
		hSlots.push(h);
	}
}

//creates array of all monsters
function createMonsters() {
	for (var i = 0; i < 4; i++) {
		for (var j = 5; j < 15; j++) {
			var m;

			switch (i) {
				case 0:
					m = new Monster('monster', 'cut', j);
					break;

				case 1:
					m = new Monster('monster', 'poison', j);
					break;

				case 2:
					m = new Monster('monster', 'burn', j);
					break;

				case 3:
					m = new Monster('monster', 'heal', j);
					break;
			}
			
			monsters.push(m);
		}
	}
	shuffleArray(monsters);
}

//creates array of all attack cards
function createAttacks() {
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 14; j++) {

			//determine elemental poles
			var atype;
			var aotype;

			switch (i) {
				case 0:
					atype = 'poison';
					aotype = 'burn';
					break;

				case 1:
					atype = 'cut';
					aotype = 'poison';
					break;

				case 2:
					atype = 'burn';
					aotype = 'cut';
					break;
			}

			//determine pole values
			var aval;
			var aoval;
			var poleswitch = false;

			//even cards
			if (j < 4) {
				switch (j) {
					case 0:
						aval = 4;
						aoval = 4;
						break;

					case 1:
						aval = 6;
						aoval = 6;
						break;

					case 2:
						aval = 8;
						aoval = 8;
						break;

					case 3:
						aval = 10;
						aoval = 10;
						break;
				}

			//odd cards
			} else {
				var wj = j;

				if (j > 8) {
					poleswitch = true;
					//offset for second set of mirrored card values
					wj = wj - 5;
				}

				switch (wj) {
				case 4:
					aval = 6;
					aoval = 4;
					break;

				case 5:
					aval = 8;
					aoval = 4;
					break;

				case 6:
					aval = 8;
					aoval = 6;
					break;

				case 7:
					aval = 10;
					aoval = 6;
					break;

				case 8:
					aval = 10;
					aoval = 8;
					break;
				}

				if (poleswitch) {
					var s = aval;
					aval = aoval;
					aoval = s;
				}
			}

			var a = new Attack('attack', atype, aval, aotype, aoval);
			attacks.push(a);
		}
	}
	shuffleArray(attacks);
	shuffleFlipAttacks();
}

//moves card to slot - includes changing html card attribute to reflect slot position, and slot data to reflect the card it now holds
function moveToSlot(card, slot, data, i) {
	repositionToSlot(card, slot);

	card.setAttribute('type', slot.type);
	card.setAttribute('slot', i);

	slot.card = card;
	slot.data = data;
	data.slot = slot;
}

//returns array of live monster cards
function liveMonsters() {
	var c = monsters.length;
	var live = [];

	for (var i = 0; i < monsters.length; i++) {
		if (monsters[i].live) live.push(monsters[i]);
	}

	return live;
}

//returns array of unused attack cards
function liveAttacks() {
	var c = attacks.length;
	var live = [];

	for (var i = 0; i < attacks.length; i++) {
		if (attacks[i].live) live.push(attacks[i]);
	}

	return live;
}

//damages and kills monster at given slot
function damageMonster(monster, slot) {
	if (monster) {
		var cards = [];
		cards.push(aSlots[slot].data);
		if (aSlots[slot + 4].card) cards.push(aSlots[slot + 4].data);

		var damages = [];

		for (var i = 0; i < cards.length; i++) {
			if (cards[i]) {
				if (!cards[i].flipped) {
					damages[i] = cards[i].pole;
					if (cards[i].poleType === monster.element) damages[i] *= 2;
				} else {
					damages[i] = cards[i].opole;
					if (cards[i].opoleType === monster.element) damages[i] *= 2;
				}
			}
		}

		var damage = 0;
		for (var i = 0; i < damages.length; i++) {
			damage += damages[i];
		}

		monster.health = monster.health - damage;

		if (monster.health <= 0) {
			monster.health = 0;
			monster.live = false;

			monster.slot.card.parentNode.removeChild(monster.slot.card);
			monster.slot.card = null;
			monster.slot.data = null;

			monster.slot = null;
			monster.type = null;
		} else {
			monster.slot.card.childNodes[0].innerHTML = monster.health;
		}
	}
}

//calculate damage toward self
function damageSelf() {
	var damage = 0;
	var attackCardsOnField = [];

	for (var i = 0; i < aSlots.length / 2; i++) {
		if (aSlots[i].card) attackCardsOnField.push(i);

		var j = i + 4;
		if (aSlots[j].card) attackCardsOnField.push(j);
	}

	//find and mark pairs
	for (var i = 0; i < attackCardsOnField.length - 1; i++) {
		var s;

		if (aSlots[attackCardsOnField[i]].data.flipped) s = aSlots[attackCardsOnField[i]].data.poleType;
		else s = aSlots[attackCardsOnField[i]].data.opoleType;

		var c = aSlots[attackCardsOnField[i + 1]].data;
		var found = false;
		
		switch (s) {
			case 'burn':
				if (c.flipped) {
					if (c.poleType === 'poison') found = true;
				} else {
					if (c.opoleType === 'poison') found = true;
				}
				break;

			case 'cut':
				if (c.flipped) {
					if (c.poleType === 'burn') found = true;
				} else {
					if (c.opoleType === 'burn') found = true;
				}
				break;

			case 'poison':
				if (c.flipped) {
					if (c.poleType === 'cut') found = true;
				} else {
					if (c.opoleType === 'cut') found = true;
				}
				break;
		}

		if (found) {
			aSlots[attackCardsOnField[i]].data.inPair = true;
			aSlots[attackCardsOnField[i + 1]].data.inPair = true;
			i++;
		}
	}

	//damage calculation
	for (var i = 0; i < aSlots.length; i++) {
		if (aSlots[i].card) {
			if (!aSlots[i].data.flipped) {
				if (aSlots[i].data.inPair) {
					damage += (aSlots[i].data.opole) / 2;
				}
				else damage += aSlots[i].data.opole;
			} else {
				if (aSlots[i].data.inPair) {
					damage += (aSlots[i].data.pole) / 2;
				}
				else damage += aSlots[i].data.pole;
			}
		}
	}

	//add remaning monster damage
	for (var i = 0; i < mSlots.length; i++) {
		if (mSlots[i].data) {
			if (mSlots[i].data.element !== 'heal') damage += mSlots[i].data.health;
		}
	}
	
	health -= damage;

	cleanAttacks();
}

//get rid of used attack cards
function cleanAttacks() {
	for (var i = 0; i < aSlots.length; i++) {
		if (aSlots[i].data) {
			aSlots[i].data.live = false;
			aSlots[i].data.inPair = false;

			aSlots[i].data.slot = null;
			aSlots[i].data.type = null;

			aSlots[i].card.parentNode.removeChild(aSlots[i].card);
			aSlots[i].card = null;
			aSlots[i].data = null;
		}
	}
}

//refills hand with attack cards
function refillHand() {
	shuffleArray(attacks);
	
	if (liveAttacks().length < 5) {
		for (var i = 0; i < attacks.length; i++) {
			if (!attacks[i].live) attacks[i].live = true;
		}
		shuffleArray(attacks);
	}

	for (var i = 0; i < hSlots.length; i++) {
		if (!hSlots[i].card) {
			hSlots[i].card = createCard(liveAttacks()[i], hSlots[i], i);
			hSlots[i].data = liveAttacks()[i];
			liveAttacks()[i].slot = hSlots[i];
			changeSize(hSlots[i].card, 20, smallWidth, smallHeight);
		}
	}
}

//consume health card
function consumeHealth(slot) {
	health += slot.data.health;
	if (health > 50) health = 50;

	slot.data.health = 0;
	slot.data.live = false;

	slot.card.parentNode.removeChild(slot.card);
	slot.card = null;
	slot.data.slot = null;
	slot.data = null;

	var empty = true;
	for (var i = 0; i < mSlots.length; i++) {
		if (mSlots[i].data) empty = false;
	}
	if (empty) {
		room++;
		loadRoom();
	}
}

//randomly flip attack cards
function shuffleFlipAttacks() {
	for (var i = 0; i < attacks.length; i++) {
		if (Math.random() > 0.5) attacks[i].flipped = !attacks[i].flipped;
	}	
}

//shuffles array
function shuffleArray(array) {
	for (var i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}