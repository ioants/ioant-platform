# Rest server
Built using a node js application. Supports parallel requests

# API VERSIONS
## v 0.1

### /streams
- /streams
    - Lists all streams available in the system
    - Example request:
        ```
        domain.com:1881/v0.1/streams
        ```
    - Example output:
```
[
    {
        "sid": 1,
        "global": "torsgatan9",
        "local": "outside",
        "client_id": "nixieyellowblack",
        "stream_index": 0,
        "message_type": 4,
        "message_name": "temperature",
        "creation_ts": "2017-01-13T17:19:48.000Z",
        "latest_value": 1.125,
        "update_ts": "2017-01-13T17:20:18.000Z"
    },
    {
        "sid": 2,
        "global": "kil",
        "local": "kvv32",
        "client_id": "esp2",
        "stream_index": 0,
        "message_type": 8,
        "message_name": "electricpower",
        "creation_ts": "2017-01-13T17:19:49.000Z",
        "latest_value": 1508.17,
        "update_ts": "2017-01-13T17:20:20.000Z"
    },
    ...
]
```

### /streams/id
- /v0.1/streams/id/**[stream id]**
    - lists a particular stream's meta info.
    - Example request:
        ```
        domain.com:1881/v0.1/streams/id/2
        ```
    - Example output:
```
[
    {
        "sid": 2,
        "global": "kil",
        "local": "kvv32",
        "client_id": "esp2",
        "stream_index": 0,
        "message_type": 8,
        "message_name": "electricpower",
        "creation_ts": "2017-01-13T17:19:49.000Z"
    }
]
```

### /v0.1/streams/id/**[stream id]**/data
- /v0.1/streams/id/**[stream id]**/data?startdate=**[startdate]**&enddate=**[enddate]**&filter=**[filter]**
    - Returns stream data given a particular time frame and filtration
    - Arguments:
        - startdate [YYYY-MM-DD]
        - enddate [YYYY-MM-DD] (optional)
        - filter [integer]

    - Example request:
        ```
        domain.com:1881/v0.1/streams/id/2/data?startdate=2017-01-13&filter=1
        ```
    - Example output:
```
[
    {
        "id": 7,
        "value": 1508.17,
        "unit": 0,
        "pulses": 3,
        "ts": "2017-01-13T17:20:20.000Z"
    },
    {
        "id": 6,
        "value": 1507.54,
        "unit": 0,
        "pulses": 2,
        "ts": "2017-01-13T17:20:16.000Z"
    },
    {
        "id": 5,
        "value": 1512.61,
        "unit": 0,
        "pulses": 2,
        "ts": "2017-01-13T17:20:10.000Z"
    },
    {
        "id": 4,
        "value": 1518.99,
        "unit": 0,
        "pulses": 2,
        "ts": "2017-01-13T17:20:06.000Z"
    },
    ...
```


# Documentation
We use Dox for generating application documentation
https://github.com/tj/dox
