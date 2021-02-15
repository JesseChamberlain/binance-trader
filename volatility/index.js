const data1 = require('./dataStartUp1.json');
const data2 = require('./dataStartUp2.json');
const data3 = require('./dataStartUp3.json');

// Round to .XX
function roundToTwo (num) {
  return Math.round(num * 100) / 100;
}

// Checks if the price is higher than previous
function isCurrentTrendUp (prevPrice, current, prevTrend) {
  let isCurrentPriceHigher = current > prevPrice ? true : false;
  let factorTrend = isCurrentPriceHigher || prevTrend ? true : false;

  if (factorTrend) {
    previousTrend = false;
  }

  return factorTrend;
}

// Runs main fuction
function runData (data) {
  let startVal = 10.00;
  let theoryVal = startVal;

  // loop through all data objects
  data.forEach((priceObj, index) => {
    let currentPrice = priceObj.price;
    let valPrcntModifier = currentPrice / previousPrice;
    let trendingUpward = isCurrentTrendUp(previousPrice, currentPrice, previousTrend);

    if (trendingUpward) {
      theoryVal = (theoryVal * valPrcntModifier) * .9925;
    }

    console.log(roundToTwo(theoryVal), currentPrice, trendingUpward);
    previousPrice = currentPrice;
  });
}

let previousPrice = 4.05;
let previousTrend = true;

// Runner
runData(data1);
