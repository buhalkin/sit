from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Используем SQLite. Файл test.db создастся автоматически.
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

# connect_args нужен только для SQLite, чтобы избежать ошибок при многопоточности
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Зависимость для получения сессии БД в эндпоинтах
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()