import React from "react";
import { Card, Button } from "antd";
import { RightCircleOutlined } from "@ant-design/icons";

const LoadWallet = ({ handleWalletUpload, confirmLoadWallet }) => {
  return (
    <Card
      title="Import your wallet"
      style={{ width: 500 , textAlign: 'center'}}
      bodyStyle={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <input
        style={{ paddingBottom: 20 }}
        type="file"
        accept=".json"
        onChange={(e) => {
          handleWalletUpload(e, "loadWalletData");
        }}
      />
      <Button
        onClick={confirmLoadWallet}
        type="primary"
        icon={<RightCircleOutlined />}
        size={"large"}
      >
        Import
      </Button>
    </Card>
  );
};

export default LoadWallet;
