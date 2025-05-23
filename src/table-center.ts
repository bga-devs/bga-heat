const MAP_WIDTH = 1650;
const MAP_HEIGHT = 1100;

const LEADERBOARD_POSITIONS = {
  8: {
    1: { x: 0, y: 0, a: 0 },
    2: { x: -77, y: 52, a: 0 },
    3: { x: 77, y: 52, a: 0 },
    4: { x: 0, y: 128, a: 0 },
    5: { x: 0, y: 180, a: 0 },
    6: { x: 0, y: 232, a: 0 },
    7: { x: 0, y: 284, a: 0 },
    8: { x: 0, y: 336, a: 0 },
  },
  12: {
    1: { x: 0, y: 0, a: 0 },
    2: { x: -77, y: 52, a: 0 },
    3: { x: 77, y: 52, a: 0 },
    4: { x: 0, y: 128, a: 0 },
    5: { x: 0, y: 180, a: 0 },
    6: { x: 0, y: 232, a: 0 },
    7: { x: -77, y: 284, a: 0 },
    8: { x: 0, y: 284, a: 0 },
    9: { x: 77, y: 284, a: 0 },
    10: { x: -77, y: 336, a: 0 },
    11: { x: 0, y: 336, a: 0 },
    12: { x: 77, y: 336, a: 0 },
  },
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
  8: [1, 3],
  9: [3],
  10: [3],
};

const JAPAN_BELOW_TUNNEL_CELLS = [971, 975, 1033, 1037];

function moveCarAnimationDuration(cells: number, totalSpeed: number) {
  return totalSpeed <= 0 || cells < +0 ? 0 : Math.round((5500 / (20 + totalSpeed)) * cells);
}

function getSvgPathElement(pathCells: { x: number; y: number; a: number }[]) {
  // Control strength is how far the control point are from the center of the cell
  //  => it should probably be something related/proportional to scale of current board
  let controlStrength = 20;

  let path = ``;
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

  const newpath = document.createElementNS('http://www.w3.org/2000/svg', 'path') as SVGPathElement;
  newpath.setAttributeNS(null, 'd', path);
  return newpath;
}

// Wrapper for the animation that use requestAnimationFrame
class CarAnimation {
  private newpath: SVGPathElement;
  private duration: number;
  private resolve: any;
  private tZero: number;

  constructor(
    private car: HTMLElement,
    private pathCells: { x: number; y: number; a: number }[],
    private totalSpeed: number
  ) {
    this.newpath = getSvgPathElement(pathCells);
  }

