# web3-pay

Subscription payment server designed to work with Ghost platform.

### COnfiguration
Copy configuration template over to `config.json` and fill in the necessary info. See below for sample config for rinkeby testnet.
```js
  "development": {
    "web3HTTPProvider": "https://rinkeby.infura.io/v3/infura-id",
    "web3WSSProvider": "wss://rinkeby.infura.io/ws/v3/infura-id",
    "subscriptionContractAddress":  "0x687dE8D4060ecaD97588F74FD2e76bB1F35080ca",
    "dbHost": "",
    "dbDialect": "sqlite",
    "dbStorage": "./build-server/database.sqlite",
    "dbName": "",
    "dbUsername": "",
    "dbPassword": "",
    "supportedTokens": [
      "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735"
    ],
    "pricefeeds": {
      "DAI/USD": "0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF"
    },
    "apiUrl": "https://localhost:11664"
  }
```

### Development
```
npm run dev
```

### Build

```
NODE_ENV=production npm run build
```


### Ghost Integration

1. First, create a [custom integration](https://ghost.org/integrations/custom-integrations/) in Ghost.
2. Go to Web3Pay server and connect to a wallet
3. Click "Add Profile"
4. Enter your API Url and Content API Key from step 1, then click next
5. Enter subscription plan info, then click next
6. Review detail, then click submit
7. A metamask popup will appear, asking you to sign the payload. Review and then confirm
8. Your newly created subscription plan should appear in Dashboard
9. Click "Setup Theme"
10. Follow instruction on modal to update your ghost theme and routes
