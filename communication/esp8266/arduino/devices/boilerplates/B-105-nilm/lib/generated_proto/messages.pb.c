/* Automatically generated nanopb constant definitions */
/* Generated by nanopb-0.3.7 at Thu Jan 12 16:16:13 2017. */

#include "messages.pb.h"

/* @@protoc_insertion_point(includes) */
#if PB_PROTO_HEADER_VERSION != 30
#error Regenerate this file with the current version of nanopb generator.
#endif



const pb_field_t Configuration_fields[16] = {
    PB_FIELD(  1, STRING  , SINGULAR, POINTER , FIRST, Configuration, client_id, client_id, 0),
    PB_FIELD(  2, STRING  , SINGULAR, POINTER , OTHER, Configuration, wifi_ssid, client_id, 0),
    PB_FIELD(  3, STRING  , SINGULAR, POINTER , OTHER, Configuration, wifi_password, wifi_ssid, 0),
    PB_FIELD(  4, STRING  , SINGULAR, POINTER , OTHER, Configuration, broker_url, wifi_password, 0),
    PB_FIELD(  5, UINT32  , SINGULAR, STATIC  , OTHER, Configuration, broker_port, broker_url, 0),
    PB_FIELD(  6, STRING  , SINGULAR, POINTER , OTHER, Configuration, broker_user, broker_port, 0),
    PB_FIELD(  7, STRING  , SINGULAR, POINTER , OTHER, Configuration, broker_password, broker_user, 0),
    PB_FIELD(  8, STRING  , SINGULAR, POINTER , OTHER, Configuration, udp_url, broker_password, 0),
    PB_FIELD(  9, UINT32  , SINGULAR, STATIC  , OTHER, Configuration, udp_port, udp_url, 0),
    PB_FIELD( 10, BOOL    , SINGULAR, STATIC  , OTHER, Configuration, low_power, udp_port, 0),
    PB_FIELD( 11, UINT32  , SINGULAR, STATIC  , OTHER, Configuration, status_led, low_power, 0),
    PB_FIELD( 12, STRING  , SINGULAR, POINTER , OTHER, Configuration, topic_global, status_led, 0),
    PB_FIELD( 13, STRING  , SINGULAR, POINTER , OTHER, Configuration, topic_local, topic_global, 0),
    PB_FIELD( 14, UINT32  , SINGULAR, STATIC  , OTHER, Configuration, communication_delay, topic_local, 0),
    PB_FIELD( 15, UINT32  , SINGULAR, STATIC  , OTHER, Configuration, application_generic, communication_delay, 0),
    PB_LAST_FIELD
};

const pb_field_t BootInfo_fields[5] = {
    PB_FIELD(  1, STRING  , SINGULAR, POINTER , FIRST, BootInfo, reboot_reason, reboot_reason, 0),
    PB_FIELD(  2, UINT32  , SINGULAR, STATIC  , OTHER, BootInfo, program_size, reboot_reason, 0),
    PB_FIELD(  3, STRING  , SINGULAR, POINTER , OTHER, BootInfo, ip_address, program_size, 0),
    PB_FIELD(  4, UENUM   , SINGULAR, STATIC  , OTHER, BootInfo, proto_version, ip_address, 0),
    PB_LAST_FIELD
};

const pb_field_t Image_fields[2] = {
    PB_FIELD(  1, STRING  , SINGULAR, POINTER , FIRST, Image, reference_link, reference_link, 0),
    PB_LAST_FIELD
};

const pb_field_t Trigger_fields[2] = {
    PB_FIELD(  1, UINT32  , SINGULAR, STATIC  , FIRST, Trigger, extra, extra, 0),
    PB_LAST_FIELD
};

const pb_field_t Temperature_fields[3] = {
    PB_FIELD(  1, FLOAT   , SINGULAR, STATIC  , FIRST, Temperature, value, value, 0),
    PB_FIELD(  2, UENUM   , SINGULAR, STATIC  , OTHER, Temperature, unit, value, 0),
    PB_LAST_FIELD
};

