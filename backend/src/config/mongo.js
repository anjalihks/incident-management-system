const mongoose = require('mongoose');

async function connectMongo() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/ims');

    console.log('🍃 MongoDB Connected');
  } catch (err) {
    console.error('Mongo Error:', err);
  }
}

module.exports = connectMongo;