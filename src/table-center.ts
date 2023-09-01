const MAP_WIDTH = 1650;
const MAP_HEIGHT = 1093;
const MAP_SCALE = 1650 / 1280;

const LEADERBOARD_POSITIONS = {
    '-1': { x: 0, y: 0, a: 0 },
    '-2': { x: -60, y: 40, a: 0 },
    '-3': { x: 60, y: 40, a: 0 },
    '-4': { x: 0, y: 99, a: 0 },
    '-5': { x: 0, y: 139, a: 0 },
    '-6': { x: 0, y: 179, a: 0 },
    '-7': { x: 0, y: 219, a: 0 },
    '-8': { x: 0, y: 259, a: 0 },
}

class Circuit {
    private mapDiv: HTMLDivElement;
    private scale: number = 1;

    private MAP_DATAS = window['MAP_DATAS'];
        
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

    private getCellPosition(carCell: number) {
        const cell = structuredClone(this.MAP_DATAS[Math.max(0, carCell)]);

        if (carCell < 0) {
            cell.x += LEADERBOARD_POSITIONS[carCell].x;
            cell.y += LEADERBOARD_POSITIONS[carCell].y;
        }

        return cell;
    }

    private createCar(constructor: Constructor) {
        const car = document.createElement('div');
        car.id = `car-${constructor.id}`,
        car.classList.add('car');
        const cell = this.getCellPosition(constructor.carCell);
        car.style.setProperty('--x', `${MAP_SCALE * cell.x}px`);
        car.style.setProperty('--y', `${MAP_SCALE * cell.y}px`);
        car.style.setProperty('--r', `${cell.a}deg`);
        car.style.setProperty('--constructor-id', `${constructor.id}`);
        this.mapDiv.insertAdjacentElement('beforeend', car);
    }

    public moveCar(constructorId: number, carCell: number) {
        const car = document.getElementById(`car-${constructorId}`);
        const cell = this.getCellPosition(carCell);
        car.style.setProperty('--x', `${MAP_SCALE * cell.x}px`);
        car.style.setProperty('--y', `${MAP_SCALE * cell.y}px`);
        car.style.setProperty('--r', `${cell.a}deg`);
    }
    
    public addMapIndicator(cellId: number, clickCallback?: () => void): void {
        const mapIndicator = document.createElement('div');
        mapIndicator.id = `map-indicator-${cellId}`,
        mapIndicator.classList.add('map-indicator');
        let cell = this.MAP_DATAS[cellId];
        mapIndicator.style.setProperty('--x', `${MAP_SCALE * cell.x}px`);
        mapIndicator.style.setProperty('--y', `${MAP_SCALE * cell.y}px`);
        this.mapDiv.insertAdjacentElement('beforeend', mapIndicator);

        if (clickCallback) {
            mapIndicator.addEventListener('click', clickCallback);
        }
    }
    
    public removeMapIndicators(): void {
        this.mapDiv.querySelectorAll('.map-indicator').forEach(elem => elem.remove());
    }
}