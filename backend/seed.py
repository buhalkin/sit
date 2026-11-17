from database import SessionLocal, engine
import models
from main import get_password_hash

models.Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Если база уже есть, мы её очищаем (чтобы не было дублей)
    db.query(models.Order).delete()
    db.query(models.Product).delete()
    db.query(models.User).delete()
    db.query(models.Message).delete()
    db.commit()

    # Игры расставлены строго по порядку (чтобы совпадали с картинками)
    games = [
        {"name": "Азул", "price": 2490, "min_players": 2, "max_players": 4, "play_time": 45},
        {"name": "Колонизаторы", "price": 3190, "min_players": 3, "max_players": 4, "play_time": 90},
        {"name": "Каркассон", "price": 1990, "min_players": 2, "max_players": 5, "play_time": 40},
        {"name": "Билет на поезд", "price": 3990, "min_players": 2, "max_players": 5, "play_time": 60},
        {"name": "Диксит", "price": 1590, "min_players": 3, "max_players": 6, "play_time": 30},
        {"name": "Мачи Коро", "price": 2790, "min_players": 2, "max_players": 4, "play_time": 30},
        {"name": "Сплэндор", "price": 2990, "min_players": 2, "max_players": 4, "play_time": 30},
        {"name": "Ужас Аркхэма", "price": 4490, "min_players": 1, "max_players": 4, "play_time": 120},
        {"name": "Манчкин", "price": 990, "min_players": 3, "max_players": 6, "play_time": 60},
        {"name": "Эволюция", "price": 1890, "min_players": 2, "max_players": 4, "play_time": 60},
        {"name": "Имаджинариум", "price": 2490, "min_players": 4, "max_players": 7, "play_time": 30},
        {"name": "7 Чудес", "price": 3490, "min_players": 3, "max_players": 7, "play_time": 30},
        {"name": "Пандемия", "price": 2590, "min_players": 2, "max_players": 4, "play_time": 45},
        {"name": "Древний Ужас", "price": 4990, "min_players": 1, "max_players": 8, "play_time": 180},
        {"name": "Кодовые имена", "price": 1490, "min_players": 4, "max_players": 8, "play_time": 15},
        {"name": "Гномы-вредители", "price": 1190, "min_players": 3, "max_players": 10, "play_time": 30},
        {"name": "Мафия", "price": 1290, "min_players": 5, "max_players": 15, "play_time": 30},
    ]

    for g in games:
        db.add(models.Product(**g))
    
    # Создаем тестового пользователя
    test_user = models.User(username="test", password_hash=get_password_hash("123"))
    db.add(test_user)
    
    db.commit()
    print("База данных успешно обновлена!")

if __name__ == "__main__":
    seed_db()
