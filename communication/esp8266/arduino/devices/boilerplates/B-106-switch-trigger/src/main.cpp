///
/// @file   main.cpp
/// @Author Simon Lövgren
/// @date   Oktober, 2016
/// @brief  Boiler plate for simple switch application
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
/// END OF - Custom function definitions

///. CUSTOM variables
// int variable_test = 1;
bool latch = false;
/// END OF - CUSTOM variables

// If you want a LED to flash when switch is opened
// set to true, otherwise set to false
#define LED_CONNECTED true
// Pin to which (optional) LED is connected
#define LED_PIN    5
// Pin to which the switch is connected
#define SWITCH_PIN 4

void setup(void){
    //Initialize IOAnt core
    Ioant::GetInstance(on_message);

    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################
    ULOG_DEBUG << "This is a debug message over serial port";
    //WLOG_DEBUG << "This is a debug message over wifi";

    // Set switch pin to input
    pinMode(SWITCH_PIN, INPUT);
#if LED_CONNECTED
    // Set LED pin to output
    pinMode(LED_PIN, OUTPUT);
#endif
}

void loop(void){
  // Monitors Wifi connection and loops MQTT connection. Attempt reconnect if lost
  IOANT->UpdateLoop();

  // If switch is opened, send one message and set
  // latch to not enter on every loop
  if(!digitalRead(SWITCH_PIN) && !latch) {
    // Send trigger message 1 for switch open
    TriggerMessage msg;
    msg.data.extra = 1;
    IOANT->Publish(msg);
    // Set latch to true to enable new
    // "door closed" message
    latch = true;

    // If led connected, flash once
#if LED_CONNECTED
    digitalWrite(LED_PIN, HIGH);
    delay(50);
    digitalWrite(LED_PIN, LOW);
#endif
  }

  // If switch is closed after being opened, send one message
  // and set latch to not enter on every loop
  if(latch && digitalRead(SWITCH_PIN)) {
    // Send trigger message 0 for switch closed
    TriggerMessage msg;
    msg.data.extra = 0;
    IOANT->Publish(msg);

    // Set latch to false to enable new
    // "door opened" message
    latch = false;

    // If led connected, flash twice
#if LED_CONNECTED
    digitalWrite(LED_PIN, HIGH);  // Debug
    delay(50);                    // Debug
    digitalWrite(LED_PIN, LOW);   // Debug
    delay(50);                    // Debug
    digitalWrite(LED_PIN, HIGH);  // Debug
    delay(50);                    // Debug
    digitalWrite(LED_PIN, LOW);   // Debug
#endif
  }
}

// Function for handling received MQTT messages
void on_message(Ioant::Topic received_topic, ProtoIO* message){}
