const express = require('express');
const router = express.Router();

//Bring in Article Model
let Article = require('../models/article');

//Bring in User Model
let User = require('../models/user');

//Add Route
router.get('/add', ensureAuthenticated, function(req, res) {
    res.render('add_article', {
        title: 'Add Article'
    });
});

//Add Submit Post Route
router.post('/add', function(req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    //req.checkBody('author', 'Author is required').notEmpty()
    req.checkBody('body', 'Body is required').notEmpty();

    //Get Errors
    let errors = req.validationErrors();

    if (errors) {
        res.render('add_article', {
            title: "Add Article",
            errors: errors
        });
    } else {
        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;

        article.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                req.flash('success', 'Artilce added');
                res.redirect('/');
            }
        });
    }

});

//Load Edit Form
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        console.log("Article : " + article.author);
        console.log("User : " + req.user._id);
        if (article.author != req.user._id) {
            console.log("You are not allowed to change in this article");
            req.flash('danger', 'You can update only your own Article');
            res.redirect('/');
        }
        /*if (article.Author != req.user._id) {
            req.flash('danger', 'Not Authorized for this Article');
            res.redirect('/');
        }*/
        else {
            res.render('edit_article', {
                article: article,
                title: 'Edit Article'
            });
        }
    });
});

//Update Submit Post Route
router.post('/edit/:id', function(req, res) {
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {
        _id: req.params.id
    };

    Article.update(query, article, function(err) {
        if (err) {
            console.log(err);
        } else {
            req.flash('success', 'Article Updated');
            res.redirect('/');
        }
    });
});

//Delete Article
router.delete('/:id', function(req, res) {
    if (!req.user._id) {
        res.status(500).send();
    }
    let query = {
        _id: req.params.id
    };

    Article.findById(req.params.id, function(err, article) {
        if (article.author != req.user._id) {
            res.status(500).send();
        } else {
            Article.remove(query, function(err) {
                if (err) {
                    console.log(err);
                }
                res.send("Success");
            });
        }
    });


});

//Add Article
router.get('/:id', function(req, res) {
    Article.findById(req.params.id, function(err, article) {
        if (err) {
            console.log(err);
        } else {
            User.findById(article.author, function(err, user) {
                if (err) throw err;
                res.render('article', {
                    article: article,
                    author: user.name
                });
            });

        }
    })
});

//Access Control
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', 'Please Login');
        res.redirect('/users/login');
    }
}

module.exports = router;