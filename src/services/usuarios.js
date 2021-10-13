const  usuarioModel = require('../dao/models/usuarios');

module.exports = class {

    async createusuario(usuario){
        await usuarioModel.create(usuario);
    }

    async getusuario(id){
        return usuarioModel.findById(id);
    }

    async getAllusuarios(){
        return usuarioModel.find().lean();
    }

    async updateusuario(id, usuarioUpdate){
        const usuarioToUpdate = await usuarioModel.findByIdAndUpdate(id, usuarioUpdate, {
            new: true,
        });
        return usuarioToUpdate;
    }

    async deleteusuario(id){
        await usuarioModel.findByIdAndDelete(id);
    }
}