///
/// @file   main.cpp
/// @Author Benny Saxen
/// @date   2016-12-25
/// A-102-visualCollector
/// @brief  Visual Indicators for MQTT traffic
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


/// Custom function definitions
// void TestFunction(int t);
void blinkLed(int led, int delay_between_blink);
/// END OF - Custom function definitions

///. CUSTOM variables
int g_redLed1 = 5; // D1
int g_redLed2  = 4; // D2
int g_redLed3  = 12; // D6
int g_redLed4  = 14; // D5
int g_redLed5  = 13; // D7

/// END OF - CUSTOM variables

void setup(void){
    Ioant::GetInstance(on_message);
    pinMode(g_redLed1, OUTPUT);
    pinMode(g_redLed2, OUTPUT);
    pinMode(g_redLed3, OUTPUT);
    pinMode(g_redLed4, OUTPUT);
    pinMode(g_redLed5, OUTPUT);
    Ioant::Topic t;
    t.global = "global";
    t.local = "local";
    IOANT->Subscribe(t);
}

void loop(void){
    IOANT->UpdateLoop();
}

void on_message(Ioant::Topic received_topic, ProtoIO* message){
    ULOG_DEBUG << received_topic.client_id;

    if(received_topic.client_id == "c1")
        blinkLed(g_redLed1,10);
    else if(received_topic.client_id == "c2")
        blinkLed(g_redLed2,10);
    else if(received_topic.client_id == "c3")
        blinkLed(g_redLed3,10);
    else if(received_topic.client_id == "c4")
        blinkLed(g_redLed4,10);
    else if(received_topic.client_id == "c5")
        blinkLed(g_redLed5,10);
}

void blinkLed(int led,int delay_between_blink){
    digitalWrite(led, HIGH);
    delay(delay_between_blink);
    digitalWrite(led, LOW);
    delay(delay_between_blink);
}
