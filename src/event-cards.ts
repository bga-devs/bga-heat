class EventCardsManager {
    constructor (public game: HeatGame) {
    }

    public getTexts(card: number): {
        title: string;
        rule: string;
        year: string;
        race: number;
        country: string;
    } {
        switch (card) {
            case 1:
                return {
                    title: _('New grandstand inauguration'),
                    rule: _('First three drivers to cross the Finish Line on the 1st lap immediately gain a Sponsorship card.'),
                    year: '1961',
                    race: 1,
                    country: _('GREAT BRITAIN'),
                };
            case 2:
                return {
                    title: _('New speed record!'),
                    rule: _('Each time you reach a Speed of 15 or more, immediately gain a Sponsorship card.'),
                    year: '1961',
                    race: 2,
                    country: _('USA'),
                };
            case 3:
                return {
                    title: _('Drivers’ strike'),
                    rule: _('This race is one lap shorter than usual. The winner of this race is awarded 2 extra Championship points.'),
                    year: '1961',
                    race: 3,
                    country: _('ITALY'),
                };
            case 4:
                return {
                    title: _('Engine restrictions lifted'),
                    rule: _('All drivers start the race with an extra Heat card from the reserve in their Engine spot.'),
                    year: '1962',
                    race: 1,
                    country: _('ITALY'),
                };
            case 5:
                return {
                    title: _('Record crowds'),
                    rule: _('This race is one lap longer than usual and hand size is increased to 8 cards.'),
                    year: '1962',
                    race: 2,
                    country: _('GREAT BRITAIN'),
                };
            case 6:
                return {
                    title: _('Corruption in rules committee'),
                    rule: _('The top 3 finishers of this race are awarded an extra Championship point.'),
                    year: '1962',
                    race: 3,
                    country: _('FRANCE'),
                };
            case 7:
                return {
                    title: _('New title sponsor'),
                    rule: _('No Special Rules.'),
                    year: '1963',
                    race: 1,
                    country: _('USA'),
                };
            case 8:
                return {
                    title: _('First live televised race'),
                    rule: _('If you pass 3 cars in a single round, immediately gain a Sponsorship card.'),
                    year: '1963',
                    race: 2,
                    country: _('GREAT BRITAIN'),
                };
            case 9:
                return {
                    title: _('New safety regulations'),
                    rule: _('All drivers start the race with 2 less Heat cards and 1 less Stress card than usual. Hand size is reduced to 6 cards.'),
                    year: '1963',
                    race: 3,
                    country: _('FRANCE'),
                };
            case 10:
                return {
                    title: _('Title sponsor withdraws future unknown'),
                    rule: _('All drivers start the race with an extra Stress card from the reserve in their Deck. If you spin out, you are eliminated from the race and score 0 Championship points.'),
                    year: '1963',
                    race: 4,
                    country: _('ITALY'),
                };
            case 11:
                return {
                    title: _('Going global'),
                    rule: _('In Press Corners, you gain 2 Sponsorship cards instead of one.'),
                    year: '1964',
                    race: 1,
                    country: _('JAPAN'),
                };
            case 12:
                return {
                    title: _('Turbulent winds'),
                    rule: _('You may only Slipstream if you are in 3rd or 4th gear.'),
                    year: '1964',
                    race: 2,
                    country: _('FRANCE'),
                };
            case 13:
                return {
                    title: _('Chicanes for increased safety'),
                    rule: _('For this race, you may discard Heat cards during step 8.'),
                    year: '1964',
                    race: 3,
                    country: _('MEXICO'),
                };
            case 14:
                return {
                    title: _('Sudden heavy rain delays race'),
                    rule: _('Nobody benefits from Adrenaline this race.'),
                    year: '1964',
                    race: 4,
                    country: _('JAPAN'),
                };
     }
    }
    
    public getHtml(card: number): string {
        const texts = this.getTexts(card);

        let html = `<div id="event-card-${card}" class="card event-card" data-side="front">
            <div class="card-sides">
                <div class="card-side front" data-index="${card}">
                    <div class="title-and-rule">
                        <div class="title">${texts.title}</div>
                        <div class="rule">${texts.rule}</div>
                    </div>
                    <div class="bottom-line">
                        <span class="year">${texts.year}</span>
                        •
                        <span class="race">${_('RACE ${number}').replace('${number}', ''+texts.race)}</span>
                        •
                        <span class="country">${texts.country}</span>
                    </div>
                </div>
            </div>
        </div>`;
        return html;
    }
    
    public getTooltip(card: number): string {
        const texts = this.getTexts(card);

        let html = `
            <div><strong>${texts.title}</strong></div><br>

            <div>${texts.rule}</div><br>
            
            <div class="bottom-line">
                <span class="year">${texts.year}</span>
                •
                <span class="race">${_('RACE ${number}').replace('${number}', ''+texts.race)}</span>
                •
                <span class="country">${texts.country}</span>
            </div>
        `;
        return html;
    }
}