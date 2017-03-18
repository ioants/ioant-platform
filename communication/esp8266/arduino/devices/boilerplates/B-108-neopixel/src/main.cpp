///
/// @file   main.cpp
/// @Author Adam Saxen
/// @date   2017-02-18
/// @brief  Neopixel boilerplate
///

#include <ioant.h>
#include <Adafruit_NeoPixel.h>

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

// END OF - CUSTOM variables
#define PIXEL_PIN    14    // GPIO pin connected to the NeoPixels.
#define PIXEL_COUNT  1

Adafruit_NeoPixel pixel = Adafruit_NeoPixel(PIXEL_COUNT, PIXEL_PIN, NEO_RGB + NEO_KHZ800);
/// END OF - CUSTOM variables

void setup(void){
    Ioant::GetInstance(on_message);
    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################
    pixel.begin();
    pixel.show();
}

void loop(void){
    IOANT->UpdateLoop();

    delay(4000);
    pixel.setPixelColor(0, pixel.Color(128, 0, 0));
    pixel.show();
    delay(4000);
    pixel.setPixelColor(0, pixel.Color(0, 128, 0));
    pixel.show();
    delay(4000);
    pixel.setPixelColor(0, pixel.Color(0, 0, 128));
    pixel.show();
    delay(4000);
    pixel.setPixelColor(0, pixel.Color(128, 128, 128));
    pixel.show();
    delay(4000);

}

// Function for handling received MQTT messages
void on_message(Ioant::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;
}
