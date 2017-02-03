///
/// @file   core.cpp
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Core class source
///
/// This class handles the encoding and decoding of messages when communicating
/// with a ioant server solution
///
#include "core.h"

namespace ioant
{
    static const unsigned int EEPROM_STORAGE_SIZE = 512;
    Core* Core::instance_ = NULL;

    Core* Core::GetInstance(void (*on_message)(Topic topic, ProtoIO* message)){
        if (instance_ == NULL)
        {
            instance_ = new Core(on_message);
        }
        return instance_;
    }

    Core* Core::GetInstance(){
        if (instance_)
        {
            return instance_;
        }
    }

    Core::Core(void (*on_message)(Topic topic, ProtoIO* message)) : state_(State::STATE_POWER_ON), localConfigurationTicks_(0)
    {
        CommunicationManager::GetInstance();
        delay(500);
        MQTTCallback = on_message;
        EEPROM.begin(EEPROM_STORAGE_SIZE);
        COM_MGR->SetMqttOnMessageCallback(OnMessage);
        while(!IsOperational()){
            delay(1000);
        }
    }

    bool Core::UpdateLoop()
    {
        CommunicationManager::Configuration configuration;
        COM_MGR->GetCurrentConfiguration(configuration);
        delay(configuration.communication_delay);

        // Is connected to broker. All good
        if (COM_MGR->UpdateWifiConnection()){
            if (!COM_MGR->UpdateBrokerConnection()){
                ULOG_DEBUG << "Broker connection lost handing over to state machine";
                SetState(State::STATE_MQTT);
            }
        }
        else{
            ULOG_DEBUG << "WIFI connection lost handing over to state machine";
            SetState(State::STATE_WIFI);
        }

        // Try to become operational
        while(!IsOperational()){
            delay(1000);
        }

        //Check for new messages
        COM_MGR->MqttLoop();
    }


    bool Core::IsOperational(){
        if (state_ == State::STATE_OPERATIONAL){
            return true;
        }

        if(State::STATE_POWER_ON == state_){
            SetState(State::STATE_CONFIGURATION);
        }
        else if(State::STATE_CONFIGURATION == state_){
            CommunicationManager::Configuration persisted_configuration;
            if (GetPersistenConfiguration(persisted_configuration)){
                SetState(State::STATE_WIFI);
                COM_MGR->UpdateConfiguration(persisted_configuration);
            }
            else{
                SetState(State::STATE_AP_MODE);
            }
        }
        else if(State::STATE_WIFI == state_){
            COM_MGR->EnableWifiCommunication();
            if (COM_MGR->UpdateWifiConnection()){
                SetState(State::STATE_MQTT);
            }
            else{
                SetState(State::STATE_AP_MODE);
            }
        }
        else if(State::STATE_MQTT == state_){
            COM_MGR->EnableMQTTCommunication();
            if (COM_MGR->UpdateBrokerConnection(true)){
                SetState(State::STATE_OPERATIONAL);
                CommunicationManager::Configuration updated_configuration;
                COM_MGR->GetCurrentConfiguration(updated_configuration);
                configured_topic_.client_id = updated_configuration.client_id;
                configured_topic_.global = updated_configuration.topic_global;
                configured_topic_.local = updated_configuration.topic_local;

                ULOG_DEBUG <<  "control/"+updated_configuration.client_id+"/#";
                COM_MGR->MqttSubscribeToTopic("control/"+updated_configuration.client_id+"/#");
                PublishBootInfoMessage();
            }
            else{
                SetState(State::STATE_AP_MODE);
            }
        }
        else if(State::STATE_AP_MODE == state_){
            localConfigurationTicks_++;
            ULOG_DEBUG << localConfigurationTicks_;
            if(localConfigurationTicks_ >= 300){
                ULOG_DEBUG << "Rebooting due to tick limit";
                delay(1000);
                ESP.restart();
            }
            if (COM_MGR->HandleWebServerConfigurationUpdate()){
                //Configuration received
                CommunicationManager::Configuration updated_configuration;
                COM_MGR->GetCurrentConfiguration(updated_configuration);
                SetPersistenConfiguration(updated_configuration);
                ULOG_DEBUG << "Rebooting...";
                delay(1000);
                ESP.restart();
            }
        }

        return false;
    }


