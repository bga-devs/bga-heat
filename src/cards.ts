interface Card {
    id: number;
    location: string;
    state: string;
    type: number;
    effect: string;
    speed?: number;
    text?: string;
    symbols?: { [type: string]: number};
    isReshuffled?: boolean;
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
        const type = card.type;
        div.dataset.type = ''+type; // for debug purpose only
        div.classList.toggle('upgrade-card', type < 80);
        div.classList.toggle('sponsor-card', type >= 80 && type < 100);
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
            if (type < 80) { // upgrade
                const imagePosition = type - 1;
                const image_items_per_row = 10;
                var row = Math.floor(imagePosition / image_items_per_row);
                const xBackgroundPercent = (imagePosition - (row * image_items_per_row)) * 100;
                const yBackgroundPercent = row * 100;
                div.style.backgroundPosition = `-${xBackgroundPercent}% -${yBackgroundPercent}%`;
            } else { // sponsor
                const imagePosition = type - 80;
                const xBackgroundPercent = imagePosition * 100;
                div.style.backgroundPositionX = `-${xBackgroundPercent}%`;
            }

            div.innerHTML = `<div class="text">${_(card.text)}</div>`
        }

        if (!ignoreTooltip) {            
            this.game.setTooltip(div.id, this.getTooltip(card));
        }
    }

    private getGarageModuleTextTooltip(card: Card): string {
        switch (card.type) {
            // 4 wheel drive
            case 1: case 2: case 3: case 47:
                return `<strong>${_(card.text)}</strong><br>
                ${_("This early system was designed to transfer all the force from the engine into the tarmac through all four wheels but it resulted in poor handling. These cards have the potential of high Speed or Cooldown but also reduce control because they flip cards like Stress.")}`;
            // Body
            case 4: case 5: case 6: case 18: case 19: case 20:
                return `<strong>${_(card.text)}</strong><br>
                ${_("A safer car with better balance that does not understeer. These cards allow you to discard Stress cards.")}`;
            // Brakes
            case 7: case 8: case 9: case 10:
                return `<strong>${_(card.text)}</strong><br>
                ${_("Brakes are all about how late you can make a decision to overtake or step on the brake, and still stay on the track. These cards have variable speed where you make a decision as you reveal the cards.")}`;
            // Cooling systems
            case 11: case 12: case 13: case 21:
                return `<strong>${_(card.text)}</strong><br>
                ${_("Provides a more stable and clean drive ; a better fuel economy and less stress to the car. These are cooldown cards.")}`;
            // R.P.M.
            case 14: case 15: case 16: case 17: case 29: case 30:  case 31: 
                return `<strong>${_(card.text)}</strong><br>
                ${_("A powerful engine allows your car to respond faster. When played at key moments, those cards make it easier for you to accelerate past opponents. They are cards that help you slipstream and overtake all over the track, but are most effective in and around corners.")}`;
            // Fuel
            case 22: case 23:
                return `<strong>${_(card.text)}</strong><br>
                ${_("Racing fuel is highly regulated. These are the super fuel “illegal“ cards.")}`;
            // Gas pedal
            case 24: case 25: case 26: case 27: case 28:
                return `<strong>${_(card.text)}</strong><br>
                ${_("The car reacts more quickly to pressure on the accelerator. These cards increase your overall speed.")}`;
            // Suspension
            case 32: case 33: case 34: case 35: 
                return `<strong>${_(card.text)}</strong><br>
                ${_("Giving you a smoother drive, these cards can be played round after round.")}`;
            // tires
            case 36: case 37: case 38: case 39: case 40: case 41: 
            return `<strong>${_(card.text)}</strong><br>
            ${_("It is about grip through width and durability. These cards allow you to go faster on corners or sacrifice the grip for a lot of cooldown.")}`;
            // turbocharger
            case 42: case 43:  
                return `<strong>${_(card.text)}</strong><br>
                ${_("A bigger engine giving you more horsepower and a higher top speed but also increasing weight and wear. These are the highest valued cards and require you to pay Heat.")}`;
            // wings
            case 44: case 45: case 46: 
                return `<strong>${_(card.text)}</strong><br>
                ${_("Creates downforce in corners but it lowers the top speed. These cards help you drive faster in corners but they are also unreliable, thus requiring Heat.")}`;


            case 101: case 102: case 103: case 104:
                return `<strong>${_('Speed card')}</strong><br>
                ${_('Speed:')} <strong>${Number(card.type) - 100}</strong>
                `;

            case 100: case 105:
                return `<strong>${_('Starting upgrade')}</strong><br>
                ${_('Speed:')} ${Number(card.type) - 100}
                `;
        }
    }

    private getTooltip(card: Card): string {
        switch (card.effect) {
            case 'heat': return `<strong>${_('Heat card')}</strong>`;
            case 'stress': return `<strong>${_('Stress card')}</strong>`;
            case 'basic_upgrade': case 'advanced_upgrade': 
                let tooltip = this.getGarageModuleTextTooltip(card);
                const icons = Object.entries(card.symbols).map(([symbol, number]) => `<div>${this.game.getGarageModuleIconTooltip(symbol, number)}</div>`).join('<br>');
                if (icons != '') {
                    tooltip += `<br><br>${icons}`;
                }
                return tooltip;
            default:
                switch (card.type) {
                    case 101: case 102: case 103: case 104:
                        return `<strong>${_('Speed card')}</strong><br>
                        ${_('Speed:')} <strong>${Number(card.type) - 100}</strong>
                        `;

                    case 100: case 105:
                        return `<strong>${_('Starting upgrade')}</strong><br>
                        ${_('Speed:')} ${Number(card.type) - 100}
                        `;
                }
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