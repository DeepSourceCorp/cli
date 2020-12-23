import express from 'express';
import {GithubOauth} from '../helpers/oauth';
import { client } from '../helpers/apollo';
import { AsgardClient } from '../helpers/asgard/asgard';
import { githubOpts } from '../config';

import {Refresh, SocialAuthJwt} from '~/types/types';

interface TokenSet {
  token: string,
  refreshToken: string,
  refreshExpiresIn?: number
  tokenExpiresIn?: number
}

const setCookies = (res :express.Response, tokenSet: TokenSet) :express.Response => {
  const _ds_sess = { 'token': tokenSet.token, 'tokenExpiresIn': tokenSet.tokenExpiresIn }
  const _ds_sess_samesite = { 'refreshToken': tokenSet.refreshToken, 'refreshExpiresIn': tokenSet.refreshExpiresIn }
  res.cookie("_ds_sess", JSON.stringify(_ds_sess));
  res.cookie("_ds_sess_samesite", JSON.stringify(_ds_sess_samesite), {httpOnly: true});
  return res
}

const router: express.Router = express.Router();

router.get("/callback", async (req: express.Request, res: express.Response) => {

  const githubOauth = GithubOauth.getInstance(githubOpts);
  const accessToken = await githubOauth.getAccessToken(<string>req.query.code);

  const asgardClient = AsgardClient.getInstance(client);
  const response :SocialAuthJwt = await asgardClient.getToken(accessToken, 'github');

  const tokenSet :TokenSet = <TokenSet> {...response};
  setCookies(res, tokenSet);

  res.redirect("/onboard/gh/deepsourcelabs/issue-preferences");
});

router.get("/login", (req: express.Request, res: express.Response) => {
  const githubOauth = GithubOauth.getInstance(githubOpts);
  const authorizationUrl = githubOauth.getAuthorizationUrl()
  res.redirect(authorizationUrl);
})

router.get("/refresh", async (req: express.Request, res: express.Response) => {
  const asgardClient = AsgardClient.getInstance(client);

  if (!req.cookies._ds_sess_samesite ) {
    res.status(400).send("Bad request!");
  }

  const [refreshToken] = JSON.parse(req.cookies._ds_sess_samesite);

  const response :Refresh = await asgardClient.refreshToken(refreshToken);
  const refreshExpiresIn = parseInt(response.payload.exp, 10);
  const tokenSet :TokenSet = <TokenSet> {...response, refreshExpiresIn}

  setCookies(res, tokenSet);

  res.status(200).send();
});

export default router;
