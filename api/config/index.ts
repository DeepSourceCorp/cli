import {OauthConfig} from '../helpers/oauth/oauth';

export const githubOpts = <OauthConfig>{
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  scope: ["user"],
  redirectUri: process.env.GITHUB_REDIRECT_URI
}
