const express=require("express");
const cors=require("cors");
const dotenv=require("dotenv");
const db=require("./config/db");
const countriesRoutes=require("./routes/countries");
dotenv.config();

const app=express();

app.use(express.json());
app.use(cors());
app.use("/api", countriesRoutes);

const PORT=process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})
