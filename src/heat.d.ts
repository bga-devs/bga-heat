/**
 * Your game interfaces
 */

interface HeatPlayer extends Player {
    no: number;
}

interface Constructor {
    id: number;
    name: string;
    no: number;
    pId: number;
    ai: boolean;
    gear: number;
    carCell: number;
    turn: number;
    score: number;
    lvl; // TODO
    engine?: { [id: number]: Card};
    hand?: Card[];
    handCount: number;
    speed: number;
    inplay?: { [id: number]: Card};
    discard: { [id: number]: Card};
    deckCount: number;
}

interface Cell {
    x: number;
    y: number;
    a: number;
}

interface Corner {
    id?: number;
    x: number, 
    y: number; 
    lane: number; 
    speed: number;
    tentX: number;
    tentY: number;
    sectorTentX: number;
    sectorTentY: number;
}

interface Weather {
    card: number;
    tokens: { [cornerId: number]: number };
}

interface Championship {
    circuits: {
        event: number;
        circuit: string;
        name: string;
    }[];
    index: number;
    name: string;
}

interface CircuitDatas {
    id: string;
    name: string;
    jpgUrl: string;
    cells: { [id: number]:  Cell };
    corners: { [id: number]: Corner };
    weatherCardPos: Cell;
    podium: Cell;
}

interface HeatGamedatas {
    current_player_id: string;
    decision: {decision_type: string};
    game_result_neutralized: string;
    gamestate: Gamestate;
    gamestates: { [gamestateId: number]: Gamestate };
    neutralized_player_id: string;
    notifications: {last_packet_id: string, move_nbr: string}
    playerorder: (string | number)[];
    players: { [playerId: number]: HeatPlayer };
    tablespeed: string;

    // Add here variables you set up in getAllDatas
    championship: Championship;
    circuitDatas: CircuitDatas;
    nbrLaps: number;
    constructors: { [id: number]: Constructor };
    isLegend: boolean;
    legendCard: LegendCard;
    weather: Weather;
    progress: number;
}

interface HeatGame extends Game {
    animationManager: AnimationManager;
    cardsManager: CardsManager;
    legendCardsManager: LegendCardsManager;
    eventCardsManager: EventCardsManager;

    getPlayerId(): number;
    getPlayer(playerId: number): HeatPlayer;
    getGameStateName(): string;
    getCurrentPlayerTable(): PlayerTable | null;
    getGarageModuleIconTooltip(symbol: string, number: number): string;
    setTooltip(id: string, html: string): void;
    onHandCardSelectionChange(selection: Card[]): void;
    changePageTitle(suffix?: string, save?: boolean): void;
    addPrimaryActionButton(id, text, callback, zone?): void;
    addSecondaryActionButton(id, text, callback, zone?): void
}

interface EnteringChooseUpgradeArgs {
    market: { [cardId: number]: Card};
}

interface EnteringSwapUpgradeArgs extends EnteringChooseUpgradeArgs {
    owned: { [cardId: number]: Card};
}

interface EnteringPlanificationPrivateArgs {
    cards: number[];
    selection: number[];
    cells: { [speed: number]: number /*destination cell*/ };
    speeds: { [cardId: number]: number | number[]};
    boostingCardIds: number[];
    clutteredHand: boolean;
}

interface EnteringPlanificationArgs {    
    _private?: EnteringPlanificationPrivateArgs;
}

interface EnteringChooseSpeedArgs {
    speeds: { [speed: number]: number /*destination cell*/ };
}

interface EnteringSlipstreamArgs {
    cells: { [speed: number]: [number, number[]] /*destination cell*/ };
}

interface EnteringReactArgs {
    canPass: boolean;
    symbols: { [symbol: string]: number | number[] };
    flippedCards: number;
}

interface EnteringDiscardArgs {    
    _private?: {
        cardIds: number[];
    }
}

interface EnteringSalvageArgs {    
    _private?: {
        cards: { [id: number]: Card};
    }
    n: number;
}

