import secrets
import string

def generate_redemption_code() -> str:
    # Generates a random alphanumeric secure code of length 6
    chars = string.ascii_uppercase + string.digits
    # Exclude confusing characters like O, 0, I, 1 for legibility
    clean_chars = ''.join(c for c in chars if c not in '01OI')
    code = ''.join(secrets.choice(clean_chars) for _ in range(6))
    return f"RW-{code}"
