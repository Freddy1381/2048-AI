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

            if (emptyCells.length === 0) {
                return this.evaluateGridMatrix(brain);
            }
    
            for (const cell of emptyCells) {
                var clone = new AgentBrain(brain);
                clone.addTileToPos(cell.x, cell.y, 2); // Assume a new tile spawns with value 2
                const score = this.expectiMax(clone, depth - 1, true);
                chanceEval += score;
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
                const score = this.expectiMax(brain, 4, false);
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
    };
}
