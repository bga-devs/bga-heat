// That's the description of a path I should send you from backend :
//      list of either a single cell (empty one at that position),
//      or the two cells if both are taken so that the car go through in the middle
let t = [
  831,
  835,
  853,
  865,
  883,
  903,
  917,
  933,
  955,
  969,
  [981, 979],
  [993, 995],
  1005,
  1009,
  1057,
  1081,
];

// This is just a wrapper to either return the datas about the cell (center x, center y, angle)
//      or simulate an "averaged cell" if two cells are given (to go through the middle of them)
let getCellInfos = (cellId) => {
  if (Array.isArray(cellId)) {
    let cellId1 = cellId[0];
    let cellId2 = cellId[1];
    return {
      x:
        (cellsData.cells[cellId1].center.x +
          cellsData.cells[cellId2].center.x) /
        2,
      y:
        (cellsData.cells[cellId1].center.y +
          cellsData.cells[cellId2].center.y) /
        2,
      a: (cellsData.cells[cellId1].angle + cellsData.cells[cellId2].angle) / 2,
    };
  } else {
    return {
      x: cellsData.cells[cellId].center.x,
      y: cellsData.cells[cellId].center.y,
      a: cellsData.cells[cellId].angle,
    };
  }
};

// Control strength is how far the control point are from the center of the cell
//  => it should probably be something related/proportional to scale of current board
let controlStrength = 20;

// Path will be our svg path description
let path = "";

t.forEach((cellId, i) => {
  let data = getCellInfos(cellId);

  // We compute the control point based on angle
  //  => we have a special case for i = 0 since it's the only one with a "positive control point" (ie that goes in the same direction as arrow)
  let cp = {
    x:
      data.x +
      Math.cos((data.a * Math.PI) / 180) * (i == 0 ? 1 : -1) * controlStrength,
    y:
      data.y +
      Math.sin((data.a * Math.PI) / 180) * (i == 0 ? 1 : -1) * controlStrength,
  };

  // See "Shortand curve to" on https://developer.mozilla.org/fr/docs/Web/SVG/Tutorial/Paths
  if (i == 0) {
    path += "M " + data.x + " " + data.y + " C ";
    path += cp.x + " " + cp.y + ", ";
  } else if (i == 1) {
    path += cp.x + " " + cp.y + ", ";
    path += data.x + " " + data.y + " ";
  } else {
    path += "S " + cp.x + " " + cp.y + ", " + data.x + " " + data.y;
  }
});

// Not sure if really needed but I get an error if I dont have the namespaceURI thing
let svgPath = document.getElementById("path");
let newpath = document.createElementNS(svgPath.namespaceURI, "path");
newpath.setAttributeNS(null, "d", path);

// Just a wrapper to get the absolute position based on a floating number u in [0, 1] (0 mean start of animation, 1 is the end)
let getPos = (u) => {
  let pos = newpath.getPointAtLength(u * newpath.getTotalLength());
  const SCALE = 1; // Might need to get changed depending on zoom level or something. SHould be the same as placing car on the board
  return {
    x: pos.x * SCALE,
    y: pos.y * SCALE,
  };
};

// Wrapper for the animation that use requestAnimationFrame
let animation = {
  start(duration, delay) {
    this.duration = duration;
    this.meeple = $(`car`);
    this.resolve = null;
    const pos = getPos(0);
    this.move(0);

    setTimeout(() => {
      this.tZero = Date.now();
      requestAnimationFrame(() => this.run());
    }, delay);
    return new Promise((resolve, reject) => {
      this.resolve = resolve;
    });
  },

  move(u) {
    const pos = getPos(u);
    this.meeple.style.left = pos.x - this.meeple.offsetWidth / 2 + "px";
    this.meeple.style.top = pos.y - this.meeple.offsetHeight / 2 + "px";

    // Compute rotation
    const posPrev = getPos(u - 0.01);
    const posNext = getPos(u + 0.01);
    const angle = -Math.atan2(posNext.x - posPrev.x, posNext.y - posPrev.y);
    this.meeple.style.transform = `rotate(${(angle * 180) / Math.PI + 90}deg)`;
    this.meeple.style.transformOrigin = "center center";
  },

  run() {
    const u = Math.min((Date.now() - this.tZero) / this.duration, 1);
    this.move(u);

    if (u < 1) {
      // Keep requesting frames, till animation is ready
      requestAnimationFrame(() => this.run());
    } else {
      this.tZero = Date.now();
      this.move(0);
      requestAnimationFrame(() => this.run());
      // this.onFinish();
    }
  },

  onFinish() {
    this.meeple.remove();
    if (this.resolve != null) {
      this.resolve();
    }
  },
};

animation.start(5000);
