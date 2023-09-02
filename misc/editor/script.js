let $ = (id) => document.getElementById(id);
let DATAS = null;
let CELLS = [];

// Sections
const SECTIONS = [
  "centers",
  "directions",
  "neighbours",
  "adjacence",
  "lanes",
  "positions",
];

///////////////////////////////////////////////////////////
//  _   _                  ____ _                _ _
// | \ | | _____      __  / ___(_)_ __ ___ _   _(_) |_
// |  \| |/ _ \ \ /\ / / | |   | | '__/ __| | | | | __|
// | |\  |  __/\ V  V /  | |___| | | | (__| |_| | | |_
// |_| \_|\___| \_/\_/    \____|_|_|  \___|\__,_|_|\__|
//
///////////////////////////////////////////////////////////

const newCircuitInput = $("circuit-files");
newCircuitInput.addEventListener("change", updateFilesListCreate, false);

function updateFilesListCreate() {
  const fileList = $("circuit-files").files;
  let names = [];
  for (let i = 0; i < fileList.length; i++) {
    names.push(fileList[i].name);
  }

  $("circuit-files-label").innerHTML = names.length
    ? names.join(", ")
    : "Click here to load JPEG + SVG images";
}
updateFilesListCreate();

$("btn-create").addEventListener("click", () => {
  if ($("circuit-id").value == "") {
    alert("Please fill a circuit id");
    return;
  }
  if ($("circuit-name").value == "") {
    alert("Please fill a circuit name");
    return;
  }

  let svgFile = null;
  let jpgFile = null;
  let fileList = $("circuit-files").files;
  for (let i = 0; i < fileList.length; i++) {
    let name = fileList[i].name;
    let ext = name.split(".").pop();
    if (ext == "jpg") jpgFile = URL.createObjectURL(fileList[i]);
    if (ext == "svg") svgFile = URL.createObjectURL(fileList[i]);
  }
  if (svgFile == null || jpgFile == null) {
    alert("Please select a jpg and a svg file of a circuit");
    return;
  }

  // Create datas
  let datas = {
    id: $("circuit-id").value,
    name: $("circuit-name").value,
    assets: "local",
    cells: {},
    computed: {},
  };
  loadCircuit(datas, jpgFile, svgFile);
  saveCircuit();
  $("splashscreen").classList.add("hidden");
});

///////////////////////////////////////////////////////////////
//  _                    _    ____ _                _ _
// | |    ___   __ _  __| |  / ___(_)_ __ ___ _   _(_) |_
// | |   / _ \ / _` |/ _` | | |   | | '__/ __| | | | | __|
// | |__| (_) | (_| | (_| | | |___| | | | (__| |_| | | |_
// |_____\___/ \__,_|\__,_|  \____|_|_|  \___|\__,_|_|\__|
///////////////////////////////////////////////////////////////
function getStoredCircuits() {
  let circuits = localStorage.getItem("heatCircuits");
  if (circuits != "" && circuits != null) {
    circuits = JSON.parse(circuits);
  } else {
    circuits = {};
  }
  return circuits;
}

let circuits = getStoredCircuits();
Object.keys(circuits).forEach((circuitId) => {
  let option = document.createElement("option");
  option.setAttribute("value", circuitId);
  option.appendChild(document.createTextNode(circuits[circuitId].name));
  $("select-circuit").appendChild(option);
});

$("form-load-storage").addEventListener("submit", (evt) => {
  evt.preventDefault();

  let circuitId = $("select-circuit").value;
  if (circuitId == "") {
    alert("Please select a circuit in the list");
    return;
  }

  loadCircuitFromStorage(circuitId);
});

function loadCircuitFromStorage(circuitId) {
  let datas = circuits[circuitId];
  let jpgFile = null;
  let svgFile = null;
  if (datas.assets == "local") {
    alert("TODO");
    return;
  } else {
    jpgFile = datas.assets.jpg;
    svgFile = datas.assets.svg;
  }

  loadCircuit(datas, jpgFile, svgFile);
  $("splashscreen").classList.add("hidden");
}

loadCircuitFromStorage("USA");

