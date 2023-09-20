declare const define;
declare const ebg;
declare const $;
declare const dojo: Dojo;
declare const _;
declare const g_gamethemeurl;
declare const g_img_preload;
declare const bgaConfig;

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
    public eventCardsManager: EventCardsManager;

    private zoomManager: ZoomManager;
    private gamedatas: HeatGamedatas;
    private circuit: Circuit;
    private playersTables: PlayerTable[] = [];
    private legendTable?: LegendTable;
    private championshipTable?: ChampionshipTable;
    private handCounters: Counter[] = [];
    private gearCounters: Counter[] = [];
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
        this.eventCardsManager = new EventCardsManager(this);

        const jumpToEntries = [
            new JumpToEntry(_('Circuit'), 'table-center', { 'color': '#222222' })
        ];
        if (gamedatas.isLegend) {
            jumpToEntries.push(new JumpToEntry(_('Legends'), 'legend-board', { 'color': '#39464c' }));
        }
        if (gamedatas.championship) {
            jumpToEntries.unshift(new JumpToEntry(_('Championship'), 'championship-table', { 'color': '#39464c' }));
        }
        
        new JumpToManager(this, {
            localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
            topEntries: jumpToEntries,
            entryClasses: 'round-point',
            defaultFolded: true,
        });

        this.circuit = new Circuit(this, gamedatas);
        this.createPlayerPanels(gamedatas);
        this.createPlayerTables(gamedatas);
        if (gamedatas.championship) {
            this.championshipTable = new ChampionshipTable(this, gamedatas);
        }
        
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
            case 'planification':            
                this.updatePlannedCards(args.args._private?.selection ?? [], 'onEnteringState onEnteringPlanification');
                break;
            }
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
            const constructor = Object.values(this.gamedatas.constructors).find(constructor => constructor.pId == this.getPlayerId());
            document.getElementById('table-center').insertAdjacentHTML('beforebegin', `
                <div id="market" style="--personal-card-background-y: ${(constructor?.id ?? 0) * 100 / 6}%;"></div>
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

    private updatePlannedCards(plannedCardsIds: number[], from: string) {
        console.log('updatePlannedCards', plannedCardsIds, from);

        document.querySelectorAll(`.planned-card`).forEach(elem => elem.classList.remove('planned-card'));

        if (plannedCardsIds?.length) {
            const playerTable = this.getCurrentPlayerTable();        
            const cards = playerTable.hand.getCards();
            plannedCardsIds?.forEach(id => playerTable.hand.getCardElement(cards.find(card => Number(card.id) == id)).classList.add('planned-card'));
        }
    }

    private onEnteringChooseSpeed(args: EnteringChooseSpeedArgs) {
        Object.entries(args.speeds).forEach(entry => {
            const speed = Number(entry[0]);
            this.circuit.addMapIndicator(entry[1], () => this.actChooseSpeed(speed), speed);
        });
    }

    private onEnteringSlipstream(args: EnteringSlipstreamArgs) {
        Object.entries(args.speeds).forEach(entry => 
            this.circuit.addMapIndicator(entry[1], () => this.actSlipstream(Number(entry[0])))
        );
    }

    private onEnteringDiscard(args: EnteringDiscardArgs) {
        this.getCurrentPlayerTable().setHandSelectable('multiple', args._private.cardIds);
    }

    private onEnteringSalvage(args: EnteringSalvageArgs) {
        if (!this.market) {
            const constructor = Object.values(this.gamedatas.constructors).find(constructor => constructor.pId == this.getPlayerId());
            document.getElementById('table-center').insertAdjacentHTML('beforebegin', `
                <div id="market" style="--personal-card-background-y: ${(constructor?.id ?? 0) * 100 / 6}%;"></div>
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
        this.updatePlannedCards([], 'onLeavingPlanification');
    }

    private onLeavingHandSelection() {
        this.getCurrentPlayerTable()?.setHandSelectable('none');
    }

    private onLeavingSalvage() {
        document.getElementById('market')?.remove();
        this.market = null;
    }

    private createChooseSpeedButtons(args: EnteringChooseSpeedArgs, clickAction: (speed) => void) {
        Object.entries(args.speeds).forEach(entry => {
            const speed = Number(entry[0]);
            let label = _('Move ${cell} cell(s)').replace('${cell}', `${speed}`);
            if (args.heatCosts[speed]) {
                label += ` (${args.heatCosts[speed]}[Heat])`;
            }
            (this as any).addActionButton(`chooseSpeed${entry[0]}_button`, formatTextIcons(label), () => clickAction(speed));
            this.linkButtonHoverToMapIndicator(
                document.getElementById(`chooseSpeed${entry[0]}_button`),
                entry[1],
            );
        });
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
                    this.createChooseSpeedButtons(chooseSpeedArgs, speed => this.actChooseSpeed(speed));
                    break;
                case 'slipstream':
                    const slipstreamArgs = args as EnteringSlipstreamArgs;
                    this.onEnteringSlipstream(slipstreamArgs);
                    this.createChooseSpeedButtons(slipstreamArgs, speed => this.actSlipstream(speed));
                    (this as any).addActionButton(`actPassSlipstream_button`, _('Pass'), () => this.actSlipstream(0));
                    break;
                case 'react':
                    const reactArgs = args as EnteringReactArgs;

                    Object.entries(reactArgs.symbols).forEach((entry, index) => {
                        const type = entry[0];
                        let numbers = Array.isArray(entry[1]) ? entry[1] : [entry[1]];
                        if (type === 'reduce') {
                            const max = Math.min(entry[1] as number, this.getCurrentPlayerTable().hand.getCards().filter(card => card.effect == 'stress').length);
                            numbers = [];
                            for (let i = 1; i <= max; i++) {
                                numbers.push(i);
                            }
                        }
                        numbers.forEach(number => {
                            let label = ``;
                            let tooltip = ``;
                            switch (type) {
                                case 'accelerate':
                                    const accelerateCard = this.getCurrentPlayerTable().inplay.getCards().find(card => card.id == number);
                                    label = `+${reactArgs.flippedCards} [Speed]<br>${this.cardImageHtml(accelerateCard, { constructor_id: this.getConstructorId() })}`;
                                    //label = `+${reactArgs.flippedCards} [Speed]<br>(${_(accelerateCard.text) })`;
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
                                    const directCard = this.getCurrentPlayerTable().hand.getCards().find(card => card.id == number);
                                    label = `<div class="icon direct"></div><br>${this.cardImageHtml(directCard, { constructor_id: this.getConstructorId() })}`;
                                    //label = `<div class="icon direct"></div><br>(${_(directCard?.text) })`;
                                    tooltip = this.getGarageModuleIconTooltip('direct', 1);
                                    break;
                                case 'heat':
                                    label = `<div class="icon forced-heat">${number}</div> <div class="icon mandatory"></div>`;
                                    tooltip = this.getGarageModuleIconTooltip('heat', number);
                                    break;
                                case 'boost':
                                case 'heated-boost':
                                    const paid = type == 'heated-boost';
                                    label = `[Boost] > [Speed]`;
                                    if (paid) {
                                        label += ` (1[Heat])`;
                                    }
                                    tooltip = `
                                    <strong>${_("Boost")}</strong>
                                    <br><br>
                                    ${paid ? _("Regardless of which gear you are in you may pay 1 Heat to boost once per turn.") : ''}
                                    ${_("Boosting gives you a [+] symbol as reminded on the player mats. Move your car accordingly.")}
                                    <br><br>
                                    <i>${_("Note: [+] symbols always increase your Speed value for the purpose of the Check Corner step.")}</i>`;
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
                                    label = `<div class="icon scrap">${number}</div> <div class="icon mandatory"></div>`;
                                    tooltip = this.getGarageModuleIconTooltip('scrap', number);
                                    break;
                            }

                            let callback = () => this.actReact(type, Array.isArray(entry[1]) || type === 'reduce' ? number : undefined);
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
                            this.setTooltip(`actReact${type}_${number}_button`, formatTextIcons(tooltip));
                            if (type == 'salvage' && this.getCurrentPlayerTable().discard.getCardNumber() == 0) {
                                document.getElementById(`actReact${type}_${number}_button`).classList.add('disabled');
                            }
                        });
                    });
                    
                    (this as any).addActionButton(`actPassReact_button`, _('Pass'), () => this.actPassReact());
                    if (!reactArgs.canPass) {
                        document.getElementById(`actPassReact_button`).classList.add('disabled');
                    }
                    break;
                case 'discard':
                    this.onEnteringDiscard(args);
                    (this as any).addActionButton(`actDiscard_button`, '', () => this.actDiscard(this.getCurrentPlayerTable().hand.getSelection()));
                    (this as any).addActionButton(`actNoDiscard_button`, _('No additional discard'), () => this.actDiscard([]), null, null, 'red');
                    this.onHandCardSelectionChange([]);
                    ;
                    break;
                case 'salvage':
                    this.onEnteringSalvage(args);
                    (this as any).addActionButton(`actSalvage_button`, _('Salvage selected cards'), () => this.actSalvage());
                    document.getElementById(`actSalvage_button`).classList.add('disabled');
                case 'confirmEndOfRace':
                    (this as any).addActionButton(`seen_button`, _("Seen"), () => this.actConfirmResults());
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

    private getConstructorId(): number {
        return Number(Object.values(this.gamedatas.constructors).find(constructor => constructor.pId == this.getPlayerId())?.id);
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
                    ${ _("You may increase your Speed by ${number} for every [+] symbol used by you this turn (from Upgrades, Stress, Boost, etc). If you do, you must increase it for all [+] symbols used and this counts for corner checks.").replace('${number}', number) }
                `;
            case 'adjust':
                return `
                    <strong>${_("Adjust Speed Limit")}</strong> <div class="mandatory icon"></div>
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
                    ${ _("You may play this card from your hand in the React step. If you do, it applies as if you played it normally, including Speed value and mandatory/optional icons.") }
                `;
            case 'heat':
                return `
                    <strong>${_("Heat")}</strong> <div class="mandatory icon"></div>
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
                    ${ _("You may place this card back on top of your draw deck instead of discarding it, when discarding cards.") }
                `;
            case 'salvage':
                return `
                    <strong>${_("Salvage")}</strong>
                    <br>
                    ${ _("You may look through your discard pile and choose up to ${number} cards there. These cards are shuffled into your draw deck.").replace('${number}', number) }
                `;
            case 'scrap':
                return `
                    <strong>${_("Scrap")}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${ _("Discard the top card of your draw deck ${number} times.").replace('${number}', number) }
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
                <div id="gear-counter-wrapper-${constructor.id}" class="gear-counter">
                    <div class="gear icon"></div>
                    <span id="gear-counter-${constructor.id}"></span>
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

            this.setScore(constructor.pId, constructor.score);

            if (!constructor.ai) {
                this.handCounters[constructor.id] = new ebg.counter();
                this.handCounters[constructor.id].create(`playerhand-counter-${constructor.id}`);
                this.handCounters[constructor.id].setValue(constructor.handCount);

                this.gearCounters[constructor.id] = new ebg.counter();
                this.gearCounters[constructor.id].create(`gear-counter-${constructor.id}`);
                this.gearCounters[constructor.id].setValue(constructor.gear);

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
                const eliminated = constructor.turn < this.gamedatas.nbrLaps || Boolean(this.gamedatas.players[constructor.pId]?.zombie);
                this.setRank(constructor.id, -constructor.carCell, eliminated);
                if (eliminated) {
                    this.circuit.setEliminatedPodium(-constructor.carCell);
                }
            }
        });

        this.setTooltipToClass('playerhand-counter', _('Hand cards count'));
        this.setTooltipToClass('gear-counter', _('Gear'));
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
            <h1>${_("TODO")}</h2>
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
            const privateArgs: EnteringPlanificationPrivateArgs = this.gamedatas.gamestate.args._private;
            const clutteredHand = privateArgs?.clutteredHand;

            const table = this.getCurrentPlayerTable();
            const gear = table.getCurrentGear();

            const maxGearChange = clutteredHand ? 1 : 2;
            const minAllowed = Math.max(1, gear - maxGearChange);
            const maxAllowed = Math.min(4, gear + maxGearChange);
            let allowed = selection.length >= minAllowed && selection.length <= maxAllowed;
            const useHeat = allowed && Math.abs(selection.length - gear) == 2;
            let label = '';
            if (allowed) {
                label = clutteredHand ? 
                _('Unclutter hand with selected cards') :
                `${_('Play selected cards')} (${_('Gear:')} ${gear} ⇒ ${selection.length} ${formatTextIcons(useHeat ? '[Heat]' : '')})`;
            } else {
                label = _('Select between ${min} and ${max} cards').replace('${min}', `${minAllowed}`).replace('${max}', `${maxAllowed}`);
            }
            
            document.getElementById(`player-table-${table.playerId}-gear`).dataset.gear = `${allowed ? selection.length : gear}`;

            const button = document.getElementById('actPlanification_button');
            if (button) {
                button.innerHTML = label;
                // we let the user able to click, so the back will explain in the error why he can't
                /*if (allowed && useHeat && this.engineCounters[this.getConstructorId()].getValue() == 0) {
                    allowed = false;
                }*/
                button.classList.toggle('disabled', !allowed);
            }

            this.circuit.removeMapIndicators();
            if (selection.length && privateArgs && !clutteredHand) {
                const totalSpeeds = this.getPossibleSpeeds(selection, privateArgs);
                const stressCardsSelected = selection.some(card => privateArgs.boostingCardIds.includes(card.id));
                totalSpeeds.forEach(totalSpeed => this.circuit.addMapIndicator(privateArgs.cells[totalSpeed], undefined, totalSpeed, stressCardsSelected));
            }

        } else if (this.gamedatas.gamestate.name == 'discard') {
            const label = _('Discard ${number} selected cards').replace('${number}', `${selection.length}`);

            const buttonDiscard = document.getElementById('actDiscard_button');
            const buttonNoDiscard = document.getElementById('actNoDiscard_button');
            buttonDiscard.innerHTML = label;
            buttonDiscard.classList.toggle('disabled', !selection.length);
            buttonNoDiscard.classList.toggle('disabled', selection.length > 0);
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
  	
    public actDiscard(selectedCards: Card[]) {
        if(!(this as any).checkAction('actDiscard')) {
            return;
        }

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
  	
    public actConfirmResults() {
        if(!(this as any).checkAction('actConfirmResults')) {
            return;
        }

        this.takeAction('actConfirmResults');
    }

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

        const notifs = [
            'message',
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
            'finishTurn',
            'finishRace',
            'endOfRace',
            'newLegendCard',
            'scrapCards',
            'resolveBoost',
            'accelerate',
            'salvageCards',
            'directPlay',
            'eliminate',
            'newChampionshipRace',
            'startRace',
            'setupRace',
            'clutteredHand',
            'loadBug',
        ];
        
    
        notifs.forEach((notifName) => {
            dojo.subscribe(notifName, this, (notifDetails: Notif<any>) => {
                log(`notif_${notifName}`, notifDetails.args);

                const promise = this[`notif_${notifName}`](notifDetails.args);
                const promises = promise ? [promise] : [];
                let minDuration = 1;
                let msg = this.format_string_recursive(notifDetails.log, notifDetails.args);
                if (msg != '') {
                    $('gameaction_status').innerHTML = msg;
                    $('pagemaintitletext').innerHTML = msg;
                    $('generalactions').innerHTML = '';

                    // If there is some text, we let the message some time, to be read 
                    if (this.animationManager.animationsActive()) {
                        minDuration = MIN_NOTIFICATION_MS;
                    }
                }

                // tell the UI notification ends, if the function returned a promise. 
                console.log('notif minDuration', minDuration);
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

    notif_message() {
        // just to log them on the title bar
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
        this.updatePlannedCards(args.args._private.selection, 'notif_updatePlanification');
    }  

    async notif_reveal(args: NotifRevealArgs) {
        const { constructor_id, gear, heat } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.setCurrentGear(gear);
        this.gearCounters[constructor_id].toValue(gear);
        
        if (heat) {
            await this.payHeats(constructor_id, [heat]);
        }

        const cards = Object.values(args.cards);
        this.handCounters[constructor_id]?.incValue(-cards.length);
        await playerTable.setInplay(cards);
    }  

    notif_moveCar(args: NotifMoveCarArgs) {
        const { constructor_id, cell, path, totalSpeed, progress } = args;

        this.setSpeedCounter(constructor_id, totalSpeed);

        this.championshipTable?.setRaceProgress(progress);

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

        this.gearCounters[constructor_id].toValue(1);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        this.getPlayerTable(playerId).setCurrentGear(1);
        
        this.handCounters[constructor_id]?.incValue(stresses.length);

        await playerTable.spinOut(stresses);

        return true;
    }

    private getPlayerIdFromConstructorId(constructorId: number): number | undefined {
        return this.gamedatas.constructors[constructorId]?.pId;
    }

    notif_draw(args: NotifCardsArgs) {
        const { constructor_id, areSponsors } = args;
        const n = Number(args.n);
        this.handCounters[constructor_id]?.incValue(n);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.drawCardsPublic(n, areSponsors);
    }

    notif_discard(args: NotifDiscardCardsArgs) {
        const { constructor_id, cards } = args;
        this.handCounters[constructor_id]?.incValue(-args.n);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        playerTable.discard.addCards(Object.values(cards));
    }

    notif_pDraw(args: NotifPCardsArgs) {
        const { constructor_id, areSponsors } = args;
        const cards = Object.values(args.cards);
        this.handCounters[constructor_id]?.incValue(cards.length);
        const playerTable = this.getCurrentPlayerTable();
        playerTable.drawCardsPrivate(cards, areSponsors);
    }

    notif_pDiscard(args: NotifPCardsArgs) {
        const { constructor_id } = args;
        const cards = Object.values(args.cards);
        this.handCounters[constructor_id]?.incValue(-cards.length);
        this.getCurrentPlayerTable().discard.addCards(cards);
    }

    async notif_clearPlayedCards(args: NotifClearPlayedCardsArgs) {
        const { constructor_id, cardIds, sponsorIds } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        await playerTable.clearPlayedCards(cardIds, sponsorIds);
        this.setSpeedCounter(constructor_id, null);
    }

    notif_cooldown(args: NotifCooldownArgs) {
        const { constructor_id, cards } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        const playerTable = this.getPlayerTable(playerId);
        this.handCounters[constructor_id]?.incValue(-cards.length);
        playerTable.cooldown(cards);
        this.engineCounters[constructor_id]?.incValue(cards.length);
    }

    async notif_finishTurn(args: NotifFinishTurnArgs) {
    const { constructor_id, n, lap } = args;
    this.lapCounters[constructor_id].toValue(Math.min(n, lap));
}

    async notif_finishRace(args: NotifFinishRaceArgs, eliminated: boolean = false) {
        const { constructor_id, pos } = args;
        if (this.animationManager.animationsActive()) {
            await this.circuit.finishRace(constructor_id, pos);
        } else {
            const carCell = -pos;
            this.circuit.moveCar(constructor_id, carCell);
        }
        
        this.setRank(constructor_id, pos, eliminated);
        if (eliminated) {
            this.circuit.setEliminatedPodium(pos);
        }
    }

    private setScore(playerId: number, score: number) {
        if ((this as any).scoreCtrl[playerId]) {
            (this as any).scoreCtrl[playerId].toValue(score);
        } else {
            document.getElementById(`player_score_${playerId}`).innerText = `${score}`;
        }
    }

    private setSpeedCounter(constructorId: number, speed: number | null) {
        if (this.speedCounters[constructorId] && speed !== null) {
            this.speedCounters[constructorId].toValue(speed);
        } else {
            document.getElementById(`speed-counter-${constructorId}`).innerText = `${speed !== null ? speed : '-'}`;
        }
    }
    
    notif_endOfRace(args: NotifEndOfRaceArgs) {
        this.notif_updateTurnOrder({
            constructor_ids: args.order
        });
        Object.values(this.gamedatas.constructors).forEach(constructor => 
            this.setScore(this.getPlayerIdFromConstructorId(constructor.id), Object.values(args.scores).map(circuitScores => circuitScores[constructor.id]).reduce((a, b) => a + b))
        );
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
        return this.getPlayerTable(playerId).resolveBoost(Object.values(cards), card);
    }

    notif_accelerate(args: NotifAccelerateArgs) {}  

    notif_salvageCards(args: NotifSalvageCardsArgs) {
        const { constructor_id, cards, discard } = args;
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).salvageCards(Object.values(cards), Object.values(discard));
    } 

    notif_directPlay(args: NotifDirectPlayArgs) {
        const { constructor_id, card } = args;      
        this.handCounters[constructor_id].incValue(-1);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        return this.getPlayerTable(playerId).inplay.addCard(card);
    }

    async notif_eliminate(args: NotifEliminateArgs) {
        const { pos: cell } = args;
        await this.notif_finishRace({
            ...args,
            pos: -cell
        }, true);
    }  

    async notif_newChampionshipRace(args: NotifNewChampionshipRaceArgs) {
        const { index, circuitDatas } = args;
        this.championshipTable.newChampionshipRace(index);
        this.circuit.newCircuit(circuitDatas);

        document.getElementById(`player_boards`).querySelectorAll('.finished').forEach(elem => elem.classList.remove('finished'));
    }

    async notif_startRace(args: NotifStartRaceArgs) {
        const { cells, weather } = args;
        Object.entries(cells).forEach(([constructor_id, cell]) => this.circuit.moveCar(Number(constructor_id), cell));
        this.circuit.createWeather(weather);
    }

    async notif_setupRace(args: NotifSetupRaceArgs) {
        this.getCurrentPlayerTable()?.hand.removeAll();
        this.handCounters[this.getConstructorId()]?.setValue(0);
        
        Object.entries(args.counters).forEach(([constructor_id, counters]) => {
            const table = this.getPlayerTable(this.getPlayerIdFromConstructorId(Number(constructor_id)));
            if (table) {
                table.inplay.removeAll();
                table.deck.setCardNumber(counters?.deckCount);                
                this.engineCounters[constructor_id].setValue(Object.values(counters.engine).length);
                table.engine.removeAll();
                table.engine.addCards(Object.values(counters.engine));
                table.discard.removeAll();
                table.discard.addCards(Object.values(counters.discard));
                this.gearCounters[constructor_id].setValue(1);
                table.setCurrentGear(1);
            }
        });
    }
    
    notif_clutteredHand(args: NotifMoveCarArgs) {
        const { constructor_id } = args;

        this.gearCounters[constructor_id].toValue(1);
        const playerId = this.getPlayerIdFromConstructorId(constructor_id);
        this.getPlayerTable(playerId).setCurrentGear(1);
    }

    private setRank(constructorId: number, pos: number, eliminated: boolean) {
        const playerId = this.getPlayerIdFromConstructorId(constructorId);
        document.getElementById(`overall_player_board_${playerId}`).classList.add('finished');
        document.getElementById(`podium-wrapper-${constructorId}`).classList.add('finished');
        document.getElementById(`podium-counter-${constructorId}`).innerHTML = `${eliminated ? '❌' : pos}`;
    }  
    
    /**
    * Load production bug report handler
    */
   notif_loadBug(n) {
     const that: any = this;
     function fetchNextUrl() {
       var url = n.args.urls.shift();
       console.log('Fetching URL', url, '...');
       // all the calls have to be made with ajaxcall in order to add the csrf token, otherwise you'll get "Invalid session information for this action. Please try reloading the page or logging in again"
       that.ajaxcall(
         url,
         {
           lock: true,
         },
         that,
         function (success) {
           console.log('=> Success ', success);

           if (n.args.urls.length > 1) {
             fetchNextUrl();
           } else if (n.args.urls.length > 0) {
             //except the last one, clearing php cache
             url = n.args.urls.shift();
             (dojo as any).xhrGet({
               url: url,
               headers: {
                 'X-Request-Token': bgaConfig.requestToken,
               },
               load: success => {
                 console.log('Success for URL', url, success);
                 console.log('Done, reloading page');
                 window.location.reload();
               },
               handleAs: 'text',
               error: error => console.log('Error while loading : ', error),
             });
           }
         },
         error => {
           if (error) console.log('=> Error ', error);
         },
       );
     }
     console.log('Notif: load bug', n.args);
     fetchNextUrl();
   }

    private coloredConstructorName(constructorName: string): string {
        return `<span style="font-weight: bold; color: #${CONSTRUCTORS_COLORS[Object.values(this.gamedatas.constructors).find(constructor => constructor.name == constructorName).id]}">${constructorName}</span>`;
    }

    private cardImageHtml(card: Card, args: any) {
        const constructorId = args.constructor_id ?? Object.values(this.gamedatas.constructors).find(constructor => constructor.pId == this.getPlayerId())?.id;
        return `<div class="log-card-image" style="--personal-card-background-y: ${constructorId * 100 / 6}%;" data-symbols="${card.type < 100 ? Object.keys(card.symbols).length : 0}">${this.cardsManager.getHtml(card)}</div>`;
    }

    private cardsImagesHtml(cards: Card[], args: any) {
        return Object.values(cards).map((card: Card) => this.cardImageHtml(card, args)).join('');
    }

    private formatArgCardImage(args: any, argName: string, argImageName: string) {
        if (args[argImageName] === '' && args[argName]) {
            const reshuffle = `<div>${_("(discard is reshuffled to the deck)")}</div>`;
            args[argImageName] = `${args[argName].isReshuffled ? reshuffle : ''}<div class="log-card-set">${this.cardImageHtml(args[argName], args)}</div>`;
        }
    }

    private formatArgCardsImages(args: any, argName: string, argImageName: string) {
        if (args[argImageName] === '' && args[argName]) {
            const cards: Card[] = Object.values(args[argName]);
            const shuffleIndex = cards.findIndex(card => card.isReshuffled)
            if (shuffleIndex === -1) {
                args[argImageName] = `<div class="log-card-set">${this.cardsImagesHtml(Object.values(cards), args)}</div>`;
            } else {
                const cardsBefore = cards.slice(0, shuffleIndex);
                const cardsAfter = cards.slice(shuffleIndex);

                const reshuffle = `<div>${_("(discard is reshuffled to the deck)")}</div>`;
                args[argImageName] = `
                <div class="log-card-set">${this.cardsImagesHtml(cardsBefore, args)}</div>
                ${reshuffle}
                <div class="log-card-set">${this.cardsImagesHtml(cardsAfter, args)}</div>
                `;
            }
        }
    }

    /* This enable to inject translatable styled things to logs or action bar */
    /* @Override */
    public format_string_recursive(log: string, args: any) {
        try {
            if (log && args && !args.processed) {

                this.formatArgCardImage(args, 'card', 'card_image');
                this.formatArgCardImage(args, 'card2', 'card_image2');
                this.formatArgCardsImages(args, 'cards', 'cards_images');
                this.formatArgCardsImages(args, 'cards2', 'cards_images2');

                if (args.finishIcon === '') {
                    args.finishIcon = `<div class="flag icon"></div>`;
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
