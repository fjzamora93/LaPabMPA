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

//IMPORTACIÓN MANEJO SESIONES (Session + MongoDBsTORE + csrf + cookies + CORS)
const app = express();
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
//! Configuramos también la cookie para que sea segura en producción
const csrfProtection = csrf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60,
        }
    });
const flash = require('connect-flash');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const MONGODB_URI = `mongodb+srv://elgatobarista:${process.env.MONGO_PASSWORD}@rolgamesandstone.tqgnl5u.mongodb.net/?retryWrites=true&w=majority&appName=RolgameSandstone`;


const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'lapab'
});

store.on('error', function(error) {
    console.log('Error en el session store: ', error);
});

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
const apiRoutes = require('./routes/api');
const adminRoutes = require('./routes/admin')
const recipeRoutes = require('./routes/user')
const authRoutes = require('./routes/auth');


//ORDEN 1: Middleware para parsear el body de las peticiones
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//CORS: PERMITE EL ACCESO A LA API DESDE DIFERENTES DOMINIOS
const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:4200',
    'https://fjzamora93.github.io',
    'https://web-production-90fa.up.railway.app',
    'https://bakeryappfront-production.up.railway.app',
    'https://fjzamora93.github.io/BakeryAppFront/'
];
const corsOptions = {
    origin: function (origin, callback) {
        if(!origin) return callback(null, true);
        if(allowedOrigins.indexOf(origin) === -1 && !origin.includes('.railway.app')){
            var msg = 'La política de CORS para este sitio no permite el acceso desde el origen especificado.';
            return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With' ,'X-CSRF-TOKEN'],
    credentials: true
};
app.use(cors(corsOptions));


// ISAUTHENTICATED DEBE IR ANTES DE QUE ENTRE EN JUEGO MULTER PARA EVITAR ERRORES
app.use((error, req, res, next) => {
    res.status(500).render('500', {
      pageTitle: 'Error!',
      path: '/500',
      isAuthenticated: req.session.isLoggedIn
    });
  });




//Middleware para subir archivos con Multer a nuestro HOST.
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('file')); //! 'file' es el nombre del campo en el formulario
//!Aunque podrías haber definido cualquier otro nombre en lugar de file, y en el front tendrías que usarlo.

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));



//PASO 1: CONFIGURACIÓN DEL MIDDLEWARE DE SESIÓN y COOKIES
app.use(cookieParser()); 
app.use(session({
      secret: 'my secret',
      resave: true,
      proxy:  process.env.NODE_ENV === 'production',
      saveUninitialized: true,
      store: store,
      cookie: {
        maxAge: 60 * 60 * 1000, 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        domain: undefined //! para cross origin asegurarte que es Undefined o se bloquearán las cookies
      }
    })
  );

app.use(csrfProtection); 

// Manejo de errores de CSRF
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      res.status(403).json({ error: 'Token CSRF no válido, está interceptando' });
    } else {
      next(err);
    }
  });



  app.use(flash());

  //! Mensaje para verificar que el servidor está funcionando
  app.use((req, res, next) => {
    console.log('Received request:', req.method, req.path);
    next();
  });


// DEVOLVER USUARIO AUTENTIFICADO
app.use(async (req, res, next) => {
    console.log('Autentificando usuario...');
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
  
// VARIABLES LOCALES, CSRF Y AUTENTICACIÓN
app.use((req, res, next) => {
    if (!req.session.csrfToken) {
        req.session.csrfToken = req.csrfToken();
    }
    console.log('Cookies: ', req.cookies);
    console.log('CSRF Token 166:', req.session.csrfToken);
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.user = req.user; 
    res.locals.csrfToken = req.session.csrfToken;
    next();
});

// RUTA PARA OBTENER EL TOKEN CSRF EN LA API
app.get('/api/csrf-token', (req, res) => {
    console.log('CSRF Token fetched from the backend:', req.session.csrfToken);
    res.status(201).json({ csrfToken: req.session.csrfToken });
});

//RUTAS DE LA APLICACIÓN GENERALES
app.use('/', recipeRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use(pdfRoutes);
app.use(authRoutes);


//ERROR HANDLING
app.get('/500', errorController.get500);
app.use(errorController.get404);


//CONEXIÓN A LA BASE DE DATOS Y ARRANQUE DEL SERVIDOR
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