package controllers

type OrderStatus string

const (
	OrderPending   OrderStatus = "pending"
	OrderCompleted OrderStatus = "completed"
	OrderCanceled  OrderStatus = "canceled"
)
