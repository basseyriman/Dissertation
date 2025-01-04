from fastapi import APIRouter
from src.routes.model_route import model_route
from src.routes.test_route import test_route

root_route = APIRouter()


@root_route.get("/")
def root():
    return {'message': 'Hello, World!'}


root_route.include_router(model_route)
root_route.include_router(test_route)
