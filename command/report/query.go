package report

import (
	"bytes"
	"errors"
	"io/ioutil"
	"net/http"
	"strconv"
	"time"
)

// makeQuery makes a HTTP query with a specified body and returns the response
func makeQuery(url string, body []byte, bodyMimeType string) ([]byte, error) {
	var resBody []byte

	httpClient := &http.Client{
		Timeout: time.Second * 10,
	}

	req, _ := http.NewRequest("POST", url, bytes.NewBuffer(body))
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
		return resBody, errors.New("Error making the query with HTTP status code: " + strconv.Itoa(res.StatusCode))
	}

	return resBody, nil
}
