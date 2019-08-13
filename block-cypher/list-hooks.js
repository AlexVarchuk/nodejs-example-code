const { blockcypherToken, blockchain: { testnet } } = sails.config;
const Bcypher = require('blockcypher');

module.exports = {
  inputs: {},
  exits: {},
  fn: async function(inputs, exits) {
    const bcapi = new Bcypher('btc', testnet ? 'test3' : 'main', blockcypherToken);
    bcapi.listHooks(printResponse);

    function printResponse(err, data) {
      if(err !== null) {
        return exits.success(err);
      }

      return exits.success(data);
    }
  }
};
