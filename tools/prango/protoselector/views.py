from django.http import HttpResponse
from django.http import JsonResponse
from django.template import loader

import generated_proto.proto_io as proto_io
import generated_proto.messages_pb2 as messages_pb2
import os
from ioant.proto import proto
from ioant.utils import utils
import paho.mqtt.client as mqtt


proto_option_field_name = "protomessages"


def send_message(topic, message):
    configuration_path = utils.return_absolut_path(os.path.dirname(__file__),
                                                   '../configuration.json')
    configuration_dict = utils.fetch_json_file_as_dict(configuration_path)
    client = mqtt.Client()
    client.connect(configuration_dict['mqtt']['broker'], configuration_dict['mqtt']['port'], 10)
    payload = message.SerializeToString()
    (result, mid) = client.publish(topic, bytearray(payload))
    client.disconnect()
    return result

def build_topic(request_post):
    t_live = request_post.get("top", "live")
    t_global = request_post.get("global", "")
    t_local = request_post.get("local", "")
    t_client = request_post.get("client", "")
    t_message_type = request_post.get("message_type", "")
    t_stream_index = request_post.get("stream_index", "")

    return "{0}/{1}/{2}/{3}/{4}/{5}".format(t_live,
                                            t_global,
                                            t_local,
                                            t_client,
                                            t_message_type,
                                            t_stream_index)

# Create your views here.
def index(request):
    latest_message_list = []
    for key, elem in proto_io.index_message_type_dict.items():
        latest_message_list.append((key, elem))

    template = loader.get_template('protoselector/index.html')
    context = {
        'latest_message_list': latest_message_list,
        'proto_option_field_name': proto_option_field_name,
    }

    if request.method == 'POST':
        if request.POST.get("message_type", None) is None:
            context['proto_selected'] = True
            message_type = int(request.POST.get(proto_option_field_name, ""))
            context['message_name'] = proto_io.message_type_index_dict.get(message_type)
            context['message_type'] = message_type
            message = proto_io.create_proto_message(message_type)
            message_fields = message.DESCRIPTOR.fields
            message_fields_wrapper = []
            for field in message_fields:
                message_fields_wrapper.append({'field':field, 'type_name':proto.get_attribute_type_name(field.type)})
            context['message_fields'] = message_fields_wrapper

    if request.method == 'POST':
        if request.POST.get("message_type", None) is not None:
            context['success'] = False
            context['failure'] = []
            message_type = int(request.POST.get("message_type", ""))
            message = proto_io.create_proto_message(message_type)
            message_fields = message.DESCRIPTOR.fields
            for field in message_fields:
                post_value = request.POST.get(field.name, "")
                try:
                    setattr(message, field.name, proto.cast_value_to_type(post_value, field.type))
                except:
                    context['failure'].append(field.name)
            #Open MQTT client and send message
            topic_string = build_topic(request.POST)
            result = send_message(topic_string, message)
            if result is 0:
                print "success!"
                context['success'] = True
            else:
                context['success'] = False

    if request.method == 'GET':
        if request.GET.get("request_message_type", None) is not None:
            message_type = int(request.GET.get("request_message_type", None))
            message = proto_io.create_proto_message(message_type)
            message_fields = message.DESCRIPTOR.fields
            message_fields_json = {}
            message_fields_json['fields'] = []
            for field in message_fields:
                message_fields_json['fields'].append ({'field_name':field.name,
                                                 'field_type':proto.get_attribute_type_name(field.type)})

            return JsonResponse(message_fields_json)

    if request.method == 'GET':
        if request.GET.get("message_type", None) is not None:
            context['success'] = False
            context['failure'] = []
            message_type = int(request.GET.get("message_type", ""))
            message = proto_io.create_proto_message(message_type)
            message_fields = message.DESCRIPTOR.fields
            for field in message_fields:
                post_value = request.GET.get(field.name, "")
                try:
                    setattr(message, field.name, proto.cast_value_to_type(post_value, field.type))
                except:
                    context['failure'].append(field.name)
            #Open MQTT client and send message
            topic_string = build_topic(request.GET)
            result = send_message(topic_string, message)
            if result is 0:
                return HttpResponse(status=201)# Created
            else:
                return HttpResponse(status=400)# Bad request

    return HttpResponse(template.render(context, request))
