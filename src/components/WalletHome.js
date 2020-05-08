import React from "react";
import { Tabs } from "antd";
import { Form, Input, Button, List } from "antd";
import Arweave from "arweave/web";

const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  timeout: 20000,
  logging: false,
});
const { TabPane } = Tabs;
const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const tailLayout = {
  wrapperCol: { offset: 6, span: 16 },
};

const WalletHome = ({ state, change, transferCrypto, txList }) => {
  return (
    <div>
      <Tabs defaultActiveKey="1">
        <TabPane tab="Your Wallet" key="1">
          <Form
            name="basic"
            {...layout}
            style={{ marginTop: "20px" }}
            initialValues={{ remember: true }}
          >
            <Form.Item
              label="Address"
              name="address"
              rules={[
                { required: true, message: "Please input your address!" },
              ]}
            >
              <Input
                name="arReceiverAddress"
                onChange={(e) => change(e, "arReceiverAddress")}
                value={state.arReceiverAddress}
              />
            </Form.Item>
            <Form.Item
              label="Amount"
              name="amount"
              rules={[{ required: true, message: "Please input your amount!" }]}
            >
              <Input
                name="arValue"
                onChange={(e) => change(e, "arValue")}
                value={state.arValue}
                type="number"
              />
            </Form.Item>
            <Form.Item {...tailLayout} style={{ textAlign: "center" }}>
              <Button
                disabled={!state.arReceiverAddress || !state.arValue}
                onClick={transferCrypto}
                type="primary"
                htmlType="submit"
                loading={state.creatingTx}
              >
                Donate!
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        <TabPane tab="History" key="2">
          <List
            itemLayout="horizontal"
            dataSource={txList}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <p>
                      {" "}
                      TxID: <span></span>
                      <a href={`https://viewblock.io/arweave/tx/${item.id}`}>
                        {item.id}
                      </a>
                    </p>
                  }
                  description={
                    <p>
                      Donated to <span></span> <strong>{item.target}</strong>{" "}
                      <span></span>{" "}
                      <strong>{arweave.ar.winstonToAr(item.quantity)}</strong>{" "}
                      <span></span> AR
                    </p>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane
          tab={`Your Balance: ${state.arwBalance}`}
          disabled
          key="3"
        ></TabPane>
      </Tabs>
    </div>
  );
};

export default WalletHome;
