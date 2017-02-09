import paho.mqtt.client as mqtt
import time
import datetime
import sys
import generated_proto.messages_pb2 as messages_pb2
import generated_proto.proto_io as ProtoIO
from ioant.utils import utils
from google.protobuf.message import Message
from google.protobuf.descriptor import FieldDescriptor
import os

def pscp_now():
    today = date.today()
    t1 = time.time()
    ts = datetime.fromtimestamp(t1).strftime('%H:%M:%S')
    timestamp = str(today) + " " + ts + " "
    #print today
    #print ts
    return timestamp

def pscp_log(info):
    ts = pscp_now()
    print "pscp_log: " + ts + info
    f = open("log.pscp",'a')
    f.write(ts)
    f.write(info)
    f.write('\n')
    f.close()
    return

def pscp_subscribe(mqtt_client, topic):
  tpm = topic.split('-')
  t_top      = tpm[0]
  t_global   = tpm[1]
  t_local    = tpm[2]
  t_clientid = tpm[3]
  t_msgtyp   = tpm[4]
  t_msgindex = tpm[5]
  ttopic = t_top+'/'+t_global+'/'+t_local+'/'+t_clientid+'/'+t_msgtyp+'/'+t_msgindex
  stemp = 'subscribe ' + ttopic
  pscp_log(stemp)
  mqtt_client.subscribe(topic)

def pscp_publish(mqtt_client, topic, payload):
  tpm = topic.split('-')
  t_top      = tpm[0]
  t_global   = tpm[1]
  t_local    = tpm[2]
  t_clientid = tpm[3]
  t_msgtyp   = tpm[4]
  t_msgindex = tpm[5]
  ttopic = t_top+'/'+t_global+'/'+t_local+'/'+t_clientid+'/'+t_msgtyp+'/'+t_msgindex
  stemp = 'publish ' + ttopic + ' payload ' + payload
  pscp_log(stemp)
  ppay = pscp_protoBuff(payload)
  mqtt_client.subscribe(topic,ppay)

def init_ascii():
    message = "\
=========================================================================\n\
|                      IOAnt Agent Client                            |\n\
========================================================================="
    return message



def mqtt_on_connect(client, userdata, rc):
    print("[info] Connected with result code "+str(rc))
    #topic = "live/#"
    #print "[info] Subscribed to topic:" + topic
    #client.subscribe(topic)


def mqtt_on_message(client, userdata, msg):
    #print "Processing message"
    process_message(msg.payload, msg.topic)


def process_message(payload, topic):
    topic_dict = utils.topic_to_dict(topic)
    if topic_dict is None:
        print "[error] Topic invalid"
        return

    try:
        message = ProtoIO.create_proto_message(topic_dict['message_type'])
        message.ParseFromString(payload)
    except:
        print "Failed to decode message!"
        return

def initiate_mqtt_client(broker, port):
    mqtt_client = mqtt.Client()
    mqtt_client.on_connect = mqtt_on_connect
    mqtt_client.on_message = mqtt_on_message
    mqtt_client.connect(broker, port, 60)
    return mqtt_client


def loop_mqtt_client(client):
    while True:
        rc = client.loop()
        if rc is not 0:
            print "[info] No connection!"
            time.sleep(2)
            client.reconnect()


def initiate_client(broker, port, configuration_dict):
    client = initiate_mqtt_client(broker, port)
    os.system("ls *.sub > list_sub.pscp")
    with open('list_sub.pscp') as fp:
        for line in fp:
            print line
            pscp_subscribe(mqtt_client,line)
    return client
