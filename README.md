# 🌍 Country Currency & Exchange API

A RESTful API that fetches country data and currency exchange rates from external APIs, calculates estimated GDP, stores the information in a MySQL database, and provides endpoints for querying and managing the data.  
Includes automatic summary image generation.

---

## 🚀 Features

- Fetch and cache **country data** from RestCountries API
- Fetch **currency exchange rates** from Open Exchange Rate API
- Compute **estimated GDP** using population and dynamic multipliers
- Store and **update** data in MySQL
- **CRUD operations** for countries
- Filter & sort countries:
  - `?region=Africa`
  - `?currency=NGN`
  - `?sort=gdp_desc | gdp_asc`
- Generate & serve **summary image** showing:
  - Total number of countries
  - Top 5 highest estimated GDP countries
  - Last refresh timestamp
- Status endpoint for health monitoring

---

## 🛠️ Tech Stack

| Component | Technology |
|----------|------------|
| Server | Node.js + Express |
| Database | MySQL |
| HTTP Fetch | Axios |
| Image Generation | Node Canvas |
| Environment Config | dotenv |

---

## 📦 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/countries/refresh` | Fetch external APIs, compute GDP, store/update DB, generate summary image |
| `GET` | `/countries` | Get all countries (supports filtering & sorting) |
| `GET` | `/countries/:name` | Get a single country by name |
| `DELETE` | `/countries/:name` | Delete a country |
| `GET` | `/status` | Get total countries and last refresh timestamp |
| `GET` | `/countries/image` | Returns the generated summary image |

---

## 🔍 Query Parameters

| Parameter | Example | Description |
|----------|----------|-------------|
| `region` | `/countries?region=Africa` | Filter by region |
| `currency` | `/countries?currency=USD` | Filter by currency code |
| `sort` | `/countries?sort=gdp_desc` | Sort by estimated GDP |

---


---

## 🗄️ Database Schema

```sql
CREATE TABLE Countries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capital VARCHAR(255),
  region VARCHAR(255),
  population BIGINT NOT NULL,
  currency_code VARCHAR(10),
  exchange_rate DECIMAL(18, 6),
  estimated_gdp DECIMAL(30, 2),
  flag_url TEXT,
  last_refreshed_at DATETIME
);


## 🗄️ Clone Repository

git clone <YOUR_REPOSITORY_URL>
cd <repo-folder>


## 🗄️ Install dependencies
npm install

## 🗄️Create .env file
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdbname
PORT=5000


