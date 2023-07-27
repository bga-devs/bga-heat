const MAP_WIDTH = 1650;
const MAP_HEIGHT = 1093;

class Circuit {
    private mapDiv: HTMLDivElement;
    private scale; number = 1;
        
    constructor(private game: HeatGame, gamedatas: HeatGamedatas) {
        this.mapDiv = document.getElementById('circuit') as HTMLDivElement;

        this.mapDiv.style.backgroundImage = `url('${g_gamethemeurl}img/Circuits/${gamedatas.circuit}.jpg')`;

        Object.values(gamedatas.constructors).forEach((constructor) => this.createCar(constructor));
    }

    /** 
     * Set map size, depending on available screen size.
     * Player table will be placed left or bottom, depending on window ratio.
     */ 
    public setAutoZoom() {

        if (!this.mapDiv.clientWidth) {
            setTimeout(() => this.setAutoZoom(), 200);
            return;
        }

        const gameWidth = MAP_WIDTH;
        const gameHeight = MAP_HEIGHT;

        const horizontalScale = document.getElementById('game_play_area').clientWidth / gameWidth;
        const verticalScale = (window.innerHeight - 80) / gameHeight;
        this.scale = Math.min(1, horizontalScale, verticalScale);

        this.mapDiv.style.transform = this.scale === 1 ? '' : `scale(${this.scale})`;
        const maxHeight = this.scale === 1 ? '' : `${MAP_HEIGHT * this.scale}px`;
        //this.mapDiv.style.maxHeight = maxHeight;
        document.getElementById('table-center').style.maxHeight = maxHeight;
        //this.mapDiv.style.marginBottom = `-${(1 - this.scale) * gameHeight}px`;
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
        this.mapDiv.insertAdjacentElement('beforeend', car);
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
        this.mapDiv.insertAdjacentElement('beforeend', mapIndicator);

        if (clickCallback) {
            mapIndicator.addEventListener('click', clickCallback);
        }
    }
    
    public removeMapIndicators(): void {
        this.mapDiv.querySelectorAll('.map-indicator').forEach(elem => elem.remove());
    }
}