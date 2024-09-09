
const express = require('express');
const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator');


const router = express.Router();

router.get('/profile/:idCreator', adminController.getProfile);

router.get('/add-member', isAuth, adminController.getAddMember);
router.post('/delete-member/:memberId', adminController.postDeleteUser);

router.get('/edit-member/:memberId', adminController.getEditMember);

router.post('/add', 
    [
        body('name')
            .isString()
            .isLength({min: 2})
            .trim(),
        body('descripcion').trim(),
    ], 
    isAuth,
    adminController.postAddUser );

router.post('/edit-member/',
    isAuth,
    adminController.postEditMember );
    




module.exports = router;