const { Schema, model } = require('mongoose');
const findOrCreate = require('mongoose-findorcreate');

// Estructura del documento en MongoDB a través de Mongoose
const usuarioSchema = new Schema({
    username: String,
    password: String,
    email: String,
    firstName: String,
    lastName: String,
    facebookId: String,
    name: String,
    picture: Object,
    email: String,
    provider: String
})

// Obj. de la clase que me da acceso a los métodos para hacer el CRUD.
module.exports = model('Usuario', usuarioSchema);