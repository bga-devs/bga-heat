class ArchiveEngineData {
    constructor(
        public discardCards: BuilderCard[] = [],
        public discardTokens: {[cardId: string]: number} = {},
    ) {}
}

class ArchiveEngine extends FrontEngine<ArchiveEngineData> {
    public data: ArchiveEngineData = new ArchiveEngineData();

    constructor (public game: HeatGame, public possibleCards: string[]) {
        super(game, [
            new FrontState<ArchiveEngineData>(
                'discard',
                engine => {
                    engine.data.discardCards = [];
                    const cards = this.game.getCurrentPlayerTable().hand.getCards().filter(card => possibleCards.includes(card.id));
                    this.game.getCurrentPlayerTable().setHandSelectable('multiple', cards, 'archive-discard', true);
                    this.addConfirmDiscardSelection();
                    this.addCancel();
                },
                () => {
                    this.removeConfirmDiscardSelection();
                    this.game.getCurrentPlayerTable().setHandSelectable('none');
                    this.removeCancel();
                }
            ),
            new FrontState<ArchiveEngineData>(
                'discardTokens',
                engine => {
                    const discardCount = this.data.discardCards.length;
                    (this.game as any).gamedatas.gamestate.args.discard_number = discardCount;
                    this.game.changePageTitle(`SelectDiscardTokens`, true);
                    engine.data.discardTokens = {};
                    this.game.getCurrentPlayerTable().setTimelineTokensSelectable('multiple');
                    this.addConfirmDiscardTokenSelection();
                    this.addCancel();
                },
                () => {
                    this.removeConfirmDiscardTokenSelection();
                    this.game.getCurrentPlayerTable().setTimelineTokensSelectable('none');
                    this.removeCancel();
                }
            ),
            new FrontState<ArchiveEngineData>(
                'confirm',
                engine => {
                    const discardCount = this.data.discardCards.length;
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.add('discarded-card'));
                    this.game.changePageTitle(`Confirm`, true);

                    const label = formatTextIcons(_('Confirm discard of ${number} cards to remove ${number} <KNOWLEDGE>')).replace(/\${number}/g, ''+discardCount);

                    this.game.addPrimaryActionButton('confirmArchive_btn', label, () => this.game.onArchiveCardConfirm(engine.data));
                    this.addCancel();
                },
                engine => {
                    engine.data.discardCards.forEach(card => this.game.builderCardsManager.getCardElement(card)?.classList.remove('discarded-card'));
                    this.removeCancel();
                    document.getElementById('confirmArchive_btn')?.remove();
                }
            ),
        ]);

        this.enterState('discard');
    }
    
    public cardSelectionChange(selection: BuilderCard[]) {
        if (this.currentState == 'discard') {
            this.data.discardCards = selection;
            this.setConfirmDiscardSelectionState();
        }
    }
    
    public cardTokenSelectionChange(cardId: string, knowledge: number) {
        if (this.currentState == 'discardTokens') {
            this.data.discardTokens[cardId] = knowledge;
            this.setConfirmDiscardTokenSelectionState();
        }
    }

    private addCancel() {    
        this.game.addSecondaryActionButton('restartCardCreation_btn', _('Restart card creation'), () => this.nextState('init'));
    }

    private removeCancel() {    
        document.getElementById('restartCardCreation_btn')?.remove();
    }

    private addConfirmDiscardSelection() {    
        //this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), () => this.nextState('discardTokens'));
        this.game.addPrimaryActionButton('confirmDiscardSelection_btn', _('Confirm discarded cards'), () =>  this.game.onArchiveCardConfirm(this.data));
        this.setConfirmDiscardSelectionState();
    }

    private removeConfirmDiscardSelection() {    
        document.getElementById('confirmDiscardSelection_btn')?.remove();
    }

    private addConfirmDiscardTokenSelection() {    
        this.game.addPrimaryActionButton('confirmDiscardTokenSelection_btn', _('Confirm discarded tokens'), () => this.nextState('confirm'));
        this.setConfirmDiscardTokenSelectionState();
    }

    private removeConfirmDiscardTokenSelection() {    
        document.getElementById('confirmDiscardTokenSelection_btn')?.remove();
    }

    private setConfirmDiscardSelectionState() { 
        const discardCount = this.data.discardCards.length;
        document.getElementById('confirmDiscardSelection_btn')?.classList.toggle('disabled', discardCount == 0);
    }

    private setConfirmDiscardTokenSelectionState() { 
        /* TODO const discardCount = Object.values(this.data.discardTokens).reduce((a, b) => a + b, 0);
        document.getElementById('confirmDiscardTokenSelection_btn')?.classList.toggle('disabled', discardCount != this.data.discardCards.length);*/
    }
    
}