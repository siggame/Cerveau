declare module "*.json" {
    const _: {
        [key: number]: any;
        [key: string]: any;
    };

    export = _;
}
