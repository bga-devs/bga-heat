interface BuilderCard {
    id: string;
    location: string;
    state;
    pId: number;

    number: number;
    name: string;
    text: string[];
    country: string;
    startingSpace: number;
    initialKnowledge: string;
    victoryPoint: string;
    discard: number;
    locked: boolean;
    activation: string;
    effect: string[];

    knowledge?: number;
}

const CARD_COLORS = {
  'A': '#734073',
  'C': '#d66b2a',
  'M': '#4a82a3',
  'P': '#87a04f',
};

//console.log(Object.values(CARDS_DATA).map(card => card.startingSpace));

class BuilderCardsManager extends CardManager<BuilderCard> {
    constructor (public game: HeatGame) {
        super(game, {
            getId: (card) => `builder-card-${card.id}`,
            setupDiv: (card: BuilderCard, div: HTMLElement) => {
                div.classList.add('builder-card');
                div.dataset.cardId = ''+card.id;
            },
            setupFrontDiv: (card: BuilderCard, div: HTMLElement) => this.setupFrontDiv(card, div),
            isCardVisible: card => Boolean(card.number),
            cardWidth: 163,
            cardHeight: 228,
            animationManager: game.animationManager,
        });
    }

    private setupFrontDiv(card: BuilderCard, div: HTMLElement, ignoreTooltip: boolean = false) { 
        const typeLetter = card.id.substring(0, 1);
        div.style.setProperty('--card-color', CARD_COLORS[typeLetter]);
        /*
        div.dataset.type = ''+card.type;
        div.dataset.number = ''+card.number;*/
        const backgroundPositionX = ((card.number - 1) % 6) * 100 / 5;
        const backgroundPositionY = Math.floor((card.number - 1) / 6) * 100 / 5;
        let html = `
        <div id="${card.id}-tokens" class="background" data-type="${typeLetter}" style="background-position: ${backgroundPositionX}% ${backgroundPositionY}%"></div>
        <div class="type-box" data-type="${typeLetter}">
            <div class="type" data-type="${typeLetter}">
                <div class="type-icon"></div>
            </div>
        `;

        if (card.startingSpace) {
            html += `<div class="starting-space">${card.startingSpace}</div>`;
        }
        html += `</div>`;

        // TODO TEMP
        html += `<div class="implemented" data-implemented="${card.implemented?.toString() ?? 'false'}"></div>`;

        if (card.discard) {
            html += `
            <div class="discard">
                <div class="discard-text">${card.discard}</div>
                <div class="discard-icon"></div>
            </div>`;
        } else if (card.locked) {
            html += `
            <div class="discard">
                <div class="lock-icon"></div>
            </div>`;
        }

        html += `
        <div class="center-box">
            <div class="activation-box"></div>
            <div class="line bottom"></div>
            <div class="line top"></div>
            <div class="line middle"></div>`;
        if (typeLetter != 'A') {
            html += `
            <div class="center-zone">
                <div class="initial-knowledge">${card.initialKnowledge ?? ''}</div>
                <div class="knowledge-icon"></div>
                <div class="victory-point">${card.victoryPoint ?? ''}</div>
                <div class="vp-icon"></div>
            </div>
            `;
        }
        html += `
            <div class="activation" data-type="${card.activation}"></div>
        </div>
        <div class="name-box">
            <div class="name">
                ${card.name ?? ''}
                <div class="country">${card.country ?? ''}</div>
            </div>
        </div>
        <div class="effect">${card.effect?.map(text => formatTextIcons(text)).join(`<br>`) ?? ''}</div>
        `;

        div.innerHTML = html;

        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    private getType(cardId: string) {
        const typeLetter = cardId.substring(0, 1);
        switch (typeLetter) {
            case 'C': return _('City');
            case 'M': return _('Megalith');
            case 'P': return _('Pyramid');
            case 'A': return _('Artifact');
        }
    }

    private getTooltip(card: BuilderCard): string {
        const typeLetter = card.id.substring(0, 1);

        let message = `
        <strong>${card.name}</strong>
        <br>
        <i>${card.country}</i>
        <br>
        <br>
        <strong>${_("Type:")}</strong> ${this.getType(card.id)}
        `;
        if (card.startingSpace) {
            message += `
            <br>
            <strong>${_("Starting space:")}</strong> ${card.startingSpace}
            `;
        }
        if (card.discard) {
            message += `
            <br>
            <strong>${_("Discard cards:")}</strong> ${card.discard}
            `;
        }
        if (card.locked) {
            message += `
            <br>
            <strong>${_("Locked card")}</strong>
            `;
        }
        if (typeLetter != 'A') {
            message += `
            <br>
            <strong>${_("Initial knowledge:")}</strong> ${card.initialKnowledge}
            <br>
            <strong>${_("Victory point:")}</strong> ${card.victoryPoint}
            `;
        }
        message += `
        <br>
        <strong>${_("Activation:")}</strong> ${this.game.getTooltipActivation(card.activation)}
        <br>
        <br>
        <strong>${_("Effect:")}</strong> ${card.effect?.map(text => formatTextIcons(text)).join(`<br>`) ?? ''}
        `;
 
        return message;
    }

    public getFullCard(card: BuilderCard): BuilderCard {
        return {
            ...CARDS_DATA[card.id],
            id: card.id,
            location: card.location,
            knowledge: card.knowledge,
        };
    }

    public getFullCards(cards: BuilderCard[]): BuilderCard[] {
        return cards.map(card => this.getFullCard(card));
    }

    public getFullCardById(id: string): BuilderCard {
        return {
            ...CARDS_DATA[id],
            id,
        };
    }

    public getFullCardsByIds(ids: string[]): BuilderCard[] {
        return ids.map(id => this.getFullCardById(id));
    }
}