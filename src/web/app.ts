import * as bodyParser from "body-parser";
import * as express from "express";
import * as expressHandlebars from "express-handlebars";
import { join } from "path";
import { Config } from "~/core/config";
import { logger } from "~/core/logger";
import * as routes from "./routes";
import * as helpers from "./view-helpers";

/**
 * Sets up an Express web server and all routes for it.
 */
export function setupWebServer(): void {
    if (Config.WEB_ENABLED || Config.API_ENABLED) {
        const app = express();

        // tslint:disable-next-line:no-unsafe-any
        app.locals.site = {
            title: Config.MAIN_TITLE,
        };

        if (Config.WEB_ENABLED) {
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
        }

        // expect POSTs to be JSON formatted
        app.use(bodyParser.json());

        app.listen(Config.HTTP_PORT, () => {
            logger.info(`🌐 Web server live on port ${Config.HTTP_PORT} 🌐`);

            for (const registerRoute of Object.values(routes)) {
                registerRoute(app);
            }
        });
    }
}
