// Sudoku Solver - SkillCraft Task 3
// Only plain functions, no classes or modules.

// A sample puzzle (0 means empty). It has exactly one solution
// and solves with a small number of backtracking steps so the
// Visual Solve animation does not take too long.
var samplePuzzle = [
  [0, 0, 3, 0, 2, 0, 6, 0, 0],
  [9, 0, 0, 3, 0, 5, 0, 0, 1],
  [0, 0, 1, 8, 0, 6, 4, 0, 0],
  [0, 0, 8, 1, 0, 2, 9, 0, 0],
  [7, 0, 0, 0, 0, 0, 0, 0, 8],
  [0, 0, 6, 7, 0, 8, 2, 0, 0],
  [0, 0, 2, 6, 0, 9, 5, 0, 0],
  [8, 0, 0, 2, 0, 3, 0, 0, 9],
  [0, 0, 5, 0, 1, 0, 3, 0, 0]
];

// Some variables we use across functions
var grid;            // the grid container
var startTime = 0;   // used to measure solve time
var lastTime = 0;    // the last solve time we showed
var animationTimer = null; // used to stop the visual solve if needed

// Runs once when the page is ready
function init() {
  grid = document.getElementById("grid");
  buildGrid();
  loadTheme();
  resetTimer();
  updateFilledCount();

  document.getElementById("solveBtn").onclick = normalSolve;
  document.getElementById("visualBtn").onclick = visualSolve;
  document.getElementById("sampleBtn").onclick = loadSample;
  document.getElementById("clearBtn").onclick = clearBoard;
  document.getElementById("themeBtn").onclick = toggleTheme;
}

// Build the 81 input cells
function buildGrid() {
  for (var row = 0; row < 9; row++) {
    for (var col = 0; col < 9; col++) {
      var cell = document.createElement("input");
      cell.type = "text";
      cell.inputMode = "numeric";
      cell.maxLength = 1;
      cell.className = "cell";
      cell.setAttribute("data-row", row);
      cell.setAttribute("data-col", col);
      cell.setAttribute("aria-label", "Row " + (row + 1) + " Column " + (col + 1));

      // Thicker borders between the 3x3 boxes
      if (col === 2 || col === 5) {
        cell.className += " box-right";
      }
      if (row === 2 || row === 5) {
        cell.className += " box-bottom";
      }

      cell.oninput = handleCellInput;
      cell.onfocus = selectCell;
      grid.appendChild(cell);
    }
  }
}

// Keep only one cell highlighted as selected
function selectCell(event) {
  var cells = document.getElementsByClassName("cell");
  for (var i = 0; i < cells.length; i++) {
    cells[i].classList.remove("selected");
  }
  event.target.classList.add("selected");
}

// Clean the typed value and update things
function handleCellInput(event) {
  event.target.value = sanitizeCellInput(event.target.value);
  clearMessage();
  clearInvalid();
  updateFilledCount();
}

// Only allow a single digit 1-9, otherwise empty
function sanitizeCellInput(value) {
  var result = "";
  for (var i = 0; i < value.length; i++) {
    if (value[i] >= "1" && value[i] <= "9") {
      result = value[i]; // keep the last valid digit
    }
  }
  return result;
}

// Read the grid into a 9x9 array of numbers
function readBoard() {
  var board = [];
  var cells = document.getElementsByClassName("cell");
  for (var row = 0; row < 9; row++) {
    board[row] = [];
    for (var col = 0; col < 9; col++) {
      var value = cells[row * 9 + col].value;
      if (value === "") {
        board[row][col] = 0;
      } else {
        board[row][col] = parseInt(value, 10);
      }
    }
  }
  return board;
}

// Write a 9x9 array back into the grid
function writeBoard(board) {
  var cells = document.getElementsByClassName("cell");
  for (var row = 0; row < 9; row++) {
    for (var col = 0; col < 9; col++) {
      var value = board[row][col];
      if (value === 0) {
        cells[row * 9 + col].value = "";
      } else {
        cells[row * 9 + col].value = value;
      }
    }
  }
}

// Make a copy of a board
function copyBoard(board) {
  var copy = [];
  for (var row = 0; row < 9; row++) {
    copy[row] = board[row].slice();
  }
  return copy;
}

// Check if placing num at (row, col) breaks the Sudoku rules
function isValidPlacement(board, row, col, num) {
  // check row and column
  for (var i = 0; i < 9; i++) {
    if (board[row][i] === num) {
      return false;
    }
    if (board[i][col] === num) {
      return false;
    }
  }

  // check the 3x3 box
  var boxRow = Math.floor(row / 3) * 3;
  var boxCol = Math.floor(col / 3) * 3;
  for (var r = boxRow; r < boxRow + 3; r++) {
    for (var c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) {
        return false;
      }
    }
  }

  return true;
}

// Find every given that clashes with another given
function findInvalidGivens(board) {
  var bad = [];
  for (var row = 0; row < 9; row++) {
    for (var col = 0; col < 9; col++) {
      var num = board[row][col];
      if (num !== 0) {
        // temporarily remove it and check if it could be placed
        board[row][col] = 0;
        if (!isValidPlacement(board, row, col, num)) {
          bad.push([row, col]);
        }
        board[row][col] = num;
      }
    }
  }
  return bad;
}

// Find the first empty cell, or null if the board is full
function findEmptyCell(board) {
  for (var row = 0; row < 9; row++) {
    for (var col = 0; col < 9; col++) {
      if (board[row][col] === 0) {
        return [row, col];
      }
    }
  }
  return null;
}

