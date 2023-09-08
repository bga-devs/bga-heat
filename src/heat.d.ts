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

interface CircuitDatas {
    id: string;
    name: string;
    assets: {
        jpg: string;
    };
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
    circuitDatas: CircuitDatas;
    nbrLaps: number;
    constructors: { [id: number]: Constructor };
    isLegend: boolean;
    legendCard: LegendCard;
    weather: Weather;
}

interface HeatGame extends Game {
    animationManager: AnimationManager;
    cardsManager: CardsManager;
    legendCardsManager: LegendCardsManager;

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

interface EnteringPlanificationPrivateArgs {
    cards: number[];
    selection: string[];
    cells: { [speed: number]: number /*destination cell*/ };
    speeds: { [cardId: number]: number};
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
    symbols: { [symbol: string]: number };
}

interface EnteringDiscardArgs {    
    _private?: {
        cardIds: number[];
    }
}

// chooseUpgrade
interface NotifChooseUpgradeArgs {
    constructor_id: number;
    card: Card;
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
    heat?: any; // TODO
}

// moveCar
interface NotifMoveCarArgs {
    constructor_id: number;
    cell: number;
    speed: any; // TODO number as string
    nForward: number;
    path: number[];
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
}

// discard
interface NotifDiscardCardsArgs extends NotifCardsArgs {
    cards?: { [id: number]: Card};
}

// pDraw, pDiscard
interface NotifPCardsArgs {
    constructor_id: number;
    cards: { [id: number]: Card};
}

// clearPlayedCards
interface NotifClearPlayedCardsArgs {
    constructor_id: number;
    cardIds: number[];
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

// finishRace
interface NotifFinishRaceArgs {
    constructor_id: number;
    pos: number;
}

// endOfRace
interface NotifEndOfRaceArgs {
    scores: { [circuitId: string]: { [constructor_id: number]: number}};
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
