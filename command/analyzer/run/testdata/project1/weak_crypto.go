package main

import (
	"crypto/md5"
	"crypto/rand"
	"crypto/rsa"
	"fmt"
	"os"
)

func makeMD5Hash() {
	for _, arg := range os.Args {
		fmt.Printf("%x - %s\n", md5.Sum([]byte(arg)), arg)
	}
}

func generateRSAKey() {
	// Generate Private Key
	pvk, err := rsa.GenerateKey(rand.Reader, 1024)
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(pvk)
}
