import os
import sys
from ioant.utils import utils
from ioant_mysqlhandler.db import db

def create_tables(db_schema_dict):
    primary_key = "  PRIMARY KEY (`{0}`)"
    table_list = db_schema_dict['database']['tables']

    if len(table_list) > 0:
        print "[info] Creating {0} tables".format(len(table_list))
        connection = db_helper.connect_to_mysql_database()
        if connection is not None:
            for table in table_list:
                table_query = " "
                table_query += db_helper.get_table_start(table['name'])
                for column in table['columns']:
                    column_size = None
                    if column['type']['size'] > 0:
                        column_size = column['type']['size']

                    table_query += db_helper.create_column_definition(column['name'],
                                                            column['type']['name'],
                                                            column_size,
                                                            column['type']['null'],
                                                            column['type']['autoIncrement'])
                table_query += primary_key.format(table['primaryKey'])
                table_query += db_helper.get_table_end()

                if db_helper.execute_query(table_query):
                    print "[info] Created table: {0} ".format(table['name'])
                else:
                    print "[error] Failed to create table: {0} ".format(table['name'])

            db_helper.disconnect_from_mysql()
        else:
            print("[error] Failed to connect to database with name:" + db_schema_dict['database']['name'])
    else:
        print "[info] No tables defined in json file. Done"

def init_ascii():
    message = "\
=========================================================================\n\
|                           Database creator script                     |\n\
========================================================================="
    return message

if __name__ == "__main__":
    print(init_ascii())
    script_dir = os.path.dirname(os.path.realpath(__file__))
    db_schema_path = utils.return_absolut_path(script_dir, '../schema.json')
    print db_schema_path
    db_schema_dict = utils.fetch_json_file_as_dict(db_schema_path)
    configuration_path = utils.return_absolut_path(os.path.dirname(__file__),
                                                   '../configuration.json')
    configuration_dict = utils.fetch_json_file_as_dict(configuration_path)

    host = configuration_dict['mysqlDatabase']['host']
    user = configuration_dict['mysqlDatabase']['user']
    password = configuration_dict['mysqlDatabase']['password']

    global db_helper
    db_helper = db.DatabaseHelper(db_schema_dict,
                                       host,
                                       user,
                                       password)


    if not db_helper.connect_to_mysql():
        print("[error] Failed to connect to mysql. Check username and password")
        sys.exit()

    db_name = db_schema_dict['database']['name']

    result = db_helper.does_database_exist()
    if not result:
        print("[info] Database did not exist. Creating from json file:" +
        utils.return_absolut_path(script_dir,'../schema.json'))
        if db_helper.create_database():
            db_helper.disconnect_from_mysql()
            create_tables(db_schema_dict)
        else:
            print("[error] Failed to create database")
            db_helper.disconnect_from_mysql()
    elif result is None:
        print("[error] Database did not exist and error was caught when creating it. Aborting create script")
        print("[error] Script failed!")
        db_helper.disconnect_from_mysql()
        sys.exit()
    else:
        create_tables(db_schema_dict)
        db_helper.disconnect_from_mysql()
        print("[info] Database exists. Exiting..")


    print("-------------------------------------------------------------------------")
    print("Done")
    sys.exit()
