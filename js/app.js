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
    const prev3 = boardModel[row][col-3];
    const prev4 = boardModel[row][col-4];
    const prev5 = boardModel[row][col-5];
    const prev6 = boardModel[row][col-6];
    const prev7 = boardModel[row][col-7];
    const next = boardModel[row][col+1];
    const next2 = boardModel[row][col+2];
    const next3 = boardModel[row][col+3];
    const next4 = boardModel[row][col+4];
    const next5 = boardModel[row][col+5];
    const next6 = boardModel[row][col+6];
    const next7 = boardModel[row][col+7];
    // I was checking if the clicked square was at the edge, so as only to probe in one direction
    // but I didn't need to do it. Live refactoring.
    // I mean to get rid of the check for W or B, but not bother just yet
    if (current === 'W') {
      if (
          next === 'B' || prev === 'B' && next2 === 'W' || prev2 === 'W'
        ) {
        legal = true;
      }
      if (
          (next === 'B' || prev === 'B')&&
          (next2 === 'B' || prev2 === 'B')&&
          (next3 === 'W' || prev3 === 'W')
        ) {
        legal = true;
      }
      if (
          (next === 'B' || prev === 'B')&&
          (next2 === 'B' || prev2 === 'B')&&
          (next3 === 'B' || prev3 === 'B')&&
          (next4 === 'W' || prev4 === 'W')
        ) {
        legal = true;
      }
      if (
          (next === 'B' || prev === 'B')&&
          (next2 === 'B' || prev2 === 'B')&&
          (next3 === 'B' || prev3 === 'B')&&
          (next4 === 'B' || prev4 === 'B')&&
          (next5 === 'W' || prev5 === 'W')
        ) {
        legal = true;
      }
      if (
          (next === 'B' || prev === 'B')&&
          (next2 === 'B' || prev2 === 'B')&&
          (next3 === 'B' || prev3 === 'B')&&
          (next4 === 'B' || prev4 === 'B')&&
          (next5 === 'B' || prev5 === 'B')&&
          (next6 === 'W' || prev6 === 'W')
        ) {
        legal = true;
      }
      if (
          (next === 'B' || prev === 'B')&&
          (next2 === 'B' || prev2 === 'B')&&
          (next3 === 'B' || prev3 === 'B')&&
          (next4 === 'B' || prev4 === 'B')&&
          (next5 === 'B' || prev5 === 'B')&&
          (next6 === 'B' || prev6 === 'B')&&
          (next7 === 'W' || prev7 === 'W')
        ) {
        legal = true;
      }
    } else /* Middle of main conditional */ {
      if (next === 'W' || prev === 'W' && next2 === 'B' || prev2 === 'B') {
        legal = true;
      }
      if (
          (next === 'W' || prev === 'W')&&
          (next2 === 'W' || prev2 === 'W')&&
          (next3 === 'B' || prev3 === 'B')
        ) {
        legal = true;
      }
      if (
        (next === 'W' || prev === 'W')&&
        (next2 === 'W' || prev2 === 'W')&&
        (next3 === 'W' || prev3 === 'W')&&
        (next4 === 'B' || prev4 === 'B')
        ) {
        legal = true;
      }
      if (
          (next === 'W' || prev === 'W')&&
          (next2 === 'W' || prev2 === 'W')&&
          (next3 === 'W' || prev3 === 'W')&&
          (next4 === 'W' || prev4 === 'W')&&
          (next5 === 'B' || prev5 === 'B')
        ) {
        legal = true;
      }
      if (
          (next === 'W' || prev === 'W')&&
          (next2 === 'W' || prev2 === 'W')&&
          (next3 === 'W' || prev3 === 'W')&&
          (next4 === 'W' || prev4 === 'W')&&
          (next5 === 'W' || prev5 === 'W')&&
          (next6 === 'B' || prev6 === 'B')
        ) {
        legal = true;
      }
      if (
          (next === 'W' || prev === 'W')&&
          (next2 === 'W' || prev2 === 'W')&&
          (next3 === 'W' || prev3 === 'W')&&
          (next4 === 'W' || prev4 === 'W')&&
          (next5 === 'W' || prev5 === 'W')&&
          (next6 === 'W' || prev6 === 'W')&&
          (next7 === 'B' || prev7 === 'B')
        ) {
        legal = true;
      }
    } /*End of main conditional*/
    //}
    console.log(legal);
    // return legal;
  } // end of function
  function checkCol(e, row, col, current) {

  }
  function checkDiag(e, row, col, current) {

  }

  createBoard();
});
