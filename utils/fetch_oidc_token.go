package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

var (
	DEEPSOURCE_AUDIENCE = "DeepSource"
	ALLOWED_PROVIDERS   = map[string]bool{
		"github-actions": true,
	}
)

// FetchOIDCTokenFromProvider fetches the OIDC token from the OIDC token provider.
// It takes the request ID and the request URL as input and returns the OIDC token as a string.
func FetchOIDCTokenFromProvider(requestId, requestUrl string) (string, error) {
	// requestid is the bearer token that needs to be sent to the request url
	req, err := http.NewRequest("GET", requestUrl, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+requestId)
	// set the expected audiences as the audience parameter
	q := req.URL.Query()
	q.Set("audience", DEEPSOURCE_AUDIENCE)
	req.URL.RawQuery = q.Encode()

	// send the request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	// check if the response is 200
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to fetch OIDC token: %s", resp.Status)
	}

	// extract the token from the json response. The token is sent under the key `value`
	// and the response is a json object
	var tokenResponse struct {
		Value string `json:"value"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return "", err
	}
	// check if the token is empty
	if tokenResponse.Value == "" {
		return "", fmt.Errorf("failed to fetch OIDC token: empty token")
	}
	// return the token
	return tokenResponse.Value, nil
}

// ExchangeOIDCTokenForTempDSN exchanges the OIDC token for a temporary DSN.
// It sends the OIDC token to the respective DeepSource API endpoint and returns the temp DSN as string.
func ExchangeOIDCTokenForTempDSN(oidcToken, dsEndpoint, provider string) (string, error) {
	apiEndpoint := fmt.Sprintf("%s/services/oidc/%s/", dsEndpoint, provider)
	req, err := http.NewRequest("POST", apiEndpoint, nil)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+oidcToken)

	type ExchangeResponse struct {
		DSN string `json:"access_token"`
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("failed to exchange OIDC token for DSN: %s", resp.Status)
	}
	var exchangeResponse ExchangeResponse
	if err := json.NewDecoder(resp.Body).Decode(&exchangeResponse); err != nil {
		return "", err
	}
	// check if the token is empty
	if exchangeResponse.DSN == "" {
		return "", fmt.Errorf("failed to exchange OIDC token for DSN: empty token")
	}
	// return the token
	return exchangeResponse.DSN, nil
}

func GetDSNFromOIDC(requestId, requestUrl, dsEndpoint, provider string) (string, error) {
	// infer provider from environment variables.
	// Github actions sets the GITHUB_ACTIONS environment variable to true by default.
	if os.Getenv("GITHUB_ACTIONS") == "true" {
		provider = "github-actions"
	}

	if dsEndpoint == "" {
		return "", fmt.Errorf("--deepsource-host-endpoint can not be empty")
	}

	if provider == "" {
		return "", fmt.Errorf("--oidc-provider can not be empty")
	}

	isSupported := ALLOWED_PROVIDERS[provider]
	if !isSupported {
		return "", fmt.Errorf("provider %s is not supported for OIDC Token exchange (Supported Providers: %v)", provider, ALLOWED_PROVIDERS)
	}
	if requestId == "" || requestUrl == "" {
		var foundIDToken, foundRequestURL bool
		// try to fetch the token from the environment variables.
		// skipcq: CRT-A0014
		switch provider {
		case "github-actions":
			requestId, foundIDToken = os.LookupEnv("ACTIONS_ID_TOKEN_REQUEST_TOKEN")
			requestUrl, foundRequestURL = os.LookupEnv("ACTIONS_ID_TOKEN_REQUEST_URL")
			if !foundIDToken || !foundRequestURL {
				errMsg := `failed to fetch "ACTIONS_ID_TOKEN_REQUEST_TOKEN" and "ACTIONS_ID_TOKEN_REQUEST_URL" from environment variables. Please make sure you are running this in a GitHub Actions environment with the required permissions. Or, use '--oidc-request-token' and '--oidc-request-url' flags to pass the token and request URL`
				return "", fmt.Errorf("%s", errMsg)
			}
		}
	}
	oidcToken, err := FetchOIDCTokenFromProvider(requestId, requestUrl)
	if err != nil {
		return "", err
	}
	tempDSN, err := ExchangeOIDCTokenForTempDSN(oidcToken, dsEndpoint, provider)
	if err != nil {
		return "", err
	}
	return tempDSN, nil
}
