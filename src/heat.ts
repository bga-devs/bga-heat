declare const g_img_preload;

const ANIMATION_MS = 500;
const MIN_NOTIFICATION_MS = 1200;
const ACTION_TIMER_DURATION = 5;

const LOCAL_STORAGE_ZOOM_KEY = 'Heat-zoom';
const LOCAL_STORAGE_CIRCUIT_ZOOM_KEY = 'Heat-circuit-zoom';
const LOCAL_STORAGE_JUMP_TO_FOLDED_KEY = 'Heat-jump-to-folded';

const CONSTRUCTORS_COLORS = ['12151a', '376bbe', '26a54e', 'e52927', '979797', 'face0d', 'f37321', '811b8f']; // copy of gameinfos

const SYMBOLS_WITH_POSSIBLE_HALF_USAGE = ['cooldown', 'reduce', 'scrap'];
const HAND_CARD_TYPE_FOR_EFFECT = {
  reduce: 'stress',
  cooldown: 'heat',
};
// @ts-ignore
GameGui = (function () {
  // this hack required so we fake extend GameGui
  function GameGui() {}
  return GameGui;
})();

class Heat extends GameGui<HeatGamedatas> implements HeatGame {
  public animationManager: AnimationManager;
  public cardsManager: CardsManager;
  public legendCardsManager: LegendCardsManager;
  public eventCardsManager: EventCardsManager;

  private circuitZoomManager: ZoomManager;
  private tablesZoomManager: ZoomManager;
  private circuit: Circuit;
  private playersTables: PlayerTable[] = [];
  private legendTable?: LegendTable;
  private championshipTable?: ChampionshipTable;
  private cornerCounters: Counter[] = [];
  private gearCounters: Counter[] = [];
  private engineCounters: Counter[] = [];
  private speedCounters: Counter[] = [];
  private lapCounters: Counter[] = [];
  private market?: LineStock<Card>;

  private TOOLTIP_DELAY = document.body.classList.contains('touch-device') ? 1500 : undefined;

  private _notif_uid_to_log_id = [];
  private _notif_uid_to_mobile_log_id = [];
  private _last_notif;

  public gameui: GameGui<HeatGamedatas>;
  public statusBar: StatusBar;
  public images: Images;
  public sounds: Sounds;
  public userPreferences: UserPreferences;
  public players: Players;
  public actions: Actions;
  public notifications: Notifications;
  public gameArea: GameArea;
  public playerPanels: PlayerPanels;
  public dialogs: Dialogs;
  public gamedatas: HeatGamedatas;

  constructor() {
    super();
    Object.assign(this, this.bga);
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
    this.gameArea.getElement().insertAdjacentHTML(
      'beforeend',
      `
      <link rel="stylesheet" href="https://use.typekit.net/jim0ypy.css">

      <div id="top">
      </div>

      <div id="table-center">
          <div id="circuit"></div>
      </div>
      <div id="tables"></div>  
    `
    );

    log('Starting game setup');

    this.gamedatas = gamedatas;

    // Create a new div for buttons to avoid BGA auto clearing it
    // @ts-ignore
    dojo.place("<div id='customActions' style='display:inline-block'></div>", $('generalactions'), 'after');
    // @ts-ignore
    dojo.place("<div id='restartAction' style='display:inline-block'></div>", $('customActions'), 'after');

    if (gamedatas.circuitDatas?.jpgUrl && !gamedatas.circuitDatas.jpgUrl.startsWith('http')) {
      g_img_preload.push(gamedatas.circuitDatas.jpgUrl);
    }
    //g_img_preload.push(...Object.values(gamedatas.players).map(player => `mats/player-board-${player.color}.jpg`));

    // Create a new div for buttons to avoid BGA auto clearing it
    dojo.place("<div id='customActions' style='display:inline-block'></div>", 'generalactions', 'after');
    dojo.place("<div id='restartAction' style='display:inline-block'></div>", 'customActions', 'after');

    log('gamedatas', gamedatas);

    this.animationManager = new AnimationManager(this);
    this.cardsManager = new CardsManager(this);
    this.legendCardsManager = new LegendCardsManager(this);
    this.eventCardsManager = new EventCardsManager(this);

    const jumpToEntries = [new JumpToEntry(_('Circuit'), 'table-center', { color: '#222222' })];
    if (gamedatas.isLegend) {
      jumpToEntries.push(new JumpToEntry(_('Legends'), 'legend-board', { color: '#39464c' }));
    }
    if (gamedatas.championship) {
      jumpToEntries.unshift(new JumpToEntry(_('Championship'), 'championship-table', { color: '#39464c' }));
    }

    new JumpToManager(this, {
      localStorageFoldedKey: LOCAL_STORAGE_JUMP_TO_FOLDED_KEY,
      topEntries: jumpToEntries,
      entryClasses: 'round-point',
      defaultFolded: true,
    });

    this.circuit = new Circuit(this, gamedatas);
    if (gamedatas.championship) {
      this.championshipTable = new ChampionshipTable(this, gamedatas);
    }
    this.createPlayerPanels(gamedatas);
    this.createPlayerTables(gamedatas);

    const constructorId = this.getConstructorId();
    const constructor = this.gamedatas.constructors[constructorId];
    if (constructorId !== null && constructor?.planification?.length && constructor.speed < 0) {
      this.updatePlannedCards(constructor.planification);
    }

    this.circuitZoomManager = new ZoomManager({
      element: document.getElementById('table-center'),
      smooth: false,
      zoomControls: {
        color: 'black',
      },
      defaultZoom: 0.625,
      localStorageZoomKey: LOCAL_STORAGE_ZOOM_KEY,
      autoZoom: {
        expectedWidth: 1550,
      },
    });

    this.tablesZoomManager = new ZoomManager({
      element: document.getElementById('tables'),
      smooth: false,
      zoomControls: {
        color: 'black',
      },
      defaultZoom: 1,
      localStorageZoomKey: LOCAL_STORAGE_CIRCUIT_ZOOM_KEY,
      autoZoom: {
        expectedWidth: 1200,
      },
    });

    new HelpManager(this, {
      buttons: [
        new BgaHelpPopinButton({
          title: _('Help'),
          html: this.getHelpHtml(),
          buttonBackground: '#d61b1a',
        }),
      ],
    });
    this.setupNotifications();

    window['BgaAutofit'].init();

    log('Ending game setup');
  }

  ///////////////////////////////////////////////////
  //// Game & client states

  public addDangerActionButton(id, text, callback, zone = 'customActions'): void {
    if (!$(id)) this.statusBar.addActionButton(text, callback, { id, destination: $(zone), color: 'alert' });
  }

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

