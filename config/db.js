const mongoose = require('mongoose');
const config = require('config');
const dbURI = config.get('mongoURI');

const connectDb = async () => {

    try{
        await mongoose.connect(dbURI, 
            {
                useNewUrlParser: true, 
                useUnifiedTopology: true,
                useCreateIndex: true,
                useFindAndModify: false
             });
        console.log('Connected to Database');
    } 
    catch(err){
        console.log(err.message);
        process.exit(1);
    }
}

module.exports = connectDb;