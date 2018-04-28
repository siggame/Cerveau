import { defaultBoolean } from "~/core";
import { IAnyObject, objectHasProperty } from "~/utils";

/** The only allowed value types settings can be of. */
export type PossibleSettingValue = string | number | boolean | string[];

/** An individual setting in a schema. */
export interface ISettingsSchema<T> {
    readonly default: T;
    readonly description: string;
    readonly min?: T extends number ? number : never;
    readonly max?: T extends number ? number : never;
}

/** The base settings schemas all implement. */
export interface ISettingsSchemas {
    [key: string]: ISettingsSchema<PossibleSettingValue>;
}

/**
 * The base game settings manager that validates game settings and holds their
 * values.
 */
export class BaseGameSettingsManager {
    /**
     * The schema used to build and validate settings' values.
     */
    public readonly schema = this.makeSchema({
        playerStartingTime: {
            default: 6e10,
            min: 0,
            description: "The starting time (in ns) for each player.",
        },
        playerNames: {
            default: [],
            description: "The names of the players (overrides strings they send).",
        },
        randomSeed: {
            default: "",
            description: "The random seed, or empty for a random seed.",
        },
    });

    /**
     * The current settings' values
     */
    public values = this.initialValues(this.schema);

    /**
     * Creates a game settings manager with optional initial values
     * @param values Optional initial values for the settings
     */
    public constructor(values?: IAnyObject) {
        if (values) {
            this.addSettings(values);
        }
    }

    /**
     * Attempts to add settings to this instance, or returns an Error
     * @param invalidatedSettings key values pairs to attempt to validate, and
     * then if valid to be added to our settings
     * @returns An error if the settings were invalid, otherwise nothing and
     * the settings are added to this instances values
     */
    public addSettings(invalidatedSettings: IAnyObject): void | Error {
        const sanitized: IAnyObject = {};

        for (let [key, value] of Object.entries(invalidatedSettings)) {
            if (!objectHasProperty(this.schema, key)) {
                return new Error(`Unknown setting '${key}'.`);
            }

            const schema = (this.schema as ISettingsSchemas)[key];
            switch (typeof schema.default) {
                case "number":
                    value = Number(value) || 0;
                    if (schema.min !== undefined && value < schema.min) {
                        return new Error(`${key} setting is invalid (${value}). Must be >= ${schema.min}`);
                    }
                    if (schema.max !== undefined && value > schema.max) {
                        return new Error(`${key} setting is invalid (${value}). Must be <= ${schema.max}`);
                    }
                    break;
                case "string":
                    value = String(value);
                    break;
                case "boolean":
                    value = value === "" // special case from url parm, means key was present with no value
                        ? true
                        : defaultBoolean(value);
                    break;
                case "object": // string array is this case
                    value = Array.isArray(value)
                        ? value.map((item) => String(item))
                        : [];
                    break;
            }
        }

        // now we've sanitized all the inputs, so see if they all are valid
        const invalidated = this.invalidate(sanitized);

        if (invalidated instanceof Error) {
            return invalidated;
        }

        // else if appears to be valid!
        this.values = invalidated as any;
    }

    /**
     * Gets the help string to send to clients that do not know what valid
     * settings are
     * @returns a string formatted in a human readable fashion
     */
    public getHelp(): string {
        const lines: string[] = [];

        for (const [key, schema] of Object.entries(this.schema)) {
            let type = Array.isArray(schema.default)
                ? "string[]"
                : typeof(schema.default);

            if (schema.default !== "" &&
               (!Array.isArray(schema.default) || schema.default.length > 0)
            ) {
                type += ` = ${schema.default}`;
            }

            lines.push(`- ${key} (${type}): ${schema.description}`);
        }

        return lines.join("\n");
    }

    /** resets the values to their initial (default) values */
    public reset(): void {
        this.values = this.initialValues(this.schema);
    }

    /**
     * Gets the hypothetical max amount of time (in ns) that a player can use
     * doing client side logic.
     * @returns the number representing how much time they can use, in ns.
     */
    public getMaxPlayerTime(): number {
        return this.values.playerStartingTime;
    }

    /**
     * Makes a schema object from an interface
     * @param schema The schema to make it from
     * @returns the schema, now frozen
     */
    protected makeSchema<T extends ISettingsSchemas>(schema: T): T {
        return Object.freeze(schema);
    }

    /**
     * Generates initial values from defaults in a settings schema
     * @param schema The schema to build defaults from
     * @returns The defaults from that schema
     */
    protected initialValues<T extends ISettingsSchemas>(
        schema: T,
    ): { [K in keyof T] : T[K] extends ISettingsSchema<infer W> ? (W extends never[] ? string[] : W) : never} {
        const values = {} as IAnyObject;
        for (const [key, value] of Object.entries(this.schema)) {
            values[key] = value.default;
        }

        return values as any; // lol, try accurately casting to that monstrosity of a type
    }

    /**
     * Attempts to invalidate some settings sent to us
     * @param someSettings a subset of the valid settings to attempt to validate
     * @returns an Error if invalid, otherwise the validated settings
     */
    protected invalidate(someSettings: IAnyObject): IAnyObject | Error {
        // Use our current values and the new ones to form a settings
        // object to try to validate against
        const settings = { ...this.values, ...someSettings };

        if (settings.playerStartingTime <= 0) {
            return new Error(`player starting time is invalid: ${settings.playerStartingTime}. Must be > 0.`);
        }

        return settings;
    }
}
