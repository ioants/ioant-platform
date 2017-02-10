import agent.agent as agent
import sys
from ioant.utils import utils
import os


def init_ascii():
    message = "\
=========================================================================\n\
|                       Agent Entity                                    |\n\
========================================================================="
    return message

relative_path_steps = "../../../../../"

if __name__ == "__main__":
    print(init_ascii())

    script_dir = os.path.dirname(os.path.realpath(__file__))

    configuration_path = utils.return_absolut_path(os.path.dirname(__file__),
                                                   'configuration.json')
    configuration_dict = utils.fetch_json_file_as_dict(configuration_path)

    mqtt_broker = configuration_dict['mqtt']['broker']
    mqtt_port = configuration_dict['mqtt']['port']

    client = agent.initiate_client(mqtt_broker,
                                       mqtt_port,
                                       configuration_dict)
    if client:
        agent.loop_mqtt_client(client)

    sys.exit()
