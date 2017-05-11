var fetch = require('node-fetch-polyfill');

async function getQuote(scrip) {
    console.log(`https://www.google.com/finance/info?q=${scrip}`)
    var response = await fetch(`https://www.google.com/finance/info?q=${scrip}`)
    var resultText = await response.text();
    console.log(resultText.substr(2));
    var quote = JSON.parse(resultText.substr(2));
    return {
        scrip:quote[0].t,
        volume:0,
        ltt:0,
        ltp:parseFloat(quote[0].l_fix),
        prevClose:parseFloat(quote[0].pcls_fix)
    }
}

getQuote('HINDALCO').then(console.log);