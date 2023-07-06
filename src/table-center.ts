class TableCenter {
    public technologyTilesDecks: Deck<TechnologyTile>[] = [];
    public technologyTilesStocks: LineStock<TechnologyTile>[] = [];
    //public technologyTilesStocks: SlotStock<TechnologyTile>[] = [];
    public cardDeck: Deck<BuilderCard>;
        
    constructor(private game: HeatGame, gamedatas: HeatGamedatas) {
        [1, 2].forEach(level => {
            this.technologyTilesDecks[level] = new Deck<TechnologyTile>(game.technologyTilesManager, document.getElementById(`technology-deck-${level}`), {
                // TODO cardNumber: gamedatas.centerDestinationsDeckCount[level],
                // TODO topCard: gamedatas.centerDestinationsDeckTop[level],
                // TODO counter: {},
            });
        });

        [1, 2, 3].forEach(number => {
            this.technologyTilesStocks[number] = new LineStock<TechnologyTile>(game.technologyTilesManager, document.getElementById(`table-technology-tiles-${number}`), {
            //this.technologyTilesStocks[number] = new SlotStock<TechnologyTile>(game.technologyTilesManager, document.getElementById(`table-technology-tiles-${number}`), {
                //slotsIds: [1, 2, 3],
                center: false,
            });
            this.technologyTilesStocks[number].onCardClick = tile => this.game.onTableTechnologyTileClick(tile);
        });
        this.refreshTechnologyTiles(gamedatas.techs);

        const cardDeckDiv = document.getElementById(`builder-deck`);
        this.cardDeck = new Deck<BuilderCard>(game.builderCardsManager, cardDeckDiv, {
            // TODO cardNumber: gamedatas.cardDeckCount,
            // TODO topCard: gamedatas.cardDeckTop,
            // TODO counter: { counterId: 'deck-counter', },
        });
    }
    
    public setTechnologyTilesSelectable(selectable: boolean, selectableCards: TechnologyTile[] | null = null) {
        [1, 2, 3].forEach(number => {
            this.technologyTilesStocks[number].setSelectionMode(selectable ? 'single' : 'none');
            this.technologyTilesStocks[number].setSelectableCards(selectableCards);
        });
    }
    
    public refreshTechnologyTiles(techs: TechnologyTile[]) {
        [1, 2, 3].forEach(number => {
            const tiles = this.game.technologyTilesManager.getFullCards(techs.filter(tile => tile.location == `board_${number}`));
            this.technologyTilesStocks[number].addCards(tiles);
        });
    }

}