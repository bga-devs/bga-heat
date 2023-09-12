declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const g_img_preload;

const ANIMATION_MS = 500;
const MIN_NOTIFICATION_MS = 1200;
const ACTION_TIMER_DURATION = 5;

const LOCAL_STORAGE_ZOOM_KEY = 'Heat-zoom';
const LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'Heat-jump-to-folded';

const CONSTRUCTORS_COLORS = ['12151a', '376bbe', '26a54e', 'e52927', '979797', 'face0d']; // copy of gameinfos

function sleep(ms: number){
    return new Promise((r) => setTimeout(r, ms));
}

class Heat implements HeatGame {
    public animationManager: AnimationManager;
    public cardsManager: CardsManager;
    public legendCardsManager: LegendCardsManager;

    private zoomManager: ZoomManager;
    private gamedatas: HeatGamedatas;
    private circuit: Circuit;
    private playersTables: PlayerTable[] = [];
    private legendTable?: LegendTable;
    private handCounters: Counter[] = [];
    private engineCounters: Counter[] = [];
    private speedCounters: Counter[] = [];
    private lapCounters: Counter[] = [];
    private market?: LineStock<Card>;
    
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
        

        if (gamedatas.circuitDatas?.jpgUrl && !gamedatas.circuitDatas.jpgUrl.startsWith('http')) {
            g_img_preload.push(gamedatas.circuitDatas.jpgUrl);
        }
        g_img_preload.push(...Object.values(gamedatas.players).map(player => `mats/player-board-${player.color}.jpg`));

        // Create a new div for buttons to avoid BGA auto clearing it
        dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
        dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');

        log('gamedatas', gamedatas);

        this.animationManager = new AnimationManager(this);
        this.cardsManager = new CardsManager(this);
        this.legendCardsManager = new LegendCardsManager(this);
        
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
        
        this.zoomManager = new ZoomManager({
            element: document.getElementById('tables'),
            smooth: false,
            zoomControls: {
                color: 'black',
            },
            defaultZoom: 0.75,
            localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
        });

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

        if (args.args?.descSuffix) {
          this.changePageTitle(args.args.descSuffix);
        }
  
        if (args.args?.optionalAction) {
          let base = args.args.descSuffix ? args.args.descSuffix : '';
          this.changePageTitle(base + 'skippable');
        }

