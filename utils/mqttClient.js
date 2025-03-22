const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io'); // Use your broker URL

client.on('connect', () => {
  console.log('MQTT Connected');
});

module.exports = client;
