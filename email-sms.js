const client = require('twilio')(sails.config.twilioAccountSid, sails.config.twilioAuthToken);
module.exports = {
  friendlyName: 'Send sms',

  description: '',

  inputs: {
    phoneNumber: {
      description: 'The confirmation token from the phone.',
      example: '+380661338622',
    },

    phoneProofToken: {
      description: 'The confirmation token from the phone.',
      example: '123456',
    },
  },

  exits: {
    success: {
      description: 'Phone register success',
    },
  },

  fn: async function(inputs, exits) {
    client.messages
      .create({
        to: inputs.phoneNumber,
        from: sails.config.twilioNumberFrom,
        body: `Your code for LandMoney is ${inputs.phoneProofToken}`,
      })
      .then(message => console.log(message.sid));
    return exits.success();
  },
};

module.exports = class SmsService {
  constructor(messagebird_access_key) {
    this.messagebird = require('messagebird')(messagebird_access_key);
  }

  sendSms(phonenumber, message) {
    let thisContext = this;

    return new Promise(function(resolve, reject) {
      var params = {
        originator: 'Relate',
        recipients: [phonenumber],
        body: message,
      };

      thisContext.messagebird.messages.create(params, function(err, response) {
        if (err) {
          console.log(err);
          reject(err);
        }
        console.log(response);
        resolve(response);
      });
    });
  }

  validatePhonenumber(phonenumber) {
    let thisContext = this;

    return new Promise(function(resolve, reject) {
      console.log('phonenumberphonenumber: ' + phonenumber);
      thisContext.messagebird.lookup.read(phonenumber, function(err, response) {
        if (err) {
          console.log(err);
          console.log(response);
          reject(err);
        }
        console.log(response);
        resolve(response);
      });
    });
  }
};

const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(sails.config.sendgridApiKey);

module.exports = {
  inputs: {
    to: {
      type: 'string',
      required: true,
    },

    subject: {
      type: 'string',
    },

    html: {
      type: 'string',
    },
  },

  exits: {},

  fn: async function(inputs, exits) {
    const msg = {
      to: inputs.to,
      from: 'no-reply@land.money',
      subject: inputs.subject || 'Sample subject',
      html: inputs.html || '<h1>sample html</h1>',
    };

    sgMail.send(msg);

    exits.success();
  },
};
