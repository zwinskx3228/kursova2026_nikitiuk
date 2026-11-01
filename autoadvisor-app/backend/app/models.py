from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    display_name = Column(String(100), default="User")
    is_admin = Column(Boolean, default=False)

class Car(Base):
    __tablename__ = "cars"
    id = Column(Integer, primary_key=True, index=True)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    body_type = Column(String(50), nullable=False)
    transmission = Column(String(50), nullable=False)
    mileage = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    badge = Column(String(50), default="BEST MATCH")
    image_url = Column(String(500), nullable=True)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    author = Column(String(100), nullable=False)
    comment = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)