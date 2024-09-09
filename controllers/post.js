const postModel = require('../models/post');
const recipe = require('../models/recipeMdb');
const { uploadImageToImgur } = require('../util/file');
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

exports.getPosts = async (req, res, next) => {
    console.log('GET request received en la API! ->', req.query);
    try{
        const posts = await postModel.find().sort({ title: 1 });
        res.render('sections/proyectos', {
            posts: posts
        });
    }
    catch {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

exports.getAddPost = (req, res, next) => {
    res.render('forms/add-post', {
        pageTitle: 'Add Post',
    });
};

exports.getPostDetails = async (req, res, next) => {
    const id = req.params.postId;
    try{
        const post = await recipe.findById(id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json({ message: 'Post fetched successfully!', post });
    } catch {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}

exports.postPosts = async (req, res, next) => {
    try {
        // Verifica si el CSRF Token está presente
        const csrfToken = req.headers['x-csrf-token'];
        if (!csrfToken) {
            return res.status(400).json({ error: 'CSRF Token is missing' });
        }

        // Verifica si el cuerpo de la solicitud contiene 'title' y 'description'
        if (!req.body || !req.body.title || !req.body.description) {
            return res.status(400).json({ error: 'title y description are required' });
        }

        const { title, description, content, items, steps, category, date, status, author } = req.body;

        // Crea un nuevo post y lo agrega a la lista de posts
        const newPost = new postModel({ title, description, content, items, steps, category, date, status, author });

        if (req.file) {
            newPost.imgUrl = await uploadImageToImgur(req.file.path);
            console.log('Imagen subida:', newPost.imgUrl);
        } else {
            console.log('No se subió ninguna imagen');
        }

        newPost.save();
        res.status(201).json({ message: 'Post added successfully!', post: newPost });

    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}

exports.putPost = async (req, res, next) => {
    try {
        if (!req.body || !req.body.title || !req.body.description) {
            return res.status(400).json({ error: 'title and description are required' });
        }
        let updatedData = { 
            title: req.body.title, 
            description: req.body.description,
            content: req.body.content,
            items: req.body.items,
            steps: req.body.steps,
            category: req.body.category,
            status: req.body.status,
            date: req.body.date
        };

        // Subida de imágenes al servidor
        const oldPost = await postModel.findById(req.params.postId);
        if (req.file) {
            updatedData.imgUrl = await uploadImageToImgur(req.file.path);
        }
        const updatedPost = await postModel.findByIdAndUpdate(req.params.postId, updatedData, { new: true });
        res.status(200).json({ message: 'Post updated successfully!', updatedPost });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

exports.deletePost = async (req, res, next) => {
    console.log('DELETE request received for postId en la API:', req.params.postId);
    try {
        const postId = req.params.postId;
        const deletedPost = await postModel.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.status(200).json({ message: `Post ${postId} deleted successfully!` });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
};

//!AUTHENTITICATION
exports.postLogin =  async (req, res, next) => {
    const email = req.body.email.toLowerCase();
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            validationErrors: errors.array()
        });
    }

    try {
        const user = await User.findOne({ $or: [{ email: email }, { name: email }] });
        if (!user) {
            return res.status(422).json({
                success: false,
                message: 'Nombre de usuario, email o contraseñas incorrectas.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: []
            });
        }

        // Compara la contraseña
        const doMatch = await bcrypt.compare(password, user.password);
        if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;

            // Guarda la sesión
            await new Promise((resolve, reject) => {
                req.session.save(err => {
                    if (err) {
                        console.log('Error al guardar la sesión:', err);
                        return reject(err);
                    }
                    resolve();
                });
            });

            // Enviar respuesta JSON al frontend
            return res.status(200).json({
                success: true,
                message: 'Login successful!',
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    posts: user.posts,
                    bookmark: user.bookmark
                }
            });
        } else {
            return res.status(422).json({
                success: false,
                message: 'Nombre de usuario, email o contraseñas incorrectas.',
                oldInput: {
                    email: email,
                    password: password
                },
                validationErrors: []
            });
        }
    } catch (err) {
        console.log('Error en el proceso de login:', err);
        return res.status(500).json({
            success: false,
            message: 'An internal server error occurred'
        });
    }
};


exports.postSignup = async (req, res, next) => {
    console.log('Received SIGNUP request:', req.body);
  
    // Extraer los datos del cuerpo de la solicitud
    const { user, password } = req.body;
  
    try {
      // Hash de la contraseña usando bcrypt
      const hash = await bcrypt.hash(password, 10);
  
      // Crear un nuevo usuario con el email y la contraseña hasheada
      const newUser = new User({
        email: user.email,
        name: user.name, 
        password: hash,
        posts: user.posts || [], 
        bookmark: user.bookmark || []
      });
      
      const existingUser = await User.findOne({ email: user.email });
      if (existingUser) {
        return res.status(409).json({
          error: 'User already exists'
        });
      }

      // Guardar el nuevo usuario en la base de datos
      const result = await newUser.save();
  
      // Responder con éxito
      res.status(201).json({
        message: 'User created!',
        result: result
      });
    } catch (err) {
      console.error('Error during user signup:', err);
      res.status(500).json({
        error: err.message || 'Internal server error'
      });
    }
  };
  

  exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      if (err) {
        console.log(err);
        return next(err);  
      }
      res.clearCookie('csrfToken');  
      res.redirect('/');  
    });
  };

  //! COMPROBAR SI FUNCIONA
exports.putBookmark = async (req, res, next) => {
    console.log('PUT request received en la API! Añadiendo a favoritos->', req.body);
    const postId = req.body.postId;
    const userId = req.body.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.bookmark.includes(postId)) {
            user.bookmark.pull(postId);
            await user.save();
            return res.status(200).json({ message: 'Bookmark eliminado correctamente!' });
        }

        user.bookmark.push(postId);
        await user.save();
        res.status(200).json({ message: 'Bookmark added successfully!', user });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}