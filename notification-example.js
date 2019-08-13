const request = require('request');
module.exports = {
  inputs: {
    to: {
      type: 'string',
      required: true,
    },

    title: {
      type: 'string',
      required: true,
    },

    body: {
      type: 'string',
      required: true,
    },

    content: {
      type: 'string',
      required: true,
    },

    type: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    success: {},
  },
  fn: async function(inputs, exits) {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `key=${sails.config.firebaseServerKey}`,
    };
    let options = {};
    if (inputs.type === 'Android') {
      options = {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: headers,
        json: {
          data: {
            title: inputs.title,
            body: inputs.body,
            content: inputs.content,
          },
          registration_ids: [inputs.to],
        },
      };
    } else if (inputs.type === 'IOS') {
      options = {
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: headers,
        json: {
          notification: {
            title: inputs.title,
            body: inputs.body,
            sound: 'default',
            content: inputs.content,
          },
          to: inputs.to,
        },
      };
    }

    request(options, async (error, response, body) => {
      if (!error && response.statusCode === 200) {
        console.log(body);
        return exits.success(body);
      } else {
        console.log(error);
        return exits.success(error);
      }
    });
  },
};

//----------- enother example

module.exports = class FcmService {
  constructor(fcm_server_key, datasource) {
    var FCM = require('fcm-node');
    this.fcm = new FCM(fcm_server_key);
    this.datasource = datasource;
  }

  sendFcmMessage(recipient, collapse_key, title, body, data) {
    let thisContext = this;
    let registration_token = recipient.pushtoken;

    return new Promise(function(resolve, reject) {
      let message = {
        // this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: registration_token,
        collapse_key: collapse_key,
        priority: 'high',
        content_available: true,
        data: data,
      };
      let collection = thisContext.datasource.connector.collection('Notification');
      collection.aggregate(
        [
          {
            $match: {
              $and: [{ ownerUserId: recipient.id }, { unread: true }, { type: { $ne: 'meet' } }],
            },
          },
          { $group: { _id: '$ownerUserId', total: { $sum: 1 } } },
        ],
        function(err, rows) {
          let unread = 0;
          if (!err && rows.length > 0) {
            unread = rows[0].total;
          }

          if (title && body && !recipient.isAndroid) {
            message.notification = {
              title: title,
              body: body,
              badge: unread,
              sound: 'notification.wav',
            };
          } else if (title && body && recipient.isAndroid) {
            message.data.notification_title = title;
            message.data.notification_body = body;
            message.data.notification_badge = unread;
            message.data.notification_sound = 'notification.wav';
          }
          console.log(`FCM notify ${recipient.name} of ${title} with badge ${unread}`);
          thisContext.fcm.send(message, function(err, response) {
            if (err) {
              console.log('Something has gone wrong!');
              console.log(err);
              reject(err);
            } else {
              console.log('Successfully sent with response: ', response);
              resolve(response);
            }
          });
        },
      );
    });
  }
};
