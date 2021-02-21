const axios = require('axios');
const { createCoinGeckoURL } = require('./helpers/coinGeckoURL');
const fs = require('fs');

// CoinData object for storing and mutating current stage of coin price
class CoinData {
    constructor() {
        this.currentPrice = 0;
        this.previousPrice = 0;
        this.currentTrendUp = true;
        this.previousTrendUp = true;
    }
}

// Account object for storing and mutating account values
class Account {
    constructor(startingValue, binanceFee) {
        this.startingValue = startingValue;
        this.theoryValue = startingValue;
        this.binanceFee = binanceFee;
    }
}

// Opens /data/collector.json (array json) and adds the response data to the array.
function dataCollector(resData) {
    fs.readFile(
        './data/collector.json',
        'utf8',
        function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                let collectorArray = JSON.parse(data); // renders file to object
                collectorArray.push(resData); // add the response data
                // console.log(collectorArray); // log to make sure it's working
                let jsonData = JSON.stringify(collectorArray); //convert it back to json

                // writes back to the file
                fs.writeFile(
                    './data/collector.json',
                    jsonData,
                    'utf8',
                    (err) => {
                        if (err) {
                            console.log('Error writing file', err);
                        } else {
                            console.log('Successfully wrote file');
                        }
                    }
                );
            }
        }
    );
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
            account.theoryValue = account.theoryValue * valPrcntModifier;
        } else if (!coinData.currentTrendUp && coinData.previousTrendUp) {
            // multiple by modifier and binance fee to mimic market sell
            account.theoryValue =
                account.theoryValue * valPrcntModifier * account.binanceFee;
            coinData.previousTrendUp = false;
        } else if (coinData.currentTrendUp && !coinData.previousTrendUp) {
            // mimics buy in and resets previousTrendUp to true
            coinData.previousTrendUp = true;
        }
    }
    console.log(account);
    console.log(coinData);

    // set the previous to current at end of each priceObj loop
    coinData.previousPrice = coinData.currentPrice;
}

// Initialize coinData
const initialize = async (coin, assetURL, testCoinData) => {
    const { assetID, currency } = coin;
    // request price from API
    const resData = await axios.get(assetURL).then((response) => {
        return response.data;
    });

    // initialize previous price with live price
    testCoinData.previousPrice = resData[assetID][currency];
};

// Interval function
const tick = async (coin, assetURL, testCoinData, account) => {
    const { assetID, currency } = coin;
    // request price from API
    const resData = await axios.get(assetURL).then((response) => {
        return response.data;
    });

    testCoinData.currentPrice = resData[assetID][currency];

    // Initialize runners
    factorVolatility(account, testCoinData);

    // Opens /data/collector.json (array json) and adds the data response to the array.
    dataCollector(resData);
};

// Primary runner
const run = () => {
    const coin = {
        assetID: 'dogecoin', // Coin ID
        currency: 'usd', // Currency for comparison
    };
    const tickInterval = 30000; // Duration between each tick, milliseconds
    const assetURL = createCoinGeckoURL(coin.assetID, coin.currency);
    let account = new Account(100, 0.99925); // end $ value of account after running through data
    let testCoinData = new CoinData();

    initialize(coin, assetURL, testCoinData);
    setInterval(tick, tickInterval, coin, assetURL, testCoinData, account);
};

run();
