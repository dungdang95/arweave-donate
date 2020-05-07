import React from "react";
import "./App.css";
import Arweave from "arweave/web";
import { Decimal } from "decimal.js";
import {
  createTransaction,
  signAndDeployTransaction,
  getAddressAndBalance,
  openNotificationWithIcon,
  getTransactionIds,
  getTransaction,
} from "./utils/arweaveUtils";
import LoadWallet from "./components/LoadWallet";
import ConfirmTxModal from "./components/ConfirmTxModal";
import WalletHome from "./components/WalletHome";

import { Layout, Spin, Row, Col, Card, Modal, Button } from "antd";

const { Header, Footer, Content } = Layout;

const arweave = Arweave.init({
  host: "arweave.net",
  protocol: "https",
  timeout: 20000,
  logging: false,
});

class App extends React.Component {
  state = {
    loading: false,
    loadWallet: false,
    walletData: "",
    creatingTx: false,
    arwAddress: "",
    arwBalance: "",
    arValue: "",
    arReceiverAddress: "",
    txSendArray: [],
    transactionData: "",
    modalTx: false,
    totalTransfer: 0,
    newBalance: 0,
    valueTab: 0,
    txFee: 0,
    //Load Wallet
    loadWalletData: "",
    boolPassLoadWallet: false,
    passLoadWallet: "",
  };

  change = (e, name) => {
    this.setState({ [name]: e.target.value });
  };

  handleCloseTxModal = () => this.setState({ modalTx: false });

  handleFileUpload = async (e, nameEvent) => {
    const rawWallet = await this.readWallet(e.target.files[0]);
    this.setState({ [nameEvent]: rawWallet });
  };

  readWallet = (walletFile) => {
    const readAsDataURL = (walletFile) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => {
          reader.abort();
          reject();
        };
        reader.addEventListener(
          "load",
          () => {
            resolve(reader.result);
          },
          false
        );
        reader.readAsText(walletFile);
      });
    };
    return readAsDataURL(walletFile);
  };

  confirmLoadWallet = async () => {
    try {
      this.setState({ loading: true });
      const walletData = this.state.loadWalletData;
      let walletObj = JSON.parse(walletData);
      const { address, balance } = await getAddressAndBalance(walletObj);

      const txids = await getTransactionIds(address);
      const jsonDatas = await Promise.all(
        await txids.map(async (txid) => {
          const transactionData = await getTransaction(txid);
          return transactionData;
        })
      );

      this.setState({
        loading: false,
        loadWallet: true,
        walletData: walletObj,
        arwAddress: address,
        arwBalance: balance,
        loadWalletData: "",
        txSendArray: jsonDatas,
      });
      return;
    } catch (err) {
      this.setState({ loading: false });
      openNotificationWithIcon(
        "error",
        "Error Message!",
        "Something wrong, check your file key"
      );
    }
  };

  transferCrypto = async () => {
    try {
      this.setState({ creatingTx: true });
      const { arValue, arwBalance, arReceiverAddress, walletData } = this.state;

      if (arValue <= arwBalance) {
        let transaction = await createTransaction(
          arReceiverAddress,
          arValue,
          walletData
        );
        transaction.addTag("appname", "donate");
        let fee = arweave.ar.winstonToAr(transaction.reward);

        let result = await Decimal.add(fee, arValue).valueOf();
        let newBalance = await Decimal.sub(arwBalance, result).valueOf();
        if (newBalance < 0) {
          this.setState({ creatingTx: false }, () => {
            openNotificationWithIcon(
              "error",
              "Error Message!",
              "Insuficient founds"
            );
          });
          return;
        }
        this.setState({
          transactionData: transaction,
          modalTx: true,
          totalTransfer: result,
          txFee: fee,
          newBalance,
          creatingTx: false,
          cryptoTxPass: "",
        });
      } else {
        this.setState({ creatingTx: false }, () => {
          openNotificationWithIcon(
            "error",
            "Error Message!",
            "Insuficient founds"
          );
        });
      }
    } catch (err) {
      this.setState({ creatingTx: false }, () => {
        openNotificationWithIcon(
          "error",
          "Error Message!",
          "Something wrong, please try again!"
        );
      });
    }
  };

  confirmTransferCrypto = async () => {
    try {
      this.setState({ txRunning: true });
      let walletData = this.state.walletData;

      let txArray = this.state.txSendArray;
      let transaction = this.state.transactionData;

      const { arValue, arwBalance, arReceiverAddress } = this.state;
      const response = await signAndDeployTransaction(transaction, walletData);
      if (response.data === "OK" && response.status === 200) {
        const obj = {
          id: transaction.id,
          target: arReceiverAddress,
          quantity: arValue,
          reward: arweave.ar.winstonToAr(transaction.reward),
        };
        txArray.push(obj);
        const newBalance = Decimal.sub(arwBalance, arValue).valueOf();
        this.setState({
          cryptoTxPass: "",
          txSendArray: txArray,
          arValue: "",
          arReceiverAddress: "",
          txRunning: false,
          arwBalance: newBalance,
          modalTx: false,
        });
        walletData = "";
        openNotificationWithIcon(
          "success",
          "Success Message!",
          "Transaction Deploy Successfully"
        );
        return;
      }
      openNotificationWithIcon("error", "Error Message!", "Transaction Failed");
      walletData = "";
      this.setState({ txRunning: false, cryptoTxPass: "" });
    } catch (err) {
      openNotificationWithIcon("error", "Error Message!", "Transaction Failed");
      this.setState({ txRunning: false, cryptoTxPass: "" });
    }
  };

  walletDiv = () => {
    const { loadWallet, txSendArray, modalTx, txRunning } = this.state;
    if (!loadWallet) {
      return (
        <Row align="middle">
          <Col span={12}>
            <LoadWallet
              handleWalletUpload={this.handleFileUpload}
              confirmLoadWallet={this.confirmLoadWallet}
            />
          </Col>
        </Row>
      );
    } else {
      return (
        <div>
          <Card style={{ width: 500 }} size="large">
            <WalletHome
              change={this.change}
              state={this.state}
              transferCrypto={this.transferCrypto}
              txList={txSendArray}
            />
          </Card>
          <Modal
            title="Confirm Transaction"
            onCancel={this.handleCloseTxModal}
            visible={modalTx}
            footer={[
              <Button key="back" onClick={this.handleCloseTxModal}>
                Return
              </Button>,
              <Button
                key="submit"
                type="primary"
                loading={txRunning}
                onClick={this.confirmTransferCrypto}
              >
                Submit
              </Button>,
            ]}
          >
            <ConfirmTxModal state={this.state} />
          </Modal>
        </div>
      );
    }
  };

  render() {
    const { loading } = this.state;
    return (
      <Layout style={{ height: "100vh" }}>
        <Layout className="layout">
          <Header className="header">Arweave Donate System</Header>
          <Content style={{ margin: "auto", marginTop: "100px" }}>
            <Spin spinning={loading} delay={500} size="large" tip="Loading...">
              {this.walletDiv()}
            </Spin>
          </Content>
          <Footer className="footer">Arweave Donate ©2020 Created by Dung Dang</Footer>
        </Layout>
      </Layout>
    );
  }
}

export default App;
