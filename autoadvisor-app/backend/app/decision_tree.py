def evaluate_car_liquidity(mileage: int, year: int, brand: str) -> dict:
    """
    СППР / Експертна система на основі дерева рішень для оцінки ліквідності.
    """
    score = 95
    
    # Правило 1: Штраф за великий пробіг
    if mileage > 120000:
        score -= 20
    elif mileage > 60000:
        score -= 10
    
    # Правило 2: Штраф за вік авто
    current_year = 2026
    age = current_year - year
    if age > 7:
        score -= 15
    elif age > 4:
        score -= 8

    # Правило 3: Коефіцієнт преміальності бренду
    if brand in ["BMW", "Mercedes-Benz", "Audi", "Toyota"]:
        score += 5
    else:
        score -= 5

    liquidity_score = max(50, min(98, score))
    
    status = "Excellent" if liquidity_score >= 90 else "High liquidity"
    
    return {
        "liquidity_score": liquidity_score,
        "liquidity_status": status,
        "annual_depreciation": f"{round(max(5.0, 15.0 - liquidity_score * 0.08), 1)}%",
        "avg_days_on_market": f"{int(max(15, 45 - liquidity_score * 0.3))} days"
    }