        if (/* TODO? this._activeStates.includes(stateName) ||*/ (this as any).isCurrentPlayerActive()) {  
            if (args.args?.optionalAction && !args.args.automaticAction) {
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
            case 'uploadCircuit':
                this.onEnteringStateUploadCircuit(args.args);
                break;
            case 'chooseUpgrade':
                this.onEnteringChooseUpgrade(args.args);
                break;
            case 'swapUpgrade':
                this.onEnteringSwapUpgrade(args.args);
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

    private onEnteringStateUploadCircuit(args) {
        // this.clearInterface();
        document.getElementById('circuit').insertAdjacentHTML('beforeend', `
        <div id="circuit-dropzone-container">
            <div id="circuit-dropzone">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M384 0v128h128L384 0zM352 128L352 0H176C149.5 0 128 21.49 128 48V288h174.1l-39.03-39.03c-9.375-9.375-9.375-24.56 0-33.94s24.56-9.375 33.94 0l80 80c9.375 9.375 9.375 24.56 0 33.94l-80 80c-9.375 9.375-24.56 9.375-33.94 0C258.3 404.3 256 398.2 256 392s2.344-12.28 7.031-16.97L302.1 336H128v128C128 490.5 149.5 512 176 512h288c26.51 0 48-21.49 48-48V160h-127.1C366.3 160 352 145.7 352 128zM24 288C10.75 288 0 298.7 0 312c0 13.25 10.75 24 24 24H128V288H24z"/></svg>

            <input type="file" id="circuit-input" />
            <label for="circuit-input">${_('Choose circuit')}</label>
            <h5>${_('or drag & drop your .heat file here')}</h5>
            </div>
        </div>
        `);
  
        $('circuit-input').addEventListener('change', (e) => this.uploadCircuit(e.target.files[0]));
        let dropzone = $('circuit-dropzone-container');
        let toggleActive = (b) => {
          return (e) => {
            e.preventDefault();
            dropzone.classList.toggle('active', b);
          };
        };
        dropzone.addEventListener('dragenter', toggleActive(true));
        dropzone.addEventListener('dragover', toggleActive(true));
        dropzone.addEventListener('dragleave', toggleActive(false));
        dropzone.addEventListener('drop', (e) => {
          toggleActive(false)(e);
          this.uploadCircuit(e.dataTransfer.files[0]);
        });
    }

    private uploadCircuit(file) {
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener('load', (e) => {
          let content = e.target.result;
          let circuit = JSON.parse(content as string);
          this.takeAction('actUploadCircuit', { circuit: JSON.stringify(circuit), method: 'post' });
        });
    }

    private initMarketStock() {
        if (!this.market) {
            document.getElementById('table-center').insertAdjacentHTML('beforebegin', `
                <div id="market"></div>
            `);
            this.market = new LineStock<Card>(this.cardsManager, document.getElementById(`market`));
            this.market.onSelectionChange = selection => this.onMarketSelectionChange(selection);
        }
    }

    private onEnteringChooseUpgrade(args: EnteringChooseUpgradeArgs) {
        this.initMarketStock();
        this.market.addCards(Object.values(args.market));

        this.market.setSelectionMode((this as any).isCurrentPlayerActive() ? 'single' : 'none');
    }

    private onEnteringSwapUpgrade(args: EnteringSwapUpgradeArgs) {
        this.initMarketStock();
        this.market.addCards(Object.values(args.market));

        this.market.setSelectionMode((this as any).isCurrentPlayerActive() ? 'single' : 'none');
        if ((this as any).isCurrentPlayerActive()) {
            const hand = this.getCurrentPlayerTable().hand;
            hand.removeAll();
            hand.addCards(Object.values(args.owned));
            hand.setSelectionMode('single');
        }
    }

    private onEnteringPlanification(args: EnteringPlanificationArgs) {
        if (args._private) {
            this.getCurrentPlayerTable().setHandSelectable((this as any).isCurrentPlayerActive() ? 'multiple' : 'none', args._private.cards, args._private.selection);
        }
    }

    private onEnteringChooseSpeed(args: EnteringChooseSpeedArgs) {
        Object.entries(args.speeds).forEach(entry => 
            this.circuit.addMapIndicator(entry[1], () => this.actChooseSpeed(Number(entry[0])))
        );
    }

    private onEnteringSlipstream(args: EnteringSlipstreamArgs) {
        Object.entries(args.cells).forEach(entry => 
            this.circuit.addMapIndicator(entry[1][0], () => this.actSlipstream(Number(entry[0])))
        );
    }

    private onEnteringDiscard(args: EnteringDiscardArgs) {
        this.getCurrentPlayerTable().setHandSelectable('multiple', args._private.cardIds);
    }

    private onEnteringSalvage(args: EnteringSalvageArgs) {
        if (!this.market) {
            document.getElementById('table-center').insertAdjacentHTML('beforebegin', `
                <div id="market"></div>
            `);
            this.market = new LineStock<Card>(this.cardsManager, document.getElementById(`market`));
            this.market.onSelectionChange = selection => {
                document.getElementById(`actSalvage_button`).classList.toggle('disabled', selection.length > args.n);
            }
        }
        // negative ids to not mess with deck pile
        this.market.addCards(Object.values(args._private.cards).map(card => ({...card, id: -card.id })));

        this.market.setSelectionMode((this as any).isCurrentPlayerActive() ? 'multiple' : 'none');
    }

    public onLeavingState(stateName: string) {
        log( 'Leaving state: '+stateName );

      (this as any).removeActionButtons();
      document.getElementById('customActions').innerHTML = '';
      document.getElementById('restartAction').innerHTML = '';

        switch (stateName) {
            case 'planification':
                this.onLeavingPlanification();
                break;
            case 'chooseSpeed':
            case 'slipstream':
                this.onLeavingChooseSpeed();
                break;
            case 'discard':
                this.onLeavingHandSelection();
                break;
            case 'salvage':
                this.onLeavingSalvage();
                break;
        }
    }

    private onLeavingChooseSpeed() {
        this.circuit.removeMapIndicators();
    }

    private onLeavingPlanification() {
        this.onLeavingHandSelection();
        this.circuit.removeMapIndicators();
    }

    private onLeavingHandSelection() {
        this.getCurrentPlayerTable()?.setHandSelectable('none');
    }

    private onLeavingSalvage() {
        document.getElementById('market')?.remove();
        this.market = null;
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
                case 'chooseUpgrade':
                    (this as any).addActionButton(`actChooseUpgrade_button`, _('Take selected card'), () => this.actChooseUpgrade());
                    document.getElementById(`actChooseUpgrade_button`).classList.add('disabled');
                    break;
                case 'swapUpgrade':
                    (this as any).addActionButton(`actSwapUpgrade_button`, _('Swap selected cards'), () => this.actSwapUpgrade());
                    document.getElementById(`actSwapUpgrade_button`).classList.add('disabled');
                    (this as any).addActionButton(`actPassSwapUpgrade_button`, _('Pass'), () => this.actPassSwapUpgrade(), null, null, 'red');
                    break;

                case 'planification':
                    (this as any).addActionButton(`actPlanification_button`, '', () => this.actPlanification());
                    this.onHandCardSelectionChange(this.getCurrentPlayerTable().hand.getSelection());
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
                            entry[1][0],
                        );
                    });
                    (this as any).addActionButton(`actPassSlipstream_button`, _('Pass'), () => this.actSlipstream(0));
                    break;
                case 'react':
                    const reactArgs = args as EnteringReactArgs;
                    (this as any).addActionButton(`actPassReact_button`, _('Pass'), () => this.actPassReact());
                    if (!reactArgs.canPass) {
                        document.getElementById(`actPassReact_button`).classList.add('disabled');
                    }

