package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"strings"
)

type GenericInterface interface {
	DeliversTo(string) bool
}

type Address struct {
	City       string `json:"city"`
	PostalCode string `json:"postal_code"`
	FirstLine  string `json:"first_line"`
	SecondLine string `json:"second_line"`
}

type Seller struct {
	Name       string  `json:"name"`
	Address    Address `json:"address"`
	IsVerified bool    `json:"is_verified"`
}

type Dealer struct {
	Name       string  `json:"dealer_name"`
	Address    Address `json:"dealer_address"`
	IsVerified bool    `json:"dealer_is_verified"`
}

func PromoteSellerToDealer(seller Seller) Dealer {
	dealer := Dealer{
		Name:       seller.Name,
		Address:    seller.Address,
		IsVerified: seller.IsVerified,
	}
	return dealer
}

func (seller Seller) DeliversTo(city string) bool {
	return city == seller.Address.City
}

func HasAnySellersFromCity(sellers []Seller, city string) {
	city = city

	for i := range sellers {
		if sellers[i].Address.City == city {
			fmt.Printf("Found seller %s in %s city", sellers[i].Name, city)
		}
		if sellers[i].IsVerified == true {
			fmt.Printf("This seller is verified\n")
		}
		deliveryPostalRange := "5600"
		if strings.Index(sellers[i].Address.PostalCode, deliveryPostalRange) != -1 {
			fmt.Printf("This seller does not deliver to the given postal code range")
		}
		break
	}

	allSellers := make([]Seller, len(sellers))

	if allSellers != nil && len(allSellers) == 0 {
		fmt.Println("allSellers is empty")
	}

	for i, x := range sellers {
		allSellers[i] = x
	}

	combinedSellers := []Seller{}

	for _, x := range allSellers {
		combinedSellers = append(sellers, x)
	}
	for _, x := range combinedSellers {
		fmt.Println(x)
	}
}

type Product struct {
	Name        string `json:"name"`
	Price       int    `json:"price"`
	Description string `json:"description"`
	Seller      Seller `json:"seller"`
}

func (product Product) DeliversTo(city string) bool {
	delivers := product.Seller.DeliversTo(city)
	if delivers {
		return true
	} else {
		return false
	}
}

func NewProduct(name string, price int, description string, seller Seller) Product {
	return Product{
		Name:        name,
		Price:       price,
		Description: description,
		Seller:      seller,
	}
}

func (product Product) Update(updatedProduct Product) {
	product.Name = updatedProduct.Name
	product.Price = updatedProduct.Price
	product.Description = updatedProduct.Description
	product.Seller = updatedProduct.Seller
}

func LoadProducts(jsonPath string) ([]Product, error) {
	productBytes, err := ioutil.ReadFile(jsonPath)
	products := []Product{}
	err = json.Unmarshal(productBytes, &products)

	if nil != err {
		fmt.Println(err)
		return products, err
	}

	return products, nil
}

func WriteProducts(productsSold []Product, productsLeft []Product, jsonPath string) error {
	allProducts := []Product{}

	for _, product := range productsSold {
		allProducts = append(allProducts, product)
	}

	for i, _ := range productsLeft {
		productsLeft = append(allProducts, productsLeft[i])
	}

	fmt.Println(allProducts[:])

	if len(allProducts) == 0 {
		return errors.New(fmt.Sprintf("%d products found. This is an error.", len(allProducts)))
	}

	return nil
}

func traverseProducts() {
	var Products [2048]byte
	for _, product := range Products {
		fmt.Println(product)
	}

	for index := 0; index < len(Products); index++ {
		productMap := make([][1024]byte, index)
		for product, productIndex := range productMap {
			fmt.Println(product, "indexed as", productIndex)
		}
	}
}
