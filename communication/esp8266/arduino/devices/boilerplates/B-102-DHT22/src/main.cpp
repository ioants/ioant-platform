///
/// @file   main.cpp
/// @Author Adam Saxen
/// @date   November, 2016
/// @brief  Boiler plate for DHT22 sensor, measuring humidity and temperature
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

#include "DHT.h"

/// Custom function definitions
// void TestFunction(int t);
/// END OF - Custom function definitions

///. CUSTOM variables
DHT dht(5, DHT22);

/// END OF - CUSTOM variables

void setup(void){
    Ioant::GetInstance(on_message);
    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################
    ULOG_DEBUG << "This is a debug message over serial port";
    WLOG_DEBUG << "This is a debug message over wifi";

    // Add additional set up code here
    dht.begin();
}

void loop(void){
    // Monitors Wifi connection and loops MQTT connection. Attempt reconnect if lost
    IOANT->UpdateLoop();

    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
        WLOG_ERROR << "Failed to read from DHT sensor!";
        return;
    }

    WLOG_INFO << "Humidity:"<< h << " Temperature:" << t;
    TemperatureMessage t_msg;
    t_msg.data.value = t;
    bool result = IOANT->Publish(t_msg);

    delay(100);

    HumidityMessage h_msg;
    h_msg.data.value = h;
    result = IOANT->Publish(h_msg);
}

// Function for handling received MQTT messages
void on_message(Ioant::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;
}
