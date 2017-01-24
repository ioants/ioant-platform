# Dashy - Real Time Dashboard for IOAnt
Dashy is a modular real-time dashboard for the IOAnt platform, which allows
you to set up your own dashboard with ease. *All data is real-time, and thus
no data is stored persistently but kept in buffers that only live as long
as the application is running.*

## Installation
There are two ways of installing the application, either via downloading the
whole platform *or* downloading only the application.

### Throgh the whole platform
1. Clone this repository.
``` bash
git clone https://github.com/ioants/ioant.git
```

2. In a terminal, navigate to the application folder.
3. Install the dependencies via the command:
``` bash
npm install
```

4. Build the platform dependencies for the app via the command:
``` bash
npm build
```

5. Copy the file `configuration_default.json` to `configuration.json` and edit its
   content to fit your settings.
   
6. Start the application via the command:
``` bash
npm start
```
or
``` bash
nodejs app.js
```
*Note: some installations of NodeJS are available under the name `node` instead of
`nodejs`. You should use the appropriate one for your system.*

7. Via a web-browser, navigate to the *host* and *port* (host:port) to access the
   dashboard.

### Only the app
*TBA*
