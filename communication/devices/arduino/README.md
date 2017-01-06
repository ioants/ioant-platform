# Clients
> README for embedded arduino Nabton clients (ESP8266)

## Set up
At its heart the Nabton platform revolves around the [proto](https://github.com/google/protobuf) file. This file defines all messages that travel within the platform. All clients depend on this file. Hence, in an attempt to simplify for you as a developer, effort has been put into automating the inclusion of the proto file in your project.

1. Download and install [Platformio web page](http://platformio.org/)
2. Clone the Nabton repo
3. Copy one of the boilerplates or applications into the **applications folder** and rename it to whatever you like
4. Start platformio and add the newly created folder to your workspace
5. While in platformio, locate **configuration_default.json** under **config folder** and make a copy. Save it as  **configuration.json**
6. Edit the config parameters in **configuration.json** to what suits your needs.
7. Done. You are now ready to build and upload the example code.

You can append the proto file with your own messages. The changes will automatically be available in your platformio project.

The proto file is located at: **nabton/common/proto/messages.proto**

## Boilerplates
> Small projects that demonstrate the bare minimum for various use cases. Use
> the projects as boilerplates from which you build your own application.

Available boilerplates:
- **X-100-communication** : The bare minimum for sending and receiving proto messages
- **X-101-temperature**  : Measuring one-wire ds18b20 sensors and sending the data
- **X-102-DHT22**  : Measuring temperature and humidity with the DTH22 sensor
- **X-103-oleddisplay**  : Subscribing on different topics and showing various data on an oled display
- **X-104-stepper**  : Controlling a stepper motor based on values in a received message

## Applications
> Complete projects tailored for a specific task.

Available applications:
- **A-101-nilm** : A power meter client that reports Wattage
- **A-102-camtrigger** : A client that sends messages that will trigger other clients connected to cameras

## Libraries
> The libraries or SDK for using the Nabton platform. Divided into core and module