    bool Core::Publish(ProtoIO& msg)
    {
        return Core::Publish(msg, configured_topic_);
    }


    bool Core::Publish(ProtoIO& msg, Topic topic)
    {
        msg.Encode();
        ProtoIO::MessageMeta meta = msg.GetMessageMeta();

        if (meta.valid){
            if (topic.stream_index < 0){
                topic.stream_index = 0;
            }

            String Core_topic =  "live/" + topic.global + "/" + topic.local + "/"
                                    + topic.client_id + "/"
                                    + String(meta.message_type)
                                    + "/" + String(topic.stream_index);
            bool result = COM_MGR->MqttPublish(Core_topic, msg.GetBufferHandle(), meta.number_of_bytes);
            return result;
        }
        else{
            return false;
        }
    }


    // Function for creating and publishing a boot info message
    bool Core::PublishBootInfoMessage(){
        String reset_reason = ESP.getResetReason();
        String ipadddrr = COM_MGR->GetOwnIPAddress();
        BootInfoMessage boot_message;
        boot_message.data.reboot_reason = (char*)reset_reason.c_str();
        boot_message.data.program_size = ESP.getSketchSize();
        boot_message.data.ip_address = (char*)ipadddrr.c_str();
        boot_message.data.proto_version = ProtoVersion_VERSION;

        bool result = Publish(boot_message);
        WLOG_INFO  << "Publish boot!: " << result << " bytes: " << boot_message.GetMessageMeta().number_of_bytes;
        if(!result){
            WLOG_ERROR << "Failed to publish message of size(bytes):" << (int)boot_message.GetMessageMeta().number_of_bytes;
        }

        return result;
    }


    bool Core::Subscribe(Topic topic){
        // live/global/local/client_id/message_type/index
        // live/+/+/local/+/#
        String subscription = "live/"+topic.global+"/"+topic.local+"/"+topic.client_id+"/";

        if (topic.message_type == -1){
            subscription += '+';
        }
        else{
            subscription += String(topic.message_type)+"/";
        }

        if (topic.stream_index == -1){
            subscription += '#';
        }
        else{
            subscription += String(topic.stream_index);
        }
        COM_MGR->MqttSubscribeToTopic(subscription);
    }


    Core::Topic Core::GetConfiguredTopic(){
        return configured_topic_;
    }


