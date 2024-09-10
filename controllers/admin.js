

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
const Post = require('../models/post');

exports.getProfile = async (req, res, next) => {
    try {
        const creator = await User.findById(req.params.idCreator).populate('recipes');
        const recuentoRecetas = creator.recipes.length;

        
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
    try {
        const posts = await Post.find();

        console.log('P000000000OSTS', posts)
        res.render('forms/edit-member', {
            member: null,
            posts : posts,
            usuario: req.session.user,
            editing : false,
            hasError: false,
            errorMessage: null,
            validationErrors: []
        })
    } catch (err) {
        res.status(500).json({ error: 'An internal server error occurred' });
}}

exports.postAddUser = async (req, res, next) => {
    const { name, email, cargo, descripcion, 
        posts, image, status } = req.body;
    

    const renderError = (message, validationErrors = []) => {
        res.status(422).render('forms/edit-member', {
            editing: false,
            hasError: true,
            user: { name, email, cargo, descripcion, 
                posts, image},
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
        const bookmark = posts;

        const newUser = new User({
            email, name, permissionLevel,  password, cargo,
            descripcion, bookmark, image, status
        });

        const posts = await Post.find({ _id: { $in: member.bookmark } }); 
        if (posts.length > 0) {
            for (let post of posts) {
                post.author.push(newUser._id);
                await post.save(); 
            }
        }

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
    const posts = await Post.find();
    try{
        const member = await User.findById(memberId);
        console.log('Usuario encontrado', member);
        res.render('forms/edit-member' , {
            posts: posts,
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
        res.redirect('/equipo');

    } catch (err) {
        console.log(err);
    }
}

exports.postEditMember = async (req, res, next) => {
    const { memberId, name, email, password, cargo, descripcion, 
        posts, image, status } = req.body;
    const renderError = (message, validationErrors = []) => {
        res.status(422).render('forms/edit-member', {
            editing: false,
            hasError: true,
            user: { name, email, password, cargo, descripcion, 
                posts, image},
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
        member.bookmark = posts;
        
        const updatedMemmber = await member.save();
        console.log('Actualizando usuario...', updatedMemmber);

        const publicaciones = await Post.find({ _id: { $in: member.bookmark } }); 
        if (publicaciones.length > 0) {
            for (let post of publicaciones) {
                post.author.push(member._id);
                await post.save(); 
            }
        }

        res.redirect('/equipo');

    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        renderError('Error al actualizar usuario');
    }
};