const pb_field_t Humidity_fields[3] = {
    PB_FIELD(  1, FLOAT   , SINGULAR, STATIC  , FIRST, Humidity, value, value, 0),
    PB_FIELD(  2, UENUM   , SINGULAR, STATIC  , OTHER, Humidity, unit, value, 0),
    PB_LAST_FIELD
};

const pb_field_t Mass_fields[3] = {
    PB_FIELD(  1, FLOAT   , SINGULAR, STATIC  , FIRST, Mass, value, value, 0),
    PB_FIELD(  2, UENUM   , SINGULAR, STATIC  , OTHER, Mass, unit, value, 0),
    PB_LAST_FIELD
};

const pb_field_t PHconcentration_fields[2] = {
    PB_FIELD(  1, FLOAT   , SINGULAR, STATIC  , FIRST, PHconcentration, value, value, 0),
    PB_LAST_FIELD
};

const pb_field_t ElectricPower_fields[4] = {
    PB_FIELD(  1, FLOAT   , SINGULAR, STATIC  , FIRST, ElectricPower, value, value, 0),
    PB_FIELD(  2, UENUM   , SINGULAR, STATIC  , OTHER, ElectricPower, unit, value, 0),
    PB_FIELD(  3, INT32   , SINGULAR, STATIC  , OTHER, ElectricPower, pulses, unit, 0),
    PB_LAST_FIELD
};

const pb_field_t GpsCoordinates_fields[7] = {
    PB_FIELD(  1, FLOAT   , SINGULAR, STATIC  , FIRST, GpsCoordinates, longitude, longitude, 0),
    PB_FIELD(  2, UENUM   , SINGULAR, STATIC  , OTHER, GpsCoordinates, longitude_unit, longitude, 0),
    PB_FIELD(  3, FLOAT   , SINGULAR, STATIC  , OTHER, GpsCoordinates, latitude, longitude_unit, 0),
    PB_FIELD(  4, UENUM   , SINGULAR, STATIC  , OTHER, GpsCoordinates, latitude_unit, latitude, 0),
    PB_FIELD(  5, FLOAT   , SINGULAR, STATIC  , OTHER, GpsCoordinates, height_, latitude_unit, 0),
    PB_FIELD(  6, UENUM   , SINGULAR, STATIC  , OTHER, GpsCoordinates, height_unit, height_, 0),
    PB_LAST_FIELD
};

const pb_field_t RunStepperMotorRaw_fields[5] = {
    PB_FIELD(  1, UENUM   , SINGULAR, STATIC  , FIRST, RunStepperMotorRaw, direction, direction, 0),
    PB_FIELD(  2, INT32   , SINGULAR, STATIC  , OTHER, RunStepperMotorRaw, delay_between_steps, direction, 0),
    PB_FIELD(  3, INT32   , SINGULAR, STATIC  , OTHER, RunStepperMotorRaw, number_of_step, delay_between_steps, 0),
    PB_FIELD(  4, UENUM   , SINGULAR, STATIC  , OTHER, RunStepperMotorRaw, step_size, number_of_step, 0),
    PB_LAST_FIELD
};

const pb_field_t RunStepperMotor_fields[4] = {
    PB_FIELD(  1, UENUM   , SINGULAR, STATIC  , FIRST, RunStepperMotor, direction, direction, 0),
    PB_FIELD(  2, FLOAT   , SINGULAR, STATIC  , OTHER, RunStepperMotor, rpm, direction, 0),
    PB_FIELD(  3, FLOAT   , SINGULAR, STATIC  , OTHER, RunStepperMotor, angle, rpm, 0),
    PB_LAST_FIELD
};

const pb_field_t RunDcMotor_fields[3] = {
    PB_FIELD(  1, UENUM   , SINGULAR, STATIC  , FIRST, RunDcMotor, direction, direction, 0),
    PB_FIELD(  2, FLOAT   , SINGULAR, STATIC  , OTHER, RunDcMotor, rpm, direction, 0),
    PB_LAST_FIELD
};


/* @@protoc_insertion_point(eof) */