const fs = require('fs');

/**
 * Creates the file that the data will be stored to
 * @param {Object} coinData - object to pull base and asset from
 * @return {string} filePath - path to created JSON file
 */
const createCollectionJSON = (coinData) => {
    const time = new Date();
    const year = time.getFullYear();
    const day = time.getDate();
    const month = time.getMonth() + 1; // stupid base zero month
    let filePath = `./data/${year}_${month}_${day}_${coinData.coinID}_${coinData.currency}.json`;

    // create the JSON file with an empty array
    fs.writeFile(filePath, JSON.stringify([]), 'utf8', (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log(`Successfully created ${filePath}`);
        }
    });

    return filePath;
};

/**
 * Opens /data/collector.json (array json) and adds the response data to the array.
 * @param {object} ping - object to be added to the data file
 * @param {string} filePath - path to created JSON file
 */
const collect = (ping, filePath) => {
    const copiedPing = JSON.parse(JSON.stringify(ping));

    fs.readFile(filePath, 'utf8', function readFileCallback(err, data) {
        if (err) {
            console.log(err);
        } else {
            let collectorArray = JSON.parse(data); // renders file to object
            collectorArray.push(copiedPing); // add the ping response data
            let jsonData = JSON.stringify(collectorArray); // convert it back to json
            // writes above vars back to the file
            fs.writeFile(filePath, jsonData, 'utf8', (err) => {
                if (err) {
                    console.log('Error writing file', err);
                } else {
                    console.log(`Successfully wrote to ${filePath}`);
                }
            });
        }
    });
};

exports.createCollectionJSON = createCollectionJSON;
exports.collect = collect;
