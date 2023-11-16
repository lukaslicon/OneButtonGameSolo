title = " NUMBER CRUNCHER";

description = `
[TAP]  ZERO
[HOLD] ONE
`;

characters = []; // for sprites (none atm)

const G = {
  WIDTH: 100,
  HEIGHT: 100
};

options = {
  viewSize: { x: G.WIDTH, y: G.HEIGHT },
  isPlayingBgm: true,
  theme: "crt"
};

// constants
const questionTime = 600;
const holdTime = 10;
const maxHealth = 100;

const SpeedBarHeight = 5;
const SpeedBarX = 0;
const SpeedBarY = G.HEIGHT - 87.5;

const healthBarWidth = 100;
const healthBarHeight = 10;
const healthBarX = (G.WIDTH - healthBarWidth) / 2;
const healthBarY = G.HEIGHT - healthBarHeight - 10;

// variables
let isPressing; // checking if button is held
let held; // counts how long button is held, to differentiate dots and dashes
let nextQ; // check to ask next question
let timeout; // keeping track of time till timeout into next question
let answer; // player input
let correctAnswer; // what input should match
let binaryTxt; // display text in binary
let b10Txt; // display text in base 10
let health = maxHealth;
let SpeedBarWidth = 0;
let SpeedTime = 0;
let elapsedTime = 0; 

// difficulty = digits
function binaryArrayToStr(arr) {
  // function for printing arrays without commas
  let s = "";
  for (let i = 0; i < arr.length; i++) {
    s = s.concat(String(arr[i]));
    s = s.concat(" ");
  }
  return s;
}
function Generator(digits) {
  // generates a number and saves it in str form to binaryTxt as binary and b10Txt as base 10
  let resD = 0;
  for (let x in range(digits)) {
    correctAnswer[parseInt(x)] = floor(Math.random() * 2);
    resD += correctAnswer[parseInt(x)] * Math.pow(2, digits - parseInt(x) - 1);
  }
  binaryTxt = binaryArrayToStr(correctAnswer);
  b10Txt = String(resD);
}

function update() {
  if (!ticks) {
    // Initialize variables
    isPressing = false;
    held = 0;
    nextQ = true;
    timeout = 0;
    answer = [];
    correctAnswer = [];
    binaryTxt = "testing";
    health = maxHealth;
    SpeedTime = 0;
    SpeedBarWidth = 0;
  }
  // Gen prompt
  if (nextQ) {
    timeout = questionTime;
    // ask question
    Generator(5);
    nextQ = false;
  }

//elapsedtime
  elapsedTime = Math.floor(ticks / 60); 

  //elapsedtime
  color("black");
  text(`${elapsedTime}s`, vec(G.WIDTH / 2.25, 3)); // Display elapsed time
  //time left
  color("black");
  text(`time:${timeout / 100}s`, vec(G.WIDTH - 80, G.HEIGHT - 30)); // Display elapsed time

  // Draw Health Bar at the bottom of the screen
  color("red");
  rect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
  color("green");
  rect(
    healthBarX,
    healthBarY,
    (health / maxHealth) * healthBarWidth,
    healthBarHeight
  );

  // Timeout bar
  color("red");
  line(vec(0, 10), vec((timeout * 100) / questionTime, 10)); // timeout bar

  // Speed Bar
  color("yellow");
  const maxBarWidth = G.WIDTH; // Max width based on available space
  const actualBarWidth = (SpeedBarWidth / questionTime) * maxBarWidth; // Adjusted width
  rect(SpeedBarX, SpeedBarY, actualBarWidth, SpeedBarHeight);

  color("black");
  text(b10Txt, vec(5, G.HEIGHT / 4)); // question
  color("light_black");
  text(":", vec(15, G.HEIGHT / 4));
  color("black");
  text(binaryTxt, vec(G.WIDTH / 4, G.HEIGHT / 4));
  text(binaryArrayToStr(answer), vec(G.WIDTH / 4, G.HEIGHT / 2)); // input so far

  color("red");
  text("Cancel", vec(G.WIDTH / 2 - 16, G.HEIGHT * 38 / 40)); // cancel text

  if (isPressing) {
    // indicator that you've held long enough
    if (input.pos.y > G.HEIGHT * 9 / 10) {
      color("light_red");
      bar(input.pos.x, input.pos.y, 14, 3, Math.PI / 4);
      bar(input.pos.x, input.pos.y, 14, 3, -Math.PI / 4);
    } else {
      if (held > holdTime) {
        color("yellow");
        bar(input.pos.x, input.pos.y, 10, 3, Math.PI / 2);
      } else {
        color("cyan");
        arc(input.pos.x, input.pos.y, 6, 3);
      }
    }
  }
  if (health <= 0) {
    end();
  }

  // Input Handling
  if (input.isJustPressed) {
    isPressing = true;
    held = 0;
  }
  held += 1;

  if (input.isJustReleased) {
    isPressing = false;
    if (input.pos.y > G.HEIGHT * 3 / 4) {
      answer = [];
    } else {
      if (held > holdTime) {
        answer.push(1);
      } else {
        answer.push(0);
      }
    }
  }
  if (answer.length == 5) {
    let correct = true;
    for (let i = 0; i < answer.length; i++) {
      if (answer[i] != correctAnswer[i]) {
        correct = false;
      }
    }
    if (correct) {
      nextQ = true;
      play("powerUp");
      addScore(timeout / 100);

      // Check if the time remaining bar is filled
      if (SpeedBarWidth >= questionTime) {
        addScore(timeout/20); // Add more points when the bar reaches 100
        SpeedTime = 0;
        SpeedBarWidth = 0; // Reset the width
      } else {
        SpeedBarWidth += timeout / 10; // Add the time left as a percentage
      }
    } else {
      health -= 25;
      if (health <= 0) {
        end();
      }
      play("explosion");
    }
    answer = [];
  }

  if (timeout <= 0) {
    health -= 5;
  } else {
    timeout -= 1;
  }
}
