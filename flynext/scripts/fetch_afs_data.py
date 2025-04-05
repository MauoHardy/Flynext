#!/usr/bin/env python3
import os
import json
import requests
import sqlite3
import hashlib
import sys

def get_api_key():
    return "2f88ac0eac2d31d33a35d5a297de403a39ff71f46e455426c6edcb07f078a107"

def fetch_data(endpoint):
    base_url = "https://advanced-flights-system.replit.app/api"
    url = f"{base_url}/{endpoint}"
    
    api_key = get_api_key()
    
    headers = {
        "x-api-key": api_key,
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        return None

def connect_to_db():
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
                          "prisma", "dev.db")
    
    if not os.path.exists(db_path):
        sys.exit(1)
        
    return sqlite3.connect(db_path)

def normalize_city_key(city, country):
    return f"{city.lower().strip()}_{country.lower().strip()}"

def save_cities(conn, cities):
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS City (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        country TEXT NOT NULL
    )
    ''')
    
    cursor.execute("DELETE FROM City")
    
    city_mapping = {}
    
    for city_data in cities:
        city_name = city_data['city']
        country = city_data['country']
        
        city_id = hashlib.md5(f"{city_name}_{country}".encode()).hexdigest()
        
        normalized_key = normalize_city_key(city_name, country)
        city_mapping[normalized_key] = {
            'id': city_id,
            'name': city_name,
            'country': country
        }
        
        cursor.execute(
            "INSERT INTO City (id, name, country) VALUES (?, ?, ?)",
            (city_id, city_name, country)
        )
    
    conn.commit()
    
    return city_mapping

def save_airports(conn, airports, city_mapping):
    cursor = conn.cursor()
    
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS Airport (
        id TEXT PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        cityId TEXT NOT NULL,
        FOREIGN KEY (cityId) REFERENCES City(id)
    )
    ''')
    
    cursor.execute("DELETE FROM Airport")
    
    saved_count = 0
    skipped_count = 0
    
    for airport in airports:
        city_name = airport['city']
        country = airport['country']
        
        normalized_key = normalize_city_key(city_name, country)
        
        if normalized_key in city_mapping:
            city_id = city_mapping[normalized_key]['id']
            
            try:
                cursor.execute(
                    "INSERT INTO Airport (id, code, name, cityId) VALUES (?, ?, ?, ?)",
                    (airport['id'], airport['code'], airport['name'], city_id)
                )
                saved_count += 1
            except sqlite3.Error as e:
                skipped_count += 1
        else:
            city_id = hashlib.md5(f"{city_name}_{country}".encode()).hexdigest()
            
            try:
                cursor.execute(
                    "INSERT INTO City (id, name, country) VALUES (?, ?, ?)",
                    (city_id, city_name, country)
                )
                
                cursor.execute(
                    "INSERT INTO Airport (id, code, name, cityId) VALUES (?, ?, ?, ?)",
                    (airport['id'], airport['code'], airport['name'], city_id)
                )
                
                city_mapping[normalized_key] = {
                    'id': city_id,
                    'name': city_name,
                    'country': country
                }
                
                saved_count += 1
            except sqlite3.Error as e:
                skipped_count += 1
    
    conn.commit()

def print_sample_data(cities, airports):
    city_dict = {f"{city['city']}_{city['country']}": city for city in cities}

def main():
    cities = fetch_data("cities")
    if not cities:
        sys.exit(1)
    
    airports = fetch_data("airports")
    if not airports:
        sys.exit(1)
    
    conn = connect_to_db()
    
    city_mapping = save_cities(conn, cities)
    save_airports(conn, airports, city_mapping)
    
    conn.close()

if __name__ == "__main__":
    main() 