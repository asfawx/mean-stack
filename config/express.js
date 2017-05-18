var config = require('./config'),
    http = require('http'),
    socketio = require('socket.io'),
    express = require('express'),
    morgan = require('morgan'),
    compress = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    flash = require('connect-flash'),
    passport = require('passport');

module.exports = function (db) {
    var app = express();
    var server = http.createServer(app);
    var io = socketio.listen(server);

    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
    }

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(methodOverride());

    // Configure the MongoDB session storage
	var mongoStore = new MongoStore({
        mongooseConnection: db.connection
    });

    // configure sessions
    app.use(session({
        saveUninitalized: true,
        resave: true,
        secret: config.sessionSecret,
        store: mongoStore
    }));

    // configure ejs
    app.set('views', './app/views');
    app.set('view engine', 'ejs');

    // register passport
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    require('../app/routes/index.server.routes')(app);
    require('../app/routes/users.server.routes')(app);
    require('../app/routes/articles.server.routes')(app);

    // static files
    app.use(express.static('./public'));

    // load the socket.io configuration
    require('./socketio')(server, io, mongoStore);

    return server;
};