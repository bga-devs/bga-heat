let $ = (id) => document.getElementById(id);
let DATAS = null;
let CELLS = [];

// Sections
const SECTIONS = ['centers', 'directions', 'neighbours', 'lanes'];

///////////////////////////////////////////////////////////
//  _   _                  ____ _                _ _
// | \ | | _____      __  / ___(_)_ __ ___ _   _(_) |_
// |  \| |/ _ \ \ /\ / / | |   | | '__/ __| | | | | __|
// | |\  |  __/\ V  V /  | |___| | | | (__| |_| | | |_
// |_| \_|\___| \_/\_/    \____|_|_|  \___|\__,_|_|\__|
//
///////////////////////////////////////////////////////////

const newCircuitInput = $('circuit-files');
newCircuitInput.addEventListener('change', updateFilesListCreate, false);

function updateFilesListCreate() {
  const fileList = $('circuit-files').files;
  let names = [];
  for (let i = 0; i < fileList.length; i++) {
    names.push(fileList[i].name);
  }

  $('circuit-files-label').innerHTML = names.length ? names.join(', ') : 'Click here to load JPEG + SVG images';
}
updateFilesListCreate();

$('btn-create').addEventListener('click', () => {
  if ($('circuit-id').value == '') {
    alert('Please fill a circuit id');
    return;
  }
  if ($('circuit-name').value == '') {
    alert('Please fill a circuit name');
    return;
  }

  let svgFile = null;
  let jpgFile = null;
  let fileList = $('circuit-files').files;
  for (let i = 0; i < fileList.length; i++) {
    let name = fileList[i].name;
    let ext = name.split('.').pop();
    if (ext == 'jpg') jpgFile = URL.createObjectURL(fileList[i]);
    if (ext == 'svg') svgFile = URL.createObjectURL(fileList[i]);
  }
  if (svgFile == null || jpgFile == null) {
    alert('Please select a jpg and a svg file of a circuit');
    return;
  }

  // Create datas
  let datas = {
    id: $('circuit-id').value,
    name: $('circuit-name').value,
    assets: 'local',
    cells: {},
    computed: {},
  };
  loadCircuit(datas, jpgFile, svgFile);
  saveCircuit();
  $('splashscreen').classList.add('hidden');
});

///////////////////////////////////////////////////////////////
//  _                    _    ____ _                _ _
// | |    ___   __ _  __| |  / ___(_)_ __ ___ _   _(_) |_
// | |   / _ \ / _` |/ _` | | |   | | '__/ __| | | | | __|
// | |__| (_) | (_| | (_| | | |___| | | | (__| |_| | | |_
// |_____\___/ \__,_|\__,_|  \____|_|_|  \___|\__,_|_|\__|
///////////////////////////////////////////////////////////////
function getStoredCircuits() {
  let circuits = localStorage.getItem('heatCircuits');
  if (circuits != '' && circuits != null) {
    circuits = JSON.parse(circuits);
  } else {
    circuits = {};
  }
  return circuits;
}

let circuits = getStoredCircuits();
Object.keys(circuits).forEach((circuitId) => {
  let option = document.createElement('option');
  option.setAttribute('value', circuitId);
  option.appendChild(document.createTextNode(circuits[circuitId].name));
  $('select-circuit').appendChild(option);
});

$('form-load-storage').addEventListener('submit', (evt) => {
  evt.preventDefault();

  let circuitId = $('select-circuit').value;
  if (circuitId == '') {
    alert('Please select a circuit in the list');
    return;
  }

  loadCircuitFromStorage(circuitId);
});

function loadCircuitFromStorage(circuitId) {
  let datas = circuits[circuitId];
  let jpgFile = null;
  let svgFile = null;
  if (datas.assets == 'local') {
    alert('TODO');
    return;
  } else {
    jpgFile = datas.assets.jpg;
    svgFile = datas.assets.svg;
  }

  loadCircuit(datas, jpgFile, svgFile);
  $('splashscreen').classList.add('hidden');
}

//////////////////////////////////
//  _____    _ _ _
// | ____|__| (_) |_ ___  _ __
// |  _| / _` | | __/ _ \| '__|
// | |__| (_| | | || (_) | |
// |_____\__,_|_|\__\___/|_|
//////////////////////////////////

