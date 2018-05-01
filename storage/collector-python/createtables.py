# -*- coding: utf-8 -*-
# =============================================
# Author: Simon Lövgren
# Date: 2018-05-01
# Description: Database table creator for ioant
#              collector.
# =============================================
from ioant_mysqlhelper.db import db
from ioant import utils
import sys
import logging

logger = logging.getLogger(__name__)

def main( configFile, schemaFile ):
    configuration = utils.fetch_json_file_as_dict( configFile )
    schema = utils.fetch_json_file_as_dict( schemaFile )

    db_host = configuration['mysqlDatabase']['host']
    db_user = configuration['mysqlDatabase']['user']
    db_password = configuration['mysqlDatabase']['password']
    db_name = configuration['mysqlDatabase']['name']

    global db_helper
    db_helper = db.DatabaseHelper(db_name,
                                schema,
                                db_host,
                                db_user,
                                db_password)

    if db_helper.connect_to_mysql_database():
        logger.info("Connected to database")
        db_helper.create_database_tables()

if __name__ == "__main__":
    args = sys.argv
    if ( len(args) != 3 ):
        print("Invalid arguments.");
        print("usage: createtables.py <configfile> <schemafile>");
        sys.exit( 1 );
    
    main( args[1], args[2] )
