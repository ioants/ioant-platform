import ioant.proto as proto
import shutil

test = proto.return_proto_file_contents()
with open("proto/messages.proto", "w") as text_file:
    text_file.write(test)
