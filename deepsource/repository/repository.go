package repository

type Meta struct {
	Activated bool   // Activation status of the repository. True: Activated. False: Not Activated.
	Name      string // Name of the repository
	Owner     string // Owner username of the repository
	Provider  string // VCS host for the repo. Github/Gitlab/BitBucket supported yet.
}
