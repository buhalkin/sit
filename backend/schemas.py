from pydantic import BaseModel, Field
from typing import List, Optional

# --- Схемы для Товаров ---
class ProductBase(BaseModel):
    name: str
    price: float
    min_players: int
    max_players: int
    play_time: int

class ProductResponse(ProductBase):
    id: int
    class Config:
        from_attributes = True

# --- Схемы для Пользователей ---
class UserCreate(BaseModel):
    # Ограничения: логин от 3 до 20 символов, пароль от 6 до 50
    username: str = Field(..., min_length=3, max_length=20, description="Логин от 3 до 20 символов")
    password: str = Field(..., min_length=6, max_length=50, description="Пароль от 6 до 50 символов")

class UserResponse(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True

# --- Схемы для Авторизации ---
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Схемы для Заказов (Корзины) ---
class OrderCreate(BaseModel):
    product_id: int
    quantity: int = 1

class OrderResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    class Config:
        from_attributes = True

# --- Схемы для Сообщений ---
class MessageCreate(BaseModel):
    name: str
    email: str
    message: str