# How to set up in Windows

1. Install the latest python 2.7. Installer here: https://www.python.org/downloads/

    * Make sure that you select "Add python.exe to Path" in the setup wizard.

2. Install CLANG for auto-completion features. Installer: http://releases.llvm.org/download.html

    * Make sure that you select “Add LLVM to the system PATH” option on the installation step.


3. Download Atom IDE and install (https://atom.io/)

4. Open Atom and install platformio-ide

    * Navigate to File->Settings->Install and search for: **platformio-ide**


5. Close Atom

6. Open a Powershell terminal as Administrator
    * Go to the windows menu
    * Search for powershell
    * Right click the powershell icon and select "run as Administrator"


7. Install Chocolatey package manager (https://chocolatey.org/install)

    * ``` iwr https://chocolatey.org/install.ps1 -UseBasicParsing | iex ```
    * ``` choco upgrade chocolatey ```


8. Install protocol buffer compiler (protoc)

    * ``` choco install protoc ```


9. Close powershell terminal and open Atom IDE again

10. Open a terminal in the Atom IDE and install pypi-package ioant by running
    * ``` pip install ioant ```


11. Done
