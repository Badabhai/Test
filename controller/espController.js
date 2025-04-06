// const mqttClient = require('../utils/mqttClient');

// const setTemperature = async(req,res) => {

//     let responseReceived = false;

//     console.log("HELLO");
//     const sv=req?.body?.sv;
//     console.log("SV: ",sv);
//     mqttClient.subscribe('espheater/setsv/resp');
//     mqttClient.subscribe('espheater/setcontrol/resp');
//     mqttClient.publish('espheater/setsv',sv,(err)=>{    
//         if(err)
//         {
//             if(!responseReceived){
//                 res.status(500).json({message:"Failed to Send SV"});
//                 responseReceived = true;
//             }
//         }
//     });


//     const responseTimeout = setTimeout(()=>{
//         if(!responseReceived)
//         {
//             res.status(408).json({message:"No response received"})
//         }
//     },5000);

//     mqttClient.on('message',(topic,message)=>{
//         console.log("TOPIC ",topic," message ",message.toString());
//         // if(topic === "espheater/setsv/resp" && message.toString() === "SUCCESS")
//         // {
//         //     responseReceived = true;
//         //     clearTimeout(responseTimeout);
//         //     res.json({message:"SV SET SUCCESSFULLY"})
//         // }
//         if (topic === "espheater/setsv/resp") {
//             mqttClient.unsubscribe('espheater/setsv/resp');
//             if (!responseReceived) {
//               if (message.toString() === "SUCCESS") {
//                 res.status(200).json({
//                   message: "SV SET SUCCESSFULLY",
//                   set_temp: sv,
//                 });
//               } else {
//                 res.status(500).json({ message: "Failed to set SV on ESP32" });
//               }
//               responseReceived = true; // Ensure response is sent only once
//             }
//     }
// })
// };


// const setControl = async(req,res) => {
//     const control=req?.body?.control;
//     mqttClient.publish('espheater/setcontrol',control);

//     let responseReceived = false;

//     const responseTimeout = setTimeout(()=>{
//         if(!responseReceived)
//         {
//             res.status(408).json({message:"No response received"})
//         }
//     },5000);

//     mqttClient.on('message',(topic,message)=>{
//         if(topic === "espheater/setcontrol/resp" && message.toString() === "SUCCESS")
//         {
//             responseReceived = true;
//             clearTimeout(responseTimeout);
//             res.json({message:"SV SET SUCCESSFULLY"})
//         }
//     })
// };

// module.exports = {setTemperature,setControl};



const mqttClient = require('../utils/mqttClient');

const setTemperature = async (req, res) => {
  let responseReceived = false;
  const sv = req?.body?.sv;

  console.log("SV: ", sv);

  mqttClient.subscribe('espheater/setsv/resp', () => {
    mqttClient.publish('espheater/setsv', sv, (err) => {
      if (err && !responseReceived) {
        responseReceived = true;
        res.status(500).json({ message: "Failed to Send SV" });
      }
    });
  });

  const responseTimeout = setTimeout(() => {
    if (!responseReceived) {
      responseReceived = true;
      mqttClient.unsubscribe('espheater/setsv/resp');
      res.status(408).json({ message: "No response received" });
    }
  }, 5000);

  const messageHandler = (topic, message) => {
    if (topic === 'espheater/setsv/resp' && !responseReceived) {
      responseReceived = true;
      clearTimeout(responseTimeout);
      mqttClient.unsubscribe('espheater/setsv/resp');
      const msg = message.toString();

      if (msg === "SUCCESS") {
        res.status(200).json({
          message: "SV SET SUCCESSFULLY",
          set_temp: sv,
        });
      } else {
        res.status(500).json({ message: "Failed to set SV on ESP32" });
      }
    }
  };

  mqttClient.once('message', messageHandler);
};

const setControl = async (req, res) => {
  let responseReceived = false;
  const control = req?.body?.control;
  console.log("Control :",control);

  mqttClient.subscribe('espheater/setcontrol/resp', () => {
    mqttClient.publish('espheater/setcontrol', control);
  });

  const responseTimeout = setTimeout(() => {
    if (!responseReceived) {
      responseReceived = true;
      mqttClient.unsubscribe('espheater/setcontrol/resp');
      res.status(408).json({ message: "No response received" });
    }
  }, 5000);

  const messageHandler = (topic, message) => {
    if (topic === 'espheater/setcontrol/resp' && !responseReceived) {
      responseReceived = true;
      clearTimeout(responseTimeout);
      mqttClient.unsubscribe('espheater/setcontrol/resp');

      if (message.toString() === "SUCCESS") {
        res.json({ message: "CONTROL SET SUCCESSFULLY" });
      } else {
        res.status(500).json({ message: "Failed to set control" });
      }
    }
  };

  mqttClient.once('message', messageHandler);
};

module.exports = { setTemperature, setControl };
