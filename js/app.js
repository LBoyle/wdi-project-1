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
    gameMode = 'pvp';
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
        CvC('B', 'W');
        CvCTimer();
      }, 100);
    } else {
      setTimeout(function() {
        CvC('W', 'B');
        CvCTimer();
      }, 100);
    }
  }

  function PvCTimer() {
    if (count === 0 || count % 2 === 0) {
      $('.box').on('click', function(e) {
        PvC(e, 'B', 'W');
        $('.box').off();
        PvCTimer();
      });
    } else {
      setTimeout(function() {
        CvC('W', 'B');
        PvCTimer();
      }, 500);
    }
  }

  function PvPController() { // not a timer
    if (count === 0 || count % 2 === 0) {
      $('.box').on('click', (e) => {
        PvC(e, 'B', 'W');
        $('.box').off();
        PvPController();
      });
    } else {
      $('.box').on('click', (e) => {
        PvC(e, 'W', 'B');
        $('.box').off();
        PvPController();
      });
    }
  }

  // CvC, handles the computers' turn, and updates the DOM and boardModel

  function CvC(player, enemy) {
    count++;
    const cpResponse = CP.computerPlay(player, boardModel, keys, count);
    const row = cpResponse.split('')[1];
    const col = parseInt(cpResponse.split('')[2]);
    isLegal(row, col, player);
    if (legal === true) {
      boardModel[row][col] = player;
      doFlip(enemy, player, chipsToFlip);
      whiteTiles = numTiles('W');
      blackTiles = numTiles('B');
      $(cpResponse).removeClass('N');
      $(cpResponse).addClass(player+' clicked');
      legal = false;
      $('.left').text('Black team');
      $('.right').text('White team');
      $counterR.text('Tiles: '+whiteTiles+' Taken: '+blackTaken);
      $counterL.text('Tiles: '+blackTiles+' Taken: '+whiteTaken);
    }
  } // end of CvC function

  // PvC, changed now to handle the players turn and update DOM

  function PvC(e, player, enemy) {
    if (!$(e.target).hasClass('clicked')) {
      const row = e.target.id.split('')[0];
      const col = parseInt(e.target.id.split('')[1]);
      count++;
      isLegal(row, col, player);
      if (legal === true) {
        boardModel[row][col] = player;
        doFlip(enemy, player, chipsToFlip);
        blackTiles = numTiles('B');
        whiteTiles = numTiles('W');
        $(e.target).removeClass('N');
        $(e.target).addClass(player+' clicked');
        legal = false;
        $('.right').text('White, Your turn');
        $('.left').text('Black team');
        $counterL.text('Tiles: '+blackTiles+' Taken: '+whiteTaken);
        $counterR.text('Tiles: '+whiteTiles+' Taken: '+blackTaken);
      } else {
        count--;
      }
      // }
    } // hasClass 'clicked'
  } // end of PvC function

  // row= The letter of your board model
  // col= Numerical column of board model
  // current= Which player ('W'/'B') clicked
  function isLegal(row, col, current) {
    // Find possible planes
    // In terms of [row, col]
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

    const options = directions.map(direction => {
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
        const nextSquare = boardModel[newRow][newCol];

        // Display options using border
        // $(`#${newRow}${newCol}`).css('border-color', 'red');
        // setTimeout(() => {
        //   $(`#${newRow}${newCol}`).css('border-color', 'black');
        // }, 500);

        // if (!newRow || newCol > 7 || newCol < 0) continue;
        // ^^ didn't work, reassigning plane and break;ing seems to work fine
        if (invalidMove(newRow, newCol, nextSquare)) {
        // if (typeof newRow === 'undefined' || newCol > 7 || newCol < 0 || nextSquare === 'N') {
          plane = [];
          break;
        } else if (nextSquare === current) {
          break;
        }
        plane.push(`#${newRow}${newCol}`);
      }
      if (plane.toString()) return plane;
    }).filter(Boolean);

    // Could remove this legal flag?
    if (options.toString()) legal = true;

    options.forEach(pane => {
      pane.forEach(id => {
        chipsToFlip.push(id);
      });
    });

  } // end of isLegal function

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


  ////////////////////////////////////////////////////////
  // I'm putting back the old logic for now because it works better and I'm sort of proud of it

  function isLegal2(row, col, current) {
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
    // changed to push all legal blocks to chipsToFilp to be flipped
    // this function returns nothing
    // I can now use the same one function to check all directions
    checkBoardC(row, col, current, prevRowData, nextRowData, 'h');
    checkBoardC(row, col, current, prevColData, nextColData, 'v');
    checkBoardC(row, col, current, tlTobrPrevData, tlTobrNextData, 'd1');
    checkBoardC(row, col, current, blTotrPrevData, blTotrNextData, 'd2');
  }

  // I've rigged this function to do horizontal, vertical or diagonal checks based on input
  // checkBoardC(e, row, col, current, blTotrPrevData, blTotrNextData, 'd2');
  function checkBoardC(row, col, player, prev, next, plane) {
    let enemy = '';
    if (player === 'B') {
      enemy = 'W';
    }else {
      enemy = 'B';
    }
    if (next[0] === enemy && next[1] === player) {
      legal = true;
      pushChipsC(plane, 1, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === player) {
      legal = true;
      pushChipsC(plane, 1, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === player) {
      legal = true;
      pushChipsC(plane, 2, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === player) {
      legal = true;
      pushChipsC(plane, 2, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === player) {
      legal = true;
      pushChipsC(plane, 3, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === player) {
      legal = true;
      pushChipsC(plane, 3, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === enemy && next[4] === player) {
      legal = true;
      pushChipsC(plane, 4, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === enemy && prev[4] === player) {
      legal = true;
      pushChipsC(plane, 4, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === enemy && next[4] === enemy && next[5] === player) {
      legal = true;
      pushChipsC(plane, 5, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === enemy && prev[4] === enemy && prev[5] === player) {
      legal = true;
      pushChipsC(plane, 5, 'neg', row, col);
    }
    if (next[0] === enemy && next[1] === enemy && next[2] === enemy && next[3] === enemy && next[4] === enemy && next[5] === enemy && next[6] === player) {
      legal = true;
      pushChipsC(plane, 6, 'pos', row, col);
    }
    if (prev[0] === enemy && prev[1] === enemy && prev[2] === enemy && prev[3] === enemy && prev[4] === enemy && prev[5] === enemy && prev[6] === player) {
      legal = true;
      pushChipsC(plane, 6, 'neg', row, col);
    }
  } // end of checkBoard function

  // pushChipsC(plane, 1, 'pos', row, col);
  function pushChipsC(plane, num, dir, row, col) {
    // num is number of blocks to be taken
    for (let i=0; i<num; i++) {
      if (plane === 'h') {
        if (dir === 'neg') {
          chipsToFlip.push('#'+row+(col-(i+1)).toString());
        }
        if (dir === 'pos') {
          chipsToFlip.push('#'+row+(col+(i+1)).toString());
        }
      }
      if (plane === 'v') {
        if (dir === 'neg') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)-(i+1)])+(col).toString());
        }
        if (dir === 'pos') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)+(i+1)])+(col).toString());
        }
      }
      if (plane === 'd1') {
        if (dir === 'neg') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)-(i+1)])+(col-(i+1)).toString());
        }
        if (dir === 'pos') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)+(i+1)])+(col+(i+1)).toString());
        }
      }
      if (plane === 'd2') {
        if (dir === 'neg') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)+(i+1)])+(col-(i+1)).toString());
        }
        if (dir === 'pos') {
          chipsToFlip.push('#'+(keys[keys.indexOf(row)-(i+1)])+(col+(i+1)).toString());
        }
      }
    } // end of loop
  } // end of pushChips function

  createBoard();
});
