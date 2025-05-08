const socket = new WebSocket(`ws://${ip.split(":")[0]}:8080`); 

  socket.onopen = () => {
    console.log('Connected to WebSocket server!');
  };

  socket.onmessage = (event) => {
    const message = event.data;
    console.log(message);
  
    switch (message) {
      case "<Start>":
      case "<Refresh>":
        addMessageBot("");
        break;
  
      case "<Stop>":
        break;
  
      case "<NUKE>":
        nukeChat();
        break;
  
      default:
        appendMessage(message);
        break;
    }
  };
  
  socket.onclose = () => {
    console.log('Disconnected from WebSocket server');
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};
