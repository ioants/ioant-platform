# =============================================
# Author: Adam Saxen
# Date: 2017-02-19
# Descriptio: Collector Entity - stores messages to MYSQL
# =============================================
from ioant.sdk import IOAnt
from ioant_mysqlhelper.db import db
from time import sleep
import os
import logging
logger = logging.getLogger(__name__)


def setup(configuration, schema):
    ioant.setup(configuration)
    db_host = configuration['mysqlDatabase']['host']
    db_user = configuration['mysqlDatabase']['user']
    db_password = configuration['mysqlDatabase']['password']
    db_name = schema['database']['name']

    global db_helper
    db_helper = db.DatabaseHelper(schema,
                                  db_host,
                                  db_user,
                                  db_password)

    if db_helper.connect_to_mysql_database():
        if db_helper.does_database_exist():
            db_helper.disconnect_from_mysql()
        else:
            logger.info("Database:" + db_name + " does not exist. Create it using db-creator.py")
    else:
        logger.error("Could not connect to database. Please check username, password and host")


def loop():
    """ Loop function takes care of regular logic"""
    ioant.update_loop()


def on_message(topic, message):
    """ Message function. Handles received message from broker """
    if topic is None:
        logger.error("Topic invalid: " + str(topic))
        return
    db_helper.connect_to_mysql_database()

    result = check_data_stream(topic, message.DESCRIPTOR.name)
    stream_id = result[0]
    create_a_stream_table = result[1]

    if create_a_stream_table:
        if create_stream_table(message, stream_id):
            logger.info("New stream table created")
        else:
            logger.error("Failed to create new stream table created")

    # Store actual message to database
    if db_helper.store_message_to_database(message, stream_id) is not True:
        logger.critical("Failed to store message")

    db_helper.disconnect_from_mysql()


def on_connect():
    """ On connect function. Called when connected to broker """
    topic = ioant.get_topic_structure()
    topic['top'] = "live"
    ioant.subscribe(topic)

# =============================================================================
# Above this line are mandatory functions
# =============================================================================


def check_data_stream(topic_dict, message_name):
    '''Create data stream if it does not exists in database
       Returns stream index if found or created'''
    sid = db_helper.check_for_stream_id_existens(topic_dict)
    if sid is None:
        logger.info("Data for this topic does not exist. Creating...")
        if db_helper.add_stream(topic_dict, message_name):
            logger.info("Inserted new stream")
            return (db_helper.check_for_stream_id_existens(topic_dict), True)
        else:
            logger.critical("failed to insert new stream")
            return (None, True)
    else:
        # Already exists
        return (sid, False)


def create_stream_table(message, sid):
    '''Create new stream table in database'''
    if db_helper.create_stream_table(message, sid):
        logger.info("New stream table constructed")
        return True
    else:
        logger.error("failed to create stream table")
        return False


# Mandatory line
ioant = IOAnt(on_connect, on_message)
