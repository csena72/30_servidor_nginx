var socket = io();
socket.on('productos', data => {
    
    productosWs = JSON.stringify(data);            
});

function enviarProducto(event){  
             
    let producto = {
        title: document.getElementById("title").value, 
        price: document.getElementById("price").value, 
        thumbnail: document.getElementById("thumbnail").value
    }
    socket.emit('producto-nuevo', producto);    
}

var template = Handlebars.compile(`
    {{# each mensajes }}
        <p class="text-muted m-0">
                <span class="font-weight-bold text-primary">{{ this.email }}</span>
                <span style="color:brown;">[{{this.hora}}]</span>
                <span class="font-italic text-success">{{ this.mensaje }}</span>
        </p>               
    {{/each}}            
`)

function addAllMessages(data) {            
    document.getElementById('mensajes').innerHTML = template({ mensajes: data.mensajes});
}

function addNewMessage(listaMensajes) {            
    document.getElementById("mensajes").innerHTML +=  template({ mensajes: listaMensajes });
}

function enviarMensaje() {
    let hora = moment().format('DD/MM/YYYY HH:mm:ss');
    let mensaje = document.getElementById('mensaje').value;
    let email = document.getElementById('email').value;
    if (email.length > 1) {
        socket.emit('nuevo-mensaje', {
            email: email,
            hora: hora,
            mensaje: mensaje
        })
    } else {
        alert('Debe ingresar un email')
    }
}

socket.on(`mensajes`, function(data) {                       
    addAllMessages(data)
})

socket.on('recibir nuevoMensaje', function(listaMensajes) {                                 
    addNewMessage(listaMensajes)
})