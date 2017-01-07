import re
import os
import sys
import subprocess


def get_attribute_type_name(attribute_type):
    if attribute_type is 1:
        return "double"
    if attribute_type is 2:
        return "float"
    if attribute_type in [3, 4, 5, 6, 7, 13, 15, 16, 17, 18]:
        return "int"
    if attribute_type is 8:
        return "boolean"
    if attribute_type is 9:
        return "string"
    if attribute_type is 14:
        return "enum"
    return "Unknown:" + str(attribute_type)


def cast_value_to_type(value, attribute_type):
    if attribute_type in [1, 2]:
        return float(value)
    if attribute_type in [3, 4, 5, 6, 7, 13, 15, 16, 17, 18, 14]:
        return int(value)
    if attribute_type is 8:
        return bool(value)
    if attribute_type is 9:
        return value

    return value


def open_file_as_string(filepath):
    with open(filepath, 'r') as ftemp:
        templateString = ftemp.read()
    return templateString


def save_template(filepath, content):
    with open(filepath, 'w') as f:
        f.write(content)


def generate_embedded_proto_nab(message_list, output_file_path):
    script_dir = os.path.dirname(__file__)

    message_cases_cpp_template = open_file_as_string(
        script_dir+"/templates/message_cases.template.cpp")
    message_class_template_cpp = open_file_as_string(
        script_dir+"/templates/message_class.template.cpp")
    message_class_template_h = open_file_as_string(
        script_dir+"/templates/message_class.template.h")
    nab_proto_template_h = open_file_as_string(
        script_dir+"/templates/proto_io.template.h")
    nab_proto_template_cpp = open_file_as_string(
        script_dir+"/templates/proto_io.template.cpp")

    message_class_cpp_string = ""
    message_class_h_string = ""
    message_cases_cpp_string = ""
    d = {}
    for idx, message in enumerate(message_list):
        d['messageName'] = message
        d['messageType'] = idx
        message_class_cpp_string += message_class_template_cpp.format(**d)+"\n"
        message_class_h_string += message_class_template_h.format(**d)+"\n"
        message_cases_cpp_string += message_cases_cpp_template.format(**d)+"\n"
    d['messageClassesCpp'] = message_class_cpp_string
    d['messageClassesH'] = message_class_h_string
    d['messageCreationCases'] = message_cases_cpp_string

    message_names = ", ".join(message.upper() for message in message_list)
    d['lookupmessagetypeenum'] = message_names
    nab_proto_h_file = nab_proto_template_h.format(**d)
    nab_proto_cpp_file = nab_proto_template_cpp.format(**d)

    save_template(output_file_path+"/proto_io.h", nab_proto_h_file)
    save_template(output_file_path+"/proto_io.cpp", nab_proto_cpp_file)


def generate_python_proto_nab(message_list, output_file_path):
    script_dir = os.path.dirname(__file__)

    main_template = open_file_as_string(
        script_dir+"/templates/proto_io.template.py")

    condition_template = open_file_as_string(
        script_dir+"/templates/condition.template.py")

    d = {}
    condition_template_formatted = ""
    print "message_list:" + str(message_list)

    d['index_message_type_dict'] = ""
    d['message_type_index_dict'] = ""
    if len(message_list) > 0:
        for idx, val in enumerate(message_list):
            d['index_message_type_dict'] += "{0}: '{1}', ".format(idx,
                                                                  message_list[idx])
            d['message_type_index_dict'] += "'{1}': {0}, ".format(idx,
                                                                  message_list[idx])
            d['protoMessageType'] = idx
            d['protoMessage'] = val
            condition_template_formatted += condition_template.format(**d)

        d['index_message_type_dict'] = d['index_message_type_dict'][:-2]
        d['message_type_index_dict'] = d['message_type_index_dict'][:-2]
        d['conditions'] = condition_template_formatted
        main_template_formatted = main_template.format(**d)

        save_template(output_file_path+"/proto_io.py",
                      main_template_formatted)
    else:
        print "[error] proto file contains no messages."


