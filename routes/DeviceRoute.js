// module.exports = () => {
//     const express = require('express');
//     const router = express.Router();

//     const sendHello = async(req,res) => {
//         console.log(req.ip);
//         return res.status(201).json({ message: 'Hello'});
//     }


//     router.get('/hello',sendHello);

//     return router;
// };


// const express = require('express');
// const router = express.Router();

// module.exports = () => {
//   router.get('/test', (req, res) => {
//     res.json({ message: 'API Working!' });
//   });

//   return router;
// };

const express = require('express');
const router = express.Router();
let espIPs = new Map();

router.get('/register', (req, res) => {
    const clientIP = req.ip || req.headers['x-forwarded-for'];
    console.log("ESP32 Registered IP:", clientIP);
    espIPs.set(clientIP, { status: 'online' });
    res.status(200).json({ message: "ESP Registered", clientIP });
});

router.get('/control-led', (req, res) => {
    const clientIP = req.query.ip;
    const action = req.query.action; // on or off

    if (espIPs.has(clientIP)) {
        const url = `http://${clientIP}/led?action=${action}`;
        axios.get(url).then(response => {
            res.json({ message: `LED ${action}`, response: response.data });
        }).catch(() => {
            res.status(500).json({ message: "ESP32 Unreachable" });
        });
    } else {
        res.status(404).json({ message: "Device Not Registered" });
    }
});

module.exports = () => router;
