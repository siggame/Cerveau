import { sanitizeBoolean } from "~/core";
import {
    Immutable,
    objectHasProperty,
    quoteIfString,
    UnknownObject,
} from "~/utils";

/** The only allowed value types settings can be of. */
export type PossibleSettingValue = string | number | boolean | string[];

/** An individual setting in a schema. */
export interface SettingsSchema<
    T extends PossibleSettingValue = PossibleSettingValue
> {
    /** The default value for this setting. */
    readonly default: T;
    /** The human readable description about what this setting controls. */
    readonly description: string;
    /** If a number type, this is the minimum value. */
    readonly min?: T extends number ? number : never;
    /** If a number type, this is the maximum value. */
    readonly max?: T extends number ? number : never;
}

/** The base settings schemas all implement. */
export interface SettingsSchemas {
    [key: string]: SettingsSchema;
}

/** Given settings schema the type object we'd expect for that schema. */
export type SettingsFromSchema<T extends SettingsSchemas> = {
    [K in keyof T]: T[K] extends SettingsSchema<infer W>
        ? W extends never[]
            ? string[]
            : W
        : never;
};

/**
 * The base game settings manager that validates game settings and holds their
 * values.
 */
export class BaseGameSettingsManager {
    /**
     * The schema used to build and validate settings' values.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    public get schema() {
        return this.makeSchema({
            playerStartingTime: {
                default: 6e10,
                min: 0,
                description: "The starting time (in ns) for each player.",
            },
            playerNames: {
                default: [],
                description:
                    "The names of the players (overrides strings they send).",
            },
            randomSeed: {
                default: "",
                description: "The random seed, or empty for a random seed.",
            },
        });
    }

    /**
     * The current settings' values.
     */
    public values = this.initialValues(this.schema, true);

    /**
     * Creates a game settings manager with optional initial values.
     *
     * @param values - Optional initial values for the settings.
     */
    public constructor(values?: UnknownObject) {
        if (values) {
            Object.assign(this.values, values);
        }
    }

    /**
     * Attempts to validates settings for this instance, or returns an Error.
     *
     * @param invalidatedSettings - Key values pairs to attempt to validate, and
     * then if valid to be added to our settings.
     * @returns An error if the settings were invalid, otherwise the validated
     * game settings as an object.
     */
    public addSettings(
        invalidatedSettings: Immutable<UnknownObject>,
    ): void | Error {
        const validated = this.invalidateSettings(invalidatedSettings);

        if (validated instanceof Error) {
            return validated;
        } else {
            Object.assign(this.values, validated);
        }
    }

    /**
     * Attempts to validates settings for this instance, or returns an Error.
     *
     * @param invalidatedSettings - Key values pairs to attempt to validate, and
     * then if valid to be added to our settings.
     * @returns An error if the settings were invalid, otherwise the validated
     * game settings as an object.
     */
    public invalidateSettings(
        invalidatedSettings: Immutable<UnknownObject>,
    ): Readonly<UnknownObject> | Error {
        const sanitized: UnknownObject = {};

        for (const [key, value] of Object.entries(invalidatedSettings)) {
            if (!objectHasProperty(this.schema, key)) {
                return new Error(`Unknown setting '${key}'.`);
            }

            const str = quoteIfString(value);

            const schema = (this.schema as SettingsSchemas)[key];
            let sanitizedValue: PossibleSettingValue = "";
            switch (typeof schema.default) {
                case "number":
                    sanitizedValue = Number(value) || 0;
                    if (
                        schema.min !== undefined &&
                        sanitizedValue < schema.min
                    ) {
                        return new Error(
                            `${key} setting is invalid (${str}). Must be >= ${schema.min}`,
                        );
                    }
                    if (
                        schema.max !== undefined &&
                        sanitizedValue > schema.max
                    ) {
                        return new Error(
                            `${key} setting is invalid (${str}). Must be <= ${schema.max}`,
                        );
                    }
                    break;
                case "string":
                    sanitizedValue = String(value);
                    break;
                case "boolean":
                    sanitizedValue =
                        value === "" // special case from url parm, means key was present with no value
                            ? true
                            : sanitizeBoolean(value, false);
                    break;
                case "object": // string array is this case
                    sanitizedValue = Array.isArray(value)
                        ? value.map(String) // convert all values to a string
                        : [];
            }

            sanitized[key] = sanitizedValue;
        }

        // now we've sanitized all the inputs, so see if they all are valid types.
        return this.invalidate(sanitized);
    }

    /**
     * Gets the help string to send to clients that do not know what valid
     * settings are.
     *
     * @returns A string formatted in a human readable fashion.
     */
    public getHelp(): string {
        const lines: string[] = [];

        for (const [key, schema] of Object.entries(this.schema)) {
            let type = Array.isArray(schema.default)
                ? "string[]"
                : typeof schema.default;

            if (
                schema.default !== "" &&
                (!Array.isArray(schema.default) || schema.default.length > 0)
            ) {
                type += ` = ${schema.default}`;
            }

            lines.push(`- ${key} (${type}): ${schema.description}`);
        }

        return lines.join("\n");
    }

    /** Resets the values to their initial (default) values. */
    public reset(): void {
        this.values = this.initialValues(this.schema, true);
    }

    /**
     * Gets the hypothetical max amount of time (in ns) that a player can use
     * doing client side logic.
     *
     * @returns The number representing how much time they can use, in ns.
     */
    public getMaxPlayerTime(): number {
        return this.values.playerStartingTime;
    }

    /**
     * Makes a schema object from an interface.
     *
     * @param schema - The schema to make it from.
     * @returns The schema, now frozen.
     */
    protected makeSchema<T extends SettingsSchemas>(schema: T): Readonly<T> {
        return Object.freeze(schema);
    }

    /**
     * Generates initial values from defaults in a settings schema.
     *
     * @param schema - The schema to build defaults from.
     * @param pure - If this should be pure and not consider current values.
     * @returns The defaults from that schema.
     */
    protected initialValues<T extends SettingsSchemas>(
        schema: T,
        pure?: boolean,
    ): SettingsFromSchema<T> {
        const values: UnknownObject = {};
        for (const [key, value] of Object.entries(schema)) {
            values[key] =
                pure || !objectHasProperty(this.values, key)
                    ? value.default
                    : this.values[key];
        }

        return values as SettingsFromSchema<T>;
    }

    /**
     * Attempts to invalidate some settings sent to us.
     *
     * @param someSettings - A subset of the valid settings to attempt to
     * validate.
     * @returns An Error if invalid, otherwise the validated settings.
     */
    protected invalidate(
        someSettings: Immutable<UnknownObject>,
    ): Readonly<UnknownObject> | Error {
        // Use our current values and the new ones to form a settings
        // object to try to validate against
        const settings = { ...this.values, ...someSettings };

        if (settings.playerStartingTime <= 0) {
            return new Error(
                `player starting time is invalid: ${settings.playerStartingTime}. Must be > 0.`,
            );
        }

        return settings;
    }
}
