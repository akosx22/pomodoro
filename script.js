"use strict";

// Selecting HTML elements
const pomodoroRoundEl = document.querySelector(".pomodoro__round");
const pomodoroTimeEl = document.querySelector(".pomodoro__time");
const pomodoroStartEl = document.querySelector(".pomodoro__button--start");
const pomodoroResetEl = document.querySelector(".pomodoro__button--reset");
const minusButtonEl = document.querySelectorAll(".settings__button--minus");
const plusButtonEl = document.querySelectorAll(".settings__button--plus");
const pomodoroSettingsEl = document.querySelector(".settings__value--pomodoro");
const shortSettingsEl = document.querySelector(".settings__value--short");
const longSettingsEl = document.querySelector(".settings__value--long");
const progressCircleEl = document.querySelector(".pomodoro__circle--progress");

// Define variables
let pomodoroTime = 25;
let totalSeconds = pomodoroTime * 60;
let remainingSeconds = totalSeconds;

let pomodoroTimer;

let phase = "pomodoro";
let round = 1;

let shortTime = 5;
let longTime = 25;

let isRunning = false;
let isAdjustable = true; // Settings modification

// Define progress circle circumference
const radius = progressCircleEl.r.baseVal.value;
const circumference = 2 * radius * Math.PI;
progressCircleEl.style.strokeDasharray = circumference;
progressCircleEl.style.strokeDashoffset = circumference;

// Seconds formatting
const formattedSeconds = function (seconds) {
  return String(seconds).padStart(2, "0");
};

// Time calculation
const calcTime = function (totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return { minutes, seconds };
};

// Display remaining time
const displayTime = function (element, minutes, seconds = null) {
  if (seconds !== null) {
    element.textContent = `${minutes}:${formattedSeconds(seconds)}`;
  } else {
    element.textContent = `${String(minutes).padStart(2, "0")}:00`;
  }
};

const updateDisplayedTime = function (element, secondsLeft) {
  const { minutes, seconds } = calcTime(secondsLeft);
  displayTime(element, minutes, seconds);
};

// Update pomodoro, short és long time
const updateTime = function (type) {
  if (type === "pomodoro") {
    totalSeconds = pomodoroTime * 60;
    remainingSeconds = totalSeconds;
    displayTime(pomodoroSettingsEl, pomodoroTime);
    updateDisplayedTime(pomodoroTimeEl, remainingSeconds);
  } else if (type === "short") {
    displayTime(shortSettingsEl, shortTime);
  } else if (type === "long") {
    displayTime(longSettingsEl, longTime);
  }
};

// Set progress circle 0-100%
const updateProgress = function () {
  let percentage = (totalSeconds - remainingSeconds) / totalSeconds;
  let dashOffset = circumference * (1 - percentage);
  progressCircleEl.style.strokeDashoffset = dashOffset;
};

// Switch the Start/Pause button text
const switchButtonText = function (state) {
  pomodoroStartEl.textContent = state ? "Start" : "Pause";
};

// Start timer
const startTimer = function () {
  pomodoroTimer = setInterval(() => {
    remainingSeconds--;
    updateDisplayedTime(pomodoroTimeEl, remainingSeconds);
    updateProgress();
    if (remainingSeconds === 0) {
      clearInterval(pomodoroTimer);
      const audio = new Audio("beep.mp3");
      audio.play();
      if (phase === "pomodoro") {
        if (round === 4) {
          phase = "longBreak";
        } else {
          phase = "shortBreak";
        }
      } else {
        round++;
        if (round > 4) round = 1;
        phase = "pomodoro";
      }

      if (phase === "pomodoro") {
        pomodoroRoundEl.textContent = `Pomodoro ${round}`;
        totalSeconds = pomodoroTime * 60;
      } else if (phase === "shortBreak") {
        pomodoroRoundEl.textContent = "Short Break";
        totalSeconds = shortTime * 60;
      } else if (phase === "longBreak") {
        pomodoroRoundEl.textContent = "Long Break";
        totalSeconds = longTime * 60;
      }

      remainingSeconds = totalSeconds;
      updateDisplayedTime(pomodoroTimeEl, remainingSeconds);
      updateProgress();
      isRunning = false;
      switchButtonText(true);
    }
  }, 1000);
};

// Core function
const toggleTimer = function () {
  if (isRunning) {
    clearInterval(pomodoroTimer);
    switchButtonText(true);
    isRunning = false;
    isAdjustable = false;
  } else {
    startTimer();
    switchButtonText(false);
    isRunning = true;
    isAdjustable = false;
  }
};

// Reset timer
const resetTimer = function () {
  clearInterval(pomodoroTimer);
  remainingSeconds = pomodoroTime * 60;
  updateDisplayedTime(pomodoroTimeEl, remainingSeconds);
  round = 1;
  pomodoroRoundEl.textContent = `Pomodoro ${round}`;
  progressCircleEl.style.strokeDashoffset = circumference;
  switchButtonText(true);
  isAdjustable = true;
};

// Plus button
const plusTime = function () {
  plusButtonEl.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (!isAdjustable) return;

      const type = e.target.dataset.type;
      if (type === "pomodoro" && pomodoroTime < 60) {
        pomodoroTime++;
        updateTime("pomodoro");
      } else if (type === "short" && shortTime < 60) {
        shortTime++;
        updateTime("short");
      } else if (type === "long" && longTime < 60) {
        longTime++;
        updateTime("long");
      }
    });
  });
};

// Minus time
const minusTime = function () {
  minusButtonEl.forEach((btn) => {
    btn.addEventListener("click", function (e) {
      if (!isAdjustable) return;

      const type = e.target.dataset.type;
      if (type === "pomodoro" && pomodoroTime > 1) {
        pomodoroTime--;
        updateTime("pomodoro");
      } else if (type === "short" && shortTime > 1) {
        shortTime--;
        updateTime("short");
      } else if (type === "long" && longTime > 1) {
        longTime--;
        updateTime("long");
      }
    });
  });
};

// Event listeners
pomodoroStartEl.addEventListener("click", toggleTimer);
pomodoroResetEl.addEventListener("click", resetTimer);

// Function call
updateDisplayedTime(pomodoroTimeEl, remainingSeconds);
minusTime();
plusTime();
