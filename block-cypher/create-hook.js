/**
 * BlockCypherService
 *
 * description:: Bitcoin explorer service
 */

const { custom: { backendUrl }, blockcypherToken, blockchain: { testnet } } = sails.config;

function makeUrl(addressId) {
  return backendUrl + '/api/ico/blockcypher/hook/' + addressId;
}
const Bcypher = require('blockcypher');

module.exports = {
  friendlyName: 'Check exists of email',

  description: 'Check if email is not yet in database as current or candidate email of user',

  inputs: {
    address: { type: 'string' },

    addressId: { type: 'string' }
  },

  exits: {
    success: { description: 'return is email available' }
  },

  fn: async function(inputs, exits) {
    const bcapi = new Bcypher('btc', testnet ? 'test3' : 'main', blockcypherToken);
    const {
      address,
      addressId
    } = inputs;

    bcapi.createHook({
      event: 'tx-confirmation',
      address,
      url: makeUrl(addressId),
      confirmations: 6,
      callback_errors: 50
    }, printResponse);

    function printResponse(err, data) {
      if(err !== null) {
        return exits.success(err);
      }

      return exits.success(data);
    }
  }
};
