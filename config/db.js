const mysql=require("mysql2");
const dotenv=require("dotenv");


dotenv.config();


const db=mysql.createConnection({
    host:process.env.DB_HOST,
    port:process.env.DB_PORT,
    passowrd:process.env.DB_PASSWORD,
    name:process.env.DB_NAME
});

db.connect((err)=>{
    if(err){
        console.error("mySQL connection error:",err);
    }
    console.log("MYSQL connected");
});

module.exports=db;