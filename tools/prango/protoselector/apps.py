from __future__ import unicode_literals

from django.apps import AppConfig
import ioant.proto as proto
from ioant.utils import utils
import os
import sys

output_path = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                            'generated_proto/'))

# Load configuration
configuration_path = utils.return_absolut_path(os.path.dirname(__file__),
                                               '../configuration.json')
configuration_dict = utils.fetch_json_file_as_dict(configuration_path)



class ProtoselectorConfig(AppConfig):
    name = 'protoselector'
    def ready(self):
        print "Running proto generation:"
        proto.python_main(output_path)
