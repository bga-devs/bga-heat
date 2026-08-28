import { BgaCards } from './libs';
import type { LegendCard } from './legend-cards';
import type { Deck } from '../../bga-cards';

export class LegendTable {
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
    
    public async newLegendCard(card: LegendCard): Promise<any> {
        await (this.deck as any).addCard(card, undefined, { visible: false, autoRemovePreviousCards: false, });

        await this.discard.addCard(card);

        return true;
    }
}
