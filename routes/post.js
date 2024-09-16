

const postController = require('../controllers/post');
const csrf = require('csurf');
const express = require('express');
const router = express.Router();

const contentController = require('../controllers/content');
const eventController = require('../controllers/event');




router.get('/', postController.getPosts);
router.get('/add-post', postController.getAddPost);

router.post('/add-post', postController.postAddPost);
router.delete('/delete-post/:postId', postController.deletePost);
router.post('/edit-post/', postController.putPost);
router.get('/edit-post/:postId', postController.editPost);

router.get('/posts/:postId', postController.getPostDetails);



router.get('/quienes-somos', (req, res) => {
    res.render('sections/quienes-somos', {
        pageTitle: 'about',});
});


//CALENDARIO
router.get('/calendario', eventController.getEvents);
router.get('/add-event', eventController.getAddEvent);
router.post('/add-event', eventController.onPostEvent);
router.post('/delete-event/:eventId', eventController.deleteEvent);



//CONTENT (PROYECTOS)
router.get('/content', contentController.getContent);
router.get('/add-content', contentController.getAddContent);
router.post('/add-content', contentController.onPostContent);
router.post('/delete-content/:contentId', contentController.deleteContent);

module.exports = router;



