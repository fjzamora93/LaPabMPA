const postModel = require('../models/post');

const { uploadImageToImgur } = require('../util/file');
const fileHelper = require('../util/file');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const Post = require('../models/post');
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

exports.getAddPost = async (req, res, next) => {
    try{
        const members= await User.find({status: { $ne: 'admin' } }).sort({ name: 1 });
        console.log(typeof members); 
        res.render('forms/add-post', {
            pageTitle: 'Add Post',
            members: members
        });
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
    }
    
};

exports.postAddPost = async (req, res, next) => {
    try{
        const members= await User.find({status: { $ne: 'admin' } }).sort({ name: 1 });

        const { title, description, content, tags, url, attachedFile, date, author, status } = req.body;
        const newPost = new Post({ title, description, content, tags, url, attachedFile, date, author, status });

        await newPost.save();
        console.log('New post created:', newPost);

        members.forEach(async (member) => {
            if (!member.bookmark.includes(newPost._id)) {
                member.bookmark.push(newPost);
                await member.save();
            }
        });

        res.redirect('/');
       
    } catch (error) {
        res.status(500).json({ error: 'An internal server error occurred' });
        };
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

exports.editPost = async (req, res, next) => {
    try {
        const post = await postModel.findById(req.params.postId);
        const members = await User.find({status: { $ne: 'admin' } }).sort({ name: 1 });
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.render('forms/edit-post', {
            pageTitle: 'Edit Post',
            post: post,
            members: members
        });
    } catch (error) {
        console.error('An error occurred:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}

exports.putPost = async (req, res, next) => {
   
    try {
        const postId = req.body.postId;
        const { title, description, content, tags, url, attachedFile, date, author, status } = req.body;
        const updatedPost = await postModel.findByIdAndUpdate(postId, { title, description, content, tags, url, attachedFile, date, author, status }, { new: true });
        console.log('Actualizando post')
        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.redirect('/post');
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