// loadCircuit
interface NotifLoadCircuitArgs {
    circuit: CircuitDatas;
}

// chooseUpgrade
interface NotifChooseUpgradeArgs {
    constructor_id: number;
    card: Card;
}

// swapUpgrade
interface NotifSwapUpgradeArgs extends NotifChooseUpgradeArgs {
    card2: Card;
}

// updatePlanification
interface NotifUpdatePlanificationArgs { // TODO
    _private: {
        // TODO
    };
}

// reveal
interface NotifRevealArgs {
    constructor_id: number;
    gear: number; // new gear
    cards: { [id: number]: Card};
    heat?: Card;
}

// moveCar
interface NotifMoveCarArgs {
    constructor_id: number;
    cell: number;
    speed: number;
    nForward: number;
    path: number[];
    progress: number;
    totalSpeed: number;
}

// payHeats
interface NotifPayHeatsArgs {
    constructor_id: number;
    cards: Card[];
    speed: number;
    limit: number;
    corner?: number;
}

// spinOut
interface NotifSpinOutArgs extends NotifPayHeatsArgs {
    cell: number;
    stresses: number[];
    nCellsBack: number;
}

// draw
interface NotifCardsArgs {
    constructor_id: number;
    n: number;
    areSponsors: boolean;
}

// discard
interface NotifDiscardCardsArgs extends NotifCardsArgs {
    cards?: { [id: number]: Card};
}

// pDraw, pDiscard
interface NotifPCardsArgs {
    constructor_id: number;
    cards: { [id: number]: Card};
    areSponsors: boolean;
}

// clearPlayedCards
interface NotifClearPlayedCardsArgs {
    constructor_id: number;
    cardIds: number[];
    sponsorIds: number[];
}

// updateTurnOrder
interface NotifUpdateTurnOrderArgs {
    constructor_ids: number[];
}

// cooldown
interface NotifCooldownArgs {
    constructor_id: number;
    cards: Card[];
}

// finishTurn
interface NotifFinishTurnArgs {
    constructor_id: number;
    n: number; // new current turn
    lap: number; // nbrLaps
}

// finishRace
interface NotifFinishRaceArgs {
    constructor_id: number;
    pos: number; // this time positive, not like carCell !
}

// endOfRace
interface NotifEndOfRaceArgs {
    order: number[]; // constructor_ids
    scores: { [index: number]: { [constructor_id: number]: number}};
}

// newLegendCard
interface NotifNewLegendCardArgs {
    card: LegendCard;
}

// scrapCards
interface NotifScrapCardsArgs {
    constructor_id: number;
    cards: { [id: number]: Card}; // cards to discard (from deck)
}

// resolveBoost
interface NotifResolveBoostArgs extends NotifScrapCardsArgs {
    card: Card; // card to add inPlay
}

// accelerate
interface NotifAccelerateArgs {
    constructor_id: number;
    speed: number;
}

// salvageCards
interface NotifSalvageCardsArgs {
    constructor_id: number;
    cards: { [id: number]: Card}; // cards to salvage (from discard to deck)
    discard: { [id: number]: Card}; // for remaining discard pile
}

// directPlay
interface NotifDirectPlayArgs {
    constructor_id: number;
    card: Card;
}

// eliminate
interface NotifEliminateArgs {
    constructor_id: number;
    cell: number;
}

// newChampionshipRace
interface NotifNewChampionshipRaceArgs {
    board: string;
    event: string;
    index: number;
    circuitDatas: CircuitDatas;
}

// startRace
interface NotifStartRaceArgs {
    constructor_ids: number[];
    weather: Weather;
    cells: { [constructor_id: number]: number };
}

// setupRace
interface NotifSetupRaceArgs {
    counters: { [constructor_id: number]: {
        deckCount: number;
        engine: { [id: number]: Card };
        discard: { [id: number]: Card };
    } };
}
