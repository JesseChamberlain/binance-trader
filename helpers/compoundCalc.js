/**
 * Compound the principal based on rate and period, then return the total.
 * @param {number} srt - Initial amount, principal.
 * @param {number} prct - percentage per compound period as a decimal.
 * @param {number} len - periods to compound.
 * @return {number} compounded principal.
 */
function compound(srt, prct, len) {
    let total = srt
    for (let i = 0; i < len; i++) {
        total = total + total * prct
    }
    return total
}

/**
 * Return a readable, dollar rounded, version of the compounded principal.
 * @param {number} x - float number to be trimmed and stringified.
 * @return {string} number as string with 2pt decimal and commas.
 */
function stringifyNumWithCommas(number) {
    return number.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Object to be compounded
const config = {
    initialAmount: 1000,
    returnRateAsDecimal: 0.01,
    compoundedPeriods: 365,
}

// Pass the config to the compound function and set to a var
const compounded = compound(
    config.initialAmount,
    config.returnRateAsDecimal,
    config.compoundedPeriods
)

// print it out
console.log(`total $${stringifyNumWithCommas(compounded)}`)
