const mongoose = require('mongoose')
mongoose.set('strictQuery', true);

const db = "mongodb://127.0.0.1/dhtDB";
mongoose.connect(db, {useNewUrlParser: true, useUnifiedTopology: true});

const recordSchema = new mongoose.Schema({
    humid : {
        type : String,
        required : true 
    },
    temp : {
        type : String,
        required : true
    },
    discom : {
        type : String,
        required : true
    },
    level : {
        type : String,
        required : true
    },
    date : {
        type : Date,
        default : Date.now
    },
    versionKey : false
})

module.exports = mongoose.model('Record', recordSchema);
