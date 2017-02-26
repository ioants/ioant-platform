# =============================================
# Adam Saxen
# Date: 2017-02-26
#
# =============================================
from ioant.ioant import ioant as ioant_core
import logging
import hashlib
logger = logging.getLogger(__name__)

def publishStepperMsg(steps,direction):
    configuration = ioant.get_configuration()
    out_msg = ioant.create_message("RunStepperMotorRaw")
    out_msg.direction = direction
    out_msg.delay_between_steps = 5
    out_msg.number_of_step = steps
    out_msg.step_size = 0 #FULL_STEP
    topic = ioant.get_topic()
    topic['top'] = 'live'
    topic['global'] = configuration["publish_topic"]["stepper"]["global"]
    topic['local'] = configuration["publish_topic"]["stepper"]["local"]
    topic['client_id'] = configuration["publish_topic"]["stepper"]["client_id"]
    topic['stream_index'] = 0
    ioant.publish(out_msg, topic)

def heater_model():
    CLOCKWISE = 0
    COUNTERCLOCKWISE = 1
    global etc
    configuration = ioant.get_configuration()
    global temperature_indoor
    global temperature_outdoor
    global temperature_water_in
    global temperature_water_out
    global temperature_smoke
    global temperature_target

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
    if temperature_target == 999:
        return

    diff = temperature_water_out - temperature_water_in
    adjust = temperature_water_out - temperature_target
    if adjust > 0:
        direction = CLOCKWISE
    else:
        direction = COUNTERCLOCKWISE

    steps = int(abs(adjust*4))

    if etc == 0:
        publishStepperMsg(steps,direction)
        etc = 30 # 5 min


    print "steps " + str(steps)+ "dir " + str(direction)
    print "etc " + str(etc)
    print "target " + str(temperature_target)
    print "model " + str(diff) + "indoor " + str(temperature_indoor) + "outdoor " + str(temperature_outdoor)
    print "water out " + str(temperature_water_out)

    out_msg = ioant.create_message("Temperature")
    out_msg.value = diff
    topic = ioant.get_topic()
    topic['top'] = 'live'
    topic['global'] = configuration["ioant"]["mqtt"]["global"]
    topic['local'] = configuration["ioant"]["mqtt"]["local"]
    topic['client_id'] = configuration["ioant"]["mqtt"]["clientId"]
    topic['stream_index'] = 1
    ioant.publish(out_msg, topic)

def getTopicHash(topic):
    res = topic['top'] + topic['global'] + topic['local'] + topic['client_id'] + str(topic['message_type']) + str(topic['stream_index'])
    print "subscribe to " + res
    tres = hash(res)
    tres = tres% 10**8
    return tres

def subscribe_to_topic(par,msgt):
    configuration = ioant.get_configuration()
    topic = ioant.get_topic()
    topic['top'] = 'live'
    topic['global'] = configuration["subscribe_topic"][par]["global"]
    topic['local'] = configuration["subscribe_topic"][par]["local"]
    topic['client_id'] = configuration["subscribe_topic"][par]["client_id"]
    topic['message_type'] = ioant.get_message_type(msgt)
    topic['stream_index'] = configuration["subscribe_topic"][par]["stream_index"]
    ioant.subscribe(topic)
    shash = getTopicHash(topic)
    return shash


def setup(configuration):
    """ setup function """
    global etc
    etc = 0
    global temperature_indoor
    global temperature_outdoor
    global temperature_water_in
    global temperature_water_out
    global temperature_smoke
    global temperature_target

    temperature_indoor    = 999
    temperature_outdoor   = 999
    temperature_water_in  = 999
    temperature_water_out = 999
    temperature_smoke     = 999
    temperature_target    = 999

    ioant.setup(configuration)

def loop():
    """ Loop function """
    global etc
    while True:
        ioant.update_loop()
        if etc > 0:
            etc -= 1

        heater_model()


def on_message(topic, message):
    global hash_indoor
    global hash_outdoor
    global hash_water_in
    global hash_water_out
    global hash_smoke
    global hash_target

    global temperature_indoor
    global temperature_outdoor
    global temperature_water_in
    global temperature_water_out
    global temperature_smoke
    global temperature_target

    """ Message function. Handles recieved message from broker """
    print "message received"
    if topic["message_type"] == ioant.get_message_type("Trigger"):
        shash = getTopicHash(topic)
        if shash == hash_target:
            print "target"
            temperature_target = float(message.extra)

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
        print message.value
    #if "Temperature" == ioant.get_message_type_name(topic[message_type]):

def on_connect(rc):
    """ On connect function. Called when attempting to connect to broker
        param rc is the result code (0=success) """
    global hash_indoor
    global hash_outdoor
    global hash_water_in
    global hash_water_out
    global hash_smoke
    global hash_target

    if rc == 0:
        # There is now a connection
        hash_indoor    = subscribe_to_topic("indoor","Temperature")
        hash_outdoor   = subscribe_to_topic("outdoor","Temperature")
        hash_water_in  = subscribe_to_topic("water_in","Temperature")
        hash_water_out = subscribe_to_topic("water_out","Temperature")
        hash_smoke     = subscribe_to_topic("smoke","Temperature")

        hash_target   = subscribe_to_topic("target","Trigger")

# =============================================================================
# Above this line are mandatory functions
# =============================================================================


# Mandatory line
ioant = ioant_core.Ioant(on_connect, on_message)
