import ioant.proto as proto
import sys

file_path = os.path.abspath(os.path.dirname(__file__))
proto_path = os.path.join("..", "generated_proto")
proto_path = os.path.join(file_path, proto_path)

proto.python_main(proto_path)
sys.path.append(proto_path)
