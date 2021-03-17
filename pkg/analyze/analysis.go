package analyze

import (
	"context"
	"crypto/sha1"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/deepsourcelabs/pkg/cmd"
	"github.com/shurcooL/graphql"
)

// 1. Get the details of user input.(default - .)
// 2. Check if its "." or not
// 3. If ".", list out all the files of the cwd and then send it to function to retrieve content
// 4. If not, send the files to function to retrieve content
// 5. If nothing, use "."
// 6. After getting the contents, send the POST request to asgard
// 7. Wait for asgard to return the status code

func RunAnalysis(files string) {

	payload := AnalysisFilesPayload{}
	log.Println("Filtering files")

	var filesList []string
	cwd, _ := os.Getwd()
	commitID, _, err := cmd.runCmd("git", []string{"rev-parse", "HEAD"}, cwd)
	if err != nil {
		log.Printf("Could not find HEAD commit. Error: %s\n", err)
	}

	payload.LastCommitOID = graphql.String(commitID)

	if files == "." {
		// Get the current working directory
		cwd, _ := os.Getwd()

		// Walk the cwd and make a list of files
		err := filepath.Walk(cwd, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return err
			}
			filesList = append(filesList, path)
			return nil
		})
		if err != nil {
			log.Println(err)
		}
	} else {
		filesList = strings.Split(files, " ")
	}

	for _, fileName := range filesList {
		fileContent := getFileContents(fileName)
		fileHash := generateFileHash(fileName)
		payload.Files = append(payload.Files, File{
			Filename: graphql.String(fileName),
			Contents: graphql.String(fileContent),
			Hash:     graphql.String(fileHash),
		})
	}

	filesDataJSON, err := json.Marshal(payload.Files)
	if err != nil {
		log.Println("Failed to marshal to files data to JSON", err)
	}

	// generate Request Hash
	rand.Seed(time.Now().UnixNano())

	requestHash := generateRequestHash(10)

	client := graphql.NewClient("https://deepsource.io/graphql/cli", nil)
	var analysisInitResp AnalysisTriggerQuery
	queryVariables := map[string]interface{}{
		// TODO : Ask if to send config or not??
		"lastCommitOID": payload.LastCommitOID,
		"files":         graphql.String(filesDataJSON),
		"request_hash":  graphql.String(requestHash),
	}

	err = client.Mutate(context.Background(), &analysisInitResp, queryVariables)
	if err != nil {
		log.Printf("Error initiating analysis. Error: %s\n", err)
	}

	if analysisInitResp.Response.RunID == "" {
		log.Printf("Could not trigger analysis. Server said %+v\n.", analysisInitResp)
	}

	log.Println("Analysis started. Waiting for results...")

}

func getFileContents(file string) []byte {
	fileContent, err := ioutil.ReadFile(file)
	if err != nil {
		log.Printf("Could not read file %s. Error: %s. Skipping...\n", file, err)
	}
	return fileContent
}

func generateFileHash(file string) string {
	hash := sha1.New()
	hash.Write([]byte(file))
	fileHash := hash.Sum(nil)
	return fmt.Sprintf("%s", fileHash)
}

var letters = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

func generateRequestHash(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
