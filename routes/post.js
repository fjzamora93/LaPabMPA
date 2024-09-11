

const postController = require('../controllers/post');
const csrf = require('csurf');
const express = require('express');
const router = express.Router();





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

module.exports = router;



