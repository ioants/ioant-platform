#!/bin/sh
# Run this script from terminal within atom to get it running with platformio virtual environment
sudo apt-get install python-dev
sudo apt-get install libmysqlclient-dev
sudo apt-get install python-pip

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
