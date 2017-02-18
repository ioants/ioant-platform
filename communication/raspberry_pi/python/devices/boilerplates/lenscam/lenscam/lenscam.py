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

    take_picture("")
    logger.info("Picture taken!")
    configuration = ioant.get_configuration()
    ncis_image_name = construct_filename()
    ncis_url = configuration['ncis']['ncis_url']
    ncis_internal_path = configuration['ncis']['ncis_internal_path']
    ncis_prefix = configuration['ncis']['ncis_prefix']
    ncis_user = configuration['ncis']['ncis_user']

    os.system("scp {0} {1}@{2}{3}{4}.".format(ncis_image_name,
                                              ncis_user,
                                              ncis_url,
                                              ncis_internal_path,
                                              ncis_prefix))

    msg = ioant.create_message('Image')
    msg.reference_link = ncis_url + ncis_prefix + ncis_image_name
    ioant.publish(topic, msg)


def on_connect(rc):
    """ On connect function. Called when attempting to connect to broker
        param rc is the result code (0=success) """
    if rc == 0:
        configuration = ioant.get_configuration()
        # There is now a connection
        topic = ioant.get_topic()
        topic['top'] = "image"
        topic['global'] = configuration['topic']['global']
        topic['local'] = configuration['topic']['local']
        ioant.subscribe(topic)

# =============================================================================
# Above this line are mandatory functions
# =============================================================================


def construct_filename():
    configuration = ioant.get_configuration()
    filename_image = configuration['topic']['global'] \
                     + "_" + configuration['topic']['local'] \
                     + "_" + configuration[ioant]['mqtt']['clientId'] \
                     + ".jpg"
    return filename_image


def take_picture(path):
    camera = PiCamera()
    camera.resolution = (1024, 768)
    camera.capture(path+construct_filename())
    camera.close()

# Mandatory line
ioant = ioant_core.Ioant(on_connect, on_message)
