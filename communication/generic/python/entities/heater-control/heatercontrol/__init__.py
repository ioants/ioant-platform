import ioant.proto.proto as proto
import sys

proto.python_main("../../../../../common/proto/",
                  "heatercontrol/generated_proto/.")

sys.path.append("heatercontrol/generated_proto/")
