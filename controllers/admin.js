
const RecetaMdb = require('../models/recipeMdb'); 
const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');
const { uploadImageToImgur } = require('../util/file');
const axios = require('axios');
const fs = require('fs');
const path = require('path');  // Asegúrate de importar path
const User = require('../models/user');
const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

exports.getProfile = async (req, res, next) => {
    try {
        const creator = await User.findById(req.params.idCreator).populate('recipes');
        const recuentoRecetas = creator.recipes.length;

        //Gracias a que hemos populado, no será necesario ahora buscar también las recetas y no es necesaria esta línea
        // const recipes = await RecetaMdb.find({creator: usuario._id});
        
        let isOwner = false;
        if (req.session.user) {
            console.log('req.session.user._id:', req.session.user._id);
            isOwner = req.session.user._id.toString() === creator._id.toString() ; 
        }

        res.render('auth/profile', {
            creator:creator,
            isOwner: isOwner,
            recuentoRecetas: recuentoRecetas
        })
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}


exports.getAddMember = async (req, res, next) =>{
    res.render('forms/edit-member', {
        usuario: req.session.user,
        editing : false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
}

exports.postAddUser = async (req, res, next) => {
    const { name, email, cargo, descripcion, 
        publicaciones, urlPublicaciones, image, status } = req.body;
    

    const renderError = (message, validationErrors = []) => {
        res.status(422).render('forms/edit-member', {
            editing: false,
            hasError: true,
            user: { name, email, cargo, descripcion, 
                publicaciones, urlPublicaciones, image},
            errorMessage: message,
            validationErrors
        });
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return renderError(errors.array().map(error => ({ field: error.param, msg: error.msg })), errors.array());
    }

    try {
        // const imgurLink = await uploadImageToImgur(image.path);

        const password = await bcrypt.hash(email, 12);
        const permissionLevel = 'user';

        const posts = publicaciones.map((publicacion, index) => {
            return { title: publicacion, url: urlPublicaciones[index] };
        });
        console.log('posts:', posts);

        const newUser = new User({
            email, name, permissionLevel,  password, cargo,
            descripcion, 
            posts, image, status
        });

        const savedUser = await newUser.save();
        console.log('Usuario guardado con éxito:', savedUser);

        res.redirect('/');

    } catch (error) {
        console.error('Error al subir algo:', error);
        renderError('Error al subir algo');
    }
};

exports.getEditMember = async (req, res, next) => {
    const memberId = req.params.memberId;
    const editing = true;
    try{
        const member = await User.findById(memberId);
        console.log('Usuario encontrado', member);
        res.render('forms/edit-member' , {
            member : member,
            editing : editing,
            hasError: false,
            errorMessage: null,
            validationErrors: [],
        });
    } catch (err) {
        console.log(err);
        }
    }


exports.postDeleteUser = async (req, res, next) => {
    const userId = req.params.memberId;
    console.log('userId:', userId);
    try {
        // Delete the recipe
        const member = await User.findByIdAndDelete(userId);
        if (!member) {
            return res.status(404).send('No recipe found with the provided id');
        }
        res.redirect('/');

    } catch (err) {
        console.log(err);
    }
}

exports.postEditMember = async (req, res, next) => {
    const { memberId, name, email, password, cargo, descripcion, 
        publicaciones, urlPublicaciones, image, status } = req.body;
    
    console.log("Cuerpo del formulaario: ", req.body);
    const renderError = (message, validationErrors = []) => {
        res.status(422).render('forms/edit-member', {
            editing: false,
            hasError: true,
            user: { name, email, password, cargo, descripcion, 
                publicaciones, urlPublicaciones, image},
            errorMessage: message,
            validationErrors
        });
    };

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return renderError(errors.array().map(error => ({ field: error.param, msg: error.msg })), errors.array());
    }

    try {
        // const imgurLink = await uploadImageToImgur(image.path);

        const member = await User.findById(req.body.memberId);
        console.log("usuario encontrado: ", member);
        member.email = email;
        member.name = name;
        member.password = await bcrypt.hash(password, 12);;
        member.cargo = cargo;
        member.descripcion = descripcion;
        member.status = status;
        member.image = image;
        member.posts = publicaciones.map((publicacion, index) => {
            return { title: publicacion, url: urlPublicaciones[index] };
        });
        

        const updatedMemmber = await member.save();
        console.log('Actualizando usuario...', updatedMemmber);
        res.redirect('/equipo');

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        renderError('Error al actualizar usuario');
    }
};

