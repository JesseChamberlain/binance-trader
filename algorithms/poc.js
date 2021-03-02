require('dotenv').config();
const ccxt = require('ccxt');
var parseArgs = require('minimist');

/**
 * Runs coin data through logic and itterates account value
 * @param {object} account - Object of account information
 * @param {object} coinData - Object of current and previous coin data
 */
const factorVolatility = (account, coinData) => {
    const { current, previous } = coinData;
    let prcntChange = current.price / previous.price;

    // Mimics a held asset or sell order, no match equals out of market or buy
    if (current.hollowCandle && previous.hollowCandle) {
        // multiply theoryVal by modifier to mimic held value
        account.theoryBalance = account.theoryBalance * prcntChange;
    } else if (!current.hollowCandle && previous.hollowCandle) {
        // multiply theoryVal by modifier & binance fee to mimic market sell
        account.theoryBalance =
            account.theoryBalance * prcntChange * account.binanceFee;
    }
};

/**
 * Takes the last OHLCV response and creates a heikin ashi candle
 * @param {array} lastOHLCV - latest OHLCV response [ t, o, h, l, c, v]
 * @param {float} prevOpen - previous heikin ashi candle open
 * @param {float} prevClose - previous heikin ashi candle close
 * @param {boolean} prevHollowCandle - previous heikin ashi candle trend
 * @return {object} - returns a heikin ashi candle object
 */
const createHeikinAshiTick = (
    lastOHLCV,
    prevOpen,
    prevClose,
    prevHollowCandle
) => {
    const [lastTime, lastOpen, lastHigh, lastLow, lastClose] = lastOHLCV;
    const open = (prevOpen + prevClose) / 2;
    const close = (lastOpen + lastClose + lastHigh + lastLow) / 4;
    const high = Math.max(open, close, lastHigh);
    const low = Math.min(open, close, lastLow);
    const candleAvg = (open + close) / 2;
    const candleSpread = (close - open) / candleAvg;
    const shadowAvg = (high + low) / 2;
    const shadowSpread = (high - low) / shadowAvg;
    const isCandleHollow = () => {
        if (candleAvg < shadowAvg) {
            return true; // indicates upward trend
        } else if (candleAvg > shadowAvg) {
            return false; // indicates downward trend
        } else {
            return prevHollowCandle; // djoi, prevent false flip
        }
    };
    let tick = {
        time: lastTime,
        price: lastClose,
        open: open,
        close: close,
        high: high,
        low: low,
        hollowCandle: isCandleHollow(),
        candleAvg: candleAvg,
        candleSpread: candleSpread,
        shadowAvg: shadowAvg,
        shadowSpread: shadowSpread,
    };

    return tick;
};

/**
 * Initializes account and coinData objects
 * @param {string} base - base asset, ie: USD, USDT, BTC
 * @param {object} account - Object of account data
 * @param {object} coinData - Object of current and previous coin data
 * @param {Class} binanceClient - ccxt.binance client for API requests
 * @param {string} symbol - market pair symbol, ie: BTC/USDT
 */
const initialize = async (base, account, coinData, binanceClient, symbol) => {
    // response: array of last 500 OHLCVs [[ t, o, h, l, c, v], ...]
    const resOHLCV = await binanceClient.fetchOHLCV(symbol);

    // use second to last OHLCV, last OHLCV might be incomplete
    const initialOHLCV = resOHLCV[resOHLCV.length - 2];

    // initialize coinData.previous to have first response data
    coinData.previous = createHeikinAshiTick(
        initialOHLCV, // pass the full array for creation
        initialOHLCV[1], // open, initializes previous.open
        initialOHLCV[4], // close, initializes previous.close
        true // initialize true for starting hollowCandle state
    );

    // request account balance & initialize account information
    const accountBalance = await binanceClient.fetchBalance();
    account.startingBalance = accountBalance.free[base];
    account.theoryBalance = account.startingBalance;
    account.binanceFee = 1 - accountBalance.info.takerCommission / 10000;
};

