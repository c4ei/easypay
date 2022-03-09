import React from "react";

const ButtonReset = ({ reset }) => {
  return (
    <button className="reset" onClick={reset}>
      Reset
    </button>
  );
};

export default ButtonReset;
