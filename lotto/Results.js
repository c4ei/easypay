import React from "react";

const Results = ({ games, hits, money }) => {
  const prize = 1;
  const information = hits ? `${hits}개 맞음` : "0개 맞음";
  return (
    <section className="results">
      <h3 className="info">{games ? information : "..."}</h3>
      <div className="games">
        <span>게임 수:</span>
        <span>{games}</span>
      </div>
      <div className="wallet">
        <span>베팅 금액:</span>
        <span>{games * prize} c4ei</span>
      </div>
      <div className="money">
        <span>당첨금액:</span>
        <span>{money} c4ei</span>
      </div>
    </section>
  );
};

export default Results;
