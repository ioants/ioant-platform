 ///
/// @file   communication_manager.cpp
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Communication manager class source
///
/// Handles all communication over WIFI. Supports UDP, MQTT and GET Requests
///
#include "communication_manager.h"
#include "logger.h"

namespace ioant{


    CommunicationManager* CommunicationManager::instance_ = NULL;

    const int NUMBER_OF_CONFIGURATION_FIELDS = 14;
    String CSS = ".form-style-8{font-family:arial,sans;width:500px;padding:30px;background:#FFF;margin:50px auto;box-shadow:0 0 15px rgba(0,0,0,.22);-moz-box-shadow:0 0 15px rgba(0,0,0,.22);-webkit-box-shadow:0 0 15px rgba(0,0,0,.22)}.form-style-8 h2{background:#4D4D4D;text-transform:uppercase;font-family:sans-serif;color:#797979;font-size:18px;font-weight:100;padding:20px;margin:-30px -30px 30px}.form-style-8 input[type=text],.form-style-8 input[type=date],.form-style-8 input[type=datetime],.form-style-8 input[type=email],.form-style-8 input[type=number],.form-style-8 input[type=search],.form-style-8 input[type=time],.form-style-8 input[type=url],.form-style-8 input[type=password],.form-style-8 select,.form-style-8 textarea{box-sizing:border-box;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;outline:0;display:block;width:100%;padding:7px;border:none;border-bottom:1px solid #ddd;background:0 0;margin-bottom:10px;font:16px Arial,Helvetica,sans-serif;height:45px}.form-style-8 textarea{resize:none;overflow:hidden}.form-style-8 input[type=submit],.form-style-8 input[type=button]{-moz-box-shadow:inset 0 1px 0 0 #45D6D6;-webkit-box-shadow:inset 0 1px 0 0 #45D6D6;box-shadow:inset 0 1px 0 0 #45D6D6;background-color:#2CBBBB;border:1px solid #27A0A0;display:inline-block;cursor:pointer;color:#FFF;font-family:sans-serif;font-size:14px;padding:8px 18px;text-decoration:none;text-transform:uppercase}.form-style-8 input[type=submit]:hover,.form-style-8 input[type=button]:hover{background:linear-gradient(to bottom,#34CACA 5%,#30C9C9 100%);background-color:#34CACA}";
    String CONFIGURATION_FIELDS[NUMBER_OF_CONFIGURATION_FIELDS] = {"client_id",
                                                                   "topic_global",
                                                                   "topic_local",
                                                                   "wifi_ssid",
                                                                   "wifi_password",
                                                                   "broker_url",
                                                                   "broker_port",
                                                                   "broker_user",
                                                                   "broker_password",
                                                                   "udp_url",
                                                                   "udp_port",
                                                                   "low_power",
                                                                   "status_led",
                                                                   "communication_delay"};

   String CONFIGURATION_FIELDS_READABLE[NUMBER_OF_CONFIGURATION_FIELDS] = {"Client id",
                                                                          "Topic Global",
                                                                          "Topic Local",
                                                                          "SSID (WiFi)",
                                                                          "Password (WiFi)",
                                                                          "URL (MQTT broker)",
                                                                          "Port (MQTT broker)",
                                                                          "User (MQTT)",
                                                                          "Password (MQTT),"
                                                                          "URL/IP (UDP debugging)",
                                                                          "Port (UDP debugging)",
                                                                          "Low Power Mode (true/false)",
                                                                          "Status LED Pin (Flashes when messages are sent)",
                                                                          "Communication Delay (E.g delay between sensor readings)"};


    CommunicationManager* CommunicationManager::GetInstance(){
        if (instance_)
        {
            return instance_;
        }
        else
        {
            instance_ = new CommunicationManager();
        }
    }


