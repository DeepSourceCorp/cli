package verify

import (
	"crypto/rand"
	"fmt"
)

func generateImageVersion(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return fmt.Sprintf("%x", b)
}
