///
/// @file   main.cpp
/// @Author Adam Saxen
/// @date   2017-02-18
/// @brief  Neopixel boilerplate
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

/// @brief measure function
/// Measures the time between two pulses

// END OF - CUSTOM variables


/// END OF - CUSTOM variables

void setup(void){
    Core::GetInstance(on_message);

    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################


}

void loop(void){
    IOANT->UpdateLoop();

}

// Function for handling received MQTT messages
void on_message(Core::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;
}
