const data1 = require('./dataStartUp1.json');
const data2 = require('./dataStartUp2.json');
const data3 = require('./dataStartUp3.json');

/**
 * Returns number rounded to two decimal places.
 * @param {number} num - float number to be rounded.
 * @return {number} rounded number.
 */
function roundToTwo (num) {
  return Math.round(num * 100) / 100;
}

/**
 * Checks if the price is higher than previous
 * @param {number} prevPrice - previous price.
 * @param {number} current - current price.
 * @param {boolean} prevTrend - boolean for previous trend.
 * @return {boolean} 
 */
function isCurrentTrendUp (prevPrice, current, prevTrend) {
  let isCurrentPriceHigher = current > prevPrice ? true : false;
  let factorTrend = isCurrentPriceHigher || prevTrend ? true : false;

  if (factorTrend) {
    previousTrend = false;
  }

  return factorTrend;
}

/**
 * Runs data through logic and logs to console
 * @param {Array} data - JSON array of price objects.
 */
function runData (data) {
  let startVal = 10.00;     // representation of account $ total
  let theoryVal = startVal; // end $ value of account after running through data
  let previousPrice = 4.05; // param to iterate off of
  let previousTrend = true; // boolean to hold trending 

  // loop through all price objects in data array
  data.forEach((priceObj, index) => {
    let currentPrice = priceObj.price;
    let valPrcntModifier = currentPrice / previousPrice;
    let trendingUpward = isCurrentTrendUp(previousPrice, currentPrice, previousTrend);

    // only add to theory value if the price is trending upward
    if (trendingUpward) {
      theoryVal = (theoryVal * valPrcntModifier) * .9925;
    }

    console.log(roundToTwo(theoryVal), currentPrice, trendingUpward);
    previousPrice = currentPrice;
  });
}

// Initialize runner
runData(data1);
