# =============================================
# Adam Saxen
# Date: 2017-01-19
#
# =============================================
from ioant.ioant import ioant as ioant_core
import logging
logger = logging.getLogger(__name__)


def setup(configuration):
    ioant.setup(configuration)
    topic = ioant.get_topic('live', 'torsgatan9', 'livingroom', 'howler')
    ioant.subscribe(topic)


def loop():
    """ Loop function takes care of regular logic"""
    while True:
        ioant.update_loop()


def on_message(topic, message):
    """ Message function. Handles recieved message from broker """
    print message.extra


ioant = ioant_core.Ioant(on_message)
