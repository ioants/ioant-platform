#!/bin/sh
sudo apt-get install python-dev libmysqlclient-dev
sudo apt-get install python-pip
sudo pip install --upgrade pip

# install mysql server
sudo apt-get install mysql-server
# install mongodb
sudo apt-get install mongodb

# install nodejs
sudo apt-get install -y npm
sudo npm install npm@latest -g
sudo npm install n
# installas latest node js
sudo n latest

sudo apt-get install mosquitto

sudo npm install -g pm2

# Virtual environment set up
sudo pip install virtualenv
sudo pip install virtualenvwrapper
echo 'export WORKON_HOME=~/Envs' >> ~/.bashrc
echo 'source /usr/local/bin/virtualenvwrapper.sh' >> ~/.bashrc
source  ~/.bashrc
mkvirtualenv ioant

## Everything below is installed within ioant virtual environment
#Python dependencies used by clients
pip install 'protobuf>=3.1.0'
pip install 'paho-mqtt>=1.2'
pip install "MySQL-python>=1.2.5"
pip install 'mock>=2.0.0'
pip install django

# install nabton SDK pynab library
pip install ioant
pip install ioant_mysqlhelper
