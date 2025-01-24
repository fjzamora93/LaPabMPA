//CONTENIDO 

const Post = require('../models/event');
const { uploadImageToImgur } = require('../util/file');
const { validationResult } = require('express-validator');



// GET 
exports.getEvents = async (req, res, next) => {
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
    const { title, content, place, date, url } = req.body;
     // Convertir la cadena de fecha a un objeto Date
     //const dateObj = new Date(date);
    
     
    console.log("FECHA FORMATEADA ", date);
    try{
        const newPost = new Post({ title, content, place, date, url });
        await newPost.save();
        res.redirect('/post/calendario');
       
    } catch (error) {
        res.status(500).json({ error: 'No se ha podido añadir el evento' });
        };
    };


// DELETE
exports.deleteEvent = async (req, res, next) => {
    try{
        const eventId = req.body.eventId;
        await Post.findByIdAndDelete(eventId);
        res.redirect('/post/calendario');
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    };
};