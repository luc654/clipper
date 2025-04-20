const socket = new WebSocket(`ws://${ip.split(":")[0]}:8080`); 

  socket.onopen = () => {
    console.log('Connected to WebSocket server!');
    socket.send('Hi from the frontend!');
  };

  socket.onmessage = (event) => {
    if(event.data == "<Start>"){
        addMessageBot("");
    }  else if (event.data == "<Stop>"){
    } else {
        appendMessage(event.data);

    }
  };

  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};
