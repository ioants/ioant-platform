import paho.mqtt.client as mqtt
import time
import datetime
import sys
import generated_proto.messages_pb2 as messages_pb2
import generated_proto.proto_io as ProtoIO
import urllib
import uuid
import os

from ioant_mysqlhelper.db import db
from ioant.utils import utils
from google.protobuf.message import Message
from google.protobuf.descriptor import FieldDescriptor


def splitext(path):
    result = False
    valid_extensions = ['.png', '.jpg', '.JPG', '.bmp']
    path, ext = os.path.splitext(path)
    if ext in valid_extensions:
        return True, ext
    else:
        return False, ext

def init_ascii():
    message = "\
=========================================================================\n\
|                   IOAnt Image Collector Entity                        |\n\
========================================================================="
    return message


def check_data_stream(topic_dict, message_name):
    '''Create data stream if it does not exists in database
       Returns stream index if found or created'''
    sid = db_helper.check_for_stream_id_existens(topic_dict)
    if sid is None:
        print ('[info] Data for this topic does not exist. Creating')
        if db_helper.add_stream(topic_dict, message_name):
            print ('[info] Inserted new stream')
            return (db_helper.check_for_stream_id_existens(topic_dict), True)
        else:
            print "[Critical] failed to insert new stream"
            return (None, True)
    else:
        # Already exists
        return (sid, False)


def create_stream_table(message, sid):
    '''Create new stream table in database'''
    if db_helper.create_stream_table(message, sid):
        print ('[info] New stream table constructed')
        return True
    else:
        print "[Critical] failed to create stream table"
        return False


def store_image(message, topic_dict):
    '''Fetch image and store to server'''

    message_fields = message.ListFields()
    if len(message_fields) is not 1:
        return False
    # reference link to temporary image
    temporary_image_link = message_fields[0][1]

    if temporary_image_link.startswith('http://') is not True:
        temporary_image_link = 'http://'+temporary_image_link


    result, extension = splitext(temporary_image_link)

    if result is not True:
        print "[Error] unsupported message type"
        return False

    print "[info] get at:" + temporary_image_link
    unique_filename = uuid.uuid4()
    store_url = "{0}{1}{2}/{3}/{4}/{5}/{6}{7}".format(img_store_internal_path,
                                                      img_store_prefix,
                                                      topic_dict['global'],
                                                      topic_dict['local'],
                                                      topic_dict['client_id'],
                                                      topic_dict['stream_index'],
                                                      unique_filename,
                                                      extension)

    if not os.path.exists(os.path.dirname(store_url)):
        try:
            os.makedirs(os.path.dirname(store_url))
        except OSError as exc: # Guard against race condition
            if exc.errno != errno.EEXIST:
                raise

    access_url = "{0}{1}{2}/{3}/{4}/{5}/{6}{7}".format(img_store_host,
                                                       img_store_prefix,
                                                       topic_dict['global'],
                                                       topic_dict['local'],
                                                       topic_dict['client_id'],
                                                       topic_dict['stream_index'],
                                                       unique_filename,
                                                       extension)

    urllib.urlretrieve(temporary_image_link,
                       store_url)

    setattr(message, message_fields[0][0].name, access_url)
    print "[info] stored at:" + access_url + " " + store_url
    return True


def mqtt_on_connect(client, userdata, rc):
    print("[info] Connected with result code "+str(rc))
    topic = "image/#"
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
    db_helper.connect_to_mysql_database()

    if topic_dict['message_type'] != ProtoIO.message_type_index_dict.get('Image'):
        print "[error] Proto message with wrong message_type sent to /image topic!"
        return

    try:
        message = ProtoIO.create_proto_message(topic_dict['message_type'])
        message.ParseFromString(payload)
    except:
        print "Failed to decode message!"
        return

    result = check_data_stream(topic_dict, message.DESCRIPTOR.name)
    stream_id = result[0]
    create_a_stream_table = result[1]

    if create_a_stream_table:
        if create_stream_table(message, stream_id):
            print '[info] New stream table created'
        else:
            print '[error] Failed to create new stream table created'

    # Copy image to server for storage
    if store_image(message, topic_dict) is False:
        return

    # Store actual message to database
    if db_helper.store_message_to_database(message, stream_id):
        print "[info] Stored message!"
    else:
        print "[error] Failed to store message"

    db_helper.disconnect_from_mysql()


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


def initiate_client(broker, port, configuration_dict, db_schema_dict):
    db_host = configuration_dict['mysqlDatabase']['host']
    db_user = configuration_dict['mysqlDatabase']['user']
    db_password = configuration_dict['mysqlDatabase']['password']
    db_name = db_schema_dict['database']['name']


    global db_helper
    global img_store_prefix
    global img_store_host
    global img_store_internal_path

    img_store_prefix = configuration_dict['imageStorage']['prefix']
    img_store_host = configuration_dict['imageStorage']['host']
    img_store_internal_path = configuration_dict['imageStorage']['internal_path']


    db_helper = db.DatabaseHelper(db_schema_dict,
                                       db_host,
                                       db_user,
                                       db_password)

    if db_helper.connect_to_mysql_database():
        if db_helper.does_database_exist():
            db_helper.disconnect_from_mysql()
            client = initiate_mqtt_client(broker, port)
            return client
        else:
            print "Database:" + db_name + " does not exist. Create it using db-creator.py"

    else:
        print "Could not connect to database. Please check username, password and host"
