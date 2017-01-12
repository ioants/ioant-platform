///
/// @file   main.cpp
/// @Author Benny Saxen
/// @date   2016-12-22
/// @brief  NILM
///

#include <core.h>
using namespace ioant;
/// @brief on_message() function
/// Function definition for handling received MQTT messages
///
/// @param received_topic contains the complete topic structure
/// @param message is the proto message recieved
///
/// Proto message is casted to appropriate message
///
void on_message(Core::Topic received_topic, ProtoIO* message);

// ############################################################################
// Everything above this line is mandatory
// ############################################################################


/// Custom function definitions
// void TestFunction(int t);
/// END OF - Custom function definitions

///. CUSTOM variables

// Custom function definitions

/// @brief measure function
/// Measures the time between two pulses
void measure();
void blinkLed(int led,int delay_between_blink);
// END OF - Custom function definitions

// CUSTOM variables
const byte interrupt_pin = 5;

int timeToCheckStatus = 0;
unsigned long t1,t2,dt;
float elpow = 0.0;
int interrupt_counter = 0;
int electric_meter_pulses = 1000;  //1000 pulses/kWh
// END OF - CUSTOM variables

/// END OF - CUSTOM variables

void setup(void){
    Core::GetInstance(on_message);

    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################

    // Add additional set up code here
    pinMode(12, OUTPUT);
    pinMode(interrupt_pin, INPUT_PULLUP);
    attachInterrupt(interrupt_pin, measure, FALLING);

}

void loop(void){
    IOANT->UpdateLoop();
    ElectricPowerMessage msg;
    msg.data.value = elpow;
    msg.data.unit = ElectricPower_Unit_WATTS;
    msg.data.pulses = interrupt_counter;
    bool result = IOANT->Publish(msg);
    interrupt_counter  = 0;
    WLOG_DEBUG << result << " " << msg.data.value;
}

// Function for handling received MQTT messages
void on_message(Core::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;
}


//Interrupt function for measuring the time between pulses and number of pulses
// Always stored in RAM
void ICACHE_RAM_ATTR measure(){
    t2 = t1;
    t1 = millis();
    dt = t1 - t2;
    elpow = 3600./dt*electric_meter_pulses;
    interrupt_counter++;
}

void blinkLed(int led,int delay_between_blink){
    digitalWrite(led, HIGH);
    delay(delay_between_blink);
    digitalWrite(led, LOW);
    delay(delay_between_blink);
}
