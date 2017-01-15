///
/// @file   odraw.cpp
/// @Author Adam Saxen
/// @date   Nov, 2016
/// @brief  oDraw class implementation
///
/// Class for drawing on OLED
///

#include "odraw.h"

namespace ioant
{
    void ODraw::OuputString(const char* output, int x, int y, bool clear){
        if (clear)
            u8g2_.clearBuffer();
        u8g2_.setFont(u8g_font_6x10);
        u8g2_.drawStr(x, y, output);
        u8g2_.sendBuffer();
    }

    void ODraw::DrawGrid(){
        u8g2_.clearBuffer();
        u8g2_.setFont(u8g_font_6x10);

        u8g2_.drawStr( 0, 10, leftSection[0]);
        u8g2_.drawStr( 0, 27, leftSection[1]);
        u8g2_.drawStr( 0, 45, leftSection[2]);
        u8g2_.drawStr( 0, 62, leftSection[3]);

        u8g2_.drawStr( widthOfSections, 10, middleSection[0]);
        u8g2_.drawStr( widthOfSections, 27, middleSection[1]);
        u8g2_.drawStr( widthOfSections, 45, middleSection[2]);
        u8g2_.drawStr( widthOfSections, 62, middleSection[3]);

        uint8_t temp_w =  widthOfSections*2;
        u8g2_.drawStr( temp_w, 10, rightSection[0]);
        u8g2_.drawStr( temp_w, 27, rightSection[1]);
        u8g2_.drawStr( temp_w, 45, rightSection[2]);
        u8g2_.drawStr( temp_w, 62, rightSection[3]);

        u8g2_.sendBuffer();
    }

    void ODraw::DrawCenter(const char* data, bool clear){
        if (clear)
            u8g2_.clearBuffer();

        u8g2_.setFont(u8g_font_9x18B);
        u8g2_.drawStr( 40, 35, data);
        u8g2_.sendBuffer();
    }

     void ODraw::Set(Section section, uint8_t field_index, const char* data){
         if (field_index >= 4)
            return;
         uint8_t length_of_data = strlen(data);
         if (length_of_data > 8){
             length_of_data = 8;
         }

         if (SECTION_LEFT == section){
             strncpy(leftSection[field_index], data, length_of_data);
         }

         if (SECTION_MIDDLE == section){
             strncpy(middleSection[field_index], data, length_of_data);
         }

         if (SECTION_RIGHT == section){
             strncpy(rightSection[field_index], data, length_of_data);
         }
     }

}
