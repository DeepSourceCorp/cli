package config

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	"github.com/pelletier/go-toml"
)

type ConfigData struct {
	User                string `toml:"user"`
	Token               string `toml:"token"`
	TokenExpiry         string `toml:"token_expiry"`
	RefreshToken        string `toml:"refresh_token"`
	OrigIAT             int64  `toml:"origIat"`
	RefreshTokenExpiry  int64  `toml:"refresh_token_expiry"`
	RefreshTokenSetTime int64  `toml:"refresh_token_set_time"`
}

func ReadConfig() (ConfigData, error) {

	config := ConfigData{
		User:                "",
		Token:               "",
		TokenExpiry:         "",
		RefreshToken:        "",
		OrigIAT:             0,
		RefreshTokenExpiry:  0,
		RefreshTokenSetTime: 0,
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return config, err
	}

	cfgContent, err := ioutil.ReadFile(filepath.Join(homeDir, "/.deepsource/config.toml"))
	if err != nil {
		return config, err
	}

	err = toml.Unmarshal(cfgContent, &config)

	return config, err

}

func WriteConfigToFile(config ConfigData) error {


	tomlConfig, err := toml.Marshal(config)
	if err != nil {
		fmt.Println("Error in parsing the authentication data in the TOML format. Exiting ...")
		return err
	}

	// Create a folder named as .deepsource in user's home directory
	homeDir, err := os.UserHomeDir()
	if err != nil {
		fmt.Println("Error in writing authentication data to filesystem. Exiting...")
		return err
	}

	// Check if .deepsource directory already exists
	_, err = os.Stat(filepath.Join(homeDir, "/.deepsource/"))

	// err should be reported if it doesn't exist already
	if err != nil {
		// Making a directory .deepsource if it doesn't already exist
		err = os.Mkdir(filepath.Join(homeDir, "/.deepsource/"), 0755)
		if err != nil {
			fmt.Println("Error in creating directory to write the authentication data. Exiting ...", err)
			return err
		}
	}

	var file *os.File

	// Check if config.toml file already exists in .deepsource directory
	_, err = os.Stat(filepath.Join(homeDir, "/.deepsource/", "config.toml"))
	if err != nil {

		// If the file doesn't exist, then create one
		file, err = os.Create(filepath.Join(homeDir, "/.deepsource/", "config.toml"))
		if err != nil {
			fmt.Println("Error in creating the config file to write the authentication data. Exiting ...")
			return err
		}
	} else {

		// If the file already exists
		file, err = os.OpenFile(filepath.Join(homeDir, "/.deepsource/", "config.toml"), os.O_RDWR|os.O_CREATE, 0755)
		if err != nil {
			log.Fatal(err)
		}

	}

	defer file.Close()

	_, err = file.WriteString(string(tomlConfig))
	if err != nil {
		fmt.Println("Error in writing authentication data to the config file. Exiting ...")
		return err
	}

	return nil
}

func DeleteConfigFile() error {

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return err
	}

	// Check if config.toml file already exists in .deepsource directory
	_, err = os.Stat(filepath.Join(homeDir, "/.deepsource/", "config.toml"))
	if err != nil {
		return fmt.Errorf("User not authenticated")
	}

	err = os.Remove(filepath.Join(homeDir, "/.deepsource/", "config.toml"))
	if err != nil {
		return fmt.Errorf("Error occurred while logging out user - %v", err)
	}

	return nil
}