function loadCircuit(datas, jpgUrl, svgUrl) {
  DATAS = datas;

  $('display-circuit-id').innerHTML = 'ID: ' + DATAS.id;
  $('display-circuit-name').innerHTML = 'Name: ' + DATAS.name;

  // Create obj loading external svg
  let obj = document.createElement('object');
  obj.data = svgUrl;
  obj.type = 'image/svg+xml';
  obj.id = 'board';
  obj.style.backgroundImage = `url(${jpgUrl})`;
  $('main-frame').appendChild(obj);

  // Load svg
  obj.onload = () => {
    // Find the cells
    let svg = obj.contentDocument.querySelector('svg');
    let paths = [...svg.querySelectorAll('path')];
    console.log(paths);
    paths.forEach((cell) => {
      // Remove the "path" prefix auto-added by Inkscape
      let id = parseInt(cell.id.substring(4));
      CELLS[id] = cell;
      if (!DATAS.cells[id]) {
        DATAS.cells[id] = {};
      }

      cell.addEventListener('mouseenter', () => onMouseEnterCell(id, cell));
      cell.addEventListener('mouseleave', () => onMouseLeaveCell(id, cell));
      cell.addEventListener('click', (evt) => onMouseClickCell(id, cell, evt));

      cell.style.fill = 'transparent';
      cell.style.stroke = 'black';
      cell.style.strokeWidth = '1';
    });

    $('display-circuit-lap').innerHTML = 'Lap: ' + paths.length / 2 + ' cells';
    if (DATAS.computed.centers || false) updateCenters();
    if (DATAS.computed.directions || false) updateDirections();
    if (DATAS.computed.laneEnds || false) updateLaneEnds();
    if (DATAS.computed.positions || false) updatePositions();
  };

  updateStatus();
}

function forEachCell(callback) {
  Object.keys(CELLS).forEach((cellId) => callback(cellId, CELLS[cellId]));
}

//////////////////
//////////////////
///  SAVE DATAS
//////////////////
//////////////////

function saveCircuit() {
  // Remove useless cells
  if (CELLS.length > 0) {
    let toKeep = Object.keys(CELLS);
    let t = Object.keys(DATAS.cells);
    t.forEach((cId) => {
      if (!toKeep.includes(cId)) {
        delete DATAS.cells[cId];
      }
      delete DATAS.cells[cId].adjacence;
      delete DATAS.cells[cId].center;
      delete DATAS.cells[cId].angle;
    });
  }

  // Load existing circuits
  let circuits = getStoredCircuits();
  // Add current circuit infos
  circuits[DATAS.id] = DATAS;
  localStorage.setItem('heatCircuits', JSON.stringify(circuits));
  $('data').innerHTML = JSON.stringify(DATAS);
  updateStatus();
}

//////////////////////////
//////////////////////////
///  GENERATE JSON FILE
//////////////////////////
//////////////////////////

function exportJSON() {
  let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(DATAS));
  let dlAnchorElem = document.getElementById('download-anchor');
  dlAnchorElem.setAttribute('href', dataStr);
  dlAnchorElem.setAttribute('download', DATAS.id + '.json');
  dlAnchorElem.click();
}
$('save-btn').addEventListener('click', () => exportJSON());

function exportCompressedJSON() {
  let d = {
    id: DATAS.id,
    name: DATAS.name,
    assets: { jpg: DATAS.assets.jpg },
    nbrLaps: DATAS.nbrLaps || 0,
    stressCards: DATAS.stressCards || 0,
    heatCards: DATAS.heatCards || 0,
    startingCells: [],
    podium: { x: 0, y: 0, a: 0 },
    corners: {},
    cells: {},
  };

  forEachCell((cellId, cell) => {
    let infos = DATAS.cells[cellId];
    d.cells[parseInt(cellId)] = {
      lane: infos.lane,
      position: infos.position,
      x: parseInt(infos.x),
      y: parseInt(infos.y),
      a: parseInt(infos.a),
    };
  });

  let dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(d));
  let dlAnchorElem2 = document.getElementById('download-anchor2');
  dlAnchorElem2.setAttribute('href', dataStr);
  dlAnchorElem2.setAttribute('download', DATAS.id + '-min.json');
  dlAnchorElem2.click();
}
$('save-compressed-btn').addEventListener('click', () => exportCompressedJSON());
/////////////////
/////////////////
///  ADD URLS
/////////////////
////////////////
function testURL(url) {
  return new Promise((resolve, reject) => {
    let tester = new Image();
    tester.addEventListener('load', () => resolve(true));
    tester.addEventListener('error', () => resolve(false));
    tester.src = url;
  });
}

