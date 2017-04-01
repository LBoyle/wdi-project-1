$(() => {
  // N not assigned, B black, W white
  const keys = ['a','b','c','d','e','f','g','h'];
  const boardModel = {};
  let count = 0;
  //var boardModel = {
  //  this is what the starting board looks like
  //  I'm keeping it here for my working, to visualise the board
    // 'a': ['N','N','N','N','N','N','N','N'],
    // 'b': ['N','N','N','N','N','N','N','N'],
    // 'c': ['N','N','N','N','N','N','N','N'],
    // 'd': ['N','N','N','W','B','N','N','N'],
    // 'e': ['N','N','N','B','W','N','N','N'],
    // 'f': ['N','N','N','N','N','N','N','N'],
    // 'g': ['N','N','N','N','N','N','N','N'],
    // 'h': ['N','N','N','N','N','N','N','N']
  //   //     0   1   2   3   4   5   6   7
  // }; // will eventually use a double loop to create these I guess

  function createBoard() {
    console.log('Initialized');
    const $body = $('body');
    const $header = $(document.createElement('h1'));
    $header.text('Othello');
    const $main = $(document.createElement('main'));
    for (var i=0; i<keys.length; i++) {
      boardModel[keys[i]] = [];
      for (var j=0; j<8; j++) {
        const $box = $(document.createElement('div'));
        $box.addClass('box');
        $box.attr('id', `${keys[i]}${j}`);
        boardModel[keys[i]][j] = 'N';
        if ((keys[i] === 'd' && j === 4)||(keys[i] === 'e' && j === 3)) {
          boardModel[keys[i]][j] = 'B';
          $box.addClass('B clicked');
        } else if ((keys[i] === 'd' && j === 3)||(keys[i] === 'e' && j === 4)) {
          boardModel[keys[i]][j] = 'W';
          $box.addClass('W clicked');
        } else {
          $box.addClass('N');
        }
        $main.append($box);
      }
    }
    $body.append($header, $main);
    $('.box').on('click', clickHandler);
  }
  function clickHandler(e) {
    // if this box hasn't been clicked yet
    if (!$(e.target).hasClass('clicked')) {
      const row = e.target.id.split('')[0];
      const col = parseInt(e.target.id.split('')[1]);
      console.log(row, col);
      count++;
      // console.log(`click count is ${count}`);
      if (count === 0 || count%2 === 0) {
        //if (isLegal(e, row, col, 'W')) {
          isLegal(e, row, col, 'W');
          boardModel[row][col] = 'W';
          $(e.target).addClass('W clicked');
        //}
      } else {
        //if (isLegal(e, row, col, 'B')) {
          isLegal(e, row, col, 'B');
          boardModel[row][col] = 'B';
          $(e.target).addClass('B clicked');
        //}
      }
      // captureFunction goes here inside isLegal conditional
    }
  }

  function isLegal(e, row, col, current) {
    const prevRowData = [];
    const nextRowData = [];
    const prevColData = [];
    const nextColData = [];
    const tlTobrPrevData = [];
    const tlTobrNextData = [];
    const blTotrPrevData = [];
    const blTotrNextData = [];
    for (let i=0; i<7; i++) {
      // for the Row, trying to read from a Dict with
      // dict[foo][outside range or undefined] returns undefined
      prevRowData.push(boardModel[row][col-(i+1)]);
      nextRowData.push(boardModel[row][col+(i+1)]);
      // for Cols though, trying to read from a dict with
      // dict[undefined][number or undefined]
      // produces an error so I had to check each one individually
      prevColData.push((boardModel[keys[keys.indexOf(row)-(i+1)]] !== undefined) ? boardModel[keys[keys.indexOf(row)-(i+1)]][col] : undefined);
      nextColData.push((boardModel[keys[keys.indexOf(row)+(i+1)]] !== undefined) ? boardModel[keys[keys.indexOf(row)+(i+1)]][col] : undefined);
      // this gets confusing
      // can you believe it works though!?
      tlTobrPrevData.push((boardModel[keys[keys.indexOf(row)-(i+1)]] !== undefined) ? boardModel[keys[keys.indexOf(row)-(i+1)]][col-(i+1)] : undefined);
      tlTobrNextData.push((boardModel[keys[keys.indexOf(row)+(i+1)]] !== undefined) ? boardModel[keys[keys.indexOf(row)+(i+1)]][col+(i+1)] : undefined);
      blTotrPrevData.push((boardModel[keys[keys.indexOf(row)+(i+1)]] !== undefined) ? boardModel[keys[keys.indexOf(row)+(i+1)]][col-(i+1)] : undefined);
      blTotrNextData.push((boardModel[keys[keys.indexOf(row)-(i+1)]] !== undefined) ? boardModel[keys[keys.indexOf(row)-(i+1)]][col+(i+1)] : undefined);
    }
    console.log('prev row: '+prevRowData);
    console.log('next row: '+nextRowData);
    console.log('prev col: '+prevColData);
    console.log('next col: '+nextColData);
    console.log('prev tl to br: '+tlTobrPrevData);
    console.log('next tl to br: '+tlTobrNextData);
    console.log('prev bl to tr: '+blTotrPrevData);
    console.log('next bl to tr: '+blTotrNextData);
    if (
      // only one of these must return true for player to place
      // I can now use the same one function to check all directions
      checkBoard(e, row, col, current, prevRowData, nextRowData)||
      checkBoard(e, row, col, current, prevColData, nextColData)||
      checkBoard(e, row, col, current, tlTobrPrevData, tlTobrNextData)||
      checkBoard(e, row, col, current, blTotrPrevData, blTotrNextData)
    ) {
      return true;
    } else {
      return false;
    }
  }
  // I've rigged this function to do horizontal or vertical checks based on input
  function checkBoard(e, row, col, current, prev, next) {
    let legal = false;
    // I mean to get rid of the W or B conditional, but not bother just yet
    if (current === 'W') {
      if (
          (next[0] === 'B' && next[1] === 'W') || (prev[0] === 'B' && prev[1] === 'W')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'B' && next[1] === 'B' && next[2] === 'W')||
          (prev[0] === 'B' && prev[1] === 'B' && prev[2] === 'W')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'B' && next[1] === 'B' && next[2] === 'B' && next[3] === 'W')||
          (prev[0] === 'B' && prev[1] === 'B' && prev[2] === 'B' && prev[3] === 'W')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'B' && next[1] === 'B' && next[2] === 'B' && next[3] === 'B' && next[4] === 'W')||
          (prev[0] === 'B' && prev[1] === 'B' && prev[2] === 'B' && prev[3] === 'B' && prev[4] === 'W')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'B' && next[1] === 'B' && next[2] === 'B' && next[3] === 'B' && next[4] === 'B' && next[5] === 'W')||
          (prev[0] === 'B' && prev[1] === 'B' && prev[2] === 'B' && prev[3] === 'B' && prev[4] === 'B' && prev[5] === 'W')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'B' && next[1] === 'B' && next[2] === 'B' && next[3] === 'B' && next[4] === 'B' && next[5] === 'B' && next[6] === 'W')||
          (prev[0] === 'B' && prev[1] === 'B' && prev[2] === 'B' && prev[3] === 'B' && prev[4] === 'B' && prev[5] === 'B' && prev[6] === 'W')
        ) {
        legal = true;
      }
    } else /* Middle of main conditional */ {
      if (
          (next[0] === 'W' && next[1] === 'B') || (prev[0] === 'W' && prev[1] === 'B')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'W' && next[1] === 'W' && next[2] === 'B')||
          (prev[0] === 'W' && prev[1] === 'W' && prev[2] === 'B')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'W' && next[1] === 'W' && next[2] === 'W' && next[3] === 'B')||
          (prev[0] === 'W' && prev[1] === 'W' && prev[2] === 'W' && prev[3] === 'B')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'W' && next[1] === 'W' && next[2] === 'W' && next[3] === 'W' && next[4] === 'B')||
          (prev[0] === 'W' && prev[1] === 'W' && prev[2] === 'W' && prev[3] === 'W' && prev[4] === 'B')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'W' && next[1] === 'W' && next[2] === 'W' && next[3] === 'W' && next[4] === 'W' && next[5] === 'B')||
          (prev[0] === 'W' && prev[1] === 'W' && prev[2] === 'W' && prev[3] === 'W' && prev[4] === 'W' && prev[5] === 'B')
        ) {
        legal = true;
      }
      if (
          (next[0] === 'W' && next[1] === 'W' && next[2] === 'W' && next[3] === 'W' && next[4] === 'W' && next[5] === 'W' && next[6] === 'B')||
          (prev[0] === 'W' && prev[1] === 'W' && prev[2] === 'W' && prev[3] === 'W' && prev[4] === 'W' && prev[5] === 'W' && prev[6] === 'B')
        ) {
        legal = true;
      }
    } /*End of main conditional*/
    //}
    console.log(legal);
    return legal;
  } // end of function

  createBoard();
});
