const mqttClient = require('../utils/mqttClient');

const setTemperature = async(req,res) => {

    let responseReceived = false;

    console.log("HELLO");
    const sv=req?.body?.sv;
    console.log("SV: ",sv);
    mqttClient.subscribe('espheater/setsv/resp');
    mqttClient.publish('espheater/setsv',sv,(err)=>{    
        if(err)
        {
            if(!responseReceived){
                res.status(500).json({message:"Failed to Send SV"});
                responseReceived = true;
            }
        }
    });


    const responseTimeout = setTimeout(()=>{
        if(!responseReceived)
        {
            res.status(408).json({message:"No response received"})
        }
    },5000);

    mqttClient.on('message',(topic,message)=>{
        console.log("TOPIC ",topic," message ",message.toString());
        // if(topic === "espheater/setsv/resp" && message.toString() === "SUCCESS")
        // {
        //     responseReceived = true;
        //     clearTimeout(responseTimeout);
        //     res.json({message:"SV SET SUCCESSFULLY"})
        // }
        if (topic === "espheater/setsv/resp") {
            mqttClient.unsubscribe('espheater/setsv/resp');
            if (!responseReceived) {
              if (message.toString() === "SUCCESS") {
                res.status(200).json({
                  message: "SV SET SUCCESSFULLY",
                  set_temp: sv,
                });
              } else {
                res.status(500).json({ message: "Failed to set SV on ESP32" });
              }
              responseReceived = true; // Ensure response is sent only once
            }
    }
})
};


const setControl = async(req,res) => {
    const sv=req?.body?.sv;
    mqttClient.publish('espheater/setsv',sv);

    let responseReceived = false;

    const responseTimeout = setTimeout(()=>{
        if(!responseReceived)
        {
            res.status(408).json({message:"No response received"})
        }
    },5000);

    mqttClient.on('message',(topic,message)=>{
        if(topic === "espheater/setsv/resp" && message.toString() === "SUCCESS")
        {
            responseReceived = true;
            clearTimeout(responseTimeout);
            res.json({message:"SV SET SUCCESSFULLY"})
        }
    })
};

module.exports = {setTemperature,setControl};