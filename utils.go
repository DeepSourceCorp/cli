package main

import "os"

// isEnvDefined looks up for env variable and returns
// true if defined
func isEnvDefined(env string) bool {
	_, ok := os.LookupEnv(env)
	if !ok {
		return false
	}

	return true
}

// whichCI checks for whitelisted env variables and
// returns the CI environment
func whichCI() string {
	var CIVendor string

	// Travis CI
	if isEnvDefined("TRAVIS") {
		CIVendor = "travis"
	} else if isEnvDefined("APPVEYOR") {
		CIVendor = "appveyor"
	} else if isEnvDefined("bamboo_plankey") {
		CIVendor = "bamboo"
	} else if isEnvDefined("BITBUCKET_COMMIT") {
		CIVendor = "bitbucketpipelines"
	} else if isEnvDefined("BITRISE_IO") {
		CIVendor = "bitrise"
	} else if isEnvDefined("BUDDY_WORKSPACE_ID") {
		CIVendor = "buddy"
	} else if isEnvDefined("BUILDKITE") {
		CIVendor = "buildkite"
	} else if isEnvDefined("CIRCLECI") {
		CIVendor = "circleci"
	} else if isEnvDefined("CODEBUILD_BUILD_ARN") {
		CIVendor = "awscodebuild"
	} else if isEnvDefined("CIRRUS_CI") {
		CIVendor = "cirrus"
	} else if isEnvDefined("DRONE") {
		CIVendor = "drone"
	} else if isEnvDefined("DSARI") {
		CIVendor = "dsari"
	} else if isEnvDefined("GITLAB_CI") {
		CIVendor = "gitlabci"
	} else if isEnvDefined("GO_PIPELINE_LABEL") {
		CIVendor = "gocd"
	} else if isEnvDefined("HUDSON_URL") {
		CIVendor = "hudson"
	} else if isEnvDefined("JENKINS_URL") && isEnvDefined("BUILD_ID") {
		CIVendor = "cirrus"
	} else if isEnvDefined("MAGNUM") {
		CIVendor = "magnumci"
	} else if isEnvDefined("SAILCI") {
		CIVendor = "sailci"
	} else if isEnvDefined("SEMAPHORE") {
		CIVendor = "semaphore"
	} else if isEnvDefined("SHIPPABLE") {
		CIVendor = "shippable"
	} else if isEnvDefined("TDDIUM") {
		CIVendor = "tddium"
	} else if isEnvDefined("STRIDER") {
		CIVendor = "strider"
	} else if isEnvDefined("TEAMCITY_VERSION") {
		CIVendor = "teamcity"
	} else if isEnvDefined("TF_BUILD") {
		CIVendor = "teamfoundation"
	} else if os.Getenv("CI_NAME") == "codeship" {
		CIVendor = "codeship"
	} else {
		CIVendor = ""
	}

	return CIVendor
}
