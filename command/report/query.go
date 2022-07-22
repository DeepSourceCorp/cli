package report

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"
)

// makeQuery makes a HTTP query with a specified body and returns the response
func makeQuery(url string, body []byte, bodyMimeType string) ([]byte, error) {
	var resBody []byte

	httpClient := &http.Client{
		Timeout: time.Second * 60,
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", bodyMimeType)
	res, err := httpClient.Do(req)
	if err != nil {
		return resBody, err
	}
	defer res.Body.Close()

	resBody, err = ioutil.ReadAll(res.Body)
	if err != nil {
		return resBody, err
	}

	if res.StatusCode >= http.StatusInternalServerError || res.StatusCode != 200 {
		// Log the response body.
		if resBody != nil {
			fmt.Println(string(resBody))
		}

		return resBody, fmt.Errorf("Error making the query with HTTP status code: %s and message: %s", strconv.Itoa(res.StatusCode), string(resBody))
	}

	return resBody, nil
}
