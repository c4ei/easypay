import React from "react";

const Field = ({ number, add }) => (
  <div className="number" onClick={add.bind(this, number)}>
    {number}
  </div>
);

export default Field;
