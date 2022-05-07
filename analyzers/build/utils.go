package build

import (
	"crypto/rand"
	"fmt"
)

func generateRandomTag(length int) string {
	b := make([]byte, length)
	if _, err := rand.Read(b); err != nil {
		panic(err)
	}
	return fmt.Sprintf("%s", b)
}
