import messages_pb2 as ProtoNab

message_type_index_dict = {'Configuration': 0, 'BootInfo': 1, 'Image': 2, 'Trigger': 3, 'Temperature': 4, 'Humidity': 5, 'Mass': 6, 'ElectricPower': 7, 'GpsCoordinates': 8, 'RunStepperMotorRaw': 9, 'RunStepperMotor': 10, 'RunDcMotor': 11}
index_message_type_dict = {0: 'Configuration', 1: 'BootInfo', 2: 'Image', 3: 'Trigger', 4: 'Temperature', 5: 'Humidity', 6: 'Mass', 7: 'ElectricPower', 8: 'GpsCoordinates', 9: 'RunStepperMotorRaw', 10: 'RunStepperMotor', 11: 'RunDcMotor'}

def create_proto_message(messagetype):
    message_type = int(messagetype)
    if message_type == 0:
        created_msg = ProtoNab.Configuration()
        return created_msg
    if message_type == 1:
        created_msg = ProtoNab.BootInfo()
        return created_msg
    if message_type == 2:
        created_msg = ProtoNab.Image()
        return created_msg
    if message_type == 3:
        created_msg = ProtoNab.Trigger()
        return created_msg
    if message_type == 4:
        created_msg = ProtoNab.Temperature()
        return created_msg
    if message_type == 5:
        created_msg = ProtoNab.Humidity()
        return created_msg
    if message_type == 6:
        created_msg = ProtoNab.Mass()
        return created_msg
    if message_type == 7:
        created_msg = ProtoNab.ElectricPower()
        return created_msg
    if message_type == 8:
        created_msg = ProtoNab.GpsCoordinates()
        return created_msg
    if message_type == 9:
        created_msg = ProtoNab.RunStepperMotorRaw()
        return created_msg
    if message_type == 10:
        created_msg = ProtoNab.RunStepperMotor()
        return created_msg
    if message_type == 11:
        created_msg = ProtoNab.RunDcMotor()
        return created_msg

    return False
