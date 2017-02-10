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
    today = datetime.date.today()
    t1 = time.time()
    ts = datetime.datetime.fromtimestamp(t1).strftime('%H:%M:%S')
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

def pscp_save_data(topic,data):

    save_file = 'data/'+topic
    f = open(save_file,'w')
    f.write(data)
    f.close()

    ts = pscp_now()
    time_file = 'time/'+topic
    f = open(time_file,'w')
    f.write(ts)
    f.close()

    return

def get_payload(ffile):
    payload = "benny"
    with open(ffile) as fp:
        for line in fp:
            line = line[:-1]
            subFile = line.split("/")
    return payload

def pscp_protoBuff(payload):
    payload = "benny"
    return payload

def pscp_subscribe(mqtt_client, topic):
  tpm = topic.split('-')
  t_top      = tpm[0]
  t_global   = tpm[1]
  t_local    = tpm[2]
  t_clientid = tpm[3]
  t_msgtyp   = tpm[4]
  t_msgindex = tpm[5]
  #t_msgindex = t_msgindex[:-1] # remove last character = lf/cr/eol
  ttopic = t_top+'/'+t_global+'/'+t_local+'/'+t_clientid+'/'+t_msgtyp+'/'+t_msgindex
  stemp = 'subscribe ' + ttopic
  pscp_log(stemp)
  mqtt_client.subscribe(ttopic)

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
  mqtt_client.publish(topic,bytearray(ppay))

def any_publish(mqtt_client):
    os.system("ls pub/* > list_pub.pscp")
    with open('list_pub.pscp') as fp:
        for line in fp:
            line = line[:-1]
            subFile = line.split("/")
            payload = get_payload(line)
            pscp_publish(mqtt_client,subFile[1],payload)
    return

def any_subscribe_to_existing(mqtt_client):
    os.system("ls sub/* > list_sub.pscp")
    with open('list_sub.pscp') as fp:
        for line in fp:
            line = line[:-1]
            subFile = line.split("/")
            pscp_subscribe(mqtt_client,subFile[1])
    return

def any_subscribe_to_new(mqtt_client):
    os.system("ls newsub/* > list_sub.pscp")
    with open('list_sub.pscp') as fp:
        for line in fp:
            line = line[:-1]
            subFile = line.split("/")
            pscp_subscribe(mqtt_client,subFile[1])
            stemp = "mv " + line + " sub/" + subFile[1]
            print stemp
            os.system(stemp)
    return

def init_ascii():
    message = "\
=========================================================================\n\
|                      IOAnt Agent Client                               |\n\
========================================================================="
    return message



def mqtt_on_connect(client, userdata, rc):
    print("[info] Connected with result code "+str(rc))
    #topic = "live/#"
    #print "[info] Subscribed to topic:" + topic
    #client.subscribe(topic)


def mqtt_on_message(client, userdata, msg):
    #print "Processing message"
    any_subscribe_to_new(client)
    any_publish(client)
    process_message(msg.payload, msg.topic)


def process_message(payload, topic):
    topic_dict = utils.topic_to_dict(topic)
    #print topic_dict
    if topic_dict is None:
        print "[error] Topic invalid"
        return

    try:
        message = ProtoIO.create_proto_message(topic_dict['message_type'])
        message.ParseFromString(payload)
        #print "global: " + str(topic_dict['global'])
        #print "local: " + str(topic_dict['local'])
        #print "clientid: " + str(topic_dict['client_id'])
        #print "message_type: " + str(topic_dict['message_type'])
        #print "stream_index: " + str(topic_dict['stream_index'])

        t_global       = str(topic_dict['global'])
        t_local        = str(topic_dict['local'])
        t_clientid     = str(topic_dict['client_id'])
        t_msgtyp       = str(topic_dict['message_type'])
        t_stream_index = str(topic_dict['stream_index'])
        t_topic = t_global+'-'+t_local+'-'+t_clientid+'-'+t_msgtyp+'-'+t_stream_index

        if topic_dict['message_type'] == ProtoIO.message_type_index_dict["Temperature"]:
            print "Message is temperature: " + str(message.value) + " Unit: " +  str(message.unit)
            data = 'TEMPERATURE '+str(message.value)+'\n'+'UNIT '+str(message.unit)
        if topic_dict['message_type'] == ProtoIO.message_type_index_dict["ElectricPower"]:
            print "Message is electricity: " + str(message.value) + " Pulses: " +  str(message.pulses)
            data = 'ELECTRICITY '+str(message.value)+'\n'+'PULSES '+str(message.pulses)
        if topic_dict['message_type'] == ProtoIO.message_type_index_dict["Humidity"]:
            print "Message is humidity: " + str(message.value) + " Unit: " +  str(message.unit)
            data = 'HUMIDITY '+str(message.value)+'\n'+'UNIT '+str(message.unit)
        print data
        pscp_save_data(t_topic,data)

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
    mqtt_client = initiate_mqtt_client(broker, port)
    any_subscribe_to_existing(mqtt_client)
    return mqtt_client
