from sqlalchemy.orm import Session
from app.models.user import User
from app.models.credit import Credit
from app.models.reward import Reward
from app.core.security import get_password_hash
from app.core.constants import UserRole, DEFAULT_WASTE_CREDITS


def seed_database(db: Session) -> None:
    # 1. Seed Default Administrator account if it doesn't exist
    admin_email = "adminreworthai@gmail.com"
    admin = db.query(User).filter(User.email == admin_email).first()

    if not admin:
        hashed_password = get_password_hash("sanjai.t112233")
        new_admin = User(
            name="System Administrator",
            email=admin_email,
            hashed_password=hashed_password,
            role=UserRole.ADMIN.value,
            is_active=True,
            eco_credits=0,
            carbon_saved=0.0,
            total_sessions=0
        )
        db.add(new_admin)
        db.commit()
        print(f"Admin account successfully seeded: {admin_email}")
    else:
        print("Admin account already configured. Skipping seed.")

    # 2. Seed Default Credits table if empty
    credits_count = db.query(Credit).count()
    if credits_count == 0:
        for waste_type, credit_value in DEFAULT_WASTE_CREDITS.items():
            new_credit = Credit(
                waste_type=waste_type,
                credits=credit_value
            )
            db.add(new_credit)
        db.commit()
        print("Default waste credits categories successfully seeded.")
    else:
        # Update existing credits to match current spec (idempotent)
        for waste_type, credit_value in DEFAULT_WASTE_CREDITS.items():
            existing = db.query(Credit).filter(Credit.waste_type == waste_type).first()
            if existing:
                existing.credits = credit_value
            else:
                db.add(Credit(waste_type=waste_type, credits=credit_value))
        # Remove old "Biodegradable" entry if it exists (renamed to "Biodegradable Waste")
        old_bio = db.query(Credit).filter(Credit.waste_type == "Biodegradable").first()
        if old_bio:
            db.delete(old_bio)
        db.commit()
        print("Credits configurations verified and updated.")

    # 3. Seed Default Rewards if empty
    rewards_count = db.query(Reward).count()
    if rewards_count == 0:
        default_rewards = [
            Reward(
                title="₹15 Café Voucher",
                category="Cafe Voucher",
                description="Redeem for a ₹15 discount at the campus café on any food or beverage item.",
                cost=150,
                stock=50,
                image="☕"
            ),
            Reward(
                title="₹20 Café Voucher",
                category="Cafe Voucher",
                description="Redeem for a ₹20 discount at the campus café on any food or beverage item.",
                cost=200,
                stock=50,
                image="🍵"
            ),
            Reward(
                title="₹25 Café Voucher",
                category="Cafe Voucher",
                description="Redeem for a ₹25 discount at the campus café on any food or beverage item.",
                cost=250,
                stock=30,
                image="🧋"
            ),
            Reward(
                title="₹20 Stationery Voucher",
                category="Stationery Voucher",
                description="Redeem for a ₹20 discount at the campus stationery shop on any supplies.",
                cost=200,
                stock=40,
                image="✏️"
            ),
            Reward(
                title="₹30 Stationery Voucher",
                category="Stationery Voucher",
                description="Redeem for a ₹30 discount at the campus stationery shop on any supplies.",
                cost=300,
                stock=30,
                image="📚"
            ),
        ]
        for reward in default_rewards:
            db.add(reward)
        db.commit()
        print("Default rewards catalog successfully seeded.")
    else:
        print("Rewards catalog already exists. Skipping seed.")
