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
    carPosition: string;
    turn: number;
    score: number;
    lvl; // TODO
    hand: Card[];
    handCount: number;
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
    getTooltipActivation(activation: string): string;
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
    onCreateCardConfirm(data: CreateEngineData): void;
    onArchiveCardConfirm(data: ArchiveEngineData): void;
    onTimelineSlotClick(slotId: string): void;
}

interface EnteringInitialSelectionArgs {
    _private?: {
        cards: string[];
    }
}

type PossibleCardLocations = {[slotId: string]: number};

interface EnteringCreateArgs {
    _private?: {
        cards: {[id: string]: PossibleCardLocations};
    }
}

interface EnteringArchiveArgs {
    _private?: {
        cardIds: string[];
    }
}

interface EnteringLearnArgs {
    techs: any[]; // TODO
}

interface EnteringChooseNewCardArgs {
    centerCards: Card[];
    freeColor: number;
    recruits: number;
    allFree: boolean;
}

interface EnteringPayDestinationArgs {
    selectedDestination: TechnologyTile;
    recruits: number;
}

interface EnteringTradeArgs {
    bracelets: number;
    gainsByBracelets: { [bracelets: number]: number };
}

// pDrawCards
interface NotifPDrawCardsArgs {
    player_id: number;
    cards: Card[];
}

// pDiscardCards
interface NotifPDiscardCardsArgs {
    n: number;
    player_id: number;
    cards: Card[];
}

// createCard
interface NotifCreateCardsArgs {
    player_id: number;
    card: Card | TechnologyTile;
}

// fillPool
interface NotifFillPoolArgs {
    cards: TechnologyTile[];
}

// discardLostKnowledge
interface NotifDiscardLostKnowledgeArgs {
    player_id: number;
    n: number | string; // discarded lost knowledge
    m: number | string; // remaining lost knowledge
}

// learnTech
interface NotifLearnTechArgs {
    player_id: number;
    card: TechnologyTile;
}

// learnTech
interface NotifLearnTechArgs {
    player_id: number;
    card: TechnologyTile;
}

// clearTurn
interface NotifClearTurnArgs {
    notifIds: string[];
}

// refreshUI
interface NotifRefreshUIArgs {
    datas: {
        cards;
        players: { [playerId: number]: HeatPlayer };
        techs: TechnologyTile[];
    };
}

// refreshHand
interface NotifRefreshHandArgs {
    player_id: number;
    hand: Card[];
}

// declineCard
interface NotifDeclineCardArgs {
    player_id: number;
    card: Card;
}
