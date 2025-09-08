let $ = (id) => document.getElementById(id);
let DATAS = null;
let CELLS = [];

// Sections
const SECTIONS = ['centers', 'directions', 'neighbours', 'lanes', 'flooded', 'tunnels'];

////// HELP //////

$('open-help').addEventListener('click', () => {
  $('help-container').classList.add('open');
});
$('open-help2').addEventListener('click', () => {
  $('help-container').classList.add('open');
});

$('help-container')
  .querySelector('.fa-close')
  .addEventListener('click', () => {
    $('help-container').classList.remove('open');
  });

$('help-container').addEventListener('click', () => {
  $('help-container').classList.remove('open');
});
$('help-wrapper').addEventListener('click', (evt) => {
  evt.stopPropagation();
});

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

  $('circuit-files-label').innerHTML = names.length ? names.join(', ') : 'Click here to load SVG';
}
updateFilesListCreate();

$('btn-create').addEventListener('click', async () => {
  if ($('circuit-id').value == '') {
    alert('Please fill a circuit id');
    return;
  }
  if ($('circuit-name').value == '') {
    alert('Please fill a circuit name');
    return;
  }

  // Checking SVG file
  let svgFile = null;
  let fileList = $('circuit-files').files;
  for (let i = 0; i < fileList.length; i++) {
    let name = fileList[i].name;
    let ext = name.split('.').pop();
    if (ext == 'svg') svgFile = URL.createObjectURL(fileList[i]);
  }
  if (svgFile == null) {
    alert('Please select a svg file of a circuit');
    return;
  }

  // Checking JPG file
  let jpgFile = null;
  let url = $('circuit-jpg').value;
  if (url == null) {
    alert('You must give an URL for the jpg file');
    return;
  }

  let validURL = await testURL(url);
  if (validURL) {
    jpgFile = url;
  } else {
    alert('Invalid jpg file');
    return;
  }

  // Create datas
  let datas = {
    id: $('circuit-id').value,
    name: $('circuit-name').value,
    jpgUrl: jpgFile,
    cells: {},
    computed: {},
  };

  initCircuit(datas, jpgFile, svgFile).then(() => {
    loadCircuit(datas);
    saveCircuit();
    $('splashscreen').classList.add('hidden');
  });
});

function testURL(url) {
  return new Promise((resolve, reject) => {
    let tester = new Image();
    tester.addEventListener('load', () => resolve(true));
    tester.addEventListener('error', () => resolve(false));
    tester.src = url;
  });
}

function initCircuit(datas, jpgUrl, svgUrl) {
  return new Promise((resolve, reject) => {
    // Create obj loading external svg
    let obj = document.createElement('object');
    obj.data = svgUrl;
    obj.type = 'image/svg+xml';
    obj.id = 'board';
    $('main-frame').appendChild(obj);

    // Load svg
    obj.onload = () => {
      // Gather general datas
      let root = obj.contentDocument.documentElement;
      datas.width = root.viewBox.baseVal.width;
      datas.height = root.viewBox.baseVal.height;

      // Find the cells
      let svg = obj.contentDocument.querySelector('svg');
      let paths = [...svg.querySelectorAll('path')];
      paths.forEach((cell) => {
        // Remove the "path" prefix auto-added by Inkscape
        let id = parseInt(cell.id.substring(4));
        datas.cells[id] = {
          d: roundPath(cell.getAttribute('d'), 0),
        };
      });

      obj.remove();
      resolve();
    };
  });
}

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

// Load when an option is selected
$('select-circuit').addEventListener('change', () => {
  let circuitId = $('select-circuit').value;
  if (circuitId != '') {
    loadCircuitFromStorage(circuitId);
  }
});

function loadCircuitFromStorage(circuitId) {
  let datas = circuits[circuitId];
  loadCircuit(datas);
  $('splashscreen').classList.add('hidden');
}

//loadCircuitFromStorage('Test');

