const mongoose = require("mongoose");

const url =
  "mongodb://sachin:nhibhulunga@ac-ncx62wu-shard-00-00.lpyxi1r.mongodb.net:27017,ac-ncx62wu-shard-00-01.lpyxi1r.mongodb.net:27017,ac-ncx62wu-shard-00-02.lpyxi1r.mongodb.net:27017/Hallbooking?ssl=true&replicaSet=atlas-7gy07g-shard-0&authSource=admin&retryWrites=true&w=majority";
module.exports.connect = () => {
  mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB is connected successfully"))
    .catch((err) => console.log("Error: ", err));
};
