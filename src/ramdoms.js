const ramdom = (cant) => {
    let resultado = [];
    for(let i=0; i<cant; i++) {      
       resultado.push((Math.floor(Math.random()*1000)))
    }

    return resultado
}

process.on('message', cant => {
    const resultado = ramdom(cant);
    process.send(resultado);
})