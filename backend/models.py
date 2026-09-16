from sqlalchemy import Column, Integer, String, Float
from database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(String, nullable=False)

    amount = Column(Float, nullable=False)

    location = Column(String, nullable=False)

    transaction_type = Column(String, nullable=False)

    device_id = Column(String, nullable=False)

    risk_score = Column(Integer, nullable=True)

    risk_level = Column(String(20), nullable=True)

    status = Column(String(20), default="PENDING")