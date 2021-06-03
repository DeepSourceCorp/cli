package validation

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"

	"github.com/spf13/viper"
)

type TransformerNodeData []struct {
	Node struct {
		Name      string `json:"name"`
		Shortcode string `json:"shortcode"`
	} `json:"node"`
}

// Validates Transformer Config
func (c *ConfigValidator) validateTransformersConfig() {

	// TODO: Replace this file reading logic with API call
	// ==================================================
	apiData, err := ioutil.ReadFile("/Users/sidntrivedi012/Code/deepsource/cli/validation/api_response2.json")
	if err != nil {
		log.Fatalln("Cant read api response")
	}

	var data APIResponse
	err = json.Unmarshal(apiData, &data)
	if err != nil {
		log.Fatalln("Error in unmarshaling api data")
	}
	// ==================================================

	// If no transformer activated by user, return without any errors
	if viper.Get("transformers") == nil {
		return
	}

	// ==== Transformer shortcode validation ====

	supported := false
	supportedTransformers := c.getTransformersList(data)

	for _, activatedTransformer := range c.Config.Transformers {
		for _, supportedTransformer := range supportedTransformers {
			if activatedTransformer.Name == supportedTransformer {
				supported = true
				break
			}
		}
		if supported == false {
			c.pushError(fmt.Sprintf("The Tranformer %s is not supported yet.", activatedTransformer.Name))
		}
	}
}

func (c *ConfigValidator) getTransformersList(data APIResponse) []string {

	var supportedTransformersData TransformerNodeData
	var transformersList []string

	// Iterating analyzers
	for _, analyzer := range data.Data.Analyzers.Edges {

		transformerData, _ := json.Marshal(analyzer.Node.Transformertoolset.Edges)
		err := json.Unmarshal(transformerData, &supportedTransformersData)
		if err != nil {
			log.Fatalln("Error while unmarshalling API JSON data to struct :", err)
		}

		for _, supportedTransformer := range supportedTransformersData {
			transformersList = append(transformersList, supportedTransformer.Node.Shortcode)
		}
	}

	return transformersList
}
