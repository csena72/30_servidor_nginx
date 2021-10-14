const loginController = require('../controllers/login');
const registerController = require('../controllers/register');
const productoController = require('../controllers/producto');
const mensajeController = require('../controllers/mensaje');
const infoController = require('../controllers/info');

module.exports = (router) => {

    router

    .get('/info', infoController.infoRender)
    .get('/randoms', infoController.randoms)
    .get('/', loginController.loginRender)
    .get('/register', registerController.registerRender)

    .post('/api/productos', productoController.createProducto)
    .get('/api/productos', productoController.findAllProductos)
    .get('/api/productos/:id', productoController.getOneProducto)
    .patch('/api/productos/:id', productoController.updateProducto)
    .delete('/api/productos/:id', productoController.deleteProducto)

    .post('/api/mensajes', mensajeController.createMensaje)
    .get('/api/mensajes', mensajeController.findAllMensajes)

    return router;
}