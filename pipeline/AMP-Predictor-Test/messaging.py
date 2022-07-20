import pika
import run
import json
import luigi
import time
import AMPpredictor

connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()
channel.queue_declare(queue='luigi')
channel.queue_declare(queue='results')

def callback(ch, method, properties, body):
  requestParams = json.loads(body.decode('utf-8'))
  uuid = str(requestParams[0])
  option = str(requestParams[1])
  luigi.build([run.Proteome_Screening()], local_scheduler=False)
  results = 'ran!'
  # send a message back
  channel.basic_publish(exchange='', routing_key='results', body=results)
  channel.basic_ack(delivery_tag = method.delivery_tag)

# receive message and complete simulation
channel.basic_consume(queue='luigi', on_message_callback=callback)
channel.start_consuming()