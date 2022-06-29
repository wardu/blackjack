//
// Author:       Warren Dubery
// Created:      27.07.2022
//
// License:      MIT
//
// Description:  A simple, one-player implementation of the game 'Blackjack'
//               using Javascript and jQuery.
//               Notes: 5 Card Charlie rule is in force (maximum 5 card hands)
//                      Dealer will take a hit until Score > 17 and must hit
//                      soft 17.
//                      Card Images by Andrew Tidey

//
//
//
// #############################################################################
// #######################      The Cards      #################################
// #############################################################################
//

let deck;

// ----------------------------------------------- Make a shuffled deck of cards
function makeShuffledDeck() {
  const suits = ['Clubs', 'Diamond', 'Hearts', 'Spades'];
  const values = [
    'A',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '10',
    'J',
    'Q',
    'K',
  ];
  deck = [];
  for (let i = 0; i < suits.length; i++) {
    for (let j = 0; j < values.length; j++) {
      let card = { Suit: suits[i], Value: values[j] };
      deck.push(card);
    }
  }

  // Shuffle method uses the Durstenfeld version of the Fisher-Yates algorithm
  // (as found online)
  let j, x, i;
  for (i = deck.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = deck[i];
    deck[i] = deck[j];
    deck[j] = x;
  }
}
makeShuffledDeck();

//  ------------------------------------------------------------------ Deal card
function dealCard(deck) {
  if (deck.length > 1) return deck.pop();
  else {
    makeShuffledDeck();
    return deck.pop();
  }
}

//
//
//
// #############################################################################
// ########################    Scoring & Gameplay     ##########################
// #############################################################################
//

let playerHand = [];
let computerHand = [];
let playerScore = 0;
let computerScore = 0;

// ------------------------------------------------ Gives the cards their values
function cardValues(card) {
  let faceValue = card.Value;
  let cardVal = parseInt(faceValue);

  // Default value of an Ace is set to 11.
  // Adjusting Ace value to 1 is delt with in getPlayersScores function.
  if (faceValue == 'A') cardVal = 11;
  if (faceValue === 'J') cardVal = 10;
  if (faceValue === 'Q') cardVal = 10;
  if (faceValue == 'K') cardVal = 10;

  return cardVal;
}

// --------------------------------------------------- Returns hand total scores

function getPlayersScores() {
  // reset card count each call
  playerScore = 0;
  computerScore = 0;

  let playerAceCount = 0;
  let computerAceCount = 0;

  // playerHand
  for (i = 0; i < playerHand.length; i++) {
    if (playerHand[i].Value === 'A') {
      playerAceCount += 1;
    }
    playerScore += cardValues(playerHand[i]);

    // Solution for Ace (1 or 11) in playerHand
    for (let j = 0; j < playerAceCount; j++) {
      if (playerScore > 21) {
        playerScore -= 10;
        playerAceCount -= 1;
      }
    }
  }
  $('#player-score').html(playerScore);

  // computerHand
  for (i = 0; i < computerHand.length; i++) {
    if (computerHand[i].Value === 'A') {
      computerAceCount += 1;
    }
    computerScore += cardValues(computerHand[i]);

    // Solution for Ace (1 or 11) in computerHand
    for (let j = 0; j < computerAceCount; j++) {
      if (
        computerScore > 21 ||
        (computerScore > 17 && computerScore < playerScore)
      ) {
        computerScore -= 10;
        computerAceCount -= 1;
      }
    }
  }
  $('#computer-score').html(computerScore);

  checkIfBusted();
}

// ----------------------------------------------------------- checks for busted
function checkIfBusted() {
  if (playerScore > 21) computerWins();
  if (computerScore > 21) playerWins();
}

// --------------------------------------------------------------- Dealer's turn
function computerTurn() {
  for (let i = 3; i < 6; i++) {
    getPlayersScores();
    if (computerScore > 21) {
      playerWins();
      break;
    }
    if (
      computerScore > 16 &&
      computerScore > playerScore &&
      computerScore <= 21
    ) {
      computerWins();
      break;
    }
    if (computerScore > 16 && computerScore < playerScore) {
      playerWins();
      break;
    }
    if (computerScore < 17) {
      let newCard = dealCard(deck);
      computerHand.push(newCard);

      $(`#computer-card-space-${i}`).prepend(
        `<img src="assets/${newCard.Suit} ${newCard.Value}.png" />`
      );
    }
    if (computerScore === playerScore && computerScore > 16) {
      itsADraw();
      break;
    }
  }
}

//
//
//
// #############################################################################
// ###################       End of Hand     ###################################
// #############################################################################
//

function computerWins() {
  $('.button').prop('disabled', true);
  $('.button').hide();
  $('h1').css('background-color', '#900C3F').html('You Lose!');
}

function playerWins() {
  $('.button').prop('disabled', true);
  $('.button').hide();
  $('h1').css('background-color', '#4cc5d1').html('You Win!');
}

function itsADraw() {
  $('.button').prop('disabled', true);
  $('.button').hide();
  $('h1').css('background-color', ' #605e60 ').html("It's a Draw!");
}

//
//
//
// #############################################################################
// ##########################     Buttons      #################################
// #############################################################################
//

// --------------------------------Disable HIT and STAND before game has started
$('#button-hit').prop('disabled', true);
$('#button-stand').prop('disabled', true);

// ------------------------------------------------------------------ HIT BUTTON
let hitCounter = 3;

$('#button-hit').click(() => {
  if (hitCounter <= 5) {
    let newCard = dealCard(deck);
    playerHand.push(newCard);
    $(`#player-card-space-${hitCounter}`).prepend(
      `<img src="assets/${newCard.Suit} ${newCard.Value}.png" />`
    );
    hitCounter += 1;
    getPlayersScores();
  }
});

// ---------------------------------------------------------------- STAND BUTTON
$('#button-stand').click(() => {
  $('#button-hit').prop('disabled', true);
  $('#button-stand').prop('disabled', true);

  computerHand.push(forthDelt);

  $('div#computer-card-space-2 > img').remove();
  $(`#computer-card-space-2`).prepend(
    `<img src="assets/${forthDelt.Suit} ${forthDelt.Value}.png" />`
  );
  computerTurn();
});

// ---------------------------------------------------------------- START BUTTON

let firstDelt;
let secondDelt;
let thirdDelt;
let forthDelt;

$('#button-deal').click(() => {
  // reset title
  $('h1').css('background-color', 'transparent').html('BlackJack');

  hitCounter = 3;
  $('div.card > img').remove();
  playerHand = [];
  computerHand = [];
  playerScore = 0;
  computerScore = 0;

  firstDelt = dealCard(deck);
  secondDelt = dealCard(deck);
  thirdDelt = dealCard(deck);
  forthDelt = dealCard(deck);

  playerHand.push(firstDelt);
  computerHand.push(secondDelt);
  playerHand.push(thirdDelt);

  $('#player-card-space-1').prepend(
    `<img src="assets/${firstDelt.Suit} ${firstDelt.Value}.png" />`
  );
  $('#computer-card-space-1').prepend(
    `<img src="assets/${secondDelt.Suit} ${secondDelt.Value}.png" />`
  );
  $('#player-card-space-2').prepend(
    `<img src="assets/${thirdDelt.Suit} ${thirdDelt.Value}.png" />`
  );
  $('#computer-card-space-2').prepend(`<img src="assets/Back.png" />`);

  $('.button').prop('disabled', false);
  $('.button').show();
  getPlayersScores();
});
