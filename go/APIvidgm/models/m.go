package models

type User struct {
	ID         uint         `json:"id" gorm:"primaryKey"`
	Username   string       `json:"username" gorm:"unique"`
	Password   string       `json:"password"`
	Mail       string       `json:"mail" gorm:"unique"`
	Role       string       `json:"role"`
	Directions *[]Direction `json:"directions" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Cart       *Cart        `json:"cart"`
	WishList   *WishList    `json:"wishlist"`
	DigOrders  *[]DigOrder  `json:"dig_orders" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	PhyOrders  *[]PhyOrder  `json:"phy_orders" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Reviews    *[]Review    `json:"reviews" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type Direction struct {
	ID     uint   `json:"id" gorm:"primaryKey"`
	Street string `json:"street"`
	City   string `json:"city"`
	State  string `json:"state"`
	Zip    string `json:"zip"`
	Number string `json:"number"`
	UserID uint   `json:"user_id"`
}

type VideoGame struct {
	ID          uint        `json:"id" gorm:"primaryKey"`
	Title       string      `json:"title"`
	Genre       []*Genre    `json:"genre" gorm:"many2many:video_game_genres;"`
	Platform    []*Platform `json:"platform" gorm:"many2many:video_game_platforms;"`
	ReleaseYear int         `json:"release_year"`
	Developer   string      `json:"developer"`
	Label       []*Label    `json:"label" gorm:"many2many:video_game_labels;"`
	Price       float64     `json:"price"`
	Synopsis    string      `json:"synopsis"`
	PhyStock    int         `json:"phy_stock"`
	DigStock    int         `json:"dig_stock"`
	PEGI        int         `json:"pegi"`
	MinReq      string      `json:"min_req"`
	Rating      float64     `json:"rating"`
	Reviews     []*Review   `json:"reviews" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	ImageURL    string      `json:"image_url"`
}

type Cart struct {
	ID         uint        `json:"id" gorm:"primaryKey"`
	VideoGames []*CartItem `json:"videogames" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	TotalPrice float64     `json:"total_price"`
	UserID     uint        `json:"user_id"`
}

type CartItem struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	VideoGame   *VideoGame `json:"videogame" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	VideoGameID uint       `json:"videogame_id"`
	IsPhysical  bool       `json:"is_physical"`
	Quantity    int        `json:"quantity"`
	CartID      uint       `json:"cart_id"`
}

type Genre struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"unique"`
}

type Platform struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"unique"`
}
type Label struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"unique"`
}

type CDKey struct {
	ID          uint       `json:"id" gorm:"primaryKey"`
	VideoGame   *VideoGame `json:"videogame" gorm:"constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	VideoGameID uint       `json:"videogame_id"`
	Key         string     `json:"key" gorm:"unique"`
	State       string     `json:"state"` // available, reserved, sold
	DigOrderID  uint       `json:"digorder_id"`
}

type PhyOrder struct {
	ID          uint        `json:"id" gorm:"primaryKey"`
	UserID      uint        `json:"user_id"`
	VideoGames  []*CartItem `json:"videogames" gorm:"many2many:phy_order_video_games;"`
	TotalPrice  float64     `json:"total_price"`
	Status      string      `json:"status"` // pending, completed, canceled
	Direction   Direction   `json:"direction"`
	DirectionID uint        `json:"direction_id"`
}

type DigOrder struct {
	ID         uint        `json:"id" gorm:"primaryKey"`
	UserID     uint        `json:"user_id"`
	VideoGames []*CartItem `json:"videogames" gorm:"many2many:dig_order_video_games;"`
	TotalPrice float64     `json:"total_price"`
	Status     string      `json:"status"` // pending, completed, canceled
	CDKeys     []*CDKey    `json:"cdkeys"`
}

type Review struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	UserID      uint   `json:"user_id"`
	VideoGameID uint   `json:"videogame_id"`
	Rating      int    `json:"rating"`
	Comment     string `json:"comment"`
	ModStatus   string `json:"modstatus"` // pending, approved, rejected
}

type WishList struct {
	ID         uint         `json:"id" gorm:"primaryKey"`
	VideoGames []*VideoGame `json:"videogames" gorm:"many2many:wish_list_video_games;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	UserID     uint         `json:"user_id"`
}
