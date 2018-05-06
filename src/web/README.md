# web/

This should contain all the code and files needed for the Cerveau web interface
to work.

The web interface and API are a simple Express app serving web pages using
handlebars for the templating engine, and exposing a RESTful API via Express.

In a traditional Node.js project, this all might be considered the 'app';
however the gameplay server is more of the traditional part of this "app".

Do not duplicate code. If anything code needs to be shared between the web and
game services consider moving it to `../utils/`, or to the root of this
directory.