    CommunicationManager::CommunicationManager():
                                            communication_state_(CommunicationState::OFFLINE),
                                            wifi_status_(WL_DISCONNECTED),
                                            wifi_client_(),
                                            mqtt_client_(wifi_client_),
                                            silent_(false),
                                            io_callback(NULL),
                                            web_server_(NULL),
                                            configuration_updated_(false){
        Serial.begin(115200);
    }


    CommunicationManager::~CommunicationManager(){
        ULOG_INFO << "CommunicationManager destructor called";
    }

    String BuildConfigurationForm(){

        String form = "<head><title>IOAnt Device Configuration Form</title></head>";
        form += "<style type='text/css'>"+CSS+"</style>";

        form += "<div class='form-style-8'><form action='configuration'>"
                "<h2>IOAnt Client Configuration</h2>";
        for (int i=0; i < NUMBER_OF_CONFIGURATION_FIELDS; i++){
            form += "<input type='text' name='"+CONFIGURATION_FIELDS[i]+"' placeholder='"+CONFIGURATION_FIELDS_READABLE[i]+"'>";
        }

        form +=  "<input type='submit' value='Save'>"
                 "</form></div>";

        return form;
    }

    bool CommunicationManager::ChangeCommunicationState(CommunicationState state){
        communication_state_ = state;
        if(CommunicationState::OFFLINE == state){
            return true;
        }
        else if(CommunicationState::WEBSERVER == state){
            web_server_ = new ESP8266WebServer(80);
            WiFi.mode(WIFI_AP);
            String softAPname = "IOANT_DEVICE";
            WiFi.softAP(softAPname.c_str(), "test1234");
            IPAddress myIP = WiFi.softAPIP();
            ULOG_DEBUG << "Hosting AP: " << "IOANT_";
            ULOG_DEBUG << "Ip address if AP: " << AddressToString(myIP);

            web_server_->on("/", [](){
               COM_MGR->web_server_->send(200, "text/html", BuildConfigurationForm());
            });

            web_server_->on("/configuration", [](){
                ULOG_DEBUG << "Configuration update request!";
                COM_MGR->HandleFormConfiguration();
            });

            web_server_->begin();

            return true;
        }
        else if(CommunicationState::WIFI_ONLINE == state){
            ULOG_DEBUG << "Change communication State to WIFI_ONLINE.";
            WiFi.mode(WIFI_STA);
            wifi_multi_.addAP(config_.wifi_ssid.c_str(), config_.wifi_password.c_str());
            ULOG_DEBUG << "Add ap ssid:" << config_.wifi_ssid << " and pass:" << config_.wifi_password ;
            return true;
        }
        else if(CommunicationState::BROKER_ONLINE == state){
            ULOG_DEBUG << "Change communication State to BROKER_ONLINE.";
            if (!config_.low_power)
                pinMode(config_.status_led, OUTPUT);
            mqtt_client_.setServer(config_.broker_url.c_str(), config_.broker_port);
            mqtt_client_.setCallback(MqttOnMessage);
            return true;
        }
        else{
            return false;
        }
    }

    CommunicationManager::CommunicationState CommunicationManager::GetCommunicationState(){
        return communication_state_;
    }

    ESP8266WebServer* CommunicationManager::GetWebServerHandle(){
        return web_server_;
    }

    bool CommunicationManager::HandleWebServerConfigurationUpdate(){
        if (configuration_updated_){
            return true;
        }
        if (web_server_){
            web_server_->handleClient();
        }
        return false;
    }

