# =============================================
# Adam Saxen
# Date: 2017-01-19
#
# =============================================
from ioant.ioant import ioant as ioant_core
import logging
import hashlib
logger = logging.getLogger(__name__)

def heater_model():
    global temperature_indoor
    global temperature_outdoor
    global temperature_water_in
    global temperature_water_out
    global temperature_smoke

    if temperature_indoor == 999:
        return
    if temperature_outdoor == 999:
        return
    if temperature_water_in == 999:
        return
    if temperature_water_out == 999:
        return
    if temperature_smoke == 999:
        return

    diff = temperature_water_out - temperature_water_in
    print "model " + str(diff) + "indoor " + str(temperature_indoor)


def getTopicHash(topic):
    res = topic['top'] + topic['global'] + topic['local'] + topic['client_id'] + str(topic['message_type']) + str(topic['stream_index'])
    tres = hash(res)
    tres = tres% 10**8
    return tres

def subscribe_to_topic(par):
    configuration = ioant.get_configuration()
    topic = ioant.get_topic()
    topic['top'] = 'live'
    topic['global'] = configuration["subscribe_topic"][par]["global"]
    topic['local'] = configuration["subscribe_topic"][par]["local"]
    topic['client_id'] = configuration["subscribe_topic"][par]["client_id"]
    topic['message_type'] = ioant.get_message_type("Temperature")
    topic['stream_index'] = configuration["subscribe_topic"][par]["stream_index"]
    ioant.subscribe(topic)
    shash = getTopicHash(topic)
    return shash


def setup(configuration):
    """ setup function """
    global temperature_indoor
    global temperature_outdoor
    global temperature_water_in
    global temperature_water_out
    global temperature_smoke

    temperature_indoor = 999
    temperature_outdoor = 999
    temperature_water_in = 999
    temperature_water_out = 999
    temperature_smoke = 999
    ioant.setup(configuration)
    #configuration = ioant.get_configuration()
    out_msg = ioant.create_message("Temperature")
    out_msg.value = 20.0
    topic = ioant.get_topic()
    topic['top'] = 'live'
    topic['global'] = configuration["ioant"]["mqtt"]["global"]
    topic['local'] = configuration["ioant"]["mqtt"]["local"]
    topic['client_id'] = configuration["ioant"]["mqtt"]["clientId"]
    ioant.publish(out_msg, topic)

def loop():
    """ Loop function """
    while True:
        ioant.update_loop()
        heater_model()


def on_message(topic, message):
    global hash_indoor
    global hash_outdoor
    global hash_water_in
    global hash_water_out
    global hash_smoke

    global temperature_indoor
    global temperature_outdoor
    global temperature_water_in
    global temperature_water_out
    global temperature_smoke
    """ Message function. Handles recieved message from broker """
    if topic["message_type"] == ioant.get_message_type("Temperature"):
        shash = getTopicHash(topic)
        #logging.info("Temp = "+str(message.value)+" hash="+str(shash))
        if shash == hash_indoor:
            print "indoor"
            temperature_indoor = message.value
        if shash == hash_outdoor:
            print "outdoor"
            temperature_outdoor = message.value
        if shash == hash_water_in:
            print "water in"
            temperature_water_in = message.value
        if shash == hash_water_out:
            print "water out"
            temperature_water_out = message.value
        if shash == hash_smoke:
            print "smoke"
            temperature_smoke = message.value
    #print message.value
    #if "Temperature" == ioant.get_message_type_name(topic[message_type]):

def on_connect(rc):
    """ On connect function. Called when attempting to connect to broker
        param rc is the result code (0=success) """
    global hash_indoor
    global hash_outdoor
    global hash_water_in
    global hash_water_out
    global hash_smoke
    if rc == 0:
        # There is now a connection
        hash_indoor    = subscribe_to_topic("indoor")
        hash_outdoor   = subscribe_to_topic("outdoor")
        hash_water_in  = subscribe_to_topic("water_in")
        hash_water_out = subscribe_to_topic("water_out")
        hash_smoke     = subscribe_to_topic("smoke")

# =============================================================================
# Above this line are mandatory functions
# =============================================================================


# Mandatory line
ioant = ioant_core.Ioant(on_connect, on_message)
