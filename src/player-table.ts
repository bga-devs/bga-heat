const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

const PERSONAL_CARDS_SORTING = (a: Card, b: Card) => Number(a.type) - Number(b.type);



function manualPositionFitUpdateDisplay(element: HTMLElement, cards: Card[], lastCard: Card, stock: ManualPositionStock<Card>) {
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

        cardDiv.style.left = `${ cardLeft - CARD_WIDTH / 2 }px`;
    });
}

// new ManualPositionStock(cardsManager, document.getElementById('manual-position-fit-stock'), undefined, manualPositionFitUpdateDisplay);
class InPlayStock extends ManualPositionStock<Card> {
    private playerId: number;

    constructor(game: HeatGame, constructor: Constructor, ) {
        super(game.cardsManager, document.getElementById(`player-table-${constructor.pId}-inplay`), {
            sort: PERSONAL_CARDS_SORTING,
        }, manualPositionFitUpdateDisplay);
        this.playerId = constructor.pId;
        this.addCards(Object.values(constructor.inplay));
        this.toggleInPlay(); // in case inplay is empty, addCard is not called
        this.onSelectionChange = (selection: Card[]) => game.onInPlayCardSelectionChange(selection);   
    }

    private toggleInPlay() {
        document.getElementById(`player-table-${this.playerId}-inplay-wrapper`).dataset.visible = (!this.isEmpty()).toString();
    }

    public addCard(card: Card, animation?: CardAnimation<Card>, settings?: AddCardSettings): Promise<boolean> {
        const promise = super.addCard(card, animation, settings);
        this.toggleInPlay();
        return promise;
    }

    public cardRemoved(card: Card, settings?: RemoveCardSettings) {
        super.cardRemoved(card,/* settings*/);
        this.toggleInPlay();
    }
}

class PlayerTable {
    public constructorId: number;
    public playerId: number;
    public hand?: LineStock<Card>;
    public deck: Deck<Card>;
    public engine: Deck<Card>;
    public discard: Deck<Card>;
    public inplay: InPlayStock;

    private currentPlayer: boolean;
    private currentGear: number;

