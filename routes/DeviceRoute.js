const express = require('express');
const router = express.Router();
const { setTemperature,setControl } = require('../controller/espController')

// router.get('/data',sendAllData);

router.post('/setSV',setTemperature);
router.post('/control',setControl);

module.exports = () => router;