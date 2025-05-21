#!/bin/bash

gitLink=https://github.com/luc654/clipper

echo ======================
echo Clipper install script
echo =====================
set_var() {
  local var_decl="$1"
  local new_value="$2"
  local file="$3"

  local escaped_var_decl
  escaped_var_decl=$(printf '%s' "$var_decl" | sed 's/[][\.*^$(){}?+|/]/\\&/g')

  sed -i.bak -E "s/^($escaped_var_decl[[:space:]]*=[[:space:]]*).*/\1$new_value;/" "$file"
}

explain_var() {
  local var_decl="$1"
  local def_value="$2"
  local info="$3"
  local type="$4"
  local file="$5"

  local new_value="$def_value"

    echo
    echo "$var_decl"
    echo
    echo -e "$info"
    echo "$var_decl, Default: [$def_value]. Set new $type (leave blank to use default):"

  read new_input

  if [ -n "$new_input" ]; then
    if [ "$type" == "String" ]; then

    new_value="\"$new_input\""
    else 

    new_value="$new_input"
    fi
  fi

  set_var "$var_decl" "$new_value" "$file"
}

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


echo Install clipper in current path? [Y/n]

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

echo -ne '#####                     (33%) | Cloning git repo \r'
git clone "$gitLink" >/dev/null 2>&1
echo -ne '#############             (45%) | Installing node packages\r'
cd "clipper"
npm install >/dev/null 2>&1
echo -ne '#############             (76%) | Updating Files              \r'

# Set secret thing ip
ip=$(ifconfig | grep "inet" | grep "bro" | awk '{print $2}')

if [ -n "$ip" ]; then

touch secret.js
echo IPADDRESS = \`"$ip":3000\` >> secret.js

rm index.mjs.bak >/dev/null 2>&1
rm secret-example.js >/dev/null 2>&1
echo -ne '#######################   (100%)'
else 
echo -ne '#######################   (100%)'
echo Minor accident, failed to update secret-example.js.
echo Please follow the instructions in the file itself once the setup is over.
fi

echo 
echo 
echo Edit some variables? [Y/n]


read -u 0 editVars
editVars="${editVars^^}"

if [ -n "$editVars" ] && [ "$editVars" != "Y" ]; then
    echo Cleaning up final things...
    sleep 1
    echo All done!
    sleep 0.5
    echo Dont forget to check https://github.com/luc654/clipper/README.md for extra info!
    
    exit 0
fi


explain_var "const maxConnect" "1" \
  "Determines how many clients can be connected to the websocket at the same time.\nShuts down automatically if number is exceeded." \
  "int" \
  "index.mjs"


explain_var "let userName" "You" \
  "The name you want to be called." \
  "String" \
  "index.mjs"




explain_var "let assistantName" "Assistant" \
  "The name you want the assistant to be called." \
  "String" \
  "index.mjs"



explain_var "let debug" "true" \
  "Shows extra information in the host's terminal." \
  "Bool" \
  "index.mjs"




echo -ne 'Cleaning up final things\r'
sleep .4
echo -ne 'Cleaning up final things.\r'
sleep .4
echo -ne 'Cleaning up final things..\r'
sleep .4
echo -ne 'Cleaning up final things...'
sleep .4
echo All done!
sleep 1
echo Dont forget to check https://github.com/luc654/clipper/README.md for extra info!

exit 0