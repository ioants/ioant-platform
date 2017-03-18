///
/// @file   main.cpp
/// @Author Adam Saxen
/// @date   Oktober, 2016
/// @brief  Boiler plate application for running stepper motor
///

#include <ioant.h>
using namespace ioant;
/// @brief on_message() function
/// Function definition for handling received MQTT messages
///
/// @param received_topic contains the complete topic structure
/// @param message is the proto message recieved
///
/// Proto message is casted to appropriate message
///
void on_message(Ioant::Topic received_topic, ProtoIO* message);

// ############################################################################
// Everything above this line is mandatory
// ############################################################################


int DIR   = 4;   // D2
int STEP  = 5;   // D1
int SLEEP = 12;  // D6
int MS1   = 13;  // D7
int MS2   = 14;  // D5

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
    //Initialize
    Ioant::GetInstance(on_message);
    pinMode(DIR,OUTPUT);
    pinMode(STEP,OUTPUT);
    pinMode(SLEEP,OUTPUT);
    pinMode(MS1,OUTPUT);
    pinMode(MS2,OUTPUT);

    digitalWrite(MS1,LOW);
    digitalWrite(MS2,LOW);
    digitalWrite(SLEEP,LOW);
    digitalWrite(DIR,LOW);
    digitalWrite(STEP,LOW);
    //Possible settings are (MS1/MS2) : full step (0,0), half step (1,0), 1/4 step (0,1), and 1/8 step (1,1)

    //Subscribe stepper commands
    Ioant::Topic subscribe_topic = IOANT->GetConfiguredTopic();
    subscribe_topic.message_type = ProtoIO::MessageTypes::RUNSTEPPERMOTORRAW;
    IOANT->Subscribe(subscribe_topic);
}

void loop(void){
    // Monitors Wifi connection and loops MQTT connection. Attempt reconnect if lost
    IOANT->UpdateLoop();
}

// Function for handling received MQTT messages
void on_message(Ioant::Topic received_topic, ProtoIO* message){

    if (received_topic.message_type == ProtoIO::MessageTypes::RUNSTEPPERMOTORRAW)
    {
        ULOG_DEBUG << "Stepper awake";
        RunStepperMotorRawMessage *msg = static_cast<RunStepperMotorRawMessage*>(message);
        if(msg->data.number_of_step < 1 || msg->data.number_of_step > 500) return;
        if(msg->data.delay_between_steps < 1 || msg->data.delay_between_steps > 1000) return;

        if(msg->data.step_size == RunStepperMotorRaw_StepSize_FULL_STEP)
        {
            ULOG_DEBUG << "Stepper FULL STEP";
            digitalWrite(MS1,LOW);
            digitalWrite(MS2,LOW);
        }
        else if (msg->data.step_size == RunStepperMotorRaw_StepSize_HALF_STEP)
        {
            ULOG_DEBUG << "Stepper HALF STEP";
            digitalWrite(MS1,HIGH);
            digitalWrite(MS2,LOW);
        }
        else if (msg->data.step_size == RunStepperMotorRaw_StepSize_QUARTER_STEP)
        {
            ULOG_DEBUG << "Stepper QUARTER STEP";
            digitalWrite(MS1,LOW);
            digitalWrite(MS2,HIGH);
        }
        else // default fullstep
        {
            ULOG_DEBUG << "Stepper DEFAULT FULL STEP";
            digitalWrite(MS1,LOW);
            digitalWrite(MS2,LOW);
        }

        if(msg->data.direction == RunStepperMotorRaw_Direction_CLOCKWISE)
        {
            ULOG_DEBUG << "Stepper motor CW -->";
            stepCW(msg->data.number_of_step,msg->data.delay_between_steps);
        }
        else if(msg->data.direction == RunStepperMotorRaw_Direction_COUNTER_CLOCKWISE)
        {
            ULOG_DEBUG << "Stepper motor CCW  <--";
            stepCCW(msg->data.number_of_step,msg->data.delay_between_steps);
        }
        else
            ULOG_DEBUG << "ERROR: Unknown direction for stepper motor";

        digitalWrite(MS1,LOW);
        digitalWrite(MS2,LOW);
        ULOG_DEBUG << "Stepper sleeping";
    }
}
