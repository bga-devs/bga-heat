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
  engine?: { [id: number]: Card };
  hand?: Card[];
  handCount: number;
  speed: number;
  inplay?: { [id: number]: Card };
  discard: { [id: number]: Card };
  deckCount: number;
  distanceToCorner: number;
  paths?: number[][];
  canLeave: boolean;
  planification: number[];
}

interface Cell {
  x: number;
  y: number;
  a: number;
}
interface Podium extends Cell {
  size: number;
}

interface Corner {
  id?: number;
  x: number;
  y: number;
  lane: number;
  speed: number;
  tentX: number;
  tentY: number;
  sectorTentX: number;
  sectorTentY: number;
  sector: number[]; // sector cells
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
  cells: { [id: number]: Cell };
  corners: { [id: number]: Corner };
  weatherCardPos: Cell;
  podium: Podium;
  pressCorners?: number[];
}

interface HeatGamedatas {
  current_player_id: string;
  decision: { decision_type: string };
  game_result_neutralized: string;
  gamestate: Gamestate;
  gamestates: { [gamestateId: number]: Gamestate };
  neutralized_player_id: string;
  notifications: { last_packet_id: string; move_nbr: string };
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
  scores: { [index: number]: { [constructor_id: number]: number } };
  isDeferredRounds: boolean;
}

interface HeatGame extends Game {
  animationManager: AnimationManager;
  cardsManager: CardsManager;
  legendCardsManager: LegendCardsManager;
  eventCardsManager: EventCardsManager;

	gameui: GameGui<HeatGamedatas>;
  statusBar: StatusBar;
  images: Images;
  sounds: Sounds;
  userPreferences: UserPreferences;
  players: Players;
  actions: Actions;
  notifications: Notifications;
  gameArea: GameArea;
  playerPanels: PlayerPanels;
  dialogs: Dialogs;

  getPlayerId(): number;
  getPlayer(playerId: number): HeatPlayer;
  getGameStateName(): string;
  getCurrentPlayerTable(): PlayerTable | null;
  getGarageModuleIconTooltip(symbol: string, number: number | string): string;
  getGarageModuleIconTooltipWithIcon(symbol: string, number: number | string): string;
  getWeatherCardSetupTooltip(type: number): string;
  getWeatherCardEffectTooltip(type: number): string;
  getWeatherTokenTooltip(type: number, cardType: number): string;
  setTooltip(id: string, html: string): void;
  onHandCardSelectionChange(selection: Card[]): void;
  onInPlayCardSelectionChange(selection: Card[]): void;
  changePageTitle(suffix?: string, save?: boolean): void;
}

interface EnteringChooseUpgradeArgs {
  market: { [cardId: number]: Card };
}

interface EnteringSwapUpgradeArgs extends EnteringChooseUpgradeArgs {
  owned: { [cardId: number]: Card };
}

interface EnteringPlanificationPrivateArgs {
  cards: number[];
  selection: number[];
  cells: { [speed: number]: number /*destination cell*/ };
  speeds: { [cardId: number]: number | number[] };
  boostingCardIds: number[];
  clutteredHand: boolean;
  canSkipEndRace: boolean;
  canMulligan: boolean;
  flooded: boolean;
}

interface EnteringPlanificationArgs {
  _private?: EnteringPlanificationPrivateArgs;
  nPlayersLeft: number;
}

interface SpeedChoice {
  cell: number; // destination cell
  heatCosts: number;
  choices: {
    [cardId: number]: number /* card speed */;
  }[];
}

interface EnteringChooseSpeedArgs {
  speeds: { [speed: number]: SpeedChoice };
}

interface EnteringSlipstreamArgs /*extends EnteringChooseSpeedArgs*/ {
  heatCosts: { [speed: number]: number /*heatCost*/ };
  speeds: { [speed: number]: number /*destination cell*/ };
  currentHeatCost: number;
  currentHeatCosts: { [cornerId: number]: number };
  spinOut: boolean;
  nextCornerSpeedLimit: number;
  nextCornerExtraHeatCost: boolean;
  slipstreamWillCrossNextCorner: { [cornerId: number]: boolean };
}

interface ReactSymbolEntry {
  used: false;
  value: number;
  n: number;
  doable?: boolean;
}

interface ReactSymbol {
  doable: boolean;
  max?: number;
  min?: number;
  entries: { [from: string | number]: ReactSymbolEntry };
  used: any; // DYNAMICALLY COMPUTED BASED ON used FLAG IN ENTRIES
  mandatory: boolean;
  coalescable: boolean; // true means can be grouped, false means done 1 by 1
  upTo: boolean; // TRUE means the player can use less than the total of selected cards (all coalescable except HEAT currently)

  // SOME SYMBOLS HAVE EXTRA INFORMATIONS
  heatCosts?: { [cardId: number]: { [something: number]: number } }; // DIRECT
  heated?: boolean; // HEATED_BOOST
  willCrossNextCorner?: boolean; // ADRENALINE
  flippedCards?: number; // ACCELERATE
}

