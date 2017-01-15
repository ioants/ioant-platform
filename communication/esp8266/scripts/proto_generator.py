import os
import base64
import ioant.proto.proto as proto
Import('env')


def decode_option(string_option):
    return base64.b64decode(string_option)


selected_os = decode_option(ARGUMENTS.get('CUSTOM_OPTION'))
proto.embedded_main(selected_os,
                       "../../../../../../common/proto/",
                       "lib/generated_proto/")
