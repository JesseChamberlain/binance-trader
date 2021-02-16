# README

Info an documentation for binance-trader

## About 

In its current state, binance-trader is a crypto trading application configured against binanceus via the ccxt API, and utlizing coingecko for live market data.

## Technology

Built as a clientless node.js application.

### Stack
* Node

### Packages & Dependencies
* ccxt
* axios
* dotenv

## Setup

Pretty basic, clone and run the following in your terminal:
```
npm i
touch .env
```

To utilize the Binance US API, add the following into you `.env` file
```
API_KEY={api key in binance)
API_SECRET={api secret, only shown at creation of api key}
```