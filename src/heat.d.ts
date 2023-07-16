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
    onTableTechnologyTileClick(destination: TechnologyTile): void;
    onHandCardClick(card: Card): void;
    onHandCardSelectionChange(selection: Card[]): void;
    onTableCardClick(card: Card): void;
    onPlayedCardClick(card: Card): void;
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

interface EnteringReactArgs {
    canPass: boolean;
    symbols: { [symbol: string]: number };
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
