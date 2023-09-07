class LegendTable {
    public deck: Deck<LegendCard>;
    public discard: Deck<LegendCard>;

    constructor(private game: HeatGame, legendCard: LegendCard) {
        let html = `
        <div id="legend-table">
            <div id="legend-board" class="player-board">
                <div id="legend-deck" class="deck"></div>
                <div id="legend-discard" class="discard"></div>
            </div>
        </div>
        `;

        dojo.place(html, document.getElementById('tables'));
        
        this.deck = new Deck<LegendCard>(this.game.legendCardsManager, document.getElementById(`legend-deck`), {
            topCard: [],
        });
        
        this.discard = new Deck<LegendCard>(this.game.legendCardsManager, document.getElementById(`legend-discard`), {
            topCard: legendCard,
        }); 
    }
    
    public async newLegendCard(card: LegendCard): Promise<any> {
        await this.deck.addCard(card, undefined, { visible: false, autoRemovePreviousCards: false, });

        await this.discard.addCard(card);

        return true;
    }
}