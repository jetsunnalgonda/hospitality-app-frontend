class WebSocketService {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.heartbeatInterval = null;  // Interval for sending heartbeats
    this.heartbeatTimeout = 10000;  // 10 seconds
    this.listeners = {};  // Listeners for different message types
  }

  // Initialize WebSocket with userId
  initialize(userId) {
    if (this.ws) {
      console.log('Closing existing WebSocket connection');
      this.ws.close();  // Close the existing connection before creating a new one
    }
    this.createWebSocket(userId);
  }

  // Create a new WebSocket connection
  createWebSocket(userId) {
    console.log('Creating a new WebSocket connection with userId: ' + userId);
    this.ws = new WebSocket(`${process.env.VUE_APP_SOCKET_SERVER_URL}/?userId=${userId}`);

    this.ws.onopen = () => {
      console.log('WebSocket connection opened');
      this.reconnectAttempts = 0;  // Reset reconnect attempts on successful connection
      this.startHeartbeat();  // Start sending heartbeats
    };

    this.ws.onmessage = (event) => {
      console.log('WebSocket message received: ' + event.data);
      const parsedMessage = JSON.parse(event.data);
      this.handleMessage(parsedMessage);
    };

    this.ws.onclose = () => {
      console.log('WebSocket connection closed');
      this.stopHeartbeat();  // Stop sending heartbeats
      this.handleReconnect(userId);  // Attempt to reconnect
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.ws.close();  // Close connection on error
    };
  }

  // Send a heartbeat (ping) to keep the connection alive
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ action: 'ping' }));
        console.log('Sent heartbeat (ping) to server');
      }
    }, this.heartbeatTimeout);
  }

  // Stop sending heartbeats
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Handle reconnect attempts
  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting in ${this.reconnectDelay}ms... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.createWebSocket(userId), this.reconnectDelay);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  // Add listener for a specific message type
  addListener(messageType, callback) {
    if (!this.listeners[messageType]) {
      this.listeners[messageType] = [];
    }
    this.listeners[messageType].push(callback);
  }

  // Remove a listener for a specific message type
  removeListener(messageType, callback) {
    if (this.listeners[messageType]) {
      this.listeners[messageType] = this.listeners[messageType].filter(cb => cb !== callback);
    }
  }
  // Handle incoming messages and dispatch them to listeners
  // handleMessage(message) {
  //   const { action, data } = message;

  //   // Call all registered listeners for this message type
  //   if (this.listeners[action]) {
  //     this.listeners[action].forEach(callback => callback(data));
  //   } else {
  //     console.warn('No listeners for message type:', action);
  //   }
  // }

  // Handle incoming messages
  handleMessage(message) {
    const { action, data } = message;

    // Example: handling 'pong' message from server as a response to 'ping'
    if (action === 'pong') {
      console.log('Received pong from server');
      return;  // Ignore pong messages for other parts of the app
    }

    // Existing message handling
    if (this.listeners[action]) {
      this.listeners[action].forEach(callback => callback(data));
    } else {
      console.warn('No listeners for message type:', action);
    }
  }

  // Send a message through WebSocket with retry mechanism
  sendMessage(action, data, userId) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ action, data });
      this.ws.send(message);
      console.log('Sent WebSocket message:', message);
    } else {
      console.error('WebSocket connection is not open, attempting to reconnect...');
      this.handleReconnectAndResend(action, data, userId);
    }
  }

  // Reconnect and resend the message if connection was lost
  handleReconnectAndResend(action, data, userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting in ${this.reconnectDelay}ms... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => {
        this.createWebSocket(userId);
        if (this.ws.readyState === WebSocket.OPEN) {
          this.sendMessage(action, data,);  // Resend message after reconnection
        }
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnect attempts reached, message not sent');
    }
  }

}

// Singleton instance of the WebSocketService
const websocketService = new WebSocketService();
export default websocketService;