// The backtracking solver. It records every step into the steps array.
// This same function is used by both Normal Solve and Visual Solve.
function solve(board, steps) {
  var empty = findEmptyCell(board);
  if (empty === null) {
    return true; // no empty cells means it is solved
  }

  var row = empty[0];
  var col = empty[1];

  for (var num = 1; num <= 9; num++) {
    if (isValidPlacement(board, row, col, num)) {
      board[row][col] = num;
      steps.push({ type: "place", row: row, col: col, value: num });

      if (solve(board, steps)) {
        return true;
      }

      // did not work, undo it (this is a backtrack step)
      board[row][col] = 0;
      steps.push({ type: "remove", row: row, col: col, value: 0 });
    }
  }

  return false;
}

// Normal Solve - fills the grid instantly
function normalSolve() {
  stopAnimation();
  clearMessage();
  clearInvalid();

  var board = readBoard();

  var bad = findInvalidGivens(board);
  if (bad.length > 0) {
    highlightInvalid(bad);
    showMessage("Puzzle is invalid - please fix the highlighted cells.", "error");
    return;
  }

  var steps = [];
  startTimer();
  var solved = solve(board, steps);
  stopTimer();

  if (solved) {
    writeBoard(board);
    updateFilledCount();
    showMessage("Solved! Nice.", "success");
  } else {
    showMessage("No solution exists for this puzzle.", "error");
  }
}

// Visual Solve - animates the same backtracking steps
function visualSolve() {
  stopAnimation();
  clearMessage();
  clearInvalid();

  var board = readBoard();

  var bad = findInvalidGivens(board);
  if (bad.length > 0) {
    highlightInvalid(bad);
    showMessage("Puzzle is invalid - please fix the highlighted cells.", "error");
    return;
  }

  // keep the givens so we can replay from the start
  var givens = readBoard();

  var steps = [];
  startTimer();
  var solved = solve(board, steps);
  stopTimer();

  if (!solved) {
    showMessage("No solution exists for this puzzle.", "error");
    return;
  }

  // show the starting puzzle, then play the steps one by one
  writeBoard(givens);
  animateSteps(steps, 0);
}

// Play the recorded steps slowly so the user can watch
function animateSteps(steps, index) {
  if (index >= steps.length) {
    clearHighlights();
    updateFilledCount();
    showMessage("Solved! Nice.", "success");
    return;
  }

  var step = steps[index];
  var cells = document.getElementsByClassName("cell");
  var cell = cells[step.row * 9 + step.col];

  clearHighlights();

  if (step.type === "place") {
    cell.value = step.value;
    cell.classList.add("placing");
  } else {
    cell.value = "";
    cell.classList.add("removing");
  }

  updateFilledCount();

  animationTimer = setTimeout(function () {
    animateSteps(steps, index + 1);
  }, 50);
}

// Stop a running animation
function stopAnimation() {
  if (animationTimer !== null) {
    clearTimeout(animationTimer);
    animationTimer = null;
  }
  clearHighlights();
}

// Remove the placing / removing highlight from all cells
function clearHighlights() {
  var cells = document.getElementsByClassName("cell");
  for (var i = 0; i < cells.length; i++) {
    cells[i].classList.remove("placing");
    cells[i].classList.remove("removing");
  }
}

// Clear the whole board
function clearBoard() {
  stopAnimation();
  var cells = document.getElementsByClassName("cell");
  for (var i = 0; i < cells.length; i++) {
    cells[i].value = "";
    cells[i].classList.remove("invalid");
  }
  clearMessage();
  resetTimer();
  updateFilledCount();
}

// Load the sample puzzle
function loadSample() {
  stopAnimation();
  clearMessage();
  clearInvalid();
  writeBoard(samplePuzzle);
  resetTimer();
  updateFilledCount();
}

// Count how many cells are filled
function updateFilledCount() {
  var count = 0;
  var cells = document.getElementsByClassName("cell");
  for (var i = 0; i < cells.length; i++) {
    var value = cells[i].value;
    if (value >= "1" && value <= "9") {
      count++;
    }
  }
  document.getElementById("filled").textContent = count;
}

// Highlight the cells that are in conflict
function highlightInvalid(list) {
  var cells = document.getElementsByClassName("cell");
  for (var i = 0; i < list.length; i++) {
    var row = list[i][0];
    var col = list[i][1];
    cells[row * 9 + col].classList.add("invalid");
  }
}

// Remove invalid highlight from all cells
function clearInvalid() {
  var cells = document.getElementsByClassName("cell");
  for (var i = 0; i < cells.length; i++) {
    cells[i].classList.remove("invalid");
  }
}

// Messages
function showMessage(text, type) {
  var message = document.getElementById("message");
  message.textContent = text;
  message.className = "message " + type;
}

function clearMessage() {
  var message = document.getElementById("message");
  message.textContent = "";
  message.className = "message";
}

// Timer
function startTimer() {
  startTime = performance.now();
}

function stopTimer() {
  var elapsed = Math.round(performance.now() - startTime);
  lastTime = elapsed;
  document.getElementById("time").textContent = elapsed;
}

function resetTimer() {
  lastTime = 0;
  document.getElementById("time").textContent = 0;
}

// Theme
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark");
    document.getElementById("themeBtn").textContent = "Light Mode";
  } else {
    document.body.classList.remove("dark");
    document.getElementById("themeBtn").textContent = "Dark Mode";
  }
}

function toggleTheme() {
  var isDark = document.body.classList.contains("dark");
  var newTheme = isDark ? "light" : "dark";
  applyTheme(newTheme);
  try {
    localStorage.setItem("theme", newTheme);
  } catch (e) {
    // localStorage might not be available, that is ok
  }
}

function loadTheme() {
  var saved = "light";
  try {
    if (localStorage.getItem("theme")) {
      saved = localStorage.getItem("theme");
    }
  } catch (e) {
    // ignore
  }
  applyTheme(saved);
}

// Start everything once the page has loaded
window.onload = init;
