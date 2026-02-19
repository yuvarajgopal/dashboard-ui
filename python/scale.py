from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient

app = FastAPI()

# Replace with your IDP values
JWKS_URL = "https://your-idp.com/.well-known/jwks.json"
ALGORITHM = "RS256"
AUDIENCE = "your-api-audience"
ISSUER = "https://your-idp.com/"

security = HTTPBearer()
jwks_client = PyJWKClient(JWKS_URL)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=[ALGORITHM],
            audience=AUDIENCE,
            issuer=ISSUER,
        )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def require_role(required_role: str):
    def role_checker(payload: dict = Depends(verify_token)):
        roles = payload.get("roles", [])
        if required_role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient role"
            )
        return payload
    return role_checker


@app.get("/admin")
def admin_endpoint(user=Depends(require_role("admin"))):
    return {"message": "Welcome Admin", "user": user}


@app.get("/user")
def user_endpoint(user=Depends(require_role("user"))):
    return {"message": "Welcome User", "user": user}

