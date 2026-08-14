const mongoose = require("mongoose");
const { mongodbUri } = require("./env");

async function conectarMongo() {
  if (!mongodbUri) {
    throw new Error("MONGODB_URI nao configurado - defina no .env pra usar DATA_SOURCE=mongo");
  }
  await mongoose.connect(mongodbUri, {
    serverSelectionTimeoutMS: 15000,
  });
}

module.exports = { conectarMongo };
