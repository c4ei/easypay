import React from "react";
import Ball from "./Ball";

const Display = ({ drawedNumbers }) => {
  const balls = drawedNumbers.map((number) => (
    <Ball key={number} number={number} />
  ));
  const displayInfo = drawedNumbers.length ? balls : "6개의 숫자를 선택하세요.";
  return <div className="display">{displayInfo}</div>;
};

export default Display;
