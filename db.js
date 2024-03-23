const mongoose = require('mongoose');

let dbConnection;

module.exports = {
  connectToDb: (cb) => {
    mongoose.connect('mongodb+srv://vishalekka18:Edward123@cluster0.ezcpyyy.mongodb.net/svr_atk?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => {
        dbConnection = mongoose.connection;
        return cb(null); // Pass null when there's no error
      })
      .catch((err) => {
        console.error(err); // Log the error
        return cb(err); // Pass the error to the callback
      });
  },
  getDb: () => dbConnection,
};
