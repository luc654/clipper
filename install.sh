#!/bin/bash

echo ======================
echo Clipper install script
echo =====================


packExist () {
    if which "$1" >/dev/null 2>&1; then
        :
    else
        echo "Package $1 does not exist but is required. Please install $1 and relaunch this script"
        exit 0
    fi
}
packExist npm
packExist ollama


echo Install clipper in current path? Y/n

INSTALLPATH=""
PATHSELECT=false

read -u 0 pathOption
pathOption="${pathOption^^}"

while [ "$PATHSELECT" = false ]; do
    if [ -z "$pathOption" ] || [ "$pathOption" = "Y" ]; then 
        current_dir=$(pwd)
        INSTALLPATH="$current_dir"
    else
        echo "In what path do you want to install clipper?"
        read path
        INSTALLPATH="${path}"
    fi

    
    if [ -d "$INSTALLPATH" ]; then
        PATHSELECT=true
    else 
        echo "Directory doesnt exists."
    fi

done

echo
echo Installing in "${INSTALLPATH}"



cd "$INSTALLPATH"

git clone https://github.com/luc654/clipper

cd "clipper"

npm install