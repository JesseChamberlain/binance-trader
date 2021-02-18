const axios = require('axios');
const { createCoinGeckoURL } = require('./helpers/coinGeckoURL');
const fs = require('fs');

const tick = async (config) => {
    const { assetID, currency } = config;
    const assetURL = createCoinGeckoURL(assetID, currency);

    const resData = await axios.get(assetURL).then((response) => {
        return response.data;
    });

    console.log(resData);

    fs.readFile(
        './dataCollection.json',
        'utf8',
        function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                let obj = JSON.parse(data); //now it an object
                console.log(obj);
                obj.push(resData); //add some data
                let jsonData = JSON.stringify(obj); //convert it back to json
                fs.writeFile(
                    './dataCollection.json',
                    jsonData,
                    'utf8',
                    (err) => {
                        if (err) {
                            console.log('Error writing file', err);
                        } else {
                            console.log('Successfully wrote file');
                        }
                    }
                ); // write it back
            }
        }
    );
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
