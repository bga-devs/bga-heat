const MAP_WIDTH = 1650;
const MAP_HEIGHT = 1100;

const LEADERBOARD_POSITIONS = {
    '-1': { x: 0, y: 0, a: 0 },
    '-2': { x: -77, y: 52, a: 0 },
    '-3': { x: 77, y: 52, a: 0 },
    '-4': { x: 0, y: 128, a: 0 },
    '-5': { x: 0, y: 180, a: 0 },
    '-6': { x: 0, y: 232, a: 0 },
    '-7': { x: 0, y: 284, a: 0 },
    '-8': { x: 0, y: 336, a: 0 },
}

// Wrapper for the animation that use requestAnimationFrame
class CarAnimation {
    private newpath: SVGPathElement;
    private duration: number;
    private resolve: any;
    private tZero: number;

    constructor(private car: HTMLElement, private pathCells: { x: number; y: number; a: number; }[]) {
        // Control strength is how far the control point are from the center of the cell
        //  => it should probably be something related/proportional to scale of current board
        let controlStrength = 20;

        let path = "";
        pathCells.forEach((data, i) => {
            // We compute the control point based on angle
            //  => we have a special case for i = 0 since it's the only one with a "positive control point" (ie that goes in the same direction as arrow)
            let cp = {
                x: data.x + Math.cos((data.a * Math.PI) / 180) * (i == 0 ? 1 : -1) * controlStrength,
                y: data.y + Math.sin((data.a * Math.PI) / 180) * (i == 0 ? 1 : -1) * controlStrength,
            };
        
            // See "Shortand curve to" on https://developer.mozilla.org/fr/docs/Web/SVG/Tutorial/Paths
            if (i == 0) {
                path += `M ${data.x} ${data.y} C ${cp.x} ${cp.y}, `;
            } else if (i == 1) {
                path += `${cp.x} ${cp.y}, ${data.x} ${data.y} `;
            } else {
                path += `S ${cp.x} ${cp.y}, ${data.x} ${data.y}`;
            }
        });

        this.newpath = document.createElementNS('http://www.w3.org/2000/svg', "path") as SVGPathElement;
        this.newpath.setAttributeNS(null, "d", path);
    }

    start() {
        this.duration = this.pathCells.length * 250;
        this.resolve = null;
        this.move(0);
    
        setTimeout(() => {
            this.tZero = Date.now();
            requestAnimationFrame(() => this.run());
        }, 0);
        return new Promise((resolve, reject) => {
            this.resolve = resolve;
        });
    }
        
    // Just a wrapper to get the absolute position based on a floating number u in [0, 1] (0 mean start of animation, 1 is the end)
    getPos(u: number) {
        return this.newpath.getPointAtLength(u * this.newpath.getTotalLength());
    }

    move(u: number) {
        const pos = this.getPos(u);
        const posPrev = this.getPos(u - 0.01);
        const posNext = this.getPos(u + 0.01);
        const angle = -Math.atan2(posNext.x - posPrev.x, posNext.y - posPrev.y);
        this.car.style.setProperty('--x', `${pos.x}px`);
        this.car.style.setProperty('--y', `${pos.y}px`);
        this.car.style.setProperty('--r', `${(angle * 180) / Math.PI + 90}deg`);
    }

    run() {
        const u = Math.min((Date.now() - this.tZero) / this.duration, 1);
        this.move(u);
    
        if (u < 1) {
            // Keep requesting frames, till animation is ready
            requestAnimationFrame(() => this.run());
        } else {
            if (this.resolve != null) {
                this.resolve();
            }
        }
    }
}

class Circuit {
    private mapDiv: HTMLDivElement;
    private scale: number = 1;

    private circuitDatas: CircuitDatas;
        