$('form-load-storage').addEventListener('submit', async (evt) => {
  evt.preventDefault();

  let circuitId = $('select-circuit').value;
  if (circuitId != '') {
    loadCircuitFromStorage(circuitId);
    return;
  }

  // Checking Heat file
  let heatFile = null;
  let fileList = $('load-file').files;
  for (let i = 0; i < fileList.length; i++) {
    let name = fileList[i].name;
    let ext = name.split('.').pop();
    if (ext == 'heat') heatFile = fileList[i];
  }
  if (heatFile == null) {
    alert('Please either select a file on browser storage or select a heat file on your computer');
    return;
  }

  let datas = await parseJsonFile(heatFile);
  loadCircuit(datas);
  $('splashscreen').classList.add('hidden');
});

const loadCircuitInput = $('load-file');
loadCircuitInput.addEventListener('change', updateLoadFile, false);

function updateLoadFile() {
  const fileList = loadCircuitInput.files;
  let names = [];
  for (let i = 0; i < fileList.length; i++) {
    names.push(fileList[i].name);
  }

  $('load-file-label').innerHTML = names.length ? names.join(', ') : 'Click here to load .heat file';
}
updateLoadFile();

//////////////////////////////////
//  _____    _ _ _
// | ____|__| (_) |_ ___  _ __
// |  _| / _` | | __/ _ \| '__|
// | |__| (_| | | || (_) | |
// |_____\__,_|_|\__\___/|_|
//////////////////////////////////

function loadCircuit(datas) {
  DATAS = datas;

  $('display-circuit-id').innerHTML = 'ID: ' + DATAS.id;
  $('display-circuit-name').innerHTML = 'Name: ' + DATAS.name;

  // Create obj loading external svg
  let svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.id = 'board';
  svg.style.backgroundImage = `url(${datas.jpgUrl})`;
  svg.setAttribute('viewBox', `0 0 ${datas.width} ${datas.height}`);
  svg.setAttribute('width', datas.width);
  svg.setAttribute('height', datas.height);
  $('main-frame').appendChild(svg);

  // Recreate the cells
  Object.keys(DATAS.cells).forEach((cellId) => {
    let cell = document.createElementNS(svg.namespaceURI, 'path');
    cell.setAttribute('id', 'path' + cellId);
    cell.setAttribute('d', DATAS.cells[cellId].d);
    svg.appendChild(cell);

    CELLS[cellId] = cell;
    cell.addEventListener('mouseenter', () => onMouseEnterCell(cellId, cell));
    cell.addEventListener('mouseleave', () => onMouseLeaveCell(cellId, cell));
    cell.addEventListener('click', (evt) => onMouseClickCell(cellId, cell, evt));

    cell.style.fill = 'transparent';
    cell.style.stroke = 'black';
    cell.style.strokeWidth = '1';
  });

  $('display-circuit-lap').innerHTML = 'Lap: ' + Object.keys(CELLS).length / 2 + ' cells';
  if (DATAS.computed.centers || false) updateCenters();
  if (DATAS.computed.directions || false) updateDirections();
  if (DATAS.computed.laneEnds || false) updateLaneEnds();
  if (DATAS.computed.positions || false) updatePositions();
  if (DATAS.corners || false) createCornerEntries();
  updateStatus();
  saveCircuit();
}

function forEachCell(callback) {
  Object.keys(CELLS).forEach((cellId) => callback(cellId, CELLS[cellId]));
}

//////////////////
//////////////////
///  CHANGE JPG
//////////////////
//////////////////
$('circuit-change-jpg').addEventListener('click', async () => {
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

  DATAS.jpgUrl = jpgFile;
  $('board').style.backgroundImage = `url(${jpgFile})`;
  saveCircuit();
});

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
  dlAnchorElem.setAttribute('download', DATAS.id + '.heat');
  dlAnchorElem.click();
}
$('save-btn').addEventListener('click', () => exportJSON());

