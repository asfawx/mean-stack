module.exports = function (app) {
    var users = require('../controllers/users.server.controller'),
        articles = require('../controllers/articles.server.controller');

    app.route('/api/articles')
        .get(articles.list)
        .post(users.requiresLogin, articles.create);

    app.route('/api/articles/:articleId')
        .get(articles.read)
        .put(users.requiresLogin, articles.hasAuthorization, articles.update)
        .delete(users.requiresLogin, articles.hasAuthorization, articles.delete)

    app.param('articleId', articles.articleById);
};