class Agent {

    constructor() {
        
    };

    // ExpectiMax algorithm for AI decision-making
    expectiMax(brain, depth, isMaxPlayer) {
        if (depth === 0) {
            return this.evaluateGridMatrix(brain);
        }
    
        if (isMaxPlayer) {
            let maxEval = Number.MIN_SAFE_INTEGER;
    
            for (let i = 0; i < 4; i++) {
                var clone = new AgentBrain(brain);
                if (clone.move(i)) {
                    const score = this.expectiMax(clone, depth - 1, false);
                    maxEval = Math.max(maxEval, score);
                }
            }
            return maxEval;
        } else {
            let chanceEval = 0;
            const emptyCells = brain.grid.availableCells();
            let values = [2, 4];

            if (emptyCells.length === 0) {
                return this.evaluateGridMatrix(brain);
            }
    
            for (const cell of emptyCells) {
                for (const value of values) {
                    var clone = new AgentBrain(brain);
                    clone.addTileToPos(cell.x, cell.y, value); // Assume a new tile spawns with value 2
                    const score = this.expectiMax(clone, depth - 1, true);
                    chanceEval += score;
                }
            }
            return chanceEval / emptyCells.length;
        }
    };

    selectMove(gameManager) {
        var brain = new AgentBrain(gameManager);

        // Use the brain to simulate moves
        // brain.move(i) 
        // i = 0: up, 1: right, 2: down, 3: left
        // brain.reset() resets the brain to the current game board
        
        let bestMove = 0;
        let bestScore = Number.MIN_SAFE_INTEGER;

        for (let i = 0; i < 4; i++) {
            brain.reset();
            if (brain.move(i)) {
                const score = this.expectiMax(brain, 6, false);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        brain.reset();
        return bestMove;
    };

    evaluateGridMatrix(board) {
        const cornerWeightedMatrix = [
            [16, 8, 4, 2],
            [8, 4, 2, 1],
            [4, 2, 1, 0],
            [2, 1, 0, 0],
        ];
        let score = 0;

        board.grid.eachCell(function (x, y, cell) {
            if (cell) {
            score += cell.value * cornerWeightedMatrix[x][y];
            }
        });

        return score;
    }
    
    evaluateGridWeights(board) {
        function getLog2Value(tile) {
            return tile === null ? 0 : Math.log2(tile.value);
        }

        const smoothnessWeight = 0.2;
        const monotonicityWeight = 2.0;
        const emptyCellsWeight = 1.0;
        const maximumWeight = 5.0;
      
        // Calculate smoothness score
        let smoothness = 0;

        board.grid.eachCell(function (x, y, cell) {
            if (cell) {
                let value = Math.log2(cell.value);

                let neighbors = [];
                if (x > 0) neighbors.push(getLog2Value(board.grid.cells[x - 1][y]));
                if (x < 3) neighbors.push(getLog2Value(board.grid.cells[x + 1][y]));
                if (y > 0) neighbors.push(getLog2Value(board.grid.cells[x][y - 1]));
                if (y < 3) neighbors.push(getLog2Value(board.grid.cells[x][y + 1]));
                smoothness -= neighbors.reduce((acc, val) => acc + Math.abs(value - val), 0);
            }
        });
      
        // Calculate monotonicity score
        let monotonicity = 0;
        for (let i = 0; i < 4; i++) {
          let row = [getLog2Value(board.grid.cells[i][0]), getLog2Value(board.grid.cells[i][1]), getLog2Value(board.grid.cells[i][2]), getLog2Value(board.grid.cells[i][3])];
          for (let j = 0; j < 3; j++) {
            if (row[j] > row[j + 1]) {
              monotonicity += row[j] - row[j + 1];
            } else {
              monotonicity -= row[j + 1] - row[j];
            }
          }
        }
        for (let j = 0; j < 4; j++) {
          let col = [getLog2Value(board.grid.cells[0][j]), getLog2Value(board.grid.cells[1][j]), getLog2Value(board.grid.cells[2][j]), getLog2Value(board.grid.cells[3][j])];
          for (let i = 0; i < 3; i++) {
            if (col[i] > col[i + 1]) {
              monotonicity += col[i] - col[i + 1];
            } else {
              monotonicity -= col[i + 1] - col[i];
            }
          }
        }
      
        // Calculate empty cells score
        const emptyCells = board.grid.availableCells();
        const emptyCellsScore = emptyCells.length > 0 ? Math.log2(emptyCells.length) : 0;
      
        // Calculate max value score
        let maximumScore = 0;
        board.grid.eachCell(function (x, y, cell) {
            if (cell) {
                var value = cell.value;
                if (value > maximumScore) {
                    maximumScore = value;
                }
            }
        });

        // Combine the scores with respective weights
        const score =
          smoothnessWeight * smoothness +
          monotonicityWeight * monotonicity +
          emptyCellsWeight * emptyCellsScore +
          maximumWeight * Math.log2(maximumScore);
      
        return score;
    };
}
