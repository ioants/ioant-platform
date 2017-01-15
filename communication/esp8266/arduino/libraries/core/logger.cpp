///
/// @file   logger.cpp
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Logger class source
///
/// Simplifies logging debug information over both serial and wifi connections
///

#include "logger.h"
#include <HardwareSerial.h>


namespace ioant
{
    Logger::Logger(int log_type): log_possible_(true), default_log_type_(Logger::LogType::LOGTYPE_SERIAL){
        default_log_type_ = (Logger::LogType)log_type;
        String client_id = "";
        if(COM_MGR != NULL){
            client_id = COM_MGR->GetClientId();
        }
        else{
            client_id = "NoID";
        }
        log_message_ = "["+client_id+"] ";
    }

    Logger::~Logger(){
        switch(default_log_type_)
        {
            case Logger::LogType::LOGTYPE_SERIAL:
                Serial.println(log_message_);
            break;
            case Logger::LogType::LOGTYPE_WIFI:
                if (!COM_MGR->IsLowPowerMode())
                    COM_MGR->SendUdpPackage(log_message_);
                log_message_ = "";
            break;
        }
    }

    Logger& Logger::operator<<(int msg){
      if (log_possible_)
      {
          log_message_ = log_message_ + String(msg);
      }
      return *this;  // Return a reference to self.
    }

    Logger& Logger::operator<<(double msg){
      if (log_possible_)
      {
          log_message_ = log_message_ + String(msg,6);
      }
      return *this;  // Return a reference to self.
    }

    Logger& Logger::operator<<(float msg){
      if (log_possible_)
      {
          log_message_ = log_message_ + String(msg,6);
      }
      return *this;  // Return a reference to self.
    }

    Logger& Logger::operator<<(const char* msg){
      if (log_possible_)
      {
          log_message_ = log_message_ + String(msg);
      }
      return *this;  // Return a reference to self.
    }

    Logger& Logger::operator<<(String msg){
        if (log_possible_)
        {
            log_message_ = log_message_ + msg;
        }
        return *this;  // Return a reference to self.
    }

    Logger& Logger::operator<<(bool msg){
        if (log_possible_)
        {
            String res = "";
            if (msg)
                res = "True";
            else
                res = "False";

            log_message_ = log_message_ + res;
        }
        return *this;  // Return a reference to self.
    }


    String Logger::ByteArrayToString(byte* a, int length){
        String temp_string = "";
        for(int k=0; k<length; k++){
          temp_string += String((char)a[k]);
        }
        return temp_string;
    }

}
