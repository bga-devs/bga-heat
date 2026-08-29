const BgaZoom = await globalThis.importEsmLib('bga-zoom', '1.x');
const BgaAutofit = await globalThis.importEsmLib('bga-autofit', '1.x');
const BgaJumpTo = await globalThis.importEsmLib('bga-jump-to', '1.x');
const [BgaHelp, BgaAnimations, BgaCards] = await globalThis.importDojoLibs([
    g_gamethemeurl + "modules/js/bga-help.js",
    g_gamethemeurl + "modules/js/bga-animations.js",
    g_gamethemeurl + "modules/js/bga-cards.js",
]);

function formatTextIcons(rawText) {
    if (!rawText) {
        return '';
    }
    return rawText
        .replace(/\[Heat\]/ig, '<div class="heat icon"></div>')
        .replace(/\[Cooldown\]/ig, '<div class="cooldown icon"></div>')
        .replace(/\[Speed\]/ig, '<div class="speed icon"></div>')
        .replace(/\[Boost\]/ig, '<div class="boost icon"></div>')
        .replace(/\[\+\]/ig, '<div class="boost icon"></div>');
}

const CARD_WIDTH = 225;
const CARD_HEIGHT = 363;
//console.log(Object.values(CARDS_DATA).map(card => card.startingSpace));
class CardsManager extends BgaCards.CardManager {
    constructor(game) {
        super(game, {
            getId: (card) => `personal-card-${card.id}`,
            setupDiv: (card, div) => {
                div.classList.add('personal-card');
                div.dataset.cardId = '' + card.id;
            },
            setupFrontDiv: (card, div) => this.setupFrontDiv(card, div),
            isCardVisible: (card) => Boolean(card.type),
            cardWidth: CARD_WIDTH,
            cardHeight: CARD_HEIGHT,
            animationManager: game.animationManager,
        });
        this.game = game;
    }
    setupFrontDiv(card, div, ignoreTooltip = false) {
        const type = card.type;
        div.dataset.type = '' + type; // for debug purpose only
        div.classList.toggle('upgrade-card', type < 80);
        div.classList.toggle('sponsor-card', type >= 80 && type < 100);
        if (type >= 100) {
            switch (type) {
                case 110:
                    div.classList.add('stress');
                    break;
                case 111:
                    div.classList.add('heat');
                    break;
                default:
                    div.dataset.col = `${type % 100}`;
                    break;
            }
        }
        else {
            if (type < 80) {
                // upgrade
                const imagePosition = type - 1;
                const image_items_per_row = 10;
                var row = Math.floor(imagePosition / image_items_per_row);
                const xBackgroundPercent = (imagePosition - row * image_items_per_row) * 100;
                const yBackgroundPercent = row * 100;
                div.style.backgroundPosition = `-${xBackgroundPercent}% -${yBackgroundPercent}%`;
            }
            else {
                // sponsor
                const imagePosition = type - 80;
                const xBackgroundPercent = imagePosition * 100;
                div.style.backgroundPositionX = `-${xBackgroundPercent}%`;
            }
            div.innerHTML = `<div class="text">${_(card.text) ?? ''}</div>`;
        }
        if (!ignoreTooltip) {
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
        if (card.symbols && !div.querySelector('.card-symbols')) {
            div.insertAdjacentHTML('beforeend', `<div class='card-symbols'></div>`);
            let div2 = div.querySelector('.card-symbols');
            if (card.speed > 0 || card.symbols.boost === undefined) {
                div2.insertAdjacentHTML('beforeend', `<div class='card-symbol symbol-speed' id ='${card.id}-speed'></div>`);
            }
            Object.entries(card.symbols).forEach(([symbol, n]) => {
                div2.insertAdjacentHTML('beforeend', `<div class='card-symbol symbol-${symbol}' id ='${card.id}-${symbol}'></div>`);
            });
        }
    }
    getGarageModuleTextTooltip(card) {
        switch (card.type) {
            // 4 wheel drive
            case 1:
            case 2:
            case 3:
            case 47:
                return `<strong>${_(card.text)}</strong><br>
                ${_('This early system was designed to transfer all the force from the engine into the tarmac through all four wheels but it resulted in poor handling. These cards have the potential of high Speed or Cooldown but also reduce control because they add [+] symbols.')}`;
            // Body
            case 4:
            case 5:
            case 6:
            case 18:
            case 19:
            case 20:
                return `<strong>${_(card.text)}</strong><br>
                ${_('A safer car with better balance that does not understeer. These cards allow you to discard Stress cards.')}`;
            // Brakes
            case 7:
            case 8:
            case 9:
            case 10:
                return `<strong>${_(card.text)}</strong><br>
                ${_('Brakes are all about how late you can make a decision to overtake or step on the brake, and still stay on the track. These cards have variable speed where you make a decision as you reveal the cards.')}`;
            // Cooling systems
            case 11:
            case 12:
            case 13:
            case 21:
                return `<strong>${_(card.text)}</strong><br>
                ${_('Provides a more stable and clean drive ; a better fuel economy and less stress to the car. These are cooldown cards.')}`;
            // R.P.M.
            case 14:
            case 15:
            case 16:
            case 17:
            case 29:
            case 30:
            case 31:
                return `<strong>${_(card.text)}</strong><br>
                ${_('A powerful engine allows your car to respond faster. When played at key moments, those cards make it easier for you to accelerate past opponents. They are cards that help you slipstream and overtake all over the track, but are most effective in and around corners.')}`;
            // Fuel
            case 22:
            case 23:
                return `<strong>${_(card.text)}</strong><br>
                ${_('Racing fuel is highly regulated. These are the super fuel “illegal“ cards.')}`;
            // Gas pedal
            case 24:
            case 25:
            case 26:
            case 27:
            case 28:
                return `<strong>${_(card.text)}</strong><br>
                ${_('The car reacts more quickly to pressure on the accelerator. These cards increase your overall speed.')}`;
            // Suspension
            case 32:
            case 33:
            case 34:
            case 35:
                return `<strong>${_(card.text)}</strong><br>
                ${_('Giving you a smoother drive, these cards can be played round after round.')}`;
            // tires
            case 36:
            case 37:
            case 38:
            case 39:
            case 40:
            case 41:
                return `<strong>${_(card.text)}</strong><br>
            ${_('It is about grip through width and durability. These cards allow you to go faster on corners or sacrifice the grip for a lot of cooldown.')}`;
            // turbocharger
            case 42:
            case 43:
                return `<strong>${_(card.text)}</strong><br>
                ${_('A bigger engine giving you more horsepower and a higher top speed but also increasing weight and wear. These are the highest valued cards and require you to pay Heat.')}`;
            // wings
            case 44:
            case 45:
            case 46:
                return `<strong>${_(card.text)}</strong><br>
                ${_('Creates downforce in corners but it lowers the top speed. These cards help you drive faster in corners but they are also unreliable, thus requiring Heat.')}`;
            case 101:
            case 102:
            case 103:
            case 104:
                return `<strong>${_('Speed card')}</strong><br>
                ${_('Speed:')} <strong>${Number(card.type) - 100}</strong>
                `;
            case 100:
            case 105:
                return `<strong>${_('Starting upgrade')}</strong><br>
                ${_('Speed:')} ${Number(card.type) - 100}
                `;
            default:
                return `<strong>${_(card.text)}</strong>`;
        }
    }
    getTooltip(card) {
        switch (card.effect) {
            case 'heat':
                return `<strong>${_('Heat card')}</strong>`;
            case 'stress':
                return `<strong>${_('Stress card')}</strong>`;
            case 'basic_upgrade':
            case 'advanced_upgrade':
                let tooltip = this.getGarageModuleTextTooltip(card);
                const icons = Object.entries(card.symbols)
                    .map(([symbol, number]) => this.game.getGarageModuleIconTooltipWithIcon(symbol, number))
                    .join('<br>');
                if (icons != '') {
                    tooltip += `<br><br>${icons}`;
                }
                return formatTextIcons(tooltip);
            case 'sponsor':
                const symbols = structuredClone(card.symbols);
                symbols['one-time'] = 1;
                return `<strong>${_(card.text)}</strong>
                <br><br>
                ${Object.entries(symbols)
                    .map(([symbol, number]) => this.game.getGarageModuleIconTooltipWithIcon(symbol, number))
                    .join('<br>')}
                `;
            default:
                switch (card.type) {
                    case 101:
                    case 102:
                    case 103:
                    case 104:
                        return `<strong>${_('Speed card')}</strong><br>
                        ${_('Speed:')} <strong>${Number(card.type) - 100}</strong>
                        `;
                    case 100:
                    case 105:
                        return `<strong>${_('Starting upgrade')}</strong><br>
                        ${_('Speed:')} ${Number(card.type) - 100}
                        `;
                }
        }
    }
    getHtml(card) {
        const type = Number(card.type);
        let className = '';
        let style = '';
        let col = null;
        if (type >= 100) {
            switch (type) {
                case 110:
                    className = 'stress';
                    break;
                case 111:
                    className = 'heat';
                    break;
                default:
                    col = `${type % 100}`;
                    break;
            }
        }
        else {
            if (type < 80) {
                // upgrade
                className = 'upgrade-card';
                const imagePosition = type - 1;
                const image_items_per_row = 10;
                var row = Math.floor(imagePosition / image_items_per_row);
                const xBackgroundPercent = (imagePosition - row * image_items_per_row) * 100;
                const yBackgroundPercent = row * 100;
                style = `background-position: -${xBackgroundPercent}% -${yBackgroundPercent}%;`;
            }
            else {
                // sponsor
                className = 'sponsor-card';
                const imagePosition = type - 80;
                const xBackgroundPercent = imagePosition * 100;
                style = `background-position-x: -${xBackgroundPercent}%`;
            }
        }
        let html = `<div class="card personal-card" data-side="front">
            <div class="card-sides">
                <div class="card-side front ${className}" ${col !== null ? `data-col="${col}"` : ''} style="${style}">${type < 100 ? `<div class="text">${_(card.text) ?? ''}</div>` : ''}
                </div>
            </div>
        </div>`;
        return html;
    }
}

const CONSTRUCTORS_COLORS = ['12151a', '376bbe', '26a54e', 'e52927', '979797', 'face0d', 'f37321', '811b8f', 'ffffff'];

class ChampionshipTable {
    constructor(game, gamedatas) {
        this.game = game;
        this.gamedatas = gamedatas;
        let html = `
        <div id="championship-table">
            <div id="championship-circuits-progress" style="--race-count: ${gamedatas.championship.circuits.length};"><div></div>`;
        gamedatas.championship.circuits.forEach((_, index) => html += `
                <div id="circuit-progress-${index}" class="circuit-progress ${gamedatas.championship.index > index ? 'finished' : ''}">
                    <div id="current-circuit-progress-${index}" class="current-circuit-progress"></div>
                </div>`);
        html += `
            </div>
            <div id="championship-circuits" data-folded="true" style="--race-count: ${gamedatas.championship.circuits.length};">
            <div class="championship-name">
                ${_(gamedatas.championship.name)}
                <button type="button" id="scorepad-button" class="bgabutton bgabutton_blue"><div class="scorepad-icon"></div></button>
            </div>`;
        gamedatas.championship.circuits.forEach((circuit, index) => html += `
            <div class="championship-circuit ${gamedatas.championship.index == index ? 'current' : ''}" data-index="${index}">
                <span class="circuit-name">${_(circuit.name)}</span>
                ${this.game.eventCardsManager.getHtml(circuit.event)}
            </div>
            `);
        html += `
            </div>
            <div id="current-championship-card-text"></div>
        </div>
        `;
        document.getElementById('top').insertAdjacentHTML('afterbegin', html);
        /*document.querySelectorAll('.title-and-rule').forEach(titleAndRule => {
            const title = titleAndRule.querySelector('.title');
            if (title.clientHeight > 0) {
                (titleAndRule.querySelector('.rule') as HTMLDivElement).style.height = `${134 - title.clientHeight}px`;
            }
        });*/
        const championshipCircuits = document.getElementById('championship-circuits');
        championshipCircuits.addEventListener('click', () => {
            championshipCircuits.dataset.folded = (championshipCircuits.dataset.folded == 'false').toString();
        });
        this.setRaceProgress(gamedatas.progress);
        gamedatas.championship.circuits.forEach(circuit => this.game.setTooltip(`event-card-${circuit.event}`, this.game.eventCardsManager.getTooltip(circuit.event)));
        document.getElementById('scorepad-button').addEventListener('click', e => this.showScorepad(e));
        this.setCurrentChampionshipCardText(gamedatas.championship.index);
    }
    newChampionshipRace(index) {
        this.setRaceFinished(index - 1);
        document.querySelectorAll('.championship-circuit').forEach((elem) => elem.classList.toggle('current', Number(elem.dataset.index) == index));
        this.gamedatas.championship.index = index;
        this.setCurrentChampionshipCardText(index);
    }
    setCurrentChampionshipCardText(index) {
        const event = this.gamedatas.championship.circuits[index].event;
        document.getElementById('current-championship-card-text').innerText = this.game.eventCardsManager.getTexts(event).rule;
    }
    setRaceProgress(progress) {
        document.getElementById(`current-circuit-progress-${this.gamedatas.championship.index}`).style.width = `${Math.min(100, progress * 100)}%`;
    }
    setRaceFinished(index) {
        document.getElementById(`circuit-progress-${index}`).classList.add('finished');
    }
    getScorepadHtml(constructors, scores) {
        let html = `
            <div class="scorepad-image">
                <table>
                <tr class="names">
                    <th></th>`;
        constructors.forEach(constructor => {
            html += `<td>`;
            if (constructor) {
                html += `<div class="name"><div class="constructor-avatar ${constructor.ai ? 'legend' : 'player'}" style="`;
                if (constructor.ai) {
                    html += `--constructor-id: ${constructor.id};`;
                }
                else {
                    // ? Custom image : Bga Image
                    //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                    html += `background-image: url('${document.getElementById(`avatar_${constructor.pId}`).src}');`;
                }
                html += `"></div><br><strong style="color: #${CONSTRUCTORS_COLORS[constructor.id]};">${_(constructor.name)}</strong></div>`;
            }
            html += `</td>`;
        });
        for (let i = constructors.length; i < 6; i++) {
            html += `<td></td>`;
        }
        html += `</tr>`;
        this.gamedatas.championship.circuits.forEach((circuit, index) => {
            html += `
            <tr>
                <th>${_(circuit.name)}</th>`;
            constructors.forEach(constructor => {
                html += `<td class="score">`;
                if (scores[index]?.[constructor.id] !== undefined) {
                    html += `${scores[index][constructor.id]}`;
                    if (index > 0) {
                        html += `<div class="subTotal">${Array.from(Array(index + 1)).map((_, subIndex) => scores[subIndex][constructor.id]).reduce((a, b) => a + b, 0)}</div>`;
                    }
                }
                html += `</td>`;
            });
            for (let i = constructors.length; i < 6; i++) {
                html += `<td></td>`;
            }
            html += `</tr>`;
        });
        html += `</table></div>
        `;
        return html;
    }
    chunk(arr, chunkSize = 6) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += chunkSize) {
            chunks.push(arr.slice(i, i + chunkSize));
        }
        return chunks;
    }
    showScorepad(e) {
        e.stopImmediatePropagation();
        const scorepadDialog = new ebg.popindialog();
        scorepadDialog.create('scorepadDialog');
        scorepadDialog.setTitle(_(this.gamedatas.championship.name));
        const padConstructors = this.chunk(Object.values(this.gamedatas.constructors));
        let html = `<div id="scorepad-popin">${padConstructors.map(pad => this.getScorepadHtml(pad, this.gamedatas.scores)).join('')}</div>`;
        // Show the dialog
        scorepadDialog.setContent(html);
        scorepadDialog.show();
    }
}

class EventCardsManager {
    constructor(game) {
        this.game = game;
    }
    getTexts(card) {
        switch (card) {
            case 1:
                return {
                    title: _('New grandstand inauguration'),
                    rule: _('First three drivers to cross the Finish Line on the 1st lap immediately gain a Sponsorship card.'),
                    year: '1961',
                    race: 1,
                    country: _('GREAT BRITAIN'),
                };
            case 2:
                return {
                    title: _('New speed record!'),
                    rule: _('Each time you reach a Speed of 15 or more, immediately gain a Sponsorship card.'),
                    year: '1961',
                    race: 2,
                    country: _('USA'),
                };
            case 3:
                return {
                    title: _('Drivers’ strike'),
                    rule: _('This race is one lap shorter than usual. The winner of this race is awarded 2 extra Championship points.'),
                    year: '1961',
                    race: 3,
                    country: _('ITALY'),
                };
            case 4:
                return {
                    title: _('Engine restrictions lifted'),
                    rule: _('All drivers start the race with an extra Heat card from the reserve in their Engine spot.'),
                    year: '1962',
                    race: 1,
                    country: _('ITALY'),
                };
            case 5:
                return {
                    title: _('Record crowds'),
                    rule: _('This race is one lap longer than usual and hand size is increased to 8 cards.'),
                    year: '1962',
                    race: 2,
                    country: _('GREAT BRITAIN'),
                };
            case 6:
                return {
                    title: _('Corruption in rules committee'),
                    rule: _('The top 3 finishers of this race are awarded an extra Championship point.'),
                    year: '1962',
                    race: 3,
                    country: _('FRANCE'),
                };
            case 7:
                return {
                    title: _('New title sponsor'),
                    rule: _('No Special Rules.'),
                    year: '1963',
                    race: 1,
                    country: _('USA'),
                };
            case 8:
                return {
                    title: _('First live televised race'),
                    rule: _('If you pass 3 cars in a single round, immediately gain a Sponsorship card.'),
                    year: '1963',
                    race: 2,
                    country: _('GREAT BRITAIN'),
                };
            case 9:
                return {
                    title: _('New safety regulations'),
                    rule: _('All drivers start the race with 2 less Heat cards and 1 less Stress card than usual. Hand size is reduced to 6 cards.'),
                    year: '1963',
                    race: 3,
                    country: _('FRANCE'),
                };
            case 10:
                return {
                    title: _('Title sponsor withdraws future unknown'),
                    rule: _('All drivers start the race with an extra Stress card from the reserve in their Deck. If you spin out, you are eliminated from the race and score 0 Championship points.'),
                    year: '1963',
                    race: 4,
                    country: _('ITALY'),
                };
            case 11:
                return {
                    title: _('Going global'),
                    rule: _('In Press Corners, you gain 2 Sponsorship cards instead of one.'),
                    year: '1964',
                    race: 1,
                    country: _('JAPAN'),
                };
            case 12:
                return {
                    title: _('Turbulent winds'),
                    rule: _('You may only Slipstream if you are in 3rd or 4th gear.'),
                    year: '1964',
                    race: 2,
                    country: _('FRANCE'),
                };
            case 13:
                return {
                    title: _('Chicanes for increased safety'),
                    rule: _('For this race, you may discard Heat cards during step 8.'),
                    year: '1964',
                    race: 3,
                    country: _('MEXICO'),
                };
            case 14:
                return {
                    title: _('Sudden heavy rain delays race'),
                    rule: _('Nobody benefits from Adrenaline this race.'),
                    year: '1964',
                    race: 4,
                    country: _('JAPAN'),
                };
            case 15:
                return {
                    title: _('Hold on tight'),
                    rule: _('A maximum of 1 card may be discarded per turn.'),
                    year: '1965',
                    race: 1,
                    country: _('GREAT BRITAIN'),
                };
            case 16:
                return {
                    title: _('Smile and wave'),
                    rule: _('In Press Corners, you may only gain a Sponsorship card if driving slower than the speed limit.'),
                    year: '1965',
                    race: 2,
                    country: _('USA'),
                };
            case 17:
                return {
                    title: _('Tunnel vision'),
                    rule: _('For this race, you may discard Stress cards during Step 8.'),
                    year: '1965',
                    race: 3,
                    country: _('ESPAÑA'),
                };
            case 18:
                return {
                    title: _('The pressure cooker'),
                    rule: _('This race is one lap longer than usual. Each time you complete a lap, remove a Heat card from the game. (Step 8, remove from: Engine > Hand > Discard > Deck.'),
                    year: '1965',
                    race: 4,
                    country: _('NEDERLAND'),
                };
            case 19:
                return {
                    title: _('Tight Maneuvers'),
                    rule: _('Your total Slipstream Value is reduced by 1.'),
                    year: '1966',
                    race: 1,
                    country: _('FRANCE'),
                };
            case 20:
                return {
                    title: _('Smooth Start'),
                    rule: _('Before the race, place all of your Stress cards into your discard pile.'),
                    year: '1966',
                    race: 2,
                    country: _('GERMANY'),
                };
            case 21:
                return {
                    title: _('The Crowd Goes Wild'),
                    rule: _('The first 2 drivers to cross the B Corner Line every lap immediately gain a Sponsorship card. Legends count even though they get no benefit from it.'),
                    year: '1966',
                    race: 3,
                    country: _('ITALY'),
                };
            case 22:
                return {
                    title: _('Consulting The Mechanics'),
                    rule: _('Before the race, in starting grid order, all drivers choose either +1 Heat card & +1 Stress card, OR -1 Heat card & -1 Stress card.'),
                    year: '1966',
                    race: 4,
                    country: _('SOUTH AFRICA'),
                };
        }
    }
    getHtml(card) {
        const texts = this.getTexts(card);
        let html = `<div id="event-card-${card}" class="card event-card" data-side="front">
            <div class="card-sides">
                <div class="card-side front" data-index="${card}">
                    <div class="title-and-rule">
                        <div class="title">${texts.title}</div>
                        <div class="rule bga-autofit">${texts.rule}</div>
                    </div>
                    <div class="bottom-line">
                        <span class="year">${texts.year}</span>
                        •
                        <span class="race">${_('RACE ${number}').replace('${number}', '' + texts.race)}</span>
                        •
                        <span class="country">${texts.country}</span>
                    </div>
                </div>
            </div>
        </div>`;
        return html;
    }
    getTooltip(card) {
        const texts = this.getTexts(card);
        let html = `
            <div><strong>${texts.title}</strong></div><br>

            <div>${texts.rule}</div><br>
            
            <div class="bottom-line">
                <span class="year">${texts.year}</span>
                •
                <span class="race">${_('RACE ${number}').replace('${number}', '' + texts.race)}</span>
                •
                <span class="country">${texts.country}</span>
            </div>
        `;
        return html;
    }
}

