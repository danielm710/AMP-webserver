const amqp = require('amqplib/callback_api');

// Custom modules
const pipeline = require('./custom/runLuigi')
const helper = require('./custom/fetchData')

amqp.connect('amqp://admin:mypass@rabbit', function(err, conn) {
  if (err) {
    throw err;
  }
  conn.createChannel(function(err, ch) {
    if (err) {
      throw err;
    }
    var taskExchange = 'task';
    var progressExchange = 'progress';

    ch.assertExchange(taskExchange, 'fanout', {
      durable: false
    });

    ch.assertExchange(progressExchange, 'fanout', {
      durable: false
    });

    ch.assertQueue('', {
      exclusive: true
    }, function(err, q) {
      if(err) {
        throw err;
      }

      console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
      ch.bindQueue(q.queue, taskExchange, '');

      ch.consume(q.queue, function(msg) {
        if(msg.content) {
          var data = JSON.parse(msg.content);
          var uid = data.uid;
          var scriptPath = data.scriptPath;
          var donePath = data.donePath;
          var predictionPath = data.predictionPath;

          console.log(" [x] Received %s", data);

          // Run AMPspredictor pipeline
          (async() => {
            ch.publish(progressExchange, '', Buffer.from(
              JSON.stringify(
                {result: 
                  {message: 'Reading input fasta file...'}
                }
              )
            ));
            await pipeline.readFasta(scriptPath)

            ch.publish(progressExchange, '', Buffer.from(
              JSON.stringify(
                {result: 
                  {message: 'Running HMMscan...'}
                }
              )
            ));
            await pipeline.hmmscan(scriptPath)

            ch.publish(progressExchange, '', Buffer.from(
              JSON.stringify(
                {result: 
                  {message: 'Making prediction...'}
                }
              )
            ));
            await pipeline.makePrediction(scriptPath)

            const isPipelineDone = await helper.checkLuigiDone(donePath)

            if(isPipelineDone === true) {
              const predictionData = await helper.fetchData(predictionPath)
              const doneData = {
                message: 'Done!',
                predictionData: predictionData,
                uid: uid
              }
              ch.publish(progressExchange, '', Buffer.from(JSON.stringify({result: doneData})));
            } else {
              ch.publish(progressExchange, '', Buffer.from(
              JSON.stringify(
                {result: 
                  {message: 'Job failed...'}
                }
              )
            ));
            }
          })();
        }
      }, {
        noAck: true
      })
    });

  });
});