function exportCompressedJSON() {
  let d = {
    id: DATAS.id,
    name: DATAS.name,
    jpgUrl: DATAS.jpgUrl,
    nbrLaps: DATAS.nbrLaps || 0,
    stressCards: DATAS.stressCards || 0,
    heatCards: DATAS.heatCards || 0,
    startingCells: DATAS.startingCells || [],
    podium: { x: 0, y: 0, a: 0 },
    weatherCardPos: DATAS.weatherCardPos
      ? { x: parseInt(DATAS.weatherCardPos.x), y: parseInt(DATAS.weatherCardPos.y) }
      : { x: 0, y: 0 },
    corners: DATAS.corners || [],
    floodedSpaces: DATAS.flooded || [],
    tunnelsSpaces: DATAS.tunels || [],
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
  dlAnchorElem2.setAttribute('download', DATAS.id + '-min.heat');
  dlAnchorElem2.click();
}
$('save-compressed-btn').addEventListener('click', () => exportCompressedJSON());

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

$('number-corners').addEventListener('click', () => {
  let nCorners = prompt('How many corners?');
  DATAS.corners = [];
  $('corners-holder').innerHTML = '';
  for (let i = 0; i < nCorners; i++) {
    DATAS.corners.push({
      position: 0,
      speed: 0,
      x: 0,
      y: 0,
      lane: 0,
      legend: 0,
      tentX: 0,
      tentY: 0,
      sectorTentX: 0,
      sectorTentY: 0,
    });
  }
  createCornerEntries();
  updateStatus();
  saveCircuit();
});

$('weather-card').addEventListener('click', async () => {
  let pos = await promptPosition('weather-card');
  DATAS.weatherCardPos = pos;
  updateStatus();
  saveCircuit();
});

$('podium').addEventListener('click', async () => {
  let pos = await promptPosition('podium');
  DATAS.podium = pos;
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
  let n = DATAS.stressCards || 0;
  $('stress-cards-value').innerHTML = n;
  $('stress-cards').classList.toggle('ok', n > 0);

  n = DATAS.heatCards || 0;
  $('heat-cards-value').innerHTML = n;
  $('heat-cards').classList.toggle('ok', n > 0);

  n = DATAS.nbrLaps || 0;
  $('number-laps-value').innerHTML = n;
  $('number-laps').classList.toggle('ok', n > 0);

  n = Object.keys(DATAS.corners || {}).length;
  $('number-corners-value').innerHTML = n;
  $('number-corners').classList.toggle('ok', n > 0);

  let ok = DATAS.weatherCardPos !== undefined && DATAS.weatherCardPos.x != 0;
  $('weather-card').classList.toggle('ok', ok);
  $('weather-card-indicator').classList.toggle('ok', ok);
  if (ok) {
    $('weather-card-indicator').style.setProperty('--x', DATAS.weatherCardPos.x + 'px');
    $('weather-card-indicator').style.setProperty('--y', DATAS.weatherCardPos.y + 'px');
  }

  ok = DATAS.podium !== undefined && DATAS.podium.x != 0;
  $('podium').classList.toggle('ok', ok);
  $('podium-indicator').classList.toggle('ok', ok);
  if (ok) {
    $('podium-indicator').style.setProperty('--x', DATAS.podium.x + 'px');
    $('podium-indicator').style.setProperty('--y', DATAS.podium.y + 'px');
  }

  // Always optional
  DATAS.computed.flooded = true;
  DATAS.computed.tunnels = true;

  SECTIONS.forEach((section) => {
    $(`section-${section}`).classList.toggle('computed', DATAS.computed[section] || false);
  });

  updateCorners();
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

      if (action == 'edit' && modes[section][action]) {
        SECTIONS.forEach((section2) => {
          if (section == section2) return;
          modes[section2][action] = false;
          $('main-frame').classList.remove(`edit-${section2}`);
          $(`${action}-${section2}`).classList.remove('active');
        });
      }
    });
  });

  if ($(`generate-${section}`)) {
    $(`generate-${section}`).addEventListener('click', () => {
      let method = 'generate' + section.charAt(0).toUpperCase() + section.slice(1);
      window[method]();
    });
  }
});

