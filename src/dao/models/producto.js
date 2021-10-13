const { Schema, model } = require('mongoose');

// Estructura del documento en MongoDB a través de Mongoose
const productoSchema = new Schema({
    title: String,
    price: Number,
    thumbnail: String,        
})

// Obj. de la clase que me da acceso a los métodos para hacer el CRUD.
module.exports = model('Producto', productoSchema);