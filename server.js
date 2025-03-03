const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
// app.use(express.static(path.join(__dirname, 'Frontend/Sensewell_SBC/dist')));

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

// Routes
const deviceRoute = require('./routes/DeviceRoute')();
app.use('/api', deviceRoute);

app.listen(PORT, () => {
  console.log(`✅ Server running on http://${getIPAddress()}:${PORT}`);
});
