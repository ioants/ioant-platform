import unittest
import mock
from mock import patch
from pynab.db import db
import MySQLdb


class DbTestCase(unittest.TestCase):
    """Tests for `db.py`."""

    def setUp(self):
        self.test_schema = {}
        self.test_schema['database'] = {"name": 'test_db'}
        self.test_host = "foobar.com"
        self.test_user = "foo"
        self.test_password = "bar"
        self.nabton_db = db.DatabaseHelper(self.test_schema,
                                           self.test_host,
                                           self.test_user,
                                           self.test_password)

    def tearDown(self):
        print "tear down test"

    def test_valid_nabton_database_helper_object(self):
        self.assertEqual(self.nabton_db.db_name,
                         self.test_schema['database']['name'])
        self.assertEqual(self.nabton_db.user,
                         self.test_user)
        self.assertEqual(self.nabton_db.password,
                         self.test_password)
        self.assertEqual(self.nabton_db.host,
                         self.test_host)

    @patch('pynab.db.db.mysqldb')
    def test_mysql_connection(self, mysqldb):
        self.nabton_db.connect_to_mysql()
        mysqldb.connect.assert_called_with(host=self.test_host,
                                           passwd=self.test_password,
                                           user=self.test_user)

    @patch('pynab.db.db.mysqldb')
    def test_mysql_connection_database(self, mysqldb):
        self.nabton_db.connect_to_mysql_database()
        test_db = self.test_schema['database']['name']
        mysqldb.connect.assert_called_with(host=self.test_host,
                                           passwd=self.test_password,
                                           user=self.test_user,
                                           db=test_db)

    @patch('pynab.db.db.mysqldb')
    def test_is_connected_to_mysql(self, mysqldb):
        # Simulate connection to database.
        mysqldb.connect.return_value = "connection object"
        self.assertTrue(self.nabton_db.connect_to_mysql_database())
        self.assertTrue(self.nabton_db.is_connected_to_mysql())

    @patch('pynab.db.db.mysqldb')
    def test_is_not_connected_to_mysql(self, mysqldb):
        self.nabton_db.connection = None
        self.assertFalse(self.nabton_db.is_connected_to_mysql())

    @patch('pynab.db.db.mysqldb')
    def test_is_not_connected_to_mysql(self, mysqldb):
        self.nabton_db.connection = None
        self.assertFalse(self.nabton_db.is_connected_to_mysql())


if __name__ == '__main__':
    unittest.main()
