# Install core dependecies
```sh
source setup.sh
```

# USB stick setup - database storage
If you are running arch on a raspberry pi or other device using SD-card you should configure so that database storage is done to a USB memory stick instead. Frequent writes to a SD-card can destroy it. 

Plug in a memory stick and follow the commands below to format and auto-mount the usb when the raspberry boots.

```sh
sudo fdisk /dev/sdX
# o, p, 1, 

sudo mkfs.ext4 /dev/sda1
sudo mkdir /mnt/data
sudo mount /dev/sda1 /mnt/data
sudo vim /etc/fstab

># Static information about the filesystems.
># See fstab(5) for details.

># <file system> <dir> <type> <options> <dump> <pass>
>/dev/mmcblk0p1  /boot   vfat    defaults        0       0
>/dev/sda1       /mnt/data ext4  defaults,noatime 0      1 
```

# Setup mysql

```sh
sudo mysql_install_db --user=mysql --basedir=/usr --datadir=/mnt/data/mysql
# Add datadir to you /etc/mysql/my.cnf
# : If you use something different from /var/lib/mysql for your data dir, you need to set datadir=<YOUR_DATADIR> under section [mysqld] of your /etc/mysql/my.cnf.
# More information: https://wiki.archlinux.org/index.php/MySQL
# Add linde: datadir=/mnt/data/mysql

# Start mysql database
sudo systemctl start mariadb.service

# Secure mysql database
mysql_secure_installation

# Add automatic start of database
sudo systemctl enable mariadb.service
```

# Setup pm2 startup

```sh
pm2 startup

# Run the command that pm2 spits out
```

# Setup mosquitto config
See overall README.md