$('add-urls').addEventListener('click', async () => {
  let jpgFile = null;
  while (jpgFile == null) {
    let url = window.prompt('URL of the jpg file');
    if (url == null) return;
    let validURL = await testURL(url);
    if (validURL) {
      jpgFile = url;
    } else {
      alert('Invalid jpg file');
    }
  }

  let svgFile = null;
  while (svgFile == null) {
    let url = window.prompt('URL of the svg file');
    if (url == null) return;
    let validURL = await testURL(url);
    if (validURL) {
      svgFile = url;
    } else {
      alert('Invalid svg file');
    }
  }

  DATAS.assets = {
    jpg: jpgFile,
    svg: svgFile,
  };
  saveCircuit();
});

////////////////////////////////
//  ___        __
// |_ _|_ __  / _| ___  ___
//  | || '_ \| |_ / _ \/ __|
//  | || | | |  _| (_) \__ \
// |___|_| |_|_|  \___/|___/
////////////////////////////////
$('number-laps').addEventListener('click', () => {
  let nLaps = prompt('How many laps?');
  DATAS.nbrLaps = nLaps;
  updateStatus();
  saveCircuit();
});

$('heat-cards').addEventListener('click', () => {
  let nCards = prompt('How many heat cards?');
  DATAS.heatCards = nCards;
  updateStatus();
  saveCircuit();
});

$('stress-cards').addEventListener('click', () => {
  let nCards = prompt('How many stress cards?');
  DATAS.stressCards = nCards;
  updateStatus();
  saveCircuit();
});

///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////
//  ____            _   _
// / ___|  ___  ___| |_(_) ___  _ __  ___
// \___ \ / _ \/ __| __| |/ _ \| '_ \/ __|
//  ___) |  __/ (__| |_| | (_) | | | \__ \
// |____/ \___|\___|\__|_|\___/|_| |_|___/
///////////////////////////////////////////////
///////////////////////////////////////////////
///////////////////////////////////////////////

function updateStatus() {
  let isLocal = DATAS.assets == 'local';
  $('circuit-files-status').innerHTML = isLocal ? 'Local' : 'Online';
  $('circuit-files-status').classList.toggle('local', isLocal);
  $('stress-cards-value').innerHTML = DATAS.stressCards || 0;
  $('heat-cards-value').innerHTML = DATAS.heatCards || 0;
  $('number-laps-value').innerHTML = DATAS.nbrLaps || 0;

  SECTIONS.forEach((section) => {
    $(`section-${section}`).classList.toggle('computed', DATAS.computed[section] || false);
  });
}

///////////////////////////////////////////////////////////////////////////
//  _____                 _     _   _                 _ _
// | ____|_   _____ _ __ | |_  | | | | __ _ _ __   __| | | ___ _ __ ___
// |  _| \ \ / / _ \ '_ \| __| | |_| |/ _` | '_ \ / _` | |/ _ \ '__/ __|
// | |___ \ V /  __/ | | | |_  |  _  | (_| | | | | (_| | |  __/ |  \__ \
// |_____| \_/ \___|_| |_|\__| |_| |_|\__,_|_| |_|\__,_|_|\___|_|  |___/
///////////////////////////////////////////////////////////////////////////
let modes = localStorage.getItem('heatModes');
modes = modes === null ? {} : JSON.parse(modes);

function toggleShow(section, val = null) {
  modes[section].show = val === null ? !modes[section].show : val;
  $('main-frame').classList.toggle(`show-${section}`, modes[section].show);
  $(`show-${section}`).classList.toggle('active', modes[section].show);
  localStorage.setItem('heatModes', JSON.stringify(modes));
}

