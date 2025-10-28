const mysql=require("mysql2");
const dotenv=require("dotenv");


dotenv.config();


const db=mysql.createConnection({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database:process.env.DB_NAME
});

db.connect((err)=>{
    if(err){
        console.error("mySQL connection error:",err);
    }
    console.log("MYSQL connected");
});

db.query(`

    CREATE TABLE IF NOT EXISTS Countries(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capital VARCHAR(255),
    region VARCHAR(255),
    population BIGINT NOT NULL,
    currency_code VARCHAR(10),
    exchange_rate FLOAT,
    estimated_gdp DOUBLE,
    flag_url VARCHAR(255),
    last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
    `);

module.exports=db;