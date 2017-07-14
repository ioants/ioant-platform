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
    sudo apt install -y python-dev
    sudo apt install -y python-pip
    sudo apt install -y protobuf-compiler
    sudo apt install -y npm
    sudo pip install --upgrade pip
    sudo npm install npm@latest -g
    sudo npm install -g n
    sudo n stable
    sudo apt install -y protobuf-compiler
}

platform() {
    # install mysql server
    sudo apt install -y mysql-server
    # install mongodb
    sudo apt install -y mongodb
    # install dev mysql
    sudo apt-get install -y libmysqlclient-dev
    # install pm2 process manager
    sudo npm install -g pm2
}

broker() {
    apt-get install -y mosquitto
    # TODO add mosquitto_passwd to add users here
}

virtualenv() {
    # Virtual environment set up
    sudo pip install virtualenv
    sudo pip install virtualenvwrapper

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

## Step one install base dependencies
base

## Install addiotional dependencies based on options
while [ $# -gt 0 ]; do
    case $1 in
        --help)
            usage
            exit 1
            ;;
        --platform)
            echo '# Platform install'
            platform
            ;;
        --broker)
            echo '# Broker install'
            broker
            ;;
        --virtualenv)
            echo '# Virtualenv install'
            virtualenv
            ;;
        *)
            usage
    esac
    shift
done
