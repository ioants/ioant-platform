xcode-select --install
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"

brew update
brew doctor
brew upgrade

# python
brew install python

# NodeJS and npm package manager
brew install npm
# PM2 for process management
npm install pm2@latest -g

brew install mongodb