//////////////////////////////////
//  _____    _ _ _
// | ____|__| (_) |_ ___  _ __
// |  _| / _` | | __/ _ \| '__|
// | |__| (_| | | || (_) | |
// |_____\__,_|_|\__\___/|_|
//////////////////////////////////

function loadCircuit(datas, jpgUrl, svgUrl) {
  DATAS = datas;

  $("display-circuit-id").innerHTML = "ID: " + DATAS.id;
  $("display-circuit-name").innerHTML = "Name: " + DATAS.name;

  // Create obj loading external svg
  let obj = document.createElement("object");
  obj.data = svgUrl;
  obj.type = "image/svg+xml";
  obj.id = "board";
  obj.style.backgroundImage = `url(${jpgUrl})`;
  $("main-frame").appendChild(obj);

  // Load svg
  obj.onload = () => {
    // Find the cells
    let svg = obj.contentDocument.querySelector("svg");
    let paths = [...svg.querySelectorAll("path")];
    console.log(paths);
    paths.forEach((cell) => {
      // Remove the "path" prefix auto-added by Inkscape
      let id = parseInt(cell.id.substring(4));
      CELLS[id] = cell;
      if (!DATAS.cells[id]) {
        DATAS.cells[id] = {};
      }

      cell.addEventListener("mouseenter", () => onMouseEnterCell(id, cell));
      cell.addEventListener("mouseleave", () => onMouseLeaveCell(id, cell));
      cell.addEventListener("click", (evt) => onMouseClickCell(id, cell, evt));

      cell.style.fill = "transparent";
      cell.style.stroke = "black";
      cell.style.strokeWidth = "1";
    });

    $("display-circuit-lap").innerHTML = "Lap: " + paths.length / 2 + " cells";
    // if (cellsData.computed.centers || false) updateCenters();
    // if (cellsData.computed.directions || false) updateDirections();
    // if (cellsData.computed.laneEnds || false) updateLaneEnds();
    // if (cellsData.computed.positions || false) updatePositions();
  };

  updateStatus();
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
    });
  }

  // Load existing circuits
  let circuits = getStoredCircuits();
  // Add current circuit infos
  circuits[DATAS.id] = DATAS;
  localStorage.setItem("heatCircuits", JSON.stringify(circuits));
  $("data").innerHTML = JSON.stringify(DATAS);
  updateStatus();
}

/////////////////
/////////////////
///  ADD URLS
/////////////////
////////////////
function testURL(url) {
  return new Promise((resolve, reject) => {
    let tester = new Image();
    tester.addEventListener("load", () => resolve(true));
    tester.addEventListener("error", () => resolve(false));
    tester.src = url;
  });
}

