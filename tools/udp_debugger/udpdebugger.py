import socket
import datetime
port = 4444
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.bind(("", port))
print "waiting on port:", port
while 1:
    data, addr = s.recvfrom(1024)
    sd = datetime.datetime.now()
    print data.decode("ascii", "ignore") + "|" + str(sd) + "\n"
