const MAP_WIDTH = 1650;
const MAP_HEIGHT = 1100;

const LEADERBOARD_POSITIONS = {
    1: { x: 0, y: 0, a: 0 },
    2: { x: -77, y: 52, a: 0 },
    3: { x: 77, y: 52, a: 0 },
    4: { x: 0, y: 128, a: 0 },
    5: { x: 0, y: 180, a: 0 },
    6: { x: 0, y: 232, a: 0 },
    7: { x: 0, y: 284, a: 0 },
    8: { x: 0, y: 336, a: 0 },
};

const WEATHER_TOKENS_ON_SECTOR_TENT = [0, 4, 5];

const EVENTS_PRESS_CORNERS = {
    1: [0],
    2: [1],
    3: [2],
    4: [4],
    5: [2, 4],
    6: [2],
    7: [0],
    8: [1, 4],
    9: [4],
    10: [4],
};

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
    private tableCenterDiv: HTMLDivElement;
    private circuitDiv: HTMLDivElement;
    private scale: number = 1;

    private circuitDatas: CircuitDatas;
        
    constructor(private game: HeatGame, private gamedatas: HeatGamedatas) {
        this.tableCenterDiv = document.getElementById('table-center') as HTMLDivElement;
        this.circuitDiv = document.getElementById('circuit') as HTMLDivElement;

        if (gamedatas.circuitDatas?.jpgUrl) {
            this.loadCircuit(gamedatas.circuitDatas);

            Object.values(this.gamedatas.constructors).forEach((constructor) => this.createCar(constructor));

            if (gamedatas.championship?.circuits) {
                const event = gamedatas.championship.circuits[gamedatas.championship.index].event;
                const pressCorners = EVENTS_PRESS_CORNERS[event];
                pressCorners.forEach((cornerId: number) => this.createPressToken(cornerId));
            }
        }
    }
    
    public loadCircuit(circuitDatas: CircuitDatas) {
        this.circuitDatas = circuitDatas;
        this.circuitDiv.style.backgroundImage = `url('${this.circuitDatas.jpgUrl.startsWith('http') ? this.circuitDatas.jpgUrl : `${g_gamethemeurl}img/${this.circuitDatas.jpgUrl}`}')`;

        this.createCorners(this.circuitDatas.corners);
        this.createWeather(this.gamedatas.weather, this.circuitDatas);
    }

    /** 
     * Set map size, depending on available screen size.
     * Player table will be placed left or bottom, depending on window ratio.
     */ 
    public setAutoZoom() {

        if (!this.tableCenterDiv.clientWidth) {
            setTimeout(() => this.setAutoZoom(), 200);
            return;
        }

        const horizontalScale = document.getElementById('game_play_area').clientWidth / MAP_WIDTH;
        const verticalScale = (window.innerHeight - 80) / MAP_HEIGHT;
        this.scale = Math.min(1, horizontalScale, verticalScale);

        this.tableCenterDiv.style.transform = this.scale === 1 ? '' : `scale(${this.scale})`;
        const maxHeight = this.scale === 1 ? '' : `${MAP_HEIGHT * this.scale}px`;
        //this.mapDiv.style.maxHeight = maxHeight;
        this.tableCenterDiv.style.maxHeight = maxHeight;
        //this.mapDiv.style.marginBottom = `-${(1 - this.scale) * gameHeight}px`;
    }
    
    private createCorners(corners: { [id: number]: Corner }): void {
        Object.entries(corners).forEach(([stringId, corner]) => this.createCorner({...corner, id: Number(stringId) }));
    }
    
    private createCorner(corner: Corner): void {
        const cornerDiv = document.createElement('div');
        cornerDiv.id = `corner-${corner.id}`,
        cornerDiv.classList.add('corner');
        cornerDiv.style.setProperty('--x', `${corner.x}px`);
        cornerDiv.style.setProperty('--y', `${corner.y}px`);
        this.circuitDiv.insertAdjacentElement('beforeend', cornerDiv);
    }
    
    private createPressToken(cornerNumber: number): void {
        const corners = Object.values(this.circuitDatas.corners);
        const corner = corners[cornerNumber % corners.length];
        const pressIconDiv = document.createElement('div');
        pressIconDiv.id = `press-icon-${cornerNumber}`;
        pressIconDiv.classList.add(`press-icon`);
        pressIconDiv.style.setProperty('--x', `${corner.tentX}px`);
        pressIconDiv.style.setProperty('--y', `${corner.tentY}px`);
        pressIconDiv.innerHTML = `<i class="fa fa-camera"></i>`
        this.circuitDiv.insertAdjacentElement('beforeend', pressIconDiv);

        this.game.setTooltip(pressIconDiv.id, `<div class="press-token"></div>`);
    }
    
    private createWeather(weather: Weather, circuitDatas: CircuitDatas): void {
        if (weather?.tokens) {
            this.createWeatherCard(weather.card, circuitDatas.weatherCardPos);
            this.createWeatherTokens(weather.tokens, circuitDatas.corners, weather.card);
        }
    }
    
    private createWeatherCard(type: number, wheatherCardPos: Cell): void {
        const weatherCardDiv = document.createElement('div');
        weatherCardDiv.id = 'weather-card';
        weatherCardDiv.classList.add('weather-card');
        weatherCardDiv.dataset.cardType = `${type}`;
        weatherCardDiv.style.setProperty('--x', `${wheatherCardPos.x}px`);
        weatherCardDiv.style.setProperty('--y', `${wheatherCardPos.y}px`);
        this.circuitDiv.insertAdjacentElement('beforeend', weatherCardDiv);
        this.game.setTooltip(weatherCardDiv.id, `${this.getWeatherCardSetupTooltip(type)}<br><br>${this.getWeatherCardEffectTooltip(type)}`);
    }

    private getWeatherCardSetupTooltip(type: number): string {
        switch (type) {
            case 0:
                return _("Remove 1 Stress card from your deck.");
            case 1:
                return _("Place 1 extra Heat card in your Engine.");
            case 2:
                return _("Shuffle 1 extra Stress card into your deck.");
            case 3:
                return _("Remove 1 Heat card from your Engine.");
            case 4:
                return _("Shuffle 3 of your Heat cards into your draw deck.");
            case 5:
                return _("Place 3 of your Heat cards into your discard pile.");
        }
    }

    private getWeatherCardEffectTooltip(type: number): string {
        switch (type) {
            case 0:
                return `
                    <strong>${_("No cooling")}</strong>
                    <br>
                    ${ _("No Cooldown allowed in this sector during the React step.") }
                `;
            case 1:
                return `
                    <strong>${_("No slipstream")}</strong>
                    <br>
                    ${ _("You cannot start slipstreaming from this sector (you may slipstream into it).") }
                    `;
            case 2: case 5:
                return `<strong>${_("Slipstream boost")}</strong>
                <br>
                ${ _("If you choose to Slipstream, you may add 2 extra Spaces to the usual 2 Spaces. Your car must be located in this sector before you slipstream.") }
                `;
            case 3: case 4:
                return `<strong>${_("Cooling Bonus")}</strong>
                <br>
                ${ _("+1 Cooldown in this sector during the React step.") }
                `;
        }
    }
    
    private createWeatherTokens(tokens: { [id: number]: number }, corners: { [id: number]: Corner }, cardType: number): void {
        Object.entries(tokens).forEach(([cornerId, type]) => {
            const field = WEATHER_TOKENS_ON_SECTOR_TENT.includes(type) ? 'sectorTent' : 'tent';
            const corner = corners[cornerId];
            this.createWeatherToken(type, corner[`${field}X`], corner[`${field}Y`], cardType);
        });
    }
    
    private createWeatherToken(type: number, x: number, y: number, cardType: number): void {
        const weatherTokenDiv = document.createElement('div');
        weatherTokenDiv.id = `weather-token-${type}-${document.querySelectorAll(`.weather-token[id^="weather-token-"]`).length}`;
        weatherTokenDiv.classList.add('weather-token');
        weatherTokenDiv.dataset.tokenType = `${type}`;
        weatherTokenDiv.style.setProperty('--x', `${x}px`);
        weatherTokenDiv.style.setProperty('--y', `${y}px`);
        this.circuitDiv.insertAdjacentElement('beforeend', weatherTokenDiv);
        this.game.setTooltip(weatherTokenDiv.id, this.getWeatherTokenTooltip(type, cardType));
    }

    private getWeatherTokenTooltip(type: number, cardType: number): string {
        switch (type) {
            case 0:
                return `
                    <strong>${_("Weather")}</strong>
                    <br>
                    ${ _("Weather effect applies to this sector:") }
                    <br>
                    ${this.getWeatherCardEffectTooltip(cardType)}
                `;
            case 1:
                return `
                    <strong>${_("Overheat")}</strong>
                    <br>
                    ${ _("If your Speed is higher than the Speed Limit when you cross this corner, the cost in Heat that you need to pay is increased by one.") }
                `;
            case 2:
                return this.game.getGarageModuleIconTooltip('adjust', -1);
            case 3:
                return this.game.getGarageModuleIconTooltip('adjust', 1);
            case 4:
                return `
                    <strong>${_("Heat control")}</strong>
                    <br>
                    ${ _("Do not pay Heat to boost in this sector (still max one boost per turn). Your car must be in the sector when you boost.") }
                `;
            case 5:
                return `
                    <strong>${_("Slipstream boost")}</strong>
                    <br>
                    ${ _("If you choose to Slipstream, you may add one extra Space to the usual 2 Spaces. Your car must be located in this sector before you slipstream.") }
                `;
        }
    }

    private getCellPosition(carCell: number) {
        const cell = carCell < 0 ? structuredClone(this.circuitDatas.podium) : this.circuitDatas.cells[carCell];

        if (carCell < 0) {
            cell.x += LEADERBOARD_POSITIONS[Math.abs(carCell)].x;
            cell.y += LEADERBOARD_POSITIONS[Math.abs(carCell)].y;
        }

        return cell;
    }

    private createCar(constructor: Constructor) {
        let car = document.getElementById(`car-${constructor.id}`);
        if (!car) {
            car = document.createElement('div');
            car.id = `car-${constructor.id}`,
            car.classList.add('car');
            if (constructor.pId === this.game.getPlayerId()) {
                car.classList.add('current');
            }
            car.style.setProperty('--constructor-id', `${constructor.id}`);
            this.circuitDiv.insertAdjacentElement('beforeend', car);

            let html = `<div class="constructor-avatar ${constructor.ai ? 'legend' : 'player'}" style="`;
            if (constructor.ai) {
                html += `--constructor-id: 0;`;
            } else {
                // ? Custom image : Bga Image
                //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
                html += `background-image: url('${(document.getElementById(`avatar_${constructor.pId}`) as HTMLImageElement).src}');`;
            }
            this.game.setTooltip(car.id, `${html}"></div> <strong style="color: #${CONSTRUCTORS_COLORS[constructor.id]};">${constructor.name}</strong>`);
        }
        const cell = this.getCellPosition(constructor.carCell);
        car.style.setProperty('--x', `${cell.x}px`);
        car.style.setProperty('--y', `${cell.y}px`);
        car.style.setProperty('--r', `${cell.a}deg`);
    }

    public moveCar(constructorId: number, carCell: number, path?: number[]): Promise<any> {
        const car = document.getElementById(`car-${constructorId}`);
        if (path) {
            return this.moveCarWithAnimation(car, path).then(() => this.moveCar(constructorId, carCell));
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
            car.classList.add('with-transition');
            car.clientWidth;
            const cell = this.getCellPosition(carCell);
            car.style.setProperty('--x', `${cell.x}px`);
            car.style.setProperty('--y', `${cell.y}px`);
            car.style.setProperty('--r', `${cell.a + 1080}deg`);

            setTimeout(() => {
                car.classList.remove('with-transition');
                car.clientWidth;
                car.style.setProperty('--r', `${cell.a}deg`);
                resolve(true);
            }, time + 200);
        });
    }
    
    public finishRace(constructorId: number, pos: number): Promise<any> {
        return new Promise((resolve) => {
            const car = document.getElementById(`car-${constructorId}`);
            const time = 1500;
            car.style.setProperty('--transition-time', `${time}ms`);
            car.classList.add('with-transition');
            car.clientWidth;
            const cell = this.getCellPosition(-pos);
            car.style.setProperty('--x', `${cell.x}px`);
            car.style.setProperty('--y', `${cell.y}px`);
            car.style.setProperty('--r', `${cell.a}deg`);

            setTimeout(() => {
                car.classList.remove('with-transition');
                resolve(true);
            }, time + 200);
        });
    }
    
    public addMapIndicator(cellId: number, clickCallback?: () => void, speed: number = 0, stress: boolean = false): void {
        const mapIndicator = document.createElement('div');
        mapIndicator.id = `map-indicator-${cellId}`,
        mapIndicator.classList.add('map-indicator');
        let cell = this.circuitDatas.cells[cellId];
        mapIndicator.style.setProperty('--x', `${cell.x}px`);
        mapIndicator.style.setProperty('--y', `${cell.y}px`);
        this.circuitDiv.insertAdjacentElement('beforeend', mapIndicator);

        if (clickCallback) {
            mapIndicator.addEventListener('click', clickCallback);
            mapIndicator.classList.add('clickable');
        }

        if (speed) {
            mapIndicator.innerHTML = `${speed}`;
        }
        if (stress) {
            mapIndicator.classList.add('stress');
        }
    }
    
    public removeMapIndicators(): void {
        this.circuitDiv.querySelectorAll('.map-indicator').forEach(elem => elem.remove());
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

        if (color) {
            setTimeout(() => this.showCorner(id), this.game.animationManager.animationsActive() ? 2000 : 1);
        }
    }
    
    public setEliminatedPodium(pos: number) {
        const cell = structuredClone(this.circuitDatas.podium);
        cell.x += LEADERBOARD_POSITIONS[Math.abs(pos)].x;
        cell.y += LEADERBOARD_POSITIONS[Math.abs(pos)].y;

        this.circuitDiv.insertAdjacentHTML('beforeend', `<div class="eliminated-podium" style="--x: ${cell.x}px; --y: ${cell.y}px;">❌</div>`);
    }
}