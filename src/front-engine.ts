class FrontState<T> {
    constructor (
        public name: string, 
        public onEntering: (engine: FrontEngine<T>) => void, 
        public onLeaving: (engine: FrontEngine<T>) => void = () => {},
    ) {
    }
}

class FrontEngine<T> {
    public data: T;
    public currentState: string;

    constructor (
        public game: HeatGame, 
        private states: FrontState<T>[], 
    ) {
    }

    public leaveState() {
        this.states.find(state => state.name == this.currentState)?.onLeaving(this);
    }

    public enterState(name: string) {
        this.currentState = name;
        this.states.find(state => state.name == name).onEntering(this);
    }

    public nextState(name: string) {
        this.leaveState();
        this.enterState(name);
    }
}