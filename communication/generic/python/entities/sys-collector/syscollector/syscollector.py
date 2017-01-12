import paho.mqtt.client as mqtt
import time
import datetime
import sys

from iopy.db import db
from iopy.utils import utils


def mqtt_on_connect(client, userdata, rc):
    print("[info] Connected with result code "+str(rc))
    topic = "$SYS/#"
    print "[info] Subscribed to topic:" + topic
    client.subscribe(topic)


def mqtt_on_message(client, userdata, msg):
    process_message(msg.payload, msg.topic)


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
    db_schema_dict_ = db_schema_dict

    global db_helper
    db_helper = db.DatabaseHelper(db_schema_dict_,
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


def get_topic_key(topic):
    schema = db_helper.schema
    table_sys_topic = schema['database']['tables'][2]

    query = "SELECT * FROM {0} WHERE {1}='{2}'" \
            .format(table_sys_topic['name'],
                    table_sys_topic['columns'][1]['name'],
                    topic)

    if db_helper.execute_query(query, dict_cursor=True):
        all_rows = db_helper.fetch_all_query_results()
        if all_rows is not None:
            if len(all_rows) == 1:
                return all_rows[0][table_sys_topic['primaryKey']]
            else:
                return False
        else:
            print "Failed to get query results:" + query
            return False
    else:
        print "Failed to run query:" + query
        return False


def add_sys_topic(topic):
    # Add new topic
    schema = db_helper.schema
    table_sys_topic = schema['database']['tables'][2]

    query_add = "INSERT INTO {0} ({1}) VALUES ('{2}')". \
                format(table_sys_topic['name'],
                       table_sys_topic['columns'][1]['name'],
                       topic)

    if db_helper.execute_query(query_add):
        db_helper.connection.commit()
        return True
    else:
        db_helper.connection.rollback()
        return False


def add_sys_message(payload, topic):
    schema = db_helper.schema
    table_sys = schema['database']['tables'][1]

    topic_fk_key = get_topic_key(topic)
    columns = table_sys['columns'][1]['name'] + ", " \
              + table_sys['columns'][2]['name']

    values = str(topic_fk_key)+","+payload

    query_add = "INSERT INTO {0} ({1}) VALUES ({2})". \
                format(table_sys['name'],
                       columns,
                       values)

    if db_helper.execute_query(query_add):
        db_helper.connection.commit()
        return True
    else:
        db_helper.connection.rollback()
        return False

def process_message(payload, topic):
    db_helper.connect_to_mysql_database()
    # Try to get topic id in nb_sys_topic. if not add the topic
    if get_topic_key(topic) is False:
        #Create topic in sys_topic table
        if add_sys_topic(topic):
            print "[info] Successfully added new sys topic"
        else:
            print "[error] Failed to add new topic:" + topic
    # Add payload in nb_sys with fk to nb_sys_topic
    if add_sys_message(payload, topic) is not True:
        print "[error] Failed to store sys message: " \
        + str(payload) \
        +" topic:" + topic

    db_helper.disconnect_from_mysql()
