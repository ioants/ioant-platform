///
/// @file   communication_manager.h
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Communication manager class definition
///
/// Handles all communication over WIFI. Supports UDP, MQTT and GET Requests
///

#ifndef COMMUNICATION_MANAGER_H
#define COMMUNICATION_MANAGER_H


#include "ESP8266WiFiMulti.h"
#include "ESP8266WebServer.h"
#include "WiFiUdp.h"
#include <PubSubClient.h>
#include <Arduino.h>


#define COM_MGR CommunicationManager::GetInstance()

namespace ioant
{
    void MqttOnMessage(char* topic, byte* payload, unsigned int length);

    class CommunicationManager
    {

    public:

        struct Configuration
        {
            String wifi_ssid;
            String wifi_password;
            String broker_url;
            int broker_port;
            String broker_user;
            String broker_password;
            String udp_url;
            int udp_port;
            bool low_power;
            int status_led;
            String topic_global;
            String topic_local;
            String client_id;
            int communication_delay;
            Configuration(){
                wifi_ssid = "";
                wifi_password= "";
                broker_url= "";
                broker_port = 1883;
                broker_user= "ioant";
                broker_password= "ioant";
                udp_url= "";
                udp_port = 4444;
                low_power = true;
                status_led = 3;
                topic_global= "";
                topic_local= "";
                client_id= "";
                communication_delay = 1000;
            };
        };


        enum CommunicationState
        {
            OFFLINE = 0,
            WEBSERVER = 1,
            WIFI_ONLINE = 2,
            BROKER_ONLINE = 3
        };

        static CommunicationManager* GetInstance();
        static CommunicationManager* instance_;

        bool ChangeCommunicationState(CommunicationState state);
        CommunicationState GetCommunicationState();

        bool HandleWebServerConfigurationUpdate();
        ESP8266WebServer* GetWebServerHandle();
        void HandleFormConfiguration();

        wl_status_t GetStatus();
        bool UpdateWifiConnection();
        bool UpdateBrokerConnection(bool clean_session = false);

        bool SendUdpPackage(String message);
        String SendGETPackage(String data, bool ack);

        //Configuration related
        void UpdateConfiguration(Configuration& configuration);
        void GetCurrentConfiguration(Configuration& configuration);
        String GetClientId(){return config_.client_id;};
        void SetSilentMode(bool silent);
        String GetOwnIPAddress();
        bool IsLowPowerMode();

        // MQTT related
        bool MqttSubscribeToTopic(String topic);
        bool MqttLoop();
        bool MqttPublish(String topic, String payload);
        bool MqttPublish(String topic, const char* payload);
        bool MqttPublish(String topic, uint8_t* payload, uint8_t number_of_bytes);
        int MqttGetState();
        void SetMqttOnMessageCallback(void (*on_message)(char* topic, byte* payload, unsigned int length));
        void (*io_callback)(char* topic, byte* payload, unsigned int length);

    private:
        CommunicationManager();
       ~CommunicationManager();

        String AddressToString(IPAddress address);
        ESP8266WiFiMulti wifi_multi_;
        ESP8266WebServer* web_server_;
        WiFiUDP wifi_udp_;
        WiFiClient wifi_client_;
        PubSubClient mqtt_client_;

        wl_status_t wifi_status_;
        Configuration config_;
        bool silent_;
        CommunicationState communication_state_;
        bool configuration_updated_;
    };


}


#endif
