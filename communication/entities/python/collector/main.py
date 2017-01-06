import collector.collector as collector
import sys
from iopy.utils import utils
import os


def init_ascii():
    message = "\
=========================================================================\n\
|                       Collector Entity                                |\n\
========================================================================="
    return message

relative_path_steps = "../../../../"

if __name__ == "__main__":
    print(init_ascii())

    script_dir = os.path.dirname(os.path.realpath(__file__))
    db_schema_path = utils.return_absolut_path(script_dir, relative_path_steps
                                               + "storage/schema.json")
    db_schema_dict = utils.fetch_json_file_as_dict(db_schema_path)
    configuration_path = utils.return_absolut_path(os.path.dirname(__file__),
                                                   'configuration.json')
    configuration_dict = utils.fetch_json_file_as_dict(configuration_path)

    mqtt_broker = configuration_dict['mqtt']['broker']
    mqtt_port = configuration_dict['mqtt']['port']

    client = collector.initiate_client(mqtt_broker,
                                       mqtt_port,
                                       configuration_dict,
                                       db_schema_dict)
    if client:
        collector.loop_mqtt_client(client)

    sys.exit()
