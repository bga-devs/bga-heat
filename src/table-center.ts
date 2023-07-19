class TableCenter {
        
    constructor(private game: HeatGame, gamedatas: HeatGamedatas) {
        document.getElementById('circuit').style.backgroundImage = `url('${g_gamethemeurl}img/Circuits/${gamedatas.circuit}.jpg')`;

        Object.values(gamedatas.constructors).forEach((constructor) => this.createCar(constructor));
    }

    private createCar(constructor: Constructor) {
        const car = document.createElement('div');
        car.id = `car-${constructor.id}`,
        car.classList.add('car');
        let cell = window['USA_DATAS'][constructor.carCell];
        let scale = 1650 / 1280;
        car.style.setProperty('--x', `${scale * cell.x}px`);
        car.style.setProperty('--y', `${scale * cell.y}px`);
        car.style.setProperty('--r', `${cell.a}deg`);
        car.style.setProperty('--constructor-id', `${constructor.id}`);
        document.getElementById('circuit').insertAdjacentElement('beforeend', car);
    }

    public moveCar(constructorId: number, carCell: number) {
        const car = document.getElementById(`car-${constructorId}`);
        let cell = window['USA_DATAS'][carCell];
        let scale = 1650 / 1280;
        car.style.setProperty('--x', `${scale * cell.x}px`);
        car.style.setProperty('--y', `${scale * cell.y}px`);
        car.style.setProperty('--r', `${cell.a}deg`);
    }
    
    public addMapIndicator(cellId: number, clickCallback?: () => void): void {
        const mapIndicator = document.createElement('div');
        mapIndicator.id = `map-indicator-${cellId}`,
        mapIndicator.classList.add('map-indicator');
        let cell = window['USA_DATAS'][cellId];
        let scale = 1650 / 1280;
        mapIndicator.style.setProperty('--x', `${scale * cell.x}px`);
        mapIndicator.style.setProperty('--y', `${scale * cell.y}px`);
        document.getElementById('circuit').insertAdjacentElement('beforeend', mapIndicator);

        if (clickCallback) {
            mapIndicator.addEventListener('click', clickCallback);
        }
    }
    
    public removeMapIndicators(): void {
        document.getElementById('circuit').querySelectorAll('.map-indicator').forEach(elem => elem.remove());
    }
}