SECTIONS.forEach((section) => {
  modes[section] = modes[section] || {
    show: false,
  };

  $(`show-${section}`).addEventListener('click', () => toggleShow(section));
  toggleShow(section, modes[section].show);

  ['edit', 'swap', 'check', 'end1', 'end2'].forEach((action) => {
    if (!$(`${action}-${section}`)) return;

    modes[section][action] = false;
    $(`${action}-${section}`).addEventListener('click', () => {
      modes[section][action] = !modes[section][action];
      $('main-frame').classList.toggle(`edit-${section}`, modes[section][action]);
      $(`${action}-${section}`).classList.toggle('active', modes[section][action]);
    });
  });

  $(`generate-${section}`).addEventListener('click', () => {
    let method = 'generate' + section.charAt(0).toUpperCase() + section.slice(1);
    window[method]();
  });
});

let highlightedCells = {};
function highlightCells(cellIds = null, className = null) {
  if (cellIds != null) {
    cellIds.forEach((cellId) => (highlightedCells[cellId] = className[cellId] ?? className));
  }

  Object.keys(highlightedCells).forEach((cellId) => {
    let c = highlightedCells[cellId];
    if (c == 'white') c = '#ffffffaa';
    if (c == 'green') c = '#00ff00aa';

    CELLS[cellId].style.fill = c;
  });
}

function clearHighlights() {
  Object.keys(highlightedCells).forEach((cellId) => {
    CELLS[cellId].style.fill = 'transparent';
  });
  highlightedCells = {};
}

function onMouseEnterCell(id, cell) {
  $('cell-indicator-counter').innerHTML = id;

  if (selectedCell === null) {
    // Otherwise, display neighbours and/or neighbours
    if (modes.neighbours.show && DATAS.computed.neighbours) {
      let neighbourIds = DATAS.cells[id].neighbours;
      highlightCells(neighbourIds, 'white');
    }
  }

  if (id === selectedCell) return;

  let color = cell.style.fill;
  if (color == 'transparent') color = 'rgb(100,100,100)';
  cell.style.fill = rgba2hex(color, 'ee');
  cell.style.strokeWidth = '2';
}

function onMouseLeaveCell(id, cell) {
  $('cell-indicator-counter').innerHTML = '----';
  if (id === selectedCell) return;

  cell.style.strokeWidth = '1';
  let color = rgba2hex(cell.style.fill, 'aa');
  if (color == '#646464aa') color = 'transparent';
  cell.style.fill = color;

  if (selectedCell == null) {
    clearHighlights();
  } else {
    highlightCells();
  }
}

let selectedCell = null;
function onMouseClickCell(id, cell, evt) {
  if (modes.positions.edit) {
    let newPos = prompt('New position ?');
    DATAS.cells[id].position = parseInt(newPos);
    updatePositions();
    saveCircuit();
    return;
  }

  if (modes.lanes.end1) {
    updateLaneEnd(1, id);
    return;
  }
  if (modes.lanes.end2) {
    updateLaneEnd(2, id);
    return;
  }

  if (modes.centers.edit) {
    let x = evt.clientX - 1,
      y = evt.clientY - 3;
    DATAS.cells[id].x = x;
    DATAS.cells[id].y = y;
    updateCenters();
    saveCircuit();
    return;
  }

  if (modes.directions.swap) {
    swapDirection(id);
    saveCircuit();
    return;
  }

  if (modes.directions.edit) {
    if (selectedCell == null) {
      selectedCell = id;
      cell.style.fill = 'green';
    } else {
      changeDirection(selectedCell, evt);
      selectedCell = null;
      saveCircuit();
      clearHighlights();
    }
  }

  if (modes.neighbours.edit) {
    if (selectedCell == null) {
      selectedCell = id;
      cell.style.fill = 'green';
      highlightCells(DATAS.cells[id].neighbours, 'white');
    } else if (selectedCell == id) {
      selectedCell = null;
      cell.style.fill = 'transparent';
      clearHighlights();
    } else {
      toggleNeighbour(selectedCell, id, cell);
    }
    return;
  }
}

//////////////////////////////////////
//   ____           _
//  / ___|___ _ __ | |_ ___ _ __ ___
// | |   / _ \ '_ \| __/ _ \ '__/ __|
// | |__|  __/ | | | ||  __/ |  \__ \
//  \____\___|_| |_|\__\___|_|  |___/
//////////////////////////////////////

