import React from "react";
import ReactToPrint from "react-to-print";

const Print = ({ target, button }) => (
  <ReactToPrint
    bodyClass="print"
    allowAsProps
    trigger={() => button}
    content={() => target}
  />
);

export default Print;
