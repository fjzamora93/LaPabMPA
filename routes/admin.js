
const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');


const router = express.Router();

router.get('/profile/:idCreator', adminController.getProfile);

router.get('/add-member', isAuth, adminController.getAddMember);
router.get('/edit-member/:memberId', adminController.getEditMember);

router.post('/add', 
    [
        body('nombre')
            .isString()
            .isLength({min: 5})
            .trim(),
        body('descripcion').trim(),
    ], 
    isAuth,
    adminController.postAddRecipe );

router.post('/edit/',
    [
        body('nombre')
            .isString()
            .isLength({min: 5})
            .trim(),
        body('descripcion').trim(),
    ], 
    isAuth,
    adminController.postEditRecipe );
    
router.post('/delete/:recetaId', adminController.postDeleteRecipe);



module.exports = router;