module.exports = () => {
    const express = require('express');
    const router = express.Router();

    const sendHello = async(req,res) => {
        return res.status(201).json({ message: 'Hello'});
    }


    router.get('/hello',sendHello);

    return router;
};


// const express = require('express');
// const router = express.Router();

// module.exports = () => {
//   router.get('/test', (req, res) => {
//     res.json({ message: 'API Working!' });
//   });

//   return router;
// };
