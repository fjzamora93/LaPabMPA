//CONTENIDO 

const Post = require('../models/event');
const { uploadImageToImgur } = require('../util/file');
const { validationResult } = require('express-validator');



// GET 
exports.getEvents = async (req, res, next) => {
    console.log('GET request received en la API! ->', req.query);
    try{
        const posts = await Post.find().sort({ date: -1 });
        res.render('sections/calendario', {
            posts: posts
        });
    }
    catch {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}


// FORMULARIO PARA SUBIR CONTENIDO
exports.getAddEvent = async (req, res, next) => {
    try{
        res.render('forms/add-event', {
            pageTitle: 'Add Content',
        });
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
    
};


// POST CONTENT 
exports.onPostEvent = async (req, res, next) => {
    try{
        const { title, content, date } = req.body;
        const newPost = new Post({ title, content, date, place, url });

        await newPost.save();
        console.log('New post created:', newPost);

        res.redirect('/');
       
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
        };
    };


// DELETE
exports.deleteEvent = async (req, res, next) => {
    try{
        req.params.postId;
        await Post.findByIdAndDelete(req.params.postId);
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    };
};