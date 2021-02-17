# README

Info an documentation for binance-trader

## About

In its current state, binance-trader is a crypto trading application configured against binanceus via the ccxt API, and utlizing coingecko for live market data.

## Technology

Built as a clientless node.js application.

### Stack

-   Node

### Dependencies

-   ccxt
-   axios
-   dotenv

### Dev Dependencies

-   eslint
-   eslint-config-prettier
-   eslint-plugin-node
-   eslint-plugin-prettier
-   prettier
-   husky

## Setup

Pretty basic, clone and run the following in your terminal:

```
npm i
touch .env
```

To utilize the [Binance US](https://www.binance.us/en/home) API, add the following into your `.env` file

```
API_KEY={api key in binance)
API_SECRET={api secret, only shown at creation of api key}
```
