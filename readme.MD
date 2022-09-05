# Hens World

 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
 
## Dev Setup
### 1 - Install dependencies
```bash
    npm install
```

### 2 - HTTPS certification
Download the latest version of mkcert here:

https://github.com/FiloSottile/mkcert/tags (mkcert-v1.X.X-windows-amd64.exe)
Move the .exe file to where you want to store your cert files, and rename it to `mkcert.exe`, to make it easier to type commands.
```bash
# Install the Root CA, for Windows Certification Store, Chrome & Safari
./mkcert.exe -install     
# Create the Certification for localhost
./mkcert.exe localhost
```

### 3 - Launch Dev
```bash
    npm start
    # if you need to specify a custom location for your certs, you can use the env param CERT_ROOT
    CERT_ROOT="path/to/certs/folder/" npm start
```


### 4 - Publish version
```bash
    # create a folder with the current version and build files inside it
    npm run release
    # generate the index.html file with the current package.json version to target the newly created folder
    # this is to get the least amount of time with an invalid file configuration for users
    npm run deploy
```

# TODO
There is no staging server available for Hens right now to help you test features. You could edit the configuration to point to the live servers ... but please don't ?
