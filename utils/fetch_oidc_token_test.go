package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
)

const (
	testRequestID  = "test-request-id"
	testOidcToken  = "test-oidc-token"
	testDSN        = "test-dsn"
	testProvider   = "github-actions"
	testDsEndpoint = "http://localhost:12345" // Mock dsEndpoint
)

// TestFetchOIDCTokenFromProvider tests the FetchOIDCTokenFromProvider function
func TestFetchOIDCTokenFromProvider(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(struct {
				Value string `json:"value"`
			}{Value: testOidcToken})
		}))
		defer server.Close()

		token, err := FetchOIDCTokenFromProvider(testRequestID, server.URL)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if token != testOidcToken {
			t.Errorf("Expected token '%s', got '%s'", testOidcToken, token)
		}
	})

	t.Run("http_new_request_error", func(t *testing.T) {
		_, err := FetchOIDCTokenFromProvider(testRequestID, "://invalid-url")
		if err == nil {
			t.Fatal("Expected error for invalid URL, got nil")
		}
	})

	t.Run("client_do_error", func(t *testing.T) {
		// No server running at this URL
		_, err := FetchOIDCTokenFromProvider(testRequestID, "http://localhost:9999/unreachable")
		if err == nil {
			t.Fatal("Expected error for unreachable server, got nil")
		}
	})

	t.Run("non_200_status", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusNotFound)
		}))
		defer server.Close()

		_, err := FetchOIDCTokenFromProvider(testRequestID, server.URL)
		if err == nil {
			t.Fatal("Expected error for non-200 status, got nil")
		}
		expectedErrorMsg := "failed to fetch OIDC token: 404 Not Found"
		if !strings.Contains(err.Error(), expectedErrorMsg) {
			t.Errorf("Expected error message to contain '%s', got '%s'", expectedErrorMsg, err.Error())
		}
	})

	t.Run("json_decode_error", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, "not a json")
		}))
		defer server.Close()

		_, err := FetchOIDCTokenFromProvider(testRequestID, server.URL)
		if err == nil {
			t.Fatal("Expected error for invalid JSON response, got nil")
		}
	})

	t.Run("empty_token_value", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(struct {
				Value string `json:"value"`
			}{Value: ""})
		}))
		defer server.Close()

		_, err := FetchOIDCTokenFromProvider(testRequestID, server.URL)
		if err == nil {
			t.Fatal("Expected error for empty token value, got nil")
		}
		if !strings.Contains(err.Error(), "empty token") {
			t.Errorf("Expected error message to contain 'empty token', got '%s'", err.Error())
		}
	})
}

// TestExchangeOIDCTokenForTempDSN tests the ExchangeOIDCTokenForTempDSN function
func TestExchangeOIDCTokenForTempDSN(t *testing.T) {
	t.Run("success", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(struct {
				DSN string `json:"access_token"`
			}{DSN: testDSN})
		}))
		defer server.Close()

		dsn, err := ExchangeOIDCTokenForTempDSN(testOidcToken, server.URL, testProvider)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if dsn != testDSN {
			t.Errorf("Expected DSN '%s', got '%s'", testDSN, dsn)
		}
	})

	t.Run("http_new_request_error", func(t *testing.T) {
		_, err := ExchangeOIDCTokenForTempDSN(testOidcToken, "://invalid-url", testProvider)
		if err == nil {
			t.Fatal("Expected error for invalid URL, got nil")
		}
	})

	t.Run("client_do_error", func(t *testing.T) {
		_, err := ExchangeOIDCTokenForTempDSN(testOidcToken, "http://localhost:9999/unreachable", testProvider)
		if err == nil {
			t.Fatal("Expected error for unreachable server, got nil")
		}
	})

	t.Run("non_200_status", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusForbidden)
		}))
		defer server.Close()

		_, err := ExchangeOIDCTokenForTempDSN(testOidcToken, server.URL, testProvider)
		if err == nil {
			t.Fatal("Expected error for non-200 status, got nil")
		}
		expectedErrorMsg := "failed to exchange OIDC token for DSN: 403 Forbidden"
		if !strings.Contains(err.Error(), expectedErrorMsg) {
			t.Errorf("Expected error message to contain '%s', got '%s'", expectedErrorMsg, err.Error())
		}
	})

	t.Run("json_decode_error", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
			fmt.Fprint(w, "not a json")
		}))
		defer server.Close()

		_, err := ExchangeOIDCTokenForTempDSN(testOidcToken, server.URL, testProvider)
		if err == nil {
			t.Fatal("Expected error for invalid JSON response, got nil")
		}
	})

	t.Run("empty_dsn_value", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(struct {
				DSN string `json:"access_token"`
			}{DSN: ""})
		}))
		defer server.Close()

		_, err := ExchangeOIDCTokenForTempDSN(testOidcToken, server.URL, testProvider)
		if err == nil {
			t.Fatal("Expected error for empty DSN value, got nil")
		}
		if !strings.Contains(err.Error(), "empty token") { // The error message is "empty token"
			t.Errorf("Expected error message to contain 'empty token', got '%s'", err.Error())
		}
	})
}

