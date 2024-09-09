

const postController = require('../controllers/post');
const csrf = require('csurf');
const express = require('express');
const router = express.Router();





router.get('/', postController.getPosts);
router.get('/add-post', postController.getAddPost);

router.post('/posts', postController.postPosts);
router.delete('/posts/:postId', postController.deletePost);
router.put('/posts/:postId', postController.putPost);

router.get('/posts/:postId', postController.getPostDetails);



router.get('/quienes-somos', (req, res) => {
    res.render('sections/quienes-somos', {
        pageTitle: 'about',});
});

module.exports = router;



