import iopy.proto.proto as proto
from iopy.utils import utils

import os
import sys

# Load configuration
configuration_path = utils.return_absolut_path(os.path.dirname(__file__),
                                               '../configuration.json')
configuration_dict = utils.fetch_json_file_as_dict(configuration_path)

# Determine os to compile for
selected_os = None
if configuration_dict['os'] == "linux":
    print "[info] Generating proto files using linux protoc compiler"
    selected_os = configuration_dict['os']
elif configuration_dict['os'] == "raspbian":
    print "[info] Protoc compiling not supported yet. Please generate proto files on PC and copy to nabcam folder"
else:
    print "[error] Unknown os was selected: " + configuration_dict['os']


if selected_os is not None:
    proto.python_main(selected_os,
                         "../../../../common/proto/",
                         "heatercontrol/generated_proto/.")
