///
/// @file   odraw.h
/// @Author Adam Saxen
/// @date   Nov, 2016
/// @brief  oDraw class definition
///
/// Class for drawing on OLED
///

#ifndef ODRAW_MODULE_H
#define ODRAW_MODULE_H


#include <Wire.h>
#include <U8g2lib.h>

///
/// TOP
///
/// MIDDLE
///
/// BOTTOM
///

namespace ioant{

    class ODraw
    {
    public:
        enum Section{
            SECTION_LEFT,
            SECTION_MIDDLE,
            SECTION_RIGHT
        };

         ODraw(U8G2 u8gb):u8g2_(u8gb){
             for (int i=0; i < 4; i++){
                leftSection[i]   = (char*)calloc(8, sizeof(char));
                middleSection[i] = (char*)calloc(8, sizeof(char));
                rightSection[i]  = (char*)calloc(8, sizeof(char));
             }
             uint8_t width_of_display = u8g2_.getDisplayWidth();
             widthOfSections = width_of_display/3;
         };
        ~ODraw(){
            for (int i=0; i < 4; i++){
               free(leftSection[i]);
               free(middleSection[i]);
               free(rightSection[i]);
            }
        };

         void Begin(){
             u8g2_.begin();
         };

         void ClearBuffer(){
             for (int i=0; i < 4; i++){
                 strcpy(leftSection[i]," ");
                 strcpy(middleSection[i]," ");
                 strcpy(rightSection[i]," ");
             }
         }

         void OuputString(const char* output, int x, int y, bool clear);
         void DrawGrid();
         void DrawCenter(const char* data, bool clear);
         void Set(Section section, uint8_t field_index, const char* data);

    private:
        U8G2 u8g2_;
        char* leftSection[4];
        char* middleSection[4];
        char* rightSection[4];
        uint8_t widthOfSections;
    };
}
#endif
