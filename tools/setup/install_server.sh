#!/bin/sh
sudo apt-get install python-dev libmysqlclient-dev
sudo apt-get install python-pip
# install mysql server
sudo apt-get install mysql-server
# install mongodb
sudo apt-get install mongodb

#Python dependencies used by clients
pip install 'protobuf>=3.1.0'
pip install 'paho-mqtt>=1.2'
pip install "MySQL-python>=1.2.5"
pip install 'mock>=2.0.0'

# install nabton SDK pynab library
pip install ioant
pip install ioant_mysqlhelper

# install nodejs
curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y npm
