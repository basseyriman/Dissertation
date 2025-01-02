from fastapi import APIRouter

root_route = APIRouter()

@root_route.get("/")
def root():
    return {'message': 'Hello, World!'}