    if (this.players.isCurrentPlayerActive()) {
      if (args.args?.previousSteps) {
        document
          .getElementById('logs')
          .querySelectorAll(`.log.notif_newUndoableStep`)
          .forEach((undoNotif: HTMLElement) => {
            if (!args.args?.previousSteps.includes(Number(undoNotif.dataset.step))) {
              undoNotif.style.display = 'none';
            }
          });
      }

      // Undo last steps
      args.args?.previousSteps?.forEach((stepId: number) => {
        let logEntry = $('logs').querySelector(`.log.notif_newUndoableStep[data-step="${stepId}"]`) as HTMLElement;
        if (logEntry) {
          this.onClick(logEntry, (e) => this.undoToStep(stepId, e));
        }

        logEntry = document.querySelector(
          `.chatwindowlogs_zone .log.notif_newUndoableStep[data-step="${stepId}"]`
        ) as HTMLElement;
        if (logEntry) {
          this.onClick(logEntry, (e) => this.undoToStep(stepId, e));
        }
      });

      // Restart turn button
      //if (args.args?.previousEngineChoices >= 1 && !args.args.automaticAction) {
      if (args.args?.undoableSteps && args.args.undoableSteps.length) {
        let lastStep = Math.max(...args.args.undoableSteps);
        if (lastStep > 0) {
          this.addDangerActionButton(
            'btnUndoLastStep',
            _('Undo last step'),
            (e) => this.undoToStep(lastStep, e),
            'restartAction'
          );
        }

        // Restart whole turn
        this.addDangerActionButton(
          'btnRestartTurn',
          _('Restart turn'),
          () => {
            //this.stopActionTimer();
            this.actions.performAction('actRestartTurn');
          },
          'restartAction'
        );
      }
      //}
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
        this.updatePlannedCards(args.args._private?.selection ?? []);
        break;
      case 'react':
        this.onEnteringReact(args.args);
        break;
      case 'oldReact':
        this.onEnteringOldReact(args.args);
        break;
      case 'gameEnd':
        document.getElementById('leave-text-action')?.remove();
        break;
    }
  }

  public changePageTitle(suffix: string = null, save: boolean = false): void {
    const title = this.players.isCurrentPlayerActive()
      ? this.gamedatas.gamestate['descriptionmyturn' + suffix] ?? this.gamedatas.gamestate['descriptionmyturn']
      : this.gamedatas.gamestate['description' + suffix] ?? this.gamedatas.gamestate['description'];
    this.statusBar.setTitle(title, this.gamedatas.gamestate.args);
  }

  private onEnteringStateUploadCircuit(args) {
    // this.clearInterface();
    document.getElementById('circuit').insertAdjacentHTML(
      'beforeend',
      `
        <div id="circuit-dropzone-container">
            <div id="circuit-dropzone">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M384 0v128h128L384 0zM352 128L352 0H176C149.5 0 128 21.49 128 48V288h174.1l-39.03-39.03c-9.375-9.375-9.375-24.56 0-33.94s24.56-9.375 33.94 0l80 80c9.375 9.375 9.375 24.56 0 33.94l-80 80c-9.375 9.375-24.56 9.375-33.94 0C258.3 404.3 256 398.2 256 392s2.344-12.28 7.031-16.97L302.1 336H128v128C128 490.5 149.5 512 176 512h288c26.51 0 48-21.49 48-48V160h-127.1C366.3 160 352 145.7 352 128zM24 288C10.75 288 0 298.7 0 312c0 13.25 10.75 24 24 24H128V288H24z"/></svg>

            <input type="file" id="circuit-input" />
            <label for="circuit-input">${_('Choose circuit')}</label>
            <h5>${_('or drag & drop your .heat file here')}</h5>
            </div>
        </div>
        `
    );

    $('circuit-input').addEventListener('change', (e) => this.uploadCircuit((e.target as any).files[0]));
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

      this.ajaxcall(
        // @ts-ignore
        `/${this.game_name}/${this.game_name}/actUploadCircuit.html`,
        { circuit: JSON.stringify(circuit), lock: true },
        this,
        () => {},
        undefined, // @ts-ignore
        'post'
      );
    });
  }

  private initMarketStock() {
    if (!this.market) {
      const constructor = Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId());
      document.getElementById('top').insertAdjacentHTML(
        'afterbegin',
        `
                <div id="market" style="--personal-card-background-y: ${((constructor?.id ?? 0) * 100) / 7}%;"></div>
            `
      );
      this.market = new LineStock<Card>(this.cardsManager, document.getElementById(`market`));
      this.market.onSelectionChange = (selection) => this.onMarketSelectionChange(selection);
    }
  }

  private onEnteringChooseUpgrade(args: EnteringChooseUpgradeArgs) {
    this.initMarketStock();
    this.market.addCards(Object.values(args.market));

    this.market.setSelectionMode(this.players.isCurrentPlayerActive() ? 'single' : 'none');
  }

  private onEnteringSwapUpgrade(args: EnteringSwapUpgradeArgs) {
    this.initMarketStock();
    this.market.addCards(Object.values(args.market));

    this.market.setSelectionMode(this.players.isCurrentPlayerActive() ? 'single' : 'none');
    if (this.players.isCurrentPlayerActive()) {
      const hand = this.getCurrentPlayerTable().hand;
      hand.removeAll();
      hand.addCards(Object.values(args.owned));
      hand.setSelectionMode('single');
    }
  }

  private onEnteringSnakeDiscard(args: any) {
    const playerTable = this.getCurrentPlayerTable();
    playerTable.inplay.unselectAll();
    playerTable.inplay.setSelectionMode(this.players.isCurrentPlayerActive() ? 'single' : 'none');
    const cards = playerTable.inplay.getCards();
    if (args._private.choice) {
      playerTable.inplay.selectCard(cards.find((card) => Number(card.id) == Number(args._private.choice)));
    }
  }

  private onEnteringPlanification(args: EnteringPlanificationArgs) {
    this.circuit.removeMapPaths();

    if (args._private) {
      this.getCurrentPlayerTable().setHandSelectable(
        this.players.isCurrentPlayerActive() ? 'multiple' : 'none',
        args._private.cards,
        args._private.selection
      );
    }
  }

  private onEnteringReact(args: EnteringOldReactArgs) {
    this.circuit.removeCornerHeatIndicators();
    if (args.heatCosts) {
      Object.entries(args.heatCosts).forEach(([cornerId, heat]) => this.circuit.addCornerHeatIndicator(Number(cornerId), heat));
    }
  }

  private onEnteringOldReact(args: EnteringOldReactArgs) {
    this.circuit.removeCornerHeatIndicators();
    if (args.heatCosts) {
      Object.entries(args.heatCosts).forEach(([cornerId, heat]) => this.circuit.addCornerHeatIndicator(Number(cornerId), heat));
    }
  }

  public updatePlannedCards(plannedCardsIds: number[]) {
    document.querySelectorAll(`.planned-card`).forEach((elem) => elem.classList.remove('planned-card'));

    if (plannedCardsIds?.length) {
      const hand = this.getCurrentPlayerTable()?.hand;
      if (hand) {
        const cards = hand.getCards();
        plannedCardsIds?.forEach((id) => {
          const card = cards.find((card) => Number(card.id) == id);
          if (card) {
            hand.getCardElement(card)?.classList.add('planned-card');
          }
        });
      }
    }
  }

  private onEnteringChooseSpeed(args: EnteringChooseSpeedArgs) {
    this.circuit.removeMapPaths();

    Object.entries(args.speeds).forEach(([speedStr, speedChoice]) => {
      const speed = Number(speedStr);
      this.circuit.addMapIndicator(speedChoice.cell, () => this.actChooseSpeed(speed, speedChoice.choices[0]), speed);
    });
  }

  private onEnteringSlipstream(args: EnteringSlipstreamArgs) {
    this.circuit.removeCornerHeatIndicators();
    if (args.currentHeatCosts) {
      Object.entries(args.currentHeatCosts).forEach(([cornerId, heat]) =>
        this.circuit.addCornerHeatIndicator(Number(cornerId), heat)
      );
    }

    Object.entries(args.speeds).forEach(([speedStr, speedChoice]) =>
      this.circuit.addMapIndicator(
        speedChoice,
        () => this.actSlipstream(Number(speedStr)),
        this.speedCounters[this.getConstructorId()].getValue(),
        false
      )
    );
  }

  private onEnteringPayHeats(args: EnteringPayHeatsArgs) {
    const inplay = this.getCurrentPlayerTable().inplay;
    const ids = Object.keys(args.payingCards).map(Number);
    inplay.setSelectionMode(
      'multiple',
      inplay.getCards().filter((card) => ids.includes(card.id))
    );
  }

  private onEnteringDiscard(args: EnteringDiscardArgs) {
    this.getCurrentPlayerTable().setHandSelectable('multiple', args._private.cardIds);
  }

  private onEnteringSalvage(args: EnteringSalvageArgs) {
    if (!this.market) {
      const constructor = Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId());
      document.getElementById('top').insertAdjacentHTML(
        'afterbegin',
        `
                <div id="market" style="--personal-card-background-y: ${((constructor?.id ?? 0) * 100) / 7}%;"></div>
            `
      );
      this.market = new LineStock<Card>(this.cardsManager, document.getElementById(`market`));
      this.market.onSelectionChange = (selection) => {
        document.getElementById(`actSalvage_button`).classList.toggle('disabled', selection.length > args.n);
      };
    }
    // negative ids to not mess with deck pile
    this.market.addCards(Object.values(args._private.cards).map((card) => ({ ...card, id: -card.id })));

    this.market.setSelectionMode(this.players.isCurrentPlayerActive() ? 'multiple' : 'none');
  }

  private onEnteringSuperCool(args: EnteringSalvageArgs) {
    if (!this.market) {
      const constructor = Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId());
      document.getElementById('top').insertAdjacentHTML(
        'afterbegin',
        `
                <div id="market" style="--personal-card-background-y: ${((constructor?.id ?? 0) * 100) / 7}%;"></div>
            `
      );
      this.market = new LineStock<Card>(this.cardsManager, document.getElementById(`market`));
    }
    // negative ids to not mess with deck pile
    this.market.addCards(Object.values(args._private.cards).map((card) => ({ ...card, id: -card.id })));

    this.market.setSelectionMode('none');
  }

  public onLeavingState(stateName: string) {
    log('Leaving state: ' + stateName);

    this.statusBar.removeActionButtons();
    document.getElementById('customActions').innerHTML = '';
    document.getElementById('restartAction').innerHTML = '';

    switch (stateName) {
      case 'snakeDiscard':
        this.onLeavingSnakeDiscard();
        break;
      case 'planification':
        this.onLeavingPlanification();
        break;
      case 'chooseSpeed':
        this.onLeavingChooseSpeed();
        break;
      case 'react':
        this.onLeavingReact();
        break;
      case 'slipstream':
        this.onLeavingSlipstream();
        break;
      case 'payHeats':
        this.onLeavingPayHeats();
        break;
      case 'discard':
        this.onLeavingHandSelection();
        break;
      case 'salvage':
        this.onLeavingSalvage();
        break;
      case 'superCool':
        this.onLeavingSuperCool();
        break;
    }
  }

  private onLeavingSnakeDiscard() {
    if (this.players.isCurrentPlayerActive()) {
      const playerTable = this.getCurrentPlayerTable();
      playerTable.inplay.setSelectionMode('none');
    }
  }

  private onLeavingChooseSpeed() {
    this.circuit.removeMapIndicators();
  }

  private onLeavingReact() {
    document.querySelectorAll('.hand-wrapper .action-button').forEach((elem) => elem.remove());
  }

  private onLeavingSlipstream() {
    this.circuit.removeMapIndicators();
    this.circuit.removeCornerHeatIndicators();
  }

  private onLeavingPlanification() {
    this.onLeavingHandSelection();
    this.circuit.removeMapIndicators();
  }

  private onLeavingHandSelection() {
    this.getCurrentPlayerTable()?.setHandSelectable('none');
  }

  private onLeavingPayHeats() {
    this.getCurrentPlayerTable()?.inplay.setSelectionMode('none');
  }

  private onLeavingSalvage() {
    this.market?.remove();
    this.market = null;
  }

  private onLeavingSuperCool() {
    this.market?.remove();
    this.market = null;
  }

  private createChooseSpeedButtons(args: EnteringChooseSpeedArgs) {
    Object.entries(args.speeds).forEach(([speedStr, speedChoice]) => {
      const speed = Number(speedStr);
      let label = _('Move ${cell} cell(s)').replace('${cell}', `${speed}`);
      if (speedChoice.heatCosts) {
        label += ` (${speedChoice.heatCosts}[Heat])`;
      }
      const button = this.statusBar.addActionButton(formatTextIcons(label), () =>
        this.actChooseSpeed(speed, speedChoice.choices[0])
      );
      this.linkButtonHoverToMapIndicator(button, speedChoice.cell);
    });
  }

  private createSlipstreamButtons(args: EnteringSlipstreamArgs) {
    Object.entries(args.speeds).forEach(([speedStr, speedChoice]) => {
      const speed = Number(speedStr);
      let label = _('Move ${cell} cell(s)').replace('${cell}', `${speed}`);
      /*if (args.heatCosts[speed]) {
                label += ` (${args.heatCosts[speed]}[Heat])`;
            }*/
      const confirmationMessage = this.getSlipstreamConfirmation(args, speed);

      const finalAction = () => this.actSlipstream(speed);
      const callback = confirmationMessage ? () => this.confirmationDialog(confirmationMessage, finalAction) : finalAction;

      const button = this.statusBar.addActionButton(formatTextIcons(label), callback);
      this.linkButtonHoverToMapIndicator(button, speedChoice);
    });
  }

  private showHeatCostConfirmations(): boolean {
    return !this.userPreferences.get(201);
  }

  private getAdrenalineConfirmation(
    currentHeatCost: number,
    adrenalineWillCrossNextCorner: boolean,
    nextCornerSpeedLimit: number,
    nextCornerExtraHeatCost: boolean,
    boostInfos: { [boostSpeed: number]: { [cornerId: number]: number } }
  ) {
    let confirmationMessage = null;
    adrenalineWillCrossNextCorner = this.cornerCounters[this.getConstructorId()].getValue() == 0 && adrenalineWillCrossNextCorner;
    const adrenalineCostOnCurrentCorner = boostInfos?.[1] ? Object.values(boostInfos[1]).reduce((a, b) => a + b, 0) : 0;
    if (adrenalineWillCrossNextCorner || currentHeatCost > 0 || adrenalineCostOnCurrentCorner > 0) {
      const newSpeed = this.speedCounters[this.getConstructorId()].getValue() + 1;

      let newHeatCost = currentHeatCost > 0 ? currentHeatCost + 1 : 0;
      let newCornerCost = 0;
      if (adrenalineWillCrossNextCorner) {
        newCornerCost = Math.max(0, newSpeed - nextCornerSpeedLimit);
        if (newCornerCost > 0 && nextCornerExtraHeatCost) {
          newCornerCost++;
        }
        newHeatCost += newCornerCost;
      } else if (adrenalineCostOnCurrentCorner) {
        newHeatCost = adrenalineCostOnCurrentCorner;
      }

      if (newHeatCost > 0) {
        if (adrenalineWillCrossNextCorner) {
          confirmationMessage =
            _(
              'The Adrenaline reaction will make you cross a <strong>new</strong> corner at speed ${speed} (Corner speed limit: ${speedLimit}).'
            )
              .replace('${speed}', `<strong>${newSpeed}</strong>`)
              .replace('${speedLimit}', `<strong>${nextCornerSpeedLimit}</strong>`) + `<br>`;
        } else {
          confirmationMessage = '';
        }

        if (currentHeatCost > 0) {
          confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change to ${newHeat} Heat(s).')
            .replace('${heat}', `<strong>${currentHeatCost}</strong>`)
            .replace('${newHeat}', `<strong>${newHeatCost}</strong>`);
        } else {
          confirmationMessage += _('You will have to pay ${newHeat} Heat(s).').replace(
            '${newHeat}',
            `<strong>${newHeatCost}</strong>`
          );
        }

        confirmationMessage += `<br><br>
                ${_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', `<strong>${this.engineCounters[this.getConstructorId()].getValue()}</strong>`)}`;
      }
    }
    return confirmationMessage;
  }

  private getBoostConfirmation(
    currentHeatCost: number,
    nextCornerSpeedLimit: number,
    nextCornerExtraHeatCost: boolean,
    boostInfos: { [boostSpeed: number]: { [cornerId: number]: number } },
    paid: boolean
  ) {
    const mayCrossCorner = this.cornerCounters[this.getConstructorId()].getValue() < 4;

    let confirmationMessage = null;
    const boostCostOnCurrentCorner = boostInfos?.[4] ? Object.values(boostInfos[4]).reduce((a, b) => a + b, 0) : 0;
    if (mayCrossCorner || currentHeatCost > 0 || boostCostOnCurrentCorner > 0) {
      const newSpeedMax = this.speedCounters[this.getConstructorId()].getValue() + 4;

      let newHeatCostMax = boostCostOnCurrentCorner + (paid ? 1 : 0);
      let newCornerCostMax = 0;
      if (mayCrossCorner) {
        newCornerCostMax = Math.max(0, newSpeedMax - nextCornerSpeedLimit);
        if (newCornerCostMax > 0 && nextCornerExtraHeatCost) {
          newCornerCostMax++;
        }
        newHeatCostMax += newCornerCostMax;
      }

      if (newHeatCostMax > 0) {
        if (mayCrossCorner) {
          confirmationMessage =
            _(
              'The Boost reaction may make you cross a <strong>new</strong> corner at a speed up to ${speed} (Corner speed limit: ${speedLimit}).'
            )
              .replace('${speed}', `<strong>${newSpeedMax}</strong>`)
              .replace('${speedLimit}', `<strong>${nextCornerSpeedLimit}</strong>`) + `<br>`;
        } else {
          confirmationMessage = '';
        }

        if (currentHeatCost > 0) {
          confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change up to ${newHeat} Heat(s).')
            .replace('${heat}', `<strong>${currentHeatCost}</strong>`)
            .replace('${newHeat}', `<strong>${newHeatCostMax}</strong>`);
        } else {
          confirmationMessage += _('You will have to pay up to ${newHeat} Heat(s).').replace(
            '${newHeat}',
            `<strong>${newHeatCostMax}</strong>`
          );
        }

        confirmationMessage += `<br><br>
                ${_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', `<strong>${this.engineCounters[this.getConstructorId()].getValue()}</strong>`)}`;
      }
    }
    return confirmationMessage;
  }

  private getDirectPlayConfirmation(
    currentHeatCost: number,
    nextCornerSpeedLimit: number,
    directPlayCosts: { [cardId: number]: { [something: number]: number } },
    card: Card
  ) {
    const willCrossCorner = this.cornerCounters[this.getConstructorId()].getValue() < card.speed;
    const newHeatCost = Object.values(directPlayCosts[card.id]).reduce((a, b) => a + b, 0);

    let confirmationMessage = null;
    if (currentHeatCost < newHeatCost) {
      const newSpeed = this.speedCounters[this.getConstructorId()].getValue() + card.speed;

      if (willCrossCorner) {
        confirmationMessage =
          _(
            'The Direct Play reaction may make you cross a <strong>new</strong> corner at speed ${speed} (Corner speed limit: ${speedLimit}).'
          )
            .replace('${speed}', `<strong>${newSpeed}</strong>`)
            .replace('${speedLimit}', `<strong>${nextCornerSpeedLimit}</strong>`) + `<br>`;
      } else {
        confirmationMessage = '';
      }

      if (currentHeatCost > 0) {
        confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change to ${newHeat} Heat(s).')
          .replace('${heat}', `<strong>${currentHeatCost}</strong>`)
          .replace('${newHeat}', `<strong>${newHeatCost}</strong>`);
      } else {
        confirmationMessage += _('You will have to pay ${newHeat} Heat(s).').replace(
          '${newHeat}',
          `<strong>${newHeatCost}</strong>`
        );
      }

      confirmationMessage += `<br><br>
            ${_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', `<strong>${this.engineCounters[this.getConstructorId()].getValue()}</strong>`)}`;
    }
    return confirmationMessage;
  }

  private getSlipstreamConfirmation(reactArgs: EnteringSlipstreamArgs, slipstream: number) {
    let confirmationMessage = null;
    const slipstreamWillCrossNextCorner =
      this.cornerCounters[this.getConstructorId()].getValue() < slipstream && reactArgs.slipstreamWillCrossNextCorner[slipstream];
    if (slipstreamWillCrossNextCorner) {
      const speed = this.speedCounters[this.getConstructorId()].getValue();

      const newHeatCost = reactArgs.heatCosts[slipstream];

      if (newHeatCost > reactArgs.currentHeatCost) {
        confirmationMessage =
          _(
            'The Slipstream move will make you cross a <strong>new</strong> corner at speed ${speed} (Corner speed limit: ${speedLimit}).'
          )
            .replace('${speed}', `<strong>${speed}</strong>`)
            .replace('${speedLimit}', `<strong>${reactArgs.nextCornerSpeedLimit}</strong>`) + `<br>`;

        if (reactArgs.currentHeatCost > 0) {
          confirmationMessage += _('You already have ${heat} Heat(s) to pay, it will change to ${newHeat} Heat(s).')
            .replace('${heat}', `<strong>${reactArgs.currentHeatCost}</strong>`)
            .replace('${newHeat}', `<strong>${newHeatCost}</strong>`);
        } else {
          confirmationMessage += _('You will have to pay ${newHeat} Heat(s).').replace(
            '${newHeat}',
            `<strong>${newHeatCost}</strong>`
          );
        }

        confirmationMessage += `<br><br>
                    ${_('Your currently have ${heat} Heat(s) in your engine.').replace('${heat}', `<strong>${this.engineCounters[this.getConstructorId()].getValue()}</strong>`)}`;
      }
    }
    return confirmationMessage;
  }

  // onUpdateActionButtons: in this method you can manage "action buttons" that are displayed in the
  //                        action status bar (ie: the HTML links in the status bar).
  //
  public onUpdateActionButtons(stateName: string, args: any) {
    log('onUpdateActionButtons: ' + stateName, args);
    switch (stateName) {
      case 'snakeDiscard':
        this.onEnteringSnakeDiscard(args);
        break;

      case 'planification':
        this.onEnteringPlanification(args);
        break;
    }

    if (this.players.isCurrentPlayerActive()) {
      switch (stateName) {
        case 'chooseUpgrade':
          this.statusBar.addActionButton(_('Take selected card'), () => this.actChooseUpgrade(), {
            id: `actChooseUpgrade_button`,
          });
          document.getElementById(`actChooseUpgrade_button`).classList.add('disabled');
          break;
        case 'swapUpgrade':
          this.statusBar.addActionButton(_('Swap selected cards'), () => this.actSwapUpgrade(), { id: `actSwapUpgrade_button` });
          document.getElementById(`actSwapUpgrade_button`).classList.add('disabled');
          this.statusBar.addActionButton(_('Pass'), () => this.actPassSwapUpgrade(), {
            id: `actPassSwapUpgrade_button`,
            color: 'alert',
          });
          break;
        case 'snakeDiscard':
          this.statusBar.addActionButton(_('Discard selected card'), () => this.actSnakeDiscard(), {
            id: `actSnakeDiscard_button`,
          });
          this.checkSnakeDiscardSelectionState();
          break;
        case 'planification':
          const planificationArgs = args as EnteringPlanificationArgs;
          this.statusBar.addActionButton('', () => this.actPlanification(), { id: `actPlanification_button` });
          if (planificationArgs._private.canMulligan) {
            this.statusBar.addActionButton(
              _('Mulligan') + formatTextIcons(' (1[Heat])'),
              () => this.actions.performAction('actMulligan'),
              {
                id: 'mulligan-btn',
                color: 'alert',
                confirm: _('Spend 1 Heat to draw a new hand?'),
              }
            );
          }
          this.onHandCardSelectionChange(this.getCurrentPlayerTable().hand.getSelection());
          if (planificationArgs._private?.canSkipEndRace) {
            let giveUpMessage = _('If you give up, you will be ranked last.');
            if (planificationArgs.nPlayersLeft > 1) {
              giveUpMessage += '<br><br>' + _('You are not the only player remaining, so there is still hope!');
            }

            this.statusBar.addActionButton(
              _('I want to give up this race'),
              () => this.confirmationDialog(giveUpMessage, () => this.actGiveUp()),
              { color: 'secondary' }
            );
          }
          break;
        case 'chooseSpeed':
          const chooseSpeedArgs = args as EnteringChooseSpeedArgs;
          this.onEnteringChooseSpeed(chooseSpeedArgs);
          this.createChooseSpeedButtons(chooseSpeedArgs);
          break;
        case 'slipstream':
          const slipstreamArgs = args as EnteringSlipstreamArgs;
          if (args.speeds) {
            this.onEnteringSlipstream(slipstreamArgs);
            this.createSlipstreamButtons(slipstreamArgs);
          }
          this.statusBar.addActionButton(_('Pass'), () => this.actSlipstream(0));
          break;
        case 'react':
          this.onUpdateActionButtons_react(args as EnteringReactArgs);
          break;
        case 'oldReact':
          this.onUpdateActionButtons_oldReact(args as EnteringOldReactArgs);
          break;
        case 'payHeats':
          this.onEnteringPayHeats(args);
          this.statusBar.addActionButton(
            formatTextIcons(_('Keep selected cards (max: ${number} [Heat])').replace('${number}', args.heatInReserve)),
            () => this.actPayHeats(this.getCurrentPlayerTable().inplay.getSelection()),
            { id: `actPayHeats_button` }
          );
          this.onInPlayCardSelectionChange([]);
          break;
        case 'checkCorner':
          if (args.spinOut) {
            this.statusBar.addActionButton(_('SPIN OUT'), () => this.actCheckCorner(), { color: 'alert' });
          } else {
            this.statusBar.addActionButton(_('Pay'), () => this.actCheckCorner(), { autoclick: true });
          }
          break;
        case 'discard':
          this.onEnteringDiscard(args);
          if (args._private?.refreshedIds?.length) {
            args._private?.refreshedIds.forEach((number) => {
              const refreshCard = this.getCurrentPlayerTable()
                .inplay.getCards()
                .find((card) => card.id == number);
              const label = `<div class="icon refresh"></div>${_('Place back on deck')}<br>
                            ${this.cardImageHtml(refreshCard, { constructor_id: this.getConstructorId() })}`;
              const tooltip = this.getGarageModuleIconTooltipWithIcon('refresh', 1);

              this.statusBar.addActionButton(formatTextIcons(label), () => this.actRefresh(number), {
                id: `actRefresh_${number}_button`,
              });
              this.setTooltip(`actRefresh_${number}_button`, formatTextIcons(tooltip));
            });
          }

          this.statusBar.addActionButton(_('No additional discard'), () => this.actDiscard([]), {
            color: 'alert',
            confirm: args._private?.refreshedIds?.length
              ? _("Are you sure you don't want to refresh some of the played cards?")
              : null,
            id: 'actNoDiscard_button',
          });

          this.statusBar.addActionButton('', () => this.actDiscard(this.getCurrentPlayerTable().hand.getSelection()), {
            confirm: args._private?.refreshedIds?.length
              ? _("Are you sure you don't want to refresh some of the played cards?")
              : null,
            id: 'actDiscard_button',
          });

          this.onHandCardSelectionChange([]);
          break;
        case 'salvage':
          this.onEnteringSalvage(args);
          this.statusBar.addActionButton(_('Salvage selected cards'), () => this.actSalvage(), { id: `actSalvage_button` });
          break;
        case 'superCool':
          this.onEnteringSuperCool(args);
          for (let i = args.n; i >= 0; i--) {
            this.statusBar.addActionButton(`<div class="icon super-cool">${i}</div>`, () => this.actSuperCool(i), {
              id: `actSuperCool${i}_button`,
            });
            if (i > args._private.max) {
              document.getElementById(`actSuperCool${i}_button`).classList.add('disabled');
            }
          }
          break;
        case 'confirmEndOfRace':
          this.statusBar.addActionButton(_('Seen'), () => this.actConfirmResults(), { id: `seen_button` });
          break;
      }
    } else {
      switch (stateName) {
        case 'snakeDiscard':
          this.statusBar.addActionButton(
            _('Cancel'),
            () => this.actions.performAction('actCancelSnakeDiscard', undefined, { checkAction: false }),
            {
              id: `actCancelSnakeDiscard_button`,
              color: 'secondary',
            }
          );
          break;
        case 'planification':
          if (!this.gamedatas.isDeferredRounds) {
            this.statusBar.addActionButton(_('Cancel'), () => this.actCancelSelection(), {
              id: `actCancelSelection_button`,
              color: 'secondary',
            });
          }
          break;
      }
    }
  }

  private getMandatoryZone(destination: HTMLElement | null): HTMLElement {
    const mandatoryZoneId = `${destination ? destination.id : ''}mandatory-buttons`;
    let mandatoryZone = document.getElementById(mandatoryZoneId);
    if (!mandatoryZone) {
      mandatoryZone = document.createElement('div');
      mandatoryZone.classList.add('mandatory-buttons');
      mandatoryZone.id = mandatoryZoneId;
      mandatoryZone.innerHTML = `<div class="mandatory icon"></div>`;
      (destination ?? document.getElementById('generalactions')).insertAdjacentElement('afterbegin', mandatoryZone);
    }
    return mandatoryZone;
  }

  private addReactButton(
    type: string,
    entries: string[],
    symbolInfos: ReactSymbol,
    cumulative: boolean,
    args: EnteringReactArgs,
    forcedN?: number
  ) {
    let label = ``;
    let tooltip = ``;
    let confirmationMessage = null;
    let enabled = symbolInfos.doable;
    let number = forcedN;
    if (forcedN === undefined && entries.every((entry) => symbolInfos.entries[entry].n !== undefined)) {
      number = entries
        .map((entry) => symbolInfos.entries[entry])
        .map((symbolEntry) => symbolEntry.n)
        .reduce((a, b) => a + b, 0);
      if (symbolInfos.max !== undefined) {
        number = Math.min(number, symbolInfos.max);
      }
    }
    const destination = cumulative ? null : document.getElementById(`${entries[0]}-${type}`);
    switch (type) {
      case 'accelerate':
        let nFlipped = symbolInfos.flippedCards;
        label = `+${nFlipped} [Speed]`;
        /*const accelerateCard = this.getCurrentPlayerTable()
          .inplay.getCards()
          .find((card) => card.id == Number(entries[0]));
        if (!destination) {
          label += `<br>${this.cardImageHtml(accelerateCard, { constructor_id: this.getConstructorId() })}`;
        }*/
        tooltip = this.getGarageModuleIconTooltipWithIcon('accelerate', nFlipped);
        break;
      case 'adjust':
        label = `<div class="icon adjust" style="color: #${number > 0 ? '438741' : 'a93423'};">${number > 0 ? `+${number}` : number}</div>`;
        tooltip = this.getGarageModuleIconTooltipWithIcon('adjust', number);
        break;
      case 'adrenaline':
        label = `+${number} [Speed]`;
        tooltip = `
                                    <strong>${_('Adrenaline')}</strong>
                                    <br><br>
                                    ${_('Adrenaline can help the last player (or two last cars in a race with 5 cars or more) to move each round. If you have adrenaline, you may add 1 extra speed (move your car 1 extra Space).')}
                                    <br><br>
                                    <i>${_('Note: Adrenaline cannot be saved for future rounds')}</i>`;

        confirmationMessage = args.crossedFinishLine
          ? null
          : this.getAdrenalineConfirmation(
              args.currentHeatCost,
              args.adrenalineWillCrossNextCorner,
              args.nextCornerSpeedLimit,
              args.nextCornerExtraHeatCost,
              args.boostInfos
            );
        break;
      case 'cooldown':
        label = `${number} [Cooldown]`;
        const heats = this.getCurrentPlayerTable()
          .hand.getCards()
          .filter((card) => card.effect == 'heat').length;
        if (heats < number) {
          label += `(- ${heats} [Heat])`;
        }
        tooltip =
          this.getGarageModuleIconTooltipWithIcon('cooldown', number) +
          _(
            'You gain access to Cooldown in a few ways but the most common is from driving in 1st gear (Cooldown 3) and 2nd gear (Cooldown 1).'
          );
        break;
      case 'direct':
        label = `<div class="icon direct"></div>`;
        const directCard = this.getCurrentPlayerTable()
          .hand.getCards()
          .find((card) => card.id == Number(entries[0]));
        /*if (!destination) {
              if (directCard) {
                label = `<br>${this.cardImageHtml(directCard, { constructor_id: this.getConstructorId() })}`;
              } else {
                console.warn('card not found in hand to display direct card', number, directCard);
              }
            }*/
        tooltip = this.getGarageModuleIconTooltipWithIcon('direct', 1);

        confirmationMessage =
          args.crossedFinishLine || !directCard
            ? null
            : this.getDirectPlayConfirmation(args.currentHeatCost, args.nextCornerSpeedLimit, symbolInfos.heatCosts, directCard);
        break;
      case 'heat':
        label = `<div class="icon forced-heat">${number}</div>`;
        tooltip = this.getGarageModuleIconTooltipWithIcon('heat', number);
        break;
      case 'boost':
      case 'heated-boost':
        const paid = type == 'heated-boost' && symbolInfos.heated;
        label = `[Boost] > [Speed]`;
        if (paid) {
          label += ` (1[Heat])`;
        }
        tooltip = `
                                    <strong>${_('Boost')}</strong>
                                    <br><br>
                                    ${paid ? _('Regardless of which gear you are in you may pay 1 Heat to boost once per turn.') : ''}
                                    ${_('Boosting gives you a [+] symbol as reminded on the player mats. Move your car accordingly.')}
                                    <br><br>
                                    <i>${_('Note: [+] symbols always increase your Speed value for the purpose of the Check Corner step.')}</i>`;

        confirmationMessage = args.crossedFinishLine
          ? null
          : this.getBoostConfirmation(
              args.currentHeatCost,
              args.nextCornerSpeedLimit,
              args.nextCornerExtraHeatCost,
              args.boostInfos,
              paid
            );
        break;
      case 'reduce':
        label = `<div class="icon reduce-stress">${number}</div>`;
        tooltip = this.getGarageModuleIconTooltipWithIcon('reduce', number);
        break;
      case 'salvage':
        label = `<div class="icon salvage">${number}</div>`;
        tooltip = this.getGarageModuleIconTooltipWithIcon('salvage', number);

        enabled = enabled && this.getCurrentPlayerTable().discard.getCardNumber() > 0;
        break;
      case 'scrap':
        label = `<div class="icon scrap">${number}</div>`;
        tooltip = this.getGarageModuleIconTooltipWithIcon('scrap', number);
        break;
      case 'super-cool':
        label = `<div class="icon super-cool">${number}</div>`;
        tooltip = this.getGarageModuleIconTooltipWithIcon('super-cool', number);
        break;
      case 'draft':
        label = `<div class="icon draft">${number}</div>`;
        tooltip = this.getGarageModuleIconTooltipWithIcon('draft', number);
        break;
    }

    const mandatory = ['heat', 'scrap', 'adjust'].includes(type);

    const necessaryEntries = this.getNecessaryEntries(symbolInfos, entries, number);
    const buttonId = `actReact${type}_${cumulative ? 'cumulative' : necessaryEntries.join('-')}_${number}_button`;
    let button = document.getElementById(buttonId);
    let buttonStatusBar = null;
    if (!button) {
      const noticeForButtonsOnCard =
        !destination && !symbolInfos.coalescable && !necessaryEntries.every((entry) => isNaN(entry as any as number));
      if (noticeForButtonsOnCard) {
        label += `${_('(play on the card(s))')}`;
      }

      button = this.statusBar.addActionButton(formatTextIcons(label), () => this.actReact(type, necessaryEntries, number), {
        id: buttonId,
        color: forcedN ? 'secondary' : 'primary',
        confirm: this.showHeatCostConfirmations() ? confirmationMessage : null,
        disabled: !enabled || noticeForButtonsOnCard,
        destination,
      });

      if (destination && !symbolInfos.coalescable) {
        const card =
          type === 'direct'
            ? this.getCurrentPlayerTable()
                .hand.getCards()
                .find((card) => card.id == Number(entries[0]))
            : this.getCurrentPlayerTable()
                .inplay.getCards()
                .find((card) => card.id == Number(entries[0]));

        let statusBarLabel = formatTextIcons(label);
        if (card) {
          statusBarLabel += `<br>${this.cardImageHtml(card, { constructor_id: this.getConstructorId() })}`;
        }

        buttonStatusBar = this.statusBar.addActionButton(statusBarLabel, () => this.actReact(type, necessaryEntries, number), {
          id: 'status-bar-' + buttonId,
          color: forcedN ? 'secondary' : 'primary',
          confirm: this.showHeatCostConfirmations() ? confirmationMessage : null,
          disabled: !enabled,
        });
      }
    }
    if (mandatory) {
      this.getMandatoryZone(destination).appendChild(button);
      if (buttonStatusBar) {
        this.getMandatoryZone(null).appendChild(buttonStatusBar);
      }
    }

    this.setTooltip(buttonId, formatTextIcons(tooltip));
    if (!enabled) {
      if (type === 'cooldown') {
        button.insertAdjacentHTML(
          'beforeend',
          `
                                        <div class="no-cooldown-warning">
                                            <div class="no-cooldown icon"></div>
                                        </div>
                                    `
        );
      }
    }
    return button;
  }

  /**
   * Returns the necessary entries to match number, using as less cards as possible
   */
  private getNecessaryEntries(symbolInfos: ReactSymbol, entries: string[], number: number): string[] {
    if (number === undefined || number === null) {
      return entries;
    }

    const enrichedEntries: { entry: string; value: number; textSymbol: number }[] = [];

    entries.forEach((entry, index) =>
      enrichedEntries.push({
        entry,
        value: symbolInfos.entries?.[entry]?.n,
        textSymbol: isNaN(entry as any as number) ? 1 : 0, // for example, if we have adrenaline and cardIds for cooldown, use adrenaline as priority if possible
      })
    );

    enrichedEntries.sort((a, b) => b.textSymbol - a.textSymbol || b.value - a.value);

    const selected: { entry: string; value: number; textSymbol: number }[] = [];
    let total = 0;

    for (const info of enrichedEntries) {
      selected.push(info);
      total += info.value;
      if (total >= number) {
        break;
      }
    }
    return selected.map((info) => info.entry);
  }

  private onUpdateActionButtons_react(args: EnteringReactArgs) {
    const ignoredTypes = ['speed', 'adjust', 'boost'];

    Object.entries(args.symbols)
      .filter(([type, symbolSet]) => !ignoredTypes.includes(type))
      .forEach(([type, symbolInfos], index) => {
        const remainingEntries = {};
        Object.entries(symbolInfos.entries)
          .filter(([entry, symbolEntry]) => !symbolEntry.used && (symbolEntry.doable ?? true))
          .forEach(([entry, symbolEntry]) => (remainingEntries[entry] = symbolEntry));
        if (Object.keys(remainingEntries).length > 0) {
          if (symbolInfos.max !== undefined && symbolInfos.max === 0) {
            return;
          }

          const noticeForButtonsOnCard =
            !symbolInfos.coalescable && !Object.keys(remainingEntries).every((entry) => isNaN(entry as any as number));

          if (!noticeForButtonsOnCard) {
            this.addReactButton(type, Object.keys(remainingEntries), symbolInfos, true, args);
          }
          if (symbolInfos.max !== undefined && symbolInfos.upTo) {
            for (let n = symbolInfos.max - 1; n >= (symbolInfos.min ?? 1); n--) {
              this.addReactButton(type, Object.keys(remainingEntries), symbolInfos, true, args, n);
            }
          }
          if (noticeForButtonsOnCard || !Object.keys(remainingEntries).every((entry) => isNaN(entry as any as number))) {
            Object.keys(remainingEntries).forEach((entry) => {
              this.addReactButton(type, [entry], symbolInfos, false, args);

              if (symbolInfos.max !== undefined && symbolInfos.upTo) {
                for (let n = symbolInfos.max - 1; n >= (symbolInfos.min ?? 1); n--) {
                  this.addReactButton(type, [entry], symbolInfos, false, args, n);
                }
              }
            });
          }
        }
      });

    this.statusBar.addActionButton(_('Pass'), () => this.actPassReact(), { disabled: !args.canPass });
    if (!args.symbols.heat.used && !args.symbols.heat.doable) {
      const confirmationMessage =
        args.symbols.cooldown?.doable && args.symbols.cooldown?.max > 0 && !args.symbols.cooldown?.used
          ? _('You can cooldown, and it may unlock the Heat reaction. Are you sure you want to pass without cooldown?')
          : null;

      const finalAction = () => this.actCryCauseNotEnoughHeatToPay();
      const callback = confirmationMessage ? () => this.confirmationDialog(confirmationMessage, finalAction) : finalAction;

      this.statusBar.addActionButton(_("I can't pay Heat(s)"), callback);
    }
  }

  private onUpdateActionButtons_oldReact(args: EnteringOldReactArgs) {
    Object.entries(args.symbols).forEach((entry, index) => {
      const type = entry[0];
      let numbers = Array.isArray(entry[1]) ? entry[1] : [entry[1]];

      let max = null;
      if (SYMBOLS_WITH_POSSIBLE_HALF_USAGE.includes(type)) {
        max = entry[1] as number;
        if (Object.keys(HAND_CARD_TYPE_FOR_EFFECT).includes(type)) {
          const cardEffectType = HAND_CARD_TYPE_FOR_EFFECT[type];
          max = Math.min(
            max,
            this.getCurrentPlayerTable()
              .hand.getCards()
              .filter((card) => card.effect == cardEffectType).length
          );
        }
        numbers = [];
        for (let i = max; i >= 1; i--) {
          if (args.doable.includes(type) || i === max) {
            // only the max button if disabled
            numbers.push(i);
          }
        }
      }
      numbers.forEach((number) => {
        let label = ``;
        let tooltip = ``;
        let confirmationMessage = null;
        let enabled = args.doable.includes(type);
        switch (type) {
          case 'accelerate':
            const accelerateCard = this.getCurrentPlayerTable()
              .inplay.getCards()
              .find((card) => card.id == number);
            label = `+${args.flippedCards} [Speed]<br>${this.cardImageHtml(accelerateCard, { constructor_id: this.getConstructorId() })}`;
            //label = `+${args.flippedCards} [Speed]<br>(${_(accelerateCard.text) })`;
            tooltip = this.getGarageModuleIconTooltipWithIcon('accelerate', args.flippedCards);
            break;
          case 'adjust':
            label = `<div class="icon adjust" style="color: #${number > 0 ? '438741' : 'a93423'};">${number > 0 ? `+${number}` : number}</div>`;
            tooltip = this.getGarageModuleIconTooltipWithIcon('adjust', number);
            break;
          case 'adrenaline':
            label = `+${number} [Speed]`;
            tooltip = `
                              <strong>${_('Adrenaline')}</strong>
                              <br><br>
                              ${_('Adrenaline can help the last player (or two last cars in a race with 5 cars or more) to move each round. If you have adrenaline, you may add 1 extra speed (move your car 1 extra Space).')}
                              <br><br>
                              <i>${_('Note: Adrenaline cannot be saved for future rounds')}</i>`;

            confirmationMessage = args.crossedFinishLine
              ? null
              : this.getAdrenalineConfirmation(
                  args.currentHeatCost,
                  args.adrenalineWillCrossNextCorner,
                  args.nextCornerSpeedLimit,
                  args.nextCornerExtraHeatCost,
                  args.boostInfos
                );
            break;
          case 'cooldown':
            label = `${number} [Cooldown]`;
            const heats = this.getCurrentPlayerTable()
              .hand.getCards()
              .filter((card) => card.effect == 'heat').length;
            if (heats < number) {
              label += `(- ${heats} [Heat])`;
            }
            tooltip =
              this.getGarageModuleIconTooltipWithIcon('cooldown', number) +
              _(
                'You gain access to Cooldown in a few ways but the most common is from driving in 1st gear (Cooldown 3) and 2nd gear (Cooldown 1).'
              );
            break;
          case 'direct':
            const directCard = this.getCurrentPlayerTable()
              .hand.getCards()
              .find((card) => card.id == number);
            label = `<div class="icon direct"></div>${_('Play from hand')}`;
            if (directCard) {
              label = `<br>${this.cardImageHtml(directCard, { constructor_id: this.getConstructorId() })}`;
            } else {
              console.warn('card not found in hand to display direct card', number, directCard);
            }
            //label = `<div class="icon direct"></div><br>(${_(directCard?.text) })`;
            tooltip = this.getGarageModuleIconTooltipWithIcon('direct', 1);

            confirmationMessage =
              args.crossedFinishLine || !directCard
                ? null
                : this.getDirectPlayConfirmation(
                    args.currentHeatCost,
                    args.nextCornerSpeedLimit,
                    args.directPlayCosts,
                    directCard
                  );
            break;
          case 'heat':
            label = `<div class="icon forced-heat">${number}</div>`;
            tooltip = this.getGarageModuleIconTooltipWithIcon('heat', number);
            break;
          case 'boost':
          case 'heated-boost':
            const paid = type == 'heated-boost';
            label = `[Boost] > [Speed]`;
            if (paid) {
              label += ` (1[Heat])`;
            }
            tooltip = `
                              <strong>${_('Boost')}</strong>
                              <br><br>
                              ${paid ? _('Regardless of which gear you are in you may pay 1 Heat to boost once per turn.') : ''}
                              ${_('Boosting gives you a [+] symbol as reminded on the player mats. Move your car accordingly.')}
                              <br><br>
                              <i>${_('Note: [+] symbols always increase your Speed value for the purpose of the Check Corner step.')}</i>`;

            confirmationMessage = args.crossedFinishLine
              ? null
              : this.getBoostConfirmation(
                  args.currentHeatCost,
                  args.nextCornerSpeedLimit,
                  args.nextCornerExtraHeatCost,
                  args.boostInfos,
                  paid
                );
            break;
          case 'reduce':
            label = `<div class="icon reduce-stress">${number}</div>`;
            tooltip = this.getGarageModuleIconTooltipWithIcon('reduce', number);
            break;
          case 'salvage':
            label = `<div class="icon salvage">${number}</div>`;
            tooltip = this.getGarageModuleIconTooltipWithIcon('salvage', number);

            enabled = enabled && this.getCurrentPlayerTable().discard.getCardNumber() > 0;
            break;
          case 'scrap':
            label = `<div class="icon scrap">${number}</div>`;
            tooltip = this.getGarageModuleIconTooltipWithIcon('scrap', number);
            break;
          case 'super-cool':
            label = `<div class="icon super-cool">${number}</div>`;
            tooltip = this.getGarageModuleIconTooltipWithIcon('super-cool', number);
            break;
        }

        const finalAction = () =>
          this.actOldReact(type, Array.isArray(entry[1]) || SYMBOLS_WITH_POSSIBLE_HALF_USAGE.includes(type) ? number : undefined);
        const callback = confirmationMessage
          ? () => (this.showHeatCostConfirmations() ? this.confirmationDialog(confirmationMessage, finalAction) : finalAction())
          : finalAction;
        const mandatory = ['heat', 'scrap', 'adjust'].includes(type);

        this.statusBar.addActionButton(formatTextIcons(label), callback, {
          id: `actOldReact${type}_${number}_button`,
          color: SYMBOLS_WITH_POSSIBLE_HALF_USAGE.includes(type) && number < max ? 'secondary' : undefined,
        });

        if (mandatory) {
          let mandatoryZone = document.getElementById('mandatory-buttons');
          if (!mandatoryZone) {
            mandatoryZone = document.createElement('div');
            mandatoryZone.id = 'mandatory-buttons';
            mandatoryZone.innerHTML = `<div class="mandatory icon"></div>`;
            document.getElementById('generalactions').appendChild(mandatoryZone);
          }
          mandatoryZone.appendChild(document.getElementById(`actOldReact${type}_${number}_button`));
        }

        this.setTooltip(`actOldReact${type}_${number}_button`, formatTextIcons(tooltip));
        if (!enabled) {
          document.getElementById(`actOldReact${type}_${number}_button`).classList.add('disabled');
          if (type === 'cooldown') {
            document.getElementById(`actOldReact${type}_${number}_button`).insertAdjacentHTML(
              'beforeend',
              `
                                  <div class="no-cooldown-warning">
                                      <div class="no-cooldown icon"></div>
                                  </div>
                              `
            );
          }
        }
      });
    });

    this.statusBar.addActionButton(_('Pass'), () => this.actPassOldReact(), { id: `actPassOldReact_button` });
    if (!args.canPass) {
      document.getElementById(`actPassReact_button`).classList.add('disabled');
    }
    if ((args.symbols['heat'] as number) > 0 && !args.doable.includes('heat')) {
      const confirmationMessage = args.doable.includes('cooldown')
        ? _('You can cooldown, and it may unlock the Heat reaction. Are you sure you want to pass without cooldown?')
        : null;

      const finalAction = () => this.actCryCauseNotEnoughHeatToPay();
      const callback = confirmationMessage ? () => this.confirmationDialog(confirmationMessage, finalAction) : finalAction;

      this.statusBar.addActionButton(_("I can't pay Heat(s)"), callback, { id: `actCryCauseNotEnoughHeatToPay_button` });
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
    this.addTooltipHtml(id, html, this.TOOLTIP_DELAY);
  }
  public setTooltipToClass(className: string, html: string) {
    this.addTooltipHtmlToClass(className, html, this.TOOLTIP_DELAY);
  }

  public getPlayerId(): number {
    return this.players.getCurrentPlayerId();
  }

  private getConstructorId(): number | null {
    const constructor = Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId());
    return constructor !== undefined ? Number(constructor?.id) : null;
  }

  public getPlayer(playerId: number): HeatPlayer {
    return Object.values(this.gamedatas.players).find((player) => Number(player.id) == playerId);
  }

  private getPlayerTable(playerId: number): PlayerTable {
    return this.playersTables.find((playerTable) => playerTable.playerId === playerId);
  }

  public getCurrentPlayerTable(): PlayerTable | null {
    return this.playersTables.find((playerTable) => playerTable.playerId === this.getPlayerId());
  }

  public getGameStateName(): string {
    return this.gamedatas.gamestate.name;
  }

  public getGarageModuleIconTooltipWithIcon(symbol: string, number: number | string): string {
    return `
            <div>
                <div class="tooltip-symbol">
                    <div class="${symbol == 'heat' ? 'forced-heat' : symbol} icon"></div>
                </div>
                ${formatTextIcons(this.getGarageModuleIconTooltip(symbol, number))}
            </div>`;
  }

  public getGarageModuleIconTooltip(symbol: string, number: number | string): string {
    switch (symbol) {
      case 'accelerate':
        return `
                    <strong>${_('Accelerate')}</strong>
                    <br>
                    ${_('You may increase your Speed by ${number} for every [+] symbol used by you this turn (from Upgrades, Stress, Boost, etc). If you do, you must increase it for all [+] symbols used and this counts for corner checks.').replace('${number}', '' + number)}
                `;
      case 'adjust':
        return `
                    <strong>${_('Adjust Speed Limit')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${
                      isNaN(number as any)
                        ? _(
                            'If you cross a corner this turn, your Speed Limit is modified by # for you; “+” means you can move faster, “-” means you must move slower.'
                          )
                        : (Number(number) < 0
                            ? _('Speed limit is ${number} lower.')
                            : _('Speed limit is ${number} higher.')
                          ).replace('${number}', '' + Math.abs(Number(number)))
                    }
                `;
      case 'boost':
        return `
                    <strong>${_('Boost')}</strong>
                    <br>
                    ${_('Flip the top card of your draw deck until you draw a Speed card (discard all other cards as you do when playing Stress cards). Move your car accordingly.')}
                    <br>
                    <i>${_('Note: Boost increases your Speed value for the purpose of the Check Corner step.')}</i>
                `;
      case 'cooldown':
        return `
                    <strong>${_('Cooldown')}</strong>
                    <br>
                    ${_('Cooldown allows you to take ${number} Heat card(s) from your hand and put it back in your Engine (so you can use the Heat card again). ').replace('${number}', '' + number)}
                `;
      case 'direct':
        return `
                    <strong>${_('Direct Play')}</strong>
                    <br>
                    ${_('You may play this card from your hand in the React step. If you do, it applies as if you played it normally, including Speed value and mandatory/optional icons.')}
                `;
      case 'heat':
        return `
                    <strong>${_('Heat')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${_('Take ${number} Heat cards from the Engine and move them to your discard pile.').replace('${number}', '' + number)}
                `;
      case 'one-time':
        return `
                    <strong>${_('One-time use')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${_('During the discard step, this card is removed instead of going to the discard.')}
                `;
      case 'reduce':
        return `
                    <strong>${_('Reduce Stress')}</strong>
                    <br>
                    ${_('You may immediately discard up to ${number} Stress cards from your hand to the discard pile.').replace('${number}', '' + number)}
                `;
      case 'refresh':
        return `
                    <strong>${_('Refresh')}</strong>
                    <br>
                    ${_('You may place this card back on top of your draw deck instead of discarding it, when discarding cards.')}
                `;
      case 'salvage':
        return `
                    <strong>${_('Salvage')}</strong>
                    <br>
                    ${_('You may look through your discard pile and choose up to ${number} cards there. These cards are shuffled into your draw deck.').replace('${number}', '' + number)}
                `;
      case 'scrap':
        return `
                    <strong>${_('Scrap')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${_('Discard the top card of your draw deck ${number} times.').replace('${number}', '' + number)}
                `;
      case 'slipstream':
        return `
                    <strong>${_('Slipstream boost')}</strong>
                    <br>
                    ${_('If you choose to Slipstream, your typical 2 Spaces may be increased by ${number}.').replace('${number}', '' + number)}
                `;
      case 'super-cool':
        return `
                    <strong>${_('Super cool')}</strong>
                    <br>
                    ${_('You may look through your discard pile and remove up to ${number} Heat cards from it. Return these cards to your Engine spot.' as any).replace('${number}', '' + number)}
                    <br>
                    <i>${_('Note: If there are no Heat cards in your discard pile, the symbol is wasted (but you still got to see which cards are there).')}</i>
                `;
      case 'draft':
        return `
                    <strong>${_('Draft')}</strong>
                    <br>
                    ${_('Move your car forward on the race track up to ${number} Spaces.').replace('${number}', '' + number)}
                    <br>
                    <i>${_('Note: All Spaces you move into/through thanks to this symbol must be completely free of other cars and the final landing Space must have at least one car in either Spot of the Space in front of it. This extra movement does not count as speed.')}</i>
                `;
    }
  }

  public getWeatherCardSetupTooltip(type: number): string {
    switch (type) {
      case 0:
        return _('Remove 1 Stress card from your deck.');
      case 1:
        return _('Place 1 extra Heat card in your Engine.');
      case 2:
        return _('Shuffle 1 extra Stress card into your deck.');
      case 3:
        return _('Remove 1 Heat card from your Engine.');
      case 4:
        return _('Shuffle 3 of your Heat cards into your draw deck.');
      case 5:
        return _('Place 3 of your Heat cards into your discard pile.');
    }
  }

  public getWeatherCardEffectTooltip(type: number): string {
    switch (type) {
      case 0:
        return `
                    <strong>${_('No cooling')}</strong>
                    <br>
                    ${_('No Cooldown allowed in this sector during the React step.')}
                `;
      case 1:
        return `
                    <strong>${_('No slipstream')}</strong>
                    <br>
                    ${_('You cannot start slipstreaming from this sector (you may slipstream into it).')}
                    `;
      case 2:
      case 5:
        return `<strong>${_('Slipstream boost')}</strong>
                <br>
                ${_('If you choose to Slipstream, you may add 2 extra Spaces to the usual 2 Spaces. Your car must be located in this sector before you slipstream.')}
                `;
      case 3:
      case 4:
        return `<strong>${_('Cooling Bonus')}</strong>
                <br>
                ${_('+1 Cooldown in this sector during the React step.')}
                `;
    }
  }

  public getWeatherTokenTooltip(type: number, cardType: number | null): string {
    switch (type) {
      case 0:
        return `
                    <strong>${_('Weather')}</strong>
                    <br>
                    ${_('Weather effect applies to this sector:')}
                    <br>
                    ${cardType === null ? _('See the Weather token for the effect.') : this.getWeatherCardEffectTooltip(cardType)}
                `;
      case 1:
        return `
                    <strong>${_('Overheat')}</strong> <div class="mandatory icon"></div>
                    <br>
                    ${_('If your Speed is higher than the Speed Limit when you cross this corner, the cost in Heat that you need to pay is increased by one.')}
                `;
      case 2:
        return this.getGarageModuleIconTooltip('adjust', -1);
      case 3:
        return this.getGarageModuleIconTooltip('adjust', 1);
      case 4:
        return `
                    <strong>${_('Heat control')}</strong>
                    <br>
                    ${_('Do not pay Heat to boost in this sector (still max one boost per turn). Your car must be in the sector when you boost.')}
                `;
      case 5:
        return `
                    <strong>${_('Slipstream boost')}</strong>
                    <br>
                    ${_('If you choose to Slipstream, you may add one extra Space to the usual 2 Spaces. Your car must be located in this sector before you slipstream.')}
                `;
    }
  }

  private getOrderedPlayers(gamedatas: HeatGamedatas) {
    const players = Object.values(gamedatas.players).sort((a, b) => a.no - b.no);
    const playerIndex = players.findIndex((player) => Number(player.id) === Number(this.player_id));
    const orderedPlayers = playerIndex > 0 ? [...players.slice(playerIndex), ...players.slice(0, playerIndex)] : players;
    return orderedPlayers;
  }

  private createPlayerPanels(gamedatas: HeatGamedatas) {
    const constructors = Object.values(gamedatas.constructors);
    constructors
      .filter((constructor) => constructor.ai)
      .forEach((constructor) => {
        document.getElementById('player_boards').insertAdjacentHTML(
          'beforeend',
          `
            <div id="overall_player_board_${constructor.pId}" class="player-board current-player-board">					
                <div class="player_board_inner" id="player_board_inner_982fff">
                    
                    <div class="emblemwrap" id="avatar_active_wrap_${constructor.id}">
                        <div src="img/gear.png" alt="" class="avatar avatar_active legend_avatar" id="avatar_active_${constructor.id}" style="--constructor-id: ${constructor.id}"></div>
                    </div>
                                               
                    <div class="player-name" id="player_name_${constructor.id}">
                        ${_(constructor.name)}
                    </div>
                    <div id="player_board_${constructor.pId}" class="player_board_content">
                        <div class="player_score">
                            <span id="player_score_${constructor.pId}" class="player_score_value">-</span> <i class="fa fa-star" id="icon_point_${constructor.id}"></i>           
                        </div>
                    </div>
                </div>
            </div>`
        );
      });

    constructors.forEach((constructor) => {
      let html = constructor.ai
        ? ''
        : `<div class="counters">
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
                <div id="corner-counter-wrapper-${constructor.id}" class="corner-counter">
                    <div class="corner icon"></div> 
                    <span id="corner-counter-${constructor.id}"></span>
                </div>
                <div id="lap-counter-wrapper-${constructor.id}" class="lap-counter">
                    <div class="flag icon"></div>
                    <span id="lap-counter-${constructor.id}">-</span> / <span class="nbr-laps">${gamedatas.nbrLaps || '?'}</span>
                </div>
            </div>
            <div class="counters">
                <div>
                    <div id="order-${constructor.id}" class="order-counter ${constructor.speed >= 0 ? 'played' : ''}">
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
        this.gearCounters[constructor.id] = new ebg.counter();
        this.gearCounters[constructor.id].create(`gear-counter-${constructor.id}`);
        this.gearCounters[constructor.id].setValue(constructor.gear);

        this.engineCounters[constructor.id] = new ebg.counter();
        this.engineCounters[constructor.id].create(`engine-counter-${constructor.id}`);
        this.engineCounters[constructor.id].setValue(Object.values(constructor.engine).length);
      }

      this.speedCounters[constructor.id] = new ebg.counter();
      this.speedCounters[constructor.id].create(`speed-counter-${constructor.id}`);
      this.setSpeedCounter(constructor.id, constructor.speed);

      this.cornerCounters[constructor.id] = new ebg.counter();
      this.cornerCounters[constructor.id].create(`corner-counter-${constructor.id}`);
      this.cornerCounters[constructor.id].setValue(constructor.distanceToCorner);

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

      if (constructor.canLeave && constructor.id == this.getConstructorId()) {
        this.addLeaveText();
      }
    });

    this.setTooltipToClass('corner-counter', _('Distance to the next corner'));
    this.setTooltipToClass('gear-counter', _('Gear'));
    this.setTooltipToClass('engine-counter', _('Engine cards count'));
    this.setTooltipToClass('speed-counter', _('Speed'));
    this.setTooltipToClass('lap-counter', _('Laps'));
    this.setTooltipToClass('order-counter', _('Player order'));
    this.setTooltipToClass('podium-counter', _('Rank'));
  }

  private addLeaveText() {
    if (document.getElementById('leave-text')) {
      return;
    }

    const withAction = !this.gamedatas.players[this.getPlayerId()].eliminated;

    let html = `
        <div id="leave-text"><i class="fa fa-info-circle" aria-hidden="true"></i>
            ${_('You have finished the race.')}`;
    if (withAction) {
      html += `
                <span id="leave-text-action">
                ${_('You can stay to see the end, or you can <leave-button> to start a new one!').replace(
                  '<leave-button>',
                  `<button id="leave-button" class="bgabutton bgabutton_blue">${_('Leave the game')}</button>`
                )}
                </span>`;
    }
    html += `
        </div>
        `;

    document.getElementById('top').insertAdjacentHTML('afterbegin', html);

    if (withAction) {
      document.getElementById('leave-button').addEventListener('click', () => this.actQuitGame());
    }
  }

  private createPlayerTables(gamedatas: HeatGamedatas) {
    const orderedPlayers = this.getOrderedPlayers(gamedatas);

    orderedPlayers.forEach((player) => this.createPlayerTable(gamedatas, Number(player.id)));

    if (gamedatas.isLegend) {
      this.legendTable = new LegendTable(this, gamedatas.legendCard);
    }
  }

  private getPlayerConstructor(playerId: number) {
    return Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == playerId);
  }

  private createPlayerTable(gamedatas: HeatGamedatas, playerId: number) {
    const table = new PlayerTable(this, gamedatas.players[playerId], this.getPlayerConstructor(playerId));
    this.playersTables.push(table);
  }

  private getHelpHtml() {
    let html = `
        <div id="help-popin">
            <h1>${_('Mandatory symbols')}</h1>
            ${['heat', 'scrap', 'adjust', 'one-time']
              .map((symbol) => this.getGarageModuleIconTooltipWithIcon(symbol, '#'))
              .join('<br><br>')}

            <h1>${_('Optional symbols')}</h1>
            ${['cooldown', 'slipstream', 'reduce', 'refresh', 'salvage', 'direct', 'accelerate', 'super-cool', 'draft']
              .map((symbol) => this.getGarageModuleIconTooltipWithIcon(symbol, '#'))
              .join('<br><br>')}

            <h1>${_('Road Conditions Tokens')}</h1>
            <h2>${_('Corner Effects')}</h2>
            ${[3, 2, 1]
              .map(
                (token) => `
                <div>
                    <div class="tooltip-symbol">
                        <div class="weather-token" data-token-type="${token}"></div>
                    </div>
                    ${this.getWeatherTokenTooltip(token, null)}
                </div>
                `
              )
              .join('<br><br>')}
            <h2>${_('Sector Effects')}</h2>
            ${[4, 5, 0]
              .map(
                (token) => `
                <div>
                    <div class="tooltip-symbol">
                        <div class="weather-token" data-token-type="${token}"></div>
                    </div>
                    ${this.getWeatherTokenTooltip(token, null)}
                </div>
                `
              )
              .join('<br><br>')}

            <h1>${_('Weather Tokens')}</h1>

            ${[0, 1, 2, 3, 4, 5]
              .map(
                (type) => `
                <div>
                    <div class="tooltip-symbol">
                        <div class="weather-card" data-card-type="${type}"></div>
                    </div>
                    ${this.getWeatherCardSetupTooltip(type)}<br><br>
                    ${this.getWeatherCardEffectTooltip(type)}
                </div>
                `
              )
              .join('<br><br>')}
        </div>`;

    return html;
  }

  private getPossibleSpeeds(selectedCards: Card[], args: EnteringPlanificationPrivateArgs) {
    let speeds = [0];
    selectedCards.forEach((card) => {
      let t = [];
      let cSpeeds = args.speeds[card.id];
      if (!Array.isArray(cSpeeds)) {
        cSpeeds = [cSpeeds];
      }

      cSpeeds.forEach((cSpeed) => {
        speeds.forEach((speed) => {
          t.push(cSpeed + speed);
        });
      });

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
      let useHeat = allowed && Math.abs(selection.length - gear) == 2 ? 1 : 0;
      if (privateArgs.flooded && selection.length < gear) {
        useHeat++;
      }
      let label = '';
      if (allowed) {
        label = clutteredHand
          ? _('Unclutter hand with selected cards')
          : `${_('Play selected cards')} (${_('Gear:')} ${gear} ⇒ ${selection.length} ${formatTextIcons(useHeat > 0 ? `, ${useHeat}[Heat]` : '')})`;
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
        const stressCardsSelected = selection.some((card) => privateArgs.boostingCardIds.includes(card.id));
        totalSpeeds.forEach((totalSpeed) =>
          this.circuit.addMapIndicator(privateArgs.cells[totalSpeed], undefined, totalSpeed, stressCardsSelected)
        );
      }
    } else if (this.gamedatas.gamestate.name == 'discard') {
      const label = _('Discard ${number} selected cards').replace('${number}', `${selection.length}`);

      const buttonDiscard = document.getElementById('actDiscard_button');
      const buttonNoDiscard = document.getElementById('actNoDiscard_button');
      if (buttonDiscard) {
        buttonDiscard.innerHTML = label;
        buttonDiscard.classList.toggle(
          'disabled',
          !selection.length || selection.length > this.gamedatas.gamestate.args._private.max
        );
      }
      buttonNoDiscard?.classList.toggle('disabled', selection.length > 0);
    } else if (this.gamedatas.gamestate.name == 'swapUpgrade') {
      this.checkSwapUpgradeSelectionState();
    } else if (this.gamedatas.gamestate.name == 'snakeDiscard') {
      this.checkSnakeDiscardSelectionState();
    }
  }

  public onInPlayCardSelectionChange(selection: Card[]): void {
    if (this.gamedatas.gamestate.name == 'payHeats') {
      const args: EnteringPayHeatsArgs = this.gamedatas.gamestate.args;
      const selectionHeats = selection.map((card) => args.payingCards[card.id]).reduce((a, b) => a + b, 0);

      document
        .getElementById('actPayHeats_button')
        .classList.toggle('disabled', selectionHeats > args.heatInReserve || selection.length != args.maxPayableCards);
    } else if (this.gamedatas.gamestate.name == 'snakeDiscard') {
      this.checkSnakeDiscardSelectionState();
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
    document
      .getElementById(`actSwapUpgrade_button`)
      .classList.toggle('disabled', marketSelection.length != 1 || handSelection.length != 1);
  }

  private checkSnakeDiscardSelectionState() {
    const playerTable = this.getCurrentPlayerTable();
    const inPlaySelection = playerTable?.inplay?.getSelection() ?? [];
    document.getElementById(`actSnakeDiscard_button`)?.classList.toggle('disabled', inPlaySelection.length != 1);
  }

  private actSnakeDiscard() {
    const playerTable = this.getCurrentPlayerTable();
    const inPlaySelection = playerTable?.inplay?.getSelection() ?? [];

    this.actions.performAction('actSnakeDiscard', {
      cardId: inPlaySelection[0].id,
    });
  }

  private actChooseUpgrade() {
    this.actions.performAction('actChooseUpgrade', {
      cardId: this.market.getSelection()[0].id,
    });
  }

  private actSwapUpgrade() {
    this.actions.performAction('actSwapUpgrade', {
      marketCardId: this.market.getSelection()[0].id,
      ownedCardId: this.getCurrentPlayerTable().hand.getSelection()[0].id,
    });
  }

  private actPassSwapUpgrade() {
    this.actions.performAction('actPassSwapUpgrade');
  }

  public actPlanification() {
    const selectedCards = this.getCurrentPlayerTable().hand.getSelection();

    this.actions.performAction('actPlan', {
      cardIds: JSON.stringify(selectedCards.map((card) => card.id)),
    });
  }

  public actCancelSelection() {
    this.actions.performAction('actCancelSelection', undefined, { checkAction: false });
  }

  private actChooseSpeed(speed: number, choice: { [cardId: number]: number }) {
    this.actions.performAction('actChooseSpeed', {
      speed,
      choice: JSON.stringify(choice),
    });
  }

  private actSlipstream(speed: number) {
    this.actions.performAction('actSlipstream', {
      speed,
    });
  }

  private actPassReact() {
    this.actions.performAction('actPassReact');
  }

  private actPassOldReact() {
    this.actions.performAction('actPassOldReact');
  }

  private actCryCauseNotEnoughHeatToPay() {
    this.actions.performAction('actCryCauseNotEnoughHeatToPay');
  }

  public actReact(symbol: string, entries: (string | number)[], n?: number) {
    this.actions.performAction('actReact', {
      symbol,
      entries: JSON.stringify(entries),
      n,
    });
  }

  public actOldReact(symbol: string, arg?: number) {
    this.actions.performAction('actOldReact', {
      symbol,
      arg,
    });
  }

  public actRefresh(cardId: number) {
    this.actions.performAction('actRefresh', {
      cardId,
    });
  }

  public actPayHeats(selectedCards: Card[]) {
    this.actions.performAction('actPayHeats', {
      cardIds: JSON.stringify(selectedCards.map((card) => card.id)),
    });
  }

  public actCheckCorner() {
    this.actions.performAction('actCheckCorner', {});
  }

  public actDiscard(selectedCards: Card[]) {
    this.actions.performAction('actDiscard', {
      cardIds: JSON.stringify(selectedCards.map((card) => card.id)),
    });
  }

  public actSalvage() {
    const selectedCards = this.market.getSelection();

    this.actions.performAction('actSalvage', {
      cardIds: JSON.stringify(selectedCards.map((card) => -card.id)),
    });
  }

  public actSuperCool(n: number) {
    this.actions.performAction('actSuperCool', {
      n,
    });
  }

  public actConfirmResults() {
    this.actions.performAction('actConfirmResults');
  }

  public actQuitGame() {
    this.actions.performAction('actQuitGame', undefined, { checkAction: false });
  }

  public actGiveUp() {
    this.actions.performAction('actGiveUp');
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
      'message',
      'loadCircuit',
      'clean',
      'newMarket',
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
      'refresh',
      'discard',
      'pDiscard',
      'snakeDiscard',
      'eventRemoveHeat',
      'draw',
      'pDraw',
      'mulligan',
      'pMulligan',
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
      'superCoolCards',
      'directPlay',
      'eliminate',
      'newChampionshipRace',
      'startRace',
      'setupRace',
      'clutteredHand',
      'playerEliminated',
      'cryCauseNotEnoughHeatToPay',
      'setWeather',
      'clearTurn',
      'refreshUI',
      'refreshHand',
    ];

    notifs.forEach((notifName) => {
      dojo.subscribe(notifName, this, (notifDetails: Notif<any>) => {
        log(`notif_${notifName}`, notifDetails.args);

        if (notifName === 'playerEliminated') {
          return;
        }

        const promise = this[`notif_${notifName}`](notifDetails.args);
        const promises = promise ? [promise] : [];
        let minDuration = 1;
        let msg = this.gameui.format_string_recursive(notifDetails.log, notifDetails.args);
        if (msg != '') {
          $('gameaction_status').innerHTML = msg;
          $('pagemaintitletext').innerHTML = msg;
          $('generalactions').innerHTML = '';
          $('restartAction').innerHTML = '';

          // If there is some text, we let the message some time, to be read
          minDuration = MIN_NOTIFICATION_MS;
        }

        // tell the UI notification ends, if the function returned a promise.
        if (this.animationManager.animationsActive()) {
          Promise.all([...promises, this.wait(minDuration)]).then(() => (this as any).notifqueue.onSynchronousNotificationEnd());
        } else {
          (this.gameui as any).notifqueue.setSynchronousDuration(0);
        }
      });
      if (notifName !== 'playerEliminated') {
        (this.gameui as any).notifqueue.setSynchronous(notifName, undefined);
      }
    });

    if (isDebug) {
      notifs.forEach((notifName) => {
        if (!this[`notif_${notifName}`]) {
          console.warn(`notif_${notifName} function is not declared, but listed in setupNotifications`);
        }
      });

      Object.getOwnPropertyNames(Heat.prototype)
        .filter((item) => item.startsWith('notif_'))
        .map((item) => item.slice(6))
        .forEach((item) => {
          if (!notifs.some((notifName) => notifName == item)) {
            console.warn(`notif_${item} function is declared, but not listed in setupNotifications`);
          }
        });
    }

    /*this.gameui.notifqueue.setIgnoreNotificationCheck('discard', (notif: Notif<any>) => 
            this.getPlayerIdFromConstructorId(notif.args.constructor_id) == this.getPlayerId() && notif.args.n
        );*/
    (this.gameui as any).notifqueue.setIgnoreNotificationCheck(
      'draw',
      (notif: Notif<any>) => this.getPlayerIdFromConstructorId(notif.args.constructor_id) == this.getPlayerId()
    );
    (this.gameui as any).notifqueue.setIgnoreNotificationCheck(
      'mulligan',
      (notif: Notif<any>) => this.getPlayerIdFromConstructorId(notif.args.constructor_id) == this.getPlayerId()
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

  async notif_clean(args: NotifCleanArgs) {
    const { counters } = args;

    this.playersTables.forEach((playerTable) => {
      playerTable.hand?.removeAll();
      playerTable.inplay.removeAll();
      playerTable.discard.removeAll();
      playerTable.discard.setCardNumber(0);
      playerTable.engine.removeAll();
      playerTable.engine.setCardNumber(0);
      playerTable.deck.removeAll();
      playerTable.deck.setCardNumber(counters[playerTable.constructorId].deckCount);
    });
  }

  notif_newMarket(args: NotifNewMarketArgs) {
    const { upgrades } = args;

    if (upgrades) {
      this.playersTables.forEach((playerTable) => {
        const playerUpdates = upgrades.filter((card) => card.location == `deck-${playerTable.constructorId}`);
        playerTable.deck.addCards(playerUpdates, undefined, <AddCardToDeckSettings>{
          autoUpdateCardNumber: false,
          autoRemovePreviousCards: false,
        });
        playerTable.inplay.addCards(playerUpdates);
      });
    }
  }

  notif_chooseUpgrade(args: NotifChooseUpgradeArgs) {
    const { constructor_id, card } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    this.getPlayerTable(playerId).inplay.addCard(card);
  }

  notif_swapUpgrade(args: NotifSwapUpgradeArgs) {
    const { constructor_id, card, card2 } = args;

    this.market?.addCard(card2);
    if (constructor_id == this.getConstructorId()) {
      this.getCurrentPlayerTable().inplay.addCard(card);
    } else {
      this.market?.addCard(card);
    }
  }

  notif_endDraftRound() {
    this.market?.removeAll();
  }

  notif_reformingDeckWithUpgrades() {
    this.market?.remove();
    this.market = null;
    const currentPlayerTable = this.getCurrentPlayerTable();
    if (currentPlayerTable?.hand) {
      currentPlayerTable.deck.addCards(
        currentPlayerTable.hand.getCards().map((card) => ({ id: card.id }) as Card),
        undefined,
        <AddCardToDeckSettings>{
          autoUpdateCardNumber: false,
        },
        100
      );
      // currentPlayerTable.hand.removeAll();
    }
    const nbCards = this.gamedatas.championship ? 1 : 3;
    this.playersTables.forEach((playerTable) => {
      playerTable.inplay.removeAll();
      playerTable.deck.setCardNumber(playerTable.deck.getCardNumber() + nbCards);
    });
  }

  notif_updatePlanification(args: NotifUpdatePlanificationArgs) {
    this.updatePlannedCards(args.args._private.selection);
    const mulliganBtn = document.getElementById('mulligan-btn');
    if (mulliganBtn && !args.args._private.canMulligan) {
      mulliganBtn.remove();
    }
    this.gamedatas.gamestate.args = args.args;
    this.onEnteringPlanification(args.args);
  }

  async notif_reveal(args: NotifRevealArgs) {
    const { constructor_id, gear, heats } = args;
    if (constructor_id === this.getConstructorId()) {
      this.updatePlannedCards([]);
    }

    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    const playerTable = this.getPlayerTable(playerId);
    playerTable.setCurrentGear(gear);
    this.gearCounters[constructor_id].toValue(gear);

    if (heats) {
      await this.payHeats(constructor_id, heats);
    }

    const cards = Object.values(args.cards);
    await playerTable.setInplay(cards);
  }

  async notif_moveCar(args: NotifMoveCarArgs) {
    const { constructor_id, cell, path, totalSpeed, progress, distanceToCorner } = args;
    const isAi = this.gamedatas.constructors[constructor_id].ai;

    this.setSpeedCounter(constructor_id, totalSpeed);

    this.championshipTable?.setRaceProgress(progress);

    await this.circuit.moveCar(constructor_id, cell, path, isAi ? path.length : totalSpeed);

    this.cornerCounters[constructor_id]?.setValue(distanceToCorner);

    if (isAi) {
      const orderCounter = document.getElementById(`order-${constructor_id}`);
      orderCounter.classList.add('played');
      this.circuit.removeMapPaths();
    }
  }

  notif_updateTurnOrder(args: NotifUpdateTurnOrderArgs) {
    const { constructor_ids } = args;
    constructor_ids.forEach((constructorId: number, index: number) => {
      const orderCounter = document.getElementById(`order-${constructorId}`);
      orderCounter.innerHTML = `${index + 1}`;
      orderCounter.classList.remove('played');
      this.setSpeedCounter(constructorId, -1);
    });
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

    this.cornerCounters[constructor_id].toValue(0);
    this.gearCounters[constructor_id].toValue(1);
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    const playerTable = this.getPlayerTable(playerId);
    this.getPlayerTable(playerId).setCurrentGear(1);

    await playerTable.spinOut(stresses);

    return true;
  }

  private getPlayerIdFromConstructorId(constructorId: number): number | undefined {
    return this.gamedatas.constructors[constructorId]?.pId;
  }

  notif_draw(args: NotifCardsArgs) {
    const { constructor_id, areSponsors, deckCount } = args;
    const n = Number(args.n);
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    const playerTable = this.getPlayerTable(playerId);
    playerTable.drawCardsPublic(n, areSponsors, deckCount);
  }

  notif_mulligan(args: NotifMulliganArgs) {
    const { constructor_id, heat } = args;
    this.payHeats(constructor_id, [heat]);
  }

  async notif_refresh(args: NotifRefreshArgs) {
    const { constructor_id, card } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    const playerTable = this.getPlayerTable(playerId);
    await playerTable.deck.addCard({ id: card.id } as Card, undefined, {
      autoRemovePreviousCards: false,
    });
    await playerTable.deck.removeCard(card, {
      autoUpdateCardNumber: false,
    });
    playerTable.deck.setCardNumber(playerTable.deck.getCardNumber()); // to make sure fake card is set
  }

  notif_discard(args: NotifDiscardCardsArgs) {
    const { constructor_id, cards } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    const playerTable = this.getPlayerTable(playerId);
    playerTable.discard.addCards(Object.values(cards));
  }

  notif_snakeDiscard(args: any) {
    const { constructor_id, card } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    const playerTable = this.getPlayerTable(playerId);
    playerTable.inplay.removeCard(card);
  }

  async notif_eventRemoveHeat(args: NotifEventRemoveHeatArgs) {
    const { constructor_id, card } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    const playerTable = this.getPlayerTable(playerId);
    const location = card.location.split('-')[0];
    switch (location) {
      case 'engine':
        const engineCountBefore = playerTable.engine.getCardNumber();
        await playerTable.engine.removeCard(card);
        playerTable.engine.setCardNumber(engineCountBefore - 1);
        this.engineCounters[constructor_id].incValue(-1);
        break;
      case 'hand':
        await playerTable.hand.removeCard(card);
        break;
      case 'deck':
        playerTable.deck.setCardNumber(playerTable.deck.getCardNumber() - 1);
        break;
      case 'discard':
        const diqscardCountBefore = playerTable.discard.getCardNumber();
        await playerTable.discard.removeCard(card);
        playerTable.discard.setCardNumber(diqscardCountBefore - 1);
        break;
    }
  }

  notif_pDraw(args: NotifPCardsArgs) {
    const { constructor_id, areSponsors, deckCount } = args;
    const cards = Object.values(args.cards);
    //const planificationArgs = this.gamedatas.gamestate.args as EnteringPlanificationArgs;
    //planificationArgs._private.canMulligan = false;
    const playerTable = this.getCurrentPlayerTable();
    playerTable.drawCardsPrivate(cards, areSponsors, deckCount);
  }

  async notif_pMulligan(args: NotifPMulliganArgs) {
    const { constructor_id, deckCount, heat } = args;
    const cards = Object.values(args.cards);
    this.gamedatas.gamestate.args._private.cards = cards;
    const playerTable = this.getCurrentPlayerTable();
    await playerTable.hand.removeAll();
    await this.payHeats(constructor_id, [heat]);
    await playerTable.drawCardsPrivate(cards, true, deckCount);
  }

  notif_pDiscard(args: NotifPCardsArgs) {
    const { constructor_id } = args;
    const cards = Object.values(args.cards);
    this.getCurrentPlayerTable().discard.addCards(cards);
  }

  async notif_clearPlayedCards(args: NotifClearPlayedCardsArgs) {
    const { constructor_id, cardIds, sponsorIds } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    const playerTable = this.getPlayerTable(playerId);
    await playerTable.clearPlayedCards(cardIds, sponsorIds);
    const orderCounter = document.getElementById(`order-${constructor_id}`);
    orderCounter.classList.add('played');
    this.circuit.removeMapPaths();
  }

  notif_cooldown(args: NotifCooldownArgs) {
    const { constructor_id, cards } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    const playerTable = this.getPlayerTable(playerId);
    playerTable.cooldown(cards);
    this.engineCounters[constructor_id]?.incValue(cards.length);
  }

  async notif_finishTurn(args: NotifFinishTurnArgs) {
    const { constructor_id, n, lap } = args;
    this.lapCounters[constructor_id].toValue(Math.min(n, lap));
  }

  async notif_finishRace(args: NotifFinishRaceArgs, eliminated: boolean = false) {
    const { constructor_id, pos, canLeave } = args;
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

    if (canLeave && constructor_id == this.getConstructorId()) {
      this.addLeaveText();
    }
  }

  private setScore(playerId: number, score: number) {
    if (this.scoreCtrl[playerId]) {
      this.scoreCtrl[playerId].toValue(score);
    } else {
      document.getElementById(`player_score_${playerId}`).innerText = `${score}`;
    }
  }

  private setSpeedCounter(constructorId: number, speed: number) {
    if (this.speedCounters[constructorId] && speed >= 0) {
      this.speedCounters[constructorId].toValue(speed);
    } else {
      document.getElementById(`speed-counter-${constructorId}`).innerText = `${speed >= 0 ? speed : '-'}`;
    }
  }

  notif_endOfRace(args: NotifEndOfRaceArgs) {
    this.notif_updateTurnOrder({
      constructor_ids: args.order,
    });
    this.gamedatas.scores = args.scores;
    Object.values(this.gamedatas.constructors).forEach((constructor) =>
      this.setScore(
        this.getPlayerIdFromConstructorId(constructor.id),
        Object.values(args.scores)
          .map((circuitScores) => circuitScores[constructor.id])
          .reduce((a, b) => a + b)
      )
    );
  }

  notif_newLegendCard(args: NotifNewLegendCardArgs) {
    return this.legendTable.newLegendCard(args.card);
  }

  notif_scrapCards(args: NotifScrapCardsArgs) {
    const { constructor_id, cards, deckCount } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    return this.getPlayerTable(playerId).scrapCards(Object.values(cards), deckCount);
  }

  notif_resolveBoost(args: NotifResolveBoostArgs) {
    const { constructor_id, cards, card, deckCount } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    return this.getPlayerTable(playerId).resolveBoost(Object.values(cards), card, deckCount);
  }

  notif_accelerate(args: NotifAccelerateArgs) {}

  notif_salvageCards(args: NotifSalvageCardsArgs) {
    const { constructor_id, cards, discard, deckCount } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    return this.getPlayerTable(playerId).salvageCards(Object.values(cards), Object.values(discard), deckCount);
  }

  notif_superCoolCards(args: NotifSalvageCardsArgs) {
    const { constructor_id, cards, discard } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    this.engineCounters[constructor_id]?.incValue(Object.values(cards).length);
    return this.getPlayerTable(playerId).superCoolCards(Object.values(cards), Object.values(discard));
  }

  notif_directPlay(args: NotifDirectPlayArgs) {
    const { constructor_id, card } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    return this.getPlayerTable(playerId).inplay.addCard(card);
  }

  async notif_eliminate(args: NotifEliminateArgs) {
    const { cell, giveUp } = args;
    await this.notif_finishRace(
      {
        ...args,
        pos: -cell,
      },
      !giveUp
    );
  }

  async notif_newChampionshipRace(args: NotifNewChampionshipRaceArgs) {
    const { index, circuitDatas } = args;
    this.championshipTable.newChampionshipRace(index);
    this.circuit.newCircuit(circuitDatas);

    const playerBoards = document.getElementById(`player_boards`);
    this.lapCounters.forEach((counter) => counter.setValue(1));
    playerBoards.querySelectorAll('.finished').forEach((elem) => elem.classList.remove('finished'));
    playerBoards.querySelectorAll('.played').forEach((elem) => elem.classList.remove('played'));
    playerBoards.querySelectorAll('.nbr-laps').forEach((elem) => (elem.innerHTML = `${args.nbrLaps}`));

    Object.entries(args.distancesToCorners).forEach(([constructorId, distance]) => {
      this.cornerCounters[constructorId].setValue(distance);
    });
  }

  async notif_startRace(args: NotifStartRaceArgs) {
    const { cells, weather } = args;
    Object.entries(cells).forEach(([constructor_id, cell]) => this.circuit.moveCar(Number(constructor_id), cell));
    this.circuit.createWeather(weather);
  }

  async notif_setupRace(args: NotifSetupRaceArgs) {
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

  notif_playerEliminated(args: { who_quits: number }) {
    const { who_quits } = args;

    if (who_quits == this.getPlayerId()) {
      document.getElementById('leave-text-action')?.remove();
    }
  }

  notif_cryCauseNotEnoughHeatToPay(args: NotifCryCauseNotEnoughHeatToPayArgs) {
    const { constructor_id, cell, turn, distance } = args;

    this.circuit.removeMapPaths();
    this.circuit.removeCornerHeatIndicators();
    this.circuit.moveCar(constructor_id, cell, undefined, -1);
    this.lapCounters[constructor_id]?.setValue(Math.max(1, Math.min(this.gamedatas.nbrLaps, turn + 1)));
    this.cornerCounters[constructor_id]?.setValue(distance);
  }

  notif_setWeather(args: NotifSetWeatherArgs) {
    const { weather } = args;

    this.circuit.createWeather(weather);
  }

  private setRank(constructorId: number, pos: number, eliminated: boolean) {
    const playerId = this.getPlayerIdFromConstructorId(constructorId);
    document.getElementById(`overall_player_board_${playerId}`).classList.add('finished');
    document.getElementById(`podium-wrapper-${constructorId}`).classList.add('finished');
    document.getElementById(`podium-counter-${constructorId}`).innerHTML = `${eliminated ? '❌' : pos}`;
  }

  private onClick(elem: HTMLElement, callback) {
    if (!elem.classList.contains('click-binded')) {
      elem.addEventListener('click', callback);
      elem.classList.add('click-binded');
    }
  }

  undoToStep(stepId: number, e?: Event) {
    if ((e?.target as HTMLElement)?.parentElement?.classList.contains('cancel')) {
      return;
    }

    //this.stopActionTimer();
    //(this as any).checkAction('actRestart');
    this.actions.performAction('actUndoToStep', { stepId } /*, false*/);
  }

  notif_clearTurn(args: NotifClearTurnArgs) {
    this.cancelLogs(args.notifIds);
  }

  notif_refreshUI(args: NotifRefreshUIArgs) {
    Object.entries(args.datas.constructors).forEach(([constructorIdStr, constructor]) => {
      const constructorId = Number(constructorIdStr);
      this.circuit.refreshUI(constructor);

      if (!constructor.ai) {
        this.gearCounters[constructor.id].setValue(constructor.gear);
        this.engineCounters[constructor.id].setValue(Object.values(constructor.engine).length);
      }

      this.setSpeedCounter(constructor.id, constructor.speed);
      this.cornerCounters[constructor.id].setValue(constructor.distanceToCorner);
      this.lapCounters[constructor.id].setValue(Math.max(1, Math.min(this.gamedatas.nbrLaps, constructor.turn + 1)));

      const playerId = this.getPlayerIdFromConstructorId(constructorId);
      if (playerId > 0) {
        this.getPlayerTable(playerId).refreshUI(constructor);
      }
    });

    this.championshipTable?.setRaceProgress(args.datas.progress);

    Object.values(this.gamedatas.constructors).forEach((constructor) =>
      this.setScore(
        this.getPlayerIdFromConstructorId(constructor.id),
        Object.values(args.datas.scores)
          .map((circuitScores) => circuitScores[constructor.id])
          .reduce((a, b) => a + b, 0)
      )
    );
  }

  notif_refreshHand(args: NotifRefreshHandArgs) {
    const { constructor_id, hand } = args;
    const playerId = this.getPlayerIdFromConstructorId(constructor_id);
    return this.getPlayerTable(playerId).refreshHand(hand);
  }

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
      if (this[methodName]) {
        setTimeout(() => this[methodName](notif), 50);
      }
    }
    if ($('dockedlog_' + notif.mobileLogId)) {
      dojo.addClass('dockedlog_' + notif.mobileLogId, 'notif_' + type);
    }
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

    //console.warn('onAddingNewUndoableStepToLog', stepId, this.gamedatas?.gamestate?.args, notif);

    if (this.gamedatas?.gamestate?.args?.undoableSteps?.includes(parseInt(stepId))) {
      this.onClick($(`log_${notif.logId}`), (e) => this.undoToStep(stepId, e));

      if ($(`dockedlog_${notif.mobileLogId}`)) {
        this.onClick($(`dockedlog_${notif.mobileLogId}`), (e) => this.undoToStep(stepId, e));
      }
    }
  }

  private coloredConstructorName(constructorName: string): string {
    return `<span style="font-weight: bold; color: #${CONSTRUCTORS_COLORS[Object.values(this.gamedatas.constructors).find((constructor) => constructor.name == constructorName).id]}">${_(constructorName)}</span>`;
  }

  private cardImageHtml(card: Card, args: any) {
    const constructorId =
      args.constructor_id ??
      Object.values(this.gamedatas.constructors).find((constructor) => constructor.pId == this.getPlayerId())?.id;
    return `<div class="log-card-image" style="--personal-card-background-y: ${(constructorId * 100) / 7}%;" data-symbols="${card.type < 100 ? Object.keys(card.symbols).length : 0}">${this.cardsManager.getHtml(card)}</div>`;
  }

  private cardsImagesHtml(cards: Card[], args: any) {
    return Object.values(cards)
      .map((card: Card) => this.cardImageHtml(card, args))
      .join('');
  }

  private formatArgCardImage(args: any, argName: string, argImageName: string) {
    if (args[argImageName] === '' && args[argName]) {
      const reshuffle = `<div>${_('(discard is reshuffled to the deck)')}</div>`;
      args[argImageName] =
        `${args[argName].isReshuffled ? reshuffle : ''}<div class="log-card-set">${this.cardImageHtml(args[argName], args)}</div>`;
    }
  }

  private formatArgCardsImages(args: any, argName: string, argImageName: string) {
    if (args[argImageName] === '' && args[argName]) {
      const cards: Card[] = Object.values(args[argName]);
      const shuffleIndex = cards.findIndex((card) => card.isReshuffled);
      if (shuffleIndex === -1) {
        args[argImageName] = `<div class="log-card-set">${this.cardsImagesHtml(Object.values(cards), args)}</div>`;
      } else {
        const cardsBefore = cards.slice(0, shuffleIndex);
        const cardsAfter = cards.slice(shuffleIndex);

        const reshuffle = `<div>${_('(discard is reshuffled to the deck)')}</div>`;
        args[argImageName] = `
                <div class="log-card-set">${this.cardsImagesHtml(cardsBefore, args)}</div>
                ${reshuffle}
                <div class="log-card-set">${this.cardsImagesHtml(cardsAfter, args)}</div>
                `;
      }
    }
  }

  /* This enable to inject translatable styled things to logs or action bar */
  public bgaFormatText(log: string, args: any): { log: string; args: any } {
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
        constructorKeys
          .filter((key) => args[key][0] != '<')
          .forEach((key) => {
            args[key] = this.coloredConstructorName(args[key]);
          });

        log = formatTextIcons(_(log));
        args.processed = true;
      }
    } catch (e) {
      console.error(log, args, 'Exception thrown', e.stack);
    }
    return { log, args };
  }
}
