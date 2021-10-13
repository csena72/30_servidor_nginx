const productoService = require('../services/producto');

const producto = new productoService();

exports.createProducto = async (req,res) => {
    await producto.createProducto(req.body);
    res.json('Producto creado!');
};

exports.findAllProductos = async (req, res,next) => {
    const allProductos = await producto.getAllProductos();
    res.json(allProductos);
}

exports.updateProducto = async (req, res,next) => {
    const { body, params: { id } } = req;
    const updateProducto = await producto.updateProducto(id, body);
    res.json(updateProducto);
}

exports.getOneProducto = async (req, res,next) => {
    const {
        body,
        params: { id }
    } = req;
    const productoRetriever = await producto.getProducto(id);
    res.json(productoRetriever);
}

exports.deleteProducto = async (req, res,next) => {
    const {
        body,
        params: { id }
    } = req;
    await producto.deleteProducto(id);
    res.json({msg: 'Ok'});
}