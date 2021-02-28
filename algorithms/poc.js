require('dotenv').config();
const ccxt = require('ccxt');
var parseArgs = require('minimist');

/**
 * Runs data through logic and logs to console
 * @param {object} account - JSON object
 * @param {object} coinData - JSON object
 */
const factorVolatility = (account, coinData) => {
    let valPrcntModifier = coinData.current.price / coinData.previous.price;

    if (
        coinData.current.heikinAshi.hollowCandle &&
        coinData.previous.heikinAshi.hollowCandle
    ) {
        // multiply theoryVal by modifier to mimic held value
        account.theoryBalance = account.theoryBalance * valPrcntModifier;
    } else if (
        !coinData.current.heikinAshi.hollowCandle &&
        coinData.previous.heikinAshi.hollowCandle
    ) {
        // multiple by modifier and binance fee to mimic market sell
        account.theoryBalance =
            account.theoryBalance * valPrcntModifier * account.binanceFee;
    }
};

const createTick = (lastOHLCV, prevOpen, prevClose) => {
    const open = lastOHLCV[1];
    const high = lastOHLCV[2];
    const low = lastOHLCV[3];
    const close = lastOHLCV[4];
    const heikinAshiOpen = (prevOpen + prevClose) / 2;
    const heikinAshiClose = (open + close + high + low) / 4;
    const heikinAshiHigh = Math.max(heikinAshiOpen, heikinAshiClose, high);
    const heikinAshiLow = Math.min(heikinAshiOpen, heikinAshiClose, low);
    const candleAvg = (heikinAshiOpen + heikinAshiClose) / 2;
    const shadowAvg = (heikinAshiHigh + heikinAshiLow) / 2;
    const hollowCandle = candleAvg <= shadowAvg ? true : false; // will need to account for doji, currently "=" will be hollow
    let tick = {
        price: close,
        heikinAshi: {
            open: heikinAshiOpen,
            close: heikinAshiClose,
            high: heikinAshiHigh,
            low: heikinAshiLow,
            hollowCandle: hollowCandle,
        },
    };

    return tick;
};

// Interval function
const tick = async (
    coinData,
    account,
    binanceClient,
    symbol,
    base,
    interval
) => {
    /** request ticker info & initialize previous price with live price
     *  Note that the info from the last (current) candle may be incomplete
     *  until the candle is closed (until the next candle starts).
     *
     *  Utilize the timestamp to identify new candles and add them to storage
     *  [
     *      1504541580000, // UTC timestamp in milliseconds, integer
     *      4235.4,        // (O)pen price, float
     *      4240.6,        // (H)ighest price, float
     *      4230.0,        // (L)owest price, float
     *      4230.7,        // (C)losing price, float
     *      37.72941911    // (V)olume (in terms of the base currency), float
     *  ]
     */
    const symbolOHLCV = await binanceClient.fetchOHLCV(symbol);
    symbolOHLCV.pop(); // last candle might be incomplete
    const initialOHLCV = symbolOHLCV[0];
    let initializeTick = createTick(
        initialOHLCV,
        initialOHLCV[1], // open
        initialOHLCV[4] // close
    );
    coinData.previous = initializeTick;
    const accountBalance = await binanceClient.fetchBalance(); // request account balance & initialize account information
    account.startingBalance = accountBalance.free[base];
    account.theoryBalance = account.startingBalance;
    account.binanceFee = 1 - accountBalance.info.takerCommission / 10000;
    let storage = {
        o: [],
        h: [],
        l: [],
        c: [],
    };

    // itterate, map and pass a candle every {interval} instances
    symbolOHLCV.forEach((lastOHLCV) => {
        storage.o.push(lastOHLCV[1]);
        storage.h.push(lastOHLCV[2]);
        storage.l.push(lastOHLCV[3]);
        storage.c.push(lastOHLCV[4]);

        if (storage.o.length == interval) {
            const o = storage.o[storage.o.length - 1];
            const h = Math.max(...storage.h);
            const l = Math.min(...storage.l);
            const c = storage.c[0];
            const storageToFactor = [0, o, h, l, c, 0];
            const { open, close } = coinData.previous.heikinAshi;
            let intervalTick = createTick(storageToFactor, open, close);
            coinData.current = intervalTick;

            factorVolatility(account, coinData); // Runs primary algorithm

            coinData.previous = coinData.current; // set previous to current each factor
            storage = {
                o: [],
                h: [],
                l: [],
                c: [],
            };
        }
    });

    console.log(
        account,
        symbolOHLCV[0][4],
        symbolOHLCV[symbolOHLCV.length - 1][4]
    );
};

// Primary runner
const run = () => {
    const args = parseArgs(process.argv.slice(2)); // command line arguments
    const asset = `${args.ASSET}`; // Coin asset
    const base = `${args.BASE}`; // Base coin for asset (USD, USDT, BTC usually)
    const interval = `${args.INTERVAL}`; // interval to factor candles (5 ideal)
    const symbol = `${asset}/${base}`; // symbol used by API calls
    console.log(args);

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

    // Instantiate binance client using the US binance API
    const binanceClient = new ccxt.binanceus({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });

    tick(coinData, account, binanceClient, symbol, base, interval);
};

run();
