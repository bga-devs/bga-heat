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
    carCell: string;
    turn: number;
    score: number;
    lvl; // TODO
    engine?: { [id: number]: Card};
    hand?: Card[];
    handCount: number;
    speed: number;
    inplay?: { [id: number]: Card};
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
    circuit: string;
    nbrLaps: number;
    constructors: { [id: number]: Constructor };
}

interface HeatGame extends Game {
    animationManager: AnimationManager;
    cardsManager: CardsManager;
    technologyTilesManager: TechnologyTilesManager;

    getPlayerId(): number;
    getPlayer(playerId: number): HeatPlayer;
    getGameStateName(): string;
    getCurrentPlayerTable(): PlayerTable | null;

    setTooltip(id: string, html: string): void;
    onHandCardSelectionChange(selection: Card[]): void;
    changePageTitle(suffix?: string, save?: boolean): void;
    addPrimaryActionButton(id, text, callback, zone?): void;
    addSecondaryActionButton(id, text, callback, zone?): void
}

interface EnteringPlanificationArgs {    
    _private?: {
        cards: number[];
        selection: string[];
    }
}

interface EnteringChooseSpeedArgs {
    speeds: { [speed: number]: number /*destination cell*/ };
}

interface EnteringSlipstreamArgs {
    cells: { [speed: number]: number /*destination cell*/ };
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
    cards: Card[];
    heat?: any; // TODO
}

// moveCar
interface NotifMoveCarArgs {
    constructor_id: number;
    cell: number;
    speed: any; // TODO number as string
    nForward: number;
}

// payHeatsForCorner
interface NotifPayHeatsForCornerArgs {
    constructor_id: number;
    n: number;
    cards: Card[];
    speed: number;
    limit: number;
}

// draw, discard
interface NotifCardsArgs {
    constructor_id: number;
    n: number;
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