    bool Core::GetPersistenConfiguration(CommunicationManager::Configuration& configuration){
        //Check if configuration is present in EEPROM (magic number is present)
        uint8_t lower_byte = EEPROM.read(0);
        uint8_t upper_byte = EEPROM.read(1);
        uint16_t magic_number = (upper_byte<<8) | lower_byte;
        if (magic_number == 0xABCD){
            uint8_t number_of_bytes_lower = EEPROM.read(2);
            uint8_t number_of_bytes_upper = EEPROM.read(3);
            uint16_t number_of_bytes = (number_of_bytes_upper<<8) | number_of_bytes_lower;
            if (number_of_bytes > 0 && number_of_bytes < EEPROM_STORAGE_SIZE){
                uint8_t* temporary_buffer = (uint8_t*)calloc(number_of_bytes, sizeof(uint8_t));
                for(int i = 0; i<number_of_bytes; i++){
                    temporary_buffer[i] = EEPROM.read(4+i);
                }
                // Create configuration ProtoIO message
                ConfigurationMessage msg;
                bool result = msg.Decode(temporary_buffer, number_of_bytes);

                if (result){
                    configuration.client_id = msg.data.client_id;
                    configuration.wifi_ssid = msg.data.wifi_ssid;
                    configuration.wifi_password = msg.data.wifi_password;
                    configuration.broker_url = msg.data.broker_url;
                    configuration.broker_port = msg.data.broker_port;
                    configuration.broker_user = msg.data.broker_user;
                    configuration.broker_password = msg.data.broker_password;
                    configuration.udp_url = msg.data.udp_url;
                    configuration.udp_port = msg.data.udp_port;
                    configuration.low_power = msg.data.low_power;
                    configuration.status_led = msg.data.status_led;
                    configuration.topic_global = msg.data.topic_global;
                    configuration.topic_local = msg.data.topic_local;
                    configuration.communication_delay = msg.data.communication_delay;
                    configuration.application_generic = msg.data.application_generic;

                    ULOG_DEBUG << "client_id: " << configuration.client_id ;
                    ULOG_DEBUG << "wifi_ssid: " << configuration.wifi_ssid ;
                    ULOG_DEBUG << "wifi_password: " << configuration.wifi_password ;
                    ULOG_DEBUG << "broker_url: " << configuration.broker_url ;
                    ULOG_DEBUG << "broker_port: " << configuration.broker_port ;
                    ULOG_DEBUG << "broker_user: " << configuration.broker_user ;
                    ULOG_DEBUG << "broker_password: " << configuration.broker_password ;
                    ULOG_DEBUG << "udp_url: " << configuration.udp_url ;
                    ULOG_DEBUG << "udp_port: " << configuration.udp_port ;
                    ULOG_DEBUG << "low_power: " << configuration.low_power ;
                    ULOG_DEBUG << "status_led: " << configuration.status_led ;
                    ULOG_DEBUG << "topic_global: " << configuration.topic_global ;
                    ULOG_DEBUG << "topic_local: " << configuration.topic_local ;
                    ULOG_DEBUG << "communication_delay: " << configuration.communication_delay ;
                    ULOG_DEBUG << "application_generic: " << configuration.application_generic ;
                }
                else{
                    ULOG_ERROR << "Failed to decode configuration settings";
                }

                free(temporary_buffer);
                return result;
            }
            ULOG_DEBUG << "Managed to read configuration! Number of bytes:" << (int)number_of_bytes;
        }
        else
        {
            ULOG_DEBUG << "No configuration in EEPROM found";
            return false;
        }
    }


    bool Core::SetPersistenConfiguration(ConfigurationMessage* configuration_message){

        uint8_t lower_byte = 0xCD;
        uint8_t upper_byte = 0xAB;
        EEPROM.write(0, lower_byte);
        EEPROM.write(1, upper_byte);

        uint8_t* buffer_handle = configuration_message->GetBufferHandle();
        if (buffer_handle == NULL){
            ULOG_DEBUG << "Encoded!";
            configuration_message->Encode();
            buffer_handle = configuration_message->GetBufferHandle();
        }

        uint16_t number_of_bytes = configuration_message->GetMessageMeta().number_of_bytes;
        uint8_t number_of_bytes_lower = number_of_bytes & 0xff;
        uint8_t number_of_bytes_upper = (number_of_bytes >> 8);
        EEPROM.write(2, number_of_bytes_lower);
        EEPROM.write(3, number_of_bytes_upper);

        for(int i = 0; i<number_of_bytes; i++){
            EEPROM.write(4+i, buffer_handle[i]);
        }
        EEPROM.commit();
        ULOG_DEBUG << "Written configuration to EEPROM. Number of bytes:" << (int)number_of_bytes;

        return true;
    }

    bool Core::SetPersistenConfiguration(CommunicationManager::Configuration& configuration){

        ULOG_DEBUG << "Persisting configuration";
        ConfigurationMessage msg;

        msg.data.client_id = (char*)configuration.client_id.c_str();
        msg.data.wifi_ssid = (char*)configuration.wifi_ssid.c_str();
        msg.data.wifi_password = (char*)configuration.wifi_password.c_str();
        msg.data.broker_url = (char*)configuration.broker_url.c_str();
        msg.data.broker_port = configuration.broker_port;
        msg.data.broker_user = (char*)configuration.broker_user.c_str();
        msg.data.broker_password = (char*)configuration.broker_password.c_str();
        msg.data.udp_url = (char*)configuration.udp_url.c_str();
        msg.data.udp_port = configuration.udp_port;
        msg.data.low_power = configuration.low_power;
        msg.data.status_led = configuration.status_led;
        msg.data.topic_global = (char*)configuration.topic_global.c_str();
        msg.data.topic_local = (char*)configuration.topic_local.c_str();
        msg.data.communication_delay = configuration.communication_delay;
        msg.data.application_generic = configuration.application_generic;

        msg.Encode();

        SetPersistenConfiguration(&msg);

        ULOG_DEBUG << "Persisting configuraiton done";

        return true;
    }

