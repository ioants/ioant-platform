
import ioant.proto.proto as proto
Import('env')

proto.embedded_main('',
                       "../../../../../../common/proto/",
                       "lib/generated_proto/")
