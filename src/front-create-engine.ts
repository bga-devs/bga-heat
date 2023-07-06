class CreateEngineData {
    selectedCard: BuilderCard;
}

class FrontEngineCreate extends FrontEngine<CreateEngineData> {
    states: FrontState[];

    constructor (public game: HeatGame) {
    }

    
}