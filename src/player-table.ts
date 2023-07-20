const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;
    public hand?: LineStock<Card>;
    public engine: Deck<Card>;

    private currentPlayer: boolean;
    private currentGear: number;

    constructor(private game: HeatGame, player: HeatPlayer, constructor: Constructor) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        this.currentGear = constructor.gear;

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
                <div id="player-table-${this.playerId}-gear" class="gear" data-gear="${this.currentGear}"></div>
                <div id="player-table-${this.playerId}-inplay" class="inplay"></div>
            </div>
        </div>
        `;

        dojo.place(html, document.getElementById('tables'));

        if (this.currentPlayer) {
            this.hand = new LineStock<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-hand`), {
                sort: (a: Card, b: Card) => Number(a.type) - Number(b.type),
            }); 
            this.hand.onSelectionChange = (selection: Card[]) => this.game.onHandCardSelectionChange(selection);     
            this.refreshHand(constructor.hand);
        }
        
        this.engine = new Deck<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-engine`), {
            cardNumber: Object.values(constructor.engine).length,
            topCard: Object.values(constructor.engine)[0],
            counter: {
                extraClasses: 'round',
            }
        });
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
        const promise = this.hand.addCards(hand);

        //hand.forEach(card => this.game.cardsManager.getCardElement(card).dataset.playerColor = this.game.getPlayer(this.playerId).color);

        return promise;
    }
}