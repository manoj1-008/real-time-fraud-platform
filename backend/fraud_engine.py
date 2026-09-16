def calculate_risk(
    amount: float,
    location: str,
    transaction_type: str,
    device_id: str
):
    score = 0
    reasons = []

    # Rule 1: unusually high transaction amount
    if amount > 50000:
        score += 30
        reasons.append("High transaction amount")

    # Rule 2: suspicious transaction type
    if transaction_type.upper() == "INTERNATIONAL":
        score += 20
        reasons.append("International transaction")

    # Rule 3: suspicious location
    suspicious_locations = ["UNKNOWN", "RISKY_REGION"]

    if location.upper() in suspicious_locations:
        score += 25
        reasons.append("Suspicious location")

    # Rule 4: unknown device
    if device_id.upper().startswith("UNKNOWN"):
        score += 25
        reasons.append("Unknown device")

    # Risk classification
    if score >= 60:
        risk_level = "HIGH"
        status = "FLAGGED"
    elif score >= 30:
        risk_level = "MEDIUM"
        status = "REVIEW"
    else:
        risk_level = "LOW"
        status = "APPROVED"

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "status": status,
        "reasons": reasons
    }