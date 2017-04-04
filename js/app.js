var CP = CP;

$(() => {
  // N not assigned, B black, W white
  const keys = ['a','b','c','d','e','f','g','h'];
  const boardModel = {};
  let count = 0;
  let chipsToFlip = [];
  let legal;
  let blackTaken = 0;
  let whiteTaken = 0;
  let blackTiles = 0;
  let whiteTiles = 0;
  const $counterL = $(document.createElement('p'));
  const $counterR = $(document.createElement('p'));
  let gameMode = '';
  //var boardModel = {
  //  this is what the starting board looks like
  //  I'm keeping it here to help visualise the board
  // 'a': ['N','N','N','N','N','N','N','N'],
  // 'b': ['N','N','N','N','N','N','N','N'],
  // 'c': ['N','N','N','N','N','N','N','N'],
  // 'd': ['N','N','N','W','B','N','N','N'],
  // 'e': ['N','N','N','B','W','N','N','N'],
  // 'f': ['N','N','N','N','N','N','N','N'],
  // 'g': ['N','N','N','N','N','N','N','N'],
  // 'h': ['N','N','N','N','N','N','N','N']
  //        0   1   2   3   4   5   6   7
  // };
  function createBoard() {
    console.log('Initialized');
    gameMode = 'pvc';
    // gameMode = prompt('Which mode? "PvP", "PvC" or "CvC"?').toLowerCase();
    const $body = $('body');
    const $header = $(document.createElement('h1'));
    const $instr = $(document.createElement('p'));
    $header.text('Othello');
    if (gameMode === 'pvp') {
      $instr.text('Player vs Player');
    }
    if (gameMode === 'pvc') {
      $instr.text('Player vs Computer');
    }
    if (gameMode === 'cvc') {
      $instr.text('Computer vs it\'s self');
    }
    const $scoreLeft = $(document.createElement('div'));
    const $scoreRight = $(document.createElement('div'));
    $scoreLeft.addClass('scoreLeft');
    $scoreRight.addClass('scoreRight');
    const $titleLeft = ($(document.createElement('h3')));
    const $titleRight  = ($(document.createElement('h3')));
    $titleLeft.addClass('left');
    $titleRight.addClass('right');
    $titleLeft.text('Black, to start');
    $titleRight.text('White, go second');
    $scoreLeft.append($titleLeft);
    $scoreRight.append($titleRight);
    $counterL.text('Tiles: 2 Taken: '+blackTaken);
    $counterR.text('Tiles: 2 Taken: '+whiteTaken);
    $scoreLeft.append($counterL);
    $scoreRight.append($counterR);
    const $main = $(document.createElement('main'));
    for (var i=0; i<keys.length; i++) {
      boardModel[keys[i]] = [];
      for (var j=0; j<keys.length; j++) {
        const $box = $(document.createElement('div'));
        $box.addClass('box');
        $box.attr('id', `${keys[i]}${j}`);
        $box.html(`${keys[i]}${j}`);
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
    $body.append($header, $instr, $main, $scoreLeft, $scoreRight);
    if (gameMode === 'pvp') {
      PvPController();
    } else if (gameMode === 'pvc') {
      PvCTimer();
    } else if (gameMode === 'cvc') {
      CvCTimer();
    }
    legal = false;
  }

  // these three functions handle the different play modes kind of.

  function CvCTimer() {
    if (count === 0 || count % 2 === 0) {
      setTimeout(function() {
        PorC(undefined, 'B', 'W');
        CvCTimer();
      }, 300);
    } else {
      setTimeout(function() {
        PorC(undefined, 'W', 'B');
        CvCTimer();
      }, 300);
    }
  }

  function PvCTimer() {
    if (count === 0 || count % 2 === 0) {
      $('.box').on('click', function(e) {
        PorC(e, 'B', 'W');
        $('.box').off();
        PvCTimer();
      });
    } else {
      setTimeout(function() {
        PorC(undefined, 'W', 'B');
        PvCTimer();
      }, 500);
    }
  }

  function PvPController() { // not a timer
    if (count === 0 || count % 2 === 0) {
      $('.box').on('click', (e) => {
        PorC(e, 'B', 'W');
        $('.box').off();
        PvPController();
      });
    } else {
      $('.box').on('click', (e) => {
        PorC(e, 'W', 'B');
        $('.box').off();
        PvPController();
      });
    }
  }

  function PorC(e, player, enemy) {
    let row = '';
    let col = 0;
    if (e) {
      if (!$(e.target).hasClass('clicked')) {
        row = e.target.id.split('')[0];
        col = parseInt(e.target.id.split('')[1]);
        count++;
        isLegal(row, col, player);
        if (legal === true) {
          play(player, enemy, row, col);
        } else {
          count--;
        }
      }
    } else {
      count++;
      const cpResponse = CP.computerPlay(player, boardModel, keys, count);
      console.log();
      row = cpResponse.split('')[1];
      col = parseInt(cpResponse.split('')[2]);
      isLegal(row, col, player);
      if (legal === true) {
        play(player, enemy, row, col);
      }
    } // hasClass 'clicked'
  } // end of PvC function
  function play(player, enemy, row, col) {
    boardModel[row][col] = player;
    doFlip(enemy, player, chipsToFlip);
    blackTiles = numTiles('B');
    whiteTiles = numTiles('W');
    $(`#${row}${col}`).removeClass('N');
    $(`#${row}${col}`).addClass(player+' clicked');
    legal = false;
    $('.right').text('White, Your turn');
    $('.left').text('Black team');
    $counterL.text('Tiles: '+blackTiles+' Taken: '+whiteTaken);
    $counterR.text('Tiles: '+whiteTiles+' Taken: '+blackTaken);
  }
  // row= The letter of your board model
  // col= Numerical column of board model
  // current= Which player ('W'/'B') clicked
  function isLegal(row, col, current) {
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
        // Currently keys are an array of letters
        // So we need to find the rows' index
        const rowIndex   = keys.indexOf(newRow);
        // Find the new row & column
        newRow           = keys[rowIndex + rowChange];
        newCol           = newCol + colChange;
        // Find the value of the next square
        const nextSquare = boardModel[newRow] ? boardModel[newRow][newCol] : undefined;

        if (invalidMove(newRow, newCol, nextSquare)) {
          plane = [];
          break;
        } else if (nextSquare === current) {
          break;
        }
        // I'm pretty sure this works properly, preventing certain illegal moves, alowing other legal moves
        if (checkLength(plane, newCol, newRow)) {
          plane = [];
          break;
        }
        plane.push(`#${newRow}${newCol}`);
      }
      if (plane.toString()) return plane;
    }).filter(Boolean);

    // Could remove this legal flag?
    if (possiblePlanes.toString()) legal = true;

    possiblePlanes.forEach(flipPlanes);
  } // end of isLegal function

  function checkLength(plane, col, row) {
    return plane.length >= 6 && (col === 7 || col === 0 || row === 'a' || row === 'h');
  }

  function invalidMove(row, col, square) {
    return validRow(row) || validColumn(col) || emptySquare(square);
  }

  function validRow(row) {
    return typeof row === 'undefined';
  }

  function validColumn(col) {
    return col > 7 || col < 0;
  }

  function emptySquare(square) {
    return square === 'N';
  }

  function flipPlanes(plane) {
    plane.forEach(id => {
      chipsToFlip.push(id);
    });
  }

  function numTiles(player) {
    let num = 0;
    for (var i=0; i<keys.length; i++) {
      for (var j=0; j<boardModel[keys[i]].length; j++) {
        if (boardModel[keys[i]][j] === player) {
          num += 1;
        }
      }
    }
    return num;
  }

  function doFlip(enemy, player, chipsToFlipLocal) {
    for (let i=0; i<chipsToFlipLocal.length; i++) {
      if (!$(chipsToFlipLocal[i]).hasClass('N')) {
        if (player === 'B') whiteTaken++;
        if (player === 'W') blackTaken++;
        boardModel[chipsToFlipLocal[i].split('')[1]][chipsToFlipLocal[i].split('')[2]] = player;
        $(chipsToFlipLocal[i]).removeClass(enemy);
        $(chipsToFlipLocal[i]).addClass(player);
      }
    }

    chipsToFlip = [];
  } // end of doFlip function

  createBoard();
});
