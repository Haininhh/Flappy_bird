import React from "react";
import ReactDOM from "react-dom";
import Phaser from "phaser";
import "./index.css";
import App from "./app/App";
import reportWebVitals from "./reportWebVitals";
import playGame from "./phaser/scene";

export const config = {
  type: Phaser.AUTO,
  parent: "phaser",
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: playGame,
};

const game = new Phaser.Game(config);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
