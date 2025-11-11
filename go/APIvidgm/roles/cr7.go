package roles

type Role string

const (
	Root  Role = "root"
	Admin Role = "admin"
	Slave Role = "slave"
)

var MapRole = map[Role]int{
	Root:  3,
	Admin: 2,
	Slave: 1,
}

func Rank(r Role) int {
	if v, ok := MapRole[r]; ok {
		return v
	}
	return 0
}

func HasAtLeast(role Role, required Role) bool {
	return Rank(role) >= Rank(required)
}
