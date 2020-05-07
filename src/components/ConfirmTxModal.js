import React from "react";

const ConfirmTxModal = ({ state }) => {
  return (
    <div>
      <p>
        <strong>Donate to:</strong> {state.arReceiverAddress}
      </p>
      <p>
        <strong>Amount:</strong> {state.arValue}
      </p>
      <p>
        <strong>Fee of Transaction:</strong> {state.txFee}
      </p>
      <p>
        <strong>Total:</strong> {state.totalTransfer}
      </p>
    </div>
  );
};

export default ConfirmTxModal;
