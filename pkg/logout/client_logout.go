package logout

import (
	"fmt"
	"github.com/spf13/cobra"
	"log"
	"os"
)

func Logout(cmd *cobra.Command, args []string) {
	// Logout Flow
	// Just delete the JSON Web Token present in ~/.deepsource directory

	// Check if the file even exists
	// TODO: Handle path acc. to different OS
	_, err := os.Stat("~/.deepsource/tokens.txt")
	if os.IsNotExist(err) {
		// If it doesn't exist, implies user never logged in
		fmt.Println("User not logged in already.")
	}

	// If it exists, delete it
	// TODO: Handle path acc. to different OS
	err = os.Remove("~/.deepsource/tokens.txt")
	if err != nil {
		log.Fatalln("Failed to logout the user.")
	}

	fmt.Println("Successfully logged out.")
}
