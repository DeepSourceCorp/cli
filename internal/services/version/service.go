package version

import "github.com/deepsourcelabs/cli/buildinfo"

// Service provides version information.
type Service struct {
	getBuildInfo func() *buildinfo.BuildInfo
}

// NewService creates a version service.
func NewService() *Service {
	return NewServiceWith(buildinfo.GetBuildInfo)
}

// NewServiceWith creates a version service with a custom build info provider.
func NewServiceWith(getBuildInfo func() *buildinfo.BuildInfo) *Service {
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
