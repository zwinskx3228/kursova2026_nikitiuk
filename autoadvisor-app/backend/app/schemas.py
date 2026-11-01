from pydantic import BaseModel
from typing import Optional

class CarResponse(BaseModel):
    id: int
    title: str
    price: float
    year: int
    mileage: str
    badge: str
    liquidity_score: int
    liquidity_status: str
    annual_depreciation: str
    avg_days_on_market: str
    value_index: int

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    email_alerts: bool
    min_liquidity_alert: int
    display_name: Optional[str] = "Sasha"