const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

const PERSONAL_CARDS_SORTING = (a: Card, b: Card) => Number(a.type) - Number(b.type);

class InPlayStock extends LineStock<Card> {
    private playerId: number;

    constructor(game: HeatGame, constructor: Constructor) {
        super(game.cardsManager, document.getElementById(`player-table-${constructor.pId}-inplay`), {
            sort: PERSONAL_CARDS_SORTING,
        });
        this.playerId = constructor.pId;
        this.addCards(Object.values(constructor.inplay));
        this.toggleInPlay(); // in case inplay is empty, addCard is not called
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
        super.cardRemoved(card, settings);
        this.toggleInPlay();
    }
}

class PlayerTable {
    public playerId: number;
    public hand?: LineStock<Card>;
    public deck: Deck<Card>;
    public engine: Deck<Card>;
    public discard: Deck<Card>;
    public inplay: InPlayStock;

    private currentPlayer: boolean;
    private currentGear: number;

    private fakeDeckCard: Card;

    constructor(private game: HeatGame, player: HeatPlayer, constructor: Constructor) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        this.currentGear = constructor.gear;

        this.fakeDeckCard = { id: `${this.playerId}-top-deck` as any } as Card;

        let html = `
        <div id="player-table-${this.playerId}" class="player-table" style="--player-color: #${player.color}; --personal-card-background-y: ${constructor.id * 100 / 6}%;">
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

        dojo.place(html, document.getElementById('tables'));

        if (this.currentPlayer) {
            this.hand = new LineStock<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-hand`), {
                sort: PERSONAL_CARDS_SORTING,
            }); 
            this.hand.onSelectionChange = (selection: Card[]) => this.game.onHandCardSelectionChange(selection);     
            this.hand.addCards(constructor.hand);
        }
        
        this.deck = new Deck<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-deck`), {
            cardNumber: constructor.deckCount,
            topCard: constructor.deckCount ? this.fakeDeckCard : null,
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
            }
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

    public setHandSelectable(selectionMode: CardSelectionMode, selectableCardsIds: number[] | null = null, selectedCardsIds: string[] | null = null) {
        const cards = this.hand.getCards();
        this.hand.setSelectionMode(selectionMode, selectableCardsIds ? cards.filter(card => selectableCardsIds.includes(Number(card.id))) : undefined);
        selectedCardsIds?.forEach(id => this.hand.getCardElement(cards.find(card => Number(card.id) == Number(id)))?.classList.add(this.hand.getSelectedCardClass())); // TODO make all numbers?
    }
    
    public getCurrentGear(): number {
        return this.currentGear;
    }
    
    public setCurrentGear(gear: number) {
        this.currentGear = gear;
        document.getElementById(`player-table-${this.playerId}-gear`).dataset.gear = `${gear}`;
    }
    
    public refreshHand(hand: Card[]): Promise<any> {
        this.hand.removeAll();
        return this.hand.addCards(hand);
    }
    
    public setInplay(cards: Card[]): Promise<any> {
        this.inplay.removeAll();
        return this.inplay.addCards(cards);
    }
    
    public clearPlayedCards(cardIds: number[]): Promise<any> {
        return this.discard.addCards(this.inplay.getCards());
    }
    
    public cooldown(cards: Card[]): Promise<any> {
        return this.engine.addCards(cards);
    }
    
    public async payHeats(cards: Card[]): Promise<any> {
        if (this.engine.getCardNumber() > cards.length) {
            this.engine.addCard({
                id: `${this.playerId}-top-engine` as any,
                type: 111,
                location: 'engine',
                state: ''
            } as Card, undefined, <AddCardToDeckSettings>{
                autoUpdateCardNumber: false,
                autoRemovePreviousCards: false,
            });
        }
        
        this.engine.addCards(cards, undefined, <AddCardToDeckSettings>{
            autoUpdateCardNumber: false,
            autoRemovePreviousCards: false,
        });

        await this.discard.addCards(cards, undefined, <AddCardToDeckSettings>{
            autoRemovePreviousCards: false,
        }, 250);

        return true;
    }
    
    public spinOut(stresses: number[]): Promise<any> {
        let promise = null;
        if (this.currentPlayer) {
            promise = this.hand.addCards(stresses.map(id => ({
                id,
                type: 110,
                location: 'hand',
                state: ''
            } as Card)));
        }

        this.setCurrentGear(1);

        return promise ?? Promise.resolve(true);
    }
    
    public drawCards(cards: Card[]): Promise<any> {
        return this.hand.addCards(cards, { fromStock: this.deck });
    }
    
    public incDeckCount(inc: number) {
        const count = this.deck.getCardNumber() + inc;
        this.deck.setCardNumber(count, count > 0 ? this.fakeDeckCard : null);
    }
}