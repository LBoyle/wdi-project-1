$(() => {
  // N not assigned, B black, W white
  const keys = ['a','b','c','d','e','f','g','h'];
  const boardModel = {};
  let count = 0;
  const chipsToFlip = [];
  let legal;
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
    legal = false;
  }
  function clickHandler(e) {
    // if this box hasn't been clicked yet
    if (!$(e.target).hasClass('clicked')) {
      const row = e.target.id.split('')[0];
      const col = parseInt(e.target.id.split('')[1]);
      count++;
      // console.log(`click count is ${count}`);
      if (count === 0 || count % 2 === 0) {
        isLegal(e, row, col, 'W');
        if (legal === true) {
        // isLegal(e, row, col, 'W');
          boardModel[row][col] = 'W';
          doFlip('B','W');
          $(e.target).removeClass('N');
          $(e.target).addClass('W clicked');
          legal = false;
        } else {
          count--;
        }
        console.log(count);
      } else {
        isLegal(e, row, col, 'B');
        if (legal === true) {
        // isLegal(e, row, col, 'B');
          boardModel[row][col] = 'B';

          doFlip('W','B');
          $(e.target).removeClass('N');
          $(e.target).addClass('B clicked');
          legal = false;
        } else {
          count--;
        }
        console.log(count);
      }
    } // hasClass 'clicked'
  } // end of clickHandler function

  function isLegal(e, row, col, current) {
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
    // if (
      // only one of these must return true for player to place
      // I can now use the same one function to check all directions
    checkBoard(e, row, col, current, prevRowData, nextRowData, 'h');
    checkBoard(e, row, col, current, prevColData, nextColData, 'v');
    checkBoard(e, row, col, current, tlTobrPrevData, tlTobrNextData, 'd1');
    checkBoard(e, row, col, current, blTotrPrevData, blTotrNextData, 'd2');
  }

  function pushChips(plane, num, dir, row, col, player) {
    // num is number of blocks to be taken
    for (let i=0; i<num; i++) {
      if (plane === 'h') {
        if (dir === 'neg') {
          chipsToFlip.push('#'+row+(col-(i+1)).toString());
          boardModel[row][col-(i+1)] = player;
        }
        if (dir === 'pos') {
          chipsToFlip.push('#'+row+(col+(i+1)).toString());
          boardModel[row][col+(i+1)] = player;
        }
      }
      if (plane === 'v') {
        if (dir === 'neg') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)-(i+1)])+(col).toString());
          boardModel[keys[keys.indexOf(row)-(i+1)]][col] = player;
        }
        if (dir === 'pos') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)+(i+1)])+(col).toString());
          boardModel[keys[keys.indexOf(row)+(i+1)]][col] = player;
        }
      }
      if (plane === 'd1') {
        if (dir === 'neg') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)-(i+1)])+(col-(i+1)).toString());
          boardModel[keys[keys.indexOf(row)-(i+1)]][col-(i+1)] = player;
        }
        if (dir === 'pos') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)+(i+1)])+(col+(i+1)).toString());
          boardModel[keys[keys.indexOf(row)+(i+1)]][col+(i+1)] = player;
        }
      }
      if (plane === 'd2') {
        if (dir === 'neg') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)+(i+1)])+(col-(i+1)).toString());
          boardModel[keys[keys.indexOf(row)+(i+1)]][col-(i+1)] = player;
        }
        if (dir === 'pos') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)-(i+1)])+(col+(i+1)).toString());
          boardModel[keys[keys.indexOf(row)-(i+1)]][col+(i+1)] = player;
        }
      }
    } // end of loop
  } // end of pushChips function

  function doFlip(enemy, player) {
    for (let i=0; i<chipsToFlip.length; i++) {
      if (!$(chipsToFlip[i]).hasClass('N')) {
        $(chipsToFlip[i]).removeClass(enemy);
        $(chipsToFlip[i]).addClass(player);
      }
    }
    for (let i=chipsToFlip.length; i>=0; i--) {
      chipsToFlip.pop([i]);
    }
  } // end of doFlip function

  // I've rigged this function to do horizontal, vertical or diagonal checks based on input
  function checkBoard(e, row, col, player, prev, next, plane) {
    let enemy = '';
    if (player === 'B') {
      enemy = 'W';
    }else {
      enemy = 'B';
    }
    if (next[0] === enemy && next[1] === player) {
      legal = true;
      pushChips(plane, 1, 'pos', row, col, player);
    }
    if (prev[0] === enemy && prev[1] === player) {
      legal = true;
      pushChips(plane, 1, 'neg', row, col, player);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === player) {
      legal = true;
      pushChips(plane, 2, 'pos', row, col, player);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === player) {
      legal = true;
      pushChips(plane, 2, 'neg', row, col, player);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === player) {
      legal = true;
      pushChips(plane, 3, 'pos', row, col, player);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === player) {
      legal = true;
      pushChips(plane, 3, 'neg', row, col, player);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === enemy && next[4] === player) {
      legal = true;
      pushChips(plane, 4, 'pos', row, col, player);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === enemy && prev[4] === player) {
      legal = true;
      pushChips(plane, 4, 'neg', row, col, player);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === enemy && next[4] === enemy && next[5] === player) {
      legal = true;
      pushChips(plane, 5, 'pos', row, col, player);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === enemy && prev[4] === enemy && prev[5] === player) {
      legal = true;
      pushChips(plane, 5, 'neg', row, col, player);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === enemy && next[4] === enemy && next[5] === enemy && next[6] === player) {
      legal = true;
      pushChips(plane, 6, 'pos', row, col, player);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === enemy && prev[4] === enemy && prev[5] === enemy && prev[6] === player) {
      legal = true;
      pushChips(plane, 6, 'neg', row, col, player);
    }
    // I figure I'll change the colors in this function
    // rather than make a whole new function, the data is already here to work with
    // return legal;
  } // end of function

  createBoard();
});