    void CommunicationManager::HandleFormConfiguration(){


        ULOG_DEBUG << "asd";

        ULOG_DEBUG << "--- WEBSERVER DATA ---";
        ULOG_DEBUG << "client_id" << String(web_server_->arg("client_id"));
        ULOG_DEBUG << "wifi_ssid" << String(web_server_->arg("wifi_ssid"));
        ULOG_DEBUG << "wifi_password" << String(web_server_->arg("wifi_password"));
        ULOG_DEBUG << "broker_url" << String(web_server_->arg("broker_url"));
        ULOG_DEBUG << "broker_port" << web_server_->arg("broker_port");
        ULOG_DEBUG << "broker_user" << String(web_server_->arg("broker_user"));
        ULOG_DEBUG << "broker_password" << String(web_server_->arg("broker_password"));
        ULOG_DEBUG << "udp_url" << String(web_server_->arg("udp_url"));
        ULOG_DEBUG << "udp_port" << web_server_->arg("udp_port");
        ULOG_DEBUG << "status_led" << web_server_->arg("status_led");
        ULOG_DEBUG << "topic_global" << String(web_server_->arg("topic_global"));
        ULOG_DEBUG << "topic_local" << String(web_server_->arg("topic_local"));
        ULOG_DEBUG << "communication_delay" << web_server_->arg("communication_delay");

        if (web_server_){
            if (web_server_->arg("client_id").length() > 0)
                config_.client_id =  web_server_->arg("client_id");
            if (web_server_->arg("wifi_ssid").length() > 0)
                config_.wifi_ssid =  web_server_->arg("wifi_ssid");
            if (web_server_->arg("wifi_password").length() > 0)
                config_.wifi_password =  web_server_->arg("wifi_password");
            if (web_server_->arg("broker_url").length() > 0)
                config_.broker_url =  web_server_->arg("broker_url");
            if (web_server_->arg("broker_port").toInt())
                config_.broker_port =  web_server_->arg("broker_port").toInt();
            if (web_server_->arg("broker_user").length() > 0)
                config_.broker_user =  web_server_->arg("broker_user");
            if (web_server_->arg("broker_password").length() > 0)
                config_.broker_password =  web_server_->arg("broker_password");
            if (web_server_->arg("udp_url").length() > 0)
                config_.udp_url =  web_server_->arg("udp_url");
            if (web_server_->arg("udp_port").toInt())
                config_.udp_port =  web_server_->arg("udp_port").toInt();
            if (web_server_->arg("low_power") == "true")
                config_.low_power =  true;
            else
                config_.low_power =  false;
            if (web_server_->arg("status_led").toInt())
                config_.status_led =  web_server_->arg("status_led").toInt();
            if (web_server_->arg("topic_global").length() > 0)
                config_.topic_global =  web_server_->arg("topic_global");
            if (web_server_->arg("topic_local").length() > 0)
                config_.topic_local =  web_server_->arg("topic_local");
            if (web_server_->arg("communication_delay").toInt())
                config_.communication_delay =  web_server_->arg("communication_delay").toInt();

            configuration_updated_ = true;
        }
    }

    void CommunicationManager::UpdateConfiguration(Configuration& configuration){
        config_ = configuration;
    }

    void CommunicationManager::GetCurrentConfiguration(CommunicationManager::Configuration& configuration){
        configuration = config_;
    }


    void CommunicationManager::SetMqttOnMessageCallback(void (*on_message)(char* topic, byte* payload, unsigned int length)){
    io_callback = on_message;
    }


    bool CommunicationManager::UpdateWifiConnection(){
        bool result = false;
        for(int i=0; i < 4; i++){
            wifi_status_ = wifi_multi_.run();
            if (wifi_status_ == WL_CONNECTED)
            {
                communication_state_ = CommunicationState::WIFI_ONLINE;
                result = true;
                break;
            }
            delay(1000);
        }
        return result;
    }

    bool CommunicationManager::UpdateBrokerConnection(bool clean_session){

        bool result = false;
        for(int i=0; i < 4; i++){
            if(!mqtt_client_.connected()){
                ULOG_DEBUG << "Connecting to broker:" << config_.broker_url;
                ULOG_DEBUG << "With client id:" << config_.client_id;
                result = mqtt_client_.connect(config_.client_id.c_str(),
                                              config_.broker_user.c_str(),
                                              config_.broker_password.c_str(),
                                              clean_session);
            }
            else{
                result = true;
                break;
            }
            delay(1000);
        }
        return result;
    }


