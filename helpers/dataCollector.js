const axios = require('axios');
const { createCoinGeckoURL } = require('./coinGeckoURL');
const fs = require('fs');

const tick = async (config) => {
    const { assetID, currency } = config;
    const assetURL = createCoinGeckoURL(assetID, currency);

    // request price from API
    const resData = await axios.get(assetURL).then((response) => {
        return response.data;
    });

    console.log(resData);

    // Opens /data/collector.json (array json) and adds the data response to the array.
    fs.readFile(
        './data/collector.json',
        'utf8',
        function readFileCallback(err, data) {
            if (err) {
                console.log(err);
            } else {
                let collectorArray = JSON.parse(data); // renders file to object
                collectorArray.push(resData); // add the response data
                console.log(collectorArray); // log to make sure it's working
                let jsonData = JSON.stringify(collectorArray); //convert it back to json

                // writes back to the file
                fs.writeFile(
                    './data/collector.json',
                    jsonData,
                    'utf8',
                    (err) => {
                        if (err) {
                            console.log('Error writing file', err);
                        } else {
                            console.log('Successfully wrote file');
                        }
                    }
                );
            }
        }
    );
};

const run = () => {
    const config = {
        assetID: 'dogecoin', // LiteCoin ID
        currency: 'usd', // Currency for comparison
        tickInterval: 30000, // Duration between each tick, milliseconds
    };

    tick(config);
    setInterval(tick, config.tickInterval, config);
};

run();
