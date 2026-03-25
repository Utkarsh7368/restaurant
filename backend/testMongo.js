const mongoose = require('mongoose');

const uri = "mongodb+srv://devutkarshg_db_user:xD7toW4SzCFY6D2R@restaurant.jukgcqd.mongodb.net/?appName=restaurant";

mongoose.connect(uri)
  .then(() => {
    console.log("SUCCESSFULLY CONNECTED TO MONGO");
    process.exit(0);
  })
  .catch(err => {
    console.error("MONGO CONNECTION FAILED:", err);
    process.exit(1);
  });
