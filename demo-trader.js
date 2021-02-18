require('dotenv').config();
const ccxt = require('ccxt');
const axios = require('axios');
const { createCoinGeckoURL } = require('./helpers/coinGeckoURL');

const tick = async (config, binanceClient) => {
    const {
        asset,
        assetID,
        base,
        baseID,
        currency,
        spread,
        allocation,
    } = config;
    const market = `${asset}/${base}`;

    // Create API urls for price lookup
    const assetURL = createCoinGeckoURL(assetID, currency);
    const baseURL = createCoinGeckoURL(baseID, currency);

    // Cancel open orders left from previous tick, if any
    const orders = await binanceClient.fetchOpenOrders(market);
    orders.forEach(async (order) => {
        await binanceClient.cancelOrder(order.id, order.symbol);
    });

    // Fetch current market prices
    const results = await Promise.all([
        axios.get(assetURL),
        axios.get(baseURL),
    ]);
    const marketPrice =
        results[0].data.litecoin.usd / results[1].data.tether.usd;

    // Calculate new order parameters
    const sellPrice = marketPrice * (1 + spread);
    const buyPrice = marketPrice * (1 - spread);
    const balances = await binanceClient.fetchBalance();
    const assetBalance = balances.free[asset];
    const baseBalance = balances.free[base];
    const sellVolume = assetBalance * allocation;
    const buyVolume = (baseBalance * allocation) / marketPrice;

    // Send orders
    await binanceClient.createLimitSellOrder(market, sellVolume, sellPrice);
    await binanceClient.createLimitBuyOrder(market, buyVolume, buyPrice);

    // Log to terminal
    console.log(`
        New tick for ${market}...
        Created limit sell order for ${sellVolume}@${sellPrice}
        Created limit buy order for ${buyVolume}@${buyPrice}
    `);
};

const run = () => {
    const config = {
        asset: 'LTC', // LiteCoin
        assetID: 'litecoin', // LiteCoin ID
        base: 'USDT', // Tether USD coin
        baseID: 'tether', // Tether ID
        currency: 'usd', // Currency for comparison
        allocation: 0.1, // Percentage of available funds
        spread: 0.2, // Percentage above & below preices for sell & buy orders
        tickInterval: 2000, // Duration between each tick, milliseconds
    };
    // Instantiate binance client using the US binance API
    const binanceClient = new ccxt.binanceus({
        apiKey: process.env.API_KEY,
        secret: process.env.API_SECRET,
    });
    tick(config, binanceClient);
    setInterval(tick, config.tickInterval, config, binanceClient);
};

run();