let highlightedCells = {};
function highlightCells(cellIds = null, className = null) {
  if (cellIds != null) {
    cellIds.forEach(
      (cellId) => (highlightedCells[cellId] = Array.isArray(className) && className[cellId] ? className[cellId] : className)
    );
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
  if (modes.lanes.edit) {
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
    let wrapper = $('main-frame-wrapper');
    let x = evt.x - wrapper.offsetLeft + wrapper.scrollLeft - 1,
      y = evt.y - wrapper.offsetTop + wrapper.scrollTop - 3;
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
      CELLS[selectedCell].style.fill = 'transparent';
      selectedCell = null;
      saveCircuit();
      clearHighlights();
    }
    return;
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

  if (modes.flooded.edit) {
    if (DATAS.flooded === undefined) DATAS.flooded = [];

    const index = DATAS.flooded.indexOf(id);
    if (index > -1) {
      DATAS.flooded.splice(index, 1);
    } else {
      DATAS.flooded.push(id);
    }
    saveCircuit();
    updateFloodedSpaces();
    return;
  }

  if (modes.tunnels.edit) {
    if (DATAS.tunnels === undefined) DATAS.tunnels = [];

    const index = DATAS.tunnels.indexOf(id);
    if (index > -1) {
      DATAS.tunnels.splice(index, 1);
    } else {
      DATAS.tunnels.push(id);
    }
    saveCircuit();
    updateTunnelsSpaces();
    return;
  }
}

let clickCallback = null;
$('main-frame').addEventListener('mousemove', (evt) => {
  let wrapper = $('main-frame-wrapper');
  let x = evt.x - wrapper.offsetLeft + wrapper.scrollLeft;
  let y = evt.y - wrapper.offsetTop + wrapper.scrollTop;
  $('hover-indicator').style.left = x + 'px';
  $('hover-indicator').style.top = y + 'px';
});

$('main-frame').addEventListener('click', (evt) => {
  if (clickCallback == null) return;

  let wrapper = $('main-frame-wrapper');
  let x = evt.x - wrapper.offsetLeft + wrapper.scrollLeft;
  let y = evt.y - wrapper.offsetTop + wrapper.scrollTop;
  $('main-frame').classList.remove('hover');
  clickCallback({ x, y });
  clickCallback = null;
});

async function promptPosition(className) {
  $('main-frame').classList.add('hover');
  $('hover-indicator').className = className;

  return new Promise((resolve, reject) => {
    clickCallback = resolve;
  });
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

    $(`center-${cellId}`).dataset.flooded = (DATAS.flooded ?? []).includes(cellId) ? 1 : 0;
    $(`center-${cellId}`).dataset.tunnels = (DATAS.tunnels ?? []).includes(cellId) ? 1 : 0;
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
  let wrapper = $('main-frame-wrapper');
  let x = evt.clientX - wrapper.offsetLeft + wrapper.scrollLeft - 1,
    y = evt.clientY - wrapper.offsetTop + wrapper.scrollTop - 3;
  let center = getCenter(id);
  console.log(center, x, y);
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
  modes.lanes[`end${lane}`] = false;
  saveCircuit();
  updateLaneEnds();
  $(`end${lane}-lanes`).classList.remove('active');
}

function updateLaneEnds() {
  [1, 2].forEach((i) => {
    let end = `end${i}`;
    let cellId = DATAS.computed.laneEnds[end] ?? null;
    if (cellId) {
      if (!$(`lane-${end}`)) {
        $(`center-${cellId}`).insertAdjacentHTML(
          'beforeend',
          `<div id='lane-${end}' class='lane-end-indicator'>${i}<i class='fa-icon fa-flag'></i></div>`
        );
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

//////////////////////////////////////////////
//  _____ _                 _          _
// |  ___| | ___   ___   __| | ___  __| |
// | |_  | |/ _ \ / _ \ / _` |/ _ \/ _` |
// |  _| | | (_) | (_) | (_| |  __/ (_| |
// |_|   |_|\___/ \___/ \__,_|\___|\__,_|
//////////////////////////////////////////////

function updateFloodedSpaces() {
  updateCenters();
}

function updateTunnelsSpaces() {
  updateCenters();
}

////////////////////////////////////////////
//    ____
//   / ___|___  _ __ _ __   ___ _ __ ___
//  | |   / _ \| '__| '_ \ / _ \ '__/ __|
//  | |__| (_) | |  | | | |  __/ |  \__ \
//   \____\___/|_|  |_| |_|\___|_|  |___/
////////////////////////////////////////////

function createCornerEntries() {
  DATAS.corners.forEach((corner, j) => {
    $('corners-holder').insertAdjacentHTML(
      'beforeend',
      `<tr class='corner-entry'>
      <td id='corner-pos-${j}'></td>
      <td id='corner-speed-${j}'></td>
      <td id='corner-lane-${j}'></td>
      <td id='corner-legend-${j}'></td>
      <td id='corner-coordinates-${j}'></td>
      <td id='corner-tent-${j}'></td>
      <td id='corner-sector-${j}'></td>
    </tr>`
    );
    $('main-frame').insertAdjacentHTML(
      'beforeend',
      `<div class='corner-indicator' id='corner-indicator-${j}'></div>
     <div class='corner-tent' id='corner-tent-indicator-${j}'></div>
     <div class='corner-tent' id='corner-sector-indicator-${j}'></div>`
    );

    // Add event listeners
    $(`corner-pos-${j}`).addEventListener('click', () => {
      let pos = prompt('What is the number on the cell right before the corner?');
      if (pos == null) return;
      DATAS.corners[j].position = pos;
      updateCorners();
      saveCircuit();
    });

    $(`corner-speed-${j}`).addEventListener('click', () => {
      let speed = prompt('What is the max speed?');
      if (speed == null) return;
      DATAS.corners[j].speed = speed;
      updateCorners();
      saveCircuit();
    });

    $(`corner-lane-${j}`).addEventListener('click', () => {
      let lane = prompt('What is the main lane after the corner? (orange = 1, purple = 2)');
      if (lane == null) return;
      DATAS.corners[j].lane = lane;
      updateCorners();
      saveCircuit();
    });

    $(`corner-legend-${j}`).addEventListener('click', () => {
      let legend = prompt('What is number on the cell right before the legend line?');
      if (legend == null) return;
      DATAS.corners[j].legend = legend;
      updateCorners();
      saveCircuit();
    });

    $(`corner-coordinates-${j}`).addEventListener('click', async () => {
      let pos = await promptPosition('corner');
      DATAS.corners[j].x = pos.x;
      DATAS.corners[j].y = pos.y;
      checkChicanes(j);
      updateCorners();
      saveCircuit();
    });

    $(`corner-tent-${j}`).addEventListener('click', async () => {
      let pos = await promptPosition('tent');
      DATAS.corners[j].tentX = pos.x;
      DATAS.corners[j].tentY = pos.y;
      checkChicanes(j);
      updateCorners();
      saveCircuit();
    });

    $(`corner-sector-${j}`).addEventListener('click', async () => {
      let pos = await promptPosition('tent');
      DATAS.corners[j].sectorTentX = pos.x;
      DATAS.corners[j].sectorTentY = pos.y;
      updateCorners();
      saveCircuit();
    });
  });
}

function checkChicanes(j) {
  if (DATAS.corners === undefined) return;

  // Modified corners
  let corner1 = DATAS.corners[j];

  // Try to find another corner
  let iCorner = null;
  DATAS.corners.forEach((corner, i) => {
    if (i == j) return;
    if (corner.tentX === undefined || corner.tentX == 0) return;

    let dist = Math.abs(corner1.tentX - corner.tentX) + Math.abs(corner1.tentY - corner.tentY);
    if (dist < 50) {
      iCorner = i;
    }
  });

  if (iCorner === null) {
    delete corner1.chicane;
  } else {
    corner1.chicane = iCorner;
  }
}

function updateCorners() {
  if (DATAS.corners === undefined) return;

  DATAS.corners.forEach((corner, j) => {
    $(`corner-pos-${j}`).innerHTML = corner.position;
    $(`corner-pos-${j}`).classList.toggle('ok', corner.position != 0);

    $(`corner-speed-${j}`).innerHTML = corner.speed;
    $(`corner-speed-${j}`).classList.toggle('ok', corner.speed != 0);

    $(`corner-lane-${j}`).innerHTML = corner.lane;
    $(`corner-lane-${j}`).classList.toggle('ok', corner.lane != 0);

    $(`corner-legend-${j}`).innerHTML = corner.legend;
    $(`corner-legend-${j}`).classList.toggle('ok', corner.legend != 0);

    $(`corner-coordinates-${j}`).classList.toggle('ok', corner.x != 0 && corner.y != 0);
    $(`corner-indicator-${j}`).classList.toggle('ok', corner.x != 0 && corner.y != 0);
    $(`corner-indicator-${j}`).style.setProperty('--x', corner.x + 'px');
    $(`corner-indicator-${j}`).style.setProperty('--y', corner.y + 'px');

    $(`corner-tent-${j}`).classList.toggle('ok', corner.tentX != 0 && corner.tentY != 0);
    $(`corner-tent-indicator-${j}`).classList.toggle('ok', corner.tentX != 0 && corner.tentY != 0);
    $(`corner-tent-indicator-${j}`).style.setProperty('--x', corner.tentX + 'px');
    $(`corner-tent-indicator-${j}`).style.setProperty('--y', corner.tentY + 'px');
    $(`corner-tent-${j}`).classList.toggle('chicane', corner.chicane !== undefined);
    $(`corner-tent-indicator-${j}`).classList.toggle('chicane', corner.chicane !== undefined);

    $(`corner-sector-${j}`).classList.toggle('ok', corner.sectorTentX != 0 && corner.sectorTentY != 0);
    $(`corner-sector-indicator-${j}`).classList.toggle('ok', corner.sectorTentX != 0 && corner.sectorTentY != 0);
    $(`corner-sector-indicator-${j}`).style.setProperty('--x', corner.sectorTentX + 'px');
    $(`corner-sector-indicator-${j}`).style.setProperty('--y', corner.sectorTentY + 'px');
    $(`corner-sector-${j}`).classList.toggle('chicane', corner.chicane !== undefined);
  });

  let cellLeft = $('corners-table').querySelector('td:not(.ok):not(.chicane)');
  $(`section-corners`).classList.toggle('computed', cellLeft === null);
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

function round(value, decimals) {
  let val = eval(value);
  return Number(`${Math.round(`${val}e${decimals}`)}e-${decimals}`);
}

function roundPath(path, decimals = 3) {
  function roundPathPoint(pathPoint) {
    function roundPathPointElement(pathPointElement) {
      if (pathPointElement.match(/^[A-Za-z]/)) {
        return `${pathPointElement[0]}${pathPointElement.slice(1) && round(pathPointElement.slice(1), decimals)}`;
      }
      return round(pathPointElement, decimals);
    }

    const pathPointElements = pathPoint.split(',');
    return pathPointElements.map(roundPathPointElement);
  }

  const pathPoints = path.split(' ');
  return pathPoints.map(roundPathPoint).join(' ');
}

async function parseJsonFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = (event) => resolve(JSON.parse(event.target.result));
    fileReader.onerror = (error) => reject(error);
    fileReader.readAsText(file);
  });
}
