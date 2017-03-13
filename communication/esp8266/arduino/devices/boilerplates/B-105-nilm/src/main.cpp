///
/// @file   main.cpp
/// @Author Benny Saxen
/// @date   2017-03-13
/// @brief  NILM
///

#include <ioant.h>
using namespace ioant;
/// @brief on_message() function
/// Function definition for handling received MQTT messages
///
/// @param received_topic contains the complete topic structure
/// @param message is the proto message recieved
///
/// Proto message is casted to appropriate message
///
void on_message(Ioant::Topic received_topic, ProtoIO* message);

// ############################################################################
// Everything above this line is mandatory
// ############################################################################

/// @brief measure function
/// Measures the time between two pulses
void measure();
// END OF - Custom function definitions

// CUSTOM variables
const byte interrupt_pin = 5;
const byte led_pin = 4;
int timeToCheckStatus = 0;
unsigned long t1,t2,dt,ttemp;
float elpow = 0.0;
int interrupt_counter = 0;
int electric_meter_pulses = 1000;  //1000 pulses/kWh
int bounce_value = 50; // minimum time between interrupts

// END OF - CUSTOM variables

/// END OF - CUSTOM variables

void setup(void){
    Ioant::GetInstance(on_message);

    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################
    CommunicationManager::Configuration loaded_configuration;
    IOANT->GetCurrentConfiguration(loaded_configuration);
    electric_meter_pulses =  loaded_configuration.app_generic_a;
    bounce_value = 36000./electric_meter_pulses; // based on max power = 100 000 Watt

    // Add additional set up code here
    pinMode(interrupt_pin, INPUT_PULLUP);
    pinMode(led_pin, OUTPUT);
    digitalWrite(led_pin,LOW);
    attachInterrupt(interrupt_pin, measure, FALLING);

}

void loop(void){
    IOANT->UpdateLoop();
    ElectricPowerMessage msg;
    msg.data.value = elpow;
    msg.data.unit = ElectricPower_Unit_WATTS;
    msg.data.pulses = interrupt_counter;
    ULOG_DEBUG << interrupt_counter;
    //digitalWrite(led_pin,LOW);
    bool result = IOANT->Publish(msg);
    interrupt_counter  = 0;
    ULOG_DEBUG << result << " " << msg.data.value;
}

// Function for handling received MQTT messages
void on_message(Ioant::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;
}


// Interrupt function for measuring the time between pulses and number of pulses
// Always stored in RAM
void ICACHE_RAM_ATTR measure(){
    digitalWrite(led_pin,HIGH);
    ttemp = t1;
    t2 = t1;
    t1 = millis();
    dt = t1 - t2;
    if (dt < bounce_value)
    {
        t1 = ttemp;
        digitalWrite(led_pin,LOW);
        return;
    }
    elpow = 3600.*1000.*1000./(electric_meter_pulses*dt);
    interrupt_counter++;
    digitalWrite(led_pin,LOW);
}
