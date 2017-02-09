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
from ioant.utils import utils
from google.protobuf.message import Message
from google.protobuf.descriptor import FieldDescriptor
import math

def bs_now():
    today = date.today()
    t1 = time.time()
    ts = datetime.fromtimestamp(t1).strftime('%H:%M:%S')
    timestamp = str(today) + " " + ts + " "
    #print today
    #print ts
    return timestamp

def bs_remember(tag,value):
    bs_file = tag + ".memory"
    stemp = "bs_remember: " + tag + " value: " + str(value)
    bs_log(stemp)
    f = open(bs_file,'w')
    f.write(str(value))
    f.close()
    return

def bs_memory(tag):
    bs_file = tag + ".memory"
    try:
        f = open(bs_file,'r')
    except:
        stemp = "Error bs_memory: " + tag
        bs_log(stemp)
        return("void")
    row = f.readline()
    f.close()
    stemp = "bs_memory: " + tag + " " + str(row)
    bs_log(stemp)
    return row

def bs_log(info):
    ts = bs_now()
    print "bs_log: " + ts + info
    f = open("log.ioant",'a')
    f.write(ts)
    f.write(info)
    f.write('\n')
    f.close()
    return

def init_ascii():
    message = "\
    =========================================================================\n\
    |                     Heater Control Entity                              |\n\
    ========================================================================="
    return message

def mqtt_on_connect(client, userdata, rc):
    print("[info] Connected with result code "+str(rc))

    topic = "live/kil/kvv32/esp4/" + str(ProtoIO.message_type_index_dict["Temperature"]) + "/3" # water out
    stemp = "[info] Subscribed to topic:" + topic
    bs_log(stemp)
    client.subscribe(topic)

    topic = "live/kil/kvv32/esp4/" + str(ProtoIO.message_type_index_dict["Temperature"]) + "/0" # smoke temp
    stemp =  "[info] Subscribed to topic:" + topic
    bs_log(stemp)
    client.subscribe(topic)

def mqtt_on_message(client, userdata, msg):
    stemp = "Processing message " + msg.topic
    bs_log(stemp)
    process_message(client, msg.payload, msg.topic)

def process_message(client, payload, topic):
    topic_dict = utils.topic_to_dict(topic)
    if topic_dict is None:
        bs_log("Topic invalid")
        return
    try:
        in_msg = ProtoIO.create_proto_message(topic_dict['message_type'])
        in_msg.ParseFromString(payload)
    except:
        bs_log("Failed to decode message")
        return

    #clientid = topic_dict['client_id'];
    #app_type = topic_dict['local'];
    topic_index = topic_dict['stream_index'];
    if topic_index == 0: # Smoke temp
        stemp =  "Smoke temp: " + str(in_msg.value)
        bs_log(stemp)
        if in_msg.value < 26:
            return

    if topic_index == 3: # water out
        stemp =  "water out: " + str(in_msg.value)
        bs_log(stemp)
        temp_water_out = float(in_msg.value)

        current = int(time.time())
        prev_order_time = bs_memory("PREV_ORDER_TIME")
        # If no value in memory - no action
        if prev_order_time == "void":
            prev_order_time = current

        diff = current - int(prev_order_time)
        stemp = "diff " + str(diff)
        bs_log(stemp)


        temp_target = float(bs_memory("TEMP_TARGET"))
        # If no value in memory - no action
        if temp_target == "void":
            temp_target = temp_water_out

        steps = int(round((temp_target - temp_water_out)*4))
        stemp =  "steps " + str(steps)
        bs_log(stemp)
        #steps = 10
        if(steps < -50 or steps > 50):
            stemp = "steps out of range " + str(steps)
            bs_log(stemp)
            return

        # Everythin ok for sending an order to stepper motor
        out_msg = ProtoIO.create_proto_message(ProtoIO.message_type_index_dict["RunStepperMotorRaw"])
        topic = "live/kil/kvv32/D1/" +  str(ProtoIO.message_type_index_dict["RunStepperMotorRaw"]) + "/0"
        if steps < 0:
            out_msg.direction = messages_pb2.RunStepperMotorRaw.CLOCKWISE
            bs_log("CLOCKWISE")
        else:
            out_msg.direction = messages_pb2.RunStepperMotorRaw.COUNTER_CLOCKWISE
            bs_log("COUNTER_CLOCKWISE")

        out_msg.delay_between_steps = 5
        out_msg.number_of_step = abs(steps)
        out_msg.step_size = messages_pb2.RunStepperMotorRaw.FULL_STEP
        stemp = "[Publish] " + topic + " steps: " + str(steps)
        bs_log(stemp)
        payload = out_msg.SerializeToString()
        #client.publish(topic,bytearray(payload))
        current = time.time()
        bs_remember("PREV_ORDER_TIME",current)



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
