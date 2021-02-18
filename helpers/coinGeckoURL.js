/**
 * Creates a dynamic api link to retrieve the /simple/price between a given id and currency .
 * @param {string} id - id of coin.
 * @param {string} currency - currency as base comparision.
 * @return {string} complete url.
 */
const createCoinGeckoURL = (id, currency) => {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=${currency}`;
    return url;
};

exports.createCoinGeckoURL = createCoinGeckoURL;
