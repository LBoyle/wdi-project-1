$(() => {
  // N not assigned, B black, W white
  const keys = ['a','b','c','d','e','f','g','h'];
  const boardModel = {};
  let count = 0;
  //var boardModel = {
  //  this is what the starting board looks like
  //  I'm keeping it here for my working, to visualise the board
  //   'a': ['N','N','N','N','N','N','N','N'],
  //   'b': ['N','N','N','N','N','N','N','N'],
  //   'c': ['N','N','N','N','N','N','N','N'],
  //   'd': ['N','N','N','W','B','N','N','N'],
  //   'e': ['N','N','N','B','W','N','N','N'],
  //   'f': ['N','N','N','N','N','N','N','N'],
  //   'g': ['N','N','N','N','N','N','N','N'],
  //   'h': ['N','N','N','N','N','N','N','N']
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
//        if (isLegal(e, row, col, 'W')) {
        isLegal(e, row, col, 'W');
        boardModel[row][col] = 'W';
        $(e.target).addClass('W clicked');
//        }
      } else {
//        if (isLegal(e, row, col, 'B')) {
        isLegal(e, row, col, 'B');
        boardModel[row][col] = 'B';
        $(e.target).addClass('B clicked');
//        }
      }
      // captureFunction goes here inside isLegal conditional
    }
  }

  function isLegal(e, row, col, current) {
    //return (checkRow(e) || checkCol(e) || checkDiag(e)) ? true : false;
    checkRow(e, row, col, current);
    checkCol(e, row, col, current);
    checkDiag(e, row, col, current);
  }
  // so I couldn't really plan this checkRow function, first one I wrote
  // I used the console to get small piece working at a time
  function checkRow(e, row, col, current) {
    let legal = false;
    const prev = boardModel[row][col-1];
    const prev2 = boardModel[row][col-2];
    const next = boardModel[row][col+1];
    const next2 = boardModel[row][col+2];
    if (next === undefined) { // Right edge
      if (current === 'W') {
        if (prev === 'B' && prev2 === 'W') {
          legal = true;
        }
      } else {
        if (prev === 'W' && prev2 === 'B') {
          legal = true;
        }
      }
    } else if(prev === undefined) { // Left edge
      if (current === 'W') {
        if (next === 'B' && next2 === 'W') {
          legal = true;
        }
      } else {
        if (next === 'W' && next2 === 'B') {
          legal = true;
        }
      }
    } else { // Not the edge
      console.log(prev2, prev, current, next, next2);
      console.log('not the edge');
      if (current === 'W') {
        if ((next === 'B' || prev === 'B')&&(next2 === 'W' || prev2 === 'W')) {
          legal = true;
        }
      } else {
        if ((next === 'W' || prev === 'W')&&(next2 === 'B' || prev2 === 'B')) {
          legal = true;
        }
      }
    }
    console.log(legal);
    // return legal;
  }
  function checkCol(e, row, col, current) {

  }
  function checkDiag(e, row, col, current) {

  }

  createBoard();
});
