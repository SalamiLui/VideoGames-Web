package roles

type Role string

const (
	Root  Role = "root"
	Admin Role = "admin"
	Slave Role = "slave"
)
