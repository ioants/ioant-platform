///
/// @file   main.cpp
/// @Author Adam Saxen
/// @date   Januari, 2017
/// @brief  WIFI enabled Body weight scale application
/// For information about the scale and the electronics check the codeterrific article: http://codeterrific.com/arduino/wifi-body-weight-scale-esp8266/
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

const int len_data_buffer = 10;
double data_weight_ [len_data_buffer] = {0};
int index_data = 0;
int zeroThreshold = -1;

uint8_t PERSON_ONE_PIN = 5;
uint8_t PERSON_TWO_PIN = 4;
uint8_t WAIT_LED_PIN = 15;
uint8_t INTERRUPT_PIN = 12;
volatile int lastTime = 0;

// Function for converting duration in microseconds to kilograms
double linearApprox(float x)
{
    //These calibration coefficients will differ in your body weight scale!
    //double k = 0.0021845724;
    //double m = -57.9144449;
    double k = 0.00175309;
    double m = -382.757;
    double weight_kg = k*x+m;
    return weight_kg;
}

// The interrupt service rutine (ISR)
// Called every time an interrupt occurs
void ICACHE_RAM_ATTR measurePulseWidth()
{
    int t = micros();
    int duration = t - lastTime;
    // Microseconds (100 to 20 ms)
    //ULOG << "raw> " << duration << " i:" << index_data;
    if(duration > 214000 && duration < 300000)
    {
        data_weight_[index_data] = duration;
        index_data++;
        //Reset counter
        if (index_data == len_data_buffer)
            index_data = 0;
    }
    lastTime = t;
}

float getValidMeasurement(int devMax, float zeroLevel)
{
    //Calculate sum, mean and variance of the data buffer
    float mean, sd, var, dev, sum = 0.0, sdev = 0.0;
    for(int i = 0; i < len_data_buffer; i++){
        sum = sum + data_weight_[i];
        Serial.print(data_weight_[i]);
        Serial.print(",");
    }
    Serial.println("");

    mean = sum / len_data_buffer;

    for(int i = 0; i < len_data_buffer; i++){
        dev = (data_weight_[i] - mean)*(data_weight_[i] - mean);
        sdev = sdev + dev;
    }

    var = sdev / (len_data_buffer - 1);
    ULOG << "======== var:" << var << " mean:" << mean;
    // Measurement is valid if the variance is < 0.1
    if (var < devMax && mean > zeroLevel)
    {
        ULOG << "Found level:";
        ULOG << "var:" << var << " mean:" << mean;
        return mean;
    }
    //Returned if no valid measurement was found
    return -1.0;
}

void setup(void){
    //Initialize IOAnt core
    Ioant::GetInstance(on_message);

    // ########################################################################
    //    Now he basics all set up. Send logs to your computer either
    //    over Serial or WifiManager.
    // ########################################################################
    ULOG_DEBUG << "This is a debug message over serial port";
    //WLOG_DEBUG << "This is a debug message over wifi";

    pinMode(INTERRUPT_PIN, INPUT_PULLUP);
    pinMode(WAIT_LED_PIN, OUTPUT);
    pinMode(PERSON_ONE_PIN, OUTPUT);
    pinMode(PERSON_TWO_PIN, OUTPUT);

    digitalWrite(WAIT_LED_PIN, HIGH);
    delay(500);
    digitalWrite(WAIT_LED_PIN, LOW);
    delay(500);

    attachInterrupt(INTERRUPT_PIN, measurePulseWidth, RISING);
}

void loop(void){
    // Monitors Wifi connection and loops MQTT connection. Attempt reconnect if lost
    IOANT->UpdateLoop();


    // Calibrate zero level
    if (zeroThreshold < 0){
        ULOG_DEBUG << "//Zero leveling";
        zeroThreshold = getValidMeasurement(500, 0);
    }
    else{
        ULOG_DEBUG << "//Person scale";
        int who = 0;
        //Attempt to compute weight once every second
        detachInterrupt(INTERRUPT_PIN);
        float deltaDuration = getValidMeasurement(500, zeroThreshold);
        float weight = linearApprox(deltaDuration);
        attachInterrupt(INTERRUPT_PIN, measurePulseWidth, RISING);

        //If a valid weight was found
        if (weight > 20)
        {
            ULOG_DEBUG << "Valid weight found: " << weight;
            // Detach the interrupt while preparing the GET request
            detachInterrupt(INTERRUPT_PIN);
            // empty the data buffer
            for(int i = 0; i < len_data_buffer; i++){
                data_weight_[i] = 0;
            }

            //Optional - measuring several people. Works if they differ a lot in weight
            if (weight > 79.0 && weight < 100)
            {
                // Its person 1!
                who = 0;
                digitalWrite(PERSON_ONE_PIN, HIGH);
                delay(500);
                digitalWrite(PERSON_ONE_PIN, LOW);
                delay(500);
            }
            else if (weight > 50.0 && weight < 79)
            {
                // Its person 2!
                who = 1;
                digitalWrite(PERSON_TWO_PIN, HIGH);
                delay(500);
                digitalWrite(PERSON_TWO_PIN, LOW);
                delay(500);
            }
            else{
                attachInterrupt(INTERRUPT_PIN, measurePulseWidth, RISING);
                return;
            }

            MassMessage msg;
            msg.data.value = weight;
            msg.data.unit = Mass_Unit_KILOGRAMS;
            Ioant::Topic remote_topic = IOANT->GetConfiguredTopic();
            remote_topic.stream_index = who;
            IOANT->Publish(msg, remote_topic);

            //Wait 5 seconds before reattaching the interrupt. (Enough time for the
            //person to get off the scale)
            digitalWrite(WAIT_LED_PIN, HIGH);
            delay(5000);
            digitalWrite(WAIT_LED_PIN, LOW);
            attachInterrupt(INTERRUPT_PIN, measurePulseWidth, RISING);
        }
    }
}

// Function for handling received MQTT messages
void on_message(Ioant::Topic received_topic, ProtoIO* message){
    WLOG_DEBUG << "Message received! topic:" << received_topic.global  << " message type:" << received_topic.message_type ;
}
