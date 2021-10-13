const mensajeService = require('../services/mensajes');

const mensaje = new mensajeService();

exports.createMensaje = async (req,res) => {
    await mensaje.createMensaje(req.body);
    res.json('Mensaje creado!');
};

exports.findAllMensajes = async (req, res,next) => {
    const allMensajes = await mensaje.getAllMensajes();
    res.json(allMensajes);
}