function generateCenters() {
  if ((DATAS.computed.centers || false) && !confirm('Are you sure you want to overwrite existing centers ?')) {
    return;
  }

  forEachCell((cellId, cell) => {
    let pos = computeCenterOfCell(cell);
    DATAS.cells[cellId].x = pos.x;
    DATAS.cells[cellId].y = pos.y;
  });

  DATAS.computed.centers = true;
  saveCircuit();
  updateCenters();
  toggleShow('centers', true);
  console.log('Centers computed');
}

function updateCenters() {
  forEachCell((cellId, cell) => {
    if (!$(`center-${cellId}`)) {
      $('centers').insertAdjacentHTML('beforeend', `<div class='center-indicator' id='center-${cellId}'></div>`);
    }

    $(`center-${cellId}`).style.left = DATAS.cells[cellId].x - 2 + 'px';
    $(`center-${cellId}`).style.top = DATAS.cells[cellId].y - 2 + 'px';

    $(`center-${cellId}`).dataset.lane = DATAS.cells[cellId].lane ?? 0;
    $(`center-${cellId}`).dataset.position = DATAS.cells[cellId].position ?? 0;
  });
}

function computeCenterOfCell(cell) {
  const M = 40;
  let pathLength = Math.floor(cell.getTotalLength());
  let totX = 0,
    totY = 0;
  for (let i = 0; i < M; i++) {
    let pos = cell.getPointAtLength((i * pathLength) / M);
    totX += pos.x;
    totY += pos.y;
  }

  return {
    x: totX / M,
    y: totY / M,
  };
}

///////////////////////////////////////////////////
//  ____  _               _   _
// |  _ \(_)_ __ ___  ___| |_(_) ___  _ __  ___
// | | | | | '__/ _ \/ __| __| |/ _ \| '_ \/ __|
// | |_| | | | |  __/ (__| |_| | (_) | | | \__ \
// |____/|_|_|  \___|\___|\__|_|\___/|_| |_|___/
///////////////////////////////////////////////////
function generateDirections() {
  if (!DATAS.computed.centers) {
    alert('You must compute the centers first');
    return false;
  }

  if ((DATAS.computed.directions || false) && !confirm('Are you sure you want to overwrite existing directions ?')) {
    return;
  }

  forEachCell((cellId, cell) => {
    let center = getCenter(cellId);
    let angle = computeTangentOfCell(cell, center);
    DATAS.cells[cellId].a = angle;
  });

  DATAS.computed.directions = true;
  saveCircuit();
  updateDirections();
  toggleShow('directions', true);
  console.log('Directions computed');
}

function updateDirections() {
  forEachCell((cellId, cell) => updateDirection(cellId));
}

function updateDirection(cellId) {
  if (!$(`direction-${cellId}`)) {
    $(`center-${cellId}`).insertAdjacentHTML('beforeend', `<div class='direction-indicator' id='direction-${cellId}'></div>`);
  }

  let angle = DATAS.cells[cellId].a ?? 0;
  $(`direction-${cellId}`).style.transform = `rotate(${angle}deg)`;
}

function swapDirection(cellId) {
  let angle = DATAS.cells[cellId].a;
  DATAS.cells[cellId].a = (angle + 180) % 360;
  updateDirection(cellId);
}

