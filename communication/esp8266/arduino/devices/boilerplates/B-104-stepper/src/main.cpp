///
/// @file   main.cpp
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Boiler plate application for running stepper motor
///

#include <core.h>
using namespace ioant;
/// @brief on_message() function
/// Function definition for handling received MQTT messages
///
/// @param received_topic contains the complete topic structure
/// @param payload contains the contents of the message received
/// @param length the number of bytes received
///
void on_message(Core::Topic received_topic, ProtoIO* message);

// ############################################################################
// Everything above this line is mandatory
// ############################################################################


int DIR   = 12;  // gpio for direction
int STEP  = 4;  // gpio for step
int SLEEP = 5;  // gpio for sleep

// Stepper Motor Characteristics
float stepper_resolution = 1.5;
int stepper_gearbox = 5;  // factor of scaling down rotation
int stepper_mode = 1; // full step (0,0), half step (1,0), 1/4 step (0,1), and 1/8 step (1,1 : default).

//================================================
void stepCW(int steps,int dd)
//================================================
{
  int i;
  digitalWrite(DIR, LOW);
  digitalWrite(SLEEP, HIGH); // Set the Sleep mode to AWAKE.
  for(i=0;i<=steps;i++)
    {
      delayMicroseconds(200);
      digitalWrite(STEP, HIGH);
      delay(dd);
      digitalWrite(STEP, LOW);
      delay(dd);
    }
  digitalWrite(DIR, LOW);
  digitalWrite(SLEEP, LOW); // Set the Sleep mode to SLEEP.
}

//================================================
void stepCCW(int steps,int dd)
//================================================
{
  int i;
  digitalWrite(DIR, HIGH);
  digitalWrite(SLEEP, HIGH); // Set the Sleep mode to AWAKE.
  for(i=0;i<=steps;i++)
    {
      delayMicroseconds(200);
      digitalWrite(STEP, HIGH);
      delay(dd);
      digitalWrite(STEP, LOW);
      delay(dd);
    }
  digitalWrite(DIR, LOW);
  digitalWrite(SLEEP, LOW); // Set the Sleep mode to SLEEP.
}

void setup(void){
    //Initialize Nabton
    Core::GetInstance(on_message);

    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################
    ULOG_DEBUG << "This is a debug message over serial port";
    //WLOG_DEBUG << "This is a debug message over wifi";


    //Subscribe to its own global and local topic
    Core::Topic subscribe_topic;
    subscribe_topic.global = "sweden";
    subscribe_topic.local = "wermland";
    IOANT->Subscribe(subscribe_topic);
}

void loop(void){
    // Monitors Wifi connection and loops MQTT connection. Attempt reconnect if lost
    IOANT->UpdateLoop();

    // Send a Temperature message to itself on topic kConfigTopicGlobal/kConfigTopicLocal
    TemperatureMessage msg;
    msg.data.unit = Temperature_Unit_CELSIUS;
    msg.data.value = 14.5f;
    IOANT->Publish(msg);

    // Also send the temeprature message to a remote topic
    Core::Topic remote_topic = IOANT->GetConfiguredTopic();
    remote_topic.global = "sweden";
    remote_topic.local = "wermland";
    IOANT->Publish(msg, remote_topic);

    ULOG_DEBUG << "free heap:" << (int)ESP.getFreeHeap();
}

// Function for handling received MQTT messages
void on_message(Core::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;

    if (received_topic.message_type == ProtoIO::MessageTypes::IMAGE)
    {
        ImageMessage* message = dynamic_cast<ImageMessage*>(message);
        WLOG_DEBUG << "Image reference link:" << message->data.reference_link;
    }
}
