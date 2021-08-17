// MongoDB connection File

const mongoose = require('mongoose');

const url = 'mongodb://localhost:27017/social_app' //can be changed if it has any other connections
const req = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
}

mongoose.connect(url,req,(err,connection)=>{
    if(err){
        console.log("error ocurred while connecting the database!!!");
        console.log(err)
    }
    else{
        let check_response = {
            creatingNewCollection : "Successfull",
            insertingData : "Successfull",
            checkedAt : new Date()
        }
        
        mongoose.connection.collection("Checks").insertOne(check_response,(err,data)=>{
            if(err){
                console.log("MongoDb checks Failed!!! Try to reconnect");
                console.log(err)
            }
            else{
                mongoose.connection.collection("profiles").createIndex({location : "2dsphere"},(err,data)=>{
                    if(err){
                        console.log("MongoDb checks Failed!!! Try to reconnect");
                        console.log(err)
                    }
                    else{
                        console.log("MongoDb checks complete!!!! \n Proceed with the API calls!!!");
                    }
                })
            }
        })
    }
})

module.exports = mongoose.connection;