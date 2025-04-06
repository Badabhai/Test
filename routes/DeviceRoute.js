const express = require('express');
const router = express.Router();
const { setTemperature,setControl } = require('../controller/espController')
const Report = require('../model/reportModel');

// router.get('/data',sendAllData);

router.post('/setSV',setTemperature);
router.post('/control',setControl);

router.get('/getreportdata', async (req, res) => {
    try {
      const { min,max } = req?.headers;
      const reportData = await Report.find().sort({ dateTime: -1 }).skip(min).limit(max); // recent 100 entries
      const dataCount = await Report.countDocuments();
      res.json({reportData,dataCount});
    } catch (err) {
      console.error("Report fetch error:", err);
      res.status(500).json({ error: "Failed to fetch report data" });
    }
  });
  

module.exports = router;