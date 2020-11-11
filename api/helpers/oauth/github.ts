import { Oauth, OauthConfig } from './oauth';

export enum SCOPE {
  User = "user",
  Repo = "repo"
}

let githubOauth: GithubOauth;

export class GithubOauth extends Oauth {

  static getInstance(opts: OauthConfig) {
    return githubOauth || new GithubOauth(opts);
  }

  constructor(opts: OauthConfig) {
    opts.authorizationBaseUri = opts.authorizationBaseUri || "https://github.com/login/oauth/authorize";
    opts.tokenBaseUri = opts.tokenBaseUri || "https://github.com/login/oauth/access_token";
    super(opts)
  }
}
