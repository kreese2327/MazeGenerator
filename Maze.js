/*
 * Maze.js
 * Author: Kevin Reese
 *
 * Maze Generation Program
 *
 * This program implements Prim's algorithm to generate random mazes using JavaScript and HTML/CSS.
 * It provides functionalities to generate mazes using Prim's algorithm and visualize
 * the maze generation process on a grid layout.
 */
Maze();

const CELLS = 0;
const FRONTIER = 1;

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

async function Maze() {

    let sleepTime = 500;
    let numCells = 9;
    let numRows = Math.sqrt(numCells);
    let numColumns = Math.sqrt(numCells);

    let visited = [];
    let frontier = [];
    let cells = [];

    let gridContainer = document.getElementById("grid-container");

    let drop = document.getElementById("grid-drop");
    drop.addEventListener("change", GenerateGrid);

    document.getElementById("reset-btn").addEventListener("click", GenerateGrid);
    document.getElementById("run-btn").addEventListener("click", GenerateMaze);


    for (let i = 0; i < 9; i++) {
        let gridItem = document.createElement("div");
        gridItem.classList.add("grid-item");
        gridItem.id = "grid-item" + i;
        gridContainer.appendChild(gridItem);
    }

    
    /* 
     * Finds the adjacent neighbors (N,E,S,W) of a cell in the maze grid based on its row and column.
     *
     * Params:
     * @row - The row index of the cell.
     * @column - The column index of the cell.
     * 
     * Return:
     * @neighbors - Array containing the coordinates of the neighboring cells.
    */
    function Neighbors(row, column) {
        let neighbors = [];
        if (row - 1 >= 0) neighbors.push([row - 1, column]);
        if (column + 1 < numColumns) neighbors.push([row, column + 1]);
        if (row + 1 < numRows) neighbors.push([row + 1, column]);
        if (column - 1 >= 0) neighbors.push([row, column - 1]);
        return neighbors;
    }

    /*
     * Chooses random starting cell, adds neighbors to the frontier, and calls Prim's Algorithm to
     * generate the maze.
     *
     */
    async function GenerateMaze() {
        document.getElementById("run-btn").disabled = true;
        document.getElementById("run-btn").style.backgroundColor = "rgb(125, 125, 125)";
        document.getElementById("reset-btn").disabled = true;
        document.getElementById("reset-btn").style.backgroundColor = "rgb(125, 125, 125)";
        drop.disabled = true;

        visited = Array(numCells).fill(false);

        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numColumns; j++) cells.push([i,j]);
        }
        
        let startRow = Math.floor(Math.random() * numRows);
        let startColumn = Math.floor(Math.random() * numColumns);
        visited[FindCellIndex([startRow, startColumn], CELLS)] = true;

        let neighbors = Neighbors(startRow, startColumn);
        let idx = -1;

        for (let neighbor of neighbors) {
            idx = FindCellIndex(neighbor, CELLS);
            document.getElementById("grid-item" + idx).style.backgroundColor = "rgb(255, 200, 200)";
            frontier.push(neighbor);
        }
        
        document.getElementById("grid-item" + FindCellIndex([startRow, startColumn], CELLS)).style.backgroundColor = "rgb(255, 240, 240)";

        await sleep(sleepTime);
        await PrimsAlgorithm();

    
        document.getElementById("reset-btn").disabled = false;
        document.getElementById("reset-btn").style.backgroundColor = "rgb(0, 0, 0)";
        drop.disabled = false;

    }

    /*
     * Implements Prim's algorithm to generate the maze, randomly choosing cells from the frontier and
     * expanding from a randomly chosen starting point.
     *
    */

    async function PrimsAlgorithm() {
        while (frontier.length > 0) {
            let randomCell = frontier[Math.floor(Math.random() * (frontier.length))];
            let randomCellIdx = FindCellIndex(randomCell, FRONTIER);
            frontier.splice(randomCellIdx, 1);

            let randCellNeighbors = Neighbors(randomCell[0], randomCell[1]);
            let randCellVisitedNeighbors = [];
            for (let neighbor of randCellNeighbors) {
                if (visited[FindCellIndex(neighbor, CELLS)]) randCellVisitedNeighbors.push(neighbor);
            }

            let randomVisitedNeighbor = randCellVisitedNeighbors[Math.floor(Math.random() * randCellVisitedNeighbors.length)]
            CutEdge(randomCell, randomVisitedNeighbor);
            await sleep(sleepTime);
            visited[FindCellIndex(randomCell, CELLS)] = true;

            for (let neighbor of randCellNeighbors) {
                if (!visited[FindCellIndex(neighbor, CELLS)] && (FindCellIndex(neighbor, FRONTIER)) < 0) {
                    frontier.push(neighbor);
                    document.getElementById("grid-item" + FindCellIndex(neighbor, CELLS)).style.backgroundColor = "rgb(255, 200, 200)";
                }
            }
            await sleep(sleepTime);
        }
    }

    /*
     * Generates new HTML grid depending on dropdown selection and updates sleep time.
     * 
     * Params:
     * @numCells - The total number of cells in the grid.
     *
    */
    function GenerateGrid(numCells) {
        cells = [];

        document.getElementById("run-btn").disabled = false;
        document.getElementById("run-btn").style.backgroundColor = "rgb(0, 0, 0)";
    
        while (gridContainer.firstChild) {
            gridContainer.removeChild(gridContainer.lastChild);
        }
        
        switch (drop.value) {
            case "0":
                numCells = 9;
                sleepTime = 500;
                document.getElementById("grid-container").style.gridTemplateColumns = "repeat(3, 1fr)";
                break;
            case "1":
                numCells = 25;
                sleepTime = 200;
                document.getElementById("grid-container").style.gridTemplateColumns = "repeat(5, 1fr)";
    
                break;
            case "2":
                numCells = 100;
                sleepTime = 40;
                document.getElementById("grid-container").style.gridTemplateColumns = "repeat(10, 1fr)";
    
                break;
            case "3":
                numCells = 625;
                sleepTime = 5;
                document.getElementById("grid-container").style.gridTemplateColumns = "repeat(25, 1fr)";
                break;
            default:
                throw new Error('Maze dimensions not found!');
        }

        numRows = Math.sqrt(numCells);
        numColumns = numRows;
    
        for (let i = 0; i < numCells; i++) {
            let gridItem = document.createElement("div");
            gridItem.classList.add("grid-item");
            gridItem.id = "grid-item" + i;
            gridContainer.appendChild(gridItem);
        }
    
    }



    /*
     * Cuts an edge between the randomly chosen cell and its neighboring cell in the maze.
     * Removes the borders of the cells to create a passage between them.
     *
     * Params:
     * @cell1 - Frontier cell from which the edge is cut.
     * @cell2 - Neighboring visited cell to which the edge is cut.
     */
    function CutEdge(cell1, cell2) {
        let gridCell2 = document.getElementById("grid-item" + FindCellIndex(cell2, CELLS));
        let gridCell1 = document.getElementById("grid-item" + FindCellIndex(cell1, CELLS));

        if (cell1[1] - 1 === cell2[1]) {            // WEST
            gridCell1.style.borderLeftColor = "transparent";
            gridCell2.style.borderRightColor = "transparent";
        } else if (cell1[1] + 1 === cell2[1]) {     // EAST
            gridCell1.style.borderRightColor = "transparent";
            gridCell2.style.borderLeftColor = "transparent";
        } else if (cell1[0] - 1 === cell2[0]) {     // NORTH
            gridCell1.style.borderTopColor = "transparent";
            gridCell2.style.borderBottomColor = "transparent";
        } else if (cell1[0] + 1 === cell2[0]) {     // SOUTH 
            gridCell1.style.borderBottomColor = "transparent";
            gridCell2.style.borderTopColor = "transparent";
        }
        gridCell1.style.backgroundColor = "rgb(255, 240, 240)";
    }

    /*
     * Finds the index of a cell within the specified array.
     *
     * Params:
     * @cell: The cell whose index needs to be found.
     * @array: The array in which to search for the cell.
     * 
     * Return:
     * The index of the cell in the array if found, otherwise returns -1
    */
    function FindCellIndex(cell, array) {
        if (array === FRONTIER) {
            for (let i = 0; i < frontier.length; i++) {
                if (ArraysEqual(frontier[i], cell)) return i;
            }
        } else {
            for (let i = 0; i < cells.length; i++) {
                if (ArraysEqual(cells[i], cell)) return i;
            }
        }
        return -1;
    }

    /*
     *  Checks if two arrays are equal by comparing their elements.
     *
     * Params:
     * @arr1: The first array to compare.
     * @arr2: The second array to compare.
     * 
     * Return:
     * True if the arrays have the same length and all elements are equal, false otherwise.
    */
    function ArraysEqual(arr1, arr2) {
        if (arr1.length !== arr2.length) return false;
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }
}


/*
 * Pauses program execution for specified amount of time.
 *
 * Params:
 * @ms - time to sleep for in milliseconds.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
