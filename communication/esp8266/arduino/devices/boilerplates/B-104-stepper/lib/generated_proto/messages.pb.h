/* Automatically generated nanopb header */
/* Generated by nanopb-0.3.7 at Thu Jan 12 16:03:44 2017. */

#ifndef PB_MESSAGES_PB_H_INCLUDED
#define PB_MESSAGES_PB_H_INCLUDED
#include <pb.h>

/* @@protoc_insertion_point(includes) */
#if PB_PROTO_HEADER_VERSION != 30
#error Regenerate this file with the current version of nanopb generator.
#endif

#ifdef __cplusplus
extern "C" {
#endif

/* Enum definitions */
typedef enum _ProtoVersion {
    ProtoVersion_VERSION_NOT_SET = 0,
    ProtoVersion_VERSION = 1020
} ProtoVersion;
#define _ProtoVersion_MIN ProtoVersion_VERSION_NOT_SET
#define _ProtoVersion_MAX ProtoVersion_VERSION
#define _ProtoVersion_ARRAYSIZE ((ProtoVersion)(ProtoVersion_VERSION+1))

typedef enum _Temperature_Unit {
    Temperature_Unit_CELSIUS = 0,
    Temperature_Unit_FAHRENHEIT = 1
} Temperature_Unit;
#define _Temperature_Unit_MIN Temperature_Unit_CELSIUS
#define _Temperature_Unit_MAX Temperature_Unit_FAHRENHEIT
#define _Temperature_Unit_ARRAYSIZE ((Temperature_Unit)(Temperature_Unit_FAHRENHEIT+1))

typedef enum _Humidity_Unit {
    Humidity_Unit_RELATIVE_PROCENT = 0,
    Humidity_Unit_ABSOLUTE = 1
} Humidity_Unit;
#define _Humidity_Unit_MIN Humidity_Unit_RELATIVE_PROCENT
#define _Humidity_Unit_MAX Humidity_Unit_ABSOLUTE
#define _Humidity_Unit_ARRAYSIZE ((Humidity_Unit)(Humidity_Unit_ABSOLUTE+1))

typedef enum _Mass_Unit {
    Mass_Unit_KILOGRAMS = 0,
    Mass_Unit_HECTOGRAM = 1,
    Mass_Unit_GRAMS = 2,
    Mass_Unit_MILLIGRAM = 3,
    Mass_Unit_POUND = 4,
    Mass_Unit_OUNCE = 5
} Mass_Unit;
#define _Mass_Unit_MIN Mass_Unit_KILOGRAMS
#define _Mass_Unit_MAX Mass_Unit_OUNCE
#define _Mass_Unit_ARRAYSIZE ((Mass_Unit)(Mass_Unit_OUNCE+1))

typedef enum _ElectricPower_Unit {
    ElectricPower_Unit_WATTS = 0,
    ElectricPower_Unit_KILOWATTS = 1
} ElectricPower_Unit;
#define _ElectricPower_Unit_MIN ElectricPower_Unit_WATTS
#define _ElectricPower_Unit_MAX ElectricPower_Unit_KILOWATTS
#define _ElectricPower_Unit_ARRAYSIZE ((ElectricPower_Unit)(ElectricPower_Unit_KILOWATTS+1))

typedef enum _GpsCoordinates_Unit {
    GpsCoordinates_Unit_DECIMAL_DEGREE = 0,
    GpsCoordinates_Unit_METER = 1
} GpsCoordinates_Unit;
#define _GpsCoordinates_Unit_MIN GpsCoordinates_Unit_DECIMAL_DEGREE
#define _GpsCoordinates_Unit_MAX GpsCoordinates_Unit_METER
#define _GpsCoordinates_Unit_ARRAYSIZE ((GpsCoordinates_Unit)(GpsCoordinates_Unit_METER+1))

typedef enum _RunStepperMotorRaw_Direction {
    RunStepperMotorRaw_Direction_CLOCKWISE = 0,
    RunStepperMotorRaw_Direction_COUNTER_CLOCKWISE = 1
} RunStepperMotorRaw_Direction;
#define _RunStepperMotorRaw_Direction_MIN RunStepperMotorRaw_Direction_CLOCKWISE
#define _RunStepperMotorRaw_Direction_MAX RunStepperMotorRaw_Direction_COUNTER_CLOCKWISE
#define _RunStepperMotorRaw_Direction_ARRAYSIZE ((RunStepperMotorRaw_Direction)(RunStepperMotorRaw_Direction_COUNTER_CLOCKWISE+1))

typedef enum _RunStepperMotorRaw_StepSize {
    RunStepperMotorRaw_StepSize_FULL_STEP = 0,
    RunStepperMotorRaw_StepSize_HALF_STEP = 1,
    RunStepperMotorRaw_StepSize_QUARTER_STEP = 2
} RunStepperMotorRaw_StepSize;
#define _RunStepperMotorRaw_StepSize_MIN RunStepperMotorRaw_StepSize_FULL_STEP
#define _RunStepperMotorRaw_StepSize_MAX RunStepperMotorRaw_StepSize_QUARTER_STEP
#define _RunStepperMotorRaw_StepSize_ARRAYSIZE ((RunStepperMotorRaw_StepSize)(RunStepperMotorRaw_StepSize_QUARTER_STEP+1))

typedef enum _RunStepperMotor_Direction {
    RunStepperMotor_Direction_CLOCKWISE = 0,
    RunStepperMotor_Direction_COUNTER_CLOCKWISE = 1
} RunStepperMotor_Direction;
#define _RunStepperMotor_Direction_MIN RunStepperMotor_Direction_CLOCKWISE
#define _RunStepperMotor_Direction_MAX RunStepperMotor_Direction_COUNTER_CLOCKWISE
#define _RunStepperMotor_Direction_ARRAYSIZE ((RunStepperMotor_Direction)(RunStepperMotor_Direction_COUNTER_CLOCKWISE+1))

typedef enum _RunDcMotor_Direction {
    RunDcMotor_Direction_CLOCKWISE = 0,
    RunDcMotor_Direction_COUNTER_CLOCKWISE = 1
} RunDcMotor_Direction;
#define _RunDcMotor_Direction_MIN RunDcMotor_Direction_CLOCKWISE
#define _RunDcMotor_Direction_MAX RunDcMotor_Direction_COUNTER_CLOCKWISE
#define _RunDcMotor_Direction_ARRAYSIZE ((RunDcMotor_Direction)(RunDcMotor_Direction_COUNTER_CLOCKWISE+1))

/* Struct definitions */
typedef struct _Image {
    char *reference_link;
/* @@protoc_insertion_point(struct:Image) */
} Image;

typedef struct _BootInfo {
    char *reboot_reason;
    uint32_t program_size;
    char *ip_address;
    ProtoVersion proto_version;
/* @@protoc_insertion_point(struct:BootInfo) */
} BootInfo;

typedef struct _Configuration {
    char *client_id;
    char *wifi_ssid;
    char *wifi_password;
    char *broker_url;
    uint32_t broker_port;
    char *broker_user;
    char *broker_password;
    char *udp_url;
    uint32_t udp_port;
    bool low_power;
    uint32_t status_led;
    char *topic_global;
    char *topic_local;
    uint32_t communication_delay;
    uint32_t application_generic;
/* @@protoc_insertion_point(struct:Configuration) */
} Configuration;

typedef struct _ElectricPower {
    float value;
    ElectricPower_Unit unit;
    int32_t pulses;
/* @@protoc_insertion_point(struct:ElectricPower) */
} ElectricPower;

typedef struct _GpsCoordinates {
    float longitude;
    GpsCoordinates_Unit longitude_unit;
    float latitude;
    GpsCoordinates_Unit latitude_unit;
    float height_;
    GpsCoordinates_Unit height_unit;
/* @@protoc_insertion_point(struct:GpsCoordinates) */
} GpsCoordinates;

typedef struct _Humidity {
    float value;
    Humidity_Unit unit;
/* @@protoc_insertion_point(struct:Humidity) */
} Humidity;

typedef struct _Mass {
    float value;
    Mass_Unit unit;
/* @@protoc_insertion_point(struct:Mass) */
} Mass;

typedef struct _PHconcentration {
    float value;
/* @@protoc_insertion_point(struct:PHconcentration) */
} PHconcentration;

typedef struct _RunDcMotor {
    RunDcMotor_Direction direction;
    float rpm;
/* @@protoc_insertion_point(struct:RunDcMotor) */
} RunDcMotor;

typedef struct _RunStepperMotor {
    RunStepperMotor_Direction direction;
    float rpm;
    float angle;
/* @@protoc_insertion_point(struct:RunStepperMotor) */
} RunStepperMotor;

typedef struct _RunStepperMotorRaw {
    RunStepperMotorRaw_Direction direction;
    int32_t delay_between_steps;
    int32_t number_of_step;
    RunStepperMotorRaw_StepSize step_size;
/* @@protoc_insertion_point(struct:RunStepperMotorRaw) */
} RunStepperMotorRaw;

typedef struct _Temperature {
    float value;
    Temperature_Unit unit;
/* @@protoc_insertion_point(struct:Temperature) */
} Temperature;

typedef struct _Trigger {
    uint32_t extra;
/* @@protoc_insertion_point(struct:Trigger) */
} Trigger;

/* Default values for struct fields */

/* Initializer values for message structs */
#define Configuration_init_default               {NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, 0, 0}
#define BootInfo_init_default                    {NULL, 0, NULL, (ProtoVersion)0}
#define Image_init_default                       {NULL}
#define Trigger_init_default                     {0}
#define Temperature_init_default                 {0, (Temperature_Unit)0}
#define Humidity_init_default                    {0, (Humidity_Unit)0}
#define Mass_init_default                        {0, (Mass_Unit)0}
#define PHconcentration_init_default             {0}
#define ElectricPower_init_default               {0, (ElectricPower_Unit)0, 0}
#define GpsCoordinates_init_default              {0, (GpsCoordinates_Unit)0, 0, (GpsCoordinates_Unit)0, 0, (GpsCoordinates_Unit)0}
#define RunStepperMotorRaw_init_default          {(RunStepperMotorRaw_Direction)0, 0, 0, (RunStepperMotorRaw_StepSize)0}
#define RunStepperMotor_init_default             {(RunStepperMotor_Direction)0, 0, 0}
#define RunDcMotor_init_default                  {(RunDcMotor_Direction)0, 0}
#define Configuration_init_zero                  {NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, 0, 0}
#define BootInfo_init_zero                       {NULL, 0, NULL, (ProtoVersion)0}
#define Image_init_zero                          {NULL}
#define Trigger_init_zero                        {0}
#define Temperature_init_zero                    {0, (Temperature_Unit)0}
#define Humidity_init_zero                       {0, (Humidity_Unit)0}
#define Mass_init_zero                           {0, (Mass_Unit)0}
#define PHconcentration_init_zero                {0}
#define ElectricPower_init_zero                  {0, (ElectricPower_Unit)0, 0}
#define GpsCoordinates_init_zero                 {0, (GpsCoordinates_Unit)0, 0, (GpsCoordinates_Unit)0, 0, (GpsCoordinates_Unit)0}
#define RunStepperMotorRaw_init_zero             {(RunStepperMotorRaw_Direction)0, 0, 0, (RunStepperMotorRaw_StepSize)0}
#define RunStepperMotor_init_zero                {(RunStepperMotor_Direction)0, 0, 0}
#define RunDcMotor_init_zero                     {(RunDcMotor_Direction)0, 0}

/* Field tags (for use in manual encoding/decoding) */
#define Image_reference_link_tag                 1
#define BootInfo_reboot_reason_tag               1
#define BootInfo_program_size_tag                2
#define BootInfo_ip_address_tag                  3
#define BootInfo_proto_version_tag               4
#define Configuration_client_id_tag              1
#define Configuration_wifi_ssid_tag              2
#define Configuration_wifi_password_tag          3
#define Configuration_broker_url_tag             4
#define Configuration_broker_port_tag            5
#define Configuration_broker_user_tag            6
#define Configuration_broker_password_tag        7
#define Configuration_udp_url_tag                8
#define Configuration_udp_port_tag               9
#define Configuration_low_power_tag              10
#define Configuration_status_led_tag             11
#define Configuration_topic_global_tag           12
#define Configuration_topic_local_tag            13
#define Configuration_communication_delay_tag    14
#define Configuration_application_generic_tag    15
#define ElectricPower_value_tag                  1
#define ElectricPower_unit_tag                   2
#define ElectricPower_pulses_tag                 3
#define GpsCoordinates_longitude_tag             1
#define GpsCoordinates_longitude_unit_tag        2
#define GpsCoordinates_latitude_tag              3
#define GpsCoordinates_latitude_unit_tag         4
#define GpsCoordinates_height__tag               5
#define GpsCoordinates_height_unit_tag           6
#define Humidity_value_tag                       1
#define Humidity_unit_tag                        2
#define Mass_value_tag                           1
#define Mass_unit_tag                            2
#define PHconcentration_value_tag                1
#define RunDcMotor_direction_tag                 1
#define RunDcMotor_rpm_tag                       2
#define RunStepperMotor_direction_tag            1
#define RunStepperMotor_rpm_tag                  2
#define RunStepperMotor_angle_tag                3
#define RunStepperMotorRaw_direction_tag         1
#define RunStepperMotorRaw_delay_between_steps_tag 2
#define RunStepperMotorRaw_number_of_step_tag    3
#define RunStepperMotorRaw_step_size_tag         4
#define Temperature_value_tag                    1
#define Temperature_unit_tag                     2
#define Trigger_extra_tag                        1

/* Struct field encoding specification for nanopb */
extern const pb_field_t Configuration_fields[16];
extern const pb_field_t BootInfo_fields[5];
extern const pb_field_t Image_fields[2];
extern const pb_field_t Trigger_fields[2];
extern const pb_field_t Temperature_fields[3];
extern const pb_field_t Humidity_fields[3];
extern const pb_field_t Mass_fields[3];
extern const pb_field_t PHconcentration_fields[2];
extern const pb_field_t ElectricPower_fields[4];
extern const pb_field_t GpsCoordinates_fields[7];
extern const pb_field_t RunStepperMotorRaw_fields[5];
extern const pb_field_t RunStepperMotor_fields[4];
extern const pb_field_t RunDcMotor_fields[3];

/* Maximum encoded size of messages (where known) */
/* Configuration_size depends on runtime parameters */
/* BootInfo_size depends on runtime parameters */
/* Image_size depends on runtime parameters */
#define Trigger_size                             6
#define Temperature_size                         7
#define Humidity_size                            7
#define Mass_size                                7
#define PHconcentration_size                     5
#define ElectricPower_size                       18
#define GpsCoordinates_size                      21
#define RunStepperMotorRaw_size                  26
#define RunStepperMotor_size                     12
#define RunDcMotor_size                          7

/* Message IDs (where set with "msgid" option) */
#ifdef PB_MSGID

#define MESSAGES_MESSAGES \


#endif

#ifdef __cplusplus
} /* extern "C" */
#endif
/* @@protoc_insertion_point(eof) */

#endif
