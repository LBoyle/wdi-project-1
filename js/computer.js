var CP = CP || {
  abacus: {},
  board: {},
  keysC: [],
  legal: false,
  count: 0,
  chipsThisTurn: [], // reassigned every loop
  possibleSquares: [], // one added to every loop, if it can score
  chosenSquare: '',

  computerPlay(player, boardModel, keys, count) {
    this.chosenSquare = '';
    this.board = boardModel;
    this.keysC = keys;
    this.count = count;

    this.getChoice(player);
    this.reset();
    return this.chosenSquare;
  }, // end of computerPlay function

  // this is only called to check if the player has legal moves remaining
  // I want the getChoice function, but not to repeat myself
  anyLegalMoves(player, boardModel, keys, count) {
    this.chosenSquare = '';
    this.board = boardModel;
    this.keysC = keys;
    this.count = count;
    this.getChoice(player);
    if (this.possibleSquares) {
      this.reset();
      return true;
    } else {
      this.reset();
      return false;
    }
  },

  reset() {
    this.abacus = {};
    this.board = {};
    this.keysC = [];
    this.legal = false;
    this.count = 0;
    this.chipsThisTurn = [];
    this.possibleSquares = [];
  },

  getChoice(player) { // this function is pretty procedural, but it works.
    for (let i=0; i<this.keysC.length; i++) {
      for (let j=0; j<8; j++) {
        const thisId = '#'+this.keysC[i]+(j).toString();
        this.isLegal(this.keysC[i], j, player);
        const takeable = this.chipsThisTurn.length;
        this.abacus[thisId] = takeable;
        for (let i=this.chipsThisTurn.length; i>=0; i--) {
          this.chipsThisTurn.pop([i]);
        }
      }
    }
    let counter = 0; // the counter is the highest score for any legal move,
    const resultKeys = Object.keys(this.abacus);
    for (let i=0; i<resultKeys.length; i++) {
      if (this.abacus[resultKeys[i]] > counter) {
        if ($(resultKeys[i]).hasClass('N')) {
          counter = this.abacus[resultKeys[i]];
          // console.log(this.abacus[resultKeys[i]]);
        }
      }
    }
    // I make a list of the highest scoring moves, then choose one at the end of the function
    for (let i=0; i<resultKeys.length; i++) {
      if (this.abacus[resultKeys[i]] === counter) {
        if ($(resultKeys[i]).hasClass('N')) {
          this.possibleSquares.push(resultKeys[i]);
        }
      }
    }
    if (this.abacus[this.chosenSquare] === 0) {
      this.chosenSquare = [];
      // console.log(this.abacus[this.chosenSquare]);
    } else {
      // (this.count === 0 || this.count %2 === 0) ? this.chosenSquare = this.possibleSquares[this.possibleSquares.length-1]: this.chosenSquare = this.possibleSquares[0];
      this.chosenSquare = this.possibleSquares[0];
      // console.log(this.abacus[this.chosenSquare]);
      // console.log(this.chosenSquare +' : '+ this.abacus[this.chosenSquare]);
    }

  }, // end of getChoice function

  isLegal(row, col, player) {
    // Find possible planes In terms of [row, col]
    const directions = [
      [-1,0], // N
      [-1,1], // NE
      [0,1],  // E
      [1,1],  // SE
      [1,0],  // S
      [1,-1], // SW
      [0,-1], // W
      [-1,-1] // NW
    ];
    const possiblePlanes = directions.map(direction => {
      const rowChange = direction[0];
      const colChange = direction[1];
      let plane  = [];
      let newRow = row;
      let newCol = col;
      for (let j = 0; j < 7; j++) {
        const rowIndex   = CP.keysC.indexOf(newRow);
        newRow           = CP.keysC[rowIndex + rowChange];
        newCol           = newCol + colChange;
        const nextSquare = CP.board[newRow] ? CP.board[newRow][newCol] : undefined;
        if (CP.invalidMove(newRow, newCol, nextSquare)) {
          plane = [];
          break;
        } else if (nextSquare === player) {
          break;
        }
        if (CP.checkLength(plane, newCol, newRow)) {
          plane = [];
          break;
        }
        plane.push(`#${newRow}${newCol}`);
      }
      if (plane.toString()) return plane;
    }).filter(Boolean);
    if (possiblePlanes.toString()) this.legal = true;
    possiblePlanes.forEach(this.flipPlanes);
  }, // end of isLegal function

  checkLength(plane, col, row) {return plane.length >= 6 && (col === 7 || col === 0 || row === 'a' || row === 'h');},
  invalidMove(row, col, square) {return this.validRow(row) || this.validColumn(col) || this.emptySquare(square);},
  validRow(row) {return typeof row === 'undefined';},
  validColumn(col) {return col > 7 || col < 0;},
  emptySquare(square) {return square === 'N';},

  flipPlanes(plane) {
    plane.forEach(id => {
      CP.chipsThisTurn.push(id);
    });
  }
}; // end of Computer Player object