                    Object.entries(reactArgs.symbols).forEach((entry, index) => {
                        const type = entry[0];
                        const numbers = Array.isArray(entry[1]) ? entry[1] : [entry[1]];
                        numbers.forEach(number => {
                            let label = ``;
                            let tooltip = ``;
                            switch (type) {
                                case 'accelerate':
                                    //label = `+1 [Speed]<br>${this.cardImageHtml(this.getCurrentPlayerTable().inplay.getCards().find(card => card.id == number), { constructor_id: this.getConstructorId() })}`;
                                    label = `+${reactArgs.flippedCards} [Speed]<br>(${_(this.getCurrentPlayerTable().inplay.getCards().find(card => card.id == number).text) })`;
                                    tooltip = this.getGarageModuleIconTooltip('accelerate', reactArgs.flippedCards);
                                    break;
                                case 'adjust':
                                    label = `<div class="icon adjust" style="color: #${number > 0 ? '438741' : 'a93423'};">${number > 0 ? `+${number}` : number}</div>`;
                                    tooltip = this.getGarageModuleIconTooltip('adjust', number);
                                    break;
                                case 'adrenaline':
                                    label = `+${number} [Speed]`;
                                    tooltip = `
                                    <strong>${_("Adrenaline")}</strong>
                                    <br><br>
                                    ${_("Adrenaline can help the last player (or two last cars in a race with 5 cars or more) to move each round. If you have adrenaline, you may add 1 extra speed (move your car 1 extra Space).")}
                                    <br><br>
                                    <i>${_("Note: Adrenaline cannot be saved for future rounds")}</i>`;
                                    break;
                                case 'cooldown':
                                    label = `${number} [Cooldown]`;
                                    const heats = this.getCurrentPlayerTable().hand.getCards().filter(card => card.effect == 'heat').length;
                                    if (heats < number) {
                                        label += `(- ${heats} [Heat])`;
                                    }
                                    tooltip = this.getGarageModuleIconTooltip('cooldown', number) + _("You gain access to Cooldown in a few ways but the most common is from driving in 1st gear (Cooldown 3) and 2nd gear (Cooldown 1).");
                                    break;
                                case 'direct':
                                    label = `<div class="icon direct"></div><br>(${_(this.getCurrentPlayerTable().inplay.getCards().find(card => card.id == number).text) })`;
                                    tooltip = this.getGarageModuleIconTooltip('direct', 1);
                                    break;
                                case 'heat':
                                    label = `<div class="icon forced-heat">${number}</div>`;
                                    tooltip = this.getGarageModuleIconTooltip('heat', number);
                                    break;
                                case 'boost':
                                case 'heated-boost':
                                    label = `[Boost] > [Speed]`;
                                    if (type == 'heated-boost') {
                                        label += ` (1[Heat])`;
                                    }
                                    tooltip = `
                                    <strong>${_("Boost")}</strong>
                                    <br><br>
                                    ${_("You may boost once per turn to increase your speed. If you decide to Boost, pay 1 Heat to flip the top card of your draw deck until you draw a Speed card (discard all other cards as you do when playing Stress cards). Move your car accordingly.")}
                                    <br><br>
                                    <i>${_("Note: Boost increases your Speed value for the purpose of the Check Corner step.")}</i>`;
                                    break;
                                case 'reduce':
                                    label = `<div class="icon reduce-stress">${number}</div>`;
                                    tooltip = this.getGarageModuleIconTooltip('reduce', number);
                                    break;
                                case 'refresh':
                                    label = `<div class="icon refresh"></div>`;
                                    tooltip = this.getGarageModuleIconTooltip('refresh', 1);
                                    break;
                                case 'salvage':
                                    label = `<div class="icon salvage">${number}</div>`;
                                    tooltip = this.getGarageModuleIconTooltip('salvage', number);
                                    break;
                                case 'scrap':
                                    label = `<div class="icon scrap">${number}</div>`;
                                    tooltip = this.getGarageModuleIconTooltip('scrap', number);
                                    break;
                            }

                            let callback = () => this.actReact(type, Array.isArray(entry[1]) ? number : undefined);
                            if (type == 'refresh') {
                                if (!reactArgs.canPass) {
                                    callback = () => (this as any).showMessage(_("You must resolve the mandatory reactions before Refresh !"), 'error');
                                } else if (Object.keys(reactArgs.symbols).some(t => t != 'refresh')) {
                                    callback = () => (this as any).confirmationDialog(
                                        _("If you use Refresh now, it will skip the other optional reactions."),
                                        () => this.actReact(type, Array.isArray(entry[1]) ? number : undefined)
                                    );
                                }
                            }

                            (this as any).addActionButton(`actReact${type}_${number}_button`, formatTextIcons(label), callback);
                            this.setTooltip(`actReact${type}_${number}_button`, tooltip);
                        });
                    });
                    break;
                case 'discard':
                    this.onEnteringDiscard(args);
                    (this as any).addActionButton(`actDiscard_button`, '', () => this.actDiscard());
                    this.onHandCardSelectionChange([]);
                    break;
                case 'salvage':
                    this.onEnteringSalvage(args);
                    (this as any).addActionButton(`actSalvage_button`, _('Salvage selected cards'), () => this.actSalvage());
                    document.getElementById(`actSalvage_button`).classList.add('disabled');
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