function changeDirection(id, evt) {
  let x = evt.clientX - 1,
    y = evt.clientY - 3;
  let center = getCenter(id);
  DATAS.cells[id].a = (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI;
  updateDirection(id);
}

function computeTangentOfCell(cell, center) {
  let pathLength = Math.floor(cell.getTotalLength());
  const M = 200;
  let minDist = pathLength * pathLength;
  let minPos1 = null;
  let minI = 0;
  for (let i = 0; i < M; i++) {
    let pos = cell.getPointAtLength((i * pathLength) / M);
    let d = dist2(pos, center);
    if (d < minDist) {
      minDist = d;
      minPos1 = pos;
      minI = i;
    }
  }

  minDist = pathLength * pathLength;
  let minPos2 = null;
  for (let i = minI + M / 2 - M / 5; i < minI + M / 2 + M / 5; i++) {
    let pos = cell.getPointAtLength(((i % M) * pathLength) / M);
    let d = dist2(pos, center);
    if (d < minDist) {
      minDist = d;
      minPos2 = pos;
    }
  }

  let slope = -(minPos2.x - minPos1.x) / (minPos2.y - minPos1.y);
  let rotation = (Math.atan2(slope, 1) * 180) / Math.PI;
  return rotation;
}

///////////////////////////////////////////////////////////
//  _   _      _       _     _
// | \ | | ___(_) __ _| |__ | |__   ___  _   _ _ __ ___
// |  \| |/ _ \ |/ _` | '_ \| '_ \ / _ \| | | | '__/ __|
// | |\  |  __/ | (_| | | | | |_) | (_) | |_| | |  \__ \
// |_| \_|\___|_|\__, |_| |_|_.__/ \___/ \__,_|_|  |___/
//               |___/
///////////////////////////////////////////////////////////
function generateNeighbours() {
  if (!DATAS.computed.centers || !DATAS.computed.directions) {
    alert('You must compute the centers and directions first');
    return false;
  }

  if ((DATAS.computed.neighbours || false) && !confirm('Are you sure you want to overwrite existing neighbours ?')) {
    return;
  }

  // Compute neighbours
  forEachCell((cellId, cell) => {
    let neighbours = computeNeighbours(cellId);
    DATAS.cells[cellId].neighbours = neighbours;
  });

  DATAS.computed.neighbours = true;
  saveCircuit();
  toggleShow('neighbours', true);
  console.log('Neighbours computed');
}

function computeNeighbours(id) {
  let center = getCenter(id);

  // Keep only the cells within the cone angle
  let coneAngle = Math.PI / 3;
  let ids = Object.keys(CELLS).filter((cellId) => {
    if (cellId == id) return false;
    let alpha = getAngle(id, cellId);
    return alpha > -coneAngle && alpha < coneAngle;
  });

  // Sort cells by distance
  let dists = {};
  ids.forEach((cellId) => {
    let center2 = getCenter(cellId);
    dists[cellId] = (center.x - center2.x) * (center.x - center2.x) + (center.y - center2.y) * (center.y - center2.y);
  });
  ids = ids.sort(function (id1, id2) {
    return dists[id1] - dists[id2];
  });

  // Keep only the 2 closest ones
  ids = ids.slice(0, 2);

  // Keep only the ones close enough
  let minDist = dists[ids[0]];
  ids = ids.filter((cellId) => dists[cellId] < 2 * minDist);

  return ids.map((t) => parseInt(t));
}

function toggleNeighbour(selectedCell, id, cell) {
  let neighbours = DATAS.cells[selectedCell].neighbours;
  let i = neighbours.findIndex((cId) => cId == id);

  if (i === -1) {
    // New neighbour => add it
    neighbours.push(id);
    highlightCells([id], 'white');
  } else {
    // Already there => remove it
    neighbours.splice(i, 1);
    highlightCells([id], 'transparent');
  }
  saveCircuit();
}

////////////////////////////////
//  _
// | |    __ _ _ __   ___  ___
// | |   / _` | '_ \ / _ \/ __|
// | |__| (_| | | | |  __/\__ \
// |_____\__,_|_| |_|\___||___/
////////////////////////////////

// Lane ends
function updateLaneEnd(lane, cellId) {
  if (!DATAS.computed.laneEnds) DATAS.computed.laneEnds = {};
  DATAS.computed.laneEnds[`end${lane}`] = cellId;
  saveCircuit();
  updateLaneEnds();
}

function updateLaneEnds() {
  [1, 2].forEach((i) => {
    let end = `end${i}`;
    let cellId = DATAS.computed.laneEnds[end] ?? null;
    if (cellId) {
      if (!$(`lane-${end}`)) {
        $(`center-${cellId}`).insertAdjacentHTML('beforeend', `<div id='lane-${end}' class='lane-end-indicator'>${i}🏁</div>`);
      }

      $(`center-${cellId}`).insertAdjacentElement('beforeend', $(`lane-${end}`));
    }
  });
}

// Generate lanes and positions
function generateLanes() {
  if (!DATAS.computed.neighbours) {
    alert('You must compute the neighbours first');
    return false;
  }
  if (!DATAS.computed.laneEnds || !DATAS.computed.laneEnds.end1 || !DATAS.computed.laneEnds.end2) {
    alert('You must add the lane endings first');
    return false;
  }

  if ((DATAS.computed.lanes || false) && !confirm('Are you sure you want to overwrite existing lanes ?')) {
    return;
  }

  // Compute neighbours
  let startingCells = [];
  const startingCellPosition = Object.keys(CELLS).length / 2 - 3;

  let currentIds = [DATAS.computed.laneEnds['end1'], DATAS.computed.laneEnds['end2']];
  let lap = Object.keys(CELLS).length / 2;
  for (let i = 1; i <= lap; i++) {
    let candidateIds = merge(DATAS.cells[currentIds[0]].neighbours, DATAS.cells[currentIds[1]].neighbours);
    if (candidateIds.length != 2) {
      alert('Invalid number of neighbours for cells:' + currentIds[0] + ' and ' + currentIds[1]);
      break;
    }

    let cellId0 = null,
      cellId1 = null;
    let c1 = getCenter(currentIds[0]);
    let c2 = getCenter(currentIds[1]);
    let c3 = getCenter(candidateIds[0]);
    let c4 = getCenter(candidateIds[1]);

    if (intersects(c1, c3, c2, c4)) {
      cellId0 = candidateIds[1];
      cellId1 = candidateIds[0];
    } else {
      cellId0 = candidateIds[0];
      cellId1 = candidateIds[1];
    }

    DATAS.cells[cellId0].lane = 1;
    DATAS.cells[cellId1].lane = 2;
    DATAS.cells[cellId0].position = i;
    DATAS.cells[cellId1].position = i;
    currentIds = [cellId0, cellId1];
    if (i >= startingCellPosition) {
      startingCells.unshift(cellId1);
      startingCells.unshift(cellId0);
    }
  }

  DATAS.computed.lanes = true;
  DATAS.startingCells = startingCells;
  saveCircuit();
  toggleShow('lanes', true);
  updateCenters();
  console.log('Lanes computed');
}

////////////////////////
//  _   _ _   _ _
// | | | | |_(_) |___
// | | | | __| | / __|
// | |_| | |_| | \__ \
//  \___/ \__|_|_|___/
////////////////////////

function getCenter(cellId) {
  return {
    x: DATAS.cells[cellId].x,
    y: DATAS.cells[cellId].y,
  };
}

function intersects(c1, c2, c3, c4) {
  let a = c1.x,
    b = c1.y,
    c = c2.x,
    d = c2.y,
    p = c3.x,
    q = c3.y,
    r = c4.x,
    s = c4.y;
  let det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
  }
}

