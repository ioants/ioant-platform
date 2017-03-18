
xcode-select --install
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew update
brew doctor
brew upgrade

# MYSQL
brew install mysql
mysql.server restart
mysql_secure_installation
# Fix for mac os looking at wrong place for mysql socket (mac only)
sudo mkdir /var/mysql
sudo ln -s /tmp/mysql.sock /var/mysql/mysql.sock

# python
brew install python

# NodeJS and npm package manager
brew install npm
# PM2 for process management
npm install pm2@latest -g

brew install mongodb

#Python dependencies used by clients
pip install 'protobuf>=3.1.0'
pip install 'paho-mqtt>=1.2'
pip install "MySQL-python>=1.2.5"
pip install 'mock>=2.0.0'
pip install django

# install nabton SDK pynab library
pip install ioant
pip install ioant_mysqlhelper
