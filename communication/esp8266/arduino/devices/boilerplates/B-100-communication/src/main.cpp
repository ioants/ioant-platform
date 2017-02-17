///
/// @file   main.cpp
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Boiler plate application for MQTT communication
///

#include <ioant.h>
using namespace ioant;
/// @brief on_message() function
/// Function definition for handling received MQTT messages
///
/// @param received_topic contains the complete topic structure
/// @param payload contains the contents of the message received
/// @param length the number of bytes received
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
/// END OF - CUSTOM variables

void setup(void){
    //Initialize IOAnt core
    Ioant::GetInstance(on_message);

    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################
    ULOG_DEBUG << "This is a debug message over serial port";
    //WLOG_DEBUG << "This is a debug message over wifi";

}

void loop(void){
    // Monitors Wifi connection and loops MQTT connection. Attempt reconnect if lost
    IOANT->UpdateLoop();

    // Send a Temperature message to itself on topic kConfigTopicGlobal/kConfigTopicLocal
    TemperatureMessage msg;
    msg.data.unit = Temperature_Unit_CELSIUS;
    msg.data.value = 14.5f;
    IOANT->Publish(msg);

    // Also send the temeprature message to a remote topic
    Ioant::Topic remote_topic = IOANT->GetConfiguredTopic();
    remote_topic.global = "sweden";
    remote_topic.local = "wermland";
    IOANT->Publish(msg, remote_topic);

    ULOG_DEBUG << "free heap:" << (int)ESP.getFreeHeap();
}

// Function for handling received MQTT messages
void on_message(Ioant::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;

    if (received_topic.message_type == ProtoIO::MessageTypes::IMAGE)
    {
        ImageMessage* message = dynamic_cast<ImageMessage*>(message);
        WLOG_DEBUG << "Image reference link:" << message->data.reference_link;
    }
}
