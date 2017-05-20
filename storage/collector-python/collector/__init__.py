import ioant.proto as proto
import sys

proto.python_main("generated_proto/.")
sys.path.append("generated_proto/")
