# Import Base and all models so that SQLAlchemy declarative system can bind them
from app.database.session import Base
from app.models.user import User
from app.models.session import RecyclingSession
from app.models.credit import Credit
from app.models.reward import Reward
from app.models.redemption import Redemption
from app.models.detection import Detection
