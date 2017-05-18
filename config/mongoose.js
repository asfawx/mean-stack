var config = require('./config'),
    mongoose = require('mongoose');

module.exports = function() {
    var db = mongoose.connect(config.db);

    // register the model
    require('../app/models/user.server.model');
    require('../app/models/article.server.model');

    return db;
};