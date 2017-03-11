# =============================================
# Adam Saxen
# Date: 2017-02-19
# Descriptio: application for running a picamera
# =============================================
from ioant.ioant import ioant as ioant_core
from time import sleep
import os
from picamera import PiCamera
import logging
import datetime
logger = logging.getLogger(__name__)


def setup(configuration):
    ioant.setup(configuration)


def loop():
    """ Loop function takes care of regular logic"""
    while True:
        ioant.update_loop()


def on_message(topic, message):
    """ Message function. Handles recieved message from broker """
    if topic['message_type'] is not ioant.get_message_type('Trigger'):
        logger.error("not a trigger message. Skipping..")
        return None

    take_picture("")
    logger.info("Picture taken!")
    configuration = ioant.get_configuration()
    ncis_image_name = construct_filename()
    ncis_url = configuration['ncis']['ncis_url']
    ncis_internal_path = configuration['ncis']['ncis_internal_path']
    ncis_prefix = configuration['ncis']['ncis_prefix']
    ncis_user = configuration['ncis']['ncis_user']

    os.system("scp {0} {1}@{2}{3}{4}{5}".format("temp.jpg",
                                              ncis_user,
                                              ncis_url,
                                              ncis_internal_path,
                                              ncis_prefix, 
                                              ncis_image_name))

    msg = ioant.create_message('Image')
    msg.reference_link = ncis_url + ncis_prefix + ncis_image_name
    ioant.publish(msg, topic)


def on_connect():
    """ On connect function. Called when connected to broker """
    configuration = ioant.get_configuration()
    # There is now a connection
    topic = ioant.get_topic()
    topic['top'] = "live"
    topic['global'] = configuration['ioant']['mqtt']['global']
    topic['local'] = configuration['ioant']['mqtt']['local']
    topic['client_id'] = configuration['ioant']['mqtt']['client_id']
    ioant.subscribe(topic)

# =============================================================================
# Above this line are mandatory functions
# =============================================================================


def construct_filename():
    configuration = ioant.get_configuration()
    filename_image = configuration['ioant']['mqtt']['global']  \
                     + "_" + configuration['ioant']['mqtt']['local']  \
                     + "_" + configuration['ioant']['mqtt']['client_id'] \
                     + "_" + '{:%Y_%m_%d-%H_%M_%S}'.format(datetime.datetime.now()) \
                     + ".jpg"
    return filename_image


def take_picture(path):
    configuration = ioant.get_configuration()
    camera = PiCamera()
    camera.resolution = (configuration['resolution']['width'], configuration['resolution']['height'])
    camera.capture("temp.jpg")
    camera.close()

# Mandatory line
ioant = ioant_core.Ioant(on_connect, on_message)
