/**
 * Este archivo solo sirve de muestra sobre cómo se podría gestionar las rutas de la API.
 * En nuestro caso, hemos optado por incluir los api/posts en USER, y el getCsrfToken en APP.JS.
 * Por lo que este fichero no se encuentra actualmente en uso.
 */

const apiController = require('../controllers/api');
const csrf = require('csurf');
const express = require('express');
const router = express.Router();


//! En nuestro caso esta línea ya está en app.js, pero podría ir en API.JS
router.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.session.csrfToken }); 
});

//! RUTAS DE LA API, REORDENAR SEGÚN SE NECESITE

router.get('/posts', apiController.getPosts);
router.post('/posts', apiController.postPosts);
router.delete('/posts/:postId', apiController.deletePost);
router.put('/posts/:postId', apiController.putPost);

router.get('/posts/:postId', apiController.getPostDetails);


//!Autentificación
router.post('/user/login', apiController.postLogin);
router.post('/user/logout', apiController.postLogout);
router.post('/user/signup', apiController.postSignup);
router.post('/user/bookmark', apiController.putBookmark);


router.get('/quienes-somos', (req, res) => {
    res.render('sections/quienes-somos', {
        pageTitle: 'about',});
});

module.exports = router;



