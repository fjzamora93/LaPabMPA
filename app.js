const mongoose = require('mongoose');
const errorController = require('./controllers/error');
const User = require('./models/user');
const pdfRoutes = require('./routes/pdf');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const imgur = require('imgur');
const express = require('express');
require('dotenv').config();




//MANEJO DE SESIONES (express-session + MongoDBsTORE + csrf + flash)
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

//! MANEJO DEL FRONTEND
const cookieParser = require('cookie-parser');


const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${
  process.env.MONGO_PASSWORD
}@rolgamesandstone.tqgnl5u.mongodb.net/bakery_app?retryWrites=true&w=majority&appName=RolgameSandstone`;



const app = express();
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
});

//! Usa { cookie: true } si estás utilizando cookies para las sesiones
const csrfProtection = csrf({ cookie: true }); 

//Determinamos el tipo de almacenamiento de archivos con MULTER. En este caso se guardarán en 'images' y el nombre del archivo será la fecha y el nombre original
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'images');  // Aquí se especifica el directorio donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
});

//Determinamos el tipo de archivo que se puede subir
const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg' ||
      file.mimetype === 'application/pdf'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };


//GESTOR DE VISTAS
app.set('view engine', 'ejs')
app.set('views', 'views');


//IMPORTACIÓN DE LAS RUTAS
const adminRoutes = require('./routes/admin')
const recipeRoutes = require('./routes/user')
const authRoutes = require('./routes/auth');


//ORDEN 1: Middleware para parsear el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//! Middleware para conectar con Angular (CORS)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.setHeader(
        'Access-Control-Allow-Methods', 
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200'); // Permite solo el origen especificado
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-CSRF-Token');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // Permite el uso de cookies y credenciales
    next();
});


// ISAUTHENTICATED DEBE IR ANTES DE QUE ENTRE EN JUEGO MULTER PARA EVITAR ERRORES
app.use((error, req, res, next) => {
    // res.status(error.httpStatusCode).render(...);
    // res.redirect('/500');
    res.status(500).render('500', {
      pageTitle: 'Error!',
      path: '/500',
      isAuthenticated: req.session.isLoggedIn
    });
  });


//Middleware para subir archivos
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
  );

//Middleware para servir archivos estáticos (CSS, JS, IMÁGENES)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));



//PASO 1: CONFIGURACIÓN DEL MIDDLEWARE DE SESIÓN
app.use(
    session({
      secret: 'my secret',
      resave: false,
      saveUninitialized: false,
      store: store,

      cookie: {   //! MANEJO DEL FRONTEND
        secure: false, // Cambia a true si usas HTTPS
        httpOnly: true, //evita que el token sea accesible desde el frontend
        sameSite: 'None' // Permite el envío de cookies en solicitudes entre dominios
    }
    })
  );
  app.use(csrfProtection); 
  app.use(flash());

  //! DEPURACIÓN  DEL FRONTEND
  app.use((req, res, next) => {
    console.log('Received request:', req.method, req.path);
    next();
  });


// Paso 2: Devolver al usuario autenticado en nuestro req (si no lo está, se aplica el next)
app.use(async (req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    
    try {
      const user = await User.findById(req.session.user._id);
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    } catch (err) {
      next(new Error(err));
    }
  });
  
  // Paso 3: Establecemos variables locales que podrán ser accesibles desde las vistas
  app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.user = req.user; // Asegúrate de que solo se incluya la información necesaria y no sensible
    //Este es el token que le pasamos a las vistas -por eso se guarda en local.
    res.locals.csrfToken = req.csrfToken();
    console.log("CSRF TOKEN DESDE EL BACKEND PASO 3", res.locals.csrfToken);
    next();
  });

//RUTAS
app.use('/', recipeRoutes);
app.use('/admin', adminRoutes);
app.use(pdfRoutes);
app.use(authRoutes);

//! ruta para obtener el token CSRF
app.get('/api/csrf-token', (req, res) => {
    //Cada vez que llamemos a req.csrfToken() se generará un token único y más reciente
    try {
        console.log("CSRF TOKEN ÚNICO DESDE api/CSRF-TOKEN", req.csrfToken());
        res.status(201).json({ csrfToken: req.csrfToken() });
    } catch (error) {
        console.error('Error fetching CSRF token desde el backend:', error);
        res.status(500).json({ error: 'Error fetching CSRF token desde el backend' });
    }
  });

//ERROR HANDLING
app.get('/500', errorController.get500);
app.use(errorController.get404);



//Conexión a la base de datos
mongoose
  .connect(MONGODB_URI)
  .then(result => {
    console.log('Connected to MongoDB');
    app.listen(process.env.PORT || 3000, () => {
      console.log('Server is running on port 3000');
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });