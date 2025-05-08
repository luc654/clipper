function setSession(name, value){
    if(name && value){
        sessionStorage.setItem(name, value);
        return true;
    } else {
        console.error(`Failed to store. Expected string name, string value, got name: '${name}' value: '${value}'`)
        return false;
    }
}

function getSession(name){
    if(name){
        const data = sessionStorage.getItem(name);
        return data;
    } else{
        console.error(`Failed to retrieve value from session. Expected string name, got name: '${name}'`);
    }
}