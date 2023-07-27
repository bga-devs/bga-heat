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

const CONSTRUCTORS_COLORS = ['12151a', '376bbe', '26a54e', 'e52927', '979797', 'face0d']; // copy of gameinfos

function formatTextIcons(str: string) {
    return str
        .replace(/\[Heat\]/ig, '<div class="heat icon"></div>');
}

class Heat implements HeatGame {
    public animationManager: AnimationManager;
    public cardsManager: CardsManager;
    public technologyTilesManager: TechnologyTilesManager;

    private zoomManager: ZoomManager;
    private gamedatas: HeatGamedatas;
    private circuit: Circuit;
    private playersTables: PlayerTable[] = [];
    private handCounters: Counter[] = [];
    private engineCounters: Counter[] = [];
    private speedCounters: Counter[] = [];
    private turnCounters: Counter[] = [];
    
    private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

    private _notif_uid_to_log_id = [];
    private _notif_uid_to_mobile_log_id = [];
    private _last_notif;

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
        ], 
        ...Object.values(gamedatas.players).map(player => `mats/player-board-${player.color}.jpg`));

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

        this.circuit = new Circuit(this, gamedatas);
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        
        /*this.zoomManager = new ZoomManager({
            element: document.getElementById('tables'),
            smooth: false,
            zoomControls: {
                color: 'black',
            },
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
        });*/

        new HelpManager(this, { 
            buttons: [
                new BgaHelpPopinButton({
                    title: _("Card help").toUpperCase(),
                    html: this.getHelpHtml(),
                    buttonBackground: '#341819',
                }),
            ]
        });
        this.setupNotifications();
        this.setupPreferences();
        (this as any).onScreenWidthChange = () => this.circuit.setAutoZoom();

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

        /*switch (stateName) {
            case 'INMULTIdiscard':
                break;
        }*/
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

    private onEnteringPlanification(args: EnteringPlanificationArgs) {
        this.getCurrentPlayerTable().setHandSelectable((this as any).isCurrentPlayerActive() ? 'multiple' : 'none', args._private.cards, args._private.selection);
    }

    private onEnteringChooseSpeed(args: EnteringChooseSpeedArgs) {
        Object.entries(args.speeds).forEach(entry => 
            this.circuit.addMapIndicator(entry[1], () => this.actChooseSpeed(Number(entry[0])))
        );
    }

    private onEnteringSlipstream(args: EnteringSlipstreamArgs) {
        Object.entries(args.cells).forEach(entry => 
            this.circuit.addMapIndicator(entry[1], () => this.actSlipstream(Number(entry[0])))
        );
    }

    private onEnteringDiscard(args: EnteringDiscardArgs) {
        this.getCurrentPlayerTable().setHandSelectable('multiple', args._private.cardIds);
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

      (this as any).removeActionButtons();
      document.getElementById('customActions').innerHTML = '';
      document.getElementById('restartAction').innerHTML = '';

        switch (stateName) {
            case 'planification':
            case 'discard':
                this.onLeavingHandSelection();
                break;
            case 'chooseSpeed':
            case 'slipstream':
                this.onLeavingChooseSpeed();
                break;
        }
    }

    private onLeavingHandSelection() {
        this.getCurrentPlayerTable()?.setHandSelectable('none');
    }

    private onLeavingChooseSpeed() {
        this.circuit.removeMapIndicators();
    }

    // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
    //                        action status bar (ie: the HTML links in the status bar).
    //
    public onUpdateActionButtons(stateName: string, args: any) {
        switch (stateName) {
            case 'planification':
                this.onEnteringPlanification(args);
                break;
        }

        if ((this as any).isCurrentPlayerActive()) {
            switch (stateName) {
                case 'planification':
                    (this as any).addActionButton(`actPlanification_button`, '', () => this.actPlanification());
                    this.onHandCardSelectionChange([]);
                    break;
                case 'chooseSpeed':
                    const chooseSpeedArgs = args as EnteringChooseSpeedArgs;
                    this.onEnteringChooseSpeed(chooseSpeedArgs);
                    Object.entries(chooseSpeedArgs.speeds).forEach(entry => {
                        (this as any).addActionButton(`chooseSpeed${entry[0]}_button`, _('Move ${cell} cell(s)').replace('${cell}', `${entry[0]}`), () => this.actChooseSpeed(Number(entry[0])))
                        this.linkButtonHoverToMapIndicator(
                            document.getElementById(`chooseSpeed${entry[0]}_button`),
                            entry[1],
                        );
                    });
                    break;
                case 'slipstream':
                    const slipstreamArgs = args as EnteringSlipstreamArgs;
                    this.onEnteringSlipstream(slipstreamArgs);
                    Object.entries(slipstreamArgs.cells).forEach(entry => {
                        (this as any).addActionButton(`chooseSpeed${entry[0]}_button`, _('Move ${cell} cell(s)').replace('${cell}', `${entry[0]}`), () => this.actSlipstream(Number(entry[0])))
                        this.linkButtonHoverToMapIndicator(
                            document.getElementById(`chooseSpeed${entry[0]}_button`),
                            entry[1],
                        );
                    });
                    break;
                case 'react':
                    const reactArgs = args as EnteringReactArgs;
                    (this as any).addActionButton(`actPassReact_button`, _('Pass'), () => this.actPassReact());
                    Object.entries(reactArgs.symbols).forEach(entry => 
                        (this as any).addActionButton(`actReact_button`, `${entry[0]} ${entry[1]}`, () => this.actReact(entry[0])) // TODO
                    );
                    break;
                case 'discard':
                    this.onEnteringDiscard(args);
                    (this as any).addActionButton(`actDiscard_button`, '', () => this.actDiscard());
                    this.onHandCardSelectionChange([]);
                    break;
            }
        } else {
            switch (stateName) {
                case 'planification':
                    (this as any).addActionButton(`actCancelSelection_button`, _('Cancel'), () => this.actCancelSelection(), null, null, 'gray');
                    break;
            }
        }
    }

    private linkButtonHoverToMapIndicator(btn: HTMLElement, cellId: number) {
        const mapIndicator = document.getElementById(`map-indicator-${cellId}`);
        btn.addEventListener('mouseenter', () => mapIndicator?.classList.add('hover'));
        btn.addEventListener('mouseleave', () => mapIndicator?.classList.remove('hover'));
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
        const players = Object.values(gamedatas.players).sort((a, b) => a.no - b.no);
        const playerIndex = players.findIndex(player => Number(player.id) === Number((this as any).player_id));
        const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
        return orderedPlayers;
    }

    private createPlayerPanels(gamedatas: HeatGamedatas) {

        Object.values(gamedatas.players).forEach(player => {
            const playerId = Number(player.id);
            const constructor = this.getPlayerConstructor(playerId);

            let html = `<div class="counters">
                <div id="playerhand-counter-wrapper-${player.id}" class="playerhand-counter">
                    <div class="player-hand-card"></div> 
                    <span id="playerhand-counter-${player.id}"></span>
                </div>
                <div id="engine-counter-wrapper-${player.id}" class="engine-counter">
                    <div class="engine icon"></div>
                    <span id="engine-counter-${player.id}"></span>
                </div>
            </div>
            <div class="counters">
                <div id="speed-counter-wrapper-${player.id}" class="speed-counter">
                    <div class="speed icon"></div>
                    <span id="speed-counter-${player.id}">-</span>
                </div>
                <div id="turn-counter-wrapper-${player.id}" class="turn-counter">
                    <div class="turn icon"></div>
                    <span id="turn-counter-${player.id}">-</span> / ${gamedatas.nbrLaps}
                </div>
            </div>
            <div class="counters">
                <div>
                    <div id="order-${player.id}" class="order-counter">
                        ${constructor.no + 1}
                    </div>
                </div>
            </div>`;

            dojo.place(html, `player_board_${player.id}`);


            this.handCounters[playerId] = new ebg.counter();
            this.handCounters[playerId].create(`playerhand-counter-${playerId}`);
            this.handCounters[playerId].setValue(constructor.handCount);

            this.engineCounters[playerId] = new ebg.counter();
            this.engineCounters[playerId].create(`engine-counter-${playerId}`);
            this.engineCounters[playerId].setValue(Object.values(constructor.engine).length);

            this.speedCounters[playerId] = new ebg.counter();
            this.speedCounters[playerId].create(`turn-counter-${playerId}`);
            if (constructor.speed !== null && constructor.speed >= 0) {
                this.speedCounters[playerId].setValue(constructor.speed);
            }

            this.turnCounters[playerId] = new ebg.counter();
            this.turnCounters[playerId].create(`turn-counter-${playerId}`);
            if (constructor.turn >= 0) {
                this.turnCounters[playerId].setValue(constructor.turn + 1);
            }
        });

        this.setTooltipToClass('playerhand-counter', _('Hand cards count'));
        this.setTooltipToClass('engine-counter', _('Engine cards count'));
        this.setTooltipToClass('speed-counter', _('Speed'));
        this.setTooltipToClass('turn-counter', _('Turns'));
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

    private getHelpHtml() {
        let html = `
        <div id="help-popin">
            <h1>${_("Assets")}</h2>
            TODO
        </div>`;

        return html;
    }
    
    public onHandCardSelectionChange(selection: Card[]): void {
        if (this.gamedatas.gamestate.name == 'planification') {
            const table = this.getCurrentPlayerTable();
            const gear = table.getCurrentGear();

            const minAllowed = Math.max(1, gear - 2);
            const maxAllowed = Math.min(4, gear + 2);
            const allowed = selection.length >= minAllowed && selection.length <= maxAllowed;
            const label = allowed ? 
                _('Set gear to ${gear} an play selected cards').replace('${gear}', `${selection.length}`) + (Math.abs(selection.length - gear) == 2 ? formatTextIcons(' (+1 [Heat])') : '') :
                _('Select between ${min} and ${max} cards').replace('${min}', `${minAllowed}`).replace('${max}', `${maxAllowed}`);

            document.getElementById(`player-table-${table.playerId}-gear`).dataset.gear = `${allowed ? selection.length : gear}`;

            const button = document.getElementById('actPlanification_button');
            button.innerHTML = label;
            button.classList.toggle('disabled', !allowed);
        } else
        if (this.gamedatas.gamestate.name == 'discard') {
            const label = selection.length ? 
                _('Discard ${number} selected cards').replace('${number}', `${selection.length}`) :
                _('No additional discard');

            const button = document.getElementById('actDiscard_button');
            button.innerHTML = label;
        }
    }
  	
    public actPlanification() {
        if(!(this as any).checkAction('actPlan')) {
            return;
        }

        const selectedCards = this.getCurrentPlayerTable().hand.getSelection();

        this.takeAction('actPlan', {
            cardIds: JSON.stringify(selectedCards.map(card => card.id)),
        });
    }
  	
    public actCancelSelection() {
        this.takeAction('actCancelSelection');
    }
    
    private actChooseSpeed(speed: number) {
        if(!(this as any).checkAction('actChooseSpeed')) {
            return;
        }

        this.takeAction('actChooseSpeed', {
            speed
        });
    }
    
    private actSlipstream(speed: number) {
        if(!(this as any).checkAction('actSlipstream')) {
            return;
        }

        this.takeAction('actSlipstream', {
            speed
        });
    }
    
    private actPassReact() {
        if(!(this as any).checkAction('actPassReact')) {
            return;
        }

        this.takeAction('actPassReact');
    }
  	
    public actReact(react: string) {
        if(!(this as any).checkAction('actReact')) {
            return;
        }

        this.takeAction('actReact', {
            react
        });
    }
  	
    public actDiscard() {
        if(!(this as any).checkAction('actDiscard')) {
            return;
        }

        const selectedCards = this.getCurrentPlayerTable().hand.getSelection();

        this.takeAction('actDiscard', {
            cardIds: JSON.stringify(selectedCards.map(card => card.id)),
        });
    }
  	
    /*public actConfirmPartialTurn() {
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
    }*/

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
            ['updatePlanification', ANIMATION_MS],
            ['reveal', undefined],
            ['moveCar', ANIMATION_MS],
            ['updateTurnOrder', 1],
            ['payHeatsForCorner', ANIMATION_MS],
            ['discard', ANIMATION_MS],
            ['pDiscard', ANIMATION_MS],
            ['draw', ANIMATION_MS],
            ['pDraw', ANIMATION_MS],
            ['clearPlayedCards', ANIMATION_MS],
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

        (this as any).notifqueue.setIgnoreNotificationCheck('discard', (notif: Notif<any>) => 
            this.getPlayerIdFromConstructorId(notif.args.player_id) == this.getPlayerId()
        );
        (this as any).notifqueue.setIgnoreNotificationCheck('draw', (notif: Notif<any>) => 
            this.getPlayerIdFromConstructorId(notif.args.player_id) == this.getPlayerId()
        );
    }
    
    notif_updatePlanification(args: NotifUpdatePlanificationArgs) {
        // TODO
    }  

    notif_reveal(args: NotifRevealArgs) {
        const { constructor_id, gear, cards, heat } = args;
        const playerTable = this.getPlayerTable(this.gamedatas.constructors[constructor_id].pId);
        playerTable.setCurrentGear(gear);
        return Promise.all([
            playerTable.setInplay(Object.values(cards)),
            // TODO discard Heat card
        ]);
    }  

    notif_moveCar(args: NotifMoveCarArgs) {
        const { constructor_id, cell } = args;
        this.circuit.moveCar(constructor_id, cell);
    } 

    notif_updateTurnOrder(args: NotifUpdateTurnOrderArgs) {
        const { constructor_ids } = args;
        constructor_ids.forEach((constructorId: number, index: number) => {
            const playerId = this.getPlayerIdFromConstructorId(constructorId);
            if (playerId) {
                document.getElementById(`order-${playerId}`).innerHTML = `${index + 1}`;
            }
        });
    }

    notif_payHeatsForCorner(args: NotifPayHeatsForCornerArgs) {
        // TODO
    }

    private getPlayerIdFromConstructorId(constructorId: number): number | undefined {
        return this.gamedatas.constructors[constructorId]?.pId;
    }

    notif_draw(args: NotifCardsArgs) {
        this.handCounters[this.getPlayerIdFromConstructorId(args.constructor_id)].incValue(args.n);
    }

    notif_discard(args: NotifCardsArgs) {
        this.handCounters[this.getPlayerIdFromConstructorId(args.constructor_id)].incValue(-args.n);
    }

    notif_pDraw(args: NotifPCardsArgs) {
        const cards = Object.values(args.cards);
        this.handCounters[this.getPlayerIdFromConstructorId(args.constructor_id)].incValue(cards.length);
        this.getCurrentPlayerTable().hand.addCards(cards);
    }

    notif_pDiscard(args: NotifPCardsArgs) {
        const cards = Object.values(args.cards);
        this.handCounters[this.getPlayerIdFromConstructorId(args.constructor_id)].incValue(-cards.length);
        this.getCurrentPlayerTable().hand.removeCards(cards);
    }

    notif_clearPlayedCards(args: NotifClearPlayedCardsArgs) {
        const { constructor_id, cardIds } = args;
        const playerTable = this.getPlayerTable(this.gamedatas.constructors[constructor_id].pId);
        playerTable.clearPlayedCards(cardIds);
    }
    
    /*
    * [Undocumented] Called by BGA framework on any notification message
    * Handle cancelling log messages for restart turn
    */
    /* @Override */
    public onPlaceLogOnChannel(msg: any) {
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

    private coloredConstructorName(constructorName: string): string {
        return `<span style="font-weight: bold; color: #${CONSTRUCTORS_COLORS[Object.values(this.gamedatas.constructors).find(constructor => constructor.name == constructorName).id]}">${constructorName}</span>`;
    }

    private cardImageHtml(card: Card, args: any) {
        const constructorId = args.constructor_id ?? Object.values(this.gamedatas.constructors).find(constructor => constructor.pId == this.getPlayerId())?.id;
        return `<div class="log-card-image" style="--personal-card-background-y: ${constructorId * 100 / 6}%;">${this.cardsManager.getHtml(card)}</div>`;
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

                if (args.card_image === '' && args.card) {
                    args.card_image = this.cardImageHtml(args.card, args);
                }

                if (args.cards_images === '' && args.cards) {
                    args.cards_images = Object.values(args.cards).map((card: Card) => this.cardImageHtml(card, args)).join('');
                }
                
                let constructorKeys = Object.keys(args).filter((key) => key.substring(0, 16) == 'constructor_name');
                constructorKeys.filter(key => args[key][0] != '<').forEach((key) => {
                    args[key] = this.coloredConstructorName(args[key]);
                });

                log = formatTextIcons(_(log));
            }
        } catch (e) {
            console.error(log,args,"Exception thrown", e.stack);
        }
        return (this as any).inherited(arguments);
    }
}