$("add-urls").addEventListener("click", async () => {
  let jpgFile = null;
  while (jpgFile == null) {
    let url = window.prompt("URL of the jpg file");
    if (url == null) return;
    let validURL = await testURL(url);
    if (validURL) {
      jpgFile = url;
    } else {
      alert("Invalid jpg file");
    }
  }

  let svgFile = null;
  while (svgFile == null) {
    let url = window.prompt("URL of the svg file");
    if (url == null) return;
    let validURL = await testURL(url);
    if (validURL) {
      svgFile = url;
    } else {
      alert("Invalid svg file");
    }
  }

  DATAS.assets = {
    jpg: jpgFile,
    svg: svgFile,
  };
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
  let isLocal = DATAS.assets == "local";
  $("circuit-files-status").innerHTML = isLocal ? "Local" : "Online";
  $("circuit-files-status").classList.toggle("local", isLocal);

  SECTIONS.forEach((section) => {
    $(`section-${section}`).classList.toggle(
      "computed",
      DATAS.computed[section] || false
    );
  });
}

///////////////////////////////////////////////////////////////////////////
//  _____                 _     _   _                 _ _
// | ____|_   _____ _ __ | |_  | | | | __ _ _ __   __| | | ___ _ __ ___
// |  _| \ \ / / _ \ '_ \| __| | |_| |/ _` | '_ \ / _` | |/ _ \ '__/ __|
// | |___ \ V /  __/ | | | |_  |  _  | (_| | | | | (_| | |  __/ |  \__ \
// |_____| \_/ \___|_| |_|\__| |_| |_|\__,_|_| |_|\__,_|_|\___|_|  |___/
///////////////////////////////////////////////////////////////////////////
let modes = localStorage.getItem("heatModes");
modes = modes === null ? {} : JSON.parse(modes);

function toggleShow(section, val = null) {
  modes[section].show = val === null ? !modes[section].show : val;
  $("main-frame").classList.toggle(`show-${section}`, modes[section].show);
  $(`show-${section}`).classList.toggle("active", modes[section].show);
  localStorage.setItem("heatModes", JSON.stringify(modes));
}

SECTIONS.forEach((section) => {
  modes[section] = modes[section] || {
    show: false,
  };

  $(`show-${section}`).addEventListener("click", () => toggleShow(section));
  toggleShow(section, modes[section].show);

  ["edit", "swap", "check", "end1", "end2", "end3"].forEach((action) => {
    if (!$(`${action}-${section}`)) return;

    modes[section][action] = false;
    $(`${action}-${section}`).addEventListener("click", () => {
      modes[section][action] = !modes[section][action];
      $("main-frame").classList.toggle(
        `edit-${section}`,
        modes[section][action]
      );
      $(`${action}-${section}`).classList.toggle(
        "active",
        modes[section][action]
      );
    });
  });

  $(`generate-${section}`).addEventListener("click", () => {
    let method =
      "generate" + section.charAt(0).toUpperCase() + section.slice(1);
    window[method]();
  });
});

let highlightedCells = {};
function highlightCells(cellIds = null, className = null) {
  if (cellIds != null) {
    cellIds.forEach(
      (cellId) => (highlightedCells[cellId] = className[cellId] ?? className)
    );
  }

  Object.keys(highlightedCells).forEach((cellId) => {
    let c = highlightedCells[cellId];
    if (c == "white") c = "#ffffffaa";
    if (c == "green") c = "#00ff00aa";

    cells[cellId].style.fill = c;
  });
}

function clearHighlights() {
  Object.keys(highlightedCells).forEach((cellId) => {
    cells[cellId].style.fill = "transparent";
  });
  highlightedCells = {};
}

function onMouseEnterCell(id, cell) {
  $("cell-indicator-counter").innerHTML = id;

  if (selectedCell === null) {
    if (modes.lanes.check) {
      let lane = computeLane(id);
      let highlights = {};
      lane.forEach((cellId, i) => {
        let opacity = Math.max((255.0 - i) / 255.0, 0);
        highlights[cellId] = `rgba(255,255,255, ${opacity})`;
      });
      highlightCells(lane, highlights);
    } else {
      // Otherwise, display neighbours and/or adjacence
      if (modes.neighbours.show && cellsData.computed.neighbours) {
        let neighbourIds = cellsData.cells[id].neighbours;
        highlightCells(neighbourIds, "white");
      }
      if (modes.adjacence.show && cellsData.computed.adjacence) {
        let adjacentCellIds = cellsData.cells[id].adjacence;
        highlightCells(adjacentCellIds, "green");
      }
    }
  }

  if (id === selectedCell) return;

  let color = cell.style.fill;
  if (color == "transparent") color = "rgb(100,100,100)";
  cell.style.fill = rgba2hex(color, "ee");
  cell.style.strokeWidth = "2";
}

function onMouseLeaveCell(id, cell) {
  $("cell-indicator-counter").innerHTML = "----";
  if (id === selectedCell) return;

  cell.style.strokeWidth = "1";
  let color = rgba2hex(cell.style.fill, "aa");
  if (color == "#646464aa") color = "transparent";
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
    let newPos = prompt("New position ?");
    cellsData.cells[id].position = parseInt(newPos);
    updatePositions();
    saveCellsData();
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
  if (modes.lanes.end3) {
    updateLaneEnd(3, id);
    return;
  }

  if (modes.centers.edit) {
    let x = evt.clientX - 1,
      y = evt.clientY - 3;
    cellsData.cells[id].center = { x, y };
    updateCenters();
    saveCellsData();
    return;
  }

  if (modes.directions.swap) {
    swapDirection(id);
    saveCellsData();
    return;
  }

  if (modes.directions.edit) {
    if (selectedCell == null) {
      selectedCell = id;
      cell.style.fill = "green";
    } else {
      changeDirection(selectedCell, evt);
      selectedCell = null;
      saveCellsData();
      clearHighlights();
    }
  }

  if (modes.neighbours.edit) {
    if (selectedCell == null) {
      selectedCell = id;
      cell.style.fill = "green";
      highlightCells(cellsData.cells[id].neighbours, "white");
    } else if (selectedCell == id) {
      selectedCell = null;
      cell.style.fill = "transparent";
      clearHighlights();
    } else {
      toggleNeighbour(selectedCell, id, cell);
    }
    return;
  }

  if (modes.adjacence.edit) {
    if (selectedCell == null) {
      selectedCell = id;
      cell.style.fill = "green";
      updateHighlights(
        cellsData.cells[id].neighbours,
        cellsData.cells[id].adjacence
      );
    } else if (selectedCell == id) {
      selectedCell = null;
      cell.style.fill = "transparent";
      clearHighlights();
      clearGreenHighlights();
    } else {
      toggleAdjacence(selectedCell, id, cell);
    }
    return;
  }
}

////////////////////////
//  _   _ _   _ _
// | | | | |_(_) |___
// | | | | __| | / __|
// | |_| | |_| | \__ \
//  \___/ \__|_|_|___/
////////////////////////

function dist2(pos1, pos2) {
  return (
    (pos1.x - pos2.x) * (pos1.x - pos2.x) +
    (pos1.y - pos2.y) * (pos1.y - pos2.y)
  );
}

function rgba2hex(orig, forceAlpha = null) {
  var a,
    isPercent,
    rgb = orig
      .replace(/\s/g, "")
      .match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = ((rgb && rgb[4]) || "").trim(),
    hex = rgb
      ? (rgb[1] | (1 << 8)).toString(16).slice(1) +
        (rgb[2] | (1 << 8)).toString(16).slice(1) +
        (rgb[3] | (1 << 8)).toString(16).slice(1)
      : orig;

  if (alpha !== "") {
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

  return "#" + hex;
}

///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////

function foo() {
  let cellIds = [];
  let cells = {};

  //////////////////////////////////////
  //   ____           _
  //  / ___|___ _ __ | |_ ___ _ __ ___
  // | |   / _ \ '_ \| __/ _ \ '__/ __|
  // | |__|  __/ | | | ||  __/ |  \__ \
  //  \____\___|_| |_|\__\___|_|  |___/
  //////////////////////////////////////
  function generateCenters() {
    if (
      (cellsData.computed.centers || false) &&
      !confirm("Are you sure you want to overwrite existing centers ?")
    ) {
      return;
    }

    cellIds.forEach((id) => {
      let cell = cells[id];
      let pos = computeCenterOfCell(cell);
      cellsData.cells[id].center = pos;
    });

    cellsData.computed.centers = true;
    this.saveCellsData();
    this.updateCenters();
    toggleShow("centers", true);
    console.log("Centers computed");
  }

  function updateCenters() {
    cellIds.forEach((cellId) => {
      if (!$(`center-${cellId}`)) {
        $("centers").insertAdjacentHTML(
          "beforeend",
          `<div class='center-indicator' id='center-${cellId}'></div>`
        );
      }

      $(`center-${cellId}`).style.left =
        cellsData.cells[cellId].center.x - 2 + "px";
      $(`center-${cellId}`).style.top =
        cellsData.cells[cellId].center.y - 2 + "px";

      $(`center-${cellId}`).dataset.lane = cellsData.cells[cellId].lane ?? 0;
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
    if (!cellsData.computed.centers) {
      alert("You must compute the centers first");
      return false;
    }

    if (
      (cellsData.computed.directions || false) &&
      !confirm("Are you sure you want to overwrite existing directions ?")
    ) {
      return;
    }

    cellIds.forEach((id) => {
      let cell = cells[id];
      let center = cellsData.cells[id].center;
      let angle = computeTangentOfCell(cell, center);
      cellsData.cells[id].angle = angle;
    });

    cellsData.computed.directions = true;
    this.saveCellsData();
    this.updateDirections();
    toggleShow("directions", true);
    console.log("Directions computed");
  }

  function updateDirections() {
    cellIds.forEach((cellId) => {
      updateDirection(cellId);
    });
  }

  function updateDirection(cellId) {
    if (!$(`direction-${cellId}`)) {
      $(`center-${cellId}`).insertAdjacentHTML(
        "beforeend",
        `<div class='direction-indicator' id='direction-${cellId}'></div>`
      );
    }

    let angle = cellsData.cells[cellId].angle ?? 0;
    $(`direction-${cellId}`).style.transform = `rotate(${angle}deg)`;
  }

  function swapDirection(cellId) {
    let angle = cellsData.cells[cellId].angle;
    cellsData.cells[cellId].angle = (angle + 180) % 360;
    updateDirection(cellId);
  }

  function changeDirection(id, evt) {
    let x = evt.clientX - 1,
      y = evt.clientY - 3;
    let center = cellsData.cells[id].center;
    cellsData.cells[id].angle =
      (Math.atan2(y - center.y, x - center.x) * 180) / Math.PI;
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
    if (!cellsData.computed.centers || !cellsData.computed.directions) {
      alert("You must compute the centers and directions first");
      return false;
    }

    if (
      (cellsData.computed.neighbours || false) &&
      !confirm("Are you sure you want to overwrite existing neighbours ?")
    ) {
      return;
    }

    // Compute neighbours
    cellIds.forEach((id) => {
      let neighbours = computeNeighbours(id);
      cellsData.cells[id].neighbours = neighbours;
    });
    // Ensure the relation is symmetric
    cellIds.forEach((cellId) => {
      cellsData.cells[cellId].neighbours.forEach((id) => {
        let neighbours2 = cellsData.cells[id].neighbours;
        if (!neighbours2.includes(cellId)) {
          neighbours2.push(cellId);
        }
      });
    });

    cellsData.computed.neighbours = true;
    saveCellsData();
    toggleShow("neighbours", true);
    console.log("Neighbours computed");
  }

  function computeNeighbours(id) {
    let center = cellsData.cells[id].center;
    let angle = (cellsData.cells[id].angle * Math.PI) / 180;

    // Sort cells by distance
    let dists = {};
    // Keep only the cells not orthogonal to direction
    let ids = Object.keys(cells).filter((cellId) => {
      if (cellId == id) return false;

      let center2 = cellsData.cells[cellId].center;
      let v = { x: center2.x - center.x, y: center2.y - center.y };
      let alpha = Math.atan2(v.y, v.x) - angle;
      if (alpha < -Math.PI / 2) alpha += 2 * Math.PI;

      return Math.abs(Math.cos(alpha)) > 0.2;
    });

    ids.forEach((cellId) => {
      let center2 = cellsData.cells[cellId].center;
      dists[cellId] =
        (center.x - center2.x) * (center.x - center2.x) +
        (center.y - center2.y) * (center.y - center2.y);
    });
    ids = ids.sort(function (id1, id2) {
      return dists[id1] - dists[id2];
    });

    // Keep only the 6 closest ones
    ids = ids.slice(0, 6);

    // Keep only the ones close enough
    let minDist = dists[ids[0]];
    ids = ids.filter((cellId) => dists[cellId] < 2 * minDist);

    return ids.map((t) => parseInt(t));
  }

  function toggleNeighbour(selectedCell, id, cell) {
    let neighbours = cellsData.cells[selectedCell].neighbours;
    let i = neighbours.findIndex((cId) => cId == id);

    if (i === -1) {
      // New neighbour => add it
      neighbours.push(id);
      highlightCells([id], "white");

      // Add myself to new neighbour as well
      let neighbours2 = cellsData.cells[id].neighbours;
      if (!neighbours2.includes(selectedCell)) {
        neighbours2.push(selectedCell);
      }
    } else {
      // Already there => remove it
      neighbours.splice(i, 1);

      // Remove myself to old neighbour as well
      let neighbours2 = cellsData.cells[id].neighbours;
      let j = neighbours2.findIndex((cId) => cId == selectedCell);
      if (j !== -1) {
        neighbours2.splice(j, 1);
      }

      highlightCells([id], "transparent");
    }
    saveCellsData();
  }

  ////////////////////////////////////////////////////////
  //     _       _  _
  //    / \   __| |(_) __ _  ___ ___ _ __   ___ ___
  //   / _ \ / _` || |/ _` |/ __/ _ \ '_ \ / __/ _ \
  //  / ___ \ (_| || | (_| | (_|  __/ | | | (_|  __/
  // /_/   \_\__,_|/ |\__,_|\___\___|_| |_|\___\___|
  //             |__/
  ////////////////////////////////////////////////////////
  function generateAdjacence() {
    if (!cellsData.computed.neighbours) {
      alert("You must compute the neighbours first");
      return false;
    }

    if (
      (cellsData.computed.adjacence || false) &&
      !confirm("Are you sure you want to overwrite existing adjacence ?")
    ) {
      return;
    }

    // Compute adjacence
    cellIds.forEach((id) => {
      let neighbours = computeAdjacentCells(id);
      cellsData.cells[id].adjacence = neighbours;
    });

    cellsData.computed.adjacence = true;
    saveCellsData();
    toggleShow("adjacence", true);
    console.log("Adjacence computed");
  }

  function computeAdjacentCells(id) {
    let center = cellsData.cells[id].center;
    let angle = (cellsData.cells[id].angle * Math.PI) / 180;

    // Keep only the cells within the cone angle
    let coneAngle = Math.PI / 3;
    let ids = cellsData.cells[id].neighbours.filter((cellId) => {
      if (cellId == id) return false;

      let center2 = cellsData.cells[cellId].center;
      let v = { x: center2.x - center.x, y: center2.y - center.y };
      let alpha = Math.atan2(v.y, v.x) - angle;
      if (alpha < -Math.PI / 2) alpha += 2 * Math.PI;

      return alpha > -coneAngle && alpha < coneAngle;
    });

    return ids;
  }

  function toggleAdjacence(selectedCell, id, cell) {
    let neighbours = cellsData.cells[selectedCell].adjacence;
    let i = neighbours.findIndex((cId) => cId == id);

    if (i === -1) {
      // New neighbour => add it
      neighbours.push(id);
      highlightCells([id], "green");
    } else {
      // Already there => remove it
      neighbours.splice(i, 1);
      highlightCells([id], "white");
    }
    saveCellsData();
  }

  ////////////////////////////////
  //  _
  // | |    __ _ _ __   ___  ___
  // | |   / _` | '_ \ / _ \/ __|
  // | |__| (_| | | | |  __/\__ \
  // |_____\__,_|_| |_|\___||___/
  ////////////////////////////////

  function computeLane(id) {
    let current = id;
    let visited = [];
    while (!visited.includes(current)) {
      visited.push(current);

      let adj = cellsData.cells[current].adjacence;
      if (adj.length == 1) {
        current = adj[0];
      } else {
        let center = cellsData.cells[current].center;
        let angle = (cellsData.cells[current].angle * Math.PI) / 180;
        let angles = adj.map((cellId) => {
          let center2 = cellsData.cells[cellId].center;
          let v = { x: center2.x - center.x, y: center2.y - center.y };
          let alpha = Math.atan2(v.y, v.x) - angle;
          if (alpha < -Math.PI / 2) alpha += 2 * Math.PI;
          return Math.abs(alpha);
        });
        let ids = Object.keys(adj);
        ids = ids.sort(function (id1, id2) {
          return angles[id1] - angles[id2];
        });
        current = adj[ids[0]];
      }
    }

    return visited;
  }

  function generateLanes() {
    if (!cellsData.computed.adjacence) {
      alert("You must compute the adjacence first");
      return false;
    }
    if (
      !cellsData.computed.laneEnds ||
      !cellsData.computed.laneEnds.end1 ||
      !cellsData.computed.laneEnds.end2
    ) {
      alert("You must add the lane endings first");
      return false;
    }

    if (
      (cellsData.computed.lanes || false) &&
      !confirm("Are you sure you want to overwrite existing lanes ?")
    ) {
      return;
    }

    // Compute adjacence
    [1, 2].forEach((lane) => {
      let cellId = cellsData.computed.laneEnds[`end${lane}`];
      let cellIds = computeLane(cellId);
      cellIds.forEach((cId) => {
        cellsData.cells[cId].lane = lane;
      });
    });

    cellsData.computed.lanes = true;
    saveCellsData();
    toggleShow("lanes", true);
    updateCenters();
    console.log("Lanes computed");
  }

  // Lane ends
  function updateLaneEnd(lane, cellId) {
    if (!cellsData.computed.laneEnds) cellsData.computed.laneEnds = {};
    cellsData.computed.laneEnds[`end${lane}`] = cellId;
    saveCellsData();
    updateLaneEnds();
  }

  function updateLaneEnds() {
    [1, 2].forEach((i) => {
      let end = `end${i}`;
      let cellId = cellsData.computed.laneEnds[end] ?? null;
      if (cellId) {
        if (!$(`lane-${end}`)) {
          $(`center-${cellId}`).insertAdjacentHTML(
            "beforeend",
            `<div id='lane-${end}' class='lane-end-indicator'>${i}🏁</div>`
          );
        }

        $(`center-${cellId}`).insertAdjacentElement(
          "beforeend",
          $(`lane-${end}`)
        );
      }
    });
  }

  //////////////////////////////////////////////
  //  ____           _ _   _
  // |  _ \ ___  ___(_) |_(_) ___  _ __  ___
  // | |_) / _ \/ __| | __| |/ _ \| '_ \/ __|
  // |  __/ (_) \__ \ | |_| | (_) | | | \__ \
  // |_|   \___/|___/_|\__|_|\___/|_| |_|___/
  //////////////////////////////////////////////
  function generatePositions() {
    if (!cellsData.computed.adjacence) {
      alert("You must compute the adjacence first");
      return false;
    }
    if (
      !cellsData.computed.laneEnds ||
      !cellsData.computed.laneEnds.end1 ||
      !cellsData.computed.laneEnds.end2
    ) {
      alert("You must add the lane endings first");
      return false;
    }

    if (
      (cellsData.computed.positions || false) &&
      !confirm("Are you sure you want to overwrite existing positions ?")
    ) {
      return;
    }

    const positions = computePositions();
    cellIds.forEach((cId) => {
      cellsData.cells[cId].position = positions[cId];
    });

    cellsData.computed.positions = true;
    saveCellsData();
    toggleShow("positions", true);
    updatePositions();
    console.log("Positions computed");
  }

  function computePositions() {
    let positions = {};

    let endCell = cellsData.computed.laneEnds.end2;
    let current = endCell;
    let pos = 0;
    while (!positions[current]) {
      positions[current] = pos;

      let forwardCells = computeAdjacentCells(current).concat(
        cellsData.cells[current].adjacence
      );
      forwardCells.forEach((cellId) => {
        if (cellsData.cells[cellId].lane == 2) {
          current = cellId;
        } else {
          positions[cellId] = pos + 1;
        }
      });
      pos++;
    }

    return positions;
  }

  // function dfsTopologicalSortHelper(cellId, n, visited, positions, excluded) {
  //   visited[cellId] = true;
  //   const neighbours = cellsData.cells[cellId].adjacence;
  //   for (const neighbour of neighbours) {
  //     if (
  //       !visited[neighbour] &&
  //       !excluded.includes(parseInt(neighbour)) &&
  //       (cellsData.cells[cellId].lane ?? 0) > 0
  //     ) {
  //       n = dfsTopologicalSortHelper(neighbour, n, visited, positions, excluded);
  //     }
  //   }
  //   positions[cellId] = n;
  //   return n - 1;
  // }

  // function computePositions() {
  //   const vertices = cellIds;
  //   const visited = {};
  //   const positions = {};
  //   const excluded = [1, 2, 3].map((i) => cellsData.computed.laneEnds[`end${i}`]);
  //   console.log(excluded);
  //   let n = vertices.length - 1;
  //   for (const v of vertices) {
  //     if (!visited[v]) {
  //       n = dfsTopologicalSortHelper(v, n, visited, positions, excluded);
  //     }
  //   }
  //   return positions;
  // }

  function updatePositions() {
    cellIds.forEach((cellId) => {
      $(`center-${cellId}`).dataset.position =
        cellsData.cells[cellId].position ?? 0;
    });
  }
}
