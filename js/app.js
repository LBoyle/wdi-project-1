$(() => {
  // N not assigned, B black, W white
  const keys = ['a','b','c','d','e','f','g','h'];
  let winCons = {};
  let count = 0;
  //var winCons = {
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
    //        0   1   2   3   4   5   6   7
  //}; // will eventually use a double loop to create these I guess

  function createBoard() {
    console.log('worked');
    const $body = $('body');
    const $header = $(document.createElement('h1'));
    $header.text('Othello');
    const $main = $(document.createElement('main'));
    for (var i=0; i<keys.length; i++) {
      winCons[keys[i]] = [];
      for (var j=0; j<8; j++) {
        const $box = $(document.createElement('div'));
        $box.addClass('box');
        $box.attr('id', `${keys[i]}${j}`);
        winCons[keys[i]][j] = 'N';
        if ((keys[i] === 'd' && j === 4)||(keys[i] === 'e' && j === 3)) {
          winCons[keys[i]][j] = 'B';
          $box.addClass('B clicked');
        } else if ((keys[i] === 'd' && j === 3)||(keys[i] === 'e' && j === 4)) {
          winCons[keys[i]][j] = 'W';
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
    if (!$(e.target).hasClass('clicked')) {
      count++;
      console.log(`click count is ${count}`);
      if (count === 0 || count%2 === 0) {
        $(e.target).addClass('W clicked');
      } else {
        $(e.target).addClass('B clicked');
      }
    }
  }

  createBoard();
});
