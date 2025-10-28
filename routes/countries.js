const express = require("express");
const router = express.Router();
const db = require("../config/db");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Canvas = require("canvas");

function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
}

router.post("/countries/refresh", async (req, res) => {
  try {
    const countriesRes = await axios.get("https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies");
    const exchangeRatesRes = await axios.get("https://open.er-api.com/v6/latest/USD");
    const countries = countriesRes.data;
    const exchangeRates = exchangeRatesRes.data.rates;

    for (const c of countries) {
      const name = c.name;
      const capital = c.capital || null;
      const region = c.region || null;
      const population = c.population;
      const flag_url = c.flag || null;
      const currency_code = c.currencies?.[0]?.code || null;
      const exchange_rate = currency_code ? exchangeRates[currency_code] || null : null;
      let estimated_gdp = null;

      if (exchange_rate && population) {
        const m = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
        estimated_gdp = (population * m) / exchange_rate;
      }

      const existing = await query("SELECT id FROM Countries WHERE LOWER(name)=LOWER(?)", [name]);

      if (existing.length > 0) {
        await query(
          "UPDATE Countries SET capital=?, region=?, population=?, currency_code=?, exchange_rate=?, estimated_gdp=?, flag_url=?, last_refreshed_at=NOW() WHERE id=?",
          [capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, existing[0].id]
        );
      } else {
        await query(
          "INSERT INTO Countries (name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url, last_refreshed_at) VALUES (?,?,?,?,?,?,?, ?, NOW())",
          [name, capital, region, population, currency_code, exchange_rate, estimated_gdp, flag_url]
        );
      }
    }

    const total = await query("SELECT name, estimated_gdp FROM Countries ORDER BY estimated_gdp DESC LIMIT 5");
    const count = await query("SELECT COUNT(*) AS total FROM Countries");
    const canvas = Canvas.createCanvas(700, 400);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 700, 400);
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText("Total Countries: " + count[0].total, 20, 40);
    ctx.fillText("Top 5 Countries by GDP:", 20, 80);
    let y = 120;
    for (const x of total) {
      ctx.fillText(x.name + " - " + (x.estimated_gdp || 0).toFixed(2), 20, y);
      y += 40;
    }
    const imagePath = path.join(__dirname, "..", "cache", "summary.png");
    if (!fs.existsSync(path.join(__dirname, "..", "cache"))) fs.mkdirSync(path.join(__dirname, "..", "cache"));
    fs.writeFileSync(imagePath, canvas.toBuffer("image/png"));

    return res.json({ message: "Countries refreshed successfully" });

  } catch (error) {
    return res.status(503).json({ error: "External data source unavailable", details: error.message });
  }
});

router.get("/countries", async (req, res) => {
  try {
    const { region, currency, sort } = req.query;
    let sql = "SELECT * FROM Countries WHERE 1=1";
    const params = [];

    if (region) {
      sql += " AND region = ?";
      params.push(region);
    }

    if (currency) {
      sql += " AND currency_code = ?";
      params.push(currency);
    }

    if (sort === "gdp_desc") sql += " ORDER BY estimated_gdp DESC";
    else if (sort === "gdp_asc") sql += " ORDER BY estimated_gdp ASC";

    const results = await query(sql, params);
    return res.json(results);

  } catch {
    return res.status(500).json({ error: "Internal server error" });
  }
});


router.get("/status", async (req, res) => {
  const count = await query("SELECT COUNT(*) AS total FROM Countries");
  const last = await query("SELECT last_refreshed_at FROM Countries ORDER BY last_refreshed_at DESC LIMIT 1");
  return res.json({
    total_countries: count[0].total,
    last_refreshed_at: last[0]?.last_refreshed_at || null
  });
});

router.get("/countries/image", (req, res) => {
  const file = path.join(__dirname, "..", "cache", "summary.png");
  console.log("LOOKING FOR IMAGE AT:", file); 
  if (!fs.existsSync(file)) return res.status(404).json({ error: "Summary image not found" });
  return res.sendFile(file);
});


router.get("/countries/:name", async (req, res) => {
  const r = await query("SELECT * FROM Countries WHERE LOWER(name)=LOWER(?)", [req.params.name]);
  if (r.length === 0) return res.status(404).json({ error: "Country not found" });
  return res.json(r[0]);
});

router.delete("/countries/:name", async (req, res) => {
  const r = await query("DELETE FROM Countries WHERE LOWER(name)=LOWER(?)", [req.params.name]);
  if (r.affectedRows === 0) return res.status(404).json({ error: "Country not found" });
  return res.json({ message: "Country deleted successfully" });
});

module.exports = router;
