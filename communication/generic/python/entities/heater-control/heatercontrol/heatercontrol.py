# =============================================
# Adam Saxen
# Date: 2017-01-19
#
# =============================================
from ioant.ioant import ioant as ioant_core
import logging
logger = logging.getLogger(__name__)


def setup(configuration):
    """ setup function """
    ioant.setup(configuration)


def loop():
    """ Loop function """
    while True:
        ioant.update_loop()


def on_message(topic, message):
    """ Message function. Handles recieved message from broker """
    print message.extra


def on_connect(rc):
    """ On connect function. Called when attempting to connect to broker
        param rc is the result code (0=success) """
    if rc == 0:
        # There is now a connection
        topic = ioant.get_topic()
        topic['top'] = 'live'
        topic['global'] = 'torsgatan9'
        topic['local'] = 'livingroom'
        topic['client_id'] = 'howler'
        ioant.subscribe(topic)

# =============================================================================
# Above this line are mandatory functions
# =============================================================================


# Mandatory line
ioant = ioant_core.Ioant(on_connect, on_message)
