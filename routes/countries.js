const express = require("express");
const router = express.Router();
const db = require("../config/db");
const axios = require("axios");


function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

router.post("/refresh", async (req, res) => {
  try {

    const countriesRes = await axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies");
    const exchangeRatesRes = await axios.get("https://open.er-api.com/v6/latest/USD");

    const countries = countriesRes.data;
    const exchangeRates = exchangeRatesRes.data.rates;

    for (const country of countries) {
      const name = country.name;
      const capital = country.capital || null;
      const region = country.region || null;
      const population = country.population;
      const flag_url = country.flag || null;

      const currency_code = country.currencies?.[0]?.code || null;
      const exchange_rate = currency_code ? exchangeRates[currency_code] || null : null;

    
      let estimated_gdp = 0;
      if (exchange_rate && population) {
        const multiplier = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
        estimated_gdp = (population * multiplier) / exchange_rate;
      }

    
      if (!name || !population || !currency_code) {
        continue; 
      }

      
      const existing = await query("SELECT id FROM Countries WHERE LOWER(name)=LOWER(?)", [name]);

      if (existing.length > 0) {
       
        await query(
          `UPDATE Countries SET capital=?, region=?, population=?, currency_code=?, exchange_rate=?, estimated_gdp=?, flag_url=?, last_refreshed_at=NOW()
           WHERE id=?`,
          [capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, existing[0].id]
        );
      } else {
       
        await query(
          `INSERT INTO Countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at)
           VALUES (?,?,?,?,?,?,?,?,NOW())`,
          [name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url]
        );
      }
    }

    return res.status(200).json({ message: "Countries refreshed successfully" });

  } catch (error) {
    console.error("Refresh error:", error.message);
    return res.status(503).json({
      error: "External data source unavailable",
      details: error.message,
    });
  }
});


router.get('/countries', async (req,res)=>{
  await db.query("SELECT * FROM Countries ")
})


router.get('/countries/:name', async (req,res)=>{
  const country=await db.query("SELECT * FROM Countries WHERE name=?", [req.params.name]);
  res.json(200).json(country);
})

router.delete('/countries/:name', async(req,res)=>{
  await db.query("DELETE FROM Countries WHERE name=?", [req.params.name]);
  res.json(200).status()
})

module.exports = router;
