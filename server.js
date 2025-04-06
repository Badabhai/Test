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

const Report = require("./model/reportModel"); // adjust path if needed

const mongoose = require('mongoose');

const mongoURI = `mongodb://TEST:NEW123@ac-chpud5a-shard-00-00.iklecha.mongodb.net:27017,ac-chpud5a-shard-00-01.iklecha.mongodb.net:27017,ac-chpud5a-shard-00-02.iklecha.mongodb.net:27017/?replicaSet=atlas-escpt4-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const password = encodeURIComponent("EspHeater@1");
// // const uri = `mongodb://TEST:NEW123@ac-chpud5a-shard-00-00.iklecha.mongodb.net:27017,ac-chpud5a-shard-00-01.iklecha.mongodb.net:27017,ac-chpud5a-shard-00-02.iklecha.mongodb.net:27017/?replicaSet=atlas-escpt4-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority&appName=Cluster0`;
// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
// EspHeater@1

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


mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('connected', () => {
  console.log('✅ MongoDB connected');
});

db.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});


mqttClient.subscribe('espheater/livedata');
mqttClient.on('message',async(topic,message)=>{
  if(topic === 'espheater/livedata')
  {
    console.log(message.toString());
    try {
      const parsedData = JSON.parse(message.toString());
      console.log("After Parse: ",parsedData);
      io.emit("livedata",parsedData);

      // Save to MongoDB
      const newEntry = new Report({
        dateTime: new Date(),
        PV: parsedData?.pv,
        SV: parsedData?.sv,
        Pressure: parsedData?.pressure,
        Weight: parsedData?.weight,
        // dateTime will be set automatically
      });

      await newEntry.save();

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
