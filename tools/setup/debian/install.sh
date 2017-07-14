#!/bin/bash

scriptDir=$(cd $(dirname $0); pwd)
script=$(basename $0)

usage() {
cat <<EOF
NAME
    $script - A script for installing dependencies for debian system

SYNOPSIS
    $script [options]

OPTIONS
    The following options are supported

    --platform
        Install platform dependencies

    --broker
        Install and start the MQTT broker

    --virtualenv
        Install virtualenv
EOF
}

base() {
    sudo apt-get install -y python-dev 1>/dev/null
    sudo apt-get install -y python-pip 1>/dev/null
    sudo apt-get install -y protobuf-compiler 1>/dev/null
    sudo apt-get install -y npm 1>/dev/null
    sudo pip install --upgrade pip 1>/dev/null
    sudo npm install -g n 1>/dev/null
    sudo n stable 1>/dev/null
    sudo apt-get install -y protobuf-compiler 1>/dev/null
}

platform() {
    # install mysql server
    sudo apt-get install -y mysql-server 1>/dev/null
    # install mongodb
    sudo apt-get install -y mongodb 1>/dev/null
    # install dev mysql
    sudo apt-get install -y libmysqlclient-dev 1>/dev/null
    # install pm2 process manager
    sudo npm install -g pm2 1>/dev/null
}

broker() {
    sudo apt-get install -y mosquitto 1>/dev/null
    # TODO add mosquitto_passwd to add users here
}

virtualenv() {
    # Virtual environment set up
    sudo pip install virtualenv 1>/dev/null
    sudo pip install virtualenvwrapper 1>/dev/null

    file="$HOME/.bashrc"
    if [ -f "$file" ]
    then
    	echo "## Bash found!"
        echo 'export WORKON_HOME=$HOME/Envs' >> $file
        echo 'source /usr/local/bin/virtualenvwrapper.sh' >> $file
    else
        echo "Could not find .bashrc"
    fi

    file="$HOME/.zshrc"
    if [ -f "$file" ]
    then
        echo "## ZSH found!"
        echo 'export WORKON_HOME=$HOME/Envs' >> $file
        echo 'source /usr/local/bin/virtualenvwrapper.sh' >> $file
        #source $file
    else
        echo "Could not find .zshrc"
    fi

    echo "Virtualenv installed. Restart terminal"
}

while [ $# -gt 0 ]; do
    case $1 in
        --help)
            usage
            exit 1
            ;;
        --platform)
            platform_s=1
            ;;
        --broker)
            broker_s=1
            ;;
        --virtualenv)
            virtualenv_s=1
            ;;
        *)
            usage
    esac
    shift
done

echo '# Installing base requirements'

read -n1 -p "Proceed? (Y/n)" decision
case $decision in
  y|Y) printf ' \n Seleceted: yes \n' ;;
  n|N)
    printf ' \n Selected: no \n'
    exit 1
    ;;
  *)
    printf ' \n Seleceted: yes \n'
    ;;
esac

echo 'Working...'
base
echo '# Base installed'

if ! [ -z ${platform_s+x} ]; then
    echo '# Platform install'
    platform
fi

if ! [ -z ${broker_s+x} ]; then
    echo '# Broker install'
    broker
fi

if ! [ -z ${virtualenv_s+x} ]; then
    echo '# Virtualenv install'
    virtualenv
fi
