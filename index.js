const data1 = require('./helpers/volatility/dataStartUp1.json');
const data2Trim = require('./data/2021_17_02/dataTrimmed.json');
const data3Trim = require('./data/2021_18_02/dataTrimmed.json');
const data4Raw = require('./data/2021_19_02/dataRaw.json');
const data4Trim = require('./data/2021_19_02/dataTrimmed.json');

/**
 * Returns number rounded to two decimal places.
 * @param {number} num - float number to be rounded.
 * @return {number} rounded number.
 */
function roundToTwo(num) {
    return Math.round(num * 100) / 100;
}

/**
 * Runs data through logic and logs to console
 * @param {Array} data - JSON array of price objects.
 * @param {Array} startAccountValue - Initial account value.
 * @param {Array} startPrice - Initial price to work from.
 */
function runData(startAccountValue, startPrice, data) {
    let theoryVal = startAccountValue; // end $ value of account after running through data
    let previousPrice = startPrice; // param to iterate off of
    let previousTrendUp = true; // boolean for previous trending
    let isCurrentTrendUp = true; // boolean for current trending
    let binanceFee = 0.99925;

    console.log(`
        Starting new Data set
        ****************************
    `);

    // loop through all price objects in data array
    data.forEach((priceObj) => {
        let currentPrice = priceObj.price;

        // only factor if the current price is different from previous
        if (currentPrice !== previousPrice) {
            let valPrcntModifier = currentPrice / previousPrice;
            isCurrentTrendUp = currentPrice > previousPrice ? true : false;

            // only add to theory value if the price is trending upward
            if (isCurrentTrendUp && previousTrendUp) {
                theoryVal = theoryVal * valPrcntModifier;
            } else if (!isCurrentTrendUp && previousTrendUp) {
                theoryVal = theoryVal * valPrcntModifier * binanceFee;
                previousTrendUp = false;
            } else if (isCurrentTrendUp && !previousTrendUp) {
                previousTrendUp = true;
            }

            console.log(
                `TheoryVal: $${roundToTwo(
                    theoryVal
                )} CurPrice: $${currentPrice} Trending?: ${isCurrentTrendUp}`
            );

            previousPrice = currentPrice;
        }
    });

    console.log(`
        Starting Value: $${startAccountValue} 
        Theory Value: $${roundToTwo(theoryVal)} 

        Starting Price: $${startPrice} 
        Current Price: $${previousPrice} 
        -----------------------------------
    `);
}

// Initialize runners
runData(100, 4.09, data1); // mock
runData(100, 231.4, data2Trim); // ends down
runData(100, 226.2, data3Trim); // ends up
runData(100, 0.054948, data4Raw); // ends up
runData(100, 0.054948, data4Trim); // ends up