def find_messages_in_proto(proto_file_contents):
    regex = r"message\s+([a-z A-Z \d]+)\s*"
    matches = re.findall(regex, proto_file_contents, flags=0)
    print matches;
    return matches


def run_protoc_gen(filepath_proto, os_system, code, output_path):
    print 'pwd:' + os.getcwd()
    print 'os:' + os_system
    protoc_binary = ""
    out_arg = ""
    if os_system.lower().strip() == "linux":
        protoc_binary = os.path.abspath(os.path.join(filepath_proto,
                                    'generators/bin/linux/protoc'))
    else:
        print 'Error os selected not supported: ' + os_system
        return False

    if code == 'c':
        out_arg += "-omessages.pb"
    elif code == 'python':
        out_arg += "--python_out="
        out_arg += output_path + "/."
    elif code == 'js':
        out_arg += "--js_out=import_style=commonjs,binary:"
        out_arg += output_path + "/."
    else:
        print 'Error code selected not supported' + code
        return False


    proto_arg = filepath_proto+"/messages.proto"
    proto_src_path = "--proto_path="+filepath_proto+"/"

    try:
        ls_output = subprocess.check_output([protoc_binary,
                                             out_arg,
                                             proto_src_path,
                                             proto_arg])
        print ls_output
    except subprocess.CalledProcessError as e:
        print "ERROR:" + str(e)


def extract_proto_messages(proto_file_path):
    proto = open_file_as_string(proto_file_path)
    message_list = find_messages_in_proto(proto)
    return message_list



def embedded_main(selected_os, proto_file_path, output_dir_path):
    output_dir_path = os.path.abspath(os.path.join(os.getcwd(), output_dir_path))
    proto_file_path = os.path.abspath(os.path.join(os.getcwd(), proto_file_path))

    run_protoc_gen(proto_file_path,
                   selected_os,
                   'c',
                   output_dir_path)

    # Perform nanopb step
    nanopb_python_script = os.path.abspath(os.path.join(proto_file_path,
                                                        'generators/nanopb/nanopb_generator.py'))
    options_file_value = os.path.abspath(os.path.join(proto_file_path,
                                                        "messages.options"))
    partial_proto_file = 'messages.pb'

    try:
        ls_output = subprocess.check_output(["python",
                                             nanopb_python_script,
                                             partial_proto_file,
                                             "--options-file",
                                             options_file_value,
                                             "--output-dir",
                                             output_dir_path])

        partial_proto_file_path = os.path.abspath(os.path.join(os.getcwd(), partial_proto_file))
        os.remove(partial_proto_file_path)
    except subprocess.CalledProcessError as e:
        print "ERROR:" + str(e)


    message_list = extract_proto_messages(proto_file_path+"/messages.proto")

    # Generate files based on found messages
    generate_embedded_proto_nab(message_list, output_dir_path)


def python_main(selected_os, proto_file_path, output_dir_path):
    output_dir_path = os.path.abspath(os.path.join(os.getcwd(), output_dir_path))
    proto_file_path = os.path.abspath(os.path.join(os.getcwd(), proto_file_path))

    print("output_dir_path:" + output_dir_path)
    print("proto_file_path:" + proto_file_path)
    run_protoc_gen(proto_file_path,
                   selected_os,
                   'python',
                   output_dir_path)

    message_list = extract_proto_messages(proto_file_path+"/messages.proto")
    generate_python_proto_nab(message_list, output_dir_path)


def js_main(selected_os, proto_file_path, output_dir_path):
    output_dir_path = os.path.abspath(os.path.join(os.getcwd(), output_dir_path))
    proto_file_path = os.path.abspath(os.path.join(os.getcwd(), proto_file_path))

    print("output_dir_path:" + output_dir_path)
    print("proto_file_path:" + proto_file_path)
    run_protoc_gen(proto_file_path,
                   selected_os,
                   'js',
                   output_dir_path)
