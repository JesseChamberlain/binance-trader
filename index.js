const axios = require('axios');
const { createCoinGeckoURL } = require('./helpers/coinGeckoURL');

const tick = async (config) => {
    const { assetID, currency } = config;
    const assetURL = createCoinGeckoURL(assetID, currency);

    axios.get(assetURL).then((response) => {
        console.log(response.data);
    });
};

const run = () => {
    const config = {
        assetID: 'litecoin', // LiteCoin ID
        currency: 'usd', // Currency for comparison
        tickInterval: 15000, // Duration between each tick, milliseconds
    };

    tick(config);
    setInterval(tick, config.tickInterval, config);
};

run();
