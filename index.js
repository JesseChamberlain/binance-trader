const dataRaw = require('./data/2021_18_02/dataRaw.json');

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
function runData(startAccountValue, startPrice, assetID, currency, data) {
    let theoryVal = startAccountValue; // end $ value of account after running through data
    let previousPrice = startPrice; // param to iterate off of
    let previousTrendUp = true; // boolean for previous trending
    let isCurrentTrendUp = true; // boolean for current trending
    let binanceFee = 0.99925;

    console.log(`
        Starting new Data set
        ****************************
    `);

    // loop through all price objects in data json array
    data.forEach((priceObj) => {
        let currentPrice = priceObj[assetID][currency];

        // only factor if the current price is different from previous
        if (currentPrice !== previousPrice) {
            let valPrcntModifier = currentPrice / previousPrice;
            isCurrentTrendUp = currentPrice > previousPrice ? true : false;

            // primary logic
            if (isCurrentTrendUp && previousTrendUp) {
                // multiply theoryVal by modifier to mimic held value
                theoryVal = theoryVal * valPrcntModifier;
            } else if (!isCurrentTrendUp && previousTrendUp) {
                // multiple by modifier and binance fee to mimic market sell
                theoryVal = theoryVal * valPrcntModifier * binanceFee;
                previousTrendUp = false;
            } else if (isCurrentTrendUp && !previousTrendUp) {
                // mimics buy in and resets previousTrendUp to true
                previousTrendUp = true;
            }

            console.log(
                `TheoryVal: $${roundToTwo(
                    theoryVal
                )} CurPrice: $${currentPrice} Trending?: ${isCurrentTrendUp}`
            );

            // set the previous to current at end of each priceObj loop
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
runData(100, 226.2, 'litecoin', 'usd', dataRaw); // ends up