class LegendCardsManager extends BgaCards.CardManager {
    constructor(game) {
        super(game, {
            getId: (card) => `legend-card-${JSON.stringify(card).replace(/"/g, '')}`,
            setupDiv: (card, div) => {
                div.classList.add('legend-card');
            },
            setupFrontDiv: (card, div) => this.setupFrontDiv(card, div),
            isCardVisible: card => Object.values(card).length > 0,
            cardWidth: 363,
            cardHeight: 225,
            animationManager: game.animationManager,
        });
        this.game = game;
    }
    setupFrontDiv(card, div) {
        if (!Array.isArray(card) || !Object.values(card).length) {
            return;
        }
        let html = `<div class="table">`;
        [0, 1, 2, 3].forEach((cornerBonus, index) => {
            html += `<div>${Object.entries(card[index]).map(([color, number]) => `<div class="legend-icon" style="--color: ${color}">${number}</div>`).join('')}</div>`;
        });
        html += `</div>`;
        div.innerHTML = html;
    }
}

class LegendTable {
    constructor(game, legendCard) {
        this.game = game;
        let html = `
        <div id="legend-table">
            <div id="legend-board" class="player-board">
                <div id="legend-deck" class="deck"></div>
                <div id="legend-discard" class="discard"></div>
            </div>
        </div>
        `;
        document.getElementById('tables').insertAdjacentHTML('beforeend', html);
        this.deck = new BgaCards.Deck(this.game.legendCardsManager, document.getElementById(`legend-deck`), {
            cardNumber: 10,
            autoUpdateCardNumber: false,
            topCard: [],
            fakeCardGenerator: () => [],
        });
        this.discard = new BgaCards.Deck(this.game.legendCardsManager, document.getElementById(`legend-discard`), {
            cardNumber: legendCard ? 1 : 0,
            topCard: legendCard,
        });
    }
    async newLegendCard(card) {
        await this.deck.addCard(card, undefined, { visible: false, autoRemovePreviousCards: false, });
        await this.discard.addCard(card);
        return true;
    }
}

