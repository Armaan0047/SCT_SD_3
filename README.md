# Sudoku Solver

A simple Sudoku Solver web app built with plain HTML, CSS and JavaScript.
This is **Task 3** of my SkillCraft Technology Software Development Internship.

You can type your own puzzle (or load a sample) and the app solves it using a
backtracking algorithm. There is also a Visual Solve mode that animates the
backtracking step by step so you can watch how it works.

## Features

- Interactive 9x9 grid
- Type numbers manually (only 1-9 allowed)
- **Solve** button - solves the puzzle instantly
- **Visual Solve** button - animates the backtracking
- **Sample** button - loads an example puzzle
- **Clear** button - empties the board
- Invalid puzzle detection (highlights clashing cells)
- "No solution" detection for unsolvable puzzles
- Success message when solved
- Solve time display (in milliseconds)
- Filled cells counter
- Dark mode toggle (remembers your choice)
- Responsive layout for phones and desktops

## How to run

No installation needed. Just open `index.html` in any web browser.

```
SCT_SD_3/
├── index.html
├── css/style.css
├── js/script.js
├── README.md
├── LICENSE
└── .gitignore
```

## How it works

The solver uses a classic **backtracking algorithm**:

1. Find the first empty cell.
2. Try the digits 1-9 in that cell.
3. If a digit is allowed (no clash in the row, column or 3x3 box), place it and
   move on to the next empty cell.
4. If we get stuck, remove the digit (backtrack) and try the next one.

Both Solve and Visual Solve use the **same** solving function. The solver records
every step it takes into a list. Normal Solve just shows the final answer, while
Visual Solve replays that list of steps with a small delay so you can see each
placement and each backtrack.

## Tech used

- HTML
- CSS
- JavaScript (vanilla, no frameworks)

## Author

Made by a first-year BTech student for the SkillCraft Technology internship.
