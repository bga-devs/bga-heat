interface Card {
    id: string;
    location: string;
    state: string;
    type: string;
}

//console.log(Object.values(CARDS_DATA).map(card => card.startingSpace));

class CardsManager extends CardManager<Card> {
    constructor (public game: HeatGame) {
        super(game, {
            getId: (card) => `personal-card-${card.id}`,
            setupDiv: (card: Card, div: HTMLElement) => {
                div.classList.add('personal-card');
                div.dataset.cardId = ''+card.id;
            },
            setupFrontDiv: (card: Card, div: HTMLElement) => this.setupFrontDiv(card, div),
            isCardVisible: card => Boolean(card.type),
            cardWidth: 163,
            cardHeight: 228,
            animationManager: game.animationManager,
        });
    }

    private setupFrontDiv(card: Card, div: HTMLElement, ignoreTooltip: boolean = false) { 
        const type = Number(card.type);
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

        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    private getTooltip(card: Card): string {
        /*const typeLetter = card.id.substring(0, 1);

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
        `;*/
        const message = 'TODO';
 
        return message;
    }

    public getFullCard(card: Card): Card {
        return {
            ...CARDS_DATA[card.id],
            id: card.id,
            location: card.location,
            knowledge: card.knowledge,
        };
    }

    public getFullCards(cards: Card[]): Card[] {
        return cards; // TODO?
        //return cards.map(card => this.getFullCard(card));
    }

    public getFullCardById(id: string): Card {
        return {
            ...CARDS_DATA[id],
            id,
        };
    }

    public getFullCardsByIds(ids: string[]): Card[] {
        return ids.map(id => this.getFullCardById(id));
    }
}