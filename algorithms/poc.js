require('dotenv').config();
const ccxt = require('ccxt');
var parseArgs = require('minimist');

/**
 * Runs data through logic and logs to console
 * @param {object} data - JSON object from API call.
 * @param {number} startAccountValue - Initial account value.
 */
const factorVolatility = (account, coinData) => {
    let valPrcntModifier = coinData.current.price / coinData.previous.price;
    // console.log(
    //     `Hollow: ${coinData.current.heikinAshi.hollowCandle}, Price: `,
    //     coinData.current.price
    // );

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

    // will need to account for doji, currently "=" will be hollow
    const hollowCandle = candleAvg <= shadowAvg ? true : false;
    let tick = {
        price: close,
        hollowHACandle: hollowCandle,
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
     *  Note that the info from the last (current) candle may be incomplete until the candle is closed (until the next candle starts).
     *
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
    symbolOHLCV.pop();
    const initialOHLCV = symbolOHLCV[0];

    let initializeTick = createTick(
        initialOHLCV,
        initialOHLCV[1], // open
        initialOHLCV[4] // close
    );
    coinData.previous = initializeTick;

    // request account balance & initialize account information
    const accountBalance = await binanceClient.fetchBalance();
    account.startingBalance = accountBalance.free[base];
    account.theoryBalance = account.startingBalance;
    account.binanceFee = 1 - accountBalance.info.takerCommission / 10000;

    const intervalFactor = interval;
    let storage = {
        o: [],
        h: [],
        l: [],
        c: [],
    };

    // this could work, need to map and take an average of every 5 instances
    symbolOHLCV.forEach((lastOHLCV, index) => {
        storage.o.push(lastOHLCV[1]);
        storage.h.push(lastOHLCV[2]);
        storage.l.push(lastOHLCV[3]);
        storage.c.push(lastOHLCV[4]);

        if (index % intervalFactor === 0 && index != 0) {
            const o = storage.o[storage.o.length - 1];
            const h = Math.max(...storage.h);
            const l = Math.min(...storage.l);
            const c = storage.c[0];
            const storageToFactor = [0, o, h, l, c, 0];
            const { open, close } = coinData.previous.heikinAshi;
            let intervalTick = createTick(storageToFactor, open, close);
            coinData.current = intervalTick;

            // Runs primary algorithm
            factorVolatility(account, coinData);

            // set the previous to current at end of each priceObj loop
            coinData.previous = coinData.current;
            storage = {
                o: [],
                h: [],
                l: [],
                c: [],
            };
        }
    });

    console.log(account, symbolOHLCV[symbolOHLCV.length - 1]);
};

// Primary runner
const run = () => {
    let args = parseArgs(process.argv.slice(2));
    const config = {
        asset: `${args.ASSET}`, // Coin asset to test
        base: `${args.BASE}`, // Base coin for asset (USD, USDT, BTC usually)
        interval: `${args.INTERVAL}`, // interval to factor candles
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

    // Instantiate binance client using the US binance API
    const binanceClient = new ccxt.binanceus({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });
    console.log(args);

    tick(
        coinData,
        account,
        binanceClient,
        symbol,
        config.base,
        config.interval
    );
};

run();
