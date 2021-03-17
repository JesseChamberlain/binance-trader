# README

Info and documentation for binance-trader

## About

In its current state, binance-trader is a crypto trading application configured against binanceus via the ccxt API.

NOTE: This is a work in progress. Master branch will generally have working & functional POC code, but v1.0.0 will be the first fully functional application.

## Technology

Built as a command line node.js application.

### Stack

-   Node

### Dependencies

-   [ccxt](https://github.com/ccxt/ccxt)
-   [dotenv](https://github.com/motdotla/dotenv)
-   [minimist](https://github.com/substack/minimist)

### Dev Dependencies

-   [eslint](https://github.com/eslint/eslint)
-   [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier)
-   [eslint-plugin-node](https://github.com/mysticatea/eslint-plugin-node)
-   [eslint-plugin-prettier](https://github.com/prettier/eslint-plugin-prettier)
-   [prettier](https://github.com/prettier/prettier)
-   [husky](https://github.com/typicode/husky)
-   [colors](https://github.com/Marak/colors.js)

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
