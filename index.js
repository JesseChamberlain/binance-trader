require('dotenv').config();
const ccxt = require('ccxt');

const tick = async (config, binanceClient) => {
    const { asset, base } = config;
    const marketSymbol = `${asset}/${base}`;
    const binanceTicker = await binanceClient.fetchTicker(marketSymbol);

    // Sell order
    const sellOrder = await binanceClient.createOrder(
        marketSymbol,
        'market',
        'sell',
        1,
        binanceTicker
    );
    // buy order
    const buyOrder = await binanceClient.createOrder(
        marketSymbol,
        'market',
        'buy',
        1,
        binanceTicker
    );
    console.log(binanceTicker.last);
    console.log(sellOrder);
    console.log(buyOrder);
};

const run = () => {
    const config = {
        asset: 'LTC', // LiteCoin
        base: 'USDT', // Tether USD coin
    };
    // Instantiate binance client using the US binance API
    const binanceClient = new ccxt.binanceus({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });
    tick(config, binanceClient);
    setInterval(tick, 5000, config, binanceClient);
};

run();
