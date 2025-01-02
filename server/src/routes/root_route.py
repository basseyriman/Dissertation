from fastapi import APIRouter
from rich.pretty import pprint

from .model_route import model_route
from .test_route import test_route

app_route = APIRouter()


@app_route.get("/")
def root():
    return {'message': 'Hello, World!'}


# attach other routes to main route
app_route.include_router(model_route)
app_route.include_router(test_route)
