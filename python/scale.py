import logging
import os
from functools import lru_cache

import jwt
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s - %(message)s",
)
logger = logging.getLogger("scale-api")

# ---------------------------------------------------------------------------
# IDP Configuration  (override via environment variables in your K8s pod spec)
# ---------------------------------------------------------------------------
JWKS_URL   = os.getenv("JWKS_URL",   "https://your-idp.com/.well-known/jwks.json")
ALGORITHM  = os.getenv("JWT_ALGORITHM", "RS256")
AUDIENCE   = os.getenv("JWT_AUDIENCE",  "your-api-audience")
ISSUER     = os.getenv("JWT_ISSUER",    "https://your-idp.com/")

# Some IDPs embed roles in a nested claim (e.g. Keycloak uses realm_access.roles).
# Set ROLES_CLAIM_PATH to a dot-separated path, e.g. "realm_access.roles".
# For flat claims (Okta, Auth0, Azure AD) set it to just "roles".
ROLES_CLAIM_PATH = os.getenv("ROLES_CLAIM_PATH", "roles")

# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------
app = FastAPI(title="Scale API", version="1.0.0")
security = HTTPBearer()


# ---------------------------------------------------------------------------
# JWKS client — cached so we reuse connections across requests
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def get_jwks_client() -> PyJWKClient:
    return PyJWKClient(JWKS_URL, cache_keys=True)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _extract_roles(payload: dict) -> list[str]:
    """
    Walk ROLES_CLAIM_PATH (dot-separated) through the payload dict.
    Returns a flat list of role strings, or [] if the path doesn't exist.

    Examples
    --------
    ROLES_CLAIM_PATH="roles"                   -> payload["roles"]
    ROLES_CLAIM_PATH="realm_access.roles"      -> payload["realm_access"]["roles"]
    ROLES_CLAIM_PATH="resource_access.api.roles"
    """
    parts = ROLES_CLAIM_PATH.split(".")
    node = payload
    for part in parts:
        if not isinstance(node, dict):
            return []
        node = node.get(part)
        if node is None:
            return []
    if isinstance(node, list):
        return [str(r) for r in node]
    return []


# ---------------------------------------------------------------------------
# Core dependency: validate JWT and return decoded payload
# ---------------------------------------------------------------------------
def verify_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    token = credentials.credentials
    client_ip = request.headers.get("X-Forwarded-For", request.client.host)

    try:
        jwks_client = get_jwks_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=[ALGORITHM],
            audience=AUDIENCE,
            issuer=ISSUER,
            options={"require": ["exp", "iat", "iss", "sub"]},
        )

        subject = payload.get("sub", "unknown")
        logger.info("Token verified | sub=%s | ip=%s | path=%s", subject, client_ip, request.url.path)
        return payload

    except jwt.ExpiredSignatureError:
        logger.warning("Expired token | ip=%s", client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidAudienceError:
        logger.warning("Invalid audience | ip=%s", client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token audience mismatch",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidIssuerError:
        logger.warning("Invalid issuer | ip=%s", client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token issuer mismatch",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        logger.warning("Invalid token | ip=%s | reason=%s", client_ip, exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as exc:
        logger.error("Token verification error | ip=%s | error=%s", client_ip, exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ---------------------------------------------------------------------------
# Role-gating dependency factory
# ---------------------------------------------------------------------------
def require_role(required_role: str):
    """
    Returns a FastAPI dependency that enforces the caller has `required_role`
    inside their JWT before the endpoint is executed.
    """
    def role_checker(
        request: Request,
        payload: dict = Depends(verify_token),
    ) -> dict:
        roles = _extract_roles(payload)
        subject = payload.get("sub", "unknown")

        if required_role not in roles:
            logger.warning(
                "Authorization denied | sub=%s | required=%s | has=%s | path=%s",
                subject, required_role, roles, request.url.path,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{required_role}' is required to access this resource",
            )

        logger.info(
            "Authorization granted | sub=%s | role=%s | path=%s",
            subject, required_role, request.url.path,
        )
        return payload

    return role_checker


# ---------------------------------------------------------------------------
# Protected endpoints  (require "update" role)
# ---------------------------------------------------------------------------
@app.post("/engine")
def engine_endpoint(
    request: Request,
    user: dict = Depends(require_role("update")),
):
    """
    Trigger engine operation.
    Requires Bearer token with role 'update'.
    """
    return {
        "status": "ok",
        "endpoint": "engine",
        "message": "Engine operation triggered",
        "initiated_by": user.get("sub"),
    }


@app.post("/scale")
def scale_endpoint(
    request: Request,
    user: dict = Depends(require_role("update")),
):
    """
    Trigger scale operation.
    Requires Bearer token with role 'update'.
    """
    return {
        "status": "ok",
        "endpoint": "scale",
        "message": "Scale operation triggered",
        "initiated_by": user.get("sub"),
    }


# ---------------------------------------------------------------------------
# Health / readiness probe  (no auth — nginx / K8s liveness check)
# ---------------------------------------------------------------------------
@app.get("/health")
def health():
    return {"status": "healthy"}


@app.get("/ready")
def ready():
    return {"status": "ready"}
