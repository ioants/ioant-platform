# =============================================
# Benny Saxen
# Date: 2017-03-10
#
# =============================================
from ioant.sdk import IOAnt
import logging
import hashlib
import math
logger = logging.getLogger(__name__)

def read_shunt_position():
    try:
        f = open("shunt_position.work",'r')
        pos = int(f.read())
        f.close()
    except:
        print("WARNING Create shunt position file")
        f = open("shunt_position.work",'w')
        s = str(0)
        f.write(s)
        f.close()
        pos = 0
    return pos

def write_shunt_position(pos):
    try:
        f = open("shunt_position.work",'w')
        s = str(int(pos))
        f.write(s)
        f.close()
    except:
        print "ERROR write to shunt position file"
    return

def publishStepperMsg(steps, direction):
    print "ORDER steps to move: "+str(steps) + " dir:" + str(direction)
    #return
    if steps > 100:
        return
    configuration = ioant.get_configuration()
    out_msg = ioant.create_message("RunStepperMotorRaw")
    out_msg.direction = direction
    out_msg.delay_between_steps = 5
    out_msg.number_of_step = steps
    out_msg.step_size = out_msg.StepSize.Value("FULL_STEP")
    topic = ioant.get_topic_structure()
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
    global current_shunt_position
    configuration = ioant.get_configuration()
    global temperature_indoor
    global temperature_outdoor
    global temperature_water_in
    global temperature_water_out
    global temperature_smoke
    global temperature_target


    # If not all values present in the model - return
    #if temperature_indoor == 999:
    #    return
    if temperature_outdoor == 999:
        return
    #if temperature_water_in == 999:
    #    return
    if temperature_water_out == 999:
        return
    if temperature_smoke == 999:
        return
    #if temperature_target == 999:
    #    return
    mc = []
    mc.append(float(configuration["algorithm"]["c0"]))
    mc.append(float(configuration["algorithm"]["c1"]))
    mc.append(float(configuration["algorithm"]["c2"]))
    mc.append(float(configuration["algorithm"]["c3"]))
    mc.append(float(configuration["algorithm"]["c4"]))
    mc.append(float(configuration["algorithm"]["c5"]))
    mc.append(float(configuration["algorithm"]["c6"]))
    mc.append(float(configuration["algorithm"]["c7"]))
    mc.append(float(configuration["algorithm"]["c8"]))
    mc.append(float(configuration["algorithm"]["c9"]))

    minstep  = float(configuration["algorithm"]["minstep"])
    minsmoke = float(configuration["algorithm"]["minsmoke"])
    inertia  = float(configuration["algorithm"]["inertia"])
    #print "Algorithm: " + str(level) + " " + str(coeff)
    #diff = temperature_water_out - temperature_water_in
    #adjust = temperature_water_out - temperature_target
    #target = level - coeff*temperature_outdoor
    #target = c1 + c2*(1-1/(1+math.exp(-temperature_outdoor/c3)))
    #adjust = target - temperature_water_out

    if temperature_outdoor > 10:
        temperature_outdoor = 10

    if temperature_outdoor < -20:
        temperature_outdoor = -20

    n = 0
    prev_x = 0
    for x in mc:
        if(temperature_outdoor > x):
            delta = 10*(temperature_outdoor - prev_x)/(x - prev_x)
            new_shunt_position  = (n-1)*10 + delta
            break
        else:
            n = n + 1
            prev_x = x
            print x

    #print "xxxx " + str(new_shunt_position)

    adjust = new_shunt_position - current_shunt_position
    if adjust < 0:
        direction = CLOCKWISE # decrease temperature
    else:
        direction = COUNTERCLOCKWISE # increase temperature

    steps = int(abs(adjust*3)) # 3 steps = 0.1 unit of 1-10 scale

    print "New Shunt Position: " + str(new_shunt_position) + " Steps: " + str(steps) + " Dir: " + str(direction)
    print "Current shunt position " + str(current_shunt_position)
    if etc == 0 and steps > minstep and temperature_smoke > minsmoke:
        current_shunt_position = round(new_shunt_position,0)
        write_shunt_position(current_shunt_position)
        publishStepperMsg(steps, direction)
        etc = inertia # 5 min if delay = 5 sec

    print "etc " + str(etc)

def getTopicHash(topic):
    res = topic['top'] + topic['global'] + topic['local'] + topic['client_id'] + str(topic['message_type']) + str(topic['stream_index'])
    tres = hash(res)
    tres = tres% 10**8
    return tres

def subscribe_to_topic(par,msgt):
    configuration = ioant.get_configuration()
    topic = ioant.get_topic_structure()
    topic['top'] = 'live'
    topic['global'] = configuration["subscribe_topic"][par]["global"]
    topic['local'] = configuration["subscribe_topic"][par]["local"]
    topic['client_id'] = configuration["subscribe_topic"][par]["client_id"]
    topic['message_type'] = ioant.get_message_type(msgt)
    topic['stream_index'] = configuration["subscribe_topic"][par]["stream_index"]
    print "Subscribe to: " + str(topic)
    ioant.subscribe(topic)
    shash = getTopicHash(topic)
    return shash


def setup(configuration):
    """ setup function """
    global etc
    global current_shunt_position
    current_shunt_position = read_shunt_position()
    print "Initial shunt position: " + str(current_shunt_position)
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
    #print "message received"
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

def on_connect():
    """ On connect function. Called when connected to broker """
    global hash_indoor
    global hash_outdoor
    global hash_water_in
    global hash_water_out
    global hash_smoke
    global hash_target

    # There is now a connection
    hash_indoor    = 0 #subscribe_to_topic("indoor","Temperature")
    hash_outdoor   = subscribe_to_topic("outdoor","Temperature")
    hash_water_in  = 0 #subscribe_to_topic("water_in","Temperature")
    hash_water_out = subscribe_to_topic("water_out","Temperature")
    hash_smoke     = subscribe_to_topic("smoke","Temperature")

    hash_target   = 0 #subscribe_to_topic("target","Trigger")

# =============================================================================
# Above this line are mandatory functions
# =============================================================================
# Mandatory line
ioant = IOAnt(on_connect, on_message)