const isDebug$1 = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log$1 = isDebug$1 ? console.log.bind(window.console) : function () { };
const PERSONAL_CARDS_SORTING = (a, b) => Number(a.type) - Number(b.type);
function manualPositionFitUpdateDisplay(element, cards, lastCard, stock) {
    const MARGIN = 8;
    element.style.setProperty('--width', `${CARD_WIDTH * cards.length + MARGIN * (cards.length - 1)}px`);
    const halfClientWidth = element.clientWidth / 2;
    let cardDistance = CARD_WIDTH + MARGIN;
    const containerWidth = element.clientWidth;
    const uncompressedWidth = (cards.length * CARD_WIDTH) + ((cards.length - 1) * MARGIN);
    if (uncompressedWidth > containerWidth) {
        cardDistance = cardDistance * containerWidth / uncompressedWidth;
    }
    cards.forEach((card, index) => {
        const cardDiv = stock.getCardElement(card);
        const cardLeft = halfClientWidth + cardDistance * (index - (cards.length - 1) / 2);
        cardDiv.style.left = `${cardLeft - CARD_WIDTH / 2}px`;
    });
}
// new ManualPositionStock(cardsManager, document.getElementById('manual-position-fit-stock'), undefined, manualPositionFitUpdateDisplay);
class InPlayStock extends BgaCards.ManualPositionStock {
    constructor(game, constructor) {
        super(game.cardsManager, document.getElementById(`player-table-${constructor.pId}-inplay`), {
            sort: PERSONAL_CARDS_SORTING,
        }, manualPositionFitUpdateDisplay);
        this.playerId = constructor.pId;
        this.addCards(Object.values(constructor.inplay));
        this.toggleInPlay(); // in case inplay is empty, addCard is not called
        this.onSelectionChange = (selection) => game.onInPlayCardSelectionChange(selection);
    }
    toggleInPlay() {
        document.getElementById(`player-table-${this.playerId}-inplay-wrapper`).dataset.visible = (!this.isEmpty()).toString();
    }
    addCard(card, animation, settings) {
        const promise = super.addCard(card, animation, settings);
        this.toggleInPlay();
        return promise;
    }
    cardRemoved(card, settings) {
        super.cardRemoved(card);
        this.toggleInPlay();
    }
}
class PlayerTable {
    constructor(game, player, constructor) {
        this.game = game;
        this.playerId = Number(player.id);
        this.constructorId = constructor.id;
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        this.currentGear = constructor.gear;
        let html = `
        <div id="player-table-${this.playerId}" class="player-table" style="--player-color: #${player.color};${player.color === 'ffffff' ? '--player-color-text-shadow: #000000;' : ''} --personal-card-background-y: ${constructor.id * 100 / 8}%;">
            <div id="player-table-${this.playerId}-name" class="name-wrapper">${player.name}</div>
        `;
        if (this.currentPlayer) {
            html += `
            <div class="block-with-text hand-wrapper">
                <div class="block-label">${_('Your hand')}</div>
                <div id="player-table-${this.playerId}-hand" class="hand cards"></div>
            </div>`;
        }
        html += `
            <div id="player-table-${this.playerId}-board" class="player-board" data-color="${player.color}">
                <div id="player-table-${this.playerId}-deck" class="deck"></div>
                <div id="player-table-${this.playerId}-engine" class="engine"></div>
                <div id="player-table-${this.playerId}-discard" class="discard"></div>
                <div id="player-table-${this.playerId}-gear" class="gear" data-color="${player.color}" data-gear="${this.currentGear}"></div>
                <div id="player-table-${this.playerId}-inplay-wrapper" class="inplay-wrapper">
                <div class="hand-wrapper">
                    <div class="block-label">${_('Cards in play')}</div>
                        <div id="player-table-${this.playerId}-inplay" class="inplay"></div>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.getElementById('tables').insertAdjacentHTML('beforeend', html);
        if (this.currentPlayer) {
            this.hand = new BgaCards.LineStock(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-hand`), {
                sort: PERSONAL_CARDS_SORTING,
            });
            this.hand.onSelectionChange = (selection) => this.game.onHandCardSelectionChange(selection);
            this.hand.addCards(constructor.hand);
        }
        this.deck = new BgaCards.Deck(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-deck`), {
            cardNumber: constructor.deckCount,
            counter: {
                extraClasses: 'round',
            }
        });
        const engineCards = Object.values(constructor.engine);
        this.engine = new BgaCards.Deck(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-engine`), {
            cardNumber: engineCards.length,
            topCard: engineCards[0], // TODO check if ordered
            counter: {
                extraClasses: 'round',
            },
            fakeCardGenerator: deckId => ({
                id: `${deckId}-top-engine`,
                type: 111,
                location: 'engine',
                effect: 'heat',
                state: ''
            }),
        });
        const discardCards = Object.values(constructor.discard);
        this.discard = new BgaCards.Deck(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-discard`), {
            cardNumber: discardCards.length,
            topCard: discardCards[0], // TODO check if ordered
            counter: {
                extraClasses: 'round',
            }
        });
        this.inplay = new InPlayStock(this.game, constructor);
    }
    setHandSelectable(selectionMode, selectableCardsIds = null, selectedCardsIds = null) {
        const cards = this.hand.getCards();
        this.hand.setSelectionMode(selectionMode, selectableCardsIds ? cards.filter(card => selectableCardsIds.includes(Number(card.id))) : undefined);
        this.hand.unselectAll();
        selectedCardsIds?.forEach(id => this.hand.selectCard(cards.find(card => Number(card.id) == id)));
    }
    getCurrentGear() {
        return this.currentGear;
    }
    setCurrentGear(gear) {
        this.currentGear = gear;
        document.getElementById(`player-table-${this.playerId}-gear`).dataset.gear = `${gear}`;
    }
    setInplay(cards) {
        this.inplay.removeAll();
        return this.inplay.addCards(cards);
    }
    async clearPlayedCards(cardIds, sponsorIds) {
        await this.inplay.removeCards(sponsorIds.map(sponsorId => ({ id: sponsorId })));
        await this.discard.addCards(this.inplay.getCards());
    }
    async cooldown(cards) {
        await this.engine.addCards(cards);
    }
    async payHeats(cards) {
        await this.discard.addCards(cards, { fromStock: this.engine });
    }
    spinOut(stresses) {
        let promise = null;
        if (this.currentPlayer) {
            promise = this.hand.addCards(stresses.map(id => ({
                id,
                type: 110,
                effect: 'stress',
                location: 'hand',
                state: ''
            })));
        }
        this.setCurrentGear(1);
        return promise ?? Promise.resolve(true);
    }
    async drawCardsPublic(n, areSponsors, deckCount) {
        if (areSponsors) {
            return;
        }
        const isReshuffled = this.deck.getCardNumber() < n;
        if (!isReshuffled) {
            const count = this.deck.getCardNumber() - n;
            this.deck.setCardNumber(deckCount ?? count);
            return Promise.resolve(true);
        }
        else {
            const before = this.deck.getCardNumber();
            const after = this.discard.getCardNumber() - (n - before);
            this.deck.setCardNumber(this.discard.getCardNumber());
            this.discard.setCardNumber(0);
            await this.deck.shuffle();
            this.deck.setCardNumber(deckCount ?? after);
            return true;
        }
    }
    async drawCardsPrivate(cards, areSponsors, deckCount) {
        if (areSponsors) {
            return this.hand.addCards(cards);
        }
        await this.addCardsFromDeck(cards, this.hand);
        if (deckCount !== undefined) {
            this.deck.setCardNumber(deckCount);
        }
    }
    async scrapCards(cards, deckCount) {
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            if (card.isReshuffled) {
                await this.moveDiscardToDeckAndShuffle();
            }
            this.deck.addCard({ id: card.id }, undefined, {
                autoUpdateCardNumber: false,
                autoRemovePreviousCards: false,
            });
            await this.discard.addCard(card);
        }
        if (deckCount !== undefined) {
            this.deck.setCardNumber(deckCount);
        }
        return true;
    }
    async resolveBoost(cards, card, deckCount) {
        await this.scrapCards(cards);
        if (card.isReshuffled) {
            await this.moveDiscardToDeckAndShuffle();
        }
        this.deck.addCard({ id: card.id }, undefined, {
            autoUpdateCardNumber: false,
            autoRemovePreviousCards: false,
        });
        await this.inplay.addCard(card);
        if (deckCount !== undefined) {
            this.deck.setCardNumber(deckCount);
        }
        return true;
    }
    async salvageCards(cards, discardCards, deckCount) {
        this.discard.setCardNumber(discardCards.length + cards.length, discardCards[0]);
        cards.forEach(salvagedCard => this.discard.addCard(salvagedCard, undefined, {
            autoUpdateCardNumber: false,
            autoRemovePreviousCards: false,
        }));
        await this.deck.addCards(cards.map(card => ({ id: card.id })), undefined, undefined, true);
        this.deck.setCardNumber(deckCount ?? this.deck.getCardNumber());
        await this.deck.shuffle();
        return true;
    }
    async superCoolCards(cards, discardCards) {
        this.discard.setCardNumber(discardCards.length + cards.length, discardCards[0]);
        cards.forEach(heatCard => this.discard.addCard(heatCard, undefined, {
            autoUpdateCardNumber: false,
            autoRemovePreviousCards: false,
        }));
        await this.engine.addCards(cards);
        return true;
    }
    async moveDiscardToDeckAndShuffle() {
        this.deck.setCardNumber(0);
        const cardNumber = this.discard.getCardNumber();
        await this.deck.addCards(this.discard.getCards());
        this.discard.setCardNumber(0);
        this.deck.setCardNumber(cardNumber);
        await this.deck.shuffle();
    }
    async addCardsFromDeck(cards, to) {
        const shuffleIndex = cards.findIndex(card => card.isReshuffled);
        if (shuffleIndex === -1) {
            await to.addCards(cards, { fromStock: this.deck, }, undefined, 250);
        }
        else {
            const cardsBefore = cards.slice(0, shuffleIndex);
            const cardsAfter = cards.slice(shuffleIndex);
            await to.addCards(cardsBefore, { fromStock: this.deck, }, undefined, 250);
            await this.moveDiscardToDeckAndShuffle();
            this.deck.addCards(cardsAfter.map(card => ({ id: card.id })), undefined, {
                autoUpdateCardNumber: false,
                autoRemovePreviousCards: false,
            });
            await to.addCards(cardsAfter, { fromStock: this.deck, }, undefined, 250);
        }
        return true;
    }
    async refreshHand(hand) {
        this.hand.removeAll();
        return this.hand.addCards(hand);
    }
    async refreshUI(constructor) {
        this.deck.setCardNumber(constructor.deckCount);
        const engineCards = Object.values(constructor.engine);
        this.engine.setCardNumber(engineCards.length, engineCards[0]);
        const discardCards = Object.values(constructor.discard);
        this.discard.setCardNumber(discardCards.length, discardCards[0]);
        this.inplay.removeAll();
        this.inplay.addCards(Object.values(constructor.inplay));
    }
}

const MAP_WIDTH = 1650;
const MAP_HEIGHT = 1100;
const LEADERBOARD_POSITIONS = {
    8: {
        1: { x: 0, y: 0, a: 0 },
        2: { x: -77, y: 52, a: 0 },
        3: { x: 77, y: 52, a: 0 },
        4: { x: 0, y: 128, a: 0 },
        5: { x: 0, y: 180, a: 0 },
        6: { x: 0, y: 232, a: 0 },
        7: { x: 0, y: 284, a: 0 },
        8: { x: 0, y: 336, a: 0 },
    },
    12: {
        1: { x: 0, y: 0, a: 0 },
        2: { x: -77, y: 52, a: 0 },
        3: { x: 77, y: 52, a: 0 },
        4: { x: 0, y: 128, a: 0 },
        5: { x: 0, y: 180, a: 0 },
        6: { x: 0, y: 232, a: 0 },
        7: { x: -77, y: 284, a: 0 },
        8: { x: 0, y: 284, a: 0 },
        9: { x: 77, y: 284, a: 0 },
        10: { x: -77, y: 336, a: 0 },
        11: { x: 0, y: 336, a: 0 },
        12: { x: 77, y: 336, a: 0 },
    },
};
const WEATHER_TOKENS_ON_SECTOR_TENT = [0, 4, 5];
const EVENTS_PRESS_CORNERS = {
    1: [0],
    2: [1],
    3: [2],
    4: [4],
    5: [2, 4],
    6: [2],
    7: [0],
    8: [1, 3],
    9: [3],
    10: [3],
};
const JAPAN_BELOW_TUNNEL_CELLS = [971, 975, 1033, 1037];
function moveCarAnimationDuration(cells, totalSpeed) {
    return totalSpeed <= 0 || cells < +0 ? 0 : Math.round((5500 / (20 + totalSpeed)) * cells);
}
function getSvgPathElement(pathCells) {
    // Control strength is how far the control point are from the center of the cell
    //  => it should probably be something related/proportional to scale of current board
    let controlStrength = 20;
    let path = ``;
    pathCells.forEach((data, i) => {
        // We compute the control point based on angle
        //  => we have a special case for i = 0 since it's the only one with a "positive control point" (ie that goes in the same direction as arrow)
        let cp = {
            x: data.x + Math.cos((data.a * Math.PI) / 180) * (i == 0 ? 1 : -1) * controlStrength,
            y: data.y + Math.sin((data.a * Math.PI) / 180) * (i == 0 ? 1 : -1) * controlStrength,
        };
        // See "Shortand curve to" on https://developer.mozilla.org/fr/docs/Web/SVG/Tutorial/Paths
        if (i == 0) {
            path += `M ${data.x} ${data.y} C ${cp.x} ${cp.y}, `;
        }
        else if (i == 1) {
            path += `${cp.x} ${cp.y}, ${data.x} ${data.y} `;
        }
        else {
            path += `S ${cp.x} ${cp.y}, ${data.x} ${data.y}`;
        }
    });
    const newpath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    newpath.setAttributeNS(null, 'd', path);
    return newpath;
}
// Wrapper for the animation that use requestAnimationFrame
class CarAnimation {
    constructor(car, pathCells, totalSpeed) {
        this.car = car;
        this.pathCells = pathCells;
        this.totalSpeed = totalSpeed;
        this.newpath = getSvgPathElement(pathCells);
    }
    start() {
        this.duration = moveCarAnimationDuration(this.pathCells.length, this.totalSpeed);
        this.resolve = null;
        this.move(0);
        setTimeout(() => {
            this.tZero = Date.now();
            requestAnimationFrame(() => this.run());
        }, 0);
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
        });
    }
    // Just a wrapper to get the absolute position based on a floating number u in [0, 1] (0 mean start of animation, 1 is the end)
    getPos(u) {
        return this.newpath.getPointAtLength(u * this.newpath.getTotalLength());
    }
    move(u) {
        const pos = this.getPos(u);
        const posPrev = this.getPos(u - 0.01);
        const posNext = this.getPos(u + 0.01);
        const angle = -Math.atan2(posNext.x - posPrev.x, posNext.y - posPrev.y);
        this.car.style.setProperty('--x', `${pos.x}px`);
        this.car.style.setProperty('--y', `${pos.y}px`);
        this.car.style.setProperty('--r', `${(angle * 180) / Math.PI + 90}deg`);
    }
    run() {
        const u = Math.min((Date.now() - this.tZero) / this.duration, 1);
        this.move(u);
        if (u < 1) {
            // Keep requesting frames, till animation is ready
            requestAnimationFrame(() => this.run());
        }
        else {
            if (this.resolve != null) {
                this.resolve();
            }
        }
    }
}
class Circuit {
    constructor(game, gamedatas) {
        this.game = game;
        this.gamedatas = gamedatas;
        this.circuitDiv = document.getElementById('circuit');
        if (gamedatas.circuitDatas?.jpgUrl) {
            this.loadCircuit(gamedatas.circuitDatas);
            this.createWeather(this.gamedatas.weather);
            Object.values(this.gamedatas.constructors)
                .filter((constructor) => constructor.paths?.length > 0)
                .forEach((constructor) => constructor.paths.filter((path) => path?.length > 1).forEach((path) => this.addMapPath(path, false)));
        }
    }
    loadCircuit(circuitDatas) {
        this.circuitDatas = circuitDatas;
        this.circuitDiv.style.backgroundImage = `url('${this.circuitDatas.jpgUrl.startsWith('http') ? this.circuitDatas.jpgUrl : `${g_gamethemeurl}img/${this.circuitDatas.jpgUrl}`}')`;
        const circuitJumpTo = document.getElementById(`bga-jump-to_circuit`);
        if (circuitJumpTo) {
            circuitJumpTo.style.backgroundImage = this.circuitDiv.style.backgroundImage;
        }
        this.createCorners(this.circuitDatas.corners);
        this.createPressTokens(this.circuitDatas.pressCorners);
        Object.values(this.gamedatas.constructors).forEach((constructor) => this.createCar(constructor));
        // JAPAN TUNNEL
        if (circuitDatas.id == 'Japan') {
            this.circuitDiv.insertAdjacentHTML('beforeend', "<div id='japan-tunnel'></div>");
        }
        else {
            $('japan-tunnel')?.remove();
        }
        // ESPANA TUNNEL
        if (circuitDatas.id == 'Espana') {
            this.circuitDiv.insertAdjacentHTML('beforeend', "<div id='espana-tunnel'></div>");
        }
        else {
            $('espana-tunnel')?.remove();
        }
        circuitDatas.tunnelsSpaces.forEach((cellPos) => this.addTooltipToCell(cellPos, _('As long as your car is on a tunnel Space, you cannot discard any cards from your hand. This rule takes precedence over any effect that would allow you to discard (Event, Upgrade, Road Condition...)')));
        circuitDatas.floodedSpaces.forEach((cellPos) => this.addTooltipToCell(cellPos, _('If you start the Round on a flooded Space, Shifting down a gear in Step 1 costs 1 extra Heat. This means that shifting down a single gear will cost a total of 1 Heat, shifting down two gears will cost 2 Heat."')));
    }
    addTooltipToCell(cellPos, tooltip) {
        const cell = this.getCellPosition(cellPos);
        if (cell) {
            let o = document.createElement('div');
            o.id = `cell-tooltip-${cellPos}`;
            o.classList.add('cell-tooltip');
            o.style.setProperty('--x', `${cell.x}px`);
            o.style.setProperty('--y', `${cell.y}px`);
            o.style.setProperty('--r', `${cell.a ?? 0}deg`);
            this.circuitDiv.insertAdjacentElement('beforeend', o);
            this.game.setTooltip(o.id, tooltip);
        }
    }
    newCircuit(circuitDatas) {
        this.circuitDiv.innerHTML = '';
        this.loadCircuit(circuitDatas);
    }
    createCorners(corners) {
        Object.entries(corners).forEach(([stringId, corner]) => this.createCorner({ ...corner, id: Number(stringId) }));
    }
    createCorner(corner) {
        const cornerDiv = document.createElement('div');
        (cornerDiv.id = `corner-${corner.id}`), cornerDiv.classList.add('corner');
        cornerDiv.style.setProperty('--x', `${corner.x}px`);
        cornerDiv.style.setProperty('--y', `${corner.y}px`);
        cornerDiv.appendChild(document.createTextNode(String(corner.speed)));
        this.circuitDiv.insertAdjacentElement('beforeend', cornerDiv);
    }
    createPressTokens(pressCorners) {
        pressCorners?.forEach((cornerId) => this.createPressToken(cornerId));
    }
    createPressToken(cornerId) {
        const corner = this.circuitDatas.corners[cornerId];
        const corners = Object.values(this.circuitDatas.corners);
        const closeCornerToTheRight = corners.find((otherCorner) => (otherCorner.x != corner.x || otherCorner.y != corner.y) &&
            Math.sqrt(Math.pow(corner.tentX - otherCorner.tentX, 2) + Math.pow(corner.tentY - otherCorner.tentY, 2)) < 100 &&
            otherCorner.x > corner.x);
        const pressIconDiv = document.createElement('div');
        pressIconDiv.id = `press-icon-${cornerId}`;
        pressIconDiv.classList.add(`press-icon`);
        if (closeCornerToTheRight) {
            pressIconDiv.classList.add(`left-side`);
        }
        pressIconDiv.style.setProperty('--x', `${corner.tentX}px`);
        pressIconDiv.style.setProperty('--y', `${corner.tentY}px`);
        pressIconDiv.innerHTML = `<i class="fa fa-camera"></i>`;
        this.circuitDiv.insertAdjacentElement('beforeend', pressIconDiv);
        this.game.setTooltip(pressIconDiv.id, `
        <div class="press-token"></div><br><br>
        
        <strong>${_('Press Corner')}</strong><br><br>
        ${_('The international press is waiting in a specific corner for something spectacular to happen. This gives all players a permanent challenge throughout the race.')}
        <br>
        ${_('To gain a Sponsorship card this way you must either:')}<br>
        <ul class="press-corner-ul">
            <li>${_('Cross the Corner Line thanks to your Slipstream move (Speed is irrelevant in this case).')}</li>
            <li>${_('Exceed the Speed Limit of the Press Corner (potentially modified by a Road Conditions token) by 2 or more.')}</li>
        </ul>
        <br>
        ${_('Note: You cannot gain more than one Sponsorship card each time you go through a Press Corner.')}        
        `);
    }
    createWeather(weather) {
        if (weather?.tokens) {
            this.createWeatherCard(weather.card, this.circuitDatas.weatherCardPos);
            this.createWeatherTokens(weather.tokens, this.circuitDatas.corners, weather.card);
        }
    }
    createWeatherCard(type, wheatherCardPos) {
        const weatherCardDiv = document.createElement('div');
        weatherCardDiv.id = 'weather-card';
        weatherCardDiv.classList.add('weather-card');
        weatherCardDiv.dataset.cardType = `${type}`;
        weatherCardDiv.style.setProperty('--x', `${wheatherCardPos.x}px`);
        weatherCardDiv.style.setProperty('--y', `${wheatherCardPos.y}px`);
        this.circuitDiv.insertAdjacentElement('beforeend', weatherCardDiv);
        this.game.setTooltip(weatherCardDiv.id, `${this.game.getWeatherCardSetupTooltip(type)}<br><br>${this.game.getWeatherCardEffectTooltip(type)}`);
    }
    createWeatherTokens(tokens, corners, cardType) {
        Object.entries(tokens)
            .filter(([cornerId, type]) => type !== null && type !== undefined)
            .forEach(([cornerId, type]) => {
            const corner = corners[cornerId];
            if (corner) {
                this.createWeatherToken(type, cardType, Number(cornerId), corner);
            }
            else {
                console.warn(cornerId, `doesn't exists `, corners);
            }
        });
    }
    createWeatherToken(type, cardType, cornerId, corner) {
        const field = WEATHER_TOKENS_ON_SECTOR_TENT.includes(type) ? 'sectorTent' : 'tent';
        const x = corner[`${field}X`];
        const y = corner[`${field}Y`];
        const weatherTokenDiv = document.createElement('div');
        weatherTokenDiv.id = `weather-token-${type}-${document.querySelectorAll(`.weather-token[id^="weather-token-"]`).length}`;
        weatherTokenDiv.classList.add('weather-token');
        weatherTokenDiv.dataset.tokenType = `${type}`;
        weatherTokenDiv.style.setProperty('--x', `${x}px`);
        weatherTokenDiv.style.setProperty('--y', `${y}px`);
        this.circuitDiv.insertAdjacentElement('beforeend', weatherTokenDiv);
        this.game.setTooltip(weatherTokenDiv.id, this.game.getWeatherTokenTooltip(type, cardType));
        if ([2, 3].includes(type)) {
            const cornerDiv = document.getElementById(`corner-${cornerId}`);
            if (cornerDiv) {
                const clone = document.createElement('div');
                clone.id = `${cornerDiv.id}-old-value`;
                clone.classList.add('corner', 'old-value');
                clone.style.setProperty('--x', `${corner.x - 20}px`);
                clone.style.setProperty('--y', `${corner.y - 20}px`);
                clone.dataset.strike = `${type === 3 ? 'up' : 'down'}`;
                document.getElementById('circuit').appendChild(clone);
                clone.innerHTML = `&nbsp; ${cornerDiv.innerText} &nbsp;`;
                cornerDiv.innerText = `${Number(cornerDiv.innerText) + (type === 3 ? 1 : -1)}`;
                cornerDiv.dataset.adjust = `${type === 3 ? 'up' : 'down'}`;
            }
        }
        if (field === 'sectorTent') {
            corner.sector.forEach((cellId) => this.addSectorIndicator(cellId, weatherTokenDiv, x - 30, y - 30));
        }
    }
    getPodiumPosition(pos) {
        return {
            ...this.circuitDatas.podium[pos - 1],
            a: 0,
        };
    }
    getCellPosition(carCell) {
        if (carCell < 0) {
            return this.getPodiumPosition(-carCell);
        }
        return this.circuitDatas.cells[carCell];
    }
    createCar(constructor) {
        let car = document.getElementById(`car-${constructor.id}`);
        if (!car) {
            car = document.createElement('div');
            (car.id = `car-${constructor.id}`), car.classList.add('car');
            if (constructor.pId === this.game.getPlayerId()) {
                car.classList.add('current');
            }
            car.style.setProperty('--constructor-id', `${constructor.id}`);
            this.circuitDiv.insertAdjacentElement('beforeend', car);
            let html = `<div class="constructor-avatar ${constructor.ai ? 'legend' : 'player'}" style="`;
            if (constructor.ai) {
                html += `--constructor-id: ${constructor.id};`;
            }
            else {
                // ? Custom image : Bga Image
                //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                html += `background-image: url('${document.getElementById(`avatar_${constructor.pId}`).src}');`;
            }
            this.game.setTooltip(car.id, `${html}"></div> <strong style="color: #${CONSTRUCTORS_COLORS[constructor.id]};">${_(constructor.name)}</strong>`);
        }
        const cell = this.getCellPosition(constructor.carCell);
        if (cell) {
            car.style.setProperty('--x', `${cell.x}px`);
            car.style.setProperty('--y', `${cell.y}px`);
            car.style.setProperty('--r', `${cell.a ?? 0}deg`);
            this.updateCarZIndex(car, constructor.carCell);
        }
    }
    isPassingBelowTunnel(cellOrPath) {
        if (this.circuitDatas.id != 'Japan') {
            return false;
        }
        if (Array.isArray(cellOrPath)) {
            return cellOrPath.reduce((acc, t) => acc || this.isPassingBelowTunnel(t), false);
        }
        else {
            return JAPAN_BELOW_TUNNEL_CELLS.includes(cellOrPath);
        }
    }
    updateCarZIndex(car, cellOrPath) {
        // JAPAN TUNNEL
        if (this.isPassingBelowTunnel(cellOrPath)) {
            car.style.zIndex = '1';
        }
        else {
            car.style.zIndex = '';
        }
    }
    async moveCar(constructorId, carCell, path, totalSpeed) {
        this.removeMapIndicators();
        const car = document.getElementById(`car-${constructorId}`);
        if (path?.length > 1 && this.game.animationManager.animationsActive()) {
            this.addMapPath(path, true, totalSpeed);
            try {
                await this.moveCarWithAnimation(car, path, totalSpeed);
                return await this.moveCar(constructorId, carCell);
            }
            catch (e) {
                return this.moveCar(constructorId, carCell);
            }
        }
        else {
            if (path?.length > 1) {
                this.addMapPath(path, false);
            }
            const cell = this.getCellPosition(carCell);
            if (!cell) {
                console.warn('Cell not found (moveCar) : cell ', carCell, 'constructorId', constructorId);
            }
            car.style.setProperty('--x', `${cell.x}px`);
            car.style.setProperty('--y', `${cell.y}px`);
            car.style.setProperty('--r', `${cell.a}deg`);
            this.updateCarZIndex(car, carCell);
            return Promise.resolve(true);
        }
    }
    spinOutWithAnimation(constructorId, carCell, cellsDiff) {
        this.removeMapIndicators();
        return new Promise((resolve) => {
            const car = document.getElementById(`car-${constructorId}`);
            const time = moveCarAnimationDuration(cellsDiff, cellsDiff);
            car.style.setProperty('--transition-time', `${time}ms`);
            car.classList.add('with-transition');
            car.clientWidth;
            const cell = this.getCellPosition(carCell);
            if (!cell) {
                console.warn('Cell not found (spinOutWithAnimation) : cell ', carCell, 'constructorId', constructorId);
            }
            car.style.setProperty('--x', `${cell.x}px`);
            car.style.setProperty('--y', `${cell.y}px`);
            car.style.setProperty('--r', `${cell.a + 1080}deg`);
            setTimeout(() => {
                car.classList.remove('with-transition');
                car.clientWidth;
                car.style.setProperty('--r', `${cell.a}deg`);
                resolve(true);
            }, time + 200);
        });
    }
    finishRace(constructorId, pos) {
        return new Promise((resolve) => {
            const car = document.getElementById(`car-${constructorId}`);
            const time = 1500;
            car.style.setProperty('--transition-time', `${time}ms`);
            car.classList.add('with-transition');
            car.clientWidth;
            const cell = this.getPodiumPosition(pos);
            if (!cell) {
                console.warn('Cell not found (finishRace) : cell ', pos, 'constructorId', constructorId);
            }
            car.style.setProperty('--x', `${cell.x}px`);
            car.style.setProperty('--y', `${cell.y}px`);
            car.style.setProperty('--r', `${cell.a}deg`);
            setTimeout(() => {
                car.classList.remove('with-transition');
                resolve(true);
            }, time + 200);
        });
    }
    addMapIndicator(cellId, clickCallback, speed = 0, stress = false) {
        const mapIndicator = document.createElement('div');
        mapIndicator.id = `map-indicator-${cellId}`;
        mapIndicator.classList.add('map-indicator');
        let cell = this.circuitDatas.cells[cellId];
        mapIndicator.style.setProperty('--x', `${cell.x}px`);
        mapIndicator.style.setProperty('--y', `${cell.y}px`);
        this.circuitDiv.insertAdjacentElement('beforeend', mapIndicator);
        if (clickCallback) {
            mapIndicator.addEventListener('click', clickCallback);
            mapIndicator.classList.add('clickable');
        }
        if (speed) {
            mapIndicator.innerHTML = `${speed}`;
        }
        if (stress) {
            mapIndicator.classList.add('stress');
        }
        return mapIndicator;
    }
    addSectorIndicator(cellId, weatherTokenDiv, weatherX, weatherY) {
        const sectorIndicator = document.createElement('div');
        sectorIndicator.id = `sector-indicator-${cellId}`;
        sectorIndicator.classList.add('sector-indicator');
        let cell = this.circuitDatas.cells[cellId];
        sectorIndicator.style.setProperty('--x', `${cell.x - weatherX}px`);
        sectorIndicator.style.setProperty('--y', `${cell.y - weatherY}px`);
        weatherTokenDiv.insertAdjacentElement('beforeend', sectorIndicator);
        return sectorIndicator;
    }
    addCornerHeatIndicator(cornerId, heat) {
        if (heat > 0) {
            const cornerHeatIndicator = document.createElement('div');
            cornerHeatIndicator.id = `corner-heat-indicator-${cornerId}`;
            cornerHeatIndicator.innerHTML = `${heat}`;
            cornerHeatIndicator.classList.add('corner-heat-indicator', 'icon', 'heat');
            let corner = this.circuitDatas.corners[cornerId];
            cornerHeatIndicator.style.setProperty('--x', `${corner.x}px`);
            cornerHeatIndicator.style.setProperty('--y', `${corner.y}px`);
            this.circuitDiv.insertAdjacentElement('beforeend', cornerHeatIndicator);
            document.getElementById(`corner-${cornerId}`).style.setProperty('--color', 'red');
        }
    }
    removeMapIndicators() {
        this.circuitDiv.querySelectorAll('.map-indicator').forEach((elem) => elem.remove());
    }
    removeCornerHeatIndicators() {
        this.circuitDiv.querySelectorAll('.corner').forEach((elem) => elem.style.removeProperty('--color'));
        this.circuitDiv.querySelectorAll('.corner-heat-indicator').forEach((elem) => elem.remove());
    }
    addMapPath(pathCellIds, animated, totalSpeed) {
        try {
            const pathCells = this.getCellsInfos(pathCellIds);
            const path = getSvgPathElement(pathCells);
            // Compute zIndex => special case of tunnel
            let zIndex = this.isPassingBelowTunnel(pathCellIds) ? '1' : '3';
            //let cell = this.circuitDatas.cells[cellId];
            //mapPath.style.setProperty('--x', `${cell.x}px`);
            //mapPath.style.setProperty('--y', `${cell.y}px`);
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.appendChild(path);
            svg.id = `car-path-${this.circuitDiv.querySelectorAll('.car-path').length}`;
            svg.setAttribute('width', '1650');
            svg.setAttribute('height', '1100');
            svg.style.zIndex = zIndex;
            svg.classList.add('car-path');
            if (animated) {
                const animationDuration = moveCarAnimationDuration(pathCellIds.length, totalSpeed);
                const pathLength = Math.round(path.getTotalLength());
                svg.style.setProperty('--animation-duration', `${animationDuration}ms`);
                svg.style.setProperty('--path-length', `${pathLength}`);
                svg.classList.add('animated');
            }
            this.circuitDiv.insertAdjacentElement('afterbegin', svg);
        }
        catch (e) {
            console.warn('Impossible to load map path');
        }
    }
    removeMapPaths() {
        this.circuitDiv.querySelectorAll('.car-path').forEach((elem) => elem.remove());
    }
    getCellInfos(cellId) {
        // This is just a wrapper to either return the datas about the cell (center x, center y, angle)
        //      or simulate an "averaged cell" if two cells are given (to go through the middle of them)
        if (Array.isArray(cellId)) {
            let cellId1 = cellId[0];
            let cellId2 = cellId[1];
            return {
                x: (this.circuitDatas.cells[cellId1].x + this.circuitDatas.cells[cellId2].x) / 2,
                y: (this.circuitDatas.cells[cellId1].y + this.circuitDatas.cells[cellId2].y) / 2,
                a: (this.circuitDatas.cells[cellId1].a + this.circuitDatas.cells[cellId2].a) / 2,
            };
        }
        else {
            return this.circuitDatas.cells[cellId];
        }
    }
    getCellsInfos(pathCellIds) {
        return pathCellIds.map((cellId) => this.getCellInfos(cellId));
    }
    moveCarWithAnimation(car, pathCellIds, totalSpeed) {
        const pathCells = this.getCellsInfos(pathCellIds);
        this.updateCarZIndex(car, pathCellIds);
        const animation = new CarAnimation(car, pathCells, totalSpeed);
        return animation.start();
    }
    showCorner(id, color) {
        document.getElementById(`corner-${id}`)?.style.setProperty('--color', color ?? 'transparent');
        if (color) {
            setTimeout(() => this.showCorner(id), this.game.animationManager.animationsActive() ? 2000 : 1);
        }
    }
    setEliminatedPodium(position) {
        const cell = this.getPodiumPosition(position);
        this.circuitDiv.insertAdjacentHTML('beforeend', `<div class="eliminated-podium" style="--x: ${cell.x}px; --y: ${cell.y}px;">❌</div>`);
    }
    refreshUI(constructor) {
        this.createCar(constructor);
        this.removeMapPaths();
        constructor.paths.filter((path) => path?.length > 1).forEach((path) => this.addMapPath(path, false));
    }
}

