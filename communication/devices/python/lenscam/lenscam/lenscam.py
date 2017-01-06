import paho.mqtt.client as mqtt
import time
import datetime
import sys
import os
import generated_proto.messages_pb2 as messages_pb2
import generated_proto.proto_io as ProtoIO
from iopy.utils import utils
from google.protobuf.message import Message
from google.protobuf.descriptor import FieldDescriptor

# Specific to raspberry
from time import sleep
from picamera import PiCamera


def construct_filename():
    filename_image = configurations['mqtt']['topic']['global'] \
                     + "_" + configurations['mqtt']['topic']['local'] \
                     + "_" + configurations['mqtt']['clientId'] \
                     + ".jpg"
    return filename_image


def take_picture(path):
    camera = PiCamera()
    camera.resolution = (1024, 768)
    camera.capture(path+construct_filename())
    camera.close()


def mqtt_on_connect(client, userdata, rc):
    print("[info] Connected with result code "+str(rc))
    topic = "live/"+configurations['mqtt']['topic']['global']+"/"+configurations['mqtt']['topic']['local']+"/#"
    print "[info] Subscribed to topic:" + topic
    client.subscribe(topic)


def mqtt_on_message(client, userdata, msg):
    print "Processing message"
    process_message(client, msg.payload, msg.topic)


def process_message(client,payload, topic):
    topic_dict = utils.topic_to_dict(topic)
    if topic_dict is None:
        print "Topic invalid"
        return
    elif topic_dict['message_type'] is not ProtoIO.message_type_index_dict.get('Trigger'):
        print "[error] not a trigger message. Skipping.."
        return

    take_picture("")
    print "Picture taken!"

    ncis_image_name = construct_filename()
    ncis_url = configurations['ncis']['ncis_url']
    ncis_internal_path = configurations['ncis']['ncis_internal_path']
    ncis_prefix = configurations['ncis']['ncis_prefix']
    ncis_user = configurations['ncis']['ncis_user']

    os.system("scp {0} {1}@{2}{3}{4}.".format(ncis_image_name,
                                              ncis_user,
                                              ncis_url,
                                              ncis_internal_path,
                                              ncis_prefix))

    msg = messages_pb2.Image()
    msg.reference_link = ncis_url + ncis_prefix + ncis_image_name

    payload = msg.SerializeToString()
    pub_topic = "image/"+configurations['mqtt']['topic']['global']+"/"+configurations['mqtt']['topic']['local']+"/"+configurations['mqtt']['clientId']+"/10/0"
    (result, mid) = client.publish(pub_topic, bytearray(payload))

    if result is not 0:
        print "Publish failed " + msg.reference_link


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

    global configurations
    configurations = configuration_dict
    client = initiate_mqtt_client(broker, port)
    return client