function getAngle(cellId1, cellId2) {
  let angle = (DATAS.cells[cellId1].a * Math.PI) / 180;
  let center = getCenter(cellId1);
  let center2 = getCenter(cellId2);
  let v = { x: center2.x - center.x, y: center2.y - center.y };
  let alpha = Math.atan2(v.y, v.x) - angle;
  if (alpha < -Math.PI / 2) alpha += 2 * Math.PI;
  return alpha;
}

function dist2(pos1, pos2) {
  return (pos1.x - pos2.x) * (pos1.x - pos2.x) + (pos1.y - pos2.y) * (pos1.y - pos2.y);
}

function rgba2hex(orig, forceAlpha = null) {
  var a,
    isPercent,
    rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = ((rgb && rgb[4]) || '').trim(),
    hex = rgb
      ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
        (rgb[2] | (1 << 8)).toString(16).slice(1) +
        (rgb[3] | (1 << 8)).toString(16).slice(1)
      : orig;

  if (alpha !== '') {
    a = alpha;
  } else {
    a = 0;
  }
  // multiply before convert to HEX
  a = ((a * 255) | (1 << 8)).toString(16).slice(1);
  if (forceAlpha) {
    a = forceAlpha;
  }
  hex = hex + a;

  return '#' + hex;
}

function merge(a, b) {
  const c = [...a]; // copy to avoid side effects
  // add all items from B to copy C if they're not already present
  b.forEach((bItem) => (c.some((cItem) => bItem == cItem) ? null : c.push(bItem)));
  return c;
}
