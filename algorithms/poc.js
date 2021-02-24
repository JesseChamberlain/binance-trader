require('dotenv').config();
const fs = require('fs');
const ccxt = require('ccxt');
var parseArgs = require('minimist');

// CoinData object for storing and mutating current stage of coin price
class CoinData {
    constructor(coinID, currency) {
        this.coinID = coinID;
        this.currency = currency;
        this.currentPrice = 0;
        this.previousPrice = 0;
        this.currentTrendUp = true;
        this.previousTrendUp = true;
    }
}

// Account object for storing and mutating account values
class Account {
    constructor() {
        this.startingBalance = 0;
        this.theoryBalance = 0;
        this.binanceFee = 0;
    }
}

// Creates the file that the data will be stored to
function createDataCollectionJSON(testCoinData) {
    const time = new Date();
    const year = time.getFullYear();
    const day = time.getDate();
    const month = time.getMonth() + 1; // stupid base zero month
    let filePath = `./data/${year}_${month}_${day}_${testCoinData.coinID}_${testCoinData.currency}.json`;

    // create the JSON file with an empty array
    fs.writeFile(filePath, JSON.stringify([]), 'utf8', (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log(`Successfully created ${filePath}`);
        }
    });

    return filePath;
}

// Opens /data/collector.json (array json) and adds the response data to the array.
function dataCollector(account, symbolTicker, testCoinData, filePath) {
    let ping = { time: symbolTicker.datetime, account, testCoinData };
    console.log(ping);

    fs.readFile(filePath, 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            let collectorArray = JSON.parse(data); // renders file to object
            collectorArray.push(ping); // add the ping response data
            let jsonData = JSON.stringify(collectorArray); // convert it back to json

            // writes above vars back to the file
            fs.writeFile(filePath, jsonData, 'utf8', (err) => {
                if (err) {
                    console.log('Error writing file', err);
                } else {
                    console.log(`Successfully wrote to ${filePath}`);
                }
            });
        }
    });
}

/**
 * Runs data through logic and logs to console
 * @param {object} data - JSON object from API call.
 * @param {number} startAccountValue - Initial account value.
 */
function factorVolatility(account, coinData) {
    console.log(`
        Checking Current Price
        ****************************
    `);

    // only factor if the current price is different from previous
    if (coinData.currentPrice !== coinData.previousPrice) {
        let valPrcntModifier = coinData.currentPrice / coinData.previousPrice;
        console.log('valMod:', valPrcntModifier);
        coinData.currentTrendUp =
            coinData.currentPrice > coinData.previousPrice ? true : false;

        // primary logic
        if (coinData.currentTrendUp && coinData.previousTrendUp) {
            // multiply theoryVal by modifier to mimic held value
            account.theoryBalance = account.theoryBalance * valPrcntModifier;
        } else if (!coinData.currentTrendUp && coinData.previousTrendUp) {
            // multiple by modifier and binance fee to mimic market sell
            account.theoryBalance =
                account.theoryBalance * valPrcntModifier * account.binanceFee;
            coinData.previousTrendUp = false;
        } else if (coinData.currentTrendUp && !coinData.previousTrendUp) {
            // mimics buy in and resets previousTrendUp to true
            coinData.previousTrendUp = true;
        }
    }

    // set the previous to current at end of each priceObj loop
    coinData.previousPrice = coinData.currentPrice;
}

// Initialize coinData
const initialize = async (
    base,
    account,
    testCoinData,
    binanceClient,
    symbol
) => {
    // request ticker info & initialize previous price with live price
    const symbolTicker = await binanceClient.fetchTicker(symbol);
    testCoinData.previousPrice = symbolTicker.last;

    // request account balance & initialize account information
    const accountBalance = await binanceClient.fetchBalance();
    account.startingBalance = accountBalance.free[base];
    account.theoryBalance = account.startingBalance;
    account.binanceFee = 1 - accountBalance.info.takerCommission / 10000;
};

// Interval function
const tick = async (
    testCoinData,
    account,
    dataFilePath,
    binanceClient,
    symbol
) => {
    // request price from API
    const symbolTicker = await binanceClient.fetchTicker(symbol);

    // set requested price to currentPrice
    testCoinData.currentPrice = symbolTicker.last;

    // Runs primary algorithm
    factorVolatility(account, testCoinData);

    // Opens .json file and adds the current data state to the array.
    dataCollector(account, symbolTicker, testCoinData, dataFilePath);
};

// Primary runner
const run = () => {
    const config = {
        asset: 'DOGE', // Coin asset to test
        base: 'USDT', // Tether USD coin
        tickInterval: 30000, // Duration between each tick, milliseconds
    };
    const symbol = `${config.asset}/${config.base}`;
    let account = new Account();
    let testCoinData = new CoinData(config.asset, config.base);
    const dataFilePath = createDataCollectionJSON(testCoinData);

    // Instantiate binance client using the US binance API
    const binanceClient = new ccxt.binanceus({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });
    let args = parseArgs(process.argv.slice(2));
    console.log(args);

    initialize(config.base, account, testCoinData, binanceClient, symbol);
    setInterval(
        tick,
        config.tickInterval,
        testCoinData,
        account,
        dataFilePath,
        binanceClient,
        symbol
    );
};

run();
