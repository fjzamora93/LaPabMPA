
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

exports.postAddRecipe = async (req, res, next) => {
    const { nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria } = req.body;
    const image = req.file;

    const creatorId = req.session.user._id;
    console.log('creatorId:', creatorId, typeof creatorId);

    const renderError = (message, validationErrors = []) => {
        res.status(422).render('forms/edit-member', {
            editing: false,
            hasError: true,
            receta: { nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, creatorId },
            errorMessage: message,
            validationErrors
        });
    };

    if (!image) {
        return renderError('No se ha introducido una imagen');
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return renderError(errors.array().map(error => ({ field: error.param, msg: error.msg })), errors.array());
    }

    try {
        const imgurLink = await uploadImageToImgur(image.path);
  
        console.log('Imagen subida a Imgur:', imgurLink);

        const recipeMg = new RecetaMdb({
            nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, 
            image: imgurLink, 
            creator:creatorId
        });

        const savedRecipe = await recipeMg.save();
        console.log('Receta guardada con éxito:', savedRecipe);

        // Añadir la referencia de la receta al array de recetas del usuario
        const user = await User.findById(creatorId);
        console.log('ERROR DE USUARIO:', user)
        user.recipes.push(savedRecipe._id);
        await user.save();
        res.redirect('/');

    } catch (error) {
        console.error('Error al cargar la imagen a Imgur:', error);
        renderError('Error al cargar la imagen a Imgur');
    }
};

exports.getEditMember = (req, res, next) => {
    const recetaId = req.params.recetaId;
    const editing = true;
    RecetaMdb.findById(recetaId)
    .then(receta => {
        res.render('forms/edit-member' , {
            receta : receta,
            editing : editing,
            hasError: false,
            errorMessage: null,
            validationErrors: [],
            usuario: req.session.user 
        });
        }
    )
    .catch(err => console.log(err))
};

exports.postDeleteRecipe = async (req, res, next) => {
    const recetaId = req.params.recetaId;
    const user = req.session.user;

    try {
        // Delete the recipe
        const result = await RecetaMdb.findByIdAndDelete(recetaId);
        console.log(result);

        // Remove the reference to the recipe from the user's recipes array
        const userIndex = user.recipes.indexOf(recetaId);
        if (userIndex > -1) {
            user.recipes.splice(userIndex, 1);
            await user.save();
        }

        res.redirect('/');
    } catch (err) {
        console.log(err);
    }
}

exports.postEditRecipe = async (req, res, next) => {
   
    const { nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, idReceta } = req.body;
    const id = idReceta.trim();
    const creator = req.session.user._id;
    const image = req.file;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('edit-recipe', {
            editing: true,
            hasError: true,
            receta: { _id: id, nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, creator },
            errorMessage: errors.array(),
            validationErrors: errors.array()
        });
    }

    try {
        const recipe = await RecetaMdb.findById(id);
        if (!recipe) {
            return res.status(404).send('No recipe found with the provided id');
        }

        recipe.nombre = nombre;
        recipe.descripcion = descripcion;
        recipe.ingredientes = ingredientes;
        recipe.instrucciones = instrucciones;
        recipe.tiempo = tiempo;
        recipe.dificultad = dificultad;
        recipe.categoria = categoria;
        recipe.creator = creator;

        if (image) {
            const imgurLink = await uploadImageToImgur(image.path);
            if (recipe.image) {
                fileHelper.deleteFile(recipe.image);
            }
            recipe.image = imgurLink;
        }
        const savedRecipe = await recipe.save();


        const user = await User.findById(creator);
        if(! user.recipes.includes(savedRecipe._id)){
            user.recipes.push(savedRecipe._id);
            await user.save();
            console.log('Receta añadida al usuario:', user);
        }
        
        res.redirect('/');

    } catch (err) {
        console.error('Error en postEditRecipe:', err);
        res.status(500).render('edit-recipe', {
            editing: true,
            hasError: true,
            receta: { _id: id, nombre, descripcion, ingredientes, instrucciones, tiempo, dificultad, categoria, creator },
            errorMessage: 'Error al actualizar la receta',
            validationErrors: []
        });
    }
};

