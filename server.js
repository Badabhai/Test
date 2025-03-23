const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const path = require('path');
const os = require('os');
const mqttClient = require('./utils/mqttClient');

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: "*", // Allow all origins or specify your frontend URL
    methods: ["GET", "POST"]
  }}
);
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const deviceRoute = require('./routes/DeviceRoute');
app.use('/api', deviceRoute);

// app.use(express.static(path.join(__dirname, 'Frontend/Sensewell_SBC/dist')));
app.use(express.static(path.join(__dirname, 'dist')));

// Function to get server IP
function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const name in interfaces) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '0.0.0.0';
}
mqttClient.subscribe('espheater/livedata');
mqttClient.on('message',(topic,message)=>{
  if(topic === 'espheater/livedata')
  {
    console.log(message.toString());
    try {
      const parsedData = JSON.parse(message.toString());
      console.log("After Parse: ",parsedData);
      io.emit("livedata",parsedData);
    } catch (error) {
      console.log("Error : ",error);
    }
  }
})



io.on('connection',(socket)=>{
  console.log("New Device : ",socket.id);
  
})


server.listen(PORT, () => {
  console.log(`✅ Server running on http://${getIPAddress()}:${PORT}`);
});