/// <reference path="../../bga-framework.d.ts" />
const ANIMATION_MS = 500;
const MIN_NOTIFICATION_MS = 1200;
const ACTION_TIMER_DURATION = 5;
const LOCAL_STORAGE_ZOOM_KEY = 'Heat-zoom';
const LOCAL_STORAGE_CIRCUIT_ZOOM_KEY = 'Heat-circuit-zoom';
const LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'Heat-jump-to-folded';
const SYMBOLS_WITH_POSSIBLE_HALF_USAGE = ['cooldown', 'reduce', 'scrap'];
const HAND_CARD_TYPE_FOR_EFFECT = {
    reduce: 'stress',
    cooldown: 'heat',
};
const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };
class Game {
    constructor(bga) {
        this.playersTables = [];
        this.cornerCounters = [];
        this.gearCounters = [];
        this.engineCounters = [];
        this.speedCounters = [];
        this.lapCounters = [];
        this.TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;
        this._notif_uid_to_log_id = [];
        this._notif_uid_to_mobile_log_id = [];
        this.bga = bga;
        const oldFunction = this.bga.gameui.onPlaceLogOnChannel;
        if (oldFunction) {
            this.bga.gameui.onPlaceLogOnChannel = (msg) => {
                var currentLogId = this.bga.gameui.notifqueue.next_log_id;
                var currentMobileLogId = this.bga.gameui.next_log_id;
                var res = oldFunction(arguments);
                this._notif_uid_to_log_id[msg.uid] = currentLogId;
                this._notif_uid_to_mobile_log_id[msg.uid] = currentMobileLogId;
                this._last_notif = {
                    logId: currentLogId,
                    mobileLogId: currentMobileLogId,
                    msg,
                };
                return res;
            };
        }
    }
    /*
          setup:
  
          This method must set up the game user interface according to current game situation specified
          in parameters.
  
          The method is called each time the game interface is displayed to a player, ie:
          _ when the game starts
          _ when a player refreshes the game page (F5)
  
          "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
      */
    setup(gamedatas) {
        this.bga.gameArea.getElement().insertAdjacentHTML('beforeend', `
      <link rel="stylesheet" href="https://use.typekit.net/jim0ypy.css">

      <div id="top">
      </div>

      <div id="table-center">
          <div id="circuit"></div>
      </div>
      <div id="tables"></div>  
    `);
        log('Starting game setup');
        this.gamedatas = gamedatas;
        // Create a new div for buttons to avoid BGA auto clearing it
        // @ts-ignore
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        // @ts-ignore
        dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');
        if (gamedatas.circuitDatas?.jpgUrl && !gamedatas.circuitDatas.jpgUrl.startsWith('http')) {
            this.bga.images.preloadImage(gamedatas.circuitDatas.jpgUrl);
        }
        //this.bga.images.preloadImages(Object.values(gamedatas.players).map(player => `mats/player-board-${player.color}.jpg`));
        // Create a new div for buttons to avoid BGA auto clearing it
        dojo.place("<div id='customActions' style='display:inline-block'></div>", 'generalactions', 'after');
        dojo.place("<div id='restartAction' style='display:inline-block'></div>", 'customActions', 'after');
        log('gamedatas', gamedatas);
        this.animationManager = new BgaAnimations.AnimationManager(this);
        this.cardsManager = new CardsManager(this);
        this.legendCardsManager = new LegendCardsManager(this);
        this.eventCardsManager = new EventCardsManager(this);
        const jumpToEntries = [new BgaJumpTo.Entry(_('Circuit'), 'table-center', { color: '#222222', id: `bga-jump-to_circuit`, backgroundSize: 'cover' })];
        if (gamedatas.isLegend) {
            jumpToEntries.push(new BgaJumpTo.Entry(_('Legends'), 'legend-board', { color: '#39464c', backgroundImage: `url('${this.bga.images.getImgUrl('mats/legend.jpg')}')` }));
        }
        if (gamedatas.championship) {
            jumpToEntries.unshift(new BgaJumpTo.Entry(_('Championship'), 'championship-table', { color: '#39464c', backgroundImage: `url('${this.bga.images.getImgUrl('scorepad.jpg')}')` }));
        }
        jumpToEntries.push(...BgaJumpTo.BgaPlayerEntries(this.bga, {
            entrySettings: (playerId) => ({ id: `bga-jump-to_player-table-${playerId}` }),
        }));
        new BgaJumpTo.Manager({
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            entries: jumpToEntries,
            defaultFolded: true,
        });
        this.circuit = new Circuit(this, gamedatas);
        if (gamedatas.championship) {
            this.championshipTable = new ChampionshipTable(this, gamedatas);
        }
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        const constructorId = this.getConstructorId();
        const constructor = this.gamedatas.constructors[constructorId];
        if (constructorId !== null && constructor?.planification?.length && constructor.speed < 0) {
            this.updatePlannedCards(constructor.planification);
        }
        this.circuitZoomManager = new BgaZoom.Manager({
            element: document.getElementById('table-center'),
            zoomControls: {
                color: 'black',
            },
            defaultZoom: 0.625,
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
            autoZoom: {
                expectedWidth: 1550,
            },
        });
        this.tablesZoomManager = new BgaZoom.Manager({
            element: document.getElementById('tables'),
            zoomControls: {
                color: 'black',
            },
            defaultZoom: 1,
            localStorageZoomKey: LOCAL_STORAGE_CIRCUIT_ZOOM_KEY,
            autoZoom: {
                expectedWidth: 1200,
            },
        });
        new BgaHelp.HelpManager(this, {
            buttons: [
                new BgaHelp.BgaHelpPopinButton({
                    title: _('Help'),
                    html: this.getHelpHtml(),
                    buttonBackground: '#d61b1a',
                }),
            ],
        });
        this.setupNotifications();
        BgaAutofit.init();
        log('Ending game setup');
    }
    ///////////////////////////////////////////////////
    //// Game & client states
    addDangerActionButton(id, text, callback, zone = 'customActions') {
        if (!$(id))
            this.bga.statusBar.addActionButton(text, callback, { id, destination: $(zone), color: 'alert' });
    }
    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    onEnteringState(stateName, args) {
        log('Entering state: ' + stateName, args.args);
        if (args.args?.descSuffix) {
            this.changePageTitle(args.args.descSuffix);
        }
        if (args.args?.optionalAction) {
            let base = args.args.descSuffix ? args.args.descSuffix : '';
            this.changePageTitle(base + 'skippable');
        }
        if (this.bga.players.isCurrentPlayerActive()) {
            if (args.args?.previousSteps) {
                document
                    .getElementById('logs')
                    .querySelectorAll(`.log.notif_newUndoableStep`)
                    .forEach((undoNotif) => {
                    if (!args.args?.previousSteps.includes(Number(undoNotif.dataset.step))) {
                        undoNotif.style.display = 'none';
                    }
                });
            }
            // Undo last steps
            args.args?.previousSteps?.forEach((stepId) => {
                let logEntry = $('logs').querySelector(`.log.notif_newUndoableStep[data-step="${stepId}"]`);
                if (logEntry) {
                    this.onClick(logEntry, (e) => this.undoToStep(stepId, e));
                }
                logEntry = document.querySelector(`.chatwindowlogs_zone .log.notif_newUndoableStep[data-step="${stepId}"]`);
                if (logEntry) {
                    this.onClick(logEntry, (e) => this.undoToStep(stepId, e));
                }
            });
            // Restart turn button
            //if (args.args?.previousEngineChoices >= 1 && !args.args.automaticAction) {
            if (args.args?.undoableSteps && args.args.undoableSteps.length) {
                let lastStep = Math.max(...args.args.undoableSteps);
                if (lastStep > 0) {
                    this.addDangerActionButton('btnUndoLastStep', _('Undo last step'), (e) => this.undoToStep(lastStep, e), 'restartAction');
                }
                // Restart whole turn
                this.addDangerActionButton('btnRestartTurn', _('Restart turn'), () => {
                    //this.stopActionTimer();
                    this.bga.actions.performAction('actRestartTurn');
                }, 'restartAction');
            }
            //}
        }
        switch (stateName) {
            case 'uploadCircuit':
                this.onEnteringStateUploadCircuit(args.args);
                break;
            case 'chooseUpgrade':
                this.onEnteringChooseUpgrade(args.args);
                break;
            case 'swapUpgrade':
                this.onEnteringSwapUpgrade(args.args);
                break;
            case 'planification':
                this.updatePlannedCards(args.args._private?.selection ?? []);
                break;
            case 'snakeDiscard':
                this.updateDiscardDraftCard(args.args._private?.choice ?? null);
                break;
            case 'react':
                this.onEnteringReact(args.args);
                break;
            case 'gameEnd':
                document.getElementById('leave-text-action')?.remove();
                break;
        }
    }
    changePageTitle(suffix = null, save = false) {
        const title = this.bga.players.isCurrentPlayerActive()
            ? this.gamedatas.gamestate['descriptionmyturn' + suffix] ?? this.gamedatas.gamestate['descriptionmyturn']
            : this.gamedatas.gamestate['description' + suffix] ?? this.gamedatas.gamestate['description'];
        this.bga.statusBar.setTitle(title, this.gamedatas.gamestate.args);
    }
    onEnteringStateUploadCircuit(args) {
        // this.clearInterface();
        document.getElementById('circuit').insertAdjacentHTML('beforeend', `
        <div id="circuit-dropzone-container">
            <div id="circuit-dropzone">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M384 0v128h128L384 0zM352 128L352 0H176C149.5 0 128 21.49 128 48V288h174.1l-39.03-39.03c-9.375-9.375-9.375-24.56 0-33.94s24.56-9.375 33.94 0l80 80c9.375 9.375 9.375 24.56 0 33.94l-80 80c-9.375 9.375-24.56 9.375-33.94 0C258.3 404.3 256 398.2 256 392s2.344-12.28 7.031-16.97L302.1 336H128v128C128 490.5 149.5 512 176 512h288c26.51 0 48-21.49 48-48V160h-127.1C366.3 160 352 145.7 352 128zM24 288C10.75 288 0 298.7 0 312c0 13.25 10.75 24 24 24H128V288H24z"/></svg>

            <input type="file" id="circuit-input" />
            <label for="circuit-input">${_('Choose circuit')}</label>
            <h5>${_('or drag & drop your .heat file here')}</h5>
            </div>
        </div>
        `);
        $('circuit-input').addEventListener('change', (e) => this.uploadCircuit(e.target.files[0]));
        let dropzone = $('circuit-dropzone-container');
        let toggleActive = (b) => {
            return (e) => {
                e.preventDefault();
                dropzone.classList.toggle('active', b);
            };
        };
        dropzone.addEventListener('dragenter', toggleActive(true));
        dropzone.addEventListener('dragover', toggleActive(true));
        dropzone.addEventListener('dragleave', toggleActive(false));
        dropzone.addEventListener('drop', (e) => {
            toggleActive(false)(e);
            this.uploadCircuit(e.dataTransfer.files[0]);
        });
    }
    uploadCircuit(file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener('load', (e) => {
            let content = e.target.result;
            let circuit = JSON.parse(content);
            this.bga.gameui.ajaxcall(
            // @ts-ignore
            `/${this.game_name}/${this.game_name}/actUploadCircuit.html`, { circuit: JSON.stringify(circuit), lock: true }, this, () => { }, undefined, // @ts-ignore
            'post');
        });
    }
    initMarketStock() {
        if (!this.market) {
            const constructor = Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId());
            document.getElementById('top').insertAdjacentHTML('afterbegin', `
                <div id="market" style="--personal-card-background-y: ${((constructor?.id ?? 0) * 100) / 8}%;"></div>
            `);
            this.market = new BgaCards.LineStock(this.cardsManager, document.getElementById(`market`));
            this.market.onSelectionChange = (selection) => this.onMarketSelectionChange(selection);
        }
    }
    onEnteringChooseUpgrade(args) {
        this.initMarketStock();
        this.market.addCards(Object.values(args.market));
        this.market.setSelectionMode(this.bga.players.isCurrentPlayerActive() ? 'single' : 'none');
    }
    onEnteringSwapUpgrade(args) {
        this.initMarketStock();
        this.market.addCards(Object.values(args.market));
        this.market.setSelectionMode(this.bga.players.isCurrentPlayerActive() ? 'single' : 'none');
        if (this.bga.players.isCurrentPlayerActive()) {
            const hand = this.getCurrentPlayerTable().hand;
            hand.removeAll();
            hand.addCards(Object.values(args.owned));
            hand.setSelectionMode('single');
        }
    }
    onEnteringSnakeDiscard(args) {
        const playerTable = this.getCurrentPlayerTable();
        playerTable.inplay.unselectAll();
        playerTable.inplay.setSelectionMode(this.bga.players.isCurrentPlayerActive() ? 'single' : 'none');
        const cards = playerTable.inplay.getCards();
        if (args._private.choice) {
            playerTable.inplay.selectCard(cards.find((card) => Number(card.id) == Number(args._private.choice)));
        }
    }
    onEnteringConsultingMechanics(args) {
        this.bga.statusBar.removeActionButtons();
        this.bga.statusBar.addActionButton(_('+1 Heat & +1 Stress'), () => this.actConsultingMechanics(0), {
            id: `actConsultingMechanics_0_button`,
        });
        this.bga.statusBar.addActionButton(_('-1 Heat & -1 Stress'), () => this.actConsultingMechanics(1), {
            id: `actConsultingMechanics_1_button`,
        });
        const choice = args?._private?.choice;
        if (choice === 0 || choice === 1) {
            this.bga.statusBar.addActionButton(_('Cancel choice'), () => this.actCancelConsultingMechanics(), {
                id: `actCancelConsultingMechanics_button`,
                color: 'alert',
            });
        }
    }
    onEnteringPlanification(args) {
        this.circuit.removeMapPaths();
        if (args._private) {
            this.getCurrentPlayerTable().setCurrentGear(args._private.gear);
            let selection = this.getCurrentPlayerTable()
                .hand.getSelection()
                .map((card) => card.id);
            if (selection.length == 0) {
                selection = args._private.selection;
            }
            this.getCurrentPlayerTable().setHandSelectable(this.bga.players.isCurrentPlayerActive() ? 'multiple' : 'none', args._private.cards, selection);
            if (selection?.length > 0) {
                this.getCurrentPlayerTable().setCurrentGear(selection.length);
                let cards = this.getCurrentPlayerTable()
                    .hand.getCards()
                    .filter((card) => selection.includes(card.id));
                this.onHandCardSelectionChange(cards);
            }
        }
    }
    onEnteringReact(args) {
        this.circuit.removeCornerHeatIndicators();
        if (args.heatCosts) {
            Object.entries(args.heatCosts).forEach(([cornerId, heat]) => this.circuit.addCornerHeatIndicator(Number(cornerId), heat));
        }
    }
    updatePlannedCards(plannedCardsIds) {
        document.querySelectorAll(`.planned-card`).forEach((elem) => elem.classList.remove('planned-card'));
        if (plannedCardsIds?.length) {
            const playerTable = this.getCurrentPlayerTable();
            const hand = this.getCurrentPlayerTable()?.hand;
            if (hand) {
                const cards = hand.getCards();
                plannedCardsIds?.forEach((id) => {
                    const card = cards.find((card) => Number(card.id) == id);
                    if (card) {
                        hand.getCardElement(card)?.classList.add('planned-card');
                    }
                });
            }
            playerTable.setCurrentGear(plannedCardsIds.length);
        }
    }
    updateDiscardDraftCard(cardId) {
        document.querySelectorAll(`.planned-card`).forEach((elem) => elem.classList.remove('planned-card'));
        if (cardId !== null) {
            let card = document.querySelector(`.card[data-card-id="${cardId}"]`);
            if (card)
                card.classList.add('planned-card');
        }
    }
    onEnteringChooseSpeed(args) {
        this.circuit.removeMapPaths();
        Object.entries(args.speeds).forEach(([speedStr, speedChoice]) => {
            const speed = Number(speedStr);
            this.circuit.addMapIndicator(speedChoice.cell, () => this.actChooseSpeed(speed, speedChoice.choices[0]), speed);
        });
    }
    onEnteringSlipstream(args) {
        this.circuit.removeCornerHeatIndicators();
        if (args.currentHeatCosts) {
            Object.entries(args.currentHeatCosts).forEach(([cornerId, heat]) => this.circuit.addCornerHeatIndicator(Number(cornerId), heat));
        }
        Object.entries(args.speeds).forEach(([speedStr, speedChoice]) => this.circuit.addMapIndicator(speedChoice, () => this.actSlipstream(Number(speedStr)), this.speedCounters[this.getConstructorId()].getValue(), false));
    }
    onEnteringPayHeats(args) {
        const inplay = this.getCurrentPlayerTable().inplay;
        const ids = Object.keys(args.payingCards).map(Number);
        inplay.setSelectionMode('multiple', inplay.getCards().filter((card) => ids.includes(card.id)));
    }
    onEnteringDiscard(args) {
        this.getCurrentPlayerTable().setHandSelectable('multiple', args._private.cardIds);
    }
    onEnteringSalvage(args) {
        if (!this.market) {
            const constructor = Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId());
            document.getElementById('top').insertAdjacentHTML('afterbegin', `
                <div id="market" style="--personal-card-background-y: ${((constructor?.id ?? 0) * 100) / 8}%;"></div>
            `);
            this.market = new BgaCards.LineStock(this.cardsManager, document.getElementById(`market`));
            this.market.onSelectionChange = (selection) => {
                document.getElementById(`actSalvage_button`).classList.toggle('disabled', selection.length > args.n);
            };
        }
        // negative ids to not mess with deck pile
        this.market.addCards(Object.values(args._private.cards).map((card) => ({ ...card, id: -card.id })));
        this.market.setSelectionMode(this.bga.players.isCurrentPlayerActive() ? 'multiple' : 'none');
    }
    onEnteringSuperCool(args) {
        if (!this.market) {
            const constructor = Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId());
            document.getElementById('top').insertAdjacentHTML('afterbegin', `
                <div id="market" style="--personal-card-background-y: ${((constructor?.id ?? 0) * 100) / 8}%;"></div>
            `);
            this.market = new BgaCards.LineStock(this.cardsManager, document.getElementById(`market`));
        }
        // negative ids to not mess with deck pile
        this.market.addCards(Object.values(args._private.cards).map((card) => ({ ...card, id: -card.id })));
        this.market.setSelectionMode('none');
    }
    onLeavingState(stateName) {
        log('Leaving state: ' + stateName);
        this.bga.statusBar.removeActionButtons();
        document.getElementById('customActions').innerHTML = '';
        document.getElementById('restartAction').innerHTML = '';
        switch (stateName) {
            case 'snakeDiscard':
                this.onLeavingSnakeDiscard();
                break;
            case 'planification':
                this.onLeavingPlanification();
                break;
            case 'chooseSpeed':
                this.onLeavingChooseSpeed();
                break;
            case 'react':
                this.onLeavingReact();
                break;
            case 'slipstream':
                this.onLeavingSlipstream();
                break;
            case 'payHeats':
                this.onLeavingPayHeats();
                break;
            case 'discard':
                this.onLeavingHandSelection();
                break;
            case 'salvage':
                this.onLeavingSalvage();
                break;
            case 'superCool':
                this.onLeavingSuperCool();
                break;
        }
    }
    onLeavingSnakeDiscard() {
        if (this.bga.players.isCurrentPlayerActive()) {
            const playerTable = this.getCurrentPlayerTable();
            playerTable.inplay.setSelectionMode('none');
        }
    }
    onLeavingChooseSpeed() {
        this.circuit.removeMapIndicators();
    }
    onLeavingReact() {
        document.querySelectorAll('.hand-wrapper .action-button').forEach((elem) => elem.remove());
    }
    onLeavingSlipstream() {
        this.circuit.removeMapIndicators();
        this.circuit.removeCornerHeatIndicators();
    }
    onLeavingPlanification() {
        this.onLeavingHandSelection();
        this.circuit.removeMapIndicators();
    }
    onLeavingHandSelection() {
        this.getCurrentPlayerTable()?.setHandSelectable('none');
    }
    onLeavingPayHeats() {
        this.getCurrentPlayerTable()?.inplay.setSelectionMode('none');
    }
    onLeavingSalvage() {
        this.market?.remove();
        this.market = null;
    }
    onLeavingSuperCool() {
        this.market?.remove();
        this.market = null;
    }
    createChooseSpeedButtons(args) {
        Object.entries(args.speeds).forEach(([speedStr, speedChoice]) => {
            const speed = Number(speedStr);
            let label = _('Move ${cell} cell(s)').replace('${cell}', `${speed}`);
            if (speedChoice.heatCosts) {
                label += ` (${speedChoice.heatCosts}[Heat])`;
            }
            const button = this.bga.statusBar.addActionButton(formatTextIcons(label), () => this.actChooseSpeed(speed, speedChoice.choices[0]));
            this.linkButtonHoverToMapIndicator(button, speedChoice.cell);
        });
    }
    createSlipstreamButtons(args) {
        Object.entries(args.speeds).forEach(([speedStr, speedChoice]) => {
            const speed = Number(speedStr);
            let label = _('Move ${cell} cell(s)').replace('${cell}', `${speed}`);
            /*if (args.heatCosts[speed]) {
                      label += ` (${args.heatCosts[speed]}[Heat])`;
                  }*/
            const confirmationMessage = this.getSlipstreamConfirmation(args, speed);
            const finalAction = () => this.actSlipstream(speed);
            const callback = confirmationMessage ? () => this.bga.gameui.confirmationDialog(confirmationMessage, finalAction) : finalAction;
            const button = this.bga.statusBar.addActionButton(formatTextIcons(label), callback);
            this.linkButtonHoverToMapIndicator(button, speedChoice);
        });
    }
    showHeatCostConfirmations() {
        return !this.bga.userPreferences.get(201);
    }
    getAdrenalineConfirmation(currentHeatCost, adrenalineWillCrossNextCorner, nextCornerSpeedLimit, nextCornerExtraHeatCost, boostInfos) {
        let confirmationMessage = null;
        adrenalineWillCrossNextCorner = this.cornerCounters[this.getConstructorId()].getValue() == 0 && adrenalineWillCrossNextCorner;
        const adrenalineCostOnCurrentCorner = boostInfos?.[1] ? Object.values(boostInfos[1]).reduce((a, b) => a + b, 0) : 0;
        if (adrenalineWillCrossNextCorner || currentHeatCost > 0 || adrenalineCostOnCurrentCorner > 0) {
            const newSpeed = this.speedCounters[this.getConstructorId()].getValue() + 1;
            let newHeatCost = currentHeatCost > 0 ? currentHeatCost + 1 : 0;
            let newCornerCost = 0;
            if (adrenalineWillCrossNextCorner) {
                newCornerCost = Math.max(0, newSpeed - nextCornerSpeedLimit);
                if (newCornerCost > 0 && nextCornerExtraHeatCost) {
                    newCornerCost++;
                }
                newHeatCost += newCornerCost;
            }
            else if (adrenalineCostOnCurrentCorner) {
                newHeatCost = adrenalineCostOnCurrentCorner;
            }
            if (newHeatCost > 0) {
                if (adrenalineWillCrossNextCorner) {
                    confirmationMessage =
                        _('The Adrenaline reaction will make you cross a <strong>new</strong> corner at speed ${speed} (Corner speed limit: ${speedLimit}).')
                            .replace('${speed}', `<strong>${newSpeed}</strong>`)
                            .replace('${speedLimit}', `<strong>${nextCornerSpeedLimit}</strong>`) + `<br>`;
                }
                else {
                    confirmationMessage = '';
                }
                if (currentHeatCost > 0) {
                    confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change to ${newHeat} Heat(s).')
                        .replace('${heat}', `<strong>${currentHeatCost}</strong>`)
                        .replace('${newHeat}', `<strong>${newHeatCost}</strong>`);
                }
                else {
                    confirmationMessage += _('You will have to pay ${newHeat} Heat(s).').replace('${newHeat}', `<strong>${newHeatCost}</strong>`);
                }
                confirmationMessage += `<br><br>
                ${_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', `<strong>${this.engineCounters[this.getConstructorId()].getValue()}</strong>`)}`;
            }
        }
        return confirmationMessage;
    }
    getBoostConfirmation(currentHeatCost, nextCornerSpeedLimit, nextCornerExtraHeatCost, boostInfos, paid) {
        const mayCrossCorner = this.cornerCounters[this.getConstructorId()].getValue() < 4;
        let confirmationMessage = null;
        const boostCostOnCurrentCorner = boostInfos?.[4] ? Object.values(boostInfos[4]).reduce((a, b) => a + b, 0) : 0;
        if (mayCrossCorner || currentHeatCost > 0 || boostCostOnCurrentCorner > 0) {
            const newSpeedMax = this.speedCounters[this.getConstructorId()].getValue() + 4;
            let newHeatCostMax = boostCostOnCurrentCorner + (paid ? 1 : 0);
            let newCornerCostMax = 0;
            if (mayCrossCorner) {
                newCornerCostMax = Math.max(0, newSpeedMax - nextCornerSpeedLimit);
                if (newCornerCostMax > 0 && nextCornerExtraHeatCost) {
                    newCornerCostMax++;
                }
                newHeatCostMax += newCornerCostMax;
            }
            if (newHeatCostMax > 0) {
                if (mayCrossCorner) {
                    confirmationMessage =
                        _('The Boost reaction may make you cross a <strong>new</strong> corner at a speed up to ${speed} (Corner speed limit: ${speedLimit}).')
                            .replace('${speed}', `<strong>${newSpeedMax}</strong>`)
                            .replace('${speedLimit}', `<strong>${nextCornerSpeedLimit}</strong>`) + `<br>`;
                }
                else {
                    confirmationMessage = '';
                }
                if (currentHeatCost > 0) {
                    confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change up to ${newHeat} Heat(s).')
                        .replace('${heat}', `<strong>${currentHeatCost}</strong>`)
                        .replace('${newHeat}', `<strong>${newHeatCostMax}</strong>`);
                }
                else {
                    confirmationMessage += _('You will have to pay up to ${newHeat} Heat(s).').replace('${newHeat}', `<strong>${newHeatCostMax}</strong>`);
                }
                confirmationMessage += `<br><br>
                ${_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', `<strong>${this.engineCounters[this.getConstructorId()].getValue()}</strong>`)}`;
            }
        }
        return confirmationMessage;
    }
    getDirectPlayConfirmation(currentHeatCost, nextCornerSpeedLimit, directPlayCosts, card) {
        const willCrossCorner = this.cornerCounters[this.getConstructorId()].getValue() < card.speed;
        const newHeatCost = Object.values(directPlayCosts[card.id]).reduce((a, b) => a + b, 0);
        let confirmationMessage = null;
        if (currentHeatCost < newHeatCost) {
            const newSpeed = this.speedCounters[this.getConstructorId()].getValue() + card.speed;
            if (willCrossCorner) {
                confirmationMessage =
                    _('The Direct Play reaction may make you cross a <strong>new</strong> corner at speed ${speed} (Corner speed limit: ${speedLimit}).')
                        .replace('${speed}', `<strong>${newSpeed}</strong>`)
                        .replace('${speedLimit}', `<strong>${nextCornerSpeedLimit}</strong>`) + `<br>`;
            }
            else {
                confirmationMessage = '';
            }
            if (currentHeatCost > 0) {
                confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change to ${newHeat} Heat(s).')
                    .replace('${heat}', `<strong>${currentHeatCost}</strong>`)
                    .replace('${newHeat}', `<strong>${newHeatCost}</strong>`);
            }
            else {
                confirmationMessage += _('You will have to pay ${newHeat} Heat(s).').replace('${newHeat}', `<strong>${newHeatCost}</strong>`);
            }
            confirmationMessage += `<br><br>
            ${_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', `<strong>${this.engineCounters[this.getConstructorId()].getValue()}</strong>`)}`;
        }
        return confirmationMessage;
    }
    getSlipstreamConfirmation(reactArgs, slipstream) {
        let confirmationMessage = null;
        const slipstreamWillCrossNextCorner = this.cornerCounters[this.getConstructorId()].getValue() < slipstream && reactArgs.slipstreamWillCrossNextCorner[slipstream];
        if (slipstreamWillCrossNextCorner) {
            const speed = this.speedCounters[this.getConstructorId()].getValue();
            const newHeatCost = reactArgs.heatCosts[slipstream];
            if (newHeatCost > reactArgs.currentHeatCost) {
                confirmationMessage =
                    _('The Slipstream move will make you cross a <strong>new</strong> corner at speed ${speed} (Corner speed limit: ${speedLimit}).')
                        .replace('${speed}', `<strong>${speed}</strong>`)
                        .replace('${speedLimit}', `<strong>${reactArgs.nextCornerSpeedLimit}</strong>`) + `<br>`;
                if (reactArgs.currentHeatCost > 0) {
                    confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change to ${newHeat} Heat(s).')
                        .replace('${heat}', `<strong>${reactArgs.currentHeatCost}</strong>`)
                        .replace('${newHeat}', `<strong>${newHeatCost}</strong>`);
                }
                else {
                    confirmationMessage += _('You will have to pay ${newHeat} Heat(s).').replace('${newHeat}', `<strong>${newHeatCost}</strong>`);
                }
                confirmationMessage += `<br><br>
                    ${_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', `<strong>${this.engineCounters[this.getConstructorId()].getValue()}</strong>`)}`;
            }
        }
        return confirmationMessage;
    }
    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    onUpdateActionButtons(stateName, args) {
        log('onUpdateActionButtons: ' + stateName, args);
        switch (stateName) {
            case 'snakeDiscard':
                this.onEnteringSnakeDiscard(args);
                break;
            case 'consultingMechanics':
                this.onEnteringConsultingMechanics(args);
                break;
            case 'planification':
                this.onEnteringPlanification(args);
                break;
        }
        if (this.bga.players.isCurrentPlayerActive()) {
            switch (stateName) {
                case 'chooseUpgrade':
                    this.bga.statusBar.addActionButton(_('Take selected card'), () => this.actChooseUpgrade(), {
                        id: `actChooseUpgrade_button`,
                    });
                    document.getElementById(`actChooseUpgrade_button`).classList.add('disabled');
                    break;
                case 'swapUpgrade':
                    this.bga.statusBar.addActionButton(_('Swap selected cards'), () => this.actSwapUpgrade(), { id: `actSwapUpgrade_button` });
                    document.getElementById(`actSwapUpgrade_button`).classList.add('disabled');
                    this.bga.statusBar.addActionButton(_('Pass'), () => this.actPassSwapUpgrade(), {
                        id: `actPassSwapUpgrade_button`,
                        color: 'alert',
                    });
                    break;
                case 'snakeDiscard':
                    this.bga.statusBar.addActionButton(_('Discard selected card'), () => this.actSnakeDiscard(), {
                        id: `actSnakeDiscard_button`,
                    });
                    this.checkSnakeDiscardSelectionState();
                    break;
                case 'planification':
                    const planificationArgs = args;
                    this.bga.statusBar.addActionButton('', () => this.actPlanification(), { id: `actPlanification_button` });
                    if (planificationArgs._private.canMulligan) {
                        this.bga.statusBar.addActionButton(_('Mulligan') + formatTextIcons(' (1[Heat])'), () => this.bga.actions.performAction('actMulligan'), {
                            id: 'mulligan-btn',
                            color: 'alert',
                            confirm: _('Spend 1 Heat to draw a new hand?'),
                        });
                    }
                    this.onHandCardSelectionChange(this.getCurrentPlayerTable().hand.getSelection());
                    if (planificationArgs._private?.canSkipEndRace) {
                        let giveUpMessage = _('If you give up, you will be ranked last.');
                        if (planificationArgs.nPlayersLeft > 1) {
                            giveUpMessage += '<br><br>' + _('You are not the only player remaining, so there is still hope!');
                        }
                        this.bga.statusBar.addActionButton(_('I want to give up this race'), () => this.bga.gameui.confirmationDialog(giveUpMessage, () => this.actGiveUp()), { color: 'secondary' });
                    }
                    break;
                case 'chooseSpeed':
                    const chooseSpeedArgs = args;
                    this.onEnteringChooseSpeed(chooseSpeedArgs);
                    this.createChooseSpeedButtons(chooseSpeedArgs);
                    break;
                case 'slipstream':
                    const slipstreamArgs = args;
                    if (args.speeds) {
                        this.onEnteringSlipstream(slipstreamArgs);
                        this.createSlipstreamButtons(slipstreamArgs);
                    }
                    this.bga.statusBar.addActionButton(_('Pass'), () => this.actSlipstream(0));
                    break;
                case 'react':
                    this.onUpdateActionButtons_react(args);
                    break;
                case 'payHeats':
                    this.onEnteringPayHeats(args);
                    this.bga.statusBar.addActionButton(formatTextIcons(_('Keep selected cards (max: ${number} [Heat])').replace('${number}', args.heatInReserve)), () => this.actPayHeats(this.getCurrentPlayerTable().inplay.getSelection()), { id: `actPayHeats_button` });
                    this.onInPlayCardSelectionChange([]);
                    break;
                case 'checkCorner':
                    if (args.spinOut) {
                        this.bga.statusBar.addActionButton(_('SPIN OUT'), () => this.actCheckCorner(), { color: 'alert' });
                    }
                    else {
                        this.bga.statusBar.addActionButton(_('Pay'), () => this.actCheckCorner(), { autoclick: true });
                    }
                    break;
                case 'discard':
                    this.onEnteringDiscard(args);
                    if (args._private?.refreshedIds?.length) {
                        args._private?.refreshedIds.forEach((number) => {
                            const refreshCard = this.getCurrentPlayerTable()
                                .inplay.getCards()
                                .find((card) => card.id == number);
                            const label = `<div class="icon refresh"></div>${_('Place back on deck')}<br>
                            ${this.cardImageHtml(refreshCard, { constructor_id: this.getConstructorId() })}`;
                            const tooltip = this.getGarageModuleIconTooltipWithIcon('refresh', 1);
                            this.bga.statusBar.addActionButton(formatTextIcons(label), () => this.actRefresh(number), {
                                id: `actRefresh_${number}_button`,
                            });
                            this.setTooltip(`actRefresh_${number}_button`, formatTextIcons(tooltip));
                        });
                    }
                    this.bga.statusBar.addActionButton('', () => this.actDiscard(this.getCurrentPlayerTable().hand.getSelection()), {
                        confirm: args._private?.refreshedIds?.length
                            ? _("Are you sure you don't want to refresh some of the played cards?")
                            : null,
                        id: 'actDiscard_button',
                    });
                    this.bga.statusBar.addActionButton(_('No additional discard'), () => this.actDiscard([]), {
                        color: 'alert',
                        confirm: args._private?.refreshedIds?.length
                            ? _("Are you sure you don't want to refresh some of the played cards?")
                            : null,
                        id: 'actNoDiscard_button',
                    });
                    this.onHandCardSelectionChange([]);
                    break;
                case 'salvage':
                    this.onEnteringSalvage(args);
                    this.bga.statusBar.addActionButton(_('Salvage selected cards'), () => this.actSalvage(), { id: `actSalvage_button` });
                    break;
                case 'superCool':
                    this.onEnteringSuperCool(args);
                    for (let i = args.n; i >= 0; i--) {
                        this.bga.statusBar.addActionButton(`<div class="icon super-cool">${i}</div>`, () => this.actSuperCool(i), {
                            id: `actSuperCool${i}_button`,
                        });
                        if (i > args._private.max) {
                            document.getElementById(`actSuperCool${i}_button`).classList.add('disabled');
                        }
                    }
                    break;
                case 'confirmEndOfRace':
                    this.bga.statusBar.addActionButton(_('Seen'), () => this.actConfirmResults(), { id: `seen_button` });
                    break;
            }
        }
        else {
            switch (stateName) {
                case 'snakeDiscard':
                    this.bga.statusBar.addActionButton(_('Cancel'), () => this.bga.actions.performAction('actCancelSnakeDiscard', undefined, { checkAction: false }), {
                        id: `actCancelSnakeDiscard_button`,
                        color: 'secondary',
                    });
                    break;
                case 'planification':
                    if (!this.gamedatas.isDeferredRounds) {
                        this.bga.statusBar.addActionButton(_('Cancel'), () => this.actCancelSelection(), {
                            id: `actCancelSelection_button`,
                            color: 'secondary',
                        });
                    }
                    break;
            }
        }
    }
    getMandatoryZone(destination) {
        const mandatoryZoneId = `${destination ? destination.id : ''}mandatory-buttons`;
        let mandatoryZone = document.getElementById(mandatoryZoneId);
        if (!mandatoryZone) {
            mandatoryZone = document.createElement('div');
            mandatoryZone.classList.add('mandatory-buttons');
            mandatoryZone.id = mandatoryZoneId;
            mandatoryZone.innerHTML = `<div class="mandatory icon"></div>`;
            (destination ?? document.getElementById('generalactions')).insertAdjacentElement('afterbegin', mandatoryZone);
        }
        return mandatoryZone;
    }
    addReactButton(type, entries, symbolInfos, cumulative, args, forcedN) {
        let label = ``;
        let tooltip = ``;
        let confirmationMessage = null;
        let enabled = symbolInfos.doable;
        let number = forcedN;
        if (forcedN !== undefined && entries.length == 1) {
            if (symbolInfos.entries[entries[0]].n !== forcedN)
                return;
        }
        if (forcedN === undefined && entries.every((entry) => symbolInfos.entries[entry].n !== undefined)) {
            number = entries
                .map((entry) => symbolInfos.entries[entry])
                .map((symbolEntry) => symbolEntry.n)
                .reduce((a, b) => a + b, 0);
            if (symbolInfos.max !== undefined) {
                number = Math.min(number, symbolInfos.max);
            }
        }
        const destination = cumulative ? null : document.getElementById(`${entries[0]}-${type}`);
        switch (type) {
            case 'accelerate':
                let nFlipped = symbolInfos.flippedCards;
                label = `+${nFlipped} [Speed]`;
                /*const accelerateCard = this.getCurrentPlayerTable()
                  .inplay.getCards()
                  .find((card) => card.id == Number(entries[0]));
                if (!destination) {
                  label += `<br>${this.cardImageHtml(accelerateCard, { constructor_id: this.getConstructorId() })}`;
                }*/
                tooltip = this.getGarageModuleIconTooltipWithIcon('accelerate', nFlipped);
                break;
            case 'adjust':
                label = `<div class="icon adjust" style="color: #${number > 0 ? '438741' : 'a93423'};">${number > 0 ? `+${number}` : number}</div>`;
                tooltip = this.getGarageModuleIconTooltipWithIcon('adjust', number);
                break;
            case 'adrenaline':
                label = `+${number} [Speed]`;
                tooltip = `
                                    <strong>${_('Adrenaline')}</strong>
                                    <br><br>
                                    ${_('Adrenaline can help the last player (or two last cars in a race with 5 cars or more) to move each round. If you have adrenaline, you may add 1 extra speed (move your car 1 extra Space).')}
                                    <br><br>
                                    <i>${_('Note: Adrenaline cannot be saved for future rounds')}</i>`;
                confirmationMessage = args.crossedFinishLine
                    ? null
                    : this.getAdrenalineConfirmation(args.currentHeatCost, args.adrenalineWillCrossNextCorner, args.nextCornerSpeedLimit, args.nextCornerExtraHeatCost, args.boostInfos);
                break;
            case 'cooldown':
                label = `${number} [Cooldown]`;
                if (entries.length == 1) {
                    let entry = entries[0];
                    if (entry == 'adrenaline')
                        label += _('(Adrenaline)');
                    if (entry == 'gear')
                        label += _('(Gear)');
                    if (entry.substring(0, 6) == 'corner')
                        label += _('(Weather)');
                }
                const heats = this.getCurrentPlayerTable()
                    .hand.getCards()
                    .filter((card) => card.effect == 'heat').length;
                if (heats < number) {
                    label += `(- ${heats} [Heat])`;
                }
                tooltip =
                    this.getGarageModuleIconTooltipWithIcon('cooldown', number) +
                        _('You gain access to Cooldown in a few ways but the most common is from driving in 1st gear (Cooldown 3) and 2nd gear (Cooldown 1).');
                break;
            case 'direct':
                label = `<div class="icon direct"></div>`;
                const directCard = this.getCurrentPlayerTable()
                    .hand.getCards()
                    .find((card) => card.id == Number(entries[0]));
                /*if (!destination) {
                      if (directCard) {
                        label = `<br>${this.cardImageHtml(directCard, { constructor_id: this.getConstructorId() })}`;
                      } else {
                        console.warn('card not found in hand to display direct card', number, directCard);
                      }
                    }*/
                tooltip = this.getGarageModuleIconTooltipWithIcon('direct', 1);
                confirmationMessage =
                    args.crossedFinishLine || !directCard
                        ? null
                        : this.getDirectPlayConfirmation(args.currentHeatCost, args.nextCornerSpeedLimit, symbolInfos.heatCosts, directCard);
                break;
            case 'heat':
                label = `<div class="icon forced-heat">${number}</div>`;
                tooltip = this.getGarageModuleIconTooltipWithIcon('heat', number);
                break;
            case 'boost':
            case 'heated-boost':
                const paid = type == 'heated-boost' && symbolInfos.heated;
                label = `[Boost] > [Speed]`;
                if (paid) {
                    label += ` (1[Heat])`;
                }
                tooltip = `
                                    <strong>${_('Boost')}</strong>
                                    <br><br>
                                    ${paid ? _('Regardless of which gear you are in you may pay 1 Heat to boost once per turn.') : ''}
                                    ${_('Boosting gives you a [+] symbol as reminded on the player mats. Move your car accordingly.')}
                                    <br><br>
                                    <i>${_('Note: [+] symbols always increase your Speed value for the purpose of the Check Corner step.')}</i>`;
                confirmationMessage = args.crossedFinishLine
                    ? null
                    : this.getBoostConfirmation(args.currentHeatCost, args.nextCornerSpeedLimit, args.nextCornerExtraHeatCost, symbolInfos.heatCosts, paid);
                break;
            case 'reduce':
                label = `<div class="icon reduce-stress">${number}</div>`;
                tooltip = this.getGarageModuleIconTooltipWithIcon('reduce', number);
                break;
            case 'salvage':
                label = `<div class="icon salvage">${number}</div>`;
                tooltip = this.getGarageModuleIconTooltipWithIcon('salvage', number);
                enabled = enabled && this.getCurrentPlayerTable().discard.getCardNumber() > 0;
                break;
            case 'scrap':
                label = `<div class="icon scrap">${number}</div>`;
                tooltip = this.getGarageModuleIconTooltipWithIcon('scrap', number);
                break;
            case 'super-cool':
                label = `<div class="icon super-cool">${number}</div>`;
                tooltip = this.getGarageModuleIconTooltipWithIcon('super-cool', number);
                break;
            case 'draft':
                label = `<div class="icon draft">${number}</div>`;
                tooltip = this.getGarageModuleIconTooltipWithIcon('draft', number);
                break;
        }
        const mandatory = ['heat', 'scrap', 'adjust'].includes(type);
        const necessaryEntries = this.getNecessaryEntries(symbolInfos, entries, number);
        const buttonId = `actReact${type}_${cumulative ? 'cumulative' : necessaryEntries.join('-')}_${number}_button`;
        let button = document.getElementById(buttonId);
        let buttonStatusBar = null;
        if (!button) {
            const noticeForButtonsOnCard = !destination && !symbolInfos.coalescable && !necessaryEntries.every((entry) => isNaN(entry));
            if (noticeForButtonsOnCard) {
                label += `${_('(play on the card(s))')}`;
            }
            button = this.bga.statusBar.addActionButton(formatTextIcons(label), () => this.actReact(type, necessaryEntries, number), {
                id: buttonId,
                color: forcedN ? 'secondary' : 'primary',
                confirm: this.showHeatCostConfirmations() ? confirmationMessage : null,
                disabled: !enabled || noticeForButtonsOnCard,
                destination,
            });
            if (destination && !symbolInfos.coalescable) {
                const card = type === 'direct'
                    ? this.getCurrentPlayerTable()
                        .hand.getCards()
                        .find((card) => card.id == Number(entries[0]))
                    : this.getCurrentPlayerTable()
                        .inplay.getCards()
                        .find((card) => card.id == Number(entries[0]));
                let statusBarLabel = formatTextIcons(label);
                if (card) {
                    statusBarLabel += `<br>${this.cardImageHtml(card, { constructor_id: this.getConstructorId() })}`;
                }
                buttonStatusBar = this.bga.statusBar.addActionButton(statusBarLabel, () => this.actReact(type, necessaryEntries, number), {
                    id: 'status-bar-' + buttonId,
                    color: forcedN ? 'secondary' : 'primary',
                    confirm: this.showHeatCostConfirmations() ? confirmationMessage : null,
                    disabled: !enabled,
                });
            }
        }
        if (mandatory) {
            this.getMandatoryZone(destination).appendChild(button);
            if (buttonStatusBar) {
                this.getMandatoryZone(null).appendChild(buttonStatusBar);
            }
        }
        this.setTooltip(buttonId, formatTextIcons(tooltip));
        if (!enabled) {
            if (type === 'cooldown') {
                button.insertAdjacentHTML('beforeend', `
                                        <div class="no-cooldown-warning">
                                            <div class="no-cooldown icon"></div>
                                        </div>
                                    `);
            }
        }
        return button;
    }
    /**
     * Returns the necessary entries to match number, using as less cards as possible
     */
    getNecessaryEntries(symbolInfos, entries, number) {
        if (number === undefined || number === null) {
            return entries;
        }
        const enrichedEntries = [];
        entries.forEach((entry, index) => enrichedEntries.push({
            entry,
            value: symbolInfos.entries?.[entry]?.n,
            textSymbol: isNaN(entry) ? 1 : 0, // for example, if we have adrenaline and cardIds for cooldown, use adrenaline as priority if possible
        }));
        enrichedEntries.sort((a, b) => b.textSymbol - a.textSymbol || b.value - a.value);
        const selected = [];
        let total = 0;
        for (const info of enrichedEntries) {
            selected.push(info);
            total += info.value;
            if (total >= number) {
                break;
            }
        }
        return selected.map((info) => info.entry);
    }
    onUpdateActionButtons_react(args) {
        const ignoredTypes = ['speed', 'adjust', 'boost'];
        Object.entries(args.symbols)
            .filter(([type, symbolSet]) => !ignoredTypes.includes(type))
            .forEach(([type, symbolInfos], index) => {
            const remainingEntries = {};
            Object.entries(symbolInfos.entries)
                .filter(([entry, symbolEntry]) => !symbolEntry.used && (symbolEntry.doable ?? true))
                .forEach(([entry, symbolEntry]) => (remainingEntries[entry] = symbolEntry));
            if (Object.keys(remainingEntries).length > 0) {
                if (symbolInfos.max !== undefined && symbolInfos.max === 0) {
                    return;
                }
                const noticeForButtonsOnCard = !symbolInfos.coalescable && !Object.keys(remainingEntries).every((entry) => isNaN(entry));
                if (!noticeForButtonsOnCard) {
                    this.addReactButton(type, Object.keys(remainingEntries), symbolInfos, true, args);
                }
                if (symbolInfos.max !== undefined && symbolInfos.upTo) {
                    for (let n = symbolInfos.max - 1; n >= (symbolInfos.min ?? 1); n--) {
                        this.addReactButton(type, Object.keys(remainingEntries), symbolInfos, true, args, n);
                    }
                }
                if (noticeForButtonsOnCard ||
                    (!Object.keys(remainingEntries).every((entry) => isNaN(entry)) && type !== 'cooldown')) {
                    // we ignore cooldown because we don't want Gear/Adrenaline cooldown buttons to show in addition to coalesced cooldown buttons
                    Object.keys(remainingEntries).forEach((entry) => {
                        this.addReactButton(type, [entry], symbolInfos, false, args);
                        if (symbolInfos.max !== undefined && symbolInfos.upTo) {
                            for (let n = symbolInfos.max - 1; n >= (symbolInfos.min ?? 1); n--) {
                                this.addReactButton(type, [entry], symbolInfos, false, args, n);
                            }
                        }
                    });
                }
            }
        });
        this.bga.statusBar.addActionButton(_('Pass'), () => this.actPassReact(), { disabled: !args.canPass });
        if (args.symbols.heat && !args.symbols.heat.used && !args.symbols.heat.doable) {
            const confirmationMessage = args.symbols.cooldown?.doable && args.symbols.cooldown?.max > 0 && !args.symbols.cooldown?.used
                ? _('You can cooldown, and it may unlock the Heat reaction. Are you sure you want to pass without cooldown?')
                : null;
            const finalAction = () => this.actCryCauseNotEnoughHeatToPay();
            const callback = confirmationMessage ? () => this.bga.gameui.confirmationDialog(confirmationMessage, finalAction) : finalAction;
            this.bga.statusBar.addActionButton(_("I can't pay Heat(s)"), callback);
        }
    }
    linkButtonHoverToMapIndicator(btn, cellId) {
        const mapIndicator = document.getElementById(`map-indicator-${cellId}`);
        btn.addEventListener('mouseenter', () => mapIndicator?.classList.add('hover'));
        btn.addEventListener('mouseleave', () => mapIndicator?.classList.remove('hover'));
    }
    ///////////////////////////////////////////////////
    //// Utility methods
    ///////////////////////////////////////////////////
    setTooltip(id, html) {
        this.bga.gameui.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    setTooltipToClass(className, html) {
        this.bga.gameui.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }
    getPlayerId() {
        return this.bga.players.getCurrentPlayerId();
    }
    getConstructorId() {
        const constructor = Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId());
        return constructor !== undefined ? Number(constructor?.id) : null;
    }
    getPlayer(playerId) {
        return Object.values(this.gamedatas.players).find((player) => Number(player.id) == playerId);
    }
    getPlayerTable(playerId) {
        return this.playersTables.find((playerTable) => playerTable.playerId === playerId);
    }
    getCurrentPlayerTable() {
        return this.playersTables.find((playerTable) => playerTable.playerId === this.getPlayerId());
    }
    getGameStateName() {
        return this.gamedatas.gamestate.name;
    }
    getGarageModuleIconTooltipWithIcon(symbol, number) {
        return `
            <div>
                <div class="tooltip-symbol">
                    <div class="${symbol == 'heat' ? 'forced-heat' : symbol} icon"></div>
                </div>
                ${formatTextIcons(this.getGarageModuleIconTooltip(symbol, number))}
            </div>`;
    }
    getGarageModuleIconTooltip(symbol, number) {
        switch (symbol) {
            case 'accelerate':
                return `
                    <strong>${_('Accelerate')}</strong>
                    <br>
                    ${_('You may increase your Speed by ${number} for every [+] symbol used by you this turn (from Upgrades, Stress, Boost, etc). If you do, you must increase it for all [+] symbols used and this counts for corner checks.').replace('${number}', '' + number)}
                `;
            case 'adjust':
                return `
                    <strong>${_('Adjust Speed Limit')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${isNaN(number)
                    ? _('If you cross a corner this turn, your Speed Limit is modified by # for you; “+” means you can move faster, “-” means you must move slower.')
                    : (Number(number) < 0
                        ? _('Speed limit is ${number} lower.')
                        : _('Speed limit is ${number} higher.')).replace('${number}', '' + Math.abs(Number(number)))}
                `;
            case 'boost':
                return `
                    <strong>${_('Boost')}</strong>
                    <br>
                    ${_('Flip the top card of your draw deck until you draw a Speed card (discard all other cards as you do when playing Stress cards). Move your car accordingly.')}
                    <br>
                    <i>${_('Note: Boost increases your Speed value for the purpose of the Check Corner step.')}</i>
                `;
            case 'cooldown':
                return `
                    <strong>${_('Cooldown')}</strong>
                    <br>
                    ${_('Cooldown allows you to take ${number} Heat card(s) from your hand and put it back in your Engine (so you can use the Heat card again). ').replace('${number}', '' + number)}
                `;
            case 'direct':
                return `
                    <strong>${_('Direct Play')}</strong>
                    <br>
                    ${_('You may play this card from your hand in the React step. If you do, it applies as if you played it normally, including Speed value and mandatory/optional icons.')}
                `;
            case 'heat':
                return `
                    <strong>${_('Heat')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${_('Take ${number} Heat cards from the Engine and move them to your discard pile.').replace('${number}', '' + number)}
                `;
            case 'one-time':
                return `
                    <strong>${_('One-time use')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${_('During the discard step, this card is removed instead of going to the discard.')}
                `;
            case 'reduce':
                return `
                    <strong>${_('Reduce Stress')}</strong>
                    <br>
                    ${_('You may immediately discard up to ${number} Stress cards from your hand to the discard pile.').replace('${number}', '' + number)}
                `;
            case 'refresh':
                return `
                    <strong>${_('Refresh')}</strong>
                    <br>
                    ${_('You may place this card back on top of your draw deck instead of discarding it, when discarding cards.')}
                `;
            case 'salvage':
                return `
                    <strong>${_('Salvage')}</strong>
                    <br>
                    ${_('You may look through your discard pile and choose up to ${number} cards there. These cards are shuffled into your draw deck.').replace('${number}', '' + number)}
                `;
            case 'scrap':
                return `
                    <strong>${_('Scrap')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${_('Discard the top card of your draw deck ${number} times.').replace('${number}', '' + number)}
                `;
            case 'slipstream':
                return `
                    <strong>${_('Slipstream boost')}</strong>
                    <br>
                    ${_('If you choose to Slipstream, your typical 2 Spaces may be increased by ${number}.').replace('${number}', '' + number)}
                `;
            case 'super-cool':
                return `
                    <strong>${_('Super cool')}</strong>
                    <br>
                    ${_('You may look through your discard pile and remove up to ${number} Heat cards from it. Return these cards to your Engine spot.').replace('${number}', '' + number)}
                    <br>
                    <i>${_('Note: If there are no Heat cards in your discard pile, the symbol is wasted (but you still got to see which cards are there).')}</i>
                `;
            case 'draft':
                return `
                    <strong>${_('Draft')}</strong>
                    <br>
                    ${_('Move your car forward on the race track up to ${number} Spaces.').replace('${number}', '' + number)}
                    <br>
                    <i>${_('Note: All Spaces you move into/through thanks to this symbol must be completely free of other cars and the final landing Space must have at least one car in either Spot of the Space in front of it. This extra movement does not count as speed.')}</i>
                `;
            case 'chain-aspiration':
                return `
                    <strong>${_('Extra Slipstream')}</strong>
                    <br>
                    ${_('It allows for an extra Slipstream move if the previous one puts your car in a new Slipstream position. All bonuses to a Slipstream available for the round will also apply to this extra move.')}
                `;
        }
    }
    getWeatherCardSetupTooltip(type) {
        switch (type) {
            case 0:
                return _('Remove 1 Stress card from your deck.');
            case 1:
                return _('Place 1 extra Heat card in your Engine.');
            case 2:
                return _('Shuffle 1 extra Stress card into your deck.');
            case 3:
                return _('Remove 1 Heat card from your Engine.');
            case 4:
                return _('Shuffle 3 of your Heat cards into your draw deck.');
            case 5:
                return _('Place 3 of your Heat cards into your discard pile.');
        }
    }
    getWeatherCardEffectTooltip(type) {
        switch (type) {
            case 0:
                return `
                    <strong>${_('No cooling')}</strong>
                    <br>
                    ${_('No Cooldown allowed in this sector during the React step.')}
                `;
            case 1:
                return `
                    <strong>${_('No slipstream')}</strong>
                    <br>
                    ${_('You cannot start slipstreaming from this sector (you may slipstream into it).')}
                    `;
            case 2:
            case 5:
                return `<strong>${_('Slipstream boost')}</strong>
                <br>
                ${_('If you choose to Slipstream, you may add 2 extra Spaces to the usual 2 Spaces. Your car must be located in this sector before you slipstream.')}
                `;
            case 3:
            case 4:
                return `<strong>${_('Cooling Bonus')}</strong>
                <br>
                ${_('+1 Cooldown in this sector during the React step.')}
                `;
        }
    }
    getWeatherTokenTooltip(type, cardType) {
        switch (type) {
            case 0:
                return `
                    <strong>${_('Weather')}</strong>
                    <br>
                    ${_('Weather effect applies to this sector:')}
                    <br>
                    ${cardType === null ? _('See the Weather token for the effect.') : this.getWeatherCardEffectTooltip(cardType)}
                `;
            case 1:
                return `
                    <strong>${_('Overheat')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${_('If your Speed is higher than the Speed Limit when you cross this corner, the cost in Heat that you need to pay is increased by one.')}
                `;
            case 2:
                return this.getGarageModuleIconTooltip('adjust', -1);
            case 3:
                return this.getGarageModuleIconTooltip('adjust', 1);
            case 4:
                return `
                    <strong>${_('Heat control')}</strong>
                    <br>
                    ${_('Do not pay Heat to boost in this sector (still max one boost per turn). Your car must be in the sector when you boost.')}
                `;
            case 5:
                return `
                    <strong>${_('Slipstream boost')}</strong>
                    <br>
                    ${_('If you choose to Slipstream, you may add one extra Space to the usual 2 Spaces. Your car must be located in this sector before you slipstream.')}
                `;
        }
    }
    getOrderedPlayers(gamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.no - b.no);
        const playerIndex = players.findIndex((player) => Number(player.id) === this.bga.players.getCurrentPlayerId());
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }
    createPlayerPanels(gamedatas) {
        const constructors = Object.values(gamedatas.constructors);
        constructors
            .filter((constructor) => constructor.ai)
            .forEach((constructor) => {
            document.getElementById('player_boards').insertAdjacentHTML('beforeend', `
            <div id="overall_player_board_${constructor.pId}" class="player-board current-player-board">					
                <div class="player_board_inner" id="player_board_inner_982fff">
                    
                    <div class="emblemwrap" id="avatar_active_wrap_${constructor.id}">
                        <div src="img/gear.png" alt="" class="avatar avatar_active legend_avatar" id="avatar_active_${constructor.id}" style="--constructor-id: ${constructor.id}"></div>
                    </div>
                                               
                    <div class="player-name" id="player_name_${constructor.id}">
                        ${_(constructor.name)}
                    </div>
                    <div id="player_board_${constructor.pId}" class="player_board_content">
                        <div class="player_score">
                            <span id="player_score_${constructor.pId}" class="player_score_value">-</span> <i class="fa fa-star" id="icon_point_${constructor.id}"></i>           
                        </div>
                    </div>
                </div>
            </div>`);
        });
        constructors.forEach((constructor) => {
            let html = constructor.ai
                ? ''
                : `<div class="counters">
                <div id="gear-counter-wrapper-${constructor.id}" class="gear-counter">
                    <div class="gear icon"></div>
                    <span id="gear-counter-${constructor.id}"></span>
                </div>
                <div id="engine-counter-wrapper-${constructor.id}" class="engine-counter">
                    <div class="engine icon"></div>
                    <span id="engine-counter-${constructor.id}"></span>
                </div>
            </div>`;
            html += `
            <div class="counters">
                <div id="speed-counter-wrapper-${constructor.id}" class="speed-counter">
                    <div class="speed icon"></div>
                    <span id="speed-counter-${constructor.id}">-</span>
                </div>
                <div id="corner-counter-wrapper-${constructor.id}" class="corner-counter">
                    <div class="corner icon"></div> 
                    <span id="corner-counter-${constructor.id}"></span>
                </div>
                <div id="lap-counter-wrapper-${constructor.id}" class="lap-counter">
                    <div class="flag icon"></div>
                    <span id="lap-counter-${constructor.id}">-</span> / <span class="nbr-laps">${gamedatas.nbrLaps || '?'}</span>
                </div>
            </div>
            <div class="counters">
                <div>
                    <div id="order-${constructor.id}" class="order-counter ${constructor.speed >= 0 ? 'played' : ''}">
                        ${constructor.no + 1}
                    </div>
                </div>
                <div id="podium-wrapper-${constructor.id}" class="podium-counter">
                    <div class="podium icon"></div>
                    <span id="podium-counter-${constructor.id}"></span>
                </div>
            </div>`;
            dojo.place(html, `player_board_${constructor.pId}`);
            this.setScore(constructor.pId, constructor.score);
            if (!constructor.ai) {
                this.gearCounters[constructor.id] = new ebg.counter();
                this.gearCounters[constructor.id].create(`gear-counter-${constructor.id}`);
                this.gearCounters[constructor.id].setValue(constructor.gear);
                this.engineCounters[constructor.id] = new ebg.counter();
                this.engineCounters[constructor.id].create(`engine-counter-${constructor.id}`);
                this.engineCounters[constructor.id].setValue(Object.values(constructor.engine).length);
            }
            this.speedCounters[constructor.id] = new ebg.counter();
            this.speedCounters[constructor.id].create(`speed-counter-${constructor.id}`);
            this.setSpeedCounter(constructor.id, constructor.speed);
            this.cornerCounters[constructor.id] = new ebg.counter();
            this.cornerCounters[constructor.id].create(`corner-counter-${constructor.id}`);
            this.cornerCounters[constructor.id].setValue(constructor.distanceToCorner);
            this.lapCounters[constructor.id] = new ebg.counter();
            this.lapCounters[constructor.id].create(`lap-counter-${constructor.id}`);
            this.lapCounters[constructor.id].setValue(Math.max(1, Math.min(gamedatas.nbrLaps, constructor.turn + 1)));
            if (constructor.carCell < 0) {
                const eliminated = constructor.turn < this.gamedatas.nbrLaps || Boolean(this.gamedatas.players[constructor.pId]?.zombie);
                this.setRank(constructor.id, -constructor.carCell, eliminated);
                if (eliminated) {
                    this.circuit.setEliminatedPodium(-constructor.carCell);
                }
            }
            if (constructor.canLeave && constructor.id == this.getConstructorId()) {
                this.addLeaveText();
            }
        });
        this.setTooltipToClass('corner-counter', _('Distance to the next corner'));
        this.setTooltipToClass('gear-counter', _('Gear'));
        this.setTooltipToClass('engine-counter', _('Engine cards count'));
        this.setTooltipToClass('speed-counter', _('Speed'));
        this.setTooltipToClass('lap-counter', _('Laps'));
        this.setTooltipToClass('order-counter', _('Player order'));
        this.setTooltipToClass('podium-counter', _('Rank'));
    }
    addLeaveText() {
        if (document.getElementById('leave-text')) {
            return;
        }
        const withAction = !this.gamedatas.players[this.getPlayerId()].eliminated;
        let html = `
        <div id="leave-text"><i class="fa fa-info-circle" aria-hidden="true"></i>
            ${_('You have finished the race.')}`;
        if (withAction) {
            html += `
                <span id="leave-text-action">
                ${_('You can stay to see the end, or you can <leave-button> to start a new one!').replace('<leave-button>', `<button id="leave-button" class="bgabutton bgabutton_blue">${_('Leave the game')}</button>`)}
                </span>`;
        }
        html += `
        </div>
        `;
        document.getElementById('top').insertAdjacentHTML('afterbegin', html);
        if (withAction) {
            document.getElementById('leave-button').addEventListener('click', () => this.actQuitGame());
        }
    }
    createPlayerTables(gamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);
        orderedPlayers.forEach((player) => this.createPlayerTable(gamedatas, Number(player.id)));
        if (gamedatas.isLegend) {
            this.legendTable = new LegendTable(this, gamedatas.legendCard);
        }
    }
    getPlayerConstructor(playerId) {
        return Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == playerId);
    }
    createPlayerTable(gamedatas, playerId) {
        const table = new PlayerTable(this, gamedatas.players[playerId], this.getPlayerConstructor(playerId));
        this.playersTables.push(table);
    }
    getHelpHtml() {
        let html = `
        <div id="help-popin">
            <h1>${_('Mandatory symbols')}</h1>
            ${['heat', 'scrap', 'adjust', 'one-time']
            .map((symbol) => this.getGarageModuleIconTooltipWithIcon(symbol, '#'))
            .join('<br><br>')}

            <h1>${_('Optional symbols')}</h1>
            ${['cooldown', 'slipstream', 'reduce', 'refresh', 'salvage', 'direct', 'accelerate', 'super-cool', 'draft', 'chain-aspiration']
            .map((symbol) => this.getGarageModuleIconTooltipWithIcon(symbol, '#'))
            .join('<br><br>')}

            <h1>${_('Road Conditions Tokens')}</h1>
            <h2>${_('Corner Effects')}</h2>
            ${[3, 2, 1]
            .map((token) => `
                <div>
                    <div class="tooltip-symbol">
                        <div class="weather-token" data-token-type="${token}"></div>
                    </div>
                    ${this.getWeatherTokenTooltip(token, null)}
                </div>
                `)
            .join('<br><br>')}
            <h2>${_('Sector Effects')}</h2>
            ${[4, 5, 0]
            .map((token) => `
                <div>
                    <div class="tooltip-symbol">
                        <div class="weather-token" data-token-type="${token}"></div>
                    </div>
                    ${this.getWeatherTokenTooltip(token, null)}
                </div>
                `)
            .join('<br><br>')}

            <h1>${_('Weather Tokens')}</h1>

            ${[0, 1, 2, 3, 4, 5]
            .map((type) => `
                <div>
                    <div class="tooltip-symbol">
                        <div class="weather-card" data-card-type="${type}"></div>
                    </div>
                    ${this.getWeatherCardSetupTooltip(type)}<br><br>
                    ${this.getWeatherCardEffectTooltip(type)}
                </div>
                `)
            .join('<br><br>')}
        </div>`;
        return html;
    }
    getPossibleSpeeds(selectedCards, args) {
        let speeds = [0];
        selectedCards.forEach((card) => {
            let t = [];
            let cSpeeds = args.speeds[card.id];
            if (!Array.isArray(cSpeeds)) {
                cSpeeds = [cSpeeds];
            }
            cSpeeds.forEach((cSpeed) => {
                speeds.forEach((speed) => {
                    t.push(cSpeed + speed);
                });
            });
            speeds = t;
        });
        return speeds;
    }
    onHandCardSelectionChange(selection) {
        if (this.gamedatas.gamestate.name == 'planification') {
            const privateArgs = this.gamedatas.gamestate.args._private;
            const clutteredHand = privateArgs?.clutteredHand;
            const table = this.getCurrentPlayerTable();
            const gear = table.getCurrentGear();
            const maxGearChange = clutteredHand ? 1 : 2;
            const minAllowed = Math.max(1, gear - maxGearChange);
            const maxAllowed = Math.min(4, gear + maxGearChange);
            let allowed = selection.length >= minAllowed && selection.length <= maxAllowed;
            let useHeat = allowed && Math.abs(selection.length - gear) == 2 ? 1 : 0;
            if (privateArgs?.flooded && selection.length < gear) {
                useHeat++;
            }
            let label = '';
            if (allowed) {
                label = clutteredHand
                    ? _('Unclutter hand with selected cards')
                    : `${_('Play selected cards')} (${_('Gear:')} ${gear} ⇒ ${selection.length} ${formatTextIcons(useHeat > 0 ? `, ${useHeat}[Heat]` : '')})`;
            }
            else {
                label = _('Select between ${min} and ${max} cards').replace('${min}', `${minAllowed}`).replace('${max}', `${maxAllowed}`);
            }
            document.getElementById(`player-table-${table.playerId}-gear`).dataset.gear = `${allowed ? selection.length : gear}`;
            const button = document.getElementById('actPlanification_button');
            if (button) {
                button.innerHTML = label;
                // we let the user able to click, so the back will explain in the error why he can't
                /*if (allowed && useHeat && this.engineCounters[this.getConstructorId()].getValue() == 0) {
                            allowed = false;
                        }*/
                button.classList.toggle('disabled', !allowed);
            }
            this.circuit.removeMapIndicators();
            if (selection.length && privateArgs && !clutteredHand) {
                const totalSpeeds = this.getPossibleSpeeds(selection, privateArgs);
                const stressCardsSelected = selection.some((card) => privateArgs.boostingCardIds.includes(card.id));
                totalSpeeds.forEach((totalSpeed) => this.circuit.addMapIndicator(privateArgs.cells[totalSpeed], undefined, totalSpeed, stressCardsSelected));
            }
        }
        else if (this.gamedatas.gamestate.name == 'discard') {
            const label = _('Discard ${number} selected cards').replace('${number}', `${selection.length}`);
            const buttonDiscard = document.getElementById('actDiscard_button');
            const buttonNoDiscard = document.getElementById('actNoDiscard_button');
            if (buttonDiscard) {
                buttonDiscard.innerHTML = label;
                buttonDiscard.classList.toggle('disabled', !selection.length || selection.length > this.gamedatas.gamestate.args._private.max);
            }
            buttonNoDiscard?.classList.toggle('disabled', selection.length > 0);
        }
        else if (this.gamedatas.gamestate.name == 'swapUpgrade') {
            this.checkSwapUpgradeSelectionState();
        }
        else if (this.gamedatas.gamestate.name == 'snakeDiscard') {
            this.checkSnakeDiscardSelectionState();
        }
    }
    onInPlayCardSelectionChange(selection) {
        if (this.gamedatas.gamestate.name == 'payHeats') {
            const args = this.gamedatas.gamestate.args;
            const selectionHeats = selection.map((card) => args.payingCards[card.id]).reduce((a, b) => a + b, 0);
            document
                .getElementById('actPayHeats_button')
                .classList.toggle('disabled', selectionHeats > args.heatInReserve || selection.length != args.maxPayableCards);
        }
        else if (this.gamedatas.gamestate.name == 'snakeDiscard') {
            this.checkSnakeDiscardSelectionState();
        }
    }
    onMarketSelectionChange(selection) {
        if (this.gamedatas.gamestate.name == 'chooseUpgrade') {
            document.getElementById(`actChooseUpgrade_button`).classList.toggle('disabled', selection.length != 1);
        }
        else if (this.gamedatas.gamestate.name == 'swapUpgrade') {
            this.checkSwapUpgradeSelectionState();
        }
    }
    checkSwapUpgradeSelectionState() {
        const marketSelection = this.market?.getSelection() ?? [];
        const handSelection = this.getCurrentPlayerTable()?.hand?.getSelection() ?? [];
        document
            .getElementById(`actSwapUpgrade_button`)
            .classList.toggle('disabled', marketSelection.length != 1 || handSelection.length != 1);
    }
    checkSnakeDiscardSelectionState() {
        const playerTable = this.getCurrentPlayerTable();
        const inPlaySelection = playerTable?.inplay?.getSelection() ?? [];
        document.getElementById(`actSnakeDiscard_button`)?.classList.toggle('disabled', inPlaySelection.length != 1);
    }
    actSnakeDiscard() {
        const playerTable = this.getCurrentPlayerTable();
        const inPlaySelection = playerTable?.inplay?.getSelection() ?? [];
        this.bga.actions.performAction('actSnakeDiscard', {
            cardId: inPlaySelection[0].id,
        });
    }
    actConsultingMechanics(choice) {
        this.bga.actions.performAction('actConsultingMechanics', {
            choice: choice,
        }, { checkAction: false });
    }
    actCancelConsultingMechanics() {
        this.bga.actions.performAction('actCancelConsultingMechanics', {}, { checkAction: false });
    }
    actChooseUpgrade() {
        this.bga.actions.performAction('actChooseUpgrade', {
            cardId: this.market.getSelection()[0].id,
        });
    }
    actSwapUpgrade() {
        this.bga.actions.performAction('actSwapUpgrade', {
            marketCardId: this.market.getSelection()[0].id,
            ownedCardId: this.getCurrentPlayerTable().hand.getSelection()[0].id,
        });
    }
    actPassSwapUpgrade() {
        this.bga.actions.performAction('actPassSwapUpgrade');
    }
    actPlanification() {
        const selectedCards = this.getCurrentPlayerTable().hand.getSelection();
        this.bga.actions.performAction('actPlan', {
            cardIds: JSON.stringify(selectedCards.map((card) => card.id)),
        });
    }
    actCancelSelection() {
        this.bga.actions.performAction('actCancelSelection', undefined, { checkAction: false });
    }
    actChooseSpeed(speed, choice) {
        this.bga.actions.performAction('actChooseSpeed', {
            speed,
            choice: JSON.stringify(choice),
        });
    }
    actSlipstream(speed) {
        this.bga.actions.performAction('actSlipstream', {
            speed,
        });
    }
    actPassReact() {
        this.bga.actions.performAction('actPassReact');
    }
    actPassOldReact() {
        this.bga.actions.performAction('actPassOldReact');
    }
    actCryCauseNotEnoughHeatToPay() {
        this.bga.actions.performAction('actCryCauseNotEnoughHeatToPay');
    }
    actReact(symbol, entries, n) {
        this.bga.actions.performAction('actReact', {
            symbol,
            entries: JSON.stringify(entries),
            n,
        });
    }
    actOldReact(symbol, arg) {
        this.bga.actions.performAction('actOldReact', {
            symbol,
            arg,
        });
    }
    actRefresh(cardId) {
        this.bga.actions.performAction('actRefresh', {
            cardId,
        });
    }
    actPayHeats(selectedCards) {
        this.bga.actions.performAction('actPayHeats', {
            cardIds: JSON.stringify(selectedCards.map((card) => card.id)),
        });
    }
    actCheckCorner() {
        this.bga.actions.performAction('actCheckCorner', {});
    }
    actDiscard(selectedCards) {
        this.bga.actions.performAction('actDiscard', {
            cardIds: JSON.stringify(selectedCards.map((card) => card.id)),
        });
    }
    actSalvage() {
        const selectedCards = this.market.getSelection();
        this.bga.actions.performAction('actSalvage', {
            cardIds: JSON.stringify(selectedCards.map((card) => -card.id)),
        });
    }
    actSuperCool(n) {
        this.bga.actions.performAction('actSuperCool', {
            n,
        });
    }
    actConfirmResults() {
        this.bga.actions.performAction('actConfirmResults');
    }
    actQuitGame() {
        this.bga.actions.performAction('actQuitGame', undefined, { checkAction: false });
    }
    actGiveUp() {
        this.bga.actions.performAction('actGiveUp');
    }
    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications
    /*
          setupNotifications:
  
          In this method, you associate each of your game notifications with your local method to handle it.
  
          Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                  your pylos.game.php file.
  
      */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );
        dojo.connect(this.bga.gameui.notifqueue, 'addToLog', () => {
            this.addLogClass();
        });
        const notifs = [
            'message',
            'loadCircuit',
            'clean',
            'newMarket',
            'chooseUpgrade',
            'swapUpgrade',
            'endDraftRound',
            'reformingDeckWithUpgrades',
            'updatePlanification',
            'updateSnakeDiscard',
            'reveal',
            'moveCar',
            'updateTurnOrder',
            'payHeats',
            'adrenaline',
            'spinOut',
            'refresh',
            'discard',
            'pDiscard',
            'snakeDiscard',
            'eventRemoveHeat',
            'draw',
            'pDraw',
            'mulligan',
            'pMulligan',
            'updateConsultingMechanics',
            'clearPlayedCards',
            'cooldown',
            'finishTurn',
            'finishRace',
            'endOfRace',
            'newLegendCard',
            'scrapCards',
            'resolveBoost',
            'accelerate',
            'salvageCards',
            'superCoolCards',
            'directPlay',
            'eliminate',
            'newChampionshipRace',
            'startRace',
            'setupRace',
            'clutteredHand',
            'playerEliminated',
            'cryCauseNotEnoughHeatToPay',
            'setWeather',
            'clearTurn',
            'refreshUI',
            'refreshHand',
        ];
        notifs.forEach((notifName) => {
            dojo.subscribe(notifName, this, (notifDetails) => {
                log(`notif_${notifName}`, notifDetails.args);
                if (notifName === 'playerEliminated') {
                    return;
                }
                const promise = this[`notif_${notifName}`](notifDetails.args);
                const promises = promise ? [promise] : [];
                let minDuration = 1;
                let msg = this.bga.gameui.format_string_recursive(notifDetails.log, notifDetails.args);
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    const multiactivestates = ['snakeDiscard', 'planification', 'uploadCircuit', 'confirmEndOfRace', 'consultingMechanics'];
                    if (!multiactivestates.includes(this.getGameStateName()) ||
                        (notifDetails.args.constructor_id && notifDetails.args.constructor_id == this.getConstructorId())) {
                        $('pagemaintitletext').innerHTML = msg;
                        $('generalactions').innerHTML = '';
                        $('restartAction').innerHTML = '';
                    }
                    // If there is some text, we let the message some time, to be read
                    minDuration = MIN_NOTIFICATION_MS;
                }
                // tell the UI notification ends, if the function returned a promise.
                if (this.animationManager.animationsActive()) {
                    Promise.all([...promises, this.bga.gameui.wait(minDuration)]).then(() => this.bga.gameui.notifqueue.onSynchronousNotificationEnd());
                }
                else {
                    this.bga.gameui.notifqueue.setSynchronousDuration(0);
                }
            });
            if (notifName !== 'playerEliminated') {
                this.bga.gameui.notifqueue.setSynchronous(notifName, undefined);
            }
        });
        if (isDebug) {
            notifs.forEach((notifName) => {
                if (!this[`notif_${notifName}`]) {
                    console.warn(`notif_${notifName} function is not declared, but listed in setupNotifications`);
                }
            });
            Object.getOwnPropertyNames(Game.prototype)
                .filter((item) => item.startsWith('notif_'))
                .map((item) => item.slice(6))
                .forEach((item) => {
                if (!notifs.some((notifName) => notifName == item)) {
                    console.warn(`notif_${item} function is declared, but not listed in setupNotifications`);
                }
            });
        }
        /*this.bga.gameui.notifqueue.setIgnoreNotificationCheck('discard', (notif: Notif<any>) =>
                this.getPlayerIdFromConstructorId(notif.args.constructor_id) == this.getPlayerId() && notif.args.n
            );*/
        this.bga.gameui.notifqueue.setIgnoreNotificationCheck('draw', (notif) => this.getPlayerIdFromConstructorId(notif.args.constructor_id) == this.getPlayerId());
        this.bga.gameui.notifqueue.setIgnoreNotificationCheck('mulligan', (notif) => this.getPlayerIdFromConstructorId(notif.args.constructor_id) == this.getPlayerId());
    }
    notif_message() {
        // just to log them on the title bar
    }
    notif_loadCircuit(args) {
        const { circuit } = args;
        document.getElementById(`circuit-dropzone-container`)?.remove();
        //document.querySelectorAll('.nbr-laps').forEach(elem => elem.innerHTML == `${circuit.}`)
        this.circuit.loadCircuit(circuit);
    }
    async notif_clean(args) {
        const { counters } = args;
        this.playersTables.forEach((playerTable) => {
            playerTable.hand?.removeAll();
            playerTable.inplay.removeAll();
            playerTable.discard.removeAll();
            playerTable.discard.setCardNumber(0);
            playerTable.engine.removeAll();
            playerTable.engine.setCardNumber(0);
            playerTable.deck.removeAll();
            playerTable.deck.setCardNumber(counters[playerTable.constructorId].deckCount);
        });
    }
    notif_newMarket(args) {
        const { upgrades } = args;
        if (upgrades) {
            this.playersTables.forEach((playerTable) => {
                const playerUpdates = upgrades.filter((card) => card.location == `deck-${playerTable.constructorId}`);
                playerTable.deck.addCards(playerUpdates, undefined, {
                    autoUpdateCardNumber: false,
                    autoRemovePreviousCards: false,
                });
                playerTable.inplay.addCards(playerUpdates);
            });
        }
    }
    notif_chooseUpgrade(args) {
        const { constructor_id, card } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        this.getPlayerTable(playerId).inplay.addCard(card);
    }
    notif_swapUpgrade(args) {
        const { constructor_id, card, card2 } = args;
        this.market?.addCard(card2);
        if (constructor_id == this.getConstructorId()) {
            this.getCurrentPlayerTable().inplay.addCard(card);
        }
        else {
            this.market?.addCard(card);
        }
    }
    notif_endDraftRound() {
        this.market?.removeAll();
    }
    notif_reformingDeckWithUpgrades() {
        this.market?.remove();
        this.market = null;
        const currentPlayerTable = this.getCurrentPlayerTable();
        if (currentPlayerTable?.hand) {
            currentPlayerTable.deck.addCards(currentPlayerTable.hand.getCards().map((card) => ({ id: card.id })), undefined, {
                autoUpdateCardNumber: false,
            }, 100);
            // currentPlayerTable.hand.removeAll();
        }
        const nbCards = this.gamedatas.championship ? 1 : 3;
        this.playersTables.forEach((playerTable) => {
            playerTable.inplay.removeAll();
            playerTable.deck.setCardNumber(playerTable.deck.getCardNumber() + nbCards);
        });
    }
    async notif_updatePlanification(args) {
        this.updatePlannedCards(args.args._private.selection);
        const mulliganBtn = document.getElementById('mulligan-btn');
        if (mulliganBtn && !args.args._private.canMulligan) {
            mulliganBtn.remove();
        }
        this.gamedatas.gamestate.args = args.args;
        this.onUpdateActionButtons('planification', args.args);
        this.onEnteringPlanification(args.args);
        this.changePageTitle();
    }
    async notif_updateSnakeDiscard(args) {
        this.updateDiscardDraftCard(args.args._private.choice);
        this.gamedatas.gamestate.args = args.args;
        this.onEnteringSnakeDiscard(args.args);
    }
    async notif_updateConsultingMechanics(args) {
        this.gamedatas.gamestate.args = args.args;
        this.onEnteringConsultingMechanics(args.args);
    }
    async notif_reveal(args) {
        const { constructor_id, gear, heats } = args;
        if (constructor_id === this.getConstructorId()) {
            this.updatePlannedCards([]);
        }
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.setCurrentGear(gear);
        this.gearCounters[constructor_id].toValue(gear);
        if (heats) {
            await this.payHeats(constructor_id, heats);
        }
        const cards = Object.values(args.cards);
        await playerTable.setInplay(cards);
    }
    async notif_moveCar(args) {
        const { constructor_id, cell, path, totalSpeed, progress, distanceToCorner } = args;
        const isAi = this.gamedatas.constructors[constructor_id].ai;
        this.setSpeedCounter(constructor_id, totalSpeed);
        this.championshipTable?.setRaceProgress(progress);
        await this.circuit.moveCar(constructor_id, cell, path, isAi ? path.length : totalSpeed);
        this.cornerCounters[constructor_id]?.setValue(distanceToCorner);
        if (isAi) {
            const orderCounter = document.getElementById(`order-${constructor_id}`);
            orderCounter.classList.add('played');
            this.circuit.removeMapPaths();
        }
    }
    notif_updateTurnOrder(args) {
        const { constructor_ids } = args;
        constructor_ids.forEach((constructorId, index) => {
            const orderCounter = document.getElementById(`order-${constructorId}`);
            orderCounter.innerHTML = `${index + 1}`;
            orderCounter.classList.remove('played');
            this.setSpeedCounter(constructorId, -1);
        });
    }
    async payHeats(constructorId, cards) {
        const playerId = this.getPlayerIdFromConstructorId(constructorId);
        const playerTable = this.getPlayerTable(playerId);
        this.engineCounters[constructorId]?.incValue(-cards.length);
        await playerTable.payHeats(cards);
    }
    async notif_payHeats(args) {
        const { constructor_id, cards, corner } = args;
        this.circuit.showCorner(corner, 'darkorange');
        await this.payHeats(constructor_id, Object.values(cards));
        return true;
    }
    notif_adrenaline(args) {
        const { constructor_id } = args;
        this.speedCounters[constructor_id].incValue(1);
    }
    async notif_spinOut(args) {
        const { constructor_id, cards, corner, cell, stresses, nCellsBack } = args;
        this.circuit.showCorner(corner, 'red');
        await this.payHeats(constructor_id, Object.values(cards));
        if (this.animationManager.animationsActive()) {
            await this.circuit.spinOutWithAnimation(constructor_id, cell, nCellsBack);
        }
        else {
            this.circuit.moveCar(constructor_id, cell);
        }
        this.cornerCounters[constructor_id].toValue(0);
        this.gearCounters[constructor_id].toValue(1);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        this.getPlayerTable(playerId).setCurrentGear(1);
        await playerTable.spinOut(stresses);
        return true;
    }
    getPlayerIdFromConstructorId(constructorId) {
        return this.gamedatas.constructors[constructorId]?.pId;
    }
    notif_draw(args) {
        const { constructor_id, areSponsors, deckCount } = args;
        const n = Number(args.n);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.drawCardsPublic(n, areSponsors, deckCount);
    }
    async notif_mulligan(args) {
        const { constructor_id, heat } = args;
        this.payHeats(constructor_id, [heat]);
    }
    async notif_refresh(args) {
        const { constructor_id, card } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        await playerTable.deck.addCard({ id: card.id }, undefined, {
            autoRemovePreviousCards: false,
        });
        await playerTable.deck.removeCard(card, {
            autoUpdateCardNumber: false,
        });
        playerTable.deck.setCardNumber(playerTable.deck.getCardNumber()); // to make sure fake card is set
    }
    notif_discard(args) {
        const { constructor_id, cards } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.discard.addCards(Object.values(cards));
    }
    notif_snakeDiscard(args) {
        const { constructor_id, card } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.inplay.removeCard(card);
    }
    async notif_eventRemoveHeat(args) {
        const { constructor_id, card } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        const location = card.location.split('-')[0];
        switch (location) {
            case 'engine':
                const engineCountBefore = playerTable.engine.getCardNumber();
                await playerTable.engine.removeCard(card);
                playerTable.engine.setCardNumber(engineCountBefore - 1);
                this.engineCounters[constructor_id].incValue(-1);
                break;
            case 'hand':
                await playerTable.hand.removeCard(card);
                break;
            case 'deck':
                playerTable.deck.setCardNumber(playerTable.deck.getCardNumber() - 1);
                break;
            case 'discard':
                const diqscardCountBefore = playerTable.discard.getCardNumber();
                await playerTable.discard.removeCard(card);
                playerTable.discard.setCardNumber(diqscardCountBefore - 1);
                break;
        }
    }
    notif_pDraw(args) {
        const { constructor_id, areSponsors, deckCount } = args;
        const cards = Object.values(args.cards);
        //const planificationArgs = this.gamedatas.gamestate.args as EnteringPlanificationArgs;
        //planificationArgs._private.canMulligan = false;
        const playerTable = this.getCurrentPlayerTable();
        playerTable.drawCardsPrivate(cards, areSponsors, deckCount);
    }
    async notif_pMulligan(args) {
        const { constructor_id, deckCount, heat } = args;
        const cards = Object.values(args.cards);
        this.gamedatas.gamestate.args._private.cards = cards;
        const playerTable = this.getCurrentPlayerTable();
        await playerTable.hand.removeAll();
        await this.payHeats(constructor_id, [heat]);
        await playerTable.drawCardsPrivate(cards, true, deckCount);
    }
    notif_pDiscard(args) {
        const { constructor_id } = args;
        const cards = Object.values(args.cards);
        this.getCurrentPlayerTable().discard.addCards(cards);
    }
    async notif_clearPlayedCards(args) {
        const { constructor_id, cardIds, sponsorIds } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        await playerTable.clearPlayedCards(cardIds, sponsorIds);
        const orderCounter = document.getElementById(`order-${constructor_id}`);
        orderCounter.classList.add('played');
        this.circuit.removeMapPaths();
    }
    notif_cooldown(args) {
        const { constructor_id, cards } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.cooldown(cards);
        this.engineCounters[constructor_id]?.incValue(cards.length);
    }
    async notif_finishTurn(args) {
        const { constructor_id, n, lap } = args;
        this.lapCounters[constructor_id].toValue(Math.min(n, lap));
    }
    async notif_finishRace(args, eliminated = false) {
        const { constructor_id, pos, canLeave } = args;
        if (this.animationManager.animationsActive()) {
            await this.circuit.finishRace(constructor_id, pos);
        }
        else {
            const carCell = -pos;
            this.circuit.moveCar(constructor_id, carCell);
        }
        this.setRank(constructor_id, pos, eliminated);
        if (eliminated) {
            this.circuit.setEliminatedPodium(pos);
        }
        if (canLeave && constructor_id == this.getConstructorId()) {
            this.addLeaveText();
        }
    }
    setScore(playerId, score) {
        const counter = this.bga.playerPanels.getScoreCounter(playerId);
        if (counter) {
            counter.toValue(score);
        }
        else {
            document.getElementById(`player_score_${playerId}`).innerText = `${score}`;
        }
    }
    setSpeedCounter(constructorId, speed) {
        if (this.speedCounters[constructorId] && speed >= 0) {
            this.speedCounters[constructorId].toValue(speed);
        }
        else {
            document.getElementById(`speed-counter-${constructorId}`).innerText = `${speed >= 0 ? speed : '-'}`;
        }
    }
    notif_endOfRace(args) {
        this.notif_updateTurnOrder({
            constructor_ids: args.order,
        });
        this.gamedatas.scores = args.scores;
        Object.values(this.gamedatas.constructors).forEach((constructor) => this.setScore(this.getPlayerIdFromConstructorId(constructor.id), Object.values(args.scores)
            .map((circuitScores) => circuitScores[constructor.id])
            .reduce((a, b) => a + b)));
    }
    notif_newLegendCard(args) {
        return this.legendTable.newLegendCard(args.card);
    }
    notif_scrapCards(args) {
        const { constructor_id, cards, deckCount } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).scrapCards(Object.values(cards), deckCount);
    }
    notif_resolveBoost(args) {
        const { constructor_id, cards, card, deckCount } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).resolveBoost(Object.values(cards), card, deckCount);
    }
    notif_accelerate(args) { }
    notif_salvageCards(args) {
        const { constructor_id, cards, discard, deckCount } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).salvageCards(Object.values(cards), Object.values(discard), deckCount);
    }
    notif_superCoolCards(args) {
        const { constructor_id, cards, discard } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        this.engineCounters[constructor_id]?.incValue(Object.values(cards).length);
        return this.getPlayerTable(playerId).superCoolCards(Object.values(cards), Object.values(discard));
    }
    notif_directPlay(args) {
        const { constructor_id, card } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).inplay.addCard(card);
    }
    async notif_eliminate(args) {
        const { cell, giveUp } = args;
        await this.notif_finishRace({
            ...args,
            pos: -cell,
        }, !giveUp);
    }
    async notif_newChampionshipRace(args) {
        const { index, circuitDatas } = args;
        this.championshipTable.newChampionshipRace(index);
        this.circuit.newCircuit(circuitDatas);
        const playerBoards = document.getElementById(`player_boards`);
        this.lapCounters.forEach((counter) => counter.setValue(1));
        playerBoards.querySelectorAll('.finished').forEach((elem) => elem.classList.remove('finished'));
        playerBoards.querySelectorAll('.played').forEach((elem) => elem.classList.remove('played'));
        playerBoards.querySelectorAll('.nbr-laps').forEach((elem) => (elem.innerHTML = `${args.nbrLaps}`));
        Object.entries(args.distancesToCorners).forEach(([constructorId, distance]) => {
            this.cornerCounters[constructorId].setValue(distance);
        });
    }
    async notif_startRace(args) {
        const { cells, weather } = args;
        Object.entries(cells).forEach(([constructor_id, cell]) => this.circuit.moveCar(Number(constructor_id), cell));
        this.circuit.createWeather(weather);
    }
    async notif_setupRace(args) {
        Object.entries(args.counters).forEach(([constructor_id, counters]) => {
            const table = this.getPlayerTable(this.getPlayerIdFromConstructorId(Number(constructor_id)));
            if (table) {
                table.inplay.removeAll();
                table.deck.setCardNumber(counters?.deckCount);
                this.engineCounters[constructor_id].setValue(Object.values(counters.engine).length);
                table.engine.removeAll();
                table.engine.addCards(Object.values(counters.engine));
                table.discard.removeAll();
                table.discard.addCards(Object.values(counters.discard));
                this.gearCounters[constructor_id].setValue(1);
                table.setCurrentGear(1);
            }
        });
    }
    notif_clutteredHand(args) {
        const { constructor_id } = args;
        this.gearCounters[constructor_id].toValue(1);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        this.getPlayerTable(playerId).setCurrentGear(1);
    }
    notif_playerEliminated(args) {
        const { who_quits } = args;
        if (who_quits == this.getPlayerId()) {
            document.getElementById('leave-text-action')?.remove();
        }
    }
    notif_cryCauseNotEnoughHeatToPay(args) {
        const { constructor_id, cell, turn, distance } = args;
        this.circuit.removeMapPaths();
        this.circuit.removeCornerHeatIndicators();
        this.circuit.moveCar(constructor_id, cell, undefined, -1);
        this.lapCounters[constructor_id]?.setValue(Math.max(1, Math.min(this.gamedatas.nbrLaps, turn + 1)));
        this.cornerCounters[constructor_id]?.setValue(distance);
    }
    notif_setWeather(args) {
        const { weather } = args;
        this.circuit.createWeather(weather);
    }
    setRank(constructorId, pos, eliminated) {
        const playerId = this.getPlayerIdFromConstructorId(constructorId);
        document.getElementById(`overall_player_board_${playerId}`).classList.add('finished');
        document.getElementById(`podium-wrapper-${constructorId}`).classList.add('finished');
        document.getElementById(`podium-counter-${constructorId}`).innerHTML = `${eliminated ? '❌' : pos}`;
    }
    onClick(elem, callback) {
        if (!elem.classList.contains('click-binded')) {
            elem.addEventListener('click', callback);
            elem.classList.add('click-binded');
        }
    }
    undoToStep(stepId, e) {
        if (e?.target?.parentElement?.classList.contains('cancel')) {
            return;
        }
        //this.stopActionTimer();
        this.bga.actions.performAction('actUndoToStep', { stepId } /*, false*/);
    }
    notif_clearTurn(args) {
        this.cancelLogs(args.notifIds);
    }
    notif_refreshUI(args) {
        Object.entries(args.datas.constructors).forEach(([constructorIdStr, constructor]) => {
            const constructorId = Number(constructorIdStr);
            this.circuit.refreshUI(constructor);
            if (!constructor.ai) {
                this.gearCounters[constructor.id].setValue(constructor.gear);
                this.engineCounters[constructor.id].setValue(Object.values(constructor.engine).length);
            }
            this.setSpeedCounter(constructor.id, constructor.speed);
            this.cornerCounters[constructor.id].setValue(constructor.distanceToCorner);
            this.lapCounters[constructor.id].setValue(Math.max(1, Math.min(this.gamedatas.nbrLaps, constructor.turn + 1)));
            const playerId = this.getPlayerIdFromConstructorId(constructorId);
            if (playerId > 0) {
                this.getPlayerTable(playerId).refreshUI(constructor);
            }
        });
        this.championshipTable?.setRaceProgress(args.datas.progress);
        Object.values(this.gamedatas.constructors).forEach((constructor) => this.setScore(this.getPlayerIdFromConstructorId(constructor.id), Object.values(args.datas.scores)
            .map((circuitScores) => circuitScores[constructor.id])
            .reduce((a, b) => a + b, 0)));
    }
    notif_refreshHand(args) {
        const { constructor_id, hand } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).refreshHand(hand);
    }
    cancelLogs(notifIds) {
        notifIds.forEach((uid) => {
            if (this._notif_uid_to_log_id.hasOwnProperty(uid)) {
                let logId = this._notif_uid_to_log_id[uid];
                if ($('log_' + logId)) {
                    dojo.addClass('log_' + logId, 'cancel');
                }
            }
            if (this._notif_uid_to_mobile_log_id.hasOwnProperty(uid)) {
                let mobileLogId = this._notif_uid_to_mobile_log_id[uid];
                if ($('dockedlog_' + mobileLogId)) {
                    dojo.addClass('dockedlog_' + mobileLogId, 'cancel');
                }
            }
        });
    }
    addLogClass() {
        if (this._last_notif == null) {
            return;
        }
        let notif = this._last_notif;
        let type = notif.msg.type;
        if (type == 'history_history') {
            type = notif.msg.args.originalType;
        }
        if ($('log_' + notif.logId)) {
            dojo.addClass('log_' + notif.logId, 'notif_' + type);
            var methodName = 'onAdding' + type.charAt(0).toUpperCase() + type.slice(1) + 'ToLog';
            if (this[methodName]) {
                setTimeout(() => this[methodName](notif), 50);
            }
        }
        if ($('dockedlog_' + notif.mobileLogId)) {
            dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
        }
    }
    onAddingNewUndoableStepToLog(notif) {
        if (!$(`log_${notif.logId}`)) {
            return;
        }
        let stepId = notif.msg.args.stepId;
        $(`log_${notif.logId}`).dataset.step = stepId;
        if ($(`dockedlog_${notif.mobileLogId}`)) {
            $(`dockedlog_${notif.mobileLogId}`).dataset.step = stepId;
        }
        //console.warn('onAddingNewUndoableStepToLog', stepId, this.gamedatas?.gamestate?.args, notif);
        if (this.gamedatas?.gamestate?.args?.undoableSteps?.includes(parseInt(stepId))) {
            this.onClick($(`log_${notif.logId}`), (e) => this.undoToStep(stepId, e));
            if ($(`dockedlog_${notif.mobileLogId}`)) {
                this.onClick($(`dockedlog_${notif.mobileLogId}`), (e) => this.undoToStep(stepId, e));
            }
        }
    }
    coloredConstructorName(constructorName) {
        return `<span style="font-weight: bold; color: #${CONSTRUCTORS_COLORS[Object.values(this.gamedatas.constructors).find((constructor) => constructor.name == constructorName).id]}">${_(constructorName)}</span>`;
    }
    cardImageHtml(card, args) {
        const constructorId = args.constructor_id ??
            Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId())?.id;
        return `<div class="log-card-image" style="--personal-card-background-y: ${(constructorId * 100) / 8}%;" data-symbols="${card.type < 100 ? Object.keys(card.symbols).length : 0}">${this.cardsManager.getHtml(card)}</div>`;
    }
    cardsImagesHtml(cards, args) {
        return Object.values(cards)
            .map((card) => this.cardImageHtml(card, args))
            .join('');
    }
    formatArgCardImage(args, argName, argImageName) {
        if (args[argImageName] === '' && args[argName]) {
            const reshuffle = `<div>${_('(discard is reshuffled to the deck)')}</div>`;
            args[argImageName] =
                `${args[argName].isReshuffled ? reshuffle : ''}<div class="log-card-set">${this.cardImageHtml(args[argName], args)}</div>`;
        }
    }
    formatArgCardsImages(args, argName, argImageName) {
        if (args[argImageName] === '' && args[argName]) {
            const cards = Object.values(args[argName]);
            const shuffleIndex = cards.findIndex((card) => card.isReshuffled);
            if (shuffleIndex === -1) {
                args[argImageName] = `<div class="log-card-set">${this.cardsImagesHtml(Object.values(cards), args)}</div>`;
            }
            else {
                const cardsBefore = cards.slice(0, shuffleIndex);
                const cardsAfter = cards.slice(shuffleIndex);
                const reshuffle = `<div>${_('(discard is reshuffled to the deck)')}</div>`;
                args[argImageName] = `
                <div class="log-card-set">${this.cardsImagesHtml(cardsBefore, args)}</div>
                ${reshuffle}
                <div class="log-card-set">${this.cardsImagesHtml(cardsAfter, args)}</div>
                `;
            }
        }
    }
    /* This enable to inject translatable styled things to logs or action bar */
    bgaFormatText(log, args) {
        try {
            if (log && args && !args.processed) {
                this.formatArgCardImage(args, 'card', 'card_image');
                this.formatArgCardImage(args, 'card2', 'card_image2');
                this.formatArgCardsImages(args, 'cards', 'cards_images');
                this.formatArgCardsImages(args, 'cards2', 'cards_images2');
                if (args.finishIcon === '') {
                    args.finishIcon = `<div class="flag icon"></div>`;
                }
                let constructorKeys = Object.keys(args).filter((key) => key.substring(0, 16) == 'constructor_name');
                constructorKeys
                    .filter((key) => args[key][0] != '<')
                    .forEach((key) => {
                    args[key] = this.coloredConstructorName(args[key]);
                });
                log = formatTextIcons(_(log));
                args.processed = true;
            }
        }
        catch (e) {
            console.error(log, args, 'Exception thrown', e.stack);
        }
        return { log, args };
    }
}

export { Game };
