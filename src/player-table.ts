const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };

class PlayerTable {
    public playerId: number;
    public hand?: LineStock<Card>;

    private currentPlayer: boolean;
    private currentGear: number;

    constructor(private game: HeatGame, player: HeatPlayer, constructor: Constructor) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();
        this.currentGear = constructor.gear;

        let html = `
        <div id="player-table-${this.playerId}" class="player-table" style="--player-color: #${player.color};">
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
                <div id="player-table-${this.playerId}-gear" class="gear" data-gear="${this.currentGear}"></div>
            </div>
        </div>
        `;

        dojo.place(html, document.getElementById('tables'));

        if (this.currentPlayer) {
            this.hand = new LineStock<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-hand`), {
                sort: (a: Card, b: Card) => Number(a.type) - Number(b.type),
            });
            this.hand.onCardClick = (card: Card) => this.game.onHandCardClick(card);   
            this.hand.onSelectionChange = (selection: Card[]) => this.game.onHandCardSelectionChange(selection);     
            this.refreshHand(constructor.hand);
        }
    }

    public setHandSelectable(selectionMode: CardSelectionMode, selectableCards: Card[] | null = null, reinitSelection: boolean = false) {
        this.hand.setSelectionMode(selectionMode);
        if (selectableCards) {
            this.hand.setSelectableCards(selectableCards);
        }
        if (reinitSelection || selectionMode == 'none') {
            this.hand.unselectAll();
        }
    }
    
    public getCurrentGear(): number {
        return this.currentGear;
    }
    
    public refreshHand(hand: Card[]): Promise<any> {
        this.hand.removeAll();
        const promise = this.hand.addCards(this.game.cardsManager.getFullCards(hand));

        hand.forEach(card => this.game.cardsManager.getCardElement(card).dataset.playerColor = this.game.getPlayer(this.playerId).color);

        return promise;
    }
}