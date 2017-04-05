$(() => {
  let gameMode = '';
  let blackTiles, whiteTiles, count = 0;
  const $body = $('body');
  const keys = ['a','b','c','d','e','f','g','h'];
  const boardModel = {};
  function landingPage() {
    const $header = $(document.createElement('h1')).text('Othello');
    const $instr = $(document.createElement('p')).addClass('instr').text('Choose mode');
    const $welcome = $(document.createElement('div')).addClass('welcome');
    const ids = ['pvp', 'pvc', 'cvc'];
    const btnText = ['Player vs Player','Player vs Com','Com vs Com'];
    for (var i = 0; i < ids.length; i++) {
      $welcome.append($(document.createElement('p')).addClass('modeBtn').attr('id',ids[i]).html(btnText[i]));
    }
    $body.append($header, $instr, $welcome);
    $('.modeBtn').on('click', function(e) {
      gameMode = e.target.id;
      $('.welcome').remove();
      createBoard();
    });
  }
  function createBoard() {
    const keys = ['a','b','c','d','e','f','g','h'];
    const $scoreLeft = $(document.createElement('div')).addClass('scoreLeft');
    const $scoreRight = $(document.createElement('div')).addClass('scoreRight');
    const $titleLeft = $(document.createElement('h3')).attr('id','B').text('Black, to start');
    const $titleRight  = $(document.createElement('h3')).attr('id', 'W').text('White, go second');
    $scoreLeft.append($titleLeft);
    $scoreRight.append($titleRight);
    const $counterL = $(document.createElement('p')).attr('id', 'counterL').text('Tiles: 2');
    const $counterR = $(document.createElement('p')).attr('id', 'counterR').text('Tiles: 2');
    $scoreLeft.append($counterL);
    $scoreRight.append($counterR);
    const $main = $(document.createElement('main'));
    for (var i=0; i<keys.length; i++) {
      boardModel[keys[i]] = [];
      for (var j=0; j<keys.length; j++) {
        const $box = $(document.createElement('div')).addClass('box').attr('id', `${keys[i]}${j}`).html(`${keys[i]}${j}`);
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
  }
  function taskDist() {
    if ($('.N').length > 0) {
      if (gameMode === 'pvp') {
        $('.instr').text('Player vs Player');
        playerController();
      } else if (gameMode === 'pvc') {
        $('.instr').text('Player vs Computer');
        (count === 0 || count % 2 === 0) ? playerController() : compController();
      } else if (gameMode === 'cvc') {
        $('.instr').text('Computer vs it\'s self');
        compController();
      }
    } else hasWinner(findWinner()); // if there are no N squares left
  }
  function playerController() {
    if (anyLegalMoves(getPlayer()[0], boardModel, keys)) {
      $('.box').on('click', (e) => {
        checkInput(e, getPlayer()[0], getPlayer()[1]);
        $('.box').off();
        taskDist();
      });
    } else {
      setTimeout(function() {
        $('#'+getPlayer[0]).text('No legal moves');
        count++;
        taskDist();
      }, 1000); // display player no moves
    }
  }
  function compController() {
    setTimeout(function() {
      checkInput(undefined, getPlayer()[0], getPlayer()[1]);
      taskDist();
    }, 200); // wait 0.2 seconds before the computer makes its play
  }
  function getPlayer() {return [(count === 0 || count % 2 === 0) ? 'B' : 'W', (count === 0 || count % 2 === 0) ? 'W' : 'B'];}
  function hasWinner(winner) {$('.instr').text(`Game over, winner is ${winner}`);}
  function findWinner() {
    return (whiteTiles === blackTiles) ? 'Draw' : (whiteTiles > blackTiles) ? 'White' : 'Black'; // one line double turnary? it appears to work.
  }
  function checkInput(e, player, enemy) {
    let row, col;
    if (e) { // if e hav been delivered by a click event, either event or undefined
      if (!$(e.target).hasClass('clicked')) {
        row = e.target.id.split('')[0];
        col = parseInt(e.target.id.split('')[1]);
        count++;
        const choice = getChips(row, col, player, boardModel, keys);
        (choice.length > 0) ? play(player, enemy, row, col, choice) : count--;
      }
    } else { // if e is undefined, it was the computer that sent a request
      count++;
      const cpResponse = computerPlay(player, boardModel, keys);
      if (cpResponse.length > 0) {
        row = cpResponse.split('')[1];
        col = parseInt(cpResponse.split('')[2]);
        const choice = getChips(row, col, player, boardModel, keys);
        return (choice.length > 0) ? play(player, enemy, row, col, choice) : $('#W').text('No legal moves');
      } // else count++;
    } // hasClass 'clicked'
  } // end of check input function
  function play(player, enemy, row, col, chipsToFlip) {
    boardModel[row][col] = player;
    doFlip(enemy, player, chipsToFlip);
    numTiles();
    tileAndDOM(player, enemy, row, col);
  }
  function tileAndDOM(player, enemy, row, col) {
    const nPlayer = (player === 'W') ? 'White' : 'Black';
    const nEnemy = (player === 'W') ? 'Black' : 'White';
    $(`#${row}${col}`).removeClass('N').addClass(player+' clicked');
    $(`#${enemy}`).text(`${nEnemy}, Your turn`);
    $(`#${player}`).text(`${nPlayer} team`);
    $('#counterL').text('Tiles: '+blackTiles);
    $('#counterR').text('Tiles: '+whiteTiles);
  }
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
  function doFlip(enemy, player, chipsToFlip) {
    for (let i=0; i<chipsToFlip.length; i++) {
      if (!$(chipsToFlip[i]).hasClass('N')) {
        const thisChip = chipsToFlip[i].split('');
        boardModel[thisChip[1]][thisChip[2]] = player;
        switchClass(chipsToFlip[i], player, enemy);
      }
    }
  } // end of doFlip function
  function switchClass(squareId, player, enemy) {
    $(squareId).removeClass(enemy);
    $(squareId).addClass(player);
  }
  function getChips(row, col, player, board, keys) {
    const goodChips = [];
    const directions = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
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
        if (invalidMove(newRow, newCol, nextSquare)) {
          plane = [];
          break;
        } else if (nextSquare === player) {
          break;
        }
        if (checkLength(plane, newCol, newRow)) {
          plane = [];
          break;
        }
        plane.push(`#${newRow}${newCol}`);
      }
      if (plane.toString()) return plane;
    }).filter(Boolean);
    possiblePlanes.forEach(plane => {
      plane.forEach(id => {
        goodChips.push(id);
      });
    });
    return goodChips;
  } // end of getChips function
  function checkLength(plane, col, row) {return plane.length >= 6 && (col === 7 || col === 0 || row === 'a' || row === 'h');}
  function invalidMove(row, col, square) {return validRow(row) || validColumn(col) || emptySquare(square);}
  function validRow(row) {return typeof row === 'undefined';}
  function validColumn(col) {return col > 7 || col < 0;}
  function emptySquare(square) {return square === 'N';}
  function computerPlay(player, board, keys) {
    const thisChoice = getChoice(player, board, keys);
    return thisChoice;
  }
  function anyLegalMoves(player, board, keys) {
    const possible = getChoice(player, board, keys);
    return (possible.length > 0) ? true : false;
  }
  function getChoice(player, board, keys) { // this function is pretty procedural, but it works.
    let chipsThisTurn = [];
    let counter = 0; // the counter is the highest score for any legal move,
    const possibleSquares = [];
    const abacus = {};
    for (let i=0; i<keys.length; i++) {
      for (let j=0; j<board[keys[i]].length; j++) {
        const thisId = '#'+keys[i]+(j).toString();
        chipsThisTurn = getChips(keys[i], j, player, board, keys);
        if (chipsThisTurn.length > 0) {
          abacus[thisId] = chipsThisTurn.length;
        }
        chipsThisTurn = [];
      }
    }
    const resultKeys = Object.keys(abacus);
    for (let i=0; i<resultKeys.length; i++) {
      if (abacus[resultKeys[i]] > counter) if ($(resultKeys[i]).hasClass('N')) counter = abacus[resultKeys[i]];
    }
    for (let i=0; i<resultKeys.length; i++) {
      if (abacus[resultKeys[i]] === counter) {
        if ($(resultKeys[i]).hasClass('N')) {
          possibleSquares.push(resultKeys[i]);
        }
      }
    }
    return possibleSquares[0];
  }
  landingPage();
}); // end of document ready
