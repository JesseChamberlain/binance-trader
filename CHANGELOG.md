# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1] - 2021-02-22

### Added

-   binanceClient.fetchTicker() to the file in place of coinGecko accross all files

### Removed

-   coingecko and axios dependencies

## [0.5.0] - 2021-02-22

### Added

-   buy & sell functionality from binanceClient.createOrder() method
-   binanceClient.fetchTicker() to the file in place of coinGecko

## [0.4.2] - 2021-02-21

### Added

-   createDataCollectionJSON function to create a new file with the date stamp and coinID/currency

### Updated

-   dataCollector to include a H:M:S timestamp for each ping

## [0.4.1] - 2021-02-21

### Updated

-   CoinData class to have coinID & currency
-   dataCollector in index.js to include account and coinData

### Removed

-   older data collections from previous object shape
-   /helpers/dataCollector.js function
-   /algorithims/volatilityPOC.js

## [0.4.0] - 2021-02-21

### Added

-   combination of POC and dataCollector to index, works against live charts
-   Account and CoinData class objects for tracking live state

### Updated

-   POC and other helper files

## [0.3.1] - 2021-02-20

### Updated

-   algorithm to account for price duplicates
-   directories for helpers and alogrithms
-   data objects

## [0.3.0] - 2021-02-20

### Added

-   volatility logic to index.js to work against captured data
-   more captured data from 8hrs of dogecoin

### Updated

-   trimmed data objects to just be data.price

## [0.2.0] - 2021-02-19

### Added

-   dataCollector.js to capture live market prices
-   /data directory with raw and trimmed price data

### Updated

-   demoTrader to use dynamic API function

## [0.1.5] - 2021-02-17

### Updated

-   coingGecko urls to be a dynamic helper function

## [0.1.4] - 2021-02-16

### Added

-   Husky with precommit linting

## [0.1.3] - 2021-02-16

### Added

-   eslint configuration for project
-   prettier configuration for project

### Updated

-   linted all .js and .json files

## [0.1.2] - 2021-02-16

### Updated

-   CHANGELOG.md - created formatting
-   README.md - simple purpose and instructions

## [0.1.1] - 2021-02-15

### Added

-   /helpers
-   compoundCalc.js simple function for calculating compound interest
-   volatility prototype POC with mock data

## [0.1.0] - 2021-02-15

### Added

-   Working demo and API connections

[0.5.1]: https://github.com/JesseChamberlain/binance-trader/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/JesseChamberlain/binance-trader/compare/v0.4.2...v0.5.0
[0.4.2]: https://github.com/JesseChamberlain/binance-trader/compare/v0.4.1...v0.4.2
[0.4.1]: https://github.com/JesseChamberlain/binance-trader/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/JesseChamberlain/binance-trader/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/JesseChamberlain/binance-trader/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/JesseChamberlain/binance-trader/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/JesseChamberlain/binance-trader/compare/v0.1.5...v0.2.0
[0.1.5]: https://github.com/JesseChamberlain/binance-trader/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/JesseChamberlain/binance-trader/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/JesseChamberlain/binance-trader/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/JesseChamberlain/binance-trader/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/JesseChamberlain/binance-trader/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/JesseChamberlain/binance-trader/releases/tag/v0.1.0
