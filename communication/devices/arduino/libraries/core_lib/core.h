///
/// @file   core.h
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Core class definition (SINGLETON)
///
/// This class handles the encoding and decoding of messages when communicating
/// with a IOAnt IoT Platform
///

#ifndef CORE_H
#define CORE_H

#include "logger.h"
#include "communication_manager.h"
#include <Arduino.h>
#include <proto_io.h>
#include <EEPROM.h>

#define IOANT Core::GetInstance()

namespace ioant
{

    void OnMessage(char* topic, byte* payload, unsigned int length);

    class Core
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
            CONFIGURATION_CHECK = 0,
            WIFI_CHECK = 1,
            BROKER_CHECK = 2,
            RECONFIGURATION_ACTIVE = 3,
            CLIENT_ONLINE = 4
        };

        static Core* GetInstance(void (*on_message)(Topic topic, ProtoIO* message));
        static Core* GetInstance();
        static Core* instance_;

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

        /// @brief StateMachine function
        /// Function definition for storing configuration in eeprom
        ///
        bool StateMachine();

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
        Core(void (*on_message)(Topic topic, ProtoIO* message));
        ~Core(){};
        String client_id_;
        Topic configured_topic_;
        State state_;
        int localConfigurationTicks_;
    };

    Core::Topic ParseTopicString(char* topic);

}

#endif
