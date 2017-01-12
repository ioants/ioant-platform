///
/// @file   proto_io.h
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Auto generated Wrapper class for NanoPb library
///
/// This class is autogenerated based on the proto file
///

#ifndef PROTO_IO_H
#define PROTO_IO_H

#include <pb_encode.h>
#include <pb_decode.h>
#include "messages.pb.h"
#include <Arduino.h>


namespace ioant
{
    //Base class IOAnt proto
    class ProtoIO
    {

    public:
        struct MessageMeta
        {
            uint8_t number_of_bytes;
            uint8_t message_type;
            bool valid;
            MessageMeta(uint8_t num_bytes, bool valid_msg, uint8_t msg_type){
                number_of_bytes = num_bytes;
                valid = valid_msg;
                message_type = msg_type;
            }
            MessageMeta(){
                number_of_bytes = 0;
                valid = false;
                message_type = 0;
            }
        };
        ProtoIO(): send_buffer_(NULL), has_decoded_data_(false){

        };
        virtual ~ProtoIO(){
            if (send_buffer_ != NULL)
                Serial.println("Heap Freed!");
                free(send_buffer_);
        };
        static ProtoIO* CreateMessage(int message_type);
        virtual bool Decode(const uint8_t* buffer, unsigned int number_of_bytes) = 0;
        virtual bool Encode() = 0;

        MessageMeta GetMessageMeta(){return messageMeta_;};
        uint8_t* GetBufferHandle(){return send_buffer_;};
        enum MessageTypes{CONFIGURATION, BOOTINFO, IMAGE, TRIGGER, TEMPERATURE, HUMIDITY, MASS, ELECTRICPOWER, GPSCOORDINATES, RUNSTEPPERMOTORRAW, RUNSTEPPERMOTOR, RUNDCMOTOR};

    protected:
        bool has_decoded_data_;
        uint8_t* send_buffer_;
        MessageMeta messageMeta_;
    };


        /// =======================================================================
    /// Class Definitions Configuration
    /// =======================================================================
    class ConfigurationMessage : public ProtoIO
    {

    public:
        ConfigurationMessage();
        ~ConfigurationMessage(){
            if (has_decoded_data_){
                pb_release(Configuration_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 0;};

        Configuration data;
    };

    /// =======================================================================
    /// Class Definitions BootInfo
    /// =======================================================================
    class BootInfoMessage : public ProtoIO
    {

    public:
        BootInfoMessage();
        ~BootInfoMessage(){
            if (has_decoded_data_){
                pb_release(BootInfo_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 1;};

        BootInfo data;
    };

    /// =======================================================================
    /// Class Definitions Image
    /// =======================================================================
    class ImageMessage : public ProtoIO
    {

    public:
        ImageMessage();
        ~ImageMessage(){
            if (has_decoded_data_){
                pb_release(Image_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 2;};

        Image data;
    };

    /// =======================================================================
    /// Class Definitions Trigger
    /// =======================================================================
    class TriggerMessage : public ProtoIO
    {

    public:
        TriggerMessage();
        ~TriggerMessage(){
            if (has_decoded_data_){
                pb_release(Trigger_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 3;};

        Trigger data;
    };

    /// =======================================================================
    /// Class Definitions Temperature
    /// =======================================================================
    class TemperatureMessage : public ProtoIO
    {

    public:
        TemperatureMessage();
        ~TemperatureMessage(){
            if (has_decoded_data_){
                pb_release(Temperature_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 4;};

        Temperature data;
    };

    /// =======================================================================
    /// Class Definitions Humidity
    /// =======================================================================
    class HumidityMessage : public ProtoIO
    {

    public:
        HumidityMessage();
        ~HumidityMessage(){
            if (has_decoded_data_){
                pb_release(Humidity_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 5;};

        Humidity data;
    };

    /// =======================================================================
    /// Class Definitions Mass
    /// =======================================================================
    class MassMessage : public ProtoIO
    {

    public:
        MassMessage();
        ~MassMessage(){
            if (has_decoded_data_){
                pb_release(Mass_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 6;};

        Mass data;
    };

    /// =======================================================================
    /// Class Definitions ElectricPower
    /// =======================================================================
    class ElectricPowerMessage : public ProtoIO
    {

    public:
        ElectricPowerMessage();
        ~ElectricPowerMessage(){
            if (has_decoded_data_){
                pb_release(ElectricPower_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 7;};

        ElectricPower data;
    };

    /// =======================================================================
    /// Class Definitions GpsCoordinates
    /// =======================================================================
    class GpsCoordinatesMessage : public ProtoIO
    {

    public:
        GpsCoordinatesMessage();
        ~GpsCoordinatesMessage(){
            if (has_decoded_data_){
                pb_release(GpsCoordinates_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 8;};

        GpsCoordinates data;
    };

    /// =======================================================================
    /// Class Definitions RunStepperMotorRaw
    /// =======================================================================
    class RunStepperMotorRawMessage : public ProtoIO
    {

    public:
        RunStepperMotorRawMessage();
        ~RunStepperMotorRawMessage(){
            if (has_decoded_data_){
                pb_release(RunStepperMotorRaw_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 9;};

        RunStepperMotorRaw data;
    };

    /// =======================================================================
    /// Class Definitions RunStepperMotor
    /// =======================================================================
    class RunStepperMotorMessage : public ProtoIO
    {

    public:
        RunStepperMotorMessage();
        ~RunStepperMotorMessage(){
            if (has_decoded_data_){
                pb_release(RunStepperMotor_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 10;};

        RunStepperMotor data;
    };

    /// =======================================================================
    /// Class Definitions RunDcMotor
    /// =======================================================================
    class RunDcMotorMessage : public ProtoIO
    {

    public:
        RunDcMotorMessage();
        ~RunDcMotorMessage(){
            if (has_decoded_data_){
                pb_release(RunDcMotor_fields, &data);
            }
        };
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {return 11;};

        RunDcMotor data;
    };





}


#endif