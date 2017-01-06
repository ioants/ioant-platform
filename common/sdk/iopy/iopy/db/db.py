import MySQLdb as mysqldb


class DatabaseHelper(object):
    """A helper for interacting with Nabton mysql database

    Attributes:
        connection: Database connection object to MySQLdb
        schema: A dictionary containing database schema definitions
        user: Username to mysql database
        password: Username password
        host: URL or IP to host of mysql database
        db_name: Name of Nabton database
    """

    def __init__(self, schema, host, user, password):
        """Return a DatabaseHelper object, based on schema supplied"""
        self.connection = None
        self.schema = schema
        self.user = user
        self.password = password
        self.host = host
        self.db_name = schema['database']['name']
        self.result_cursor = None


    def __exit__(self, *err):
        print "class deleted"
        self.disconnect_to_mysql()
        self.close()

    def connect_to_mysql(self):
        try:
            self.connection = mysqldb.connect(host=self.host,
                                              user=self.user,
                                              passwd=self.password)
            return True
        except mysqldb.Error, e:
            print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
            return False

    def connect_to_mysql_database(self):
        try:
            self.connection = mysqldb.connect(host=self.host,
                                              user=self.user,
                                              passwd=self.password,
                                              db=self.db_name)
            return True
        except mysqldb.Error, e:
            print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
            return False

    def is_connected_to_mysql(self):
        if self.connection is not None:
            return True
        else:
            print "Not connected to database"
            return False

    def disconnect_from_mysql(self):
        if self.connection is not None:
            self.connection.close()
            self.connection = None

    def does_database_exist(self):
        if not self.is_connected_to_mysql():
            return None

        cursor = self.connection.cursor()
        try:
            cursor.execute("SELECT COUNT(*) FROM INFORMATION_SCHEMA.SCHEMATA"
                           " WHERE SCHEMA_NAME = '{0}'".format(self.db_name))
            if cursor.fetchone()[0] == 1:
                cursor.close()
                return True
            else:
                cursor.close()
                return False
        except mysqldb.Error, e:

            print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
            return None

    def create_database(self):
        if not self.is_connected_to_mysql():
            return None
        cursor = self.connection.cursor()
        try:
            cursor.execute("CREATE DATABASE IF NOT EXISTS {0}".
                           format(self.db_name))
            return True
        except mysqldb.Error, e:
            print "MySQL Error [%d]: %s"  (e.args[0], e.args[1])
            return None

    def create_column_definition(self,
                                 column_name,
                                 column_type,
                                 column_size,
                                 column_null,
                                 column_auto_increment,
                                 column_default_value=None):
        column_def = ""
        column_null_field = self.return_null_string(column_null)
        column_auto_increment_field = self.return_autoincrement_string(column_auto_increment)
        column_type = column_type.lower()
        if column_size is None:
            column_def += "{0} {1} {2} {3},".format(column_name,
                                                    column_type.upper(),
                                                    column_null_field,
                                                    column_auto_increment_field)
        else:
            column_def += "{0} {1}({2}) {3} {4},".format(column_name,
                                                         column_type.upper(),
                                                         column_size,
                                                         column_null_field,
                                                         column_auto_increment_field)
        # Add default value, if defined
        if column_default_value is not None:
            column_def = column_def[:-1]
            column_def += "DEFAULT " + str(column_default_value) + ","

        return column_def

    def execute_query(self, query, dict_cursor=False):
        if not self.is_connected_to_mysql():
            return None
        if dict_cursor:
            cursor = self.connection.cursor(mysqldb.cursors.DictCursor)
        else:
            cursor = self.connection.cursor()
        try:
            cursor.execute(query)
            self.result_cursor = cursor
            return True
        except mysqldb.Error, e:
            print "MySQL Error [%d]: %s" % (e.args[0], e.args[1])
            return False

    def fetch_all_query_results(self):
        """Return results from last run sql query as list of tuples"""
        return self.result_cursor.fetchall()

    def get_table_start(self, table_name):
        return "CREATE TABLE {0} (".format(table_name.lower())

    def get_table_end(self):
        return ") ENGINE=InnoDB"

    def return_null_string(self, null_value):
        """Return SQL string value based on null_value boolean"""
        if null_value:
            return " "
        else:
            return "NOT NULL"

    def return_autoincrement_string(self, auto_increment_value):
        """Return SQL string value based on null_value boolean"""
        if auto_increment_value:
            return "AUTO_INCREMENT"
        else:
            return ""

