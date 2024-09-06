const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth');
const userController = require('../controllers/user');
const apiController = require('../controllers/api');

const User = require('../models/user');


//recuerda que user parte desde la ruta principal, no tiene una propia como la tiene admin

router.get('/', userController.getIndex);
router.get('/index', userController.getIndex);


router.get('/equipo', async (req, res) => {
    try{
        const users = await User.find().sort({ name: 1 });
        const tesistas = users.filter(user => user.status === 'tesista');
        const techs = users.filter(user => user.status === 'tech');

        console.log('USUARIOS RESCATADOS', techs);  
        res.render('sections/equipo', {
            pageTitle: 'Home',
            tesistas: tesistas,
            techs : techs
        });
    } catch (error){
        console.log(error);
    }
    
});

router.get('/calendario', (req, res) => {
    res.render('sections/calendario', {
        pageTitle: 'Home',});
});



router.get('/congreso', (req, res) => {
    res.render('sections/congreso', {
        pageTitle: 'Home',});
});

router.get('/proyectos', (req, res) => {
    res.render('sections/congreso', {
        pageTitle: 'Home',});
});

router.get('/contacto', (req, res) => {
    res.render('sections/contacto', {
        pageTitle: 'Home',});
});

router.get('/noticias', (req, res) => {
    res.render('sections/noticias', {
        pageTitle: 'Home',});
});


router.get('/recipe-details/:recetaId', userController.getRecipeDetails);

//Los controllers se ejecutarán en orden. Si el primero da el NEXT (porque está autentificado el usuario), pasará al siguiente
router.get('/bookmark', isAuth, userController.getBookmark);
router.post('/add-bookmark', userController.postSaveBookmark);
router.post('/delete-bookmark', userController.postDeleteBookmark);
router.get('/search', userController.getSearch);

//! TEST CONEXION FRONTEND


module.exports = router;