const ipfsAPI = require('ipfs-api');

//const ipfsAPI = require('./../lib/ipfs');
//var ipfsAPI = require('https://unpkg.com/ipfs-api@9.0.0/dist/index.js');

const fs = require('fs');

module.exports = {
    upload: async (req, res) => {

        let buf = req.body.buffer.data;

        var myBuffer = new Buffer(buf.length);
        for (var i = 0; i < buf.length; i++) {
            myBuffer[i] = buf[i];
        }

        var ipfs = ipfsAPI('/ip4/127.0.0.1/tcp/5001');
        
        addToIPFS();

        function addToIPFS(){
            ipfs.files.add([new Buffer(myBuffer)]).then((result) => {
                // do something with res
                //console.log(result);

                res.status(200);
                res.send(result[0].path);
                res.end();
                }).catch((err) => { 
                    /* handle err */ 
                    console.log(err);
                })
        }
    }
}