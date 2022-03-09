import React from "react";
import Field from "./Field";

const Coupon = ({ numbers, add }) => {
  const fields = numbers.map((number) => (
    <Field key={number} number={number} add={add} />
  ));

  return (
    <div className="coupon">
      {fields}
      <div className="number"></div>
    </div>
  );
};

export default Coupon;
