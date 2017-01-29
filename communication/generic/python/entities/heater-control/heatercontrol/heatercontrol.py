#=============================================
# Benny Saxen
# Date: 2017-01-19
#
# Publish:
# 	Z-HEATER-CONTROL
# 	Z-HEATER-STATUS
#
# Subscribe:
# 	Z-TEMP-WATER-IN
# 	Z-TEMP-WATER-OUT
# 	Z-TEMP-SMOKEGAS
# 	Z-TEMP-INDOOR
# 	Z-TEMP-OUTDOOR
# 	Z-TEMP-FUTURE
# 	Z-HEATER-TARGET
#=============================================
import paho.mqtt.client as mqtt
import time
from datetime import date
from datetime import datetime
import sys
import generated_proto.messages_pb2 as messages_pb2
import generated_proto.proto_io as ProtoIO
from ioant.db import db
from ioant.utils import utils
from google.protobuf.message import Message
from google.protobuf.descriptor import FieldDescriptor
import math

g_me = "benny"

def bs_remember(me,tag,value):
    print "bs_remember: " + tag + " value: " + str(value)
    return

def bs_recall(me,tag):
    print "bs_recall: " + tag
    return 99

def init_ascii():
    message = "\
    =========================================================================\n\
    |                     Heater Control Entity                              |\n\
    ========================================================================="
    return message

def get_connector_client_id(app_param):
    print "read configuration file: " + app_param
    return "esp10"

def mqtt_on_connect(client, userdata, rc):
    print("[info] Connected with result code "+str(rc))

    appp = "Z-TEMP-WATER-OUT"
    cid = get_connector_client_id(appp)
    topic = "live/+/" + appp + "/" + cid + "/" + str(ProtoIO.message_type_index_dict["Temperature"]) + "/#"
    print "[info] Subscribed to topic:" + topic
    client.subscribe(topic)

    appp = "Z-TEMP-SMOKEGAS"
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
        in_msg = ProtoIO.create_proto_message(topic_dict['message_type'])
        in_msg.ParseFromString(payload)
    except:
        print "Failed to decode message!"
        return

    #clientid = topic_dict['client_id'];
    app_type = topic_dict['local'];

    if app_type == "Z-TEMP-SMOKEGAS":
        print app_type + "temp: " + in_msg.value
        if in_msg.value < 26:
            return

    if app_type == 	"Z-TEMP-WATER-OUT":
        temp_water_out = in_msg.value
        prev_order_time = bs_recall(g_me,"PREV_ORDER_TIME");
        temp_target = bs_recall(g_me,"TEMP_TARGET");

        steps = round((temp_target - temp_water_out)*4)
        steps = 10
        if(steps < 1 or steps > 50):
            return
            # adjustment needed
        out_msg = ProtoIO.create_proto_message(ProtoIO.message_type_index_dict["RunStepperMotorRaw"])
        appp = "Z-HEATER-CONTROL"
        cid = get_connector_client_id(appp)
        topic = "live/" + g_me + "/" + appp + "/" + cid + "/" + str(ProtoIO.message_type_index_dict["RunStepperMotorRaw"]) + "/#"
        if steps > 0:
            out_msg.direction = messages_pb2.RunStepperMotorRaw.CLOCKWISE
        else:
            out_msg.direction = messages_pb2.RunStepperMotorRaw.COUNTER_CLOCKWISE

        out_msg.delay_between_steps = 10
        out_msg.number_of_step = abs(steps)
        out_msg.step_size = messages_pb2.RunStepperMotorRaw.FULL_STEP
        print "[Publish] " + topic + "  " + appp + " steps: " + str(steps)
        #client.publish(topic)

        today = date.today()
        t1 = time.time()
        ts = datetime.fromtimestamp(t1).strftime('%H:%M:%S')
        timestamp = str(today) + " " + ts
        print today
        print ts
        print timestamp
        bs_remember(g_me,"PREV_ORDER_TIME",timestamp)


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


def initiate_client(broker, port, configuration_dict):
    global configurations
    configurations = configuration_dict
    client = initiate_mqtt_client(broker, port)
    return client
