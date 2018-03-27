declare module "hosted-git-info" {
    export function fromUrl(
        /** a URL of a git repository or a SCP-style specifier of one. */
        gitSpecifier: string,
        /** optional options */
        options?: {
            /** If true then committishes won't be included in generated URLs. */
            noCommittish: boolean;
            /** If true then git+ won't be prefixed on URLs. */
            noGitPlus : boolean;
        }
    ): {
        /**  The short name of the service **/
        type: string;
        /** The domain for git protocol use */
        domain: string;
        /** The name of the user/org on the git host */
        user: string;
        /** The name of the project on the git host */
        project: string;
    };
}