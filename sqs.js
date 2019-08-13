import { awsAccessKeyId, awsSecretAccessKey, awsRegion, awsQueueUrl } from '../../config';
const aws = require('aws-sdk');

aws.config = {
  accessKeyId: awsAccessKeyId,
  secretAccessKey: awsSecretAccessKey,
  region: awsRegion,
};
const sqs = new aws.SQS();

export const createQueue = ({ body: { queueName } }, res, next) => {
  const params = {
    QueueName: queueName,
  };

  sqs.createQueue(params, function(err, data) {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

export const queuesList = (req, res, next) => {
  sqs.listQueues(function(err, data) {
    if (err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });
};

export const sendToQueue = (req, res) => {
  const params = {
    QueueUrl: awsQueueUrl,
    DelaySeconds: 0,
  };
  if (req.body) {
    params.MessageBody = JSON.stringify(req.body.message);
  } else {
    params.MessageBody = JSON.stringify(req);
  }
  sqs.sendMessage(params, (err, data) => {
    if (err) {
      console.log(err);
    } else if (req.body) {
      res.status(200).json({
        success: true,
        awsData: data,
      });
    } else console.log('awsDATA', data);
  });
};
