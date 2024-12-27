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
    const { title, content, description, date, status, url } = req.body;
    try{
        const newPost = new Post({ title, content, description, date, status, url });
        await newPost.save();
        res.redirect('/');
       
    } catch (error) {
        res.status(500).json({ error: 'No se ha podido añadir el evento' });
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