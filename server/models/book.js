const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bookSchema = new Schema({
  name: String,
  genre: String,
  authorId: String
});

// Model is a piece of database, which uses a schema as data pattern.
module.exports = mongoose.model('Book', bookSchema)