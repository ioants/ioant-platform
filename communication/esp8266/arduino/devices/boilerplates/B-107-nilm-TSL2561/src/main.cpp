///
/// @file   main.cpp
/// @Author Benny Saxen
/// @date   2017-02-02
/// @brief  NILM
///

#include <core.h>
#include <SparkFunTSL2561.h>
#include <Wire.h>
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
void measure();

// END OF - CUSTOM variables
SFE_TSL2561 light;
boolean gain;     // Gain setting, 0 = X1, 1 = X16;
unsigned int ms;  // Integration ("shutter") time in milliseconds

/// END OF - CUSTOM variables

void setup(void){
    Core::GetInstance(on_message);

    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################

    pinMode(13, OUTPUT);
    light.begin(4, 5);
    gain = 0;
    // If time = 0, integration will be 13.7ms
    // If time = 1, integration will be 101ms
    // If time = 2, integration will be 402ms
    // If time = 3, use manual start / stop to perform your own integration
    unsigned char time = 0;

    Serial.println("Set timing...");
    light.setTiming(gain,time,ms);

    // To start taking measurements, power up the sensor:

    if (light.setInterruptThreshold(0, 20)){
        ULOG_DEBUG << "interruptlevel set";
    }

    if (light.setInterruptControl(1, 1)){
        ULOG_DEBUG << "interrupt set";
    }

    Serial.println("Powerup...");
    light.setPowerUp();

    pinMode(12, INPUT_PULLUP);
    attachInterrupt(12, measure, FALLING);

}

void loop(void){
    IOANT->UpdateLoop();

    digitalWrite(13, HIGH);
    delay(30);
    digitalWrite(13, LOW);

    unsigned int data0, data1;

    if (light.getData(data0,data1))
    {
      // getData() returned true, communication was successful

      Serial.print("data0: ");
      Serial.print(data0);
      Serial.print(" data1: ");
      Serial.print(data1);

      // To calculate lux, pass all your settings and readings
      // to the getLux() function.

      // The getLux() function will return 1 if the calculation
      // was successful, or 0 if one or both of the sensors was
      // saturated (too much light). If this happens, you can
      // reduce the integration time and/or gain.
      // For more information see the hookup guide at: https://learn.sparkfun.com/tutorials/getting-started-with-the-tsl2561-luminosity-sensor

      double lux;    // Resulting lux value
      boolean good;  // True if neither sensor is saturated

      // Perform lux calculation:

      good = light.getLux(gain,ms,data0,data1,lux);

      // Print out the results:

      Serial.print(" lux: ");
      Serial.print(lux);
      if (good) Serial.println(" (good)"); else Serial.println(" (BAD)");
    }

}

// Function for handling received MQTT messages
void on_message(Core::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;
}

// Interrupt function for measuring the time between pulses and number of pulses
// Always stored in RAM
void ICACHE_RAM_ATTR measure(){
    ULOG_DEBUG << "boom! " << light.clearInterrupt();

}
