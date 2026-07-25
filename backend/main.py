import os
from typing import List, Optional

import openai
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine, or_, select, and_
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.environ.get('DATABASE_URL', 'sqlite:///./houses.db')

engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

class HouseModel(Base):
    __tablename__ = 'houses'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(256), nullable=False)
    state = Column(String(128), nullable=False, default='Andhra Pradesh')
    city = Column(String(128), nullable=False, default='Vizag')
    area = Column(String(128), nullable=False, default='Bheemunipatnam')
    location = Column(String(256), nullable=False)
    rent = Column(Integer, nullable=False)
    description = Column(String(1024), nullable=False)

class ChatRequest(BaseModel):
    question: str

class House(BaseModel):
    id: int
    title: str
    state: str
    city: str
    area: str
    location: str
    rent: int
    description: str

HOUSES = [
    {
        'id': 1,
        'title': '2 BHK near Raghu Engineering College',
        'state': 'Andhra Pradesh',
        'city': 'Vizag',
        'area': 'Bheemunipatnam',
        'location': 'Bheemunipatnam, Vizag, Andhra Pradesh',
        'rent': 11000,
        'description': 'Well-ventilated 2 BHK with attached bathroom and parking. Close to Raghu Engineering College.',
    },
    {
        'id': 2,
        'title': '1 BHK Studio close to market',
        'state': 'Andhra Pradesh',
        'city': 'Nellore',
        'area': 'Market Center',
        'location': 'Market Center, Nellore, Andhra Pradesh',
        'rent': 9000,
        'description': 'Compact 1 BHK with water supply and local transport access. Ideal for singles or couples.',
    },
    {
        'id': 3,
        'title': '3 BHK family apartment',
        'state': 'Andhra Pradesh',
        'city': 'Guntur',
        'area': 'Brodipet',
        'location': 'Brodipet, Guntur, Andhra Pradesh',
        'rent': 15000,
        'description': 'Family-friendly apartment with lift and 24/7 security. Spacious rooms and modular kitchen.',
    },
    {
        'id': 4,
        'title': '2 BHK furnished flat',
        'state': 'Andhra Pradesh',
        'city': 'Vizag',
        'area': 'Rushikonda',
        'location': 'Rushikonda, Vizag, Andhra Pradesh',
        'rent': 13500,
        'description': 'Fully furnished 2 BHK with AC, Wi-Fi, and sea view. Walking distance to IT corridor.',
    },
    {
        'id': 5,
        'title': '1 BHK bachelor flat',
        'state': 'Andhra Pradesh',
        'city': 'Vizag',
        'area': 'Madhurawada',
        'location': 'Madhurawada, Vizag, Andhra Pradesh',
        'rent': 6500,
        'description': 'Affordable 1 BHK for bachelors. Nearby bus stop and grocery stores. No brokerage.',
    },
    {
        'id': 6,
        'title': '3 BHK villa with garden',
        'state': 'Andhra Pradesh',
        'city': 'Vizag',
        'area': 'MVP Colony',
        'location': 'MVP Colony, Vizag, Andhra Pradesh',
        'rent': 25000,
        'description': 'Premium 3 BHK villa with private garden, covered parking and UPS backup.',
    },
    {
        'id': 7,
        'title': 'Luxury 2 BHK in Tech Hub',
        'state': 'Telangana',
        'city': 'Hyderabad',
        'area': 'Gachibowli',
        'location': 'Gachibowli, Hyderabad, Telangana',
        'rent': 28000,
        'description': 'Modern gated community 2 BHK flat near DLF Cyber City with gym, pool and power backup.',
    },
    {
        'id': 8,
        'title': '3 BHK Premium High-Rise Apartment',
        'state': 'Karnataka',
        'city': 'Bengaluru',
        'area': 'Indiranagar',
        'location': 'Indiranagar, Bengaluru, Karnataka',
        'rent': 42000,
        'description': 'Spacious 3 BHK in prime Indiranagar location near metro station with luxury amenities.',
    },
]

app = FastAPI(title='AI House Rental Finder API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:3003',
    ],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


def create_db_and_seed() -> None:
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        # Re-seed if count doesn't match HOUSES length to refresh schema
        if session.query(HouseModel).count() < len(HOUSES):
            session.query(HouseModel).delete()
            for house_data in HOUSES:
                session.add(HouseModel(**house_data))
            session.commit()
    except Exception:
        session.rollback()
    finally:
        session.close()

create_db_and_seed()

@app.get('/houses', response_model=List[House])
def get_houses(
    q: Optional[str] = Query(None, description='Search term for houses'),
    state: Optional[str] = Query(None, description='Filter by State'),
    city: Optional[str] = Query(None, description='Filter by City'),
    area: Optional[str] = Query(None, description='Filter by Area/Locality'),
):
    session = SessionLocal()
    try:
        stmt = select(HouseModel)
        conditions = []

        if state and state.strip() and state != 'All':
            conditions.append(HouseModel.state.ilike(f'%{state.strip()}%'))
        if city and city.strip() and city != 'All':
            conditions.append(HouseModel.city.ilike(f'%{city.strip()}%'))
        if area and area.strip() and area != 'All':
            conditions.append(HouseModel.area.ilike(f'%{area.strip()}%'))

        if q and q.strip():
            search = f'%{q.strip()}%'
            conditions.append(
                or_(
                    HouseModel.title.ilike(search),
                    HouseModel.location.ilike(search),
                    HouseModel.description.ilike(search),
                    HouseModel.state.ilike(search),
                    HouseModel.city.ilike(search),
                    HouseModel.area.ilike(search),
                )
            )

        if conditions:
            stmt = stmt.where(and_(*conditions))

        result = session.execute(stmt).scalars().all()
        return result
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail='Failed to load houses')
    finally:
        session.close()

@app.get('/houses/{house_id}', response_model=House)
def get_house(house_id: int):
    session = SessionLocal()
    try:
        house = session.get(HouseModel, house_id)
        if house is None:
            raise HTTPException(status_code=404, detail='House not found')
        return house
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail='Failed to load house')
    finally:
        session.close()

@app.post('/chat')
def chat(request: ChatRequest):
    api_key = os.environ.get('OPENAI_API_KEY')
    if api_key:
        openai.api_key = api_key
        try:
            completion = openai.ChatCompletion.create(
                model='gpt-3.5-turbo',
                messages=[
                    {
                        'role': 'system',
                        'content': 'You are a helpful house rental assistant that responds with short recommendations based on budget, state, city, area, and house type.',
                    },
                    {'role': 'user', 'content': request.question},
                ],
                max_tokens=150,
                temperature=0.7,
            )
            answer = completion.choices[0].message.content.strip()
            return {'answer': answer}
        except Exception as exc:
            raise HTTPException(status_code=500, detail=str(exc))

    if '2 bhk' in request.question.lower():
        return {
            'answer': 'A strong match is 2 BHK near Raghu Engineering College in Bheemunipatnam, Vizag for ₹11,000.',
        }

    return {
        'answer': 'Please specify state, city, area, budget or house type to get tailored rental recommendations.',
    }
