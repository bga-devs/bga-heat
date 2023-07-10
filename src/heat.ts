declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const g_img_preload;

const ANIMATION_MS = 500;
const ACTION_TIMER_DURATION = 5;

const LOCAL_STORAGE_ZOOM_KEY = 'Heat-zoom';
const LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'Heat-jump-to-folded';

class Heat implements HeatGame {
    public animationManager: AnimationManager;
    public cardsManager: CardsManager;
    public technologyTilesManager: TechnologyTilesManager;

    private zoomManager: ZoomManager;
    private gamedatas: HeatGamedatas;
    private tableCenter: TableCenter;
    private playersTables: PlayerTable[] = [];
    private handCounters: Counter[] = [];
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    private _notif_uid_to_log_id = [];
    private _notif_uid_to_mobile_log_id = [];
    private _last_notif;

    private createEngine: CreateEngine;
    private archiveEngine: ArchiveEngine;

    constructor() {
    }
    
    /*
        setup:

        This method must set up the game user interface according to current game situation specified
        in parameters.

        The method is called each time the game interface is displayed to a player, ie:
        _ when the game starts
        _ when a player refreshes the game page (F5)

        "gamedatas" argument contains all datas retrieved by your "getAllDatas" PHP method.
    */

    public setup(gamedatas: HeatGamedatas) {
        log( "Starting game setup" );
        
        this.gamedatas = gamedatas;

        // TODO TEMP
        Object.values(gamedatas.players).forEach((player, index) => {
            //const playerId = Number(player.id);
            //if (playerId == this.getPlayerId()) {
            //    player.hand = gamedatas.cards.filter(card => card.location == 'hand' && card.pId == playerId);
            //}
            //player.handCount = gamedatas.cards.filter(card => card.location == 'hand' && card.pId == playerId).length;
        });

        g_img_preload.push(...[
            `Circuits/${gamedatas.circuit}.jpg`,
        ]);

        // Create a new div for buttons to avoid BGA auto clearing it
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');

        log('gamedatas', gamedatas);

        this.animationManager = new AnimationManager(this);
        this.cardsManager = new CardsManager(this);
        this.technologyTilesManager = new TechnologyTilesManager(this);
        
        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            topEntries: [
                new JumpToEntry(_('Main board'), 'table-center', { 'color': '#224757' })
            ],
            entryClasses: 'round-point',
            defaultFolded: true,
        });

        this.tableCenter = new TableCenter(this, gamedatas);
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        
        this.zoomManager = new ZoomManager({
            element: document.getElementById('table'),
            smooth: false,
            zoomControls: {
                color: 'black',
            },
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
        });

        new HelpManager(this, { 
            buttons: [
                new BgaHelpPopinButton({
                    title: _("Card help").toUpperCase(),
                    html: this.getHelpHtml(),
                    onPopinCreated: () => this.populateHelp(),
                    buttonBackground: '#87a04f',
                }),
            ]
        });
        this.setupNotifications();
        this.setupPreferences();

        log( "Ending game setup" );
    }

    ///////////////////////////////////////////////////
    //// Game & client states

    // onEnteringState: this method is called each time we are entering into a new game state.
    //                  You can use this method to perform some user interface changes at this moment.
    //
    public onEnteringState(stateName: string, args: any) {
        log('Entering state: ' + stateName, args.args);

        if (args.args && args.args.descSuffix) {
          this.changePageTitle(args.args.descSuffix);
        }
  
        if (args.args && args.args.optionalAction) {
          let base = args.args.descSuffix ? args.args.descSuffix : '';
          this.changePageTitle(base + 'skippable');
        }

        if (/* TODO? this._activeStates.includes(stateName) ||*/ (this as any).isCurrentPlayerActive()) {  
            if (args.args && args.args.optionalAction && !args.args.automaticAction) {
            this.addSecondaryActionButton(
                'btnPassAction',
                _('Pass'),
                () => this.takeAction('actPassOptionalAction'),
                'restartAction'
            );
            }

            // Undo last steps
            args.args?.previousSteps?.forEach((stepId: number) => {
                let logEntry = $('logs').querySelector(`.log.notif_newUndoableStep[data-step="${stepId}"]`);
                if (logEntry) {
                    this.onClick(logEntry, () => this.undoToStep(stepId));
                }

                logEntry = document.querySelector(`.chatwindowlogs_zone .log.notif_newUndoableStep[data-step="${stepId}"]`);
                if (logEntry) {
                    this.onClick(logEntry, () => this.undoToStep(stepId));
                }
            });

            // Restart turn button
            if (args.args?.previousEngineChoices >= 1 && !args.args.automaticAction) {
            if (args.args?.previousSteps) {
                let lastStep = Math.max(...args.args.previousSteps);
                if (lastStep > 0)
                this.addDangerActionButton('btnUndoLastStep', _('Undo last step'), () => this.undoToStep(lastStep), 'restartAction');
            }
    
            // Restart whole turn
            this.addDangerActionButton(
                'btnRestartTurn',
                _('Restart turn'),
                () => {
                this.stopActionTimer();
                this.takeAction('actRestart');
                },
                'restartAction'
            );
            }
        }
  
        /* TODO? if (this.isCurrentPlayerActive() && args.args) {
            // Anytime buttons
            args.args.anytimeActions?.forEach((action, i) => {
                let msg = action.desc;
                msg = msg.log ? this.fsr(msg.log, msg.args) : _(msg);
                msg = this.formatString(msg);

                this.addPrimaryActionButton(
                'btnAnytimeAction' + i,
                msg,
                () => this.takeAction('actAnytimeAction', { id: i }, false),
                'anytimeActions'
                );
            });
        }*/

        switch (stateName) {
            case 'create':
                this.onEnteringCreate(args.args);
                break;
            case 'archive':
                this.onEnteringArchive(args.args);
                break;
            case 'learn':
                this.onEnteringLearn(args.args);
                break;
        }
    }

    /*
     * Add a blue/grey button if it doesn't already exists
     */
    public addPrimaryActionButton(id, text, callback, zone = 'customActions'): void {
      if (!$(id)) (this as any).addActionButton(id, text, callback, zone, false, 'blue');
    }

    public addSecondaryActionButton(id, text, callback, zone = 'customActions'): void {
      if (!$(id)) (this as any).addActionButton(id, text, callback, zone, false, 'gray');
    }

    public addDangerActionButton(id, text, callback, zone = 'customActions'): void {
      if (!$(id)) (this as any).addActionButton(id, text, callback, zone, false, 'red');
    }
    
    public changePageTitle(suffix: string = null, save: boolean = false): void {
      if (suffix == null) {
        suffix = 'generic';
      }

      if (!this.gamedatas.gamestate['descriptionmyturn' + suffix]) {
        return;
      }

      if (save) {
        (this.gamedatas.gamestate as any).descriptionmyturngeneric = this.gamedatas.gamestate.descriptionmyturn;
        (this.gamedatas.gamestate as any).descriptiongeneric = this.gamedatas.gamestate.description;
      }

      this.gamedatas.gamestate.descriptionmyturn = this.gamedatas.gamestate['descriptionmyturn' + suffix];
      if (this.gamedatas.gamestate['description' + suffix])
        this.gamedatas.gamestate.description = this.gamedatas.gamestate['description' + suffix];
      (this as any).updatePageTitle();
    }

    private onEnteringInitialSelection(args: EnteringInitialSelectionArgs) {
        const cards = this.cardsManager.getFullCardsByIds(args._private.cards);
        this.getCurrentPlayerTable().setInitialSelection(cards);
    }

    private onEnteringCreate(args: EnteringCreateArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.createEngine = new CreateEngine(this, args._private.cards);
        }
    }

    private onEnteringArchive(args: EnteringArchiveArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.archiveEngine = new ArchiveEngine(this, args._private.cardIds);
        }
    }

    private onEnteringLearn(args: EnteringLearnArgs) {
        if ((this as any).isCurrentPlayerActive()) {
            this.tableCenter.setTechnologyTilesSelectable(true/*, args.techs*/);
        }
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

      (this as any).removeActionButtons();
      document.getElementById('customActions').innerHTML = '';
      document.getElementById('restartAction').innerHTML = '';

        switch (stateName) {
            case 'initialSelection':
                this.onLeavingInitialSelection();
                break;
            case 'create':
                this.onLeavingCreate();
                break;
            case 'archive':
                this.onLeavingArchive();
                break;
            case 'learn':
                this.onLeavingLearn();
                break;
        }
    }

    private onLeavingInitialSelection() {
        this.getCurrentPlayerTable()?.endInitialSelection();
    }

    private onLeavingCreate() {
        this.createEngine.leaveState();
        this.createEngine = null;
    }

    private onLeavingArchive() {
        this.archiveEngine.leaveState();
        this.archiveEngine = null;
    }

    private onLeavingLearn() {
        this.tableCenter.setTechnologyTilesSelectable(false);
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        
        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'initialSelection':
                    //const initialSelectionArgs = args as EnteringInitialSelectionArgs;
                    this.onEnteringInitialSelection(args);
                    (this as any).addActionButton(`actSelectCardsToDiscard_button`, _('Keep selected cards'), () => this.actSelectCardsToDiscard());
                    document.getElementById('actSelectCardsToDiscard_button').classList.add('disabled');
                    break;
                case 'chooseAction':
                    [
                        ['create', _('Create')], 
                        ['learn', _('Learn')], 
                        ['excavate', _('Excavate')], 
                        ['archive', _('Archive')], 
                        ['search', _('Search')],
                    ].forEach(codeAndLabel => 
                        (this as any).addActionButton(`actChooseAction_${codeAndLabel[0]}_button`, `<div class="action-icon ${codeAndLabel[0]}"></div> ${codeAndLabel[1]}`, () => this.takeAtomicAction('actChooseAction', [codeAndLabel[0]]))
                    );
                    //(this as any).addActionButton(`actRestart_button`, _("Restart"), () => this.actRestart(), null, null, 'gray');
                    break;
                case 'confirmTurn':
                    (this as any).addActionButton(`actConfirmTurn_button`, _("Confirm turn"), () => this.actConfirmTurn());
                    //(this as any).addActionButton(`actRestart_button`, _("Restart"), () => this.actRestart(), null, null, 'gray');
            }
        } else {
            switch (stateName) {
                case 'initialSelection':
                    (this as any).addActionButton(`actCancelSelection_button`, _('Cancel'), () => this.actCancelSelection(), null, null, 'gray');
                    break;
            }
        }
    }

    ///////////////////////////////////////////////////
    //// Utility methods


    ///////////////////////////////////////////////////

    public setTooltip(id: string, html: string) {
        (this as any).addTooltipHtml(id, html, this.TOOLTIP_DELAY);
    }
    public setTooltipToClass(className: string, html: string) {
        (this as any).addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
    }

    public getPlayerId(): number {
        return Number((this as any).player_id);
    }

    public getPlayer(playerId: number): HeatPlayer {
        return Object.values(this.gamedatas.players).find(player => Number(player.id) == playerId);
    }

    private getPlayerTable(playerId: number): PlayerTable {
        return this.playersTables.find(playerTable => playerTable.playerId === playerId);
    }

    public getCurrentPlayerTable(): PlayerTable | null {
        return this.playersTables.find(playerTable => playerTable.playerId === this.getPlayerId());
    }

    public getGameStateName(): string {
        return this.gamedatas.gamestate.name;
    }

    private setupPreferences() {
        // Extract the ID and value from the UI control
        const onchange = (e) => {
          var match = e.target.id.match(/^preference_[cf]ontrol_(\d+)$/);
          if (!match) {
            return;
          }
          var prefId = +match[1];
          var prefValue = +e.target.value;
          (this as any).prefs[prefId].value = prefValue;
        }
        
        // Call onPreferenceChange() when any value changes
        dojo.query(".preference_control").connect("onchange", onchange);
        
        // Call onPreferenceChange() now
        dojo.forEach(
          dojo.query("#ingame_menu_content .preference_control"),
          el => onchange({ target: el })
        );
    }

    private getOrderedPlayers(gamedatas: HeatGamedatas) {
        const players = Object.values(gamedatas.players).sort((a, b) => a.playerNo - b.playerNo);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: HeatGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);
            const constructor = this.getPlayerConstructor(playerId);

            document.getElementById(`player_score_${player.id}`).insertAdjacentHTML('beforebegin', `<div class="vp icon"></div>`);
            document.getElementById(`icon_point_${player.id}`).remove();

            /**/
            let html = `<div class="counters">
                <div id="playerhand-counter-wrapper-${player.id}" class="playerhand-counter">
                    <div class="player-hand-card"></div> 
                    <span id="playerhand-counter-${player.id}"></span>
                </div>

            </div>
            <div>${playerId == gamedatas.firstPlayerId ? `<div id="first-player">${_('First player')}</div>` : ''}</div>`;

            dojo.place(html, `player_board_${player.id}`);


            this.handCounters[playerId] = new ebg.counter();
            this.handCounters[playerId].create(`playerhand-counter-${playerId}`);
            this.handCounters[playerId].setValue(constructor.handCount);
        });

        this.setTooltipToClass('lost-knowledge-counter', _('Lost knowledge'));
    }

    private createPlayerTables(gamedatas: HeatGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
    }

    private getPlayerConstructor(playerId: number) {
        return Object.values(this.gamedatas.constructors).find(constructor => constructor.pId == playerId);
    }

    private createPlayerTable(gamedatas: HeatGamedatas, playerId: number) {
        const table = new PlayerTable(this, gamedatas.players[playerId], this.getPlayerConstructor(playerId));
        this.playersTables.push(table);
    }

    private updateGains(playerId: number, gains: { [type: number]: number }) {
        Object.entries(gains).forEach(entry => {
            const type = Number(entry[0]);
            const amount = entry[1];

            if (amount != 0) {
                switch (type) {
                    /*case VP:
                        this.setScore(playerId, (this as any).scoreCtrl[playerId].getValue() + amount);
                        break;
                    case BRACELET:
                        this.setBracelets(playerId, this.braceletCounters[playerId].getValue() + amount);
                        break;
                    case RECRUIT:
                        this.setRecruits(playerId, this.recruitCounters[playerId].getValue() + amount);
                        break;
                    case REPUTATION:
                        this.setReputation(playerId, this.tableCenter.getReputation(playerId) + amount);
                        break;*/
                }
            }
        });
    }

    private setScore(playerId: number, score: number) {
        (this as any).scoreCtrl[playerId]?.toValue(score);
        this.tableCenter.setScore(playerId, score);
    }

    private setReputation(playerId: number, count: number) {
        this.lostKnowledgeCounters[playerId].toValue(count);
        this.tableCenter.setReputation(playerId, count);
    }

    private setRecruits(playerId: number, count: number) {
        this.recruitCounters[playerId].toValue(count);
        this.getPlayerTable(playerId).updateCounter('recruits', count);
    }

    private setBracelets(playerId: number, count: number) {
        this.braceletCounters[playerId].toValue(count);
        this.getPlayerTable(playerId).updateCounter('bracelets', count);
    }

    private getHelpHtml() {
        let html = `
        <div id="help-popin">
            <h1>${_("Assets")}</h2>
            <div class="help-section">
                <div class="icon vp"></div>
                <div class="help-label">${_("Gain 1 <strong>Victory Point</strong>. The player moves their token forward 1 space on the Score Track.")}</div>
            </div>
            <div class="help-section">
                <div class="icon recruit"></div>
                <div class="help-label">${_("Gain 1 <strong>Recruit</strong>: The player adds 1 Recruit token to their ship.")} ${_("It is not possible to have more than 3.")} ${_("A recruit allows a player to draw the Viking card of their choice when Recruiting or replaces a Viking card during Exploration.")}</div>
            </div>
            <div class="help-section">
                <div class="icon bracelet"></div>
                <div class="help-label">${_("Gain 1 <strong>Silver Bracelet</strong>: The player adds 1 Silver Bracelet token to their ship.")} ${_("It is not possible to have more than 3.")} ${_("They are used for Trading.")}</div>
            </div>
            <div class="help-section">
                <div class="icon reputation"></div>
                <div class="help-label">${_("Gain 1 <strong>Reputation Point</strong>: The player moves their token forward 1 space on the Reputation Track.")}</div>
            </div>
            <div class="help-section">
                <div class="icon take-card"></div>
                <div class="help-label">${_("Draw <strong>the first Viking card</strong> from the deck: It is placed in the player’s Crew Zone (without taking any assets).")}</div>
            </div>

            <h1>${_("Powers of the artifacts (variant option)")}</h1>
        `;

        for (let i = 1; i <=7; i++) {
            html += `
            <div class="help-section">
                <div id="help-artifact-${i}"></div>
                <div>${this.technologyTilesManager.getTooltip(i as any)}</div>
            </div> `;
        }
        html += `</div>`;

        return html;
    }

    private populateHelp() {
        for (let i = 1; i <=7; i++) {
            this.technologyTilesManager.setForHelp(i, `help-artifact-${i}`);
        }
    }
    
    public onTableTechnologyTileClick(tile: TechnologyTile): void {
        if (this.gamedatas.gamestate.name == 'learn') {
            this.takeAtomicAction('actLearn', [
                tile.id,
            ]);
        }
    }

    public onHandCardClick(card: Card): void {
        if (this.gamedatas.gamestate.name == 'create') {
            /*this.takeAtomicAction('actCreate', [
                card.id,
                card.id[0] == 'A' ? `artefact-0` : `timeline-${card.startingSpace}-0`, // TODO space to build
                [], // TODO cards to discard
            ]);*/
        }
    }

    /*public updateCreatePageTitle() {
        if (this.selectedCard) {
            // TODO 
        } else {
            this.changePageTitle(null);
        }
    }*/
    
    public onHandCardSelectionChange(selection: Card[]): void {
        if (this.gamedatas.gamestate.name == 'initialSelection') {
            document.getElementById('actSelectCardsToDiscard_button').classList.toggle('disabled', selection.length != 6);
        } else if (this.gamedatas.gamestate.name == 'create') {
            this.createEngine?.cardSelectionChange(selection);
        } else if (this.gamedatas.gamestate.name == 'archive') {
            this.archiveEngine?.cardSelectionChange(selection);
        }
    }
    
    public onTimelineSlotClick(slotId: string): void {
        this.createEngine.selectSlot(slotId);
    }

    public onCreateCardConfirm(data: CreateEngineData): void {
        this.takeAtomicAction('actCreate', [
            data.selectedCard.id,
            data.selectedSlot,
            data.discardCards.map(card => card.id).sort(),
        ]);
    }

    public onArchiveCardConfirm(data: ArchiveEngineData): void {
        this.takeAtomicAction('actArchive', [
            data.discardCards.map(card => card.id).sort(),
        ]);
    }

    public onTableCardClick(card: Card): void {
        /*if (this.gamedatas.gamestate.name == 'discardTableCard') {
            this.discardTableCard(card.id);
        } else {
            this.chooseNewCard(card.id);
        }*/
    }

    public onPlayedCardClick(card: Card): void {
        /*if (this.gamedatas.gamestate.name == 'discardCard') {
            this.discardCard(card.id);
        } else {
            this.setPayDestinationLabelAndState();
        }*/
    }
  	
    public actSelectCardsToDiscard() {
        if(!(this as any).checkAction('actSelectCardsToDiscard')) {
            return;
        }

        const selectedCards = this.getCurrentPlayerTable().hand.getSelection();
        const discardCards = this.getCurrentPlayerTable().hand.getCards().filter(card => !selectedCards.some(sc => sc.id == card.id));

        this.takeAction('actSelectCardsToDiscard', {
            cardIds: JSON.stringify(discardCards.map(card => card.id)),
        });
    }
  	
    public actCancelSelection() {
        this.takeAction('actCancelSelection');
    }
  	
    public actConfirmTurn() {
        if(!(this as any).checkAction('actConfirmTurn')) {
            return;
        }

        this.takeAction('actConfirmTurn');
    }
  	
    public actConfirmPartialTurn() {
        if(!(this as any).checkAction('actConfirmPartialTurn')) {
            return;
        }

        this.takeAction('actConfirmPartialTurn');
    }
  	
    public actRestart() {
        if(!(this as any).checkAction('actRestart')) {
            return;
        }

        this.takeAction('actRestart');
    }

    private takeAtomicAction(action: string, args: any = {}, warning = false) {
        if (!(this as any).checkAction(action)) return false;
  
        //(this as any).askConfirmation(warning, () =>
          this.takeAction('actTakeAtomicAction', { actionName: action, actionArgs: JSON.stringify(args) }/*, false*/)
        //);
    }

    public takeAction(action: string, data?: any) {
        data = data || {};
        data.lock = true;
        (this as any).ajaxcall(`/heat/heat/${action}.html`, data, this, () => {});
    }

    ///////////////////////////////////////////////////
    //// Reaction to cometD notifications

    /*
        setupNotifications:

        In this method, you associate each of your game notifications with your local method to handle it.

        Note: game notification names correspond to "notifyAllPlayers" and "notifyPlayer" calls in
                your pylos.game.php file.

    */
    setupNotifications() {
        //log( 'notifications subscriptions setup' );

        dojo.connect((this as any).notifqueue, 'addToLog', () => {
            this.addLogClass();
        });

        const notifs = [
            ['pDrawCards', undefined],
            ['discardCards', ANIMATION_MS],
            ['pDiscardCards', undefined],
            ['createCard', undefined],
            ['fillPool', undefined],
            ['discardLostKnowledge', 1],
            ['learnTech', undefined],
            ['clearTurn', 1],
            ['refreshUI', 1],
            ['refreshHand', 1],
            ['declineCard', undefined],
            ['declineSlideLeft', undefined],
        ];
    
        notifs.forEach((notif) => {
            dojo.subscribe(notif[0], this, (notifDetails: Notif<any>) => {
                log(`notif_${notif[0]}`, notifDetails.args);

                const promise = this[`notif_${notif[0]}`](notifDetails.args);

                // tell the UI notification ends, if the function returned a promise
                promise?.then(() => (this as any).notifqueue.onSynchronousNotificationEnd());

                let msg = /*this.formatString(*/this.format_string_recursive(notifDetails.log, notifDetails.args)/*)*/;
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;
                }
            });
            (this as any).notifqueue.setSynchronous(notif[0], notif[1]);
        });

        if (isDebug) {
            notifs.forEach((notif) => {
                if (!this[`notif_${notif[0]}`]) {
                    console.warn(`notif_${notif[0]} function is not declared, but listed in setupNotifications`);
                }
            });

            Object.getOwnPropertyNames(Heat.prototype).filter(item => item.startsWith('notif_')).map(item => item.slice(6)).forEach(item => {
                if (!notifs.some(notif => notif[0] == item)) {
                    console.warn(`notif_${item} function is declared, but not listed in setupNotifications`);
                }
            });
        }

        (this as any).notifqueue.setIgnoreNotificationCheck('discardCards', (notif: Notif<any>) => 
            notif.args.player_id == this.getPlayerId()
        );
    }

    notif_discardCards() {}

    notif_pDrawCards(args: NotifPDrawCardsArgs) {
        return this.getPlayerTable(args.player_id).hand.addCards(this.cardsManager.getFullCards(args.cards));
    }

    notif_pDiscardCards(args: NotifPDiscardCardsArgs) {
        this.getPlayerTable(args.player_id).hand.removeCards(args.cards);
        return Promise.resolve(true);
    }

    notif_createCard(args: NotifCreateCardsArgs) {
        if (args.card.id[0] == 'T') {
            const tile = this.technologyTilesManager.getFullCard(args.card as TechnologyTile);
            return this.getPlayerTable(args.player_id).addTechnologyTile(tile);
        } else {
            const card = this.cardsManager.getFullCard(args.card as Card);
            return this.getPlayerTable(args.player_id).createCard(card);
        }
    }

    notif_fillPool(args: NotifFillPoolArgs) {
        const tiles = Object.values(args.cards);
        const promises = [1, 2, 3].map(number => {
            const numberTilesId = tiles.filter(tile => tile.location == `board_${number}`).map(tile => tile.id);
            const numberTiles = this.technologyTilesManager.getFullCardsByIds(numberTilesId);
            return this.tableCenter.technologyTilesStocks[number].addCards(numberTiles);
        });
        return Promise.all(promises);
    }

    notif_discardLostKnowledge(args: NotifDiscardLostKnowledgeArgs) {
        //  TODO
    }

    notif_learnTech(args: NotifLearnTechArgs) {
        return this.getPlayerTable(args.player_id).addTechnologyTile(args.card);
    }
    
    notif_clearTurn(args: NotifClearTurnArgs) {
      this.cancelLogs(args.notifIds);
    }
    
    notif_refreshUI(args: NotifRefreshUIArgs) {
        //  TODO refresh cards ?
        //  TODO refresh players
        this.tableCenter.refreshTechnologyTiles(args.datas.techs);
    }
    
    notif_refreshHand(args: NotifRefreshHandArgs) {
        return this.getPlayerTable(args.player_id).refreshHand(args.hand);
    }  

    notif_declineCard(args: NotifDeclineCardArgs) {
        return this.getPlayerTable(args.player_id).declineCard(args.card);
    }  

    notif_declineSlideLeft(args: NotifDeclineCardArgs) {
        return this.getPlayerTable(args.player_id).declineSlideLeft();
    }

    /*
pour REMOVE_KNOWLEDGE, il faudra gérer plusieurs comportements en fonction du champs 'type'
je t'envoie une liste d'ids de carte, un entier n, et type qui est soit OR/XOR/SEQ
SEQ ça veut dire qu'il faut enlever $n knowledge de chaque carte => c'est automatique donc rien à faire pour toi
XOR ça veut dire qu'il faut enlever $n knowledge d'exactement une carte parmis celles des args
OR c'est le cas "normal" où tu répartis les $n comme tu veux parmis les cartes des args
et pour actRemoveKnowleldge j'attends un tableau associatif : ['cardId' => n1, 'cardId2' => n2, ...]
    */
    
    /*
    * [Undocumented] Called by BGA framework on any notification message
    * Handle cancelling log messages for restart turn
    */
    /* @Override */
    public onPlaceLogOnChannel(msg) {
     var currentLogId = (this as any).notifqueue.next_log_id;
     var currentMobileLogId = (this as any).next_log_id;
     var res = (this as any).inherited(arguments);
     (this as any)._notif_uid_to_log_id[msg.uid] = currentLogId;
     (this as any)._notif_uid_to_mobile_log_id[msg.uid] = currentMobileLogId;
     (this as any)._last_notif = {
       logId: currentLogId,
       mobileLogId: currentMobileLogId,
       msg,
     };
     return res;
    }
    
    private cancelLogs(notifIds: string[]) {
      notifIds.forEach((uid) => {
        if ((this as any)._notif_uid_to_log_id.hasOwnProperty(uid)) {
          let logId = (this as any)._notif_uid_to_log_id[uid];
          if ($('log_' + logId)) {
            dojo.addClass('log_' + logId, 'cancel');
          }
        }
        if ((this as any)._notif_uid_to_mobile_log_id.hasOwnProperty(uid)) {
          let mobileLogId = (this as any)._notif_uid_to_mobile_log_id[uid];
          if ($('dockedlog_' + mobileLogId)) {
            dojo.addClass('dockedlog_' + mobileLogId, 'cancel');
          }
        }
      });
    }
    
    addLogClass() {
      if ((this as any)._last_notif == null) {
        return;
      }

      let notif = (this as any)._last_notif;
      let type = notif.msg.type;
      if (type == 'history_history') {
        type = notif.msg.args.originalType;
      }

      if ($('log_' + notif.logId)) {
        dojo.addClass('log_' + notif.logId, 'notif_' + type);

        var methodName = 'onAdding' + type.charAt(0).toUpperCase() + type.slice(1) + 'ToLog';
        this[methodName]?.(notif);
      }
      if ($('dockedlog_' + notif.mobileLogId)) {
        dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
      }
    }

    private onClick(elem: HTMLElement, callback) {
        elem.addEventListener('click', callback);
    }

    protected onAddingNewUndoableStepToLog(notif) {
      if (!$(`log_${notif.logId}`)) {
        return;
      }
      let stepId = notif.msg.args.stepId;
      $(`log_${notif.logId}`).dataset.step = stepId;
      if ($(`dockedlog_${notif.mobileLogId}`)) {
        $(`dockedlog_${notif.mobileLogId}`).dataset.step = stepId;
      }

      if (this.gamedatas?.gamestate?.args?.previousSteps?.includes(parseInt(stepId))) {
        this.onClick($(`log_${notif.logId}`), () => this.undoToStep(stepId));

        if ($(`dockedlog_${notif.mobileLogId}`)) {
            this.onClick($(`dockedlog_${notif.mobileLogId}`), () => this.undoToStep(stepId));
        }
      }
    }    
    
    undoToStep(stepId: number) {
      this.stopActionTimer();
      (this as any).checkAction('actRestart');
      this.takeAction('actUndoToStep', { stepId }/*, false*/);
    }

    stopActionTimer() {
        console.warn('TODO');
    }

    public getGain(type: number): string {
        switch (type) {
            case 1: return _("Victory Point");
            case 2: return _("Bracelet");
            case 3: return _("Recruit");
            case 4: return _("Reputation");
            case 5: return _("Card");
        }
    }

    public getTooltipActivation(activation: string): string {
        switch (activation) {
            case 'anytime': return _("Ongoing (with conditions)");
            case 'decline': return _("Decline Phase");
            case 'immediate': return _("Immediate");
            case 'timeline': return _("Timeline Phase");
            case 'endgame': return _("Final Scoring");
        }
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {
                for (const property in args) {
                    /*if (['card_names'].includes(property) && args[property][0] != '<') {
                        args[property] = `<strong>${_(args[property])}</strong>`;
                    }*/
                }

                log = formatTextIcons(_(log));
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}
