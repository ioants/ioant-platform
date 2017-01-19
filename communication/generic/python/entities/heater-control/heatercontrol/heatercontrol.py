import paho.mqtt.client as mqtt
import time
import datetime
import sys
import os
import generated_proto.messages_pb2 as messages_pb2
import generated_proto.proto_nab as ProtoNabPy
from ioant.utils import utils
from google.protobuf.message import Message
from google.protobuf.descriptor import FieldDescriptor

def init_ascii():
    message = "\
=========================================================================\n\
|                     Heater Control Client                              |\n\
========================================================================="
    return message

def get_connector_client_id(app_param)
    print "read configuration file"

def mqtt_on_connect(client, userdata, rc):
    print("[info] Connected with result code "+str(rc))
    
    appp = "Z-TEMP-WATER-OUT"
    cid = get_connector_client_id(appp)
    topic = "live/+/" + appp + "/" + cid + "/4/#"
    print "[info] Subscribed to topic:" + topic
    client.subscribe(topic)
  
def mqtt_on_message(client, userdata, msg):
    print "Processing message"
    process_message(msg.payload, msg.topic)

def process_message(payload, topic):
    topic_dict = utils.topic_to_dict(topic)
    if topic_dict is None:
        print "Topic invalid"
        return

    try:
        message = ProtoNabPy.create_proto_message(topic_dict['message_type'])
        message.ParseFromString(payload)
    except:
        print "Failed to decode message!"
        return

    #clientid = topic_dict['client_id'];
    #streamindex = topic_dict['stream_index'];
    temp_water_out = message.value
    prev_order_time = bs_recall("PREV_ORDER_TIME");
    temp_target = bs_recall("TEMP_TARGET");
    
    if temp_water_out < temp_target): # increase heat
        steps = round((temp_target - temp_water_out)*4)
        if(steps < 1 || steps > 50) steps = 1;
        # Publish Z-HEATER-CONTROL message
        
    if temp_water_out > temp_target): # decrease heat
        steps = round((temp_water_out - target_temp)*4)
        if(steps < 1 || steps > 50) steps = 1;
        # Publish Z-HEATER-CONTROL message

def initiate_mqtt_client(broker, port):
    mqtt_client = mqtt.Client()
    mqtt_client.on_connect = mqtt_on_connect
    mqtt_client.on_message = mqtt_on_message
    mqtt_client.connect(broker, port, 60)
    return mqtt_client


def loop_mqtt_client(client):
    while True:
        rc = client.loop()
        #rc = client.loop_start();
        if rc is not 0:
            print "[info] No connection!"
            time.sleep(2)
            client.reconnect()


def initiate_client(broker, port, configuration_dict, db_schema_dict):
    global configurations
    configurations = configuration_dict
    client = initiate_mqtt_client(broker, port)
    return client
