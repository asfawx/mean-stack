var mongoose = require('mongoose'),
    Article = mongoose.model('Article');

// error handling method
var getErrorMessage = function (err) {
    if (err.errors) {
        for (var errName in err.errors) {
            if (err.errors[errName].message) {
                return err.errors[errName].message;
            } else {
                return 'Unknown server error';
            }
        }
    }
};

// HTTP
// create article
exports.create = function (req, res) {
    var article = new Article(req.body);
    article.creator = req.user[0];    

    article.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });

};

// read articles
exports.list = function (req, res) {
    Article.find().sort('-created')
        .populate('creator', 'firstName lastName fullName')
        .exec(function (err, articles) {
            if (err) {
                return res.status(400).send({
                    message: getErrorMessage(err)
                });
            } else {
                res.json(articles);
            }
        });
};

// route parameter middleware
exports.articleById = function (req, res, next, id) {
    Article.findById(id)
        .populate('creator', 'firstName lastName fullName')
        .exec(function (err, article) {
            if (err) return next(err);
            if (!article) return next(new Error('Failed to load article ' + id));

            req.article = article;
            next();
        });
};

// get a single article
// used the middleware to get the article
exports.read = function (req, res) {
    res.json(req.article);
};

// update an article
// assume the user of middleware to get the article
// being edited
exports.update = function (req, res) {
    var article = req.article;

    article.title = req.body.title;
    article.content = req.body.content;

    article.save(function (err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

// delete existing article
exports.delete = function (req, res) {
    var article = req.article;

    article.remove(function (err) {
        if (err) {
            return res.status(400).send({
                message: getErrorMessage(err)
            });
        } else {
            res.json(article);
        }
    });
};

// authorization middleware
// verify that the creator is the same as the login user
exports.hasAuthorization = function(req, res, next) {
    if(req.article.creator.id !== req.user[0].id) {
        return res.status(403).send({
            message: 'User is not authorized'
        });
    }

    next();
};