package main

import (
	"sync"
	"testing"
)

var dataLarge []byte

const size = 64 * 1024 // 65536

func benchmarkLargeSizePool(b *testing.B) {
	bytePool := sync.Pool{
		New: func() interface{} {
			b := make([]byte, size)
			return b
		},
	}
	for i := 0; i < b.N; i++ {
		dataLarge = bytePool.Get().([]byte)
		_ = dataLarge
		bytePool.Put(dataLarge)
	}
}