// Interval function
/**
 * Interval function that runs via setInterval every X milliseconds
 * The function polls for data, sets it to storage, and factors on Y intervals
 * @param {object} account - Object of account data
 * @param {object} coinData - Object of current and previous coin data
 * @param {Class} binanceClient - ccxt.binance client for API requests
 * @param {string} symbol - market pair symbol, ie: BTC/USDT
 * @param {integer} interval - interval to create candles and factor logic
 * @param {object} storage - Object of arrays to collect OHLC values
 */
const tick = async (
    account,
    coinData,
    binanceClient,
    symbol,
    interval,
    storage
) => {
    // request datetime from fetchTicker endpoint
    const resTicker = await binanceClient.fetchTicker(symbol);
    const ping = { time: resTicker.datetime };

    // response: array of last 500 OHLCVs [[ t, o, h, l, c, v], ...]
    const resOHLCV = await binanceClient.fetchOHLCV(symbol);
    // last candle might be incomplete
    const lastOHLCV = resOHLCV[resOHLCV.length - 2];

    if (storage.timestamp != lastOHLCV[0]) {
        storage.timestamp = lastOHLCV[0];
        storage.o.push(lastOHLCV[1]);
        storage.h.push(lastOHLCV[2]);
        storage.l.push(lastOHLCV[3]);
        storage.c.push(lastOHLCV[4]);
        // console.log(storage);

        if (storage.o.length == interval) {
            const o = storage.o[0];
            const h = Math.max(...storage.h);
            const l = Math.min(...storage.l);
            const c = storage.c[storage.o.length - 1];
            const storageToFactor = [0, o, h, l, c, 0];
            const { open, close, hollowCandle } = coinData.previous;
            let intervalTick = createHeikinAshiTick(
                storageToFactor,
                open,
                close,
                hollowCandle
            );
            coinData.current = intervalTick;

            factorVolatility(account, coinData); // Runs primary algorithm

            coinData.previous = coinData.current; // set previous to current each factor
            storage.o = [];
            storage.h = [];
            storage.l = [];
            storage.c = [];

            const {
                candleAvg,
                candleSpread,
                shadowAvg,
                shadowSpread,
            } = coinData.current;
            console.log(ping);
            console.log('Balance:', account.theoryBalance);
            console.log(symbol, lastOHLCV[4]);
            console.log('Hollow Candle:', coinData.current.hollowCandle);
            console.log('Candle Avg, Spread:', candleAvg, candleSpread);
            console.log('Shadow Avg, Spread:', shadowAvg, shadowSpread);
        }
    }
};

// Primary runner
const run = () => {
    const args = parseArgs(process.argv.slice(2)); // command line arguments
    const asset = `${args.ASSET}`; // Coin asset
    const base = `${args.BASE}`; // Base coin for asset (USD, USDT, BTC usually)
    const interval = `${args.INTERVAL}`; // interval to factor candles (15-20 ideal)
    const symbol = `${asset}/${base}`; // symbol used by API calls (BTC/USD, ETH/USD)
    console.log(args);

    // Instantiate binance client using the US binance API
    const binanceClient = new ccxt.binanceus({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });

    // Account object for storing and mutating account values
    let account = {
        startingBalance: 0,
        theoryBalance: 0,
        binanceFee: 0,
    };

    // CoinData object for storing and mutating current stage of coin price
    let coinData = {
        coinID: asset,
        currency: base,
        current: {},
        previous: {},
    };

    // Storage object of arrays for collecting intervals of OHLC ticks
    let storage = {
        timestamp: [],
        o: [],
        h: [],
        l: [],
        c: [],
    };

    // Initialize the account and coin data
    initialize(base, account, coinData, binanceClient, symbol);

    // Poll every 5000 milliseconds and run tick()
    setInterval(
        tick,
        5000,
        account,
        coinData,
        binanceClient,
        symbol,
        interval,
        storage
    );
};

// Fire it up
run();