#------------------------------------------------------------------------------
# Methods specific to stream data
#------------------------------------------------------------------------------

    def check_for_stream_id_existens(self, topic_dict):
        if not self.is_connected_to_mysql():
            return None
        stream_table = self.schema['database']['tables'][0]
        query = "SELECT {0} "\
                .format(stream_table['primaryKey'])
        query += "FROM {0} WHERE ".format(stream_table['name'])

        topic_list = ['global',
                      'local',
                      'client_id',
                      'stream_index',
                      'message_type']

        list_of_columns = stream_table['columns']
        for column in list_of_columns[:-1]:
            if column['special'] in topic_list:
                if column['type']['name'] == 'varchar':
                    query += "{0}='{1}'".format(column['name'],
                                                topic_dict[column['special']])
                elif column['type']['name'] == 'int':
                    query += "{0}={1}".format(column['name'],
                                              topic_dict[column['special']])
                query += " AND "
        # remove last AND
        query = query[:-5]
        if self.execute_query(query, dict_cursor=True):
            all_rows = self.result_cursor.fetchall()
            if len(all_rows) == 1:
                return all_rows[0][stream_table['primaryKey']]
            else:
                return None
        else:
            print "Failed to run query:" + query

    def add_stream(self, topic_dict, message_name):
        if not self.is_connected_to_mysql():
            return None

        stream_table = self.schema['database']['tables'][0]
        query = "INSERT INTO {0} ({1}) VALUES ({2})"

        column_name_list = ['global', 'local', 'client_id', 'stream_index', 'message_type', 'message_name']

        list_of_columns = stream_table['columns']
        values = ""
        column_names = ""
        for column in list_of_columns:
            if column['special'] in column_name_list:
                if column['special'] == 'message_name':
                    values += "'{0}',".format(message_name.lower())
                    column_names += "{0},".format(column['name'])
                elif column['type']['name'] == 'varchar':
                    values += "'{0}',".format(topic_dict[column['special']])
                    column_names += "{0},".format(column['name'])
                elif column['type']['name'] == 'int':
                    values += "{0},".format(topic_dict[column['special']])
                    column_names += "{0},".format(column['name'])

        # Remove last ,
        column_names = column_names[:-1]
        values = values[:-1]

        query = query.format(stream_table['name'], column_names, values)
        if self.execute_query(query, dict_cursor=True):
            self.connection.commit()
            return True
        else:
            self.connection.rollback()
            return False

    def create_stream_table(self, message, stream_id):
        if not self.is_connected_to_mysql():
            return None

        message_table_prefix = self.schema['database']['messageTablePrefix']
        message_type_name = message.DESCRIPTOR.name
        query = ""
        query += self.get_table_start(message_table_prefix+str(stream_id)+"_"+message_type_name.lower())


        query += self.create_column_definition("id",
                                               "int",
                                               10,
                                               False,
                                               True)
        message_fields = message.DESCRIPTOR.fields

        if len(message_fields) <= 0:
            return False
        # todo improve with size of ints ..
        for field in message_fields:
            column_type = ''
            column_default_value = None
            column_NULL = True
            column_size = None
            if field.type is 1:
                column_type = 'double'
                column_default_value = 0.0
            elif field.type is 2:
                column_type = 'float'
                column_default_value = 0.0
            elif field.type in [3, 4, 5, 6, 7, 13]:
                column_type = 'int'
                column_size = 6
                column_default_value = 0
            elif field.type is 8:
                column_type = 'boolean'
                column_default_value = 0
            elif field.type is 9:
                column_type = 'text'
            elif field.type is 14:
                column_type = 'int'
                column_size = 2
                column_default_value = field.enum_type.values[0].number


            query += self.create_column_definition(field.name,
                                                   column_type,
                                                   column_size,
                                                   column_NULL,
                                                   False,
                                                   column_default_value)

        query += self.create_column_definition("ts",
                                               "TIMESTAMP",
                                               None,
                                               False,
                                               False)

        query += "PRIMARY KEY (`id`),"
        query += "KEY `ts` (`ts`)"
        query += self.get_table_end()
        #print query
        if self.execute_query(query):
            self.connection.commit()
            return True
        else:
            self.connection.rollback()
            return False

    def store_message_to_database(self, message, stream_id):
        if not self.is_connected_to_mysql():
            return None

        messag_name = message.DESCRIPTOR.name
        message_table_prefix = self.schema['database']['messageTablePrefix']
        data_table = message_table_prefix+str(stream_id)+"_"+messag_name.lower()

        query = "INSERT INTO {0} ({1}) VALUES ({2})"

        message_fields = message.ListFields()
        values = ""
        column_names = ""
        if len(message_fields) > 0:
            # todo improve with size of ints ..
            for field in message_fields:
                #print "Add field:" + field[0].name
                column_names += field[0].name+","
                if field[0].type == 9:
                    values += "'"+str(field[1])+"',"
                else:
                    values += str(field[1])+","

            values = values[:-1]
            column_names = column_names[:-1]
            query = query.format(data_table.lower(), column_names, values)
        else:
            query = "INSERT INTO {0} VALUES()".format(data_table.lower())

        #print query
        if self.execute_query(query):
            self.connection.commit()
            return True
        else:
            self.connection.rollback()
            return False
