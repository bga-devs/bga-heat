type LegendCard = {
    [column: number]: {
        [color: number]: number
    }
};

class LegendCardsManager extends CardManager<LegendCard> {
    constructor (public game: HeatGame) {
        super(game, {
            getId: (card) => `legend-card-${JSON.stringify(card).replace(/"/g, '')}`,
            setupDiv: (card: LegendCard, div: HTMLElement) => {
                div.classList.add('legend-card');
            },
            setupFrontDiv: (card: LegendCard, div: HTMLElement) => this.setupFrontDiv(card, div),
            isCardVisible: card => Object.values(card).length > 0,
            cardWidth: 362,
            cardHeight: 225,
            animationManager: game.animationManager,
        });
    }

    private setupFrontDiv(card: LegendCard, div: HTMLElement) { 
        if (!Object.values(card).length) {
            return;
        }

        let html = `<div class="table">`;
        [0,1,2,3].forEach((cornerBonus, index) => {
            html += `<div>${
                Object.entries(card[index]).map(([color, number]) => `<div class="legend-icon" style="--color: ${color}">${number}</div>`).join('')
            }</div>`;
        });
        html += `</div>`;
        div.innerHTML = html;
    }
}