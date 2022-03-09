import React from "react";

const ButtonStart = ({ start, playerNumbers }) =>
  playerNumbers.length === 6 ? (
    <button className="start" onClick={start}>
추첨
    </button>
  ) : (
    <button className="off" disabled>
추첨
    </button>
  );

export default ButtonStart;
