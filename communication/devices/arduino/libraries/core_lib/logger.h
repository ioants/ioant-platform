///
/// @file   logger.h
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Logger class definition
///
/// Simplifies logging debug information over both serial and wifi connections
///

#ifndef LOGGER_H
#define LOGGER_H

#include "communication_manager.h"


#define ULOG Logger(0)
#define ULOG_DEBUG Logger(0)   << "[DEBUG] "
#define ULOG_INFO Logger(0)    << "[INFO] "
#define ULOG_WARNING Logger(0) << "[WARNING] "
#define ULOG_ERROR Logger(0)   << "[ERROR] "

#define WLOG Logger(1)
#define WLOG_DEBUG Logger(1)   << "[DEBUG] "
#define WLOG_INFO Logger(1)    << "[INFO] "
#define WLOG_WARNING Logger(1) << "[WARNING] "
#define WLOG_ERROR Logger(1)   << "[ERROR] "

namespace ioant{

    class Logger
    {
    public:
         enum LogType{
             LOGTYPE_SERIAL,
             LOGTYPE_WIFI,
             LOGTYPE_FILE
         };
         Logger(int type);
        ~Logger();
        Logger& operator<<(const char* msg);
        Logger& operator<<(int msg);
        Logger& operator<<(double msg);
        Logger& operator<<(float msg);
        Logger& operator<<(bool msg);
        Logger& operator<<(String msg);

        static String ByteArrayToString(byte* a, int length);
    private:
        bool log_possible_;
        LogType default_log_type_;
        String log_message_;
    };
}


#endif
