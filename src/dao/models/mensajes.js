const { Schema, model } = require('mongoose');

// Estructura del documento en MongoDB a través de Mongoose
const mensajeSchema = new Schema({
    id: String,
    author: {
      id: String,
      nombre: String,
      apellido: String,
      edad: Number,
      alias: String,
      avatar: String,
    },
    date: String,
    message: String,
  });

// Obj. de la clase que me da acceso a los métodos para hacer el CRUD.
module.exports = model('Mensaje', mensajeSchema);