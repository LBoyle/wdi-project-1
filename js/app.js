$(() => {
  let gameMode = ''; // some global variables I haven't gotten rid of
  let blackTiles, whiteTiles, count = 0; // track scores and whose turn it is
  const $body = $('body'); // grab the body
  const keys = ['a','b','c','d','e','f','g','h']; // list of the keys for the boardModel and IDs
  const boardModel = {}; // a model of the board right now, updated every turn
  function landingPage() { // that screen where you choose the game mode
    const $header = $('<h1>').text('Othello / Reversi');
    const $instr = $('<p>', {class: 'instr'}).text('Logical JavaScript');
    const $welcome = $('<div>', {class: 'welcome'}); // make some stuff, I like jQuery
    const ids = ['pvp', 'pvc', 'cvc']; ////////////////// ids for mode buttons
    const btnText = ['Player vs Player','Player vs Com','Com vs Com']; // text to display in mode buttons
    for (var i = 0; i < ids.length; i++) { // create three buttons
      $welcome.append($('<p>', {class: 'modeBtn', id: ids[i]}).html(btnText[i])); // apply text and id
    }
    $body.append($header, $instr, $welcome); // append all this new stuff to the body, in order
    $('.modeBtn').on('click', function(e) { // wait for the user to make a choice
      gameMode = e.target.id; // the id is checked in the task distributor function
      $('.welcome').remove(); // get rid of the whole welcome screen
      createBoard(); // initiate the game
    });
  }
  function createBoard() {
    const $scoreLeft = $('<div>', {class: 'scoreLeft'}); // create DOM elements to be manipulated
    const $scoreRight = $('<div>', {class: 'scoreRight'});
    const $titleLeft = $('<h3>', {id: 'B'}).text('Black, to start');
    const $titleRight  = $('<h3>', {id: 'W'}).text('White, go second');
    const $counterL = $('<p>', {id: 'counterL'}).text('Tiles: 2');
    const $counterR = $('<p>', {id: 'counterR'}).text('Tiles: 2');
    $scoreLeft.append($titleLeft, $counterL);
    $scoreRight.append($titleRight, $counterR); // join them all together
    const boardSize = (keys.length*50)+(keys.length*2); // allows for adaptive size, like 9x9 grid etc, not recommended, the logic still has magic numbers, the init squares are no longer in the center
    const $main = $('<main>', {width: boardSize, height: 'auto'}); // create the box that holds the game board
    for (var i=0; i<keys.length; i++) { // first loop through keys
      boardModel[keys[i]] = []; // make a space in the dictionary for each key
      for (var j=0; j<keys.length; j++) { // then loop through 8 to create each square
        const $box = $('<div>', {class: 'box', id: `${keys[i]}${j}`}); // .html(`${keys[i]}${j}`); // make each box
        const $chip = $('<div>', {class: 'chip', id: `${keys[i]}${j}chip`});
        boardModel[keys[i]][j] = 'N'; // update the squares, init them all and 'N'ot assigned
        if ((keys[i] === 'd' && j === 4)||(keys[i] === 'e' && j === 3)) {
          boardModel[keys[i]][j] = 'B'; // the center four squares are always this position
          $box.addClass('B clicked'); // can't click squares with pieces on them
        } else if ((keys[i] === 'd' && j === 3)||(keys[i] === 'e' && j === 4)) {
          boardModel[keys[i]][j] = 'W'; // do the same for the white squares
          $box.addClass('W clicked');
        } else $box.addClass('N'); // this conditional creates the starting squares and assigns the 'N' class
        $box.append($chip);
        $main.append($box); // append each box to the game board
      }
    }
    $body.append($main, $scoreLeft, $scoreRight); // append the new stuff to the body in order
    taskDist(); // call task distributor that calls its self until a win
  }
  function taskDist() { // this move switches game modes as chosen py the user
    if ($('.N').length > 0) { // if there are free playable squares,
      $('main:hover').css('cursor', 'url("img/othello-'+getPlayer()[0]+'.png"), auto');
      $('.legal').removeClass('legal');
      if (gameMode === 'pvp') {
        $('.instr').text('Player vs Player'); // these update the DOM
        playerController(); // call the function that handles players only
      } else if (gameMode === 'pvc') {
        $('.instr').text('Player vs Computer'); // switch between player and com based on count
        (count === 0 || count % 2 === 0) ? playerController() : compController();
      } else if (gameMode === 'cvc') {
        $('.instr').text('Computer vs it\'s self');
        compController(); // this function sets the computer running
      }
    } else hasWinner(findWinner()); // if there are no N squares left the game is over
  } // don't know for certain about a win condition with empty sqares remaining, i think it's possible
  function playerController() { // not for computers
    const legals = anyLegalMoves(getPlayer()[0], boardModel, keys, true); // isPlayer === true
    if (legals.length > 0) { // returns boolean to find if player has legal moves
      $('.box').on('click', (e) => { // click event on all squares
        checkInput(e, getPlayer()[0], getPlayer()[1]); // run the game logic, [0] is player [1] is enemy
        $('.box').off(); // disable the click event so player can't interrupt the computer
        taskDist(); // call the parent function again to wait for input
      });
    } else {
      $('#'+getPlayer()[0]).text('No legal moves'); // tell the player why they don't get a turn
      count++; // skip this players turn if there are no legal moves, not tested because it's hard to pull off
      taskDist(); // call the parent function again to wait for input
    }
  }
  function compController() { // this initiates a turn for the computer
    const legals = anyLegalMoves(getPlayer()[0], boardModel, keys, true); // isPlayer === true
    if (legals.length > 0) { // returns boolean to find if player has legal moves
      setTimeout(function() { // set a timer so people don't feel like it's taking the piss, maybe it's thinking
        checkInput(undefined, getPlayer()[0], getPlayer()[1]); // game logic again
        taskDist(); // call the parent function again to wait for input
      }, 500); // wait 0.2 seconds before the computer makes its play
    } else {
      $('#'+getPlayer()[0]).text('No legal moves');
      count++;
      taskDist();
    }
  }
  function getPlayer() {return [(count === 0 || count % 2 === 0) ? 'B' : 'W', (count === 0 || count % 2 === 0) ? 'W' : 'B'];} // find out whose turn it is, could probably refactor to use this more
  function hasWinner(winner) {$('.instr').text(`Game over, winner is ${winner}`);} // update the DOM with winner
  function findWinner() { // find the winner or if it's a draw
    return (whiteTiles === blackTiles) ? 'Draw' : (whiteTiles > blackTiles) ? 'White' : 'Black';
  }
  function checkInput(e, player, enemy) { // this function differentiates between player and computer
    let row, col;
    if (e) { // if e has been delivered by a click event, it was the user, if e is undefined it's the com
      if (!$(e.target).hasClass('clicked')) { // check if it's an N square
        row = e.target.id.split('')[0]; // convert the id of the clicked square to row and col
        col = parseInt(e.target.id.split('')[1]);
        count++; // initially increment
        const chipsToFlip = getChips(row, col, player, boardModel, keys); // check the user choice
        (chipsToFlip.length > 0) ? play(player, enemy, row, col, chipsToFlip) : count--;
      } // ^^ either play if chosen square is valid, or do nothing and wait for another click
    } else { // if e is undefined, it was the computer that sent a request
      count++; // always increment the count because com never misclicks
      const cpResponse = computerPlay(player, boardModel, keys); // this is whichever square the computer has chosen
      if (cpResponse.length > 0) {
        row = cpResponse.split('')[1]; // I convert the com choice id to coordinates here
        col = parseInt(cpResponse.split('')[2]);
        const chipsToFlip = getChips(row, col, player, boardModel, keys); // check com choice the same as for players
        return (chipsToFlip.length > 0) ? play(player, enemy, row, col, chipsToFlip) : count--; // this return either plays the computers choice or skips a turn
      }
    } // hasClass 'clicked'
  } // end of check input function
  function play(player, enemy, row, col, chipsToFlip) {
    if (!$(`#${row}${col}`).hasClass('clicked')) {
      boardModel[row][col] = player; // update the local boardModel with the recently placed chip
      doFlip(enemy, player, chipsToFlip); // flip the chips
      numTiles(); // update the scores
      tileAndDOM(player, enemy, row, col); // see below
    } else count--;
  }
  function tileAndDOM(player, enemy, row, col) {
    const nPlayer = (player === 'W') ? 'White' : 'Black'; // switch B to Black because I'm gonna use them
    const nEnemy = (player === 'W') ? 'Black' : 'White';
    $(`#${row}${col}`).removeClass('N').addClass(player+' clicked'); // change the color and block further clicks
    $(`#${enemy}`).text(`${nEnemy}, Your turn`);
    $(`#${player}`).text(`${nPlayer} team`); // say whose turn it is
    $('#counterL').text('Tiles: '+blackTiles);
    $('#counterR').text('Tiles: '+whiteTiles); // update both tile counters every turn
  }
  function numTiles() { // this retrieves the numer of tiles at any time for each player
    let blks = 0; // increment these ones
    let whts = 0;
    for (var i=0; i<keys.length; i++) {
      for (var j=0; j<boardModel[keys[i]].length; j++) {
        if (boardModel[keys[i]][j] === 'B') blks++;
        if (boardModel[keys[i]][j] === 'W') whts++;
      }
    }
    blackTiles = blks; // update the global versions
    whiteTiles = whts; // not incrementing, reassigning
  }
  function doFlip(enemy, player, chipsToFlip) { // chipsToFlip === getChips()
    for (let i=0; i<chipsToFlip.length; i++) {
      if (!$(chipsToFlip[i]).hasClass('N')) { // just to be absolutely sure
        const thisChip = chipsToFlip[i].split(''); // array of ['#',key,row] for the boardModel
        boardModel[thisChip[1]][thisChip[2]] = player; // update said boardModel
        switchClass(chipsToFlip[i], player, enemy); // switches chips from enemy to player
      }
    }
  } // end of doFlip function
  function switchClass(squareId, player, enemy) { // does what it says on the tin, jQuery is simple enough
    // const rowCol = sdquareId.split('');
    $(squareId).removeClass(enemy).addClass(player);
  }
  function getChips(row, col, player, board, keys) { // this one written by Alex, I watched intently
    const goodChips = []; // I have changed it a bit, I want to return the chipsToFlip
    const directions = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]]; // N, NE, E, SE, S, SW, W, NE
    // These directions represent how far you have to go to get to the next square
    const possiblePlanes = directions.map(direction => { // array.map() returns a list
      const rowChange = direction[0];
      const colChange = direction[1]; // how much row and col will change each loop
      let plane  = []; // holds the axis for each loop that will be checked for takeable pieces
      let newRow = row; // declare these outside the loop so it can scan along an axis
      let newCol = col;
      for (let j = 0; j < keys.length-1; j++) { // limit to 6 pieces takeable on any one axis, will stop scanning if there are no takeable pieces adjacent
        const rowIndex   = keys.indexOf(newRow); // because I used letters instead of nubmers in boardModel
        newRow           = keys[rowIndex + rowChange]; // apply the change for this loop to move along the axis
        newCol           = newCol + colChange; // apply the change for this loop to move along the axis
        const nextSquare = board[newRow] ? board[newRow][newCol] : undefined; // sometimes reading an object using undefined as a key or index returns an error
        // also ^^ return 'N', 'B' or 'W', next square along the axis
        if (invalidMove(newRow, newCol, nextSquare, keys)) { // returns boolean
          plane = []; // if there are no legal moves along an axis empty the axis array
          break; // then escape the loop to stop looking
        } else if (nextSquare === player) { // then keep the axis array
          break; // then escape the loop
        }
        if (checkLength(plane, newCol, newRow, keys)) { // I wrote this check to prevent some illegal moves
          plane = []; // it's on the run up to the edge, it would take the row, even if there was no flanking
          break; // like there was a players piece off the board but still in play
        }
        plane.push(`#${newRow}${newCol}`); // if it didn't escape the loop, add this array to the array of arrays
      }
      if (plane.toString()) return plane; // if it has values return the array
    }).filter(Boolean); // I think this removes any undefined variables
    possiblePlanes.forEach(plane => { // for each axis in the array of arrays
      plane.forEach(id => { // for each id in each axis
        goodChips.push(id); // add to goodChips (chipsToFlip)
      }); // We do this to cover all directions, you can take along multiple axis
    });
    return goodChips; // return the good chips to be flipped
  } // end of getChips function
  function checkLength(plane, col, row, keys) {return plane.length >= 6 && (col === keys.length-1 || col === 0 || row === 'a' || row === keys[keys.length-1]);} // I added this one to prevent some illegal moves
  function invalidMove(row, col, square, keys) {return validRow(row) || validColumn(col, keys) || emptySquare(square);} // mother function for the three checks below
  function validRow(row) {return typeof row === 'undefined';} // conditions to break
  function validColumn(col, keys) {return col > keys.length-1 || col < 0;} // conditions to break
  function emptySquare(square) {return square === 'N';} // conditions to break
  function computerPlay(player, board, keys) { /////////////// this is how the computer plays the game
    return getChoices(player, board, keys, false)[0]; // just that one function that calls getChips (formerly isLegal) // isPlayer === false
  } // I was selecting the first item inside getChoices, but I decided to return a list to apply a class
  function anyLegalMoves(player, board, keys, isPlayer) {
    const possible = getChoices(player, board, keys, isPlayer); // isPlayer is a magic number, or boolean
    for (var i = 0; i < possible.length; i++) {
      $(possible[i]).addClass('legal'); // legal moves show up green on :hover
    }
    return possible; // changed to return all possible squares, even low scoring ones
  }
  // this getChips function is a tough one, it does what I need it to, but I don't like it it finds the legal move with the highest score
  function getChoices(player, board, keys, isPlayer) { // isPlayer is a magic number boolean
    let chipsThisTurn = []; // stores flippable chips for each square
    let topScorePerSq = 0; // the topScorePerSq is the highest score for any legal move,
    const possibleSquares = []; // the highest scoring square / squares
    const abacus = {}; // Dictionary of squares to potential scores
    for (let i=0; i<keys.length; i++) {
      for (let j=0; j<board[keys[i]].length; j++) { // looping every square
        const thisId = '#'+keys[i]+(j).toString(); // taken from the boardModel
        chipsThisTurn = getChips(keys[i], j, player, board, keys); // returns the flippable chips
        if (chipsThisTurn.length > 0) abacus[thisId] = chipsThisTurn.length; // if 1 or more, add to abacus
        chipsThisTurn = []; // empty for next square
      }
    }
    const resultKeys = Object.keys(abacus);
    for (let i=0; i<resultKeys.length; i++) {
      if (abacus[resultKeys[i]] > topScorePerSq) { // find the highest scores
        if ($(resultKeys[i]).hasClass('N')) { // can only place on N squares, sometimes B or W score very high
          topScorePerSq = abacus[resultKeys[i]]; // store the highest scores
        }
      }
    }
    if (!isPlayer) { // if it's the the player return the highest scoring chips to choose from
      for (let i=0; i<resultKeys.length; i++) {
        if (abacus[resultKeys[i]] === topScorePerSq) {
          if ($(resultKeys[i]).hasClass('N')) { // if I remove check it freaks out and flips the wrong squares
            possibleSquares.push(resultKeys[i]); // push all squares that match the highest score
          }
        }
      }
    } else { // if it IS the player, return all possible squares that will score at least one
      for (let i=0; i<resultKeys.length; i++) {
        if (abacus[resultKeys[i]] > 0) {
          if ($(resultKeys[i]).hasClass('N')) { // if I remove check it freaks out and flips the wrong squares
            possibleSquares.push(resultKeys[i]); // push all squares that match the highest score
          }
        }
      }
    }
    return possibleSquares; // return the first one, tends to the top left of the board
  }
  landingPage(); // start the whole thing
}); // end of document ready
