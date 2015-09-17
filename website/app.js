var express = require('express');
var expressHbs = require('express-handlebars');
var moment = require("moment");

var app = express();

// setup handlebars as the views
app.engine('hbs', expressHbs({
    extname:'hbs',
    defaultLayout:'main.hbs',
    partialsDir: __basedir + '/website/views/partials',
    layoutsDir: __basedir + '/website/views/layouts',
    helpers: {
        formatDate: function (date, format) {
            return moment(date).format(format);
        },
    },
}));
app.set('view engine', 'hbs');
app.set('views', __basedir + '/website/views');

// GET /static/style.css etc.
app.use('/styles', express.static(__basedir + '/website/styles'));
app.use('/gamelogs', express.static(__basedir + '/output/gamelogs'));

module.exports = app;
