interface Card {
    id: string;
    location: string;
    state: string;
    type: string;
    speed?: number;
    text?: string;
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
            cardWidth: 225,
            cardHeight: 362,
            animationManager: game.animationManager,
        });
    }

    private setupFrontDiv(card: Card, div: HTMLElement, ignoreTooltip: boolean = false) { 
        const type = Number(card.type);
        div.classList.toggle('upgrade-card', type < 100);
        if (type >= 100) {
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
        } else {
            const imagePosition = type - 1;
            const image_items_per_row = 10;
            var row = Math.floor(imagePosition / image_items_per_row);
            const xBackgroundPercent = (imagePosition - (row * image_items_per_row)) * 100;
            const yBackgroundPercent = row * 100;
            div.style.backgroundPosition = `-${xBackgroundPercent}% -${yBackgroundPercent}%`;

            div.innerHTML = `<div class="text">${_(card.text)}</div>`
        }

        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    private getTooltip(card: Card): string {
        switch (card.type) {
            case '101': case '102': case '103': case '104':
                return `${_('Speed card')}<br>
                ${_('Speed:')} <strong>${Number(card.type) - 100}</strong>
                `;

            case '100': case '105':
                return `${_('Starting upgrade')}<br>
                ${_('Speed:')} ${Number(card.type) - 100}
                `;

            case '110': return _('Stress card');
            case '106': case '111': return _('Heat card');
        }
    }
    
    public getHtml(card: Card): string {
        const type = Number(card.type);
        let className = '';
        let style = '';
        let col = null;
        
        if (type >= 100) {
            switch (type) {
                case 110:
                    className ='stress';
                    break;
                case 111:
                    className = 'heat';
                    break;
                default:
                    col = `${type % 100}`;
                    break;
            }
        } else {
            className = 'upgrade-card';

            const imagePosition = type - 1;
            const image_items_per_row = 10;
            var row = Math.floor(imagePosition / image_items_per_row);
            const xBackgroundPercent = (imagePosition - (row * image_items_per_row)) * 100;
            const yBackgroundPercent = row * 100;

            style = `background-position: -${xBackgroundPercent}% -${yBackgroundPercent}%;`;
        }

        let html = `<div class="card personal-card" data-side="front">
            <div class="card-sides">
                <div class="card-side front ${className}" ${col !== null ? `data-col="${col}"` : ''} style="${style}">${type < 100 ? `<div class="text">${_(card.text)}</div>` : ''}
                </div>
            </div>
        </div>`;
        return html;
    }
}