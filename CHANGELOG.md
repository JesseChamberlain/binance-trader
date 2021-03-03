# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.0] - 2021-03-01

### Added

-   data collection functionality
-   doji corrections to prevent false flips

## [0.9.0] - 2021-03-01

### Added

-   Completely rebuilt histoic poc to run against live data
-   Commented extensively and adde jsDocs to functions

## [0.8.0] - 2021-02-28

### Added

-   logic to read through fetchOHLCV API array of last 500 candles
-   new poc to run against historic data
-   ability to store candles and factor on specific intervals

### Updated

-   npm scripts to take interval arg, 5 being the ideal interval after numerous tests
-   lots of other things...

## [0.7.0] - 2021-02-28

### Added

-   live price data pulled from fetchOHLCV endpoint, refactored data accordingly
-   rebuilt heinkin ashi logic and moved it out of the object config
-   hollowCandle boolean and reconfigured volatility logic accordingly

### Updated

-   poc to take CLI arguments instead of hardcoded vars
-   cleaned up function naming

## [0.6.0] - 2021-02-26

### Added

-   ogject literals to config vs classes
-   heinkin ashi object to tick (but built it wrong...)
-   cuurent and previous as objects and created a "intervalTick" object

### Updated

-   pulled more dynamic info from fetchTick endpoint

## [0.5.3] - 2021-02-23

### Added

-   minimist package
-   scripts for dynamic pairs and common pairs

### Updated

-   poc to take CLI arguments instead of hardcoded vars

## [0.5.2] - 2021-02-23

### Added

-   additional binanceClient.fetchBalance() data instead of config variables

### Removed

-   a bunch junk no longerd needed

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

[0.10.0]: https://github.com/JesseChamberlain/binance-trader/compare/v0.9.0...v0.10.0
[0.9.0]: https://github.com/JesseChamberlain/binance-trader/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/JesseChamberlain/binance-trader/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/JesseChamberlain/binance-trader/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/JesseChamberlain/binance-trader/compare/v0.5.3...v0.6.0
[0.5.3]: https://github.com/JesseChamberlain/binance-trader/compare/v0.5.2...v0.5.3
[0.5.2]: https://github.com/JesseChamberlain/binance-trader/compare/v0.5.1...v0.5.2
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
