from enum import Enum

class UserRole(str, Enum):
  STUDENT = "STUDENT"
  ADMIN = "ADMIN"

class RedemptionStatus(str, Enum):
  PENDING = "PENDING"
  APPROVED = "APPROVED"
  REDEEMED = "REDEEMED"

class SessionStatus(str, Enum):
  ACTIVE = "ACTIVE"
  COMPLETED = "COMPLETED"
  EXPIRED = "EXPIRED"

SUPPORTED_WASTE_CLASSES = [
  "Plastic Bottle",
  "Plastic Bag",
  "Plastic Other",
  "Cardboard",
  "Glass",
  "Biodegradable Waste",
  "Paper",
  "Metal"
]

DEFAULT_WASTE_CREDITS = {
  "Plastic Bottle": 10,
  "Plastic Bag": 5,
  "Plastic Other": 10,
  "Cardboard": 5,
  "Glass": 15,
  "Biodegradable Waste": 3,
  "Paper": 5,
  "Metal": 20
}
