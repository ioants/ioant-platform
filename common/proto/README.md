# Proto message defintion
The messages.proto file contains all the valid messages that exist between clients.

## Adding your own messages
You can easily add your own proto messages by adding it to the .proto file. Make also sure that you update the MessageType enum at the top of the proto file. Order is important. The first message in the enum must correspond to the first message encounter below the enum.

## Protoc generator
Currently we only support clients that are run/compiled under linux. For this the protoc(v.3.10.a) compiler by Google is used

### Nanopb
For embedded device a special protobuf library is used, called nanopb.
There is an addiotional file called messages.options which is used for nanopb. In this file fields that are of type String must be declared.
