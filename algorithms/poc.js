require('dotenv').config();
const fs = require('fs');
const ccxt = require('ccxt');
var parseArgs = require('minimist');

// Creates the file that the data will be stored to
function createDataCollectionJSON(coinData) {
    const time = new Date();
    const year = time.getFullYear();
    const day = time.getDate();
    const month = time.getMonth() + 1; // stupid base zero month
    let filePath = `./data/${year}_${month}_${day}_${coinData.coinID}_${coinData.currency}.json`;

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
const dataCollector = (ping, filePath) => {
    const copiedPing = JSON.parse(JSON.stringify(ping));
    console.log('copiedPing:', copiedPing);
    fs.readFile(filePath, 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            let collectorArray = JSON.parse(data); // renders file to object
            collectorArray.push(copiedPing); // add the ping response data
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
};

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
    if (coinData.current.price !== coinData.previous.price) {
        let valPrcntModifier = coinData.current.price / coinData.previous.price;
        console.log('valMod:', valPrcntModifier);
        coinData.current.isTrendingUp =
            coinData.current.price > coinData.previous.price ? true : false;

        // primary logic
        if (coinData.current.isTrendingUp && coinData.previous.isTrendingUp) {
            // multiply theoryVal by modifier to mimic held value
            account.theoryBalance = account.theoryBalance * valPrcntModifier;
        } else if (
            !coinData.current.isTrendingUp &&
            coinData.previous.isTrendingUp
        ) {
            // multiple by modifier and binance fee to mimic market sell
            account.theoryBalance =
                account.theoryBalance * valPrcntModifier * account.binanceFee;
            coinData.previous.isTrendingUp = false;
        } else if (
            coinData.current.isTrendingUp &&
            !coinData.previous.isTrendingUp
        ) {
            // mimics buy in and resets previous.isTrendingUp to true
            coinData.previous.isTrendingUp = true;
        }
    }
}

function createTick(symbolTicker, trend, prevOpen, prevClose) {
    const { open, close, high, low } = symbolTicker;
    let tick = {
        price: close,
        isTrendingUp: trend,
        heikinAshi: {
            open: (open + close + high + low) / 4,
            close: (prevOpen + prevClose) / 2,
            high: Math.max(open, close, high),
            low: Math.min(open, close, low),
        },
    };

    return tick;
}

// Initialize coinData
const initialize = async (base, account, coinData, binanceClient, symbol) => {
    // request ticker info & initialize previous price with live price
    const symbolTicker = await binanceClient.fetchTicker(symbol);
    let initializeTick = createTick(
        symbolTicker,
        true,
        symbolTicker.open,
        symbolTicker.close
    );
    coinData.previous = initializeTick;
    console.log(coinData);

    // request account balance & initialize account information
    const accountBalance = await binanceClient.fetchBalance();
    account.startingBalance = accountBalance.free[base];
    account.theoryBalance = account.startingBalance;
    account.binanceFee = 1 - accountBalance.info.takerCommission / 10000;
};

// Interval function
const tick = async (coinData, account, dataFilePath, binanceClient, symbol) => {
    const { open, close } = coinData.previous.heikinAshi;
    // request price from API
    const symbolTicker = await binanceClient.fetchTicker(symbol);
    const ping = { time: symbolTicker.datetime, account, coinData };
    let intervalTick = createTick(symbolTicker, true, open, close);
    coinData.current = intervalTick;

    // Runs primary algorithm
    factorVolatility(account, coinData);

    // Opens .json file and adds the current data state to the array.
    dataCollector(ping, dataFilePath);

    // set the previous to current at end of each priceObj loop
    coinData.previous = coinData.current;
};

// Primary runner
const run = () => {
    let args = parseArgs(process.argv.slice(2));
    const config = {
        asset: `${args.ASSET}`, // Coin asset to test
        base: `${args.BASE}`, // Base coin for asset (USD, USDT, BTC usually)
        tickInterval: 600000, // Duration between each tick, milliseconds (5, 10, 15 minutes ideal)
    };
    const symbol = `${config.asset}/${config.base}`;

    // Account object for storing and mutating account values
    let account = {
        startingBalance: 0,
        theoryBalance: 0,
        binanceFee: 0,
    };

    // CoinData object for storing and mutating current stage of coin price
    let coinData = {
        coinID: config.asset,
        currency: config.base,
        current: {},
        previous: {},
    };
    const dataFilePath = createDataCollectionJSON(coinData);

    // Instantiate binance client using the US binance API
    const binanceClient = new ccxt.binanceus({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });
    console.log(args);

    initialize(config.base, account, coinData, binanceClient, symbol);
    setInterval(
        tick,
        config.tickInterval,
        coinData,
        account,
        dataFilePath,
        binanceClient,
        symbol
    );
};

run();
