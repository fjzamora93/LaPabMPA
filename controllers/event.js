//CONTENIDO 

const Post = require('../models/event');
const { uploadImageToImgur } = require('../util/file');
const { validationResult } = require('express-validator');



// GET 
exports.getEvents = async (req, res, next) => {
    try{
        const posts = await Post.find().sort({ date: -1 });
        console.log("AQUÍ ESTÁN LOS EVENTOS ", posts)
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
     const dateObj = new Date(date);
    
     // Extraer el día, mes y año
    const day = dateObj.getDate();
    const month = dateObj.getMonth() + 1; // Los meses en JavaScript son 0-indexados
    const year = dateObj.getFullYear();
    
    const formattedDate = `${day}/${month}/${year}`;

    try{
        const newPost = new Post({ title, content, place, formattedDate, url });
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