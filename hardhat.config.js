require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// alchemyのAPIキー
const ALCHEMY_API_KEY = "QhtbYZdZqyCszp1JNO7O_l5e62rJOP27";


// Repstenネットワークを設定しているMetamaskアカウントの秘密鍵
const RINKEBY_PRIVATE_KEY = "936872fe93f15833fe5e0d50cb5886f317fd4f39a9b836e244f8fe354380097f";
const ETHERSCAN_PRIVATE_KEY = "127P71JA6C4WC2B9R9FR383RE3QHRPH7PP";

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    version: "0.8.9",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
    },
  },
  // 以下を追加
  networks: {
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
      accounts: [`${RINKEBY_PRIVATE_KEY}`]
    }
  },
  etherscan: {
    apiKey: {
      rinkeby: "127P71JA6C4WC2B9R9FR383RE3QHRPH7PP"
    }
  }
};