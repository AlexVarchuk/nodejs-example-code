const request = require('request');
module.exports = {
  run: async function() {
    sails.log.info(new Date().toISOString(), '-', 'Run update exchange rates job');

    const currencies = await Currency.find();
    const realCurrencies = [];
    currencies.forEach(async item => {
      realCurrencies.push(item['realSymbol']);
    });
    const url = `http://data.fixer.io/api/latest?access_key=${sails.config.fixerApiKey}&symbols=${realCurrencies.toString()}&format=1`;

    request(
      {
        url: url,
        json: true,
      },
      async (error, response, body) => {
        if (!error && response.statusCode === 200) {
          console.log(body);
          currencies.forEach(async item => {
            const realRate = body.rates[item['realSymbol']];

            await ExchangeRateHistory.create({
              realSymbol: item['realSymbol'],
              symbol: item['symbol'],
              exchangeRate: realRate,
              baseCurrency: body.base,
            }).fetch();
          });
        }
      },
    );
  },
};
