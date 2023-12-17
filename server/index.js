import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import bcrypt from "bcrypt";

import { registerValidator } from "./validations/auth.js";

import UserModel from "./models/UserModel.js";
import checkAuth from "./utils/checkAuth.js";


const PORT = process.env.PORT;
const HOST = process.env.HOST;

const app = express();
mongoose
   .connect("mongodb+srv://admin:Lavetoi_12@cluster0.57v0xyp.mongodb.net/blog")
   .then(() => {
      console.log("DB ok");
   })
   .catch((err) => {
      console.log(`DB error: ${err}`);
   });

app.use(cors());
app.use(express.json());

app.post("/auth/login", async (req, res) => {
   try {
      const user = await UserModel.findOne({
         email: req.body.email,
      });

      if (!user) {
         return res.status(400).json({
            message: "Неверный логин или пароль",
         });
      }

      const isValidPass = await bcrypt.compare(
         req.body.password,
         user._doc.passwordHash
      );
      if (!isValidPass) {
         return res.status(400).json({
            message: "Неверный логин или пароль",
         });
      }

      const token = jwt.sign(
         {
            _id: user._id,
         },
         "secret123",
         {
            expiresIn: "30d",
         }
      );

      const { passwordHash, ...userData } = user._doc;

      res.json({
         ...userData,
         token,
      });
   } catch (error) {
      console.log(error);
      res.status(500).json({
         message: "Не удалось авторизоваться",
      });
   }
});

app.post("/auth/register", registerValidator, async (req, res) => {
   console.log(1);
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return res.status(400).json(errors.array());
      }

      const password = req.body.password;
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const doc = new UserModel({
         email: req.body.email,
         fullName: req.body.fullName,
         passwordHash: hash,
         avatarUrl: req.body.avatarUrl,
      });

      const user = await doc.save();

      const token = jwt.sign(
         {
            _id: user._id,
         },
         "secret123",
         {
            expiresIn: "30d",
         }
      );

      const { passwordHash, ...userData } = user._doc;

      res.json({
         ...userData,
         token,
      });
   } catch (error) {
      console.log(error);
      res.status(500).json({
         message: "Не удалось зарегистрироваться",
      });
   }
});

app.get("/auth/me", checkAuth,(req, res) => {
   try {
      res.json({
         message: "suuuc"
      })
   } catch (error) {
      
   }
})

app.listen(PORT, (err) => {
   if (err) return console.log(err);
   console.log(`Start on http://${HOST}:${PORT}`);
});