    constructor(private game: HeatGame, gamedatas: HeatGamedatas) {
        this.circuitDatas = gamedatas.circuitDatas;
        this.mapDiv = document.getElementById('circuit') as HTMLDivElement;

        this.mapDiv.style.backgroundImage = `url('${g_gamethemeurl}img/${this.circuitDatas.assets.jpg}')`;

        Object.values(gamedatas.constructors).forEach((constructor) => this.createCar(constructor));

        Object.entries(this.circuitDatas.corners).forEach((entry) => this.createCorner({...entry[1], id: Number(entry[0]) }));
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
    
    private createCorner(corner: Corner): void {
        const cornerDiv = document.createElement('div');
        cornerDiv.id = `corner-${corner.id}`,
        cornerDiv.classList.add('corner');
        cornerDiv.style.setProperty('--x', `${corner.x}px`);
        cornerDiv.style.setProperty('--y', `${corner.y}px`);
        this.mapDiv.insertAdjacentElement('beforeend', cornerDiv);
    }

    private getCellPosition(carCell: number) {
        const cell = structuredClone(carCell < 0 ? this.circuitDatas.podium : this.circuitDatas.cells[carCell]);

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
        car.style.setProperty('--x', `${cell.x}px`);
        car.style.setProperty('--y', `${cell.y}px`);
        car.style.setProperty('--r', `${cell.a}deg`);
        car.style.setProperty('--constructor-id', `${constructor.id}`);
        this.mapDiv.insertAdjacentElement('beforeend', car);
    }

    public moveCar(constructorId: number, carCell: number, path?: number[]): Promise<any> {
        const car = document.getElementById(`car-${constructorId}`);
        if (path) {
            return this.moveCarWithAnimation(car, path);
        } else {
            const cell = this.getCellPosition(carCell);
            car.style.setProperty('--x', `${cell.x}px`);
            car.style.setProperty('--y', `${cell.y}px`);
            car.style.setProperty('--r', `${cell.a}deg`);
            return Promise.resolve(true);
        }
    }
    

    public spinOutWithAnimation(constructorId: number, carCell: number, cellsDiff: number): Promise<any> {
        return new Promise((resolve) => {
            const car = document.getElementById(`car-${constructorId}`);
            const time = cellsDiff * 250;
            car.style.setProperty('--transition-time', `${time}ms`);
            car.classList.add('spin-out');
            car.clientWidth;
            const cell = this.getCellPosition(carCell);
            car.style.setProperty('--x', `${cell.x}px`);
            car.style.setProperty('--y', `${cell.y}px`);
            car.style.setProperty('--r', `${cell.a + 1080}deg`);

            setTimeout(() => {
                car.classList.remove('spin-out');
                car.clientWidth;
                car.style.setProperty('--r', `${cell.a}deg`);
                resolve(true);
            }, time + 200);
        });
    }
    
    public addMapIndicator(cellId: number, clickCallback?: () => void): void {
        const mapIndicator = document.createElement('div');
        mapIndicator.id = `map-indicator-${cellId}`,
        mapIndicator.classList.add('map-indicator');
        let cell = this.circuitDatas.cells[cellId];
        mapIndicator.style.setProperty('--x', `${cell.x}px`);
        mapIndicator.style.setProperty('--y', `${cell.y}px`);
        this.mapDiv.insertAdjacentElement('beforeend', mapIndicator);

        if (clickCallback) {
            mapIndicator.addEventListener('click', clickCallback);
        }
    }
    
    public removeMapIndicators(): void {
        this.mapDiv.querySelectorAll('.map-indicator').forEach(elem => elem.remove());
    }

    private getCellInfos(cellId: number | number[]) {
        // This is just a wrapper to either return the datas about the cell (center x, center y, angle)
        //      or simulate an "averaged cell" if two cells are given (to go through the middle of them)
        if (Array.isArray(cellId)) {
            let cellId1 = cellId[0];
            let cellId2 = cellId[1];
            return {
                x: (this.circuitDatas.cells[cellId1].x + this.circuitDatas.cells[cellId2].x) / 2,
                y: (this.circuitDatas.cells[cellId1].y + this.circuitDatas.cells[cellId2].y) / 2,
                a: (this.circuitDatas.cells[cellId1].a + this.circuitDatas.cells[cellId2].a) / 2,
            };
        } else {
            return this.circuitDatas.cells[cellId];
        }
    }

    private getCellsInfos(pathCellIds: number[]) {
        return pathCellIds.map(cellId => this.getCellInfos(cellId));
    }

    private moveCarWithAnimation(car: HTMLElement, pathCellIds: number[]): Promise<any> {        
        const pathCells = this.getCellsInfos(pathCellIds);
        
        const animation = new CarAnimation(car, pathCells);        
        return animation.start();
    }
    
    public showCorner(id: number, color?: string) {
        document.getElementById(`corner-${id}`)?.style.setProperty('--color', color ?? 'transparent');
    }
}