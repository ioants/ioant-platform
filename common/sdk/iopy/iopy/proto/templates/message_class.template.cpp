    /// =======================================================================
    /// Message methods for class {messageName}
    /// =======================================================================
    {messageName}Message::{messageName}Message(){{
        data = {messageName}_init_zero;
        messageMeta_.message_type = {messageType};
    }}

    bool {messageName}Message::Encode(){{
        if (send_buffer_ == NULL){{
            send_buffer_ = (uint8_t*)calloc(128, sizeof(uint8_t));
        }}
        pb_ostream_t stream = pb_ostream_from_buffer(send_buffer_, 128);
        bool status = pb_encode(&stream, {messageName}_fields, &data);
        messageMeta_.number_of_bytes = (uint8_t)stream.bytes_written;
        messageMeta_.valid = status;
        return status;
    }}

    bool {messageName}Message::Decode(const uint8_t* buffer, unsigned int number_of_bytes){{
        pb_istream_t stream = pb_istream_from_buffer(buffer, number_of_bytes);
        bool status = pb_decode(&stream, {messageName}_fields, &data);
        messageMeta_.valid = status;
        messageMeta_.number_of_bytes = number_of_bytes;
        has_decoded_data_ = true;
        return status;
    }}