  start() {
    this.duration = moveCarAnimationDuration(this.pathCells.length, this.totalSpeed);
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
  private circuitDiv: HTMLDivElement;
  private circuitDatas: CircuitDatas;

  constructor(
    private game: HeatGame,
    private gamedatas: HeatGamedatas
  ) {
    this.circuitDiv = document.getElementById('circuit') as HTMLDivElement;

    if (gamedatas.circuitDatas?.jpgUrl) {
      this.loadCircuit(gamedatas.circuitDatas);
      this.createWeather(this.gamedatas.weather);

      Object.values(this.gamedatas.constructors)
        .filter((constructor) => constructor.paths?.length > 0)
        .forEach((constructor) =>
          constructor.paths.filter((path) => path?.length > 1).forEach((path) => this.addMapPath(path, false))
        );
    }
  }

  public loadCircuit(circuitDatas: CircuitDatas) {
    this.circuitDatas = circuitDatas;
    this.circuitDiv.style.backgroundImage = `url('${this.circuitDatas.jpgUrl.startsWith('http') ? this.circuitDatas.jpgUrl : `${g_gamethemeurl}img/${this.circuitDatas.jpgUrl}`}')`;

    this.createCorners(this.circuitDatas.corners);
    this.createPressTokens(this.circuitDatas.pressCorners);

    Object.values(this.gamedatas.constructors).forEach((constructor) => this.createCar(constructor));

    // JAPAN TUNNEL
    if (circuitDatas.id == 'Japan') {
      this.circuitDiv.insertAdjacentHTML('beforeend', "<div id='japan-tunnel'></div>");
    } else {
      $('japan-tunnel')?.remove();
    }
  }

  public newCircuit(circuitDatas: CircuitDatas) {
    this.circuitDiv.innerHTML = '';

    this.loadCircuit(circuitDatas);
  }

  private createCorners(corners: { [id: number]: Corner }): void {
    Object.entries(corners).forEach(([stringId, corner]) => this.createCorner({ ...corner, id: Number(stringId) }));
  }

  private createCorner(corner: Corner): void {
    const cornerDiv = document.createElement('div');
    (cornerDiv.id = `corner-${corner.id}`), cornerDiv.classList.add('corner');
    cornerDiv.style.setProperty('--x', `${corner.x}px`);
    cornerDiv.style.setProperty('--y', `${corner.y}px`);
    this.circuitDiv.insertAdjacentElement('beforeend', cornerDiv);
  }

  public createPressTokens(pressCorners: number[]) {
    pressCorners?.forEach((cornerId: number) => this.createPressToken(cornerId));
  }

  private createPressToken(cornerId: number): void {
    const corner = this.circuitDatas.corners[cornerId];
    const corners = Object.values(this.circuitDatas.corners);
    const closeCornerToTheRight = corners.find(
      (otherCorner) =>
        (otherCorner.x != corner.x || otherCorner.y != corner.y) &&
        Math.sqrt(Math.pow(corner.tentX - otherCorner.tentX, 2) + Math.pow(corner.tentY - otherCorner.tentY, 2)) < 100 &&
        otherCorner.x > corner.x
    );
    const pressIconDiv = document.createElement('div');
    pressIconDiv.id = `press-icon-${cornerId}`;
    pressIconDiv.classList.add(`press-icon`);
    if (closeCornerToTheRight) {
      pressIconDiv.classList.add(`left-side`);
    }
    pressIconDiv.style.setProperty('--x', `${corner.tentX}px`);
    pressIconDiv.style.setProperty('--y', `${corner.tentY}px`);
    pressIconDiv.innerHTML = `<i class="fa fa-camera"></i>`;
    this.circuitDiv.insertAdjacentElement('beforeend', pressIconDiv);

    this.game.setTooltip(
      pressIconDiv.id,
      `
        <div class="press-token"></div><br><br>
        
        <strong>${_('Press Corner')}</strong><br><br>
        ${_('The international press is waiting in a specific corner for something spectacular to happen. This gives all players a permanent challenge throughout the race.')}
        <br>
        ${_('To gain a Sponsorship card this way you must either:')}<br>
        <ul class="press-corner-ul">
            <li>${_('Cross the Corner Line thanks to your Slipstream move (Speed is irrelevant in this case).')}</li>
            <li>${_('Exceed the Speed Limit of the Press Corner (potentially modified by a Road Conditions token) by 2 or more.')}</li>
        </ul>
        <br>
        ${_('Note: You cannot gain more than one Sponsorship card each time you go through a Press Corner.')}        
        `
    );
  }

  public createWeather(weather: Weather): void {
    if (weather?.tokens) {
      this.createWeatherCard(weather.card, this.circuitDatas.weatherCardPos);
      this.createWeatherTokens(weather.tokens, this.circuitDatas.corners, weather.card);
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
    this.game.setTooltip(
      weatherCardDiv.id,
      `${this.game.getWeatherCardSetupTooltip(type)}<br><br>${this.game.getWeatherCardEffectTooltip(type)}`
    );
  }

  private createWeatherTokens(tokens: { [id: number]: number }, corners: { [id: number]: Corner }, cardType: number): void {
    Object.entries(tokens)
      .filter(([cornerId, type]) => type !== null && type !== undefined)
      .forEach(([cornerId, type]) => {
        const field = WEATHER_TOKENS_ON_SECTOR_TENT.includes(type) ? 'sectorTent' : 'tent';
        const corner = corners[cornerId];
        if (corner) {
          this.createWeatherToken(type, corner[`${field}X`], corner[`${field}Y`], cardType);
        } else {
          console.warn(cornerId, `doesn't exists `, corners);
        }
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
    this.game.setTooltip(weatherTokenDiv.id, this.game.getWeatherTokenTooltip(type, cardType));
  }

  private getPodiumPosition(pos: number) {
    const cell = structuredClone(this.circuitDatas.podium);
    const leaderboardSize = this.circuitDatas.podium.size ?? 8;
    cell.a = 0;
    cell.x += LEADERBOARD_POSITIONS[leaderboardSize][pos].x;
    cell.y += LEADERBOARD_POSITIONS[leaderboardSize][pos].y;
    return cell;
  }

  private getCellPosition(carCell: number) {
    if (carCell < 0) {
      return this.getPodiumPosition(-carCell);
    }
    return this.circuitDatas.cells[carCell];
  }

  private createCar(constructor: Constructor) {
    let car = document.getElementById(`car-${constructor.id}`);
    if (!car) {
      car = document.createElement('div');
      (car.id = `car-${constructor.id}`), car.classList.add('car');
      if (constructor.pId === this.game.getPlayerId()) {
        car.classList.add('current');
      }
      car.style.setProperty('--constructor-id', `${constructor.id}`);
      this.circuitDiv.insertAdjacentElement('beforeend', car);

      let html = `<div class="constructor-avatar ${constructor.ai ? 'legend' : 'player'}" style="`;
      if (constructor.ai) {
        html += `--constructor-id: ${constructor.id};`;
      } else {
        // ? Custom image : Bga Image
        //url = url.replace('_32', url.indexOf('data/avatar/defaults') > 0 ? '' : '_184');
        html += `background-image: url('${(document.getElementById(`avatar_${constructor.pId}`) as HTMLImageElement).src}');`;
      }
      this.game.setTooltip(
        car.id,
        `${html}"></div> <strong style="color: #${CONSTRUCTORS_COLORS[constructor.id]};">${_(constructor.name)}</strong>`
      );
    }
    const cell = this.getCellPosition(constructor.carCell);
    if (cell) {
      car.style.setProperty('--x', `${cell.x}px`);
      car.style.setProperty('--y', `${cell.y}px`);
      car.style.setProperty('--r', `${cell.a ?? 0}deg`);
      this.updateCarZIndex(car, constructor.carCell);
    }
  }

  public isPassingBelowTunnel(cellOrPath: number | number[]) {
    if (this.circuitDatas.id != 'Japan') {
      return false;
    }

    if (Array.isArray(cellOrPath)) {
      return cellOrPath.reduce((acc, t) => acc || this.isPassingBelowTunnel(t), false);
    } else {
      return JAPAN_BELOW_TUNNEL_CELLS.includes(cellOrPath);
    }
  }

  public updateCarZIndex(car: HTMLElement, cellOrPath: number | number[]) {
    // JAPAN TUNNEL
    if (this.isPassingBelowTunnel(cellOrPath)) {
      car.style.zIndex = '1';
    } else {
      car.style.zIndex = '';
    }
  }

  public async moveCar(constructorId: number, carCell: number, path?: number[], totalSpeed?: number): Promise<any> {
    this.removeMapIndicators();

    const car = document.getElementById(`car-${constructorId}`);
    if (path?.length > 1 && this.game.animationManager.animationsActive()) {
      this.addMapPath(path, true, totalSpeed);
      try {
        await this.moveCarWithAnimation(car, path, totalSpeed);
        return await this.moveCar(constructorId, carCell);
      } catch (e) {
        return this.moveCar(constructorId, carCell);
      }
    } else {
      if (path?.length > 1) {
        this.addMapPath(path, false);
      }

      const cell = this.getCellPosition(carCell);
      if (!cell) {
        console.warn('Cell not found (moveCar) : cell ', carCell, 'constructorId', constructorId);
      }
      car.style.setProperty('--x', `${cell.x}px`);
      car.style.setProperty('--y', `${cell.y}px`);
      car.style.setProperty('--r', `${cell.a}deg`);
      this.updateCarZIndex(car, carCell);

      return Promise.resolve(true);
    }
  }

  public spinOutWithAnimation(constructorId: number, carCell: number, cellsDiff: number): Promise<any> {
    this.removeMapIndicators();

    return new Promise((resolve) => {
      const car = document.getElementById(`car-${constructorId}`);
      const time = moveCarAnimationDuration(cellsDiff, cellsDiff);
      car.style.setProperty('--transition-time', `${time}ms`);
      car.classList.add('with-transition');
      car.clientWidth;
      const cell = this.getCellPosition(carCell);
      if (!cell) {
        console.warn('Cell not found (spinOutWithAnimation) : cell ', carCell, 'constructorId', constructorId);
      }
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
      const cell = this.getPodiumPosition(pos);
      if (!cell) {
        console.warn('Cell not found (finishRace) : cell ', pos, 'constructorId', constructorId);
      }
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
    mapIndicator.id = `map-indicator-${cellId}`;
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

  public addCornerHeatIndicator(cornerId: number, heat: number): void {
    if (heat > 0) {
      const cornerHeatIndicator = document.createElement('div');
      cornerHeatIndicator.id = `corner-heat-indicator-${cornerId}`;
      cornerHeatIndicator.innerHTML = `${heat}`;
      cornerHeatIndicator.classList.add('corner-heat-indicator', 'icon', 'heat');
      let corner = this.circuitDatas.corners[cornerId];
      cornerHeatIndicator.style.setProperty('--x', `${corner.x}px`);
      cornerHeatIndicator.style.setProperty('--y', `${corner.y}px`);
      this.circuitDiv.insertAdjacentElement('beforeend', cornerHeatIndicator);
      document.getElementById(`corner-${cornerId}`).style.setProperty('--color', 'red');
    }
  }

  public removeMapIndicators(): void {
    this.circuitDiv.querySelectorAll('.map-indicator').forEach((elem) => elem.remove());
  }

  public removeCornerHeatIndicators(): void {
    this.circuitDiv.querySelectorAll('.corner').forEach((elem: HTMLElement) => elem.style.removeProperty('--color'));
    this.circuitDiv.querySelectorAll('.corner-heat-indicator').forEach((elem) => elem.remove());
  }

  public addMapPath(pathCellIds: number[], animated: boolean, totalSpeed?: number): void {
    try {
      const pathCells = this.getCellsInfos(pathCellIds);
      const path = getSvgPathElement(pathCells);

      // Compute zIndex => special case of tunnel
      let zIndex = this.isPassingBelowTunnel(pathCellIds) ? '1' : '3';

      //let cell = this.circuitDatas.cells[cellId];
      //mapPath.style.setProperty('--x', `${cell.x}px`);
      //mapPath.style.setProperty('--y', `${cell.y}px`);
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGElement;
      svg.appendChild(path);
      svg.id = `car-path-${this.circuitDiv.querySelectorAll('.car-path').length}`;
      svg.setAttribute('width', '1650');
      svg.setAttribute('height', '1100');
      svg.style.zIndex = zIndex;
      svg.classList.add('car-path');
      if (animated) {
        const animationDuration = moveCarAnimationDuration(pathCellIds.length, totalSpeed);
        const pathLength = Math.round(path.getTotalLength());
        svg.style.setProperty('--animation-duration', `${animationDuration}ms`);
        svg.style.setProperty('--path-length', `${pathLength}`);
        svg.classList.add('animated');
      }
      this.circuitDiv.insertAdjacentElement('afterbegin', svg);
    } catch (e) {
      console.warn('Impossible to load map path');
    }
  }

  public removeMapPaths() {
    this.circuitDiv.querySelectorAll('.car-path').forEach((elem) => elem.remove());
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
    return pathCellIds.map((cellId) => this.getCellInfos(cellId));
  }

  private moveCarWithAnimation(car: HTMLElement, pathCellIds: number[], totalSpeed: number): Promise<any> {
    const pathCells = this.getCellsInfos(pathCellIds);
    this.updateCarZIndex(car, pathCellIds);

    const animation = new CarAnimation(car, pathCells, totalSpeed);
    return animation.start();
  }

  public showCorner(id: number, color?: string) {
    document.getElementById(`corner-${id}`)?.style.setProperty('--color', color ?? 'transparent');

    if (color) {
      setTimeout(() => this.showCorner(id), this.game.animationManager.animationsActive() ? 2000 : 1);
    }
  }

  public setEliminatedPodium(position: number) {
    const cell = this.getPodiumPosition(position);

    this.circuitDiv.insertAdjacentHTML(
      'beforeend',
      `<div class="eliminated-podium" style="--x: ${cell.x}px; --y: ${cell.y}px;">❌</div>`
    );
  }
}
