//CONTENIDO 

const Post = require('../models/content');
const { uploadImageToImgur } = require('../util/file');
const { validationResult } = require('express-validator');



// GET 
exports.getContent = async (req, res, next) => {
    console.log('GET request received en la API! ->', req.query);
    try{
        const posts = await Post.find().sort({ title: 1 });
        res.render('sections/proyectos', {
            posts: posts
        });
    }
    catch {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}


// FORMULARIO PARA SUBIR CONTENIDO
exports.getAddContent = async (req, res, next) => {
    try{
        res.render('forms/add-content', {
            pageTitle: 'Add Content',
        });
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
    
};


// POST CONTENT 
exports.onPostContent = async (req, res, next) => {
    try{
        const { title, content, date } = req.body;
        const newPost = new Post({ title, content, date });

        await newPost.save();
        console.log('New post created:', newPost);

        res.redirect('/');
       
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
        };
    };


// DELETE
exports.deleteContent = async (req, res, next) => {
    try{
        req.params.postId;
        await Post.findByIdAndDelete(req.params.postId);
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    };
};