interface EnteringReactArgs {
  canPass: boolean;
  symbols: { [symbol: string]: ReactSymbol };
  flippedCards: number;
  adrenalineWillCrossNextCorner: boolean;
  currentHeatCost: number;
  heatCosts: { [cornerId: number]: number };
  spinOut: boolean;
  nextCornerSpeedLimit: number;
  nextCornerExtraHeatCost: boolean;
  boostInfos: { [boostSpeed: number]: { [cornerId: number]: number } };
  crossedFinishLine: boolean;
}

interface EnteringOldReactArgs {
  canPass: boolean;
  symbols: { [symbol: string]: number | number[] };
  flippedCards: number;
  doable: string[];

  adrenalineWillCrossNextCorner: boolean;
  currentHeatCost: number;
  heatCosts: { [cornerId: number]: number };
  spinOut: boolean;
  nextCornerSpeedLimit: number;
  nextCornerExtraHeatCost: boolean;
  boostInfos: { [boostSpeed: number]: { [cornerId: number]: number } };
  crossedFinishLine: boolean;
  directPlayCosts: { [cardId: number]: { [something: number]: number } };
}

interface EnteringPayHeatsArgs {
  heatInReserve: number;
  maxPayableCards: number;
  payingCards: { [cardId: number]: number };
}

interface EnteringDiscardArgs {
  _private?: {
    cardIds: number[];
  };
}

interface EnteringSalvageArgs {
  _private?: {
    cards: { [id: number]: Card };
  };
  n: number;
}

// loadCircuit
interface NotifLoadCircuitArgs {
  circuit: CircuitDatas;
}

// clean
interface NotifCleanArgs {
  counters: {
    [constructor_id: number]: {
      deckCount: number;
    };
  };
}

// newMarket
interface NotifNewMarketArgs {
  upgrades: Card[];
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
interface NotifUpdatePlanificationArgs {
  args: EnteringPlanificationArgs;
}

// reveal
interface NotifRevealArgs {
  constructor_id: number;
  gear: number; // new gear
  cards: { [id: number]: Card };
  heats?: Card[];
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
  distanceToCorner: number;
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
  deckCount: number;
}

// mulligan
interface NotifMulliganArgs extends NotifCardsArgs {
  heat: Card;
}

// refresh
interface NotifRefreshArgs {
  constructor_id: number;
  card: Card;
}

// discard
interface NotifDiscardCardsArgs extends NotifCardsArgs {
  cards?: { [id: number]: Card };
}

interface NotifEventRemoveHeatArgs {
  constructor_id: number;
  card: Card;
}

// pDraw, pDiscard
interface NotifPCardsArgs {
  constructor_id: number;
  cards: { [id: number]: Card };
  areSponsors: boolean;
  deckCount: number;
}

// pMulligan
interface NotifPMulliganArgs extends NotifPCardsArgs {
  heat: Card;
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
  canLeave: boolean;
}

// endOfRace
interface NotifEndOfRaceArgs {
  order: number[]; // constructor_ids
  scores: { [index: number]: { [constructor_id: number]: number } };
}

// newLegendCard
interface NotifNewLegendCardArgs {
  card: LegendCard;
}

// scrapCards
interface NotifScrapCardsArgs {
  constructor_id: number;
  cards: { [id: number]: Card }; // cards to discard (from deck)
  deckCount: number;
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
  cards: { [id: number]: Card }; // cards to salvage (from discard to deck)
  discard: { [id: number]: Card }; // for remaining discard pile
  deckCount: number;
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
  canLeave: boolean;
  giveUp: boolean;
}

// newChampionshipRace
interface NotifNewChampionshipRaceArgs {
  board: string;
  event: string;
  index: number;
  circuitDatas: CircuitDatas;
  nbrLaps: number;
  distancesToCorners: { [constructor_id: number]: number };
}

// startRace
interface NotifStartRaceArgs {
  constructor_ids: number[];
  weather: Weather;
  cells: { [constructor_id: number]: number };
}

// setupRace
interface NotifSetupRaceArgs {
  counters: {
    [constructor_id: number]: {
      deckCount: number;
      engine: { [id: number]: Card };
      discard: { [id: number]: Card };
    };
  };
}

// cryCauseNotEnoughHeatToPay
interface NotifCryCauseNotEnoughHeatToPayArgs {
  constructor_id: number;
  cell: number;
  turn: number;
  distance: number;
}

// setWeather
interface NotifSetWeatherArgs {
  weather: Weather;
}

// clearTurn
interface NotifClearTurnArgs {
  notifIds: string[];
}

// refreshUI
interface NotifRefreshUIArgs {
  datas: {
    players: { [playerId: number]: HeatPlayer };
    constructors: { [id: number]: Constructor };
    progress: number;
    scores: { [index: number]: { [constructor_id: number]: number } };
  };
}

// refreshHand
interface NotifRefreshHandArgs {
  constructor_id: number;
  hand: Card[];
}
