# Set up
Description for setting up your own IOAnt platform and/or setting up a developer environment. In both cases a virtual environment called ioant will be set up.

## Setting up the IOAnt platform
This is required for a IOAnt platform to work:
- [MySQL](https://www.mysql.com/)
- [MongoDB](https://www.mongodb.com/)
- [NPM package manager and NodeJS](https://www.npmjs.com/)
- [Mosquitto MQTT broker](https://mosquitto.org/)
- [PM2 process manager](http://pm2.keymetrics.io/)
- Python dependencies
    - IOant python SDK and mysqlhelper
    - Protobuf
    - Paho MQTT
    - MySQL
    - Django

### On Ubuntu/Raspbian (debian based)
Run the following install script:
```shell
source debian/install_server.sh
```

### On Mac OS X
Run the following install script:
```shell
source macosx/install_server.sh
```
**Note!** This will attempt to install [xcode](https://developer.apple.com/xcode/) and [homebrew package manager](https://brew.sh/index_se.html)

### On Windows
TODO


### MQTT broker
The broker will start with default settings. Anonymous clients are allowed to connect to port **1883**.

#### How to set up custom configurations on Debian system
Recommended configuration would be:
```shell
# Create a mosquitto configuration file
touch mosquitto_ioant.conf
nano mosquitto_ioant.conf
```
Add the following to the file:
```shell
port 8844
allow_anonymous false
password_file /path/to/userpasswordfile/passwd
```
Create the user-password file:
```shell
mosquitto_passwd -c passwd john
#Enter the password for user: john
*****
# Repeat
*****
# Done
```
Start the mosquitto server with new configuration:
```shell
mosquitto -c mosquitto_ioant.conf
```


## Setting up the developer environment
Run in the platformio ide terminal:
```shell
source install_developer.sh
```

This will install:
- [NPM package manager and NodeJS](https://www.npmjs.com/)
- [PM2 process manager](http://pm2.keymetrics.io/)
- Python dependencies
    - IOant python SDK and mysqlhelper
    - Protobuf
    - Paho MQTT

**Note!** Additional dependencies may be required by a device or entity application. If that is the case, dependecies are listed in the corresponding device/entity requirements.txt file.
