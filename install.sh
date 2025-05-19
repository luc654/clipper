#!/bin/bash

echo ======================
echo Clipper install script
echo =====================
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



