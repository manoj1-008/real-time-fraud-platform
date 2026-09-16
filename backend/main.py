from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import Transaction
from fraud_engine import calculate_risk


app = FastAPI(title="Real-Time Fraud Detection Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


class TransactionRequest(BaseModel):
    customer_id: str
    amount: float
    location: str
    transaction_type: str
    device_id: str


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/transactions")
def create_transaction(
    transaction_data: TransactionRequest,
    db: Session = Depends(get_db)
):

    fraud_result = calculate_risk(
        amount=transaction_data.amount,
        location=transaction_data.location,
        transaction_type=transaction_data.transaction_type,
        device_id=transaction_data.device_id
    )

    transaction = Transaction(
        customer_id=transaction_data.customer_id,
        amount=transaction_data.amount,
        location=transaction_data.location,
        transaction_type=transaction_data.transaction_type,
        device_id=transaction_data.device_id,
        risk_score=fraud_result["risk_score"],
        risk_level=fraud_result["risk_level"],
        status=fraud_result["status"]
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {
        "transaction_id": transaction.id,
        "risk_score": transaction.risk_score,
        "risk_level": transaction.risk_level,
        "status": transaction.status,
        "reasons": fraud_result["reasons"]
    }
@app.get("/transactions")
def get_transactions(db: Session = Depends(get_db)):
    transactions = (
        db.query(Transaction)
        .order_by(Transaction.id.desc())
        .all()
    )

    return transactions
@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):

    transactions = db.query(Transaction).all()

    total_transactions = len(transactions)

    flagged_transactions = sum(
        1 for t in transactions
        if t.status == "FLAGGED"
    )

    high_risk_transactions = sum(
        1 for t in transactions
        if t.risk_level == "HIGH"
    )

    medium_risk_transactions = sum(
        1 for t in transactions
        if t.risk_level == "MEDIUM"
    )

    low_risk_transactions = sum(
        1 for t in transactions
        if t.risk_level == "LOW"
    )

    return {
        "total_transactions": total_transactions,
        "flagged_transactions": flagged_transactions,
        "high_risk_transactions": high_risk_transactions,
        "medium_risk_transactions": medium_risk_transactions,
        "low_risk_transactions": low_risk_transactions
    }