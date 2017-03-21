import collector.collector as collector
import sys
from ioant import utils
import os
import logging

logging.basicConfig(filename='logs/output.log',
                    level=logging.INFO,
                    format='%(asctime)s %(name)-5s %(levelname)-8s %(message)s',
                    datefmt='%m-%d %H:%M')
console = logging.StreamHandler()
logging.getLogger('').addHandler(console)


def init_ascii():
    message = "\
=========================================================================\n\
|                       Collector Entity                                |\n\
========================================================================="
    return message

relative_path_steps = "../../../../../"

if __name__ == "__main__":
    print(init_ascii())
    logging.info('Starting application')
    script_dir = os.path.dirname(os.path.realpath(__file__))
    configuration_path = utils.return_absolut_path(os.path.dirname(__file__),
                                                   'configuration.json')
    configuration = utils.fetch_json_file_as_dict(configuration_path)
    db_schema_path = utils.return_absolut_path(script_dir, relative_path_steps
                                               + "storage/schema.json")
    schema = utils.fetch_json_file_as_dict(db_schema_path)
    collector.setup(configuration, schema)
    logging.info('Application running')
    while True:
        collector.loop()
    sys.exit()
