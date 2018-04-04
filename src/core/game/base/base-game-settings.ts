import { IAnyObject } from "~/utils";

export type PossibleSettingValue = string | number | boolean | string[];

export interface IBaseGameSettings {
    // [key: string]: PossibleSettingValue;
    playerStartingTime: number;
    playerNames: string[];
    randomSeed: string;
}

export type IGameSettingsDescriptions<T> = {
    readonly [P in keyof T]: string;
};

export class BaseGameSettings<ISettings extends IBaseGameSettings = IBaseGameSettings> {
    public get defaults(): ISettings {
        return {
            playerNames: [] as string[],
            playerStartingTime: 6e10,
            randomSeed: "",
        } as ISettings;
    }

    public get descriptions(): IGameSettingsDescriptions<ISettings> {
        return {
            playerNames: "The names of the players (overrides strings they send).",
            playerStartingTime: "The starting time (in ns) for each player.",
            randomSeed: "The random seed, or empty for a random seed.",
        } as IGameSettingsDescriptions<ISettings>;
    }

    public invalidate(settings: ISettings): string | undefined {
        settings = this.sanitize(settings);

        if (isNaN(settings.playerStartingTime) || settings.playerStartingTime < 1) {
            return `${settings.playerStartingTime} is not a valid starting time, must be >= 1.`;
        }

        // otherwise' it's valid!
    }

    public sanitize(settings: IAnyObject): ISettings {
        const sanitized: any = {};
        const defaults = this.defaults;

        for (const [key, def] of Object.entries(defaults)) {
            if (key in settings) {
                // sanitize it
                switch (typeof def) {
                    case "number":
                        sanitized[key] = Number(def);
                        break;
                    case "string":
                        sanitized[key] = String(def);
                        break;
                    case "boolean":
                        sanitized[key] = Boolean(def);
                        break;
                    case "object": // string array is this case
                        sanitized[key] = Array.isArray(def)
                            ? def.map((item) => String(item))
                            : [] as string[];
                        break;
                }
            }
            else {
                sanitized[key] = def;
            }
        }

        return sanitized;
    }

    public getHelp(): string {
        const lines = new Array<string>();

        const defaults: any = this.defaults;
        const descriptions: any = this.descriptions;
        for (const key of Object.keys(defaults).sort()) {
            const def = defaults[key];
            const type = Array.isArray(def)
                ? "string[]"
                : typeof(def);

            lines.push(`- ${key} {${key}}: ${descriptions[key]} (default ${type})`);
        }

        return lines.join("\n");
    }
}
