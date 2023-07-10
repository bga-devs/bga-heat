const isDebug = window.location.host == 'studio.boardgamearena.com' || window.location.hash.indexOf('debug') > -1;
const log = isDebug ? console.log.bind(window.console) : function () { };
        
const timelineSlotsIds = [];
[1, 0].forEach(line => [1,2,3,4,5,6].forEach(space => timelineSlotsIds.push(`timeline-${space}-${line}`)));

class PlayerTable {
    public playerId: number;
    public hand?: LineStock<Card>;
    public handTech?: LineStock<TechnologyTile>;
    public timeline: SlotStock<Card>;
    public past: AllVisibleDeck<Card>;
    public artifacts: SlotStock<Card>;
    public technologyTilesDecks: AllVisibleDeck<TechnologyTile>[] = [];

    private currentPlayer: boolean;

    constructor(private game: HeatGame, player: HeatPlayer, constructor: Constructor) {
        this.playerId = Number(player.id);
        this.currentPlayer = this.playerId == this.game.getPlayerId();

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
            <div id="player-table-${this.playerId}-timeline" class="timeline"></div>
            <div id="player-table-${this.playerId}-board" class="player-board" data-color="${player.color}">                
                <div id="player-table-${this.playerId}-past" class="past"></div>
                <div id="player-table-${this.playerId}-artifacts" class="artifacts"></div>
                <div class="technology-tiles-decks">`;            
                ['ancient', 'writing', 'secret'].forEach(type => {
                    html += `
                    <div id="player-table-${this.playerId}-technology-tiles-deck-${type}" class="technology-tiles-deck" data-type="${type}"></div>
                    `;
                });
            html += `
            </div>
            </div>
        </div>
        `;

        dojo.place(html, document.getElementById('tables'));

        if (this.currentPlayer) {
            this.hand = new LineStock<Card>(this.game.cardsManager, document.getElementById(`player-table-${this.playerId}-hand`), {
                sort: (a: Card, b: Card) => a.id[0] == b.id[0] ? a.number - b.number : a.id.charCodeAt(0) - b.id.charCodeAt(0),
            });
            this.hand.onCardClick = (card: Card) => this.game.onHandCardClick(card);   
            this.hand.onSelectionChange = (selection: Card[]) => this.game.onHandCardSelectionChange(selection);     
            this.refreshHand(constructor.hand);
        }

        /*const timelineDiv = document.getElementById(`player-table-${this.playerId}-timeline`);
        this.timeline = new SlotStock<Card>(this.game.builderCardsManager, timelineDiv, {
            slotsIds: timelineSlotsIds,
            mapCardToSlot: card => card.location,
        });
        player.timeline.forEach(card => this.createTimelineCard(this.game.builderCardsManager.getFullCard(card)));
        timelineSlotsIds.map(slotId => timelineDiv.querySelector(`[data-slot-id="${slotId}"]`)).forEach((element: HTMLDivElement) => element.addEventListener('click', () => {
            if (element.classList.contains('selectable')) {
                this.game.onTimelineSlotClick(element.dataset.slotId);
            }
        }));
        
        const artifactsSlotsIds = [];
        [0,1,2,3,4].forEach(space => artifactsSlotsIds.push(`artefact-${space}`)); // TODO artifact ?
        const artifactsDiv = document.getElementById(`player-table-${this.playerId}-artifacts`);
        this.artifacts = new SlotStock<Card>(this.game.builderCardsManager, artifactsDiv, {
            slotsIds: artifactsSlotsIds,
            mapCardToSlot: card => card.location,
            gap: '36px',
        });
        // TODO this.artifacts.addCards(player.artifacts);

        const pastDiv = document.getElementById(`player-table-${this.playerId}-past`);
        this.past = new AllVisibleDeck<Card>(this.game.builderCardsManager, pastDiv, {
        });
        this.past.addCards(this.game.builderCardsManager.getFullCards(player.past));
        
        ['ancient', 'writing', 'secret'].forEach(type => {
            const technologyTilesDeckDiv = document.getElementById(`player-table-${this.playerId}-technology-tiles-deck-${type}`);
            this.technologyTilesDecks[type] = new AllVisibleDeck<TechnologyTile>(this.game.technologyTilesManager, technologyTilesDeckDiv, {
            });
            const tiles = this.game.technologyTilesManager.getFullCards(player.techs).filter(tile => tile.type == type);
            this.technologyTilesDecks[type].addCards(tiles);
        });*/
    }

    public setHandSelectable(selectionMode: CardSelectionMode, selectableCards: Card[] | null = null, stockState: string = '', reinitSelection: boolean = false) {
        this.hand.setSelectionMode(selectionMode);
        if (selectableCards) {
            this.hand.setSelectableCards(selectableCards);
        }
        document.getElementById(`player-table-${this.playerId}-hand`).dataset.state = stockState;
        if (reinitSelection) {
            this.hand.unselectAll();
        }
    }
    
    public setInitialSelection(cards: Card[]) {
        this.hand.addCards(cards);
        this.setHandSelectable('multiple', null, 'initial-selection');
    }
    
    public endInitialSelection() {
        this.setHandSelectable('none');
    }
    
    public createCard(card: Card): Promise<any> {
        if (card.id[0] == 'A') {
            return this.artifacts.addCard(card);
        } else {
            this.game.cardsManager.updateCardInformations(card); // in case card is already on timeline, to update location
            return this.createTimelineCard(card);
        }
    }
    
    private createTimelineCard(card: Card): Promise<any> {
        const promise = this.timeline.addCard(card);
        this.setCardKnowledge(card.id, card.knowledge);
        return promise;
    }
    
    public addTechnologyTile(card: TechnologyTile): Promise<any> {
        return this.technologyTilesDecks[card.type].addCard(card);
    }
    
    public refreshHand(hand: Card[]): Promise<any> {
        this.hand.removeAll();
        const promise = this.hand.addCards(this.game.cardsManager.getFullCards(hand));

        hand.forEach(card => this.game.cardsManager.getCardElement(card).dataset.playerColor = this.game.getPlayer(this.playerId).color);

        return promise;
    }    

    public setCardKnowledge(cardId: string, knowledge: number) {
        //const golden = Math.floor(knowledge / 5);
        //const basic = knowledge % 5;
        const golden = 0;
        const basic = knowledge;

        const stockDiv = document.getElementById(`${cardId}-tokens`);

        while (stockDiv.childElementCount > (golden + basic)) {
            stockDiv.removeChild(stockDiv.lastChild);
        }
        while (stockDiv.childElementCount < (golden + basic)) {
            const div = document.createElement('div');
            div.classList.add('knowledge-token');
            stockDiv.appendChild(div);
            div.addEventListener('click', () => {
                if (div.classList.contains('selectable')) {
                    div.classList.toggle('selected');
                    const card = div.closest('.personal-card');
                    //this.game.onTimelineKnowledgeClick(card.id, card.querySelectorAll('.knowledge-token.selected').length);
                }
            });
        }

        for (let i = 0; i < (golden + basic); i++) {
            stockDiv.children[i].classList.toggle('golden', i < golden);
        }
    }
    
    public setTimelineSelectable(selectable: boolean, possibleCardLocations: PossibleCardLocations = null) {
        const slotIds = selectable ? Object.keys(possibleCardLocations) : [];
        document.getElementById(`player-table-${this.playerId}-timeline`).querySelectorAll(`.slot`).forEach((slot: HTMLDivElement) => {
            const slotId = slot.dataset.slotId;
            const slotSelectable = selectable && slotIds.includes(slotId);
            const discardCost = slotSelectable ? possibleCardLocations[slotId] : null;

            slot.classList.toggle('selectable', slotSelectable);
            //slot.style.setProperty('--discard-cost', `${discardCost > 0 ? discardCost : ''}`);
            slot.dataset.discardCost = `${discardCost > 0 ? discardCost : ''}`;
            slot.classList.toggle('discard-cost', slotSelectable && discardCost > 0);
        });
    }
    
    public setTimelineTokensSelectable(selectionMode: CardSelectionMode) {
        document.getElementById(`player-table-${this.playerId}-timeline`).querySelectorAll(`.knowledge-token`).forEach((token: HTMLDivElement) => {
            token.classList.toggle('selectable', selectionMode != 'none');
        });
    }
    
    public declineCard(card: Card): Promise<any> {
        return this.past.addCard(this.game.cardsManager.getFullCard(card));
    }
    
    public declineSlideLeft(): Promise<any> {
        const shiftedCards = this.timeline.getCards().map(card => ({
            ...card,
            location: card.location.replace(/(\d)/, a => `${Number(a) - 1}`)
        }));
        return this.timeline.addCards(shiftedCards);
    }
}