    constructor(private game: HeatGame, player: HeatPlayer, constructor: Constructor) {
        this.playerId = Number(player.id);
        this.constructorId = constructor.id;
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        this.currentGear = constructor.gear;

        let html = `
        <div id="player-table-${this.playerId}" class="player-table" style="--player-color: #${player.color}; --personal-card-background-y: ${constructor.id * 100 / 7}%;">
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
            this.hand = new LineStock<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-hand`), {
                sort: PERSONAL_CARDS_SORTING,
            }); 
            this.hand.onSelectionChange = (selection: Card[]) => this.game.onHandCardSelectionChange(selection);     
            this.hand.addCards(constructor.hand);
        }
        
        this.deck = new Deck<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-deck`), {
            cardNumber: constructor.deckCount,
            counter: {
                extraClasses: 'round',
            }
        });
        
        const engineCards = Object.values(constructor.engine);
        this.engine = new Deck<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-engine`), {
            cardNumber: engineCards.length,
            topCard: engineCards[0], // TODO check if ordered
            counter: {
                extraClasses: 'round',
            },
            fakeCardGenerator: deckId => ({
                id: `${deckId}-top-engine` as any,
                type: 111,
                location: 'engine',
                effect: 'heat',
                state: ''
            } as Card),
        });
        
        const discardCards = Object.values(constructor.discard);
        this.discard = new Deck<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-discard`), {
            cardNumber: discardCards.length,
            topCard: discardCards[0], // TODO check if ordered
            counter: {
                extraClasses: 'round',
            }
        });

        this.inplay = new InPlayStock(this.game, constructor);
    }

    public setHandSelectable(selectionMode: CardSelectionMode, selectableCardsIds: number[] | null = null, selectedCardsIds: number[] | null = null) {
        const cards = this.hand.getCards();
        this.hand.setSelectionMode(selectionMode, selectableCardsIds ? cards.filter(card => selectableCardsIds.includes(Number(card.id))) : undefined);
        this.hand.unselectAll();
        selectedCardsIds?.forEach(id => this.hand.selectCard(cards.find(card => Number(card.id) == id)));
    }
    
    public getCurrentGear(): number {
        return this.currentGear;
    }
    
    public setCurrentGear(gear: number) {
        this.currentGear = gear;
        document.getElementById(`player-table-${this.playerId}-gear`).dataset.gear = `${gear}`;
    }
    
    public setInplay(cards: Card[]): Promise<any> {
        this.inplay.removeAll();
        return this.inplay.addCards(cards);
    }
    
    public async clearPlayedCards(cardIds: number[], sponsorIds: number[]): Promise<any> {
        await this.inplay.removeCards(sponsorIds.map(sponsorId => ({id: sponsorId} as Card)));

        await this.discard.addCards(this.inplay.getCards());
    }
    
    public async cooldown(cards: Card[]): Promise<any> {
        await this.engine.addCards(cards);
    }
    
    public async payHeats(cards: Card[]): Promise<any> {
        await this.discard.addCards(cards, { fromStock: this.engine });
    }
    
    public spinOut(stresses: number[]): Promise<any> {
        let promise = null;
        if (this.currentPlayer) {
            promise = this.hand.addCards(stresses.map(id => ({
                id,
                type: 110,
                effect: 'stress',
                location: 'hand',
                state: ''
            } as Card)));
        }

        this.setCurrentGear(1);

        return promise ?? Promise.resolve(true);
    }
    
    public async drawCardsPublic(n: number, areSponsors: boolean, deckCount?: number): Promise<any> {
        if (areSponsors) {
            return;
        }

        const isReshuffled = this.deck.getCardNumber() < n;
        if (!isReshuffled) {
            const count = this.deck.getCardNumber() - n;
            this.deck.setCardNumber(deckCount ?? count);
            return Promise.resolve(true);
        } else {
            const before = this.deck.getCardNumber();
            const after = this.discard.getCardNumber() - (n - before);

            this.deck.setCardNumber(this.discard.getCardNumber());
            this.discard.setCardNumber(0);

            await this.deck.shuffle();

            this.deck.setCardNumber(deckCount ?? after);

            return true;
        }
    }
    
    public async drawCardsPrivate(cards: Card[], areSponsors: boolean, deckCount?: number): Promise<any> {
        if (areSponsors) {
            return this.hand.addCards(cards);
        }

        await this.addCardsFromDeck(cards, this.hand);

        if (deckCount !== undefined) {
            this.deck.setCardNumber(deckCount);
        }
    }
    
    public async scrapCards(cards: Card[], deckCount?: number): Promise<any> {
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];

            if (card.isReshuffled) {
                await this.moveDiscardToDeckAndShuffle();
            }
            
            this.deck.addCard({id: card.id } as Card, undefined, <AddCardToDeckSettings>{
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
    
    public async resolveBoost(cards: Card[], card: Card, deckCount: number): Promise<any> {
        await this.scrapCards(cards);

        if (card.isReshuffled) {
            await this.moveDiscardToDeckAndShuffle();
        }

        this.deck.addCard({id: card.id } as Card, undefined, <AddCardToDeckSettings>{
            autoUpdateCardNumber: false,
            autoRemovePreviousCards: false,
        });
        await this.inplay.addCard(card);

        if (deckCount !== undefined) {
            this.deck.setCardNumber(deckCount);
        }

        return true;
    }
    
    public async salvageCards(cards: Card[], discardCards: Card[], deckCount?: number): Promise<any> {
        this.discard.setCardNumber(discardCards.length + cards.length, discardCards[0]);
        cards.forEach(salvagedCard => this.discard.addCard(salvagedCard, undefined, <AddCardToDeckSettings>{
            autoUpdateCardNumber: false,
            autoRemovePreviousCards: false,
        }));

        await this.deck.addCards(cards.map(card => ({id: card.id }) as Card), undefined, undefined, true);

        this.deck.setCardNumber(deckCount ?? this.deck.getCardNumber());

        await this.deck.shuffle();

        return true;
    }
    
    public async superCoolCards(cards: Card[], discardCards: Card[]): Promise<any> {
        this.discard.setCardNumber(discardCards.length + cards.length, discardCards[0]);
        cards.forEach(heatCard => this.discard.addCard(heatCard, undefined, <AddCardToDeckSettings>{
            autoUpdateCardNumber: false,
            autoRemovePreviousCards: false,
        }));

        await this.engine.addCards(cards);

        return true;
    }

    private async moveDiscardToDeckAndShuffle() {
        this.deck.setCardNumber(0);

        const cardNumber = this.discard.getCardNumber();
        await this.deck.addCards(this.discard.getCards());

        this.discard.setCardNumber(0);
        this.deck.setCardNumber(cardNumber);
        await this.deck.shuffle();
    }

    public async addCardsFromDeck(cards: Card[], to: CardStock<Card>): Promise<any> {
        const shuffleIndex = cards.findIndex(card => card.isReshuffled)
        if (shuffleIndex === -1) {
            await to.addCards(cards, { fromStock: this.deck, }, undefined, 250);
        } else {
            const cardsBefore = cards.slice(0, shuffleIndex);
            const cardsAfter = cards.slice(shuffleIndex);
            
            await to.addCards(cardsBefore, { fromStock: this.deck, }, undefined, 250);

            await this.moveDiscardToDeckAndShuffle();

            this.deck.addCards(cardsAfter.map(card => ({id: card.id }) as Card), undefined, <AddCardToDeckSettings>{
                autoUpdateCardNumber: false,
                autoRemovePreviousCards: false,
            });
            await to.addCards(cardsAfter, { fromStock: this.deck, }, undefined, 250);
        }

        return true;
    }

    public async refreshHand(hand: Card[]) {
        this.hand.removeAll();
        return this.hand.addCards(hand);
    }

    public async refreshUI(constructor: Constructor) {
        this.deck.setCardNumber(constructor.deckCount);
        const engineCards = Object.values(constructor.engine);
        this.engine.setCardNumber(engineCards.length, engineCards[0]);
        const discardCards = Object.values(constructor.discard);
        this.discard.setCardNumber(discardCards.length, discardCards[0]);

        this.inplay.removeAll();
        this.inplay.addCards(Object.values(constructor.inplay));
    }
}