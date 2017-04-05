/* linter brace-style off */
var CP = CP;

$(() => {
  // N not assigned, B black, W white
  const keys = ['a','b','c','d','e','f','g','h'];
  const boardModel = {};
  let chipsToFlip = [];
  let legal;
  let blackTiles, whiteTiles, count = 0;
  const $counterL = $(document.createElement('p'));
  const $counterR = $(document.createElement('p'));
  const $instr = $(document.createElement('p')).addClass('instr');
  const $body = $('body');
  let gameMode = '';

  function landingPage() {
    const $header = $(document.createElement('h1'));
    $header.text('Othello');
    $instr.text('Choose mode');
    const $welcome = $(document.createElement('div')).addClass('welcome');
    const ids = ['pvp', 'pvc', 'cvc'];
    const btnText = ['Player vs Player','Player vs Com','Com vs Com'];
    for (var i = 0; i < ids.length; i++) {
      const $modeBtn = $(document.createElement('p')).addClass('modeBtn').attr('id',ids[i]).html(btnText[i]);

      $welcome.append($modeBtn);
    }
    $body.append($header, $instr, $welcome);
    $('.modeBtn').on('click', function(e) {
      gameMode = e.target.id;
      $('.welcome').remove();
      createBoard();
    });
  }

  function createBoard() {
    // gameMode = prompt('Which mode? "PvP", "PvC" or "CvC"?').toLowerCase();
    // const $header = $(document.createElement('h1'));
    // $header.text('Othello');
    const $scoreLeft = $(document.createElement('div'));
    const $scoreRight = $(document.createElement('div'));
    $scoreLeft.addClass('scoreLeft');
    $scoreRight.addClass('scoreRight');
    const $titleLeft = ($(document.createElement('h3')));
    const $titleRight  = ($(document.createElement('h3')));
    $titleLeft.attr('id','B');
    $titleRight.attr('id', 'W');
    $titleLeft.text('Black, to start');
    $titleRight.text('White, go second');
    $scoreLeft.append($titleLeft);
    $scoreRight.append($titleRight);
    $counterL.text('Tiles: 2');
    $counterR.text('Tiles: 2');
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
          $box.addClass('N'); // this conditional creates the starting squares and assigns the 'N' class
        }
        $main.append($box);
      }
    }
    $body.append($main, $scoreLeft, $scoreRight);
    taskDist();
    legal = false;
  }

  function taskDist() {
    // if (CP.anyLegalMoves(getPlayer()[0], boardModel, keys, count) && CP.anyLegalMoves(getPlayer()[1], boardModel, keys, count)) {
    if ($('.N').length > 0) {
      if (gameMode === 'pvp') {
        $instr.text('Player vs Player');
        playerController();
      } else if (gameMode === 'pvc') {
        $instr.text('Player vs Computer');
        (count === 0 || count % 2 === 0) ? playerController() : compController();
      } else if (gameMode === 'cvc') {
        $instr.text('Computer vs it\'s self');
        compController();
      }
    } else hasWinner(findWinner());
  }

  function playerController() {
    console.log('legal moves for player?'+CP.anyLegalMoves(getPlayer()[0], boardModel, keys, count));
    if (CP.anyLegalMoves(getPlayer()[0], boardModel, keys, count)) {
      $('.box').on('click', (e) => {
        checkInput(e, getPlayer()[0], getPlayer()[1]);
        $('.box').off();
        taskDist();
      });
    } else {
      setTimeout(function() {
        $('#B').text('No legal moves');
        count++;
        taskDist();
      }, 300);
    }
  }

  function compController() {
    setTimeout(function() {
      checkInput(undefined, getPlayer()[0], getPlayer()[1]);
      taskDist();
    }, 200); // wait 0.2 seconds before the computer makes its play
  }

  function getPlayer() {return [(count === 0 || count % 2 === 0) ? 'B' : 'W', (count === 0 || count % 2 === 0) ? 'W' : 'B'];}
  function hasWinner(winner) {$instr.text(`Game over, winner is ${winner}`);}
  function findWinner() {
    if (whiteTiles === blackTiles) return 'Draw';
    return (whiteTiles > blackTiles) ? 'White' : 'Black';
  }

  function checkInput(e, player, enemy) {
    let row = '';
    let col = 0;
    if (e) { // if e hav been delivered by a click event, either event or undefined
      if (!$(e.target).hasClass('clicked')) {
        row = e.target.id.split('')[0];
        col = parseInt(e.target.id.split('')[1]);
        count++;
        chipsToFlip = isLegal(row, col, player);
        // console.log('legal moves for player?'+CP.anyLegalMoves(player, boardModel, keys, count));
        (legal === true) ? play(player, enemy, row, col) : count--;
        // if (!legalMovesRemaining(player)) count++;
      }
    } else { // if e is undefined, it was the computer that sent a request
      count++;
      const cpResponse = CP.computerPlay(player, boardModel, keys, count);
      if (cpResponse.length > 0) {
        row = cpResponse.split('')[1];
        col = parseInt(cpResponse.split('')[2]);
        chipsToFlip = isLegal(row, col, player);
        return (legal === true) ? play(player, enemy, row, col) : $('#W').text('No legal moves');
      } // else count++;
    } // hasClass 'clicked'
  } // end of check input function

  function play(player, enemy, row, col) {
    boardModel[row][col] = player;
    doFlip(enemy, player, chipsToFlip);
    numTiles();
    legal = false;
    tileAndDOM(player, enemy, row, col);
  }

  function tileAndDOM(player, enemy, row, col) {
    const nPlayer = (player === 'W') ? 'White' : 'Black';
    const nEnemy = (player === 'W') ? 'Black' : 'White';
    $(`#${row}${col}`).removeClass('N');
    $(`#${row}${col}`).addClass(player+' clicked');
    $(`#${enemy}`).text(`${nEnemy}, Your turn`);
    $(`#${player}`).text(`${nPlayer} team`);
    $counterL.text('Tiles: '+blackTiles);
    $counterR.text('Tiles: '+whiteTiles);
  }
  // row= The letter of your board model
  // col= Numerical column of board model
  // current= Which player ('W'/'B') clicked
  function isLegal(row, col, current) {
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
        } else if (nextSquare === current) break;
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
    possiblePlanes.forEach(plane => {
      plane.forEach(id => {
        goodChips.push(id);
      });
    });
    return goodChips;
  } // end of isLegal function
  //
  function checkLength(plane, col, row) {return plane.length >= 6 && (col === 7 || col === 0 || row === 'a' || row === 'h');}
  function invalidMove(row, col, square) {return validRow(row) || validColumn(col) || emptySquare(square);}
  function validRow(row) {return typeof row === 'undefined';}
  function validColumn(col) {return col > 7 || col < 0;}
  function emptySquare(square) {return square === 'N';}

  function numTiles() {
    let blks = 0;
    let whts = 0;
    for (var i=0; i<keys.length; i++) {
      for (var j=0; j<boardModel[keys[i]].length; j++) {
        if (boardModel[keys[i]][j] === 'B') blks++;
        if (boardModel[keys[i]][j] === 'W') whts++;
      }
    }
    blackTiles = blks;
    whiteTiles = whts;
  }

  function doFlip(enemy, player, chipsToFlipLocal) {
    for (let i=0; i<chipsToFlipLocal.length; i++) {
      if (!$(chipsToFlipLocal[i]).hasClass('N')) {
        boardModel[chipsToFlipLocal[i].split('')[1]][chipsToFlipLocal[i].split('')[2]] = player;
        switchClass(chipsToFlipLocal[i], player, enemy);
      }
    }
    chipsToFlip = [];
  } // end of doFlip function

  function switchClass(squareId, player, enemy) {
    $(squareId).removeClass(enemy);
    $(squareId).addClass(player);
  }
  // createBoard();
  landingPage();
});