    private getConstructorId(): number {
        return Number(Object.values(this.gamedatas.constructors).find(constructor => constructor.pId == this.getPlayerId()).id);
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

    public getGarageModuleIconTooltip(symbol: string, number: number): string {
        switch (symbol) {
            case 'accelerate':
                return `
                    <strong>${_("Accelerate")}</strong>
                    <br>
                    ${ _("You may increase your Speed by ${number} for every card flipped this turn (from Upgrades, Stress and Boost). If you do, you must increase it for all the flipped cards.").replace('${number}', number) }
                `;
            case 'adjust':
                return `
                    <strong>${_("Adjust Speed Limit")}</strong>
                    <br>
                    ${ (number > 0 ? _("Speed limit is ${number} higher.") : _("Speed limit is ${number} lower.")).replace('${number}', number) }
                `;
            case 'boost':
                return `
                    <strong>${_("Boost")}</strong>
                    <br>
                    ${_("Flip the top card of your draw deck until you draw a Speed card (discard all other cards as you do when playing Stress cards). Move your car accordingly.")}
                    <br>
                    <i>${_("Note: Boost increases your Speed value for the purpose of the Check Corner step.")}</i>
                `;
            case 'cooldown':
                return `
                    <strong>${_("Cooldown")}</strong>
                    <br>
                    ${_("Cooldown allows you to take ${number} Heat card(s) from your hand and put it back in your Engine (so you can use the Heat card again). ").replace('${number}', number) }
                `;
            case 'direct':
                return `
                    <strong>${_("Direct Play")}</strong>
                    <br>
                    ${ _("You may play this card from your hand. If you do, it applies as if you played it normally, including Speed and mandatory/optional icons.") }
                `;
            case 'heat':
                return `
                    <strong>${_("Heat")}</strong>
                    <br>
                    ${ _("Take ${number} Heat cards from the Engine and move them to your discard pile.").replace('${number}', number) }
                `;
            case 'reduce':
                return `
                    <strong>${_("Reduce Stress")}</strong>
                    <br>
                    ${ _("You may immediately discard up to ${number} Stress cards from your hand to the discard pile.").replace('${number}', number) }
                `;
            case 'refresh':
                return `
                    <strong>${_("Refresh")}</strong>
                    <br>
                    ${ _("You may place this card back on top of your draw deck at the end of the React step.") }
                `;
            case 'salvage':
                return `
                    <strong>${_("Salvage")}</strong>
                    <br>
                    ${ _("You may look through your discard pile and choose up to ${number} cards there. These cards are shuffled into your draw deck.").replace('${number}', number) }
                `;
            case 'scrap':
                return `
                    <strong>${_("Scrap")}</strong>
                    <br>
                    ${ _("Take ${number} cards from the top of your draw deck and flip them into your discard pile.").replace('${number}', number) }
                `;
            case 'slipstream':
                return `
                    <strong>${_("Slipstream boost")}</strong>
                    <br>
                    ${ _("If you choose to Slipstream, your typical 2 Spaces may be increased by ${number}.").replace('${number}', number) }
                `;
        }
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
        const constructors = Object.values(gamedatas.constructors)
        constructors.filter(constructor => constructor.ai).forEach(constructor => {
            document.getElementById('player_boards').insertAdjacentHTML('beforeend', `
            <div id="overall_player_board_${constructor.pId}" class="player-board current-player-board">					
                <div class="player_board_inner" id="player_board_inner_982fff">
                    
                    <div class="emblemwrap" id="avatar_active_wrap_${constructor.id}">
                        <div src="img/gear.png" alt="" class="avatar avatar_active legend_avatar" id="avatar_active_${constructor.id}" style="--constructor-id: ${constructor.id}"></div>
                    </div>
                                               
                    <div class="player-name" id="player_name_${constructor.id}">
                        ${constructor.name}
                    </div>
                    <div id="player_board_${constructor.pId}" class="player_board_content">
                        <div class="player_score">
                            <span id="player_score_${constructor.pId}" class="player_score_value">-</span> <i class="fa fa-star" id="icon_point_${constructor.id}"></i>           
                        </div>
                    </div>
                </div>
            </div>`);
        });

        constructors.forEach(constructor => {

            let html = constructor.ai ? '' : `<div class="counters">
                <div id="playerhand-counter-wrapper-${constructor.id}" class="playerhand-counter">
                    <div class="player-hand-card"></div> 
                    <span id="playerhand-counter-${constructor.id}"></span>
                </div>
                <div id="engine-counter-wrapper-${constructor.id}" class="engine-counter">
                    <div class="engine icon"></div>
                    <span id="engine-counter-${constructor.id}"></span>
                </div>
            </div>`;
            html += `
            <div class="counters">
                <div id="speed-counter-wrapper-${constructor.id}" class="speed-counter">
                    <div class="speed icon"></div>
                    <span id="speed-counter-${constructor.id}">-</span>
                </div>
                <div id="lap-counter-wrapper-${constructor.id}" class="lap-counter">
                    <div class="flag icon"></div>
                    <span id="lap-counter-${constructor.id}">-</span> / <span class="nbr-laps">${gamedatas.nbrLaps || '?'}</span>
                </div>
            </div>
            <div class="counters">
                <div>
                    <div id="order-${constructor.id}" class="order-counter">
                        ${constructor.no + 1}
                    </div>
                </div>
                <div id="podium-wrapper-${constructor.id}" class="podium-counter">
                    <div class="podium icon"></div>
                    <span id="podium-counter-${constructor.id}"></span>
                </div>
            </div>`;

            dojo.place(html, `player_board_${constructor.pId}`);

            if (!constructor.ai) {
                this.handCounters[constructor.id] = new ebg.counter();
                this.handCounters[constructor.id].create(`playerhand-counter-${constructor.id}`);
                this.handCounters[constructor.id].setValue(constructor.handCount);

                this.engineCounters[constructor.id] = new ebg.counter();
                this.engineCounters[constructor.id].create(`engine-counter-${constructor.id}`);
                this.engineCounters[constructor.id].setValue(Object.values(constructor.engine).length);
            }

            this.speedCounters[constructor.id] = new ebg.counter();
            this.speedCounters[constructor.id].create(`speed-counter-${constructor.id}`);
            if (constructor.speed !== null && constructor.speed >= 0) {
                this.speedCounters[constructor.id].setValue(constructor.speed);
            }

            this.lapCounters[constructor.id] = new ebg.counter();
            this.lapCounters[constructor.id].create(`lap-counter-${constructor.id}`);
            this.lapCounters[constructor.id].setValue(Math.max(1, Math.min(gamedatas.nbrLaps, constructor.turn + 1)));

            if (constructor.carCell < 0) {
                this.setRank(constructor.id, -constructor.carCell);
            }
        });

        this.setTooltipToClass('playerhand-counter', _('Hand cards count'));
        this.setTooltipToClass('engine-counter', _('Engine cards count'));
        this.setTooltipToClass('speed-counter', _('Speed'));
        this.setTooltipToClass('lap-counter', _('Laps'));
        this.setTooltipToClass('order-counter', _('Player order'));
        this.setTooltipToClass('podium-counter', _('Rank'));
    }

    private createPlayerTables(gamedatas: HeatGamedatas) {
        const orderedPlayers = this.getOrderedPlayers(gamedatas);

        orderedPlayers.forEach(player => 
            this.createPlayerTable(gamedatas, Number(player.id))
        );
        
        if (gamedatas.isLegend) {
            this.legendTable = new LegendTable(this, gamedatas.legendCard);
        }
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

    private getPossibleSpeeds(selectedCards: Card[], args: EnteringPlanificationPrivateArgs) {
        let speeds = [0];
        selectedCards.forEach(card => {
          let t = [];
          let cSpeeds = args.speeds[card.id];
          if (!Array.isArray(cSpeeds)) {
            cSpeeds = [cSpeeds];
          }
  
          cSpeeds.forEach(cSpeed => {
            speeds.forEach(speed => {
              t.push(cSpeed + speed);
            })
          })
  
          speeds = t;
        });

       return speeds;
    }
    
    public onHandCardSelectionChange(selection: Card[]): void {
        if (this.gamedatas.gamestate.name == 'planification') {
            const table = this.getCurrentPlayerTable();
            const gear = table.getCurrentGear();

            const minAllowed = Math.max(1, gear - 2);
            const maxAllowed = Math.min(4, gear + 2);
            let allowed = selection.length >= minAllowed && selection.length <= maxAllowed;
            const useHeat = allowed && Math.abs(selection.length - gear) == 2;
            const label = allowed ? 
                _('Set gear to ${gear} and play selected cards').replace('${gear}', `${selection.length}`) + (useHeat ? formatTextIcons(' (+1 [Heat])') : '') :
                _('Select between ${min} and ${max} cards').replace('${min}', `${minAllowed}`).replace('${max}', `${maxAllowed}`);

            document.getElementById(`player-table-${table.playerId}-gear`).dataset.gear = `${allowed ? selection.length : gear}`;

            const button = document.getElementById('actPlanification_button');
            button.innerHTML = label;
            // we let the user able to click, so the back will explain in the error why he can't
            /*if (allowed && useHeat && this.engineCounters[this.getConstructorId()].getValue() == 0) {
                allowed = false;
            }*/
            button.classList.toggle('disabled', !allowed);

            this.circuit.removeMapIndicators();
            const privateArgs: EnteringPlanificationPrivateArgs = this.gamedatas.gamestate.args._private;
            if (selection.length && privateArgs) {
                const totalSpeeds = this.getPossibleSpeeds(selection, privateArgs);
                const stressCardsSelected = selection.filter(card => card.effect == 'stress').length > 0;
                totalSpeeds.forEach(totalSpeed => this.circuit.addMapIndicator(privateArgs.cells[totalSpeed], undefined, stressCardsSelected));
            }

        } else if (this.gamedatas.gamestate.name == 'discard') {
            const label = selection.length ? 
                _('Discard ${number} selected cards').replace('${number}', `${selection.length}`) :
                _('No additional discard');

            const button = document.getElementById('actDiscard_button');
            button.innerHTML = label;
        } else if (this.gamedatas.gamestate.name == 'swapUpgrade') {
            this.checkSwapUpgradeSelectionState();
        }
    }
    
    public onMarketSelectionChange(selection: Card[]): void {
        if (this.gamedatas.gamestate.name == 'chooseUpgrade') {
            document.getElementById(`actChooseUpgrade_button`).classList.toggle('disabled', selection.length != 1);
        } else if (this.gamedatas.gamestate.name == 'swapUpgrade') {
            this.checkSwapUpgradeSelectionState();
        }
    }

    private checkSwapUpgradeSelectionState() {
        const marketSelection = this.market?.getSelection() ?? [];
        const handSelection = this.getCurrentPlayerTable()?.hand?.getSelection() ?? [];
        document.getElementById(`actSwapUpgrade_button`).classList.toggle('disabled', marketSelection.length != 1 || handSelection.length != 1);
    }

    private actChooseUpgrade() {
        if(!(this as any).checkAction('actChooseUpgrade')) {
            return;
        }

        this.takeAction('actChooseUpgrade', {
            cardId: this.market.getSelection()[0].id,
        });
    }

    private actSwapUpgrade() {
        if(!(this as any).checkAction('actSwapUpgrade')) {
            return;
        }

        this.takeAction('actSwapUpgrade', {
            marketCardId: this.market.getSelection()[0].id,
            ownedCardId: this.getCurrentPlayerTable().hand.getSelection()[0].id,
        });
    }

    private actPassSwapUpgrade() {
        if(!(this as any).checkAction('actPassSwapUpgrade')) {
            return;
        }

        this.takeAction('actPassSwapUpgrade');
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
  	
    public actReact(symbol: string, arg?: number) {
        if(!(this as any).checkAction('actReact')) {
            return;
        }

        this.takeAction('actReact', {
            symbol,
            arg
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
  	
    public actSalvage() {
        if(!(this as any).checkAction('actSalvage')) {
            return;
        }

        const selectedCards = this.market.getSelection();

        this.takeAction('actSalvage', {
            cardIds: JSON.stringify(selectedCards.map(card => -card.id)),
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
        const method = data.method === undefined ? 'get' : data.method;
        (this as any).ajaxcall(`/heat/heat/${action}.html`, data, this, () => {}, undefined, method);
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
            'loadCircuit',
            'chooseUpgrade',
            'swapUpgrade',
            'endDraftRound',
            'reformingDeckWithUpgrades',
            'updatePlanification',
            'reveal',
            'moveCar',
            'updateTurnOrder',
            'payHeats',
            'adrenaline',
            'spinOut',
            'discard',
            'pDiscard',
            'draw',
            'pDraw',
            'clearPlayedCards',
            'cooldown',
            'finishRace',
            'endOfRace',
            'newLegendCard',
            'scrapCards',
            'resolveBoost',
            'accelerate',
            'salvageCards',
        ];
        
    
        notifs.forEach((notifName) => {
            dojo.subscribe(notifName, this, (notifDetails: Notif<any>) => {
                log(`notif_${notifName}`, notifDetails.args);

                const promise = this[`notif_${notifName}`](notifDetails.args);
                const promises = promise ? [promise] : [];
                let minDuration = 1;
                let msg = /*this.formatString(*/this.format_string_recursive(notifDetails.log, notifDetails.args)/*)*/;
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;

                    // If there is some text, we let the message some time, to be read 
                    minDuration = MIN_NOTIFICATION_MS;
                }

                // tell the UI notification ends, if the function returned a promise. 
                Promise.all([...promises, sleep(minDuration)]).then(() => (this as any).notifqueue.onSynchronousNotificationEnd());
            });
            (this as any).notifqueue.setSynchronous(notifName, undefined);
        });

        if (isDebug) {
            notifs.forEach(notifName => {
                if (!this[`notif_${notifName}`]) {
                    console.warn(`notif_${notifName} function is not declared, but listed in setupNotifications`);
                }
            });

            Object.getOwnPropertyNames(Heat.prototype).filter(item => item.startsWith('notif_')).map(item => item.slice(6)).forEach(item => {
                if (!notifs.some(notifName => notifName == item)) {
                    console.warn(`notif_${item} function is declared, but not listed in setupNotifications`);
                }
            });
        }

        /*(this as any).notifqueue.setIgnoreNotificationCheck('discard', (notif: Notif<any>) => 
            this.getPlayerIdFromConstructorId(notif.args.constructor_id) == this.getPlayerId() && notif.args.n
        );*/
        (this as any).notifqueue.setIgnoreNotificationCheck('draw', (notif: Notif<any>) => 
            this.getPlayerIdFromConstructorId(notif.args.constructor_id) == this.getPlayerId()
        );
    } 

    notif_loadCircuit(args: NotifLoadCircuitArgs) {
        const { circuit } = args;
        document.getElementById(`circuit-dropzone-container`)?.remove();
        //document.querySelectorAll('.nbr-laps').forEach(elem => elem.innerHTML == `${circuit.}`)
        this.circuit.loadCircuit(circuit);
    }
    
    notif_chooseUpgrade(args: NotifChooseUpgradeArgs) {
        const { constructor_id, card } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        if (playerId == this.getPlayerId()) {
            this.getCurrentPlayerTable().hand.addCard(card);
        } else {
            this.market.removeCard(card);
        }
    }  

    notif_swapUpgrade(args: NotifSwapUpgradeArgs) {
        const { constructor_id, card, card2 } = args;

        this.market?.addCard(card2);
        if (constructor_id == this.getConstructorId()) {
            this.getCurrentPlayerTable().hand.addCard(card);
        } else {
            this.market?.addCard(card);
        }
    }
    
    
    notif_endDraftRound() {
        this.market?.removeAll();
    }  
    
    notif_reformingDeckWithUpgrades() {
        document.getElementById('market')?.remove();
        this.getCurrentPlayerTable()?.hand.removeAll();
        this.market = null;
    } 
    
    notif_updatePlanification(args: NotifUpdatePlanificationArgs) {
        // TODO
    }  

    notif_reveal(args: NotifRevealArgs) {
        const { constructor_id, gear, heat } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.setCurrentGear(gear);
        const cards = Object.values(args.cards);
        this.handCounters[constructor_id]?.incValue(-cards.length);
        const promises = [playerTable.setInplay(cards)];
        if (heat) {
            promises.push(playerTable.discard.addCard(heat));
        }
        this.speedCounters[constructor_id].setValue(cards.map(card => card.speed ?? 0).reduce((a, b) => a + b, 0));
        return Promise.all(promises);
    }  

    notif_moveCar(args: NotifMoveCarArgs) {
        const { constructor_id, cell, path } = args;

        return this.circuit.moveCar(constructor_id, cell, path);
    } 

    notif_updateTurnOrder(args: NotifUpdateTurnOrderArgs) {
        const { constructor_ids } = args;
        constructor_ids.forEach((constructorId: number, index: number) => document.getElementById(`order-${constructorId}`).innerHTML = `${index + 1}`);
    }

    private async payHeats(constructorId: number, cards: Card[]) {
        const playerId = this.getPlayerIdFromConstructorId(constructorId);
        const playerTable = this.getPlayerTable(playerId);

        this.engineCounters[constructorId]?.incValue(-cards.length);

        await playerTable.payHeats(cards);
    }

    async notif_payHeats(args: NotifPayHeatsArgs) {
        const { constructor_id, cards, corner } = args;

        this.circuit.showCorner(corner, 'darkorange');
        await this.payHeats(constructor_id, Object.values(cards));

        return true;
    }

    notif_adrenaline(args: NotifSpinOutArgs) {
        const { constructor_id } = args;
        this.speedCounters[constructor_id].incValue(1);
    }

    async notif_spinOut(args: NotifSpinOutArgs) {
        const { constructor_id, cards, corner, cell, stresses, nCellsBack } = args;

        this.circuit.showCorner(corner, 'red');
        await this.payHeats(constructor_id, Object.values(cards));

        if (this.animationManager.animationsActive()) {
            await this.circuit.spinOutWithAnimation(constructor_id, cell, nCellsBack);
        } else {
            this.circuit.moveCar(constructor_id, cell);
        }

        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        
        this.handCounters[constructor_id]?.incValue(stresses.length);

        await playerTable.spinOut(stresses);

        return true;
    }

    private getPlayerIdFromConstructorId(constructorId: number): number | undefined {
        return this.gamedatas.constructors[constructorId]?.pId;
    }

    notif_draw(args: NotifCardsArgs) {
        const { constructor_id } = args;
        const n = Number(args.n);
        this.handCounters[constructor_id]?.incValue(n);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.drawCardsPublic(n);
    }

    notif_discard(args: NotifDiscardCardsArgs) {
        const { constructor_id, cards } = args;
        this.handCounters[constructor_id]?.incValue(-args.n);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.discard.addCards(Object.values(cards));
    }

    notif_pDraw(args: NotifPCardsArgs) {
        const { constructor_id } = args;
        const cards = Object.values(args.cards);
        this.handCounters[constructor_id]?.incValue(cards.length);
        const playerTable = this.getCurrentPlayerTable();
        playerTable.drawCardsPrivate(cards);
    }

    notif_pDiscard(args: NotifPCardsArgs) {
        const { constructor_id } = args;
        const cards = Object.values(args.cards);
        this.handCounters[constructor_id]?.incValue(-cards.length);
        this.getCurrentPlayerTable().discard.addCards(cards);
    }

    async notif_clearPlayedCards(args: NotifClearPlayedCardsArgs) {
        const { constructor_id, cardIds } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        await playerTable.clearPlayedCards(cardIds);
    }

    notif_cooldown(args: NotifCooldownArgs) {
        const { constructor_id, cards } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        this.handCounters[constructor_id]?.incValue(-cards.length);
        playerTable.cooldown(cards);
        this.engineCounters[constructor_id]?.incValue(cards.length);
    }

    async notif_finishRace(args: NotifFinishRaceArgs) {
        const { constructor_id, pos } = args;
        if (this.animationManager.animationsActive()) {
            await this.circuit.finishRace(constructor_id, pos);
        } else {
            this.circuit.moveCar(constructor_id, -pos);
        }
        
        this.setRank(constructor_id, pos);
    }

    private setScore(playerId: number, score: number) {
        if ((this as any).scoreCtrl[playerId]) {
            (this as any).scoreCtrl[playerId].toValue(score);
        } else {
            document.getElementById(`player_score_${playerId}`).innerText = `${score}`;
        }
    }
    
    notif_endOfRace(args: NotifEndOfRaceArgs) {
        const scores = args.scores[this.gamedatas.circuitDatas.id];
        
        Object.entries(scores).forEach(([constructorId, score]) => this.setScore(this.gamedatas.constructors[constructorId].pId, score));
    }

    notif_newLegendCard(args: NotifNewLegendCardArgs) {
        return this.legendTable.newLegendCard(args.card);
    }

    notif_scrapCards(args: NotifScrapCardsArgs) {
        const { constructor_id, cards } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).scrapCards(Object.values(cards));
    }

    notif_resolveBoost(args: NotifResolveBoostArgs) {
        const { constructor_id, cards, card } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        this.speedCounters[constructor_id].incValue(card.speed ?? 0);
        return this.getPlayerTable(playerId).resolveBoost(Object.values(cards), card);
    }

    notif_accelerate(args: NotifAccelerateArgs) {
        const { constructor_id, speed } = args;
        this.speedCounters[constructor_id].incValue(speed);
    }  

    notif_salvageCards(args: NotifSalvageCardsArgs) {
        const { constructor_id, cards, discard } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).salvageCards(Object.values(cards), Object.values(discard));
    }
    

    private setRank(constructorId: number, pos: number) {
        const playerId = this.getPlayerIdFromConstructorId(constructorId);
        document.getElementById(`overall_player_board_${playerId}`).classList.add('finished');
        document.getElementById(`podium-wrapper-${constructorId}`).classList.add('finished');
        document.getElementById(`podium-counter-${constructorId}`).innerHTML = ''+pos;
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
                    args.card_image = `<div class="log-card-set">${this.cardImageHtml(args.card, args)}</div>`;
                }

                if (args.card_image2 === '' && args.card2) {
                    args.card_image2 = `<div class="log-card-set">${this.cardImageHtml(args.card2, args)}</div>`;
                }

                if (args.finishIcon === '') {
                    args.finishIcon = `<div class="turn icon"></div>`;
                }

                if (args.cards_images === '' && args.cards) {
                    args.cards_images = `<div class="log-card-set">${Object.values(args.cards).map((card: Card) => this.cardImageHtml(card, args)).join('')}</div>`;
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
