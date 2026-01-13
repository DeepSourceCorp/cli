package version

import "github.com/deepsourcelabs/cli/version"

// Service provides version information.
type Service struct {
	getBuildInfo func() *version.BuildInfo
}

// NewService creates a version service.
func NewService() *Service {
	return NewServiceWith(version.GetBuildInfo)
}

// NewServiceWith creates a version service with a custom build info provider.
func NewServiceWith(getBuildInfo func() *version.BuildInfo) *Service {
	return &Service{getBuildInfo: getBuildInfo}
}

// String returns the CLI version string.
func (s *Service) String() string {
	buildInfo := s.getBuildInfo()
	if buildInfo == nil {
		return ""
	}
	return buildInfo.String()
}
