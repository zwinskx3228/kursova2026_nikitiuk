from fastapi import FastAPI, Depends, HTTPException, status # pyright: ignore[reportMissingImports]
from fastapi.middleware.cors import CORSMiddleware # type: ignore
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from .database import engine, Base, get_db
from .models import User, Car, Review
from .decision_tree import evaluate_car_liquidity

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AutoAdvisor Production API", version="6.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_db():
    db = next(get_db())
    
    # Створення адміна за замовчуванням
    admin_exists = db.query(User).filter(User.email == "sasha342008@gmail.com").first()
    if not admin_exists:
        admin_user = User(
            email="sasha342008@gmail.com",
            password="sn342008",
            display_name="Sasha Admin",
            is_admin=True
        )
        db.add(admin_user)

    # Автозаповнення машин із фотографіями для розділів Discover / Overview
    if db.query(Car).count() == 0:
        initial_cars = [
            Car(brand="BMW", model="330i M Sport", year=2022, body_type="Sedan", transmission="Automatic", mileage=24180, price=38450, badge="BEST MATCH", image_url="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80"),
            Car(brand="Mercedes-Benz", model="C300", year=2023, body_type="Sedan", transmission="Automatic", mileage=18820, price=41290, badge="High liquidity", image_url="https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80"),
            Car(brand="Mercedes-AMG", model="C43", year=2021, body_type="Coupe", transmission="Automatic", mileage=31450, price=46800, badge="High liquidity", image_url="https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80")
        ]
        db.add_all(initial_cars)

    # Автозаповнення відгуків
    if db.query(Review).count() == 0:
        default_revs = [
            Review(author="Денис М.", comment="Саме те, що я шукав для щоденної роботи. Швидко, охайно й без зайвих складнощів.", rating=5),
            Review(author="Софія Р.", comment="Загалом чудовий досвід. Особливо сподобалося, як легко знайти потрібну інформацію.", rating=5),
            Review(author="Тарас В.", comment="Хороший старт і зрозумілий інтерфейс. Є кілька дрібниць, які ще можна вдосконалити.", rating=4)
        ]
        db.add_all(default_revs)
        
    db.commit()
    db.close()

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    display_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class CarCreate(BaseModel):
    brand: str
    model: str
    year: int
    body_type: str
    transmission: str
    mileage: int
    price: float
    image_url: str

class ReviewCreate(BaseModel):
    author: str
    comment: str
    rating: int = 5

@app.post("/api/register")
def register_user(data: UserRegister, db: Session = Depends(get_db)):
    if data.email == "sasha342008@gmail.com":
        raise HTTPException(status_code=400, detail="Ця пошта зарезервована для адміністратора.")
    if len(data.password) < 8:
        raise HTTPException(status_code=400, detail="Пароль має містити мінімум 8 символів.")
    
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Користувач із таким email вже існує.")
    
    new_user = User(email=data.email, password=data.password, display_name=data.display_name, is_admin=False)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "Успішна реєстрація!", "user_id": new_user.id, "is_admin": False, "display_name": new_user.display_name}

@app.post("/api/login")
def login_user(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email, User.password == data.password).first()
    if not user:
        raise HTTPException(status_code=401, detail="Невірний email або пароль.")
    return {"message": "Вхід успішний!", "user_id": user.id, "is_admin": user.is_admin, "display_name": user.display_name, "email": user.email}

@app.get("/api/recommendations")
def get_recommendations(budget_max: float = 150000, brand: str = "All", body_type: str = "Any", transmission: str = "Any", db: Session = Depends(get_db)):
    query = db.query(Car)
    if budget_max:
        query = query.filter(Car.price <= budget_max)
    if brand != "All":
        query = query.filter(Car.brand == brand)
    if body_type != "Any":
        query = query.filter(Car.body_type == body_type)
    if transmission != "Any":
        query = query.filter(Car.transmission == transmission)

    cars = query.all()
    result = []
    for car in cars:
        metrics = evaluate_car_liquidity(car.mileage, car.year, car.brand)
        result.append({
            "id": car.id, "title": f"{car.brand} {car.model}", "price": car.price,
            "year": car.year, "mileage": f"{car.mileage:,} mi", "body_type": car.body_type,
            "transmission": car.transmission, "badge": car.badge, "image_url": car.image_url,
            "liquidity_score": metrics["liquidity_score"], "liquidity_status": metrics["liquidity_status"]
        })
    return result

@app.post("/api/admin/cars")
def add_car(car_data: CarCreate, db: Session = Depends(get_db)):
    new_car = Car(**car_data.dict(), badge="AI RECOMMEND")
    db.add(new_car)
    db.commit()
    return {"message": "Авто успішно додано в MySQL!"}

@app.delete("/api/admin/cars/{car_id}")
def delete_car(car_id: int, db: Session = Depends(get_db)):
    car = db.query(Car).filter(Car.id == car_id).first()
    if car:
        db.delete(car)
        db.commit()
    return {"message": "Видалено з бази."}

@app.get("/api/reviews")
def get_reviews(db: Session = Depends(get_db)):
    return db.query(Review).all()

@app.post("/api/reviews")
def add_review(data: ReviewCreate, db: Session = Depends(get_db)):
    new_rev = Review(**data.dict())
    db.add(new_rev)
    db.commit()
    return {"message": "Відгук додано!"}