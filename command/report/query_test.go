package report

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestMakeQuery(t *testing.T) {
	t.Run("successful request", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"data": {"ok": true}}`))
		}))
		defer server.Close()

		body := []byte(`{"query": "test"}`)
		resp, err := makeQuery(server.URL, body, "application/json", false)

		assert.NoError(t, err)
		assert.Contains(t, string(resp), `"ok": true`)
	})

	t.Run("server returns 500", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Internal Server Error"))
		}))
		defer server.Close()

		body := []byte(`{"query": "test"}`)
		_, err := makeQuery(server.URL, body, "application/json", false)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "500")
	})

	t.Run("server returns 400", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusBadRequest)
			w.Write([]byte("Bad Request"))
		}))
		defer server.Close()

		body := []byte(`{"query": "test"}`)
		_, err := makeQuery(server.URL, body, "application/json", false)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "400")
	})

	t.Run("server returns 401", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("Unauthorized"))
		}))
		defer server.Close()

		body := []byte(`{"query": "test"}`)
		_, err := makeQuery(server.URL, body, "application/json", false)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "401")
	})

	t.Run("verifies content-type header is set", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			contentType := r.Header.Get("Content-Type")
			if contentType != "application/json" {
				w.WriteHeader(http.StatusBadRequest)
				w.Write([]byte("Invalid content type"))
				return
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"ok": true}`))
		}))
		defer server.Close()

		body := []byte(`{"query": "test"}`)
		resp, err := makeQuery(server.URL, body, "application/json", false)

		assert.NoError(t, err)
		assert.Contains(t, string(resp), "ok")
	})

	t.Run("uses POST method", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != "POST" {
				w.WriteHeader(http.StatusMethodNotAllowed)
				return
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"ok": true}`))
		}))
		defer server.Close()

		body := []byte(`{"query": "test"}`)
		resp, err := makeQuery(server.URL, body, "application/json", false)

		assert.NoError(t, err)
		assert.NotEmpty(t, resp)
	})

	t.Run("sends request body correctly", func(t *testing.T) {
		expectedBody := `{"test": "data"}`
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			body := make([]byte, r.ContentLength)
			r.Body.Read(body)
			if string(body) != expectedBody {
				w.WriteHeader(http.StatusBadRequest)
				return
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"received": true}`))
		}))
		defer server.Close()

		resp, err := makeQuery(server.URL, []byte(expectedBody), "application/json", false)

		assert.NoError(t, err)
		assert.Contains(t, string(resp), "received")
	})

	t.Run("handles empty response body on error", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
			// No body written
		}))
		defer server.Close()

		body := []byte(`{"query": "test"}`)
		_, err := makeQuery(server.URL, body, "application/json", false)

		assert.Error(t, err)
		assert.Contains(t, err.Error(), "500")
	})

	t.Run("returns error for invalid URL", func(t *testing.T) {
		body := []byte(`{"query": "test"}`)
		_, err := makeQuery("http://invalid-host-that-does-not-exist.local:9999", body, "application/json", false)

		assert.Error(t, err)
	})

	t.Run("skip certificate verification flag works", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"ok": true}`))
		}))
		defer server.Close()

		body := []byte(`{"query": "test"}`)
		resp, err := makeQuery(server.URL, body, "application/json", true)

		assert.NoError(t, err)
		assert.NotEmpty(t, resp)
	})

	t.Run("handles different content types", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			contentType := r.Header.Get("Content-Type")
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"contentType": "` + contentType + `"}`))
		}))
		defer server.Close()

		body := []byte(`test data`)
		resp, err := makeQuery(server.URL, body, "text/plain", false)

		assert.NoError(t, err)
		assert.Contains(t, string(resp), "text/plain")
	})
}
