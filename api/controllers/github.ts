import express from 'express';
import {GithubOauth} from '../helpers/oauth';
import { client } from '../helpers/apollo';
import { AsgardClient } from '../helpers/asgard';
import { githubOpts } from '../config';

const router: express.Router = express.Router();

router.get("/callback", async (req: express.Request, res: express.Response) => {

  const githubOauth = GithubOauth.getInstance(githubOpts);
  const accessToken = await githubOauth.getAccessToken(<string>req.query.code);

  const asgardClient = AsgardClient.getInstance(client);
  const jwt :string = await asgardClient.getJWT(accessToken, 'github');

  res.cookie("jwt", jwt).redirect("/onboard/gh/deepsourcelabs/issue-preferences");
});

router.get("/login", (req: express.Request, res: express.Response) => {
  const githubOauth = GithubOauth.getInstance(githubOpts);
  const authorizationUrl = githubOauth.getAuthorizationUrl()
  res.redirect(authorizationUrl);
})

export default router;
