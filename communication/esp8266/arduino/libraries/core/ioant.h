///
/// @file   ioant.h
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Core class definition (SINGLETON)
///
/// This class handles the encoding and decoding of messages when communicating
/// with a IOAnt IoT Platform
///

#ifndef IOANT_H
#define IOANT_H

#include "logger.h"
#include "communication_manager.h"
#include <Arduino.h>
#include <proto_io.h>
#include <EEPROM.h>

#define IOANT Ioant::GetInstance()

namespace ioant
{
    const String SDK_VERSION = "0.1.0";

    void OnMessage(char* topic, byte* payload, unsigned int length);

    class Ioant
    {
    public:
        struct Topic
        {
            String top;
            String global;
            String local;
            String client_id;
            int message_type;
            int stream_index;

            Topic(){
                top = "+";
                global= "+";
                local= "+";
                client_id= "+";
                message_type = -1;
                stream_index= -1;
            };
        };

        enum State
        {
            STATE_POWER_ON = 0,
            STATE_CONFIGURATION = 1,
            STATE_WIFI = 2,
            STATE_MQTT = 3,
            STATE_AP_MODE = 4,
            STATE_OPERATIONAL = 5
        };

        static Ioant* GetInstance(void (*on_message)(Topic topic, ProtoIO* message));
        static Ioant* GetInstance();
        static Ioant* instance_;

        /// @brief UpdateLoop() function
        /// Function definition for managing wifi connection and MQTT connection
        ///
        bool UpdateLoop();

        /// @brief Publish() function
        /// Function definition for publishing a proto message
        ///
        bool Publish(ProtoIO& msg);

        /// @brief Publish() function
        /// Function definition for publishing a proto message
        ///
        bool Publish(ProtoIO& msg, Topic topic);

        /// @brief PublishBootInfoMessage() function
        /// Function definition for creating and publishing boot info message
        ///
        bool PublishBootInfoMessage();

        /// @brief Subscribe() function
        /// Function definition subscribing to a topic
        ///
        bool Subscribe(Topic topic);

        /// @brief GetConfiguredTopic() function
        /// Function definition for retrieving configured topic
        ///
        Topic GetConfiguredTopic();

        /// @brief GetPersistentConfiguration() function
        /// Function definition for retrieving configuration from eeprom
        ///
        bool GetPersistenConfiguration(CommunicationManager::Configuration& configuration);

        /// @brief SetPersistentConfiguration() function
        /// Function definition for storing configuration in eeprom
        ///
        bool SetPersistenConfiguration(ConfigurationMessage* configuration_message);

        /// @brief SetPersistentConfiguration() function
        /// Function definition for storing configuration in eeprom
        ///
        bool SetPersistenConfiguration(CommunicationManager::Configuration& configuration_message);

        /// @brief IsOperational function
        /// Contains state machine for platform readiness
        ///
        bool IsOperational();

        /// @brief GetCurrentConfiguration
        /// Function restarting esp
        ///
        void GetCurrentConfiguration(CommunicationManager::Configuration& configuration);

        /// @brief PopulateEmptyConfigurationFieldsWithOldConfiguration function
        /// Function definition for storing configuration in eeprom
        ///
        bool PopulateEmptyConfigurationFieldsWithOldConfiguration(ConfigurationMessage* configuration_message);


        void (*MQTTCallback)(Topic topic, ProtoIO* message);

    private:
        Ioant(void (*on_message)(Topic topic, ProtoIO* message));
        ~Ioant(){};
        void VisualStateIndicator();
        void SetState(State new_state);
        String StateToString(State new_state);
        String client_id_;
        Topic configured_topic_;
        State state_;
        int localConfigurationTicks_;
    };

    Ioant::Topic ParseTopicString(char* topic);

}

#endif
