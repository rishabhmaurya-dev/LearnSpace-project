import express from "express";
import connectDB from "./config/database.js";
import app from "./app.js";

connectDB();

app.listen(3000,()=>{
   console.log("servr started successfully");
})