import * as express from "express";
import * as expressHandlebars from "express-handlebars";
import { Config } from "~/core/args";
import * as helpers from "./view-helpers";

export let app: express.Express | undefined;

export function appExists(isApp: express.Express | undefined): isApp is express.Express {
    return Boolean(isApp);
}

if (Config.WEB_ENABLED || Config.API_ENABLED) {
    app = express();

    app.locals.site = {
        title: Config.MAIN_TITLE,
    };

    // setup handlebars as the views
    app.engine("hbs", expressHandlebars({
        extname: "hbs",
        defaultLayout: "index.hbs",
        partialsDir: `${Config.BASE_DIR}/web/views/partials`,
        layoutsDir: `${Config.BASE_DIR}/web/views/layouts`,
        helpers,
    }));
    app.set("view engine", "hbs");
    app.set("views", `${Config.BASE_DIR}/web/views`);
}
