var express = require('express');
var expressHbs = require('express-handlebars');
var moment = require("moment");

var app = express();

// setup handlebars as the views
app.engine('hbs', expressHbs({
    extname:'hbs',
    defaultLayout:'main.hbs',
    helpers: {
        formatDate: function (date, format) {
            return moment(date).format(format);
        },
    },
}));
app.set('view engine', 'hbs');

// GET /static/style.css etc.
app.use('/styles', express.static(__dirname + '/styles'));
app.use('/gamelogs', express.static(__dirname + '/gamelogs'));

module.exports = app;
