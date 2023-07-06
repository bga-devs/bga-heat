interface TechnologyTile {
    id: number;
    location: string;
    locationArg: number;
    type: number;
    number: number;
    cost: { [color: number]: number };
    immediateGains: { [type: number]: number };
    gains: (number | null)[];
}

class TechnologyTilesManager extends CardManager<TechnologyTile> {
    constructor (public game: HeatGame) {
        super(game, {
            getId: (card) => `card-${card.id}`,
            setupDiv: (card: TechnologyTile, div: HTMLElement) => {
                div.classList.add('technology-card');
                div.dataset.cardId = ''+card.id;
            },
            setupFrontDiv: (card: TechnologyTile, div: HTMLElement) => this.setupFrontDiv(card, div),
            isCardVisible: card => Boolean(card.color),
            cardWidth: 221,
            cardHeight: 120,
            animationManager: game.animationManager,
        });
    }

    private setupFrontDiv(card: TechnologyTile, div: HTMLElement, ignoreTooltip: boolean = false) { 
        div.dataset.color = ''+card.color;
        div.dataset.gain = ''+card.gain;
        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    public getTooltip(card: TechnologyTile): string {
        let message = `
        <strong>${_("Color:")}</strong> ${this.game.getTooltipColor(card.color)}
        <br>
        <strong>${_("Gain:")}</strong> <strong>1</strong> ${this.game.getTooltipGain(card.gain)}
        `;
 
        return message;
    }
    
    public setForHelp(card: number, divId: string): void {
        const div = document.getElementById(divId);
        div.classList.add('card', 'technology-card');
        div.dataset.side = 'front';
        div.innerHTML = `
        <div class="card-sides">
            <div class="card-side front">
            </div>
            <div class="card-side back">
            </div>
        </div>`
        this.setupFrontDiv(card, div.querySelector('.front'), true);
    }
}