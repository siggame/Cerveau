import * as express from "express";
import * as expressHandlebars from "express-handlebars";
import { join } from "path";
import { Config } from "~/core/args";
import { logger } from "~/core/log";
import * as helpers from "./view-helpers";

export let app: express.Express | undefined;

if (Config.WEB_ENABLED || Config.API_ENABLED) {
    app = express();

    app.locals.site = {
        title: Config.MAIN_TITLE,
    };

    // setup handlebars as the views
    app.engine("hbs", expressHandlebars({
        extname: "hbs",
        defaultLayout: "main.hbs",
        partialsDir: join(__dirname, "views/partials"),
        layoutsDir: join(__dirname, "views/layouts"),
        helpers,
    }));
    app.set("view engine", "hbs");
    app.set("views", join(__dirname, "views"));

    app.use("/styles", express.static(join(__dirname, "styles")));

    app.listen(Config.HTTP_PORT, () => {
        logger.info(`🌐 Web server live on port ${Config.HTTP_PORT} 🌐`);
    });
}
