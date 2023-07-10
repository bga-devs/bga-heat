class CreateEngineData {
    selectedCard: Card;
}

class FrontEngineCreate extends FrontEngine<CreateEngineData> {
    states: FrontState[];

    constructor (public game: HeatGame) {
    }

    
}