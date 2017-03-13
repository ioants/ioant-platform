import device.application as app
import sys
import ioant.utils as utils
import os
import logging

logging.basicConfig(filename='logs/output.log',
                    level=logging.INFO,
                    format='%(asctime)s %(name)-5s %(levelname)-8s %(message)s',
                    datefmt='%m-%d %H:%M:%S')
console = logging.StreamHandler()
logging.getLogger('').addHandler(console)


def init_ascii():
    message = "\
=========================================================================\n\
|                      Boiler plate - communication                     |\n\
========================================================================="
    return message


relative_path_steps = "../../../../../"

if __name__ == "__main__":
    print(init_ascii())
    logging.info('Starting boiler plate')
    script_dir = os.path.dirname(os.path.realpath(__file__))
    configuration_path = utils.return_absolut_path(os.path.dirname(__file__),
                                                   'configuration.json')
    configuration = utils.fetch_json_file_as_dict(configuration_path)
    app.setup(configuration)
    while True:
        app.loop()
    sys.exit()
