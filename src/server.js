const express = require("express");
var exphbs = require('express-handlebars');

const app = express();
const router = express.Router();
const { MONGO_URI, TIEMPO_EXPIRACION } = require('./config/globals');
const { getConnection } = require('./dao/db/connection');
const routes = require("./routes/routes");

const session = require("express-session");
const cookieParser = require("cookie-parser");

const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);

const ProductoService = require("./services/producto");
const MensajeService = require("./services/mensajes");
const { Mongoose } = require("mongoose");
const MongoStore = require('connect-mongo');

/* -------------- OBJECT PROCESS ----------- */

const PORT = process.argv[2] ?? process.env.PORT;
const FACEBOOK_APP_ID = process.argv[3] ?? process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET =  process.argv[4] ?? process.env.FACEBOOK_APP_SECRET;
const SERVER_MODE =  process.argv[5] ?? 'fork';

const cluster = require('cluster');
const numCpus = require('os').cpus().length;

if(SERVER_MODE === 'cluster' && cluster.isMaster){
  console.log(`PID MASTER ${process.pid}`);
  console.log(numCpus);
  for(let i=0; i<numCpus; i++){
    cluster.fork();
  }

  cluster.on('exit', worker => {
    console.log('Worker', worker.process.pid, 'died', new Date().toLocaleString());
    cluster.fork();
  });
} else {
  //console.log(parseInt(process.argv[2]))
  const PORT = parseInt(process.argv[2]) || 8080

  app.get('/', (req,res) => {
      res.send(`Servidor express en ${PORT} - <b>PID ${process.pid}</b> - ${new Date().toLocaleString()}`)
  })

  app.listen(PORT, err => {
      if(!err) console.log(`Servidor express escuchando en el puerto ${PORT} - PID WORKER ${process.pid}`)
  })
}

//console.log('Proceso N°: ', process.pid);

/* -------------- PASSPORT ----------------- */
const passport = require('passport');
const bCrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./dao/models/usuarios');

passport.use(new FacebookStrategy({
  clientID: FACEBOOK_APP_ID,
  clientSecret: FACEBOOK_APP_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'photos', 'emails']
},
  function (accessToken, refreshToken, profile, done) {

    User.findOne({
      'facebookId': profile.id
    }, (err, user) => {
      if (err) {
        return done(err);
      }

      if (!user) {
        user = new User({
          facebookId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          picture: profile.photos[0].value,
          provider: 'facebook'
        });
        user.save((err) => {
          if (err) console.log(err);
          return done(err, user);
        });
      } else {
        return done(err, user);
      }
    });
  }
));

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook',{
    successRedirect: '/home',
    failureRedirect: '/faillogin'
  }));

passport.use('login', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    // check in mongo if a user with username exists or not
    User.findOne({ 'username' :  username },
      function(err, user) {
        // In case of any error, return using the done method
        if (err)
          return done(err);
        // Username does not exist, log error & redirect back
        if (!user){
          console.log('User Not Found with username '+username);
          console.log('message', 'User Not found.');
          return done(null, false)
        }
        // User exists but wrong password, log the error
        if (!isValidPassword(user, password)){
          console.log('Invalid Password');
          console.log('message', 'Invalid Password');
          return done(null, false) 
        }
        // User and password both match, return user from
        // done method which will be treated like success
        return done(null, user);
      }
    );
  })
);

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

passport.use('register', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    const findOrCreateUser = function(){
      // find a user in Mongo with provided username
      User.findOne({'username':username},function(err, user) {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          console.log('message','User Already Exists');
          return done(null, false)
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new User();
          // set the user's local credentials
          newUser.username = username;
          newUser.password = createHash(password);

          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);
              throw err;
            }
            console.log('User Registration succesful');
            return done(null, newUser);
          });
        }
      });
    }
    // Delay the execution of findOrCreateUser and execute
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  })
)
  // Generates hash using bCrypt
var createHash = function(password){
  return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
/* ----------------------------------------- */

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use("/public", express.static("./src/public"));
app.use(routes(router));

app.engine('handlebars', exphbs());
app.set("views", "./src/views");
app.set('view engine', 'handlebars');

app.use(
  session({
    store: MongoStore.create({
      mongoUrl: MONGO_URI,
      mongoOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    }),
    secret: process.env.SECRET_KEY,
  cookie: {
   httpOnly: false,
   secure: false,
   maxAge: 20000
 },
 rolling: true,
 resave: true,
 saveUninitialized: false
}));

app.use(cookieParser());
app.use(express.json());

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// ------------------------------------------------------------------------------
//  ROUTING GET POST
// ------------------------------------------------------------------------------

app.get('/home', async (req,res) => {
  if(req.isAuthenticated()){
    productoService = new ProductoService();
    let productos = await productoService.getAllProductos();
      res.render("home", {
          nombre: req.user.username,
          productos: productos
      })
  }
  else {
      res.sendFile(process.cwd() + '/')
  }
})

app.post('/login', passport.authenticate('login', { failureRedirect: '/faillogin' }), (req,res) => {
  res.redirect('/home')
});

app.get('/faillogin', (req,res) => {
  res.render('login-error', {});
})

app.post('/register', passport.authenticate('register', { failureRedirect: '/failregister' }), (req,res) => {
  res.redirect('/')
});

app.get('/failregister', (req,res) => {
  res.render('register-error', {});
});

app.get('/logout', (req,res) => {
  let nombre = req.user.username
  req.logout()
  res.render("logout", { nombre })
});


// ------------------------------------------------------------------------------
//  socket io
// ------------------------------------------------------------------------------

io.on('connection', async (socket) => {
  productoService = new ProductoService();
  mensajeService = new MensajeService();
  let productosWs = await productoService.getAllProductos();
  let mensajes = await mensajeService.getAllMensajes();

  socket.emit('mensajes', { mensajes: await mensajeService.getAllMensajes() })

  socket.on('nuevo-mensaje', async (nuevoMensaje) => {
    const { author, message } = nuevoMensaje;
    const elNuevoMensaje = {
      author,
      message,
    }

    await mensajeService.createMensaje(elNuevoMensaje);

    io.sockets.emit('recibir nuevoMensaje', [elNuevoMensaje])
  })

  io.sockets.emit('productos', await productoService.getAllProductos() );

  socket.on('producto-nuevo', async data => {
    await productoService.createProducto(data);
  })

});

getConnection().then(() =>
  server.listen(PORT, () => console.log("server's up", PORT))
);