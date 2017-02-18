import ioant.proto.proto as proto
import sys

proto.python_main("../../../../../common/proto/",
                  "generated_proto/.")

sys.path.append("generated_proto/")
