package main

import "net/http"

func exposeHeader(url string) error {
	req, err := http.NewRequest(http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Server", "Apache/2.4.1 (Unix)")

	_, err = http.DefaultClient.Do(req)
	if err != nil {
		return err
	}

	return nil
}
