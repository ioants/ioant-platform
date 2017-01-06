    /// =======================================================================
    /// Class Definitions {messageName}
    /// =======================================================================
    class {messageName}Message : public ProtoIO
    {{

    public:
        {messageName}Message();
        ~{messageName}Message(){{
            if (has_decoded_data_){{
                pb_release({messageName}_fields, &data);
            }}
        }};
        bool Encode();
        bool Decode(const uint8_t* buffer, unsigned int number_of_bytes);

        static int GetType() {{return {messageType};}};

        {messageName} data;
    }};
