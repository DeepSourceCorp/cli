package report

import (
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestGetTestCoverageActionCommit(t *testing.T) {
	t.Run("returns GHA_HEAD_COMMIT_SHA when set", func(t *testing.T) {
		t.Setenv("GHA_HEAD_COMMIT_SHA", "abc123def456")

		headOID, err := getTestCoverageActionCommit()
		assert.NoError(t, err)
		assert.Equal(t, "abc123def456", headOID)
	})

	t.Run("returns empty string when not set", func(t *testing.T) {
		// Ensure env is not set
		os.Unsetenv("GHA_HEAD_COMMIT_SHA")

		headOID, err := getTestCoverageActionCommit()
		assert.NoError(t, err)
		assert.Equal(t, "", headOID)
	})
}

func TestGetTravisCommit(t *testing.T) {
	t.Run("uses TRAVIS_PULL_REQUEST_SHA when set", func(t *testing.T) {
		t.Setenv("TRAVIS_PULL_REQUEST_SHA", "travis-pr-sha-123")

		headOID, warning, err := getTravisCommit("original-commit")
		assert.NoError(t, err)
		assert.Equal(t, "travis-pr-sha-123", headOID)
		assert.Empty(t, warning)
	})

	t.Run("falls back to topCommit when TRAVIS_PULL_REQUEST_SHA not set", func(t *testing.T) {
		os.Unsetenv("TRAVIS_PULL_REQUEST_SHA")

		headOID, warning, err := getTravisCommit("original-commit")
		assert.NoError(t, err)
		assert.Equal(t, "original-commit", headOID)
		assert.Empty(t, warning)
	})

	t.Run("falls back to topCommit when TRAVIS_PULL_REQUEST_SHA is empty", func(t *testing.T) {
		t.Setenv("TRAVIS_PULL_REQUEST_SHA", "")

		headOID, warning, err := getTravisCommit("fallback-commit")
		assert.NoError(t, err)
		assert.Equal(t, "fallback-commit", headOID)
		assert.Empty(t, warning)
	})
}

func TestGetGitHubActionsCommit(t *testing.T) {
	t.Run("uses GITHUB_SHA when GITHUB_REF not set", func(t *testing.T) {
		os.Unsetenv("GITHUB_REF")
		t.Setenv("GITHUB_SHA", "github-sha-123")

		headOID, warning, err := getGitHubActionsCommit("top-commit")
		assert.NoError(t, err)
		assert.Equal(t, "github-sha-123", headOID)
		assert.Empty(t, warning)
	})

	t.Run("returns topCommit when GITHUB_REF is set", func(t *testing.T) {
		t.Setenv("GITHUB_REF", "refs/heads/main")
		t.Setenv("GITHUB_EVENT_NAME", "push")

		headOID, warning, err := getGitHubActionsCommit("top-commit-abc")
		assert.NoError(t, err)
		assert.Equal(t, "top-commit-abc", headOID)
		assert.Empty(t, warning)
	})

	t.Run("warns about merge commit for pull_request events", func(t *testing.T) {
		t.Setenv("GITHUB_REF", "refs/pull/123/merge")
		t.Setenv("GITHUB_EVENT_NAME", "pull_request")
		t.Setenv("GITHUB_SHA", "merge-commit-sha")

		headOID, warning, err := getGitHubActionsCommit("merge-commit-sha")
		assert.NoError(t, err)
		assert.Equal(t, "merge-commit-sha", headOID)
		assert.Contains(t, warning, "merge commit")
		assert.Contains(t, warning, "checkout step")
	})

	t.Run("no warning when commits differ for pull_request", func(t *testing.T) {
		t.Setenv("GITHUB_REF", "refs/pull/123/merge")
		t.Setenv("GITHUB_EVENT_NAME", "pull_request")
		t.Setenv("GITHUB_SHA", "merge-commit-sha")

		headOID, warning, err := getGitHubActionsCommit("different-commit")
		assert.NoError(t, err)
		assert.Equal(t, "different-commit", headOID)
		assert.Empty(t, warning)
	})

	t.Run("warns for pull_request_review events with merge commit", func(t *testing.T) {
		t.Setenv("GITHUB_REF", "refs/pull/123/merge")
		t.Setenv("GITHUB_EVENT_NAME", "pull_request_review")
		t.Setenv("GITHUB_SHA", "same-sha")

		_, warning, err := getGitHubActionsCommit("same-sha")
		assert.NoError(t, err)
		assert.Contains(t, warning, "merge commit")
	})

	t.Run("warns for pull_request_review_comment events with merge commit", func(t *testing.T) {
		t.Setenv("GITHUB_REF", "refs/pull/123/merge")
		t.Setenv("GITHUB_EVENT_NAME", "pull_request_review_comment")
		t.Setenv("GITHUB_SHA", "same-sha")

		_, warning, err := getGitHubActionsCommit("same-sha")
		assert.NoError(t, err)
		assert.Contains(t, warning, "merge commit")
	})
}

func TestFetchHeadManually(t *testing.T) {
	t.Run("returns commit SHA from valid git repo", func(t *testing.T) {
		tmpDir := t.TempDir()

		// Initialize a git repo
		initCmd := exec.Command("git", "init")
		initCmd.Dir = tmpDir
		if err := initCmd.Run(); err != nil {
			t.Skip("git not available")
		}

		// Configure git user
		configEmail := exec.Command("git", "config", "user.email", "test@test.com")
		configEmail.Dir = tmpDir
		if err := configEmail.Run(); err != nil {
			t.Skip("git config failed")
		}

		configName := exec.Command("git", "config", "user.name", "Test")
		configName.Dir = tmpDir
		if err := configName.Run(); err != nil {
			t.Skip("git config failed")
		}

		// Create a commit
		testFile := filepath.Join(tmpDir, "test.txt")
		if err := os.WriteFile(testFile, []byte("test"), 0644); err != nil {
			t.Skip("failed to write test file")
		}

		addCmd := exec.Command("git", "add", ".")
		addCmd.Dir = tmpDir
		if err := addCmd.Run(); err != nil {
			t.Skip("git add failed")
		}

		commitCmd := exec.Command("git", "commit", "-m", "initial")
		commitCmd.Dir = tmpDir
		if err := commitCmd.Run(); err != nil {
			t.Skip("git commit failed")
		}

		// Test fetchHeadManually
		sha, err := fetchHeadManually(tmpDir)
		assert.NoError(t, err)
		assert.NotEmpty(t, sha)
		assert.Len(t, sha, 40) // Git SHA is 40 characters
	})

	t.Run("returns error for non-git directory", func(t *testing.T) {
		tmpDir := t.TempDir()

		_, err := fetchHeadManually(tmpDir)
		assert.Error(t, err)
	})

	t.Run("returns error for non-existent directory", func(t *testing.T) {
		_, err := fetchHeadManually("/non/existent/path")
		assert.Error(t, err)
	})
}

func TestGitGetHead(t *testing.T) {
	t.Run("GHA_HEAD_COMMIT_SHA takes priority", func(t *testing.T) {
		t.Setenv("GHA_HEAD_COMMIT_SHA", "gha-priority-sha")
		t.Setenv("GIT_COMMIT_SHA", "git-commit-sha")

		headOID, warning, err := gitGetHead("/some/path")
		assert.NoError(t, err)
		assert.Equal(t, "gha-priority-sha", headOID)
		assert.Empty(t, warning)
	})

	t.Run("GIT_COMMIT_SHA is used when GHA not set", func(t *testing.T) {
		os.Unsetenv("GHA_HEAD_COMMIT_SHA")
		t.Setenv("GIT_COMMIT_SHA", "manual-git-sha")

		headOID, warning, err := gitGetHead("/some/path")
		assert.NoError(t, err)
		assert.Equal(t, "manual-git-sha", headOID)
		assert.Empty(t, warning)
	})

	t.Run("Travis CI uses TRAVIS_PULL_REQUEST_SHA", func(t *testing.T) {
		os.Unsetenv("GHA_HEAD_COMMIT_SHA")
		os.Unsetenv("GIT_COMMIT_SHA")
		os.Unsetenv("GITHUB_ACTIONS")
		t.Setenv("USER", "travis")
		t.Setenv("TRAVIS_PULL_REQUEST_SHA", "travis-pr-sha")

		// Create a temp git repo for fetchHeadManually to work
		tmpDir := t.TempDir()
		initCmd := exec.Command("git", "init")
		initCmd.Dir = tmpDir
		if err := initCmd.Run(); err != nil {
			t.Skip("git not available")
		}

		configEmail := exec.Command("git", "config", "user.email", "test@test.com")
		configEmail.Dir = tmpDir
		if err := configEmail.Run(); err != nil {
			t.Skip("git config failed")
		}

		configName := exec.Command("git", "config", "user.name", "Test")
		configName.Dir = tmpDir
		if err := configName.Run(); err != nil {
			t.Skip("git config failed")
		}

		testFile := filepath.Join(tmpDir, "test.txt")
		if err := os.WriteFile(testFile, []byte("test"), 0644); err != nil {
			t.Skip("failed to write test file")
		}

		addCmd := exec.Command("git", "add", ".")
		addCmd.Dir = tmpDir
		if err := addCmd.Run(); err != nil {
			t.Skip("git add failed")
		}

		commitCmd := exec.Command("git", "commit", "-m", "initial")
		commitCmd.Dir = tmpDir
		if err := commitCmd.Run(); err != nil {
			t.Skip("git commit failed")
		}

		headOID, warning, err := gitGetHead(tmpDir)
		assert.NoError(t, err)
		assert.Equal(t, "travis-pr-sha", headOID)
		assert.Empty(t, warning)
	})
}
