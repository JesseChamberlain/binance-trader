require('dotenv').config();
const ccxt = require('ccxt');
const axios = require('axios');
const { createCoinGeckoURL } = require('./helpers/coinGeckoURL');

const tick = async (config, binanceClient) => {
    const { asset, assetID, base, baseID, currency } = config;
    const marketSymbol = `${asset}/${base}`;

    // Create API urls for price lookup
    const assetURL = createCoinGeckoURL(assetID, currency);
    const baseURL = createCoinGeckoURL(baseID, currency);

    // Fetch current market prices
    const results = await Promise.all([
        axios.get(assetURL),
        axios.get(baseURL),
    ]);
    const assetPrice = results[0].data.litecoin.usd;
    const basePrice = results[1].data.tether.usd;

    // Sell order
    const sellOrder = await binanceClient.createOrder(
        marketSymbol,
        'market',
        'sell',
        1,
        assetPrice
    );
    // Sell order
    const buyOrder = await binanceClient.createOrder(
        marketSymbol,
        'market',
        'buy',
        1,
        assetPrice
    );
    console.log(sellOrder);
    console.log(buyOrder);
    console.log(assetPrice);
    console.log(basePrice);
};

const run = () => {
    const config = {
        asset: 'LTC', // LiteCoin
        assetID: 'litecoin', // LiteCoin ID
        base: 'USDT', // Tether USD coin
        baseID: 'tether', // Tether ID
        currency: 'usd', // Currency for comparison
    };
    // Instantiate binance client using the US binance API
    const binanceClient = new ccxt.binanceus({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });
    tick(config, binanceClient);
};

run();
