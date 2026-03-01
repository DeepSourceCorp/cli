package oidc

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

func FetchOIDCTokenFromProvider(requestId, requestUrl string) (string, error) {
	req, err := http.NewRequest("GET", requestUrl, http.NoBody)
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+requestId)
	q := req.URL.Query()
	q.Set("audience", DEEPSOURCE_AUDIENCE)
	req.URL.RawQuery = q.Encode()

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("Failed to fetch OIDC token: %s", resp.Status)
	}

	var tokenResponse struct {
		Value string `json:"value"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return "", err
	}
	if tokenResponse.Value == "" {
		return "", fmt.Errorf("Failed to fetch OIDC token: empty token")
	}
	return tokenResponse.Value, nil
}

func ExchangeOIDCTokenForTempDSN(oidcToken, dsEndpoint, provider string) (string, error) {
	apiEndpoint := fmt.Sprintf("%s/services/oidc/%s/", dsEndpoint, provider)
	req, err := http.NewRequest("POST", apiEndpoint, http.NoBody)
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
		return "", fmt.Errorf("Failed to exchange OIDC token for DSN: %s", resp.Status)
	}
	var exchangeResponse ExchangeResponse
	if err := json.NewDecoder(resp.Body).Decode(&exchangeResponse); err != nil {
		return "", err
	}
	if exchangeResponse.DSN == "" {
		return "", fmt.Errorf("Failed to exchange OIDC token for DSN: empty token")
	}
	return exchangeResponse.DSN, nil
}

func GetDSNFromOIDC(requestId, requestUrl, dsEndpoint, provider string) (string, error) {
	if os.Getenv("GITHUB_ACTIONS") == "true" {
		provider = "github-actions"
	}

	if dsEndpoint == "" {
		return "", fmt.Errorf("--host cannot be empty")
	}

	if provider == "" {
		return "", fmt.Errorf("--oidc-provider cannot be empty")
	}

	isSupported := ALLOWED_PROVIDERS[provider]
	if !isSupported {
		return "", fmt.Errorf("Provider %s is not supported for OIDC token exchange (supported providers: %v)", provider, ALLOWED_PROVIDERS)
	}
	if requestId == "" || requestUrl == "" {
		var foundIDToken, foundRequestURL bool
		// skipcq: CRT-A0014
		switch provider {
		case "github-actions":
			requestId, foundIDToken = os.LookupEnv("ACTIONS_ID_TOKEN_REQUEST_TOKEN")
			requestUrl, foundRequestURL = os.LookupEnv("ACTIONS_ID_TOKEN_REQUEST_URL")
			if !(foundIDToken && foundRequestURL) {
				errMsg := `Failed to fetch "ACTIONS_ID_TOKEN_REQUEST_TOKEN" and "ACTIONS_ID_TOKEN_REQUEST_URL" from environment variables. Please make sure you are running this in a GitHub Actions environment with the required permissions. Or, use '--oidc-request-token' and '--oidc-request-url' flags to pass the token and request URL`
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
