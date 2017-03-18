///
/// @file   main.cpp
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Boiler plate application for using a OLED display to show a nabton stream
/// Note that this example is based on a I2C OLED. If you have another oled modifiy
/// the row with U8G2_SSD1306_128X64_NONAME_F_SW_I2C below
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

// Library for handling oled drawing
#include <odraw.h>

/// Custom function definitions
void OuputToOled(const char* string, int x, int y, bool clear);
/// END OF - Custom function definitions
///. CUSTOM variables
//U8GLIB_SSD1306_128X64 u8g(13, 11, 10, 9);// SW SPI protocol(4 pins): SCK = 13, MOSI = 11, CS = 10, A0 = 9
//U8GLIB_SSD1306_128X64 u8g(U8G_I2C_OPT_NONE); // Small display I2C protocol (2 pins)
U8G2_SSD1306_128X64_NONAME_F_SW_I2C u8g2(U8G2_R0, 5, 4, U8X8_PIN_NONE);
/// END OF - CUSTOM variables
ODraw odraw(u8g2);

void setup(void){
    Ioant::GetInstance(on_message);
    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################
    ULOG_DEBUG << "This is a debug message over serial port";
    WLOG_DEBUG << "This is a debug message over wifi";


    // TSubscribe to everything at "live/wermland/kil/#"
    Ioant::Topic t;
    t.global = "wermland";
    t.local = "kil";
    IOANT->Subscribe(t);

    odraw.Begin();

    /* How to address the grid
    nabodraw.Set(NaboDraw::SECTION_LEFT, 0, "Left 0");
    nabodraw.Set(NaboDraw::SECTION_LEFT, 1, "Left 1");
    nabodraw.Set(NaboDraw::SECTION_LEFT, 2, "Left 2");
    nabodraw.Set(NaboDraw::SECTION_LEFT, 3, "Left 3");

    nabodraw.Set(NaboDraw::SECTION_MIDDLE, 0, "Middle 0");
    nabodraw.Set(NaboDraw::SECTION_MIDDLE, 1, "Middle 1");
    nabodraw.Set(NaboDraw::SECTION_MIDDLE, 2, "Middle 2");
    nabodraw.Set(NaboDraw::SECTION_MIDDLE, 3, "Middle 3");

    nabodraw.Set(NaboDraw::SECTION_RIGHT, 0, "Right 0");
    nabodraw.Set(NaboDraw::SECTION_RIGHT, 1, "Right 1");
    nabodraw.Set(NaboDraw::SECTION_RIGHT, 2, "Right 2");
    nabodraw.Set(NaboDraw::SECTION_RIGHT, 3, "Right 3"); */

    odraw.Set(ODraw::SECTION_LEFT, 0, "Nabton");
    odraw.Set(ODraw::SECTION_MIDDLE, 0, " data ");
    odraw.Set(ODraw::SECTION_RIGHT, 0, " Enhet");

    odraw.Set(ODraw::SECTION_LEFT, 1, "Inne: ");
    odraw.Set(ODraw::SECTION_LEFT, 2, "Ute: ");
    odraw.Set(ODraw::SECTION_LEFT, 3, "Fukt: ");

    odraw.Set(ODraw::SECTION_RIGHT, 1, "  C");
    odraw.Set(ODraw::SECTION_RIGHT, 2, "  C");
    odraw.Set(ODraw::SECTION_RIGHT, 3, "  %");
}

void loop(void){
    // Monitors Wifi connection and loops MQTT connection. Attempt reconnect if lost
    IOANT->UpdateLoop();

    //nabodraw.OuputString("test1", 0, 40, true);
    odraw.DrawGrid();
    //nabodraw.DrawCenter("44.5%", false);
}


// Function for handling received MQTT messages
void on_message(Ioant::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global << " message type:" << received_topic.message_type;

    if (received_topic.message_type == TemperatureMessage::GetType()){
        TemperatureMessage* message = dynamic_cast<TemperatureMessage*>(message);
        odraw.Set(ODraw::SECTION_MIDDLE, 2, String(message->data.value, 2).c_str());
    }
    else if (received_topic.message_type == HumidityMessage::GetType()){
        HumidityMessage* message = dynamic_cast<HumidityMessage*>(message);
        odraw.Set(ODraw::SECTION_MIDDLE, 3, String(message->data.value, 2).c_str());
    }
}
