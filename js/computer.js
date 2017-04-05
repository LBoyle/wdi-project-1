var CP = CP || {

  computerPlay(player, board, keys) {
    const chosenSquare = this.getChoice(player, board, keys);
    console.log(chosenSquare);
    return chosenSquare;
  }, // end of computerPlay function

  // this is only called to check if the player has legal moves remaining
  // I want the getChoice function, but to not repeat myself
  anyLegalMoves(player, board, keys) {
    const possible = this.getChoice(player, board, keys);
    console.log(possible);
    if (possible) {
      return true;
    } else {
      return false;
    }
  },

  getChoice(player, board, keys) { // this function is pretty procedural, but it works.
    let possibleSquares = [];
    let chipsThisTurn = [];
    const abacus = {};
    for (let i=0; i<keys.length; i++) {
      for (let j=0; j<8; j++) {
        const thisId = '#'+keys[i]+(j).toString();
        chipsThisTurn = this.isLegal(keys[i], j, player, board, keys);
        abacus[thisId] = chipsThisTurn.length;
        for (let i=chipsThisTurn.length; i>=0; i--) {
          chipsThisTurn.pop([i]);
        }
      }
    }
    let counter = 0; // the counter is the highest score for any legal move,
    const resultKeys = Object.keys(abacus);
    for (let i=0; i<resultKeys.length; i++) {
      if (abacus[resultKeys[i]] > counter) {
        if ($(resultKeys[i]).hasClass('N')) {
          counter = abacus[resultKeys[i]];
        }
      }
    }
    // I make a list of the highest scoring moves, then choose one at the end of the function
    for (let i=0; i<resultKeys.length; i++) {
      if (abacus[resultKeys[i]] === counter) {
        if ($(resultKeys[i]).hasClass('N')) {
          possibleSquares.push(resultKeys[i]);
        }
      }
    }
    if (abacus[this.chosenSquare] === 0) {
      possibleSquares = [];
    } else {
      return possibleSquares[0];
    }

  }, // end of getChoice function

  isLegal(row, col, player, board, keys) {
    // Find possible planes In terms of [row, col]
    const goodChips = [];
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
        const rowIndex   = keys.indexOf(newRow);
        newRow           = keys[rowIndex + rowChange];
        newCol           = newCol + colChange;
        const nextSquare = board[newRow] ? board[newRow][newCol] : undefined;
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
    // if (possiblePlanes.toString()) this.legal = true;
    possiblePlanes.forEach(plane => {
      plane.forEach(id => {
        goodChips.push(id);
      });
    });
    return goodChips;
  }, // end of isLegal function

  checkLength(plane, col, row) {return plane.length >= 6 && (col === 7 || col === 0 || row === 'a' || row === 'h');},
  invalidMove(row, col, square) {return this.validRow(row) || this.validColumn(col) || this.emptySquare(square);},
  validRow(row) {return typeof row === 'undefined';},
  validColumn(col) {return col > 7 || col < 0;},
  emptySquare(square) {return square === 'N';}

}; // end of Computer Player object
