import pynab.proto.proto as nabproto

import os
import sys

python_nanopb_modules = os.path.abspath(os.path.join(os.path.realpath(__file__),
                                                     '../../proto/generators/linux/proto/'))
sys.path.append(python_nanopb_modules)


selected_os = "linux"
nabproto.php_main(selected_os,
                  "../../proto/",
                  ".")