// TestGetDSNFromOIDC tests the GetDSNFromOIDC function
// skipcq: GO-R1005
func TestGetDSNFromOIDC(t *testing.T) {
	// Mock servers for FetchOIDCTokenFromProvider and ExchangeOIDCTokenForTempDSN
	var mockTokenServerURL, mockDSNServerURL string

	setupServers := func(
		tokenHandler http.HandlerFunc,
		dsnHandler http.HandlerFunc,
	) {
		tokenServer := httptest.NewServer(tokenHandler)
		mockTokenServerURL = tokenServer.URL
		t.Cleanup(tokenServer.Close)

		dsnServer := httptest.NewServer(dsnHandler)
		mockDSNServerURL = dsnServer.URL
		t.Cleanup(dsnServer.Close)
	}

	defaultTokenHandler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			Value string `json:"value"`
		}{Value: testOidcToken})
	})

	defaultDSNHandler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(struct {
			DSN string `json:"access_token"`
		}{DSN: testDSN})
	})

	t.Run("success_with_params", func(t *testing.T) {
		setupServers(defaultTokenHandler, defaultDSNHandler)
		dsn, err := GetDSNFromOIDC(testRequestID, mockTokenServerURL, mockDSNServerURL, testProvider)
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if dsn != testDSN {
			t.Errorf("Expected DSN '%s', got '%s'", testDSN, dsn)
		}
	})

	t.Run("success_with_github_actions_env_vars", func(t *testing.T) {
		setupServers(defaultTokenHandler, defaultDSNHandler)
		t.Setenv("GITHUB_ACTIONS", "true")
		t.Setenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN", testRequestID)
		t.Setenv("ACTIONS_ID_TOKEN_REQUEST_URL", mockTokenServerURL)
		t.Cleanup(func() {
			os.Unsetenv("GITHUB_ACTIONS")
			os.Unsetenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN")
			os.Unsetenv("ACTIONS_ID_TOKEN_REQUEST_URL")
		})

		dsn, err := GetDSNFromOIDC("", "", mockDSNServerURL, "") // provider will be inferred
		if err != nil {
			t.Fatalf("Expected no error, got %v", err)
		}
		if dsn != testDSN {
			t.Errorf("Expected DSN '%s', got '%s'", testDSN, dsn)
		}
	})

	t.Run("error_empty_ds_endpoint", func(t *testing.T) {
		_, err := GetDSNFromOIDC(testRequestID, "url", "", testProvider)
		if err == nil {
			t.Fatal("Expected error for empty dsEndpoint, got nil")
		}
		if !strings.Contains(err.Error(), "--deepsource-host-endpoint can not be empty") {
			t.Errorf("Unexpected error message: %s", err.Error())
		}
	})

	t.Run("error_empty_provider_no_env", func(t *testing.T) {
		t.Setenv("GITHUB_ACTIONS", "false") // Ensure it's not inferred
		t.Cleanup(func() { os.Unsetenv("GITHUB_ACTIONS") })
		_, err := GetDSNFromOIDC(testRequestID, "url", testDsEndpoint, "")
		if err == nil {
			t.Fatal("Expected error for empty provider, got nil")
		}
		if !strings.Contains(err.Error(), "--oidc-provider can not be empty") {
			t.Errorf("Unexpected error message: %s", err.Error())
		}
	})

	t.Run("error_unsupported_provider", func(t *testing.T) {
		t.Setenv("GITHUB_ACTIONS", "false") // Ensure GITHUB_ACTIONS env does not interfere
		_, err := GetDSNFromOIDC(testRequestID, "url", testDsEndpoint, "unsupported")
		if err == nil {
			t.Fatal("Expected error for unsupported provider, got nil")
		}
		if !strings.Contains(err.Error(), "provider unsupported is not supported") {
			t.Errorf("Expected error message to contain 'provider unsupported is not supported', got '%s'", err.Error())
		}
	})

	t.Run("error_github_actions_env_vars_missing_token", func(t *testing.T) {
		t.Setenv("GITHUB_ACTIONS", "true")
		// ACTIONS_ID_TOKEN_REQUEST_TOKEN is missing
		t.Setenv("ACTIONS_ID_TOKEN_REQUEST_URL", "url")
		// make sure this is missing when running on github actions too
		os.Unsetenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN")
		t.Cleanup(func() {
			os.Unsetenv("GITHUB_ACTIONS")
			os.Unsetenv("ACTIONS_ID_TOKEN_REQUEST_URL")
		})
		_, err := GetDSNFromOIDC("", "", testDsEndpoint, "")
		if err == nil {
			t.Fatal("Expected error for missing ACTIONS_ID_TOKEN_REQUEST_TOKEN, got nil")
		}
		if !strings.Contains(err.Error(), `failed to fetch "ACTIONS_ID_TOKEN_REQUEST_TOKEN"`) {
			t.Errorf("Unexpected error message: %s", err.Error())
		}
	})

	t.Run("error_github_actions_env_vars_missing_url", func(t *testing.T) {
		t.Setenv("GITHUB_ACTIONS", "true")
		t.Setenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN", "token")
		os.Unsetenv("ACTIONS_ID_TOKEN_REQUEST_URL")
		// ACTIONS_ID_TOKEN_REQUEST_URL is missing
		t.Cleanup(func() {
			os.Unsetenv("GITHUB_ACTIONS")
			os.Unsetenv("ACTIONS_ID_TOKEN_REQUEST_TOKEN")
		})
		_, err := GetDSNFromOIDC("", "", testDsEndpoint, "")
		if err == nil {
			t.Fatal("Expected error for missing ACTIONS_ID_TOKEN_REQUEST_URL, got nil")
		}
		if !strings.Contains(err.Error(), `failed to fetch "ACTIONS_ID_TOKEN_REQUEST_TOKEN"`) { // Error message covers both
			t.Errorf("Unexpected error message: %s", err.Error())
		}
	})

	t.Run("error_fetch_oidc_token_fails", func(t *testing.T) {
		tokenHandler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusInternalServerError) // Cause FetchOIDCTokenFromProvider to fail
		})
		setupServers(tokenHandler, defaultDSNHandler)

		_, err := GetDSNFromOIDC(testRequestID, mockTokenServerURL, mockDSNServerURL, testProvider)
		if err == nil {
			t.Fatal("Expected error when FetchOIDCTokenFromProvider fails, got nil")
		}
		if !strings.Contains(err.Error(), "failed to fetch OIDC token") {
			t.Errorf("Unexpected error message: %s", err.Error())
		}
	})

	t.Run("error_exchange_oidc_token_fails", func(t *testing.T) {
		dsnHandler := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
			w.WriteHeader(http.StatusInternalServerError) // Cause ExchangeOIDCTokenForTempDSN to fail
		})
		setupServers(defaultTokenHandler, dsnHandler)

		_, err := GetDSNFromOIDC(testRequestID, mockTokenServerURL, mockDSNServerURL, testProvider)
		if err == nil {
			t.Fatal("Expected error when ExchangeOIDCTokenForTempDSN fails, got nil")
		}
		if !strings.Contains(err.Error(), "failed to exchange OIDC token for DSN") {
			t.Errorf("Unexpected error message: %s", err.Error())
		}
	})
}
