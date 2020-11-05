import fetch from "cross-fetch";

export type OauthConfig = {
  authorizationBaseUri: string,
  tokenBaseUri: string;
  redirectUri: string;

  clientId: string,
  clientSecret: string,
  scope: Array<string>,
  state: string,
}

export class Oauth {
  private opts!: OauthConfig

  constructor(opts: OauthConfig) {
    this.opts = opts
  }

  public getAuthorizationUrl = (): string => {
    const url = new URL(this.opts.authorizationBaseUri);
    url.searchParams.append("client_id", this.opts.clientId);
    url.searchParams.append("redirect_uri", this.opts.redirectUri);
    if (this.opts.scope.length) {
      url.searchParams.append("scope", this.getScopeString())
    }
    return url.href;
  }

  public getAccessToken = async (code: string): Promise<string> => {
    const body = new URLSearchParams({
      'client_id': this.opts.clientId,
      'client_secret': this.opts.clientSecret,
      'code': code
    }).toString()

    const response = await fetch( this.opts.tokenBaseUri, {
      method: 'POST',
      body: body,
      headers: {
        "Accept": "application/json",
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    const data = await response.json();
    return data.access_token;
  }

  private getScopeString = (seperator: string = " "):string => {
    return this.opts.scope.join(seperator);
  }


}
