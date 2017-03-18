# =============================================
# Adam Saxen
# Date: 2017-03-10
# Description: Simple boilerplate on how to publish
# and subscribe on messages
# =============================================
from ioant.sdk import IOAnt
import logging
import hashlib
logger = logging.getLogger(__name__)


def setup(configuration):
    """ setup function """
    ioant.setup(configuration)


def loop():
    """ Loop function """
    ioant.update_loop()
    msg = ioant.create_message("Temperature")
    # msg.unit = msg.Unit.Value("FAHRENHEIT")
    msg.unit = msg.Unit.Value("CELSIUS")
    msg.value = 14.5
    # publish with device topic
    ioant.publish(msg)
    # pr publish with custom topic
    topic = ioant.get_topic_structure()
    topic['global'] = 'custom_global'
    topic['local'] = 'custom_local'


def on_message(topic, message):
    if "Temperature" == ioant.get_message_type_name(topic[message_type]):
        logger.debug("Message received of type temperature")
        logger.debug("Contains value:" + str(message.value))


def on_connect():
    """ On connect function. Called when connected to broker """

# =============================================================================
# Above this line are mandatory functions
# =============================================================================
# Mandatory line
ioant = IOAnt(on_connect, on_message)