    void Core::GetCurrentConfiguration(CommunicationManager::Configuration& configuration){
        COM_MGR->GetCurrentConfiguration(configuration);
    }


    Core::Topic ParseTopicString(char* topic){
        Core::Topic parsed_topic;
        String topic_s = String(topic);
        char * pch;
        pch = strtok (topic,"/");
        int i = 1;
        while (pch != NULL){
            if (i == 1){
                parsed_topic.top = String(pch);
            }
            else if (i == 2){
                parsed_topic.global = String(pch);
            }
            else if (i == 3){
                parsed_topic.local = String(pch);
            }
            else if (i == 4){
                parsed_topic.client_id = String(pch);
            }
            else if (i == 5){
                int message_type = String(pch).toInt();
                parsed_topic.message_type = message_type;
            }
            else if (i == 6){
                parsed_topic.stream_index = String(pch).toInt();
            }
            pch = strtok (NULL, "/");
            i++;
        }
        return parsed_topic;
    }

    bool Core::PopulateEmptyConfigurationFieldsWithOldConfiguration(ConfigurationMessage* msg){
        CommunicationManager::Configuration loaded_configuration;
        Core::GetCurrentConfiguration(loaded_configuration);

        ULOG_DEBUG << "client_id:" << loaded_configuration.client_id;
        ULOG_DEBUG << "wifi ssid:" << loaded_configuration.wifi_ssid;


        if (String(msg->data.client_id).length() == 0)
            msg->data.client_id = (char*)loaded_configuration.client_id.c_str();
        if (String(msg->data.wifi_ssid).length() == 0)
            msg->data.wifi_ssid = (char*)loaded_configuration.wifi_ssid.c_str();
        if (String(msg->data.wifi_password).length() == 0)
            msg->data.wifi_password = (char*)loaded_configuration.wifi_password.c_str();
        if (String(msg->data.broker_url).length() == 0)
            msg->data.broker_url = (char*)loaded_configuration.broker_url.c_str();
        if (msg->data.broker_port == 0)
            msg->data.broker_port = loaded_configuration.broker_port;
        if (String(msg->data.udp_url).length() == 0)
            msg->data.udp_url = (char*)loaded_configuration.udp_url.c_str();
        if (msg->data.udp_port == 0)
            msg->data.udp_port = loaded_configuration.udp_port;
        if (String(msg->data.topic_global).length() == 0)
            msg->data.topic_global = (char*)loaded_configuration.topic_global.c_str();
        if (String(msg->data.topic_local).length() == 0)
            msg->data.topic_local = (char*)loaded_configuration.topic_local.c_str();
        if (msg->data.communication_delay == 0)
            msg->data.communication_delay = loaded_configuration.communication_delay;
        if (msg->data.application_generic < 0)
            msg->data.communication_delay = loaded_configuration.communication_delay;

        ULOG_DEBUG << "wifi ssid after:" << msg->data.wifi_ssid;
        msg->Encode();

        return true;
    }


