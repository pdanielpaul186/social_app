const mongoConn = require('../config/mongo');

let createCollection = function(collection){
    return new Promise((resolve,reject)=>{
        mongoConn.createCollection(collection,(err,data)=>{
            if(err){
                return reject(err);
            }
            else{
                //console.log(data)
                let stmt="Collection created with name "+ collection;
                return resolve(stmt);
            }
        })
    })
}

let insertProfile = function(){
    return new Promise((reject,resolve)=>{
        mongoConn.collection("Profiles").insertOne(data,(err,msg)=>{
            if(err){
                return reject(err);
            }
            else{
                let stmt = "Document sucessfully inserted in the collection";
                return resolve(stmt);
            }
        })
    })
}

let findSugg = function(collection,data){
    return new Promise((reject,resolve)=>{
        mongoConn.collection("Profiles").aggregate([{$match:{ $in: [{Geolocation: data.Geolocation},{$in:[{name: data.name}]}]}}]).toArray((err,msg)=>{
            if(err){
                return reject(err);
            }
            else{
                
                return resolve(msg); 
            }
        })
    })
}

let findDocument = function(collection,data){
    return new Promise((reject,resolve)=>{
        mongoConn.collection(collection).find(data,(err,msg)=>{
            if(err){
                return reject(err);
            }
            else{
                let stmt = "Documents sucessfully retrieved from the collection "+collection;
                return resolve(msg); 
            }
        })
    })
}

let updateDocument = function(collection,data){
    return new Promise((reject,resolve)=>{
        mongoConn.collection(collection).findOneAndUpdate(data,(err,msg)=>{
            if(err){
                return reject(err);
            }
            else{
                let stmt = "Documents sucessfully updated from the collection "+collection;
                return resolve(stmt); 
            }
        })
    })
}

module.exports={
    createCollection : createCollection,
    insertProfile : insertProfile,
    findSugg : findSugg,
    findDocument : findDocument,
    updateDocument : updateDocument
}