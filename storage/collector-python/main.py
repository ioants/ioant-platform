import collector.collector as collector
import sys
from ioant import utils
import os
import logging

file_path = os.path.abspath(os.path.dirname(__file__))

logging.basicConfig(filename=os.path.join(file_path, "logs") + 'output.log',
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


if __name__ == "__main__":
    print(init_ascii())
    number_of_arguments = len(sys.argv)
    argument_list = sys.argv
    logging.info('Starting application')
    script_dir = os.path.dirname(os.path.realpath(__file__))


    if number_of_arguments is not 1:
        configuration_path = os.path.join(file_path, argument_list[1])
        configuration_path = utils.return_absolut_path(os.path.dirname(__file__),
                                                       argument_list[1])
    else:
        configuration_path = os.path.join(file_path, 'configuration.json')

    configuration = utils.fetch_json_file_as_dict(configuration_path)
    db_schema_path = os.path.join(file_path, "..")
    db_schema_path = os.path.join(db_schema_path, 'schema.json')
    
    schema = utils.fetch_json_file_as_dict(db_schema_path)
    collector.setup(configuration, schema)
    logging.info('Application running')
    while True:
        collector.loop()
    sys.exit()
