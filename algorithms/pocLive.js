/* eslint-disable node/no-unpublished-require */
require('dotenv').config();
const ccxt = require('ccxt');
const parseArgs = require('minimist');
const data = require('../helpers/dataCollectors');
// eslint-disable-next-line no-unused-vars
const colors = require('colors');

/**
 * Creates a current moving avg from h.a. close (ohlc/4) of current & previous ticks
 * @param {object} coinData - Object of current and previous coin data
 * @return {float} - returns moving average as a float
 */
const factorMovingAvg = (coinData) => {
    const { current, previous } = coinData;

    // create an array of all current and previous closes
    let closes = [];
    closes.push(current.close);
    previous.forEach((tick) => {
        closes.push(tick.close);
    });

    // take the average of all closes
    const movingAvg = closes.reduce((a, b) => a + b, 0) / closes.length;

    return movingAvg;
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
    prevHollowCandle,
    owned
) => {
    const [
        lastTime,
        lastOpen,
        lastHigh,
        lastLow,
        lastClose,
        lastVol,
    ] = lastOHLCV;
    const open = (prevOpen + prevClose) / 2;
    const close = (lastOpen + lastClose + lastHigh + lastLow) / 4;
    const high = Math.max(open, close, lastHigh);
    const low = Math.min(open, close, lastLow);
    const candleAvg = (open + close) / 2;
    const candleSpread = (close - open) / candleAvg;
    const shadowAvg = (high + low) / 2;
    const shadowSpread = (high - low) / shadowAvg;

    // TODO: this should really be a separate function
    const isCandleHollow = () => {
        if (candleAvg < shadowAvg) {
            return true; // indicates upward trend
        } else if (candleAvg > shadowAvg) {
            return false; // indicates downward trend
        } else {
            console.log('djoi, prevented false flip'.brightYellow);
            return prevHollowCandle; // djoi, prevent false flip
        }
        // if (candleAvg < shadowAvg) {
        //     return true; // indicates upward trend
        // } else if (candleAvg > shadowAvg) {
        //     if (prevHollowCandle && Math.abs(candleSpread) < 0.001) {
        //         console.log('almost djoi, prevented false flip'.brightYellow);
        //         return true; // almost djoi, prevent false flip
        //     } else {
        //         return false; // indicates downward trend
        //     }
        // } else {
        //     console.log('djoi, prevented false flip'.brightYellow);
        //     return prevHollowCandle; // djoi, prevent false flip
        // }
    };

    let tick = {
        time: lastTime,
        price: lastClose,
        movingAvg: 0,
        open: open,
        close: close,
        high: high,
        low: low,
        volume: lastVol,
        owned: owned,
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
 * @param {object} coinData - Object of current and previous coin data
 * @param {Class} binanceClient - ccxt.binance client for API requests
 * @param {string} symbol - market pair symbol, ie: BTC/USDT
 */
const initialize = async (
    coinData,
    binanceClient,
    symbol,
    interval,
    storage
) => {
    // response: array of last 500 OHLCVs [[ t, o, h, l, c, v], ...]
    const resOHLCV = await binanceClient.fetchOHLCV(symbol);

    // use second to last OHLCV, last OHLCV might be incomplete
    // Pre-load storage with (interval - 1) amount of OHLCVs
    let index = interval;
    while (index != 1) {
        const lastOHLCV = resOHLCV[resOHLCV.length - index];
        storage.timestamp = lastOHLCV[0];
        storage.o.push(lastOHLCV[1]);
        storage.h.push(lastOHLCV[2]);
        storage.l.push(lastOHLCV[3]);
        storage.c.push(lastOHLCV[4]);
        storage.v.push(lastOHLCV[5]);
        --index;
    }

    console.log('storage initialized');

    // TODO: need to have at least the first previous initialized
    // could possible load all 5 previous to factor initial trending
    const setOHLCV = resOHLCV[resOHLCV.length - interval];
    coinData.previous.push(
        createHeikinAshiTick(
            setOHLCV, // pass the full array for creation
            setOHLCV[1], // open, initializes previous.open
            setOHLCV[4], // close, initializes previous.close
            true, // initialize true for starting hollowCandle state
            false // owned always initialized to false
        )
    );
};

/**
 * Interval function that runs via setInterval every X milliseconds
 * The function polls for data, sets it to storage, and factors on Y intervals
 * @param {object} coinData - Object of current and previous coin data
 * @param {Class} binanceClient - ccxt.binance client for API requests
 * @param {string} symbol - market pair symbol, ie: BTC/USDT
 * @param {integer} interval - interval to create candles and factor logic
 * @param {object} storage - Object of arrays to collect OHLC values
 * @param {string} filePath - path to created JSON file
 */
const tick = async (
    coinData,
    binanceClient,
    symbol,
    interval,
    storage,
    filePath
) => {
    // response: array of last 500 OHLCVs [[ t, o, h, l, c, v], ...]
    const resOHLCV = await binanceClient.fetchOHLCV(symbol);

    // last candle might be incomplete, use 2nd to last
    const lastOHLCV = resOHLCV[resOHLCV.length - 2];

    // if a new timestamp appears, add the OHLCV to storage
    if (storage.timestamp != lastOHLCV[0]) {
        storage.timestamp = lastOHLCV[0];
        storage.o.push(lastOHLCV[1]);
        storage.h.push(lastOHLCV[2]);
        storage.l.push(lastOHLCV[3]);
        storage.c.push(lastOHLCV[4]);
        storage.v.push(lastOHLCV[5]);

        // once an invterval number of items are in storage, create a H.A. tick
        if (storage.o.length == interval) {
            const t = storage.timestamp;
            const o = storage.o[0];
            const h = Math.max(...storage.h);
            const l = Math.min(...storage.l);
            const c = storage.c[storage.o.length - 1];
            const v = storage.v.reduce((a, b) => a + b, 0);
            const storageToFactor = [t, o, h, l, c, v];
            const { open, close, hollowCandle, owned } = coinData.previous[0];

            // passes the selective data above to create a H.A. tick
            let intervalTick = createHeikinAshiTick(
                storageToFactor,
                open,
                close,
                hollowCandle,
                owned
            );
            coinData.current = intervalTick;
            coinData.current.movingAvg = factorMovingAvg(coinData);

            // order
            const binanceTicker = await binanceClient.fetchTicker(symbol);

            // request account balance to set buy/sell
            const { current, previous, coinID, currency } = coinData;
            const accountBalance = await binanceClient.fetchBalance();
            const assetAvailable = accountBalance.free[coinID];
            const baseAvailable = accountBalance.free[currency];
            const amountToBuy =
                Math.round(
                    ((baseAvailable - 1000) / previous[0].price) * 10000
                ) / 10000;

            // Primary conditionals to decide to buy or sell
            // buy
            if (
                current.hollowCandle &&
                !current.owned &&
                current.candleAvg > current.movingAvg
            ) {
                await binanceClient.createOrder(
                    symbol,
                    'market',
                    'buy',
                    amountToBuy,
                    binanceTicker
                );
                current.owned = true;
                console.log('Bought asset!'.brightGreen);
            }

            // sell
            if (
                !current.hollowCandle &&
                current.owned &&
                assetAvailable > 1 &&
                current.candleAvg < current.movingAvg
            ) {
                await binanceClient.createOrder(
                    symbol,
                    'market',
                    'sell',
                    assetAvailable,
                    binanceTicker
                );
                current.owned = false;
                console.log('Sold asset!'.brightRed);
            }

            // request datetime from fetchTicker endpoint
            const resTicker = await binanceClient.fetchTicker(symbol);

            // write current state to the json file
            const ping = {
                time: resTicker.datetime,
                current: coinData.current,
            };
            data.collect(ping, filePath);

            // terminal logging
            console.log(resTicker.datetime);
            console.log(symbol, lastOHLCV[4]);

            // add current tick to begining of coinData.previous array
            coinData.previous.unshift(coinData.current);

            // purge oldest tick, but keep 5 tickets for trend data.
            if (coinData.previous.length > 4) {
                coinData.previous.pop();
            }

            // reset storage and set current to previous
            storage.o = [];
            storage.h = [];
            storage.l = [];
            storage.c = [];
            storage.v = [];
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

    // CoinData object for storing and mutating current state of coin price
    let coinData = {
        coinID: asset,
        currency: base,
        current: {},
        previous: [],
    };

    // Storage object of arrays for collecting intervals of OHLCV ticks
    let storage = {
        timestamp: [],
        o: [],
        h: [],
        l: [],
        c: [],
        v: [],
    };

    // Create filePath for writing data
    const filePath = data.createCollectionJSON(coinData);

    // Initialize the account and coin data
    initialize(coinData, binanceClient, symbol, interval, storage);

    // Poll every 5000 milliseconds and run tick()
    setInterval(
        tick,
        5000,
        coinData,
        binanceClient,
        symbol,
        interval,
        storage,
        filePath
    );
};

// Fire it up
run();
