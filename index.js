const data1 = require('./helpers/volatility/dataStartUp1.json');
const data2 = require('./data/2021_17_02/dataTrimmed.json');
const data3 = require('./data/2021_18_02/dataTrimmed.json');

/**
 * Returns number rounded to two decimal places.
 * @param {number} num - float number to be rounded.
 * @return {number} rounded number.
 */
function roundToTwo(num) {
    return Math.round(num * 100) / 100;
}

/**
 * Checks if the price is higher than previous
 * @param {number} prevPrice - previous price.
 * @param {number} current - current price.
 * @param {boolean} prevTrend - boolean for previous trend.
 * @return {boolean}
 */
function isCurrentTrendUp(prevPrice, current, prevTrend) {
    let isCurrentPriceHigher = current > prevPrice ? true : false;
    let factorTrend = isCurrentPriceHigher || prevTrend ? true : false;

    // if (factorTrend) {
    //     previousTrend = false
    // }

    return factorTrend;
}

/**
 * Runs data through logic and logs to console
 * @param {Array} data - JSON array of price objects.
 */
function runData(data) {
    let startVal = 10.0; // representation of account $ total
    let theoryVal = startVal; // end $ value of account after running through data
    let previousPrice = 4.05; // param to iterate off of
    let previousTrend = true; // boolean to hold trending

    // loop through all price objects in data array
    data.forEach((priceObj) => {
        let currentPrice = priceObj.price;
        let valPrcntModifier = currentPrice / previousPrice;
        let trendingUpward = isCurrentTrendUp(
            previousPrice,
            currentPrice,
            previousTrend
        );

        // only add to theory value if the price is trending upward
        if (trendingUpward) {
            theoryVal = theoryVal * valPrcntModifier * 0.9925;
        }

        console.log(roundToTwo(theoryVal), currentPrice, trendingUpward);
        previousPrice = currentPrice;
    });
}

// Initialize runners
runData(data1);
runData(data2);
runData(data3);
