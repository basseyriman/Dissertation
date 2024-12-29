from fastapi import APIRouter

test_route = APIRouter(prefix="/test", tags=["test"])


@test_route.get('/')
async def test():
    return {
        "message": "You have hit the test route!",
        "status": "success"
    } 