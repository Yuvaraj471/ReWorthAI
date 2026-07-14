from sqlalchemy.orm import Session
from typing import List, Dict
from app.models.credit import Credit
from app.repositories.credit_repository import CreditRepository
from fastapi import HTTPException, status

class CreditService:
    @staticmethod
    def get_credits_config(db: Session) -> List[Credit]:
        return CreditRepository.get_all(db)

    @staticmethod
    def update_credits_config(db: Session, credits_map: Dict[str, int]) -> List[Credit]:
        updated_list = []
        for waste_type, credit_value in credits_map.items():
            credit = CreditRepository.get_by_waste_type(db, waste_type)
            if not credit:
                # If category doesn't exist, create it
                new_credit = Credit(waste_type=waste_type, credits=credit_value)
                CreditRepository.create(db, new_credit)
                updated_list.append(new_credit)
            else:
                credit.credits = credit_value
                CreditRepository.update(db, credit)
                updated_list.append(credit)
        return updated_list