    bool CommunicationManager::SendUdpPackage(String message){
        if (silent_)
            return false;

        if (GetStatus() == WL_CONNECTED)
        {
            if (wifi_udp_.beginPacket(config_.udp_url.c_str(), config_.udp_port))
            {
                wifi_udp_.write(message.c_str(), message.length());
                wifi_udp_.endPacket();
                return true;
            }
        }
        return false;
    }


    String CommunicationManager::SendGETPackage(String data, bool ack){
        // if (silent_)
        //     return "failed";
        //
        // String response = "failed";
        // if (GetStatus() == WL_CONNECTED){
        //     if (!config_.low_power_mode)
        //         digitalWrite(config_.status_led_pin,HIGH);
        //
        //     if (!wifi_client_.connect(config_.host_domain.c_str(), config_.host_port)){
        //         ULOG_DEBUG << "Connection to host:" << config_.host_domain << " failed";
        //         return response;
        //     }
        //     // This will send the request to the server
        //     wifi_client_.print(String("GET ") + data + " HTTP/1.1\r\n" +
        //                "Host: " + config_.host_domain + "\r\n" +
        //                "Connection: close\r\n\r\n");
        //
        //     if (ack){
        //         delay(1000);
        //
        //         while(wifi_client_.available()){
        //             response = wifi_client_.readStringUntil('\r');
        //         }
        //     }
        //     else{
        //         response = "Nack";
        //     }
        //
        //     if (!config_.low_power_mode)
        //         digitalWrite(config_.status_led_pin,LOW);
        // }

        return "not implemented";
    }


    wl_status_t CommunicationManager::GetStatus(){
        return WiFi.status();
    }


    String CommunicationManager::GetOwnIPAddress(){
        String ip_string = AddressToString(WiFi.localIP());
        return ip_string;
    }


    bool CommunicationManager::IsLowPowerMode(){
        return config_.low_power;
    }


    String CommunicationManager::AddressToString(IPAddress address){
        return  String(address[0]) + "." +
                String(address[1]) + "." +
                String(address[2]) + "." +
                String(address[3]);
    }


    bool CommunicationManager::MqttSubscribeToTopic(String topic){
        mqtt_client_.subscribe(topic.c_str());
        return true;
    }


    bool CommunicationManager::MqttLoop(){
        mqtt_client_.loop();
        return true;
    }


    bool CommunicationManager::MqttPublish(String topic, String payload){
        return CommunicationManager::MqttPublish(topic, payload.c_str());
    }


    bool CommunicationManager::MqttPublish(String topic, const char* payload){

        if (silent_)
            return false;

        if (!config_.low_power)
            digitalWrite(config_.status_led, HIGH);

        bool result = mqtt_client_.publish(topic.c_str(), payload);


        if (!config_.low_power)
            digitalWrite(config_.status_led, LOW);

        return result;
    }


    bool CommunicationManager::MqttPublish(String topic, uint8_t* payload, uint8_t number_of_bytes){
        if (silent_)
            return false;

        if (!config_.low_power)
            digitalWrite(config_.status_led,HIGH);

        bool result = mqtt_client_.publish(topic.c_str(), payload, number_of_bytes);

        ULOG_DEBUG << "Sent:" << result;

        if (!config_.low_power)
            digitalWrite(config_.status_led,LOW);

        return result;
    }


    int CommunicationManager::MqttGetState(){
        return mqtt_client_.state();
    }

    void CommunicationManager::SetSilentMode(bool silent){
        silent_ = silent;
    }


    /// Wrapper function for Mqtt on message
    void MqttOnMessage(char* topic, byte* payload, unsigned int length)
    {
        WLOG_DEBUG << "on message communication manager";
        // Call callback in Nabton client or main.cpp
        if (COM_MGR->io_callback != NULL)
            COM_MGR->io_callback((char*)topic, payload, length);
    }

}
