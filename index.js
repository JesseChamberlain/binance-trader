const axios = require('axios');
const { createCoinGeckoURL } = require('./helpers/coinGeckoURL');
// const fs = require('fs');

const tick = async (config) => {
    const { assetID, currency } = config;
    const assetURL = createCoinGeckoURL(assetID, currency);

    const resData = await axios.get(assetURL).then((response) => {
        return response.data;
    });

    console.log(resData);
    // fs.writeFile('./dataCollection.json', responseData);
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
