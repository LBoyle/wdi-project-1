
//// this much longer code doesn't make errors,
// the refactored game logic in the other file makes mistakes

var CP = CP || {
  computerPlay(player, boardModel, keys, count) {
    // console.log(this);
    // console.log(this);
    // copy vars from parent
    this.board = boardModel;
    this.keysC = keys;
    this.legal = false;
    this.count = count;
    // create new vars
    this.abacus = {};
    this.chipsThisTurn = []; // reassigned every loop
    this.possibleSquares = []; // one added to every loop, if it can score
    this.chosenSquare = ''; // take the first from possible squares

    this.getChoice(player);
    return this.chosenSquare;

  }, // end of computerPlay function

  getChoice(player) {
    // this function is pretty procedural, but it works.
    for (let i=0; i<this.keysC.length; i++) {
      for (let j=0; j<8; j++) {
        const thisId = '#'+this.keysC[i]+(j).toString();
        this.isLegalC(this.keysC[i], j, player);
        const takeable = this.chipsThisTurn.length;
        this.abacus[thisId] = takeable;
        for (let i=this.chipsThisTurn.length; i>=0; i--) {
          this.chipsThisTurn.pop([i]);
        }
      }
    }
    let counter = 0;
    // console.log(this.abacus);
    const resultKeys = Object.keys(this.abacus);
    for (let i=0; i<resultKeys.length; i++) {
      if (this.abacus[resultKeys[i]] > counter) {
        if ($(resultKeys[i]).hasClass('N')) {
          counter = this.abacus[resultKeys[i]];
          // console.log(this.abacus[resultKeys[i]]);
        }
      }
    }
    for (let i=0; i<resultKeys.length; i++) {
      if (this.abacus[resultKeys[i]] === counter) {
        // console.log(resultKeys[i]);
        if ($(resultKeys[i]).hasClass('N')) {
          this.possibleSquares.push(resultKeys[i]);
        }
      }
    }
    // This bit is the money shot
    // alternating between first and last, hopefully to get some variation in the CvC gameplay
    (this.count === 0 || this.count %2 === 0) ? this.chosenSquare = this.possibleSquares[this.possibleSquares.length-1]: this.chosenSquare = this.possibleSquares[0];

    // this.chosenSquare = this.possibleSquares[this.possibleSquares.length-1];
    // console.log(this.possibleSquares);
    // console.log(this.chosenSquare);
  }, // end of getChoice function

  ///////////////// function returns chosenSquare at the end

  isLegalC(row, col, current) {
    const prevRowData = [];
    const nextRowData = [];
    const prevColData = [];
    const nextColData = [];
    const tlTobrPrevData = [];
    const tlTobrNextData = [];
    const blTotrPrevData = [];
    const blTotrNextData = [];
    // 7 because I don't add the square you just clicked
    for (let i=0; i<7; i++) {
      // for the Row, trying to read from a Dict with
      // dict[foo][outside range or undefined] returns undefined
      prevRowData.push(this.board[row][col-(i+1)]);
      nextRowData.push(this.board[row][col+(i+1)]);
      // for Cols though, trying to read from a dict with
      // dict[undefined][number or undefined]
      // produces an error so I had to check each one individually
      prevColData.push((this.board[this.keysC[this.keysC.indexOf(row)-(i+1)]] !== undefined) ? this.board[this.keysC[this.keysC.indexOf(row)-(i+1)]][col] : undefined);
      nextColData.push((this.board[this.keysC[this.keysC.indexOf(row)+(i+1)]] !== undefined) ? this.board[this.keysC[this.keysC.indexOf(row)+(i+1)]][col] : undefined);
      // this gets confusing
      // can you believe it works though!?
      tlTobrPrevData.push((this.board[this.keysC[this.keysC.indexOf(row)-(i+1)]] !== undefined) ? this.board[this.keysC[this.keysC.indexOf(row)-(i+1)]][col-(i+1)] : undefined);
      tlTobrNextData.push((this.board[this.keysC[this.keysC.indexOf(row)+(i+1)]] !== undefined) ? this.board[this.keysC[this.keysC.indexOf(row)+(i+1)]][col+(i+1)] : undefined);
      blTotrPrevData.push((this.board[this.keysC[this.keysC.indexOf(row)+(i+1)]] !== undefined) ? this.board[this.keysC[this.keysC.indexOf(row)+(i+1)]][col-(i+1)] : undefined);
      blTotrNextData.push((this.board[this.keysC[this.keysC.indexOf(row)-(i+1)]] !== undefined) ? this.board[this.keysC[this.keysC.indexOf(row)-(i+1)]][col+(i+1)] : undefined);
    }
    // changed to push all legal blocks to chipsToFilp to be flipped
    // this function returns nothing
    // I can now use the same one function to check all directions
    this.checkBoardC(row, col, current, prevRowData, nextRowData, 'h');
    this.checkBoardC(row, col, current, prevColData, nextColData, 'v');
    this.checkBoardC(row, col, current, tlTobrPrevData, tlTobrNextData, 'd1');
    this.checkBoardC(row, col, current, blTotrPrevData, blTotrNextData, 'd2');
  },

  // I've rigged this function to do horizontal, vertical or diagonal checks based on input
  // checkBoardC(e, row, col, current, blTotrPrevData, blTotrNextData, 'd2');
  checkBoardC(row, col, player, prev, next, plane) {
    let enemy = '';
    if (player === 'B') {
      enemy = 'W';
    }else {
      enemy = 'B';
    }
    if (next[0] === enemy && next[1] === player) {
      this.legal = true;
      this.pushChipsC(plane, 1, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === player) {
      this.legal = true;
      this.pushChipsC(plane, 1, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === player) {
      this.legal = true;
      this.pushChipsC(plane, 2, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === player) {
      this.legal = true;
      this.pushChipsC(plane, 2, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === player) {
      this.legal = true;
      this.pushChipsC(plane, 3, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === player) {
      this.legal = true;
      this.pushChipsC(plane, 3, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === enemy && next[4] === player) {
      this.legal = true;
      this.pushChipsC(plane, 4, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === enemy && prev[4] === player) {
      this.legal = true;
      this.pushChipsC(plane, 4, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === enemy && next[4] === enemy && next[5] === player) {
      this.legal = true;
      this.pushChipsC(plane, 5, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === enemy && prev[4] === enemy && prev[5] === player) {
      this.legal = true;
      this.pushChipsC(plane, 5, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === enemy && next[4] === enemy && next[5] === enemy && next[6] === player) {
      this.legal = true;
      this.pushChipsC(plane, 6, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === enemy && prev[4] === enemy && prev[5] === enemy && prev[6] === player) {
      this.legal = true;
      this.pushChipsC(plane, 6, 'neg', row, col);
    }
  }, // end of checkBoard function

  // pushChipsC(plane, 1, 'pos', row, col);
  pushChipsC(plane, num, dir, row, col) {
    // num is number of blocks to be taken
    for (let i=0; i<num; i++) {
      if (plane === 'h') {
        if (dir === 'neg') {
          this.chipsThisTurn.push('#'+row+(col-(i+1)).toString());
        }
        if (dir === 'pos') {
          this.chipsThisTurn.push('#'+row+(col+(i+1)).toString());
        }
      }
      if (plane === 'v') {
        if (dir === 'neg') {
          this.chipsThisTurn.push('#'+(this.keysC[this.keysC.indexOf(row)-(i+1)])+(col).toString());
        }
        if (dir === 'pos') {
          this.chipsThisTurn.push('#'+(this.keysC[this.keysC.indexOf(row)+(i+1)])+(col).toString());
        }
      }
      if (plane === 'd1') {
        if (dir === 'neg') {
          this.chipsThisTurn.push('#'+(this.keysC[this.keysC.indexOf(row)-(i+1)])+(col-(i+1)).toString());
        }
        if (dir === 'pos') {
          this.chipsThisTurn.push('#'+(this.keysC[this.keysC.indexOf(row)+(i+1)])+(col+(i+1)).toString());
        }
      }
      if (plane === 'd2') {
        if (dir === 'neg') {
          this.chipsThisTurn.push('#'+(this.keysC[this.keysC.indexOf(row)+(i+1)])+(col-(i+1)).toString());
        }
        if (dir === 'pos') {
          this.chipsThisTurn.push('#'+(this.keysC[this.keysC.indexOf(row)-(i+1)])+(col+(i+1)).toString());
        }
      }
    } // end of loop
  } // end of pushChips function

};
