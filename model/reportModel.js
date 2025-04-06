const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  dateTime: Date,
  PV: Number,
  SV: Number,
  Pressure: Number,
  Weight: Number
});

module.exports = mongoose.model('Report', reportSchema);