    void OnMessage(char* topic, byte* payload, unsigned int length){
        //ULOG_DEBUG << "message recieved";
        Core::Topic topic_received = ParseTopicString(topic);

        ProtoIO* message = ProtoIO::CreateMessage(topic_received.message_type);
        message->Decode((uint8_t*)payload, length);

        if (topic_received.top == "live"){
            if (IOANT->MQTTCallback != NULL){
                IOANT->MQTTCallback(topic_received, message);
            }
        }
        else if (topic_received.top == "control"){
            WLOG_DEBUG << "Control message recieved";

            if (topic_received.local == "reboot"){
                WLOG_DEBUG << "Rebooting...";
                delay(1000);
                ESP.restart();
            }
            else if (topic_received.local == "configuration"){
                ConfigurationMessage* msg = static_cast<ConfigurationMessage*>(message);
                IOANT->PopulateEmptyConfigurationFieldsWithOldConfiguration(msg);
                IOANT->SetPersistenConfiguration(msg);
                WLOG_DEBUG << "Rebooting...";
                delay(1000);
                ESP.restart();
            }
            else if (topic_received.local == "wipe"){
                WLOG_DEBUG << "Wiping Configuration!";
                ConfigurationMessage empty_message;
                IOANT->SetPersistenConfiguration(&empty_message);
                WLOG_DEBUG << "Rebooting...";
                delay(1000);
                ESP.restart();
            }
            else if (topic_received.local == "mute"){
                WLOG_DEBUG << "Going into mute mode";
                delay(1000);
                COM_MGR->SetSilentMode(true);
            }
            else if (topic_received.local == "unmute"){
                COM_MGR->SetSilentMode(false);
                delay(1000);
                WLOG_DEBUG << "Going into unmute mode";
            }
        }
        else if (topic_received.top == "test"){
            WLOG_DEBUG << "Test message recieved";
            //Core->MQTTCallback(topic_received, payload, length);
        }
        else {
            WLOG_DEBUG << "Unknown message received";
        }
        message->~ProtoIO();
        free(message);
    }

    void Core::VisualStateIndicator(){
        CommunicationManager::Configuration loaded_configuration;
        GetCurrentConfiguration(loaded_configuration);
        switch(state_){
            case STATE_POWER_ON:{
                for (int i=0; i<1;i++){
                    digitalWrite(loaded_configuration.status_led, HIGH);
                    delay(300);
                    digitalWrite(loaded_configuration.status_led, LOW);
                    delay(300);
                }
            } break;
            case STATE_CONFIGURATION:{
                for (int i=0; i<2;i++){
                    digitalWrite(loaded_configuration.status_led, HIGH);
                    delay(300);
                    digitalWrite(loaded_configuration.status_led, LOW);
                    delay(300);
                }
            } break;
            case STATE_WIFI:{
                for (int i=0; i<3;i++){
                    digitalWrite(loaded_configuration.status_led, HIGH);
                    delay(300);
                    digitalWrite(loaded_configuration.status_led, LOW);
                    delay(300);
                }
            } break;
            case STATE_MQTT:{
                for (int i=0; i<4;i++){
                    digitalWrite(loaded_configuration.status_led, HIGH);
                    delay(300);
                    digitalWrite(loaded_configuration.status_led, LOW);
                    delay(300);
                }
            } break;
            case STATE_AP_MODE:{
                for (int i=0; i<5;i++){
                    digitalWrite(loaded_configuration.status_led, HIGH);
                    delay(300);
                    digitalWrite(loaded_configuration.status_led, LOW);
                    delay(300);
                }
            } break;
            case STATE_OPERATIONAL:{
                for (int i=0; i<6;i++){
                    digitalWrite(loaded_configuration.status_led, HIGH);
                    delay(300);
                    digitalWrite(loaded_configuration.status_led, LOW);
                    delay(300);
                }
            } break;
        }
    }

    void Core::SetState(State new_state){
        State prev_state = state_;
        ULOG_DEBUG  << "State transition:"  << StateToString(prev_state) << "->" << StateToString(new_state);
        state_ = new_state;
        VisualStateIndicator();
    }

    String Core::StateToString(State state){
        String state_message = "";
        if (state == STATE_POWER_ON){
            state_message = "Power on";
        }
        else if (state == STATE_CONFIGURATION){
            state_message = "Configuration";
        }
        else if (state == STATE_WIFI){
            state_message = "Wifi";
        }
        else if (state == STATE_MQTT){
            state_message = "Mqtt";
        }
        else if (state == STATE_AP_MODE){
            state_message = "AP mode";
        }
        else if (state == STATE_OPERATIONAL){
            state_message = "Operational";
        }
        else{
            state_message = "Unknown";
        }
        return state_message;
    }
}
