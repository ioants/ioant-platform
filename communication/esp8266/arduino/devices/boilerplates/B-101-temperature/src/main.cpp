///
/// @file   main.cpp
/// @Author Adam Saxen, Benny Saxen
/// @date   2017-01-13
/// @brief  Boiler plate application for onewire temperature sensor(DS18B20)
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

/// Custom includes and defines
#include <OneWire.h>
#include <DallasTemperature.h>
#define ONE_WIRE_BUS 5 // Pin for connecting one wire sensor
#define TEMPERATURE_PRECISION 12

///. CUSTOM variables
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensor(&oneWire);
DeviceAddress device[10];
int nsensors = 0;
/// END OF - CUSTOM variables

/// Custom function definitions
void SetUpTemperatureSensors(){

    pinMode(ONE_WIRE_BUS, INPUT);
    sensor.begin();
    nsensors = sensor.getDeviceCount();
    WLOG_INFO << "nsensors " << nsensors;
    ULOG_INFO << "nsensors " << nsensors;
    if(nsensors > 0)
    {
        for(int i=0;i<nsensors;i++)
        {
            sensor.getAddress(device[i], i);
            sensor.setResolution(device[i], TEMPERATURE_PRECISION);
        }
    }
}
/// END OF - Custom function definitions


void setup(void){
    Ioant::GetInstance(on_message);
    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################
    ULOG_DEBUG << "This is a debug message over serial port";
    WLOG_DEBUG << "This is a debug message over wifi";

    SetUpTemperatureSensors();
}

void loop(void){
    // Monitors Wifi connection and loops MQTT connection. Attempt reconnect if lost
    IOANT->UpdateLoop();

    //Retrieve one or more temperature values
    sensor.requestTemperatures();
    //Loop through results and publish
    for(int i=0;i<nsensors;i++){
        float temperature = sensor.getTempCByIndex(i);
        if (temperature > -100) // filter out bad values , i.e. -127
        {
            TemperatureMessage msg;
            msg.data.unit = Temperature_Unit_CELSIUS;
            msg.data.value = temperature;

            Ioant::Topic topic = IOANT->GetConfiguredTopic();
            topic.stream_index = i;
            bool result = IOANT->Publish(msg, topic);
            //WLOG_INFO << "Temperature message sent with value:" << msg.data.value << " and result:" << result;
        }
        else
            ULOG_INFO << "WARNING: Bad temperature value:" << temperature;


    }
}

// Function for handling received MQTT messages
void on_message(Ioant::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;
}
