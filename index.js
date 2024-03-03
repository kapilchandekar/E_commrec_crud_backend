const express = require("express");
const cors = require("cors");
require("./db/config");
const User = require("./db/user");
const Product = require("./db/product");
const jwt = require("jsonwebtoken");
const jwt_key = "e-comm";
const app = express();
// Enable CORS for all routes
app.use(cors());
app.use(express.json());

app.post("/register", async (req, resp) => {
  if (req.body.email && req.body.name && req.body.password) {
    let user = new User(req.body);
    let result = await user.save();
    result = result.toObject();
    delete result.password;
    resp.send(result);
  } else {
    resp.status(403).send({ Error: "Fields are missing" });
  }
});

app.post("/login", async (req, resp) => {
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      jwt.sign({ user }, jwt_key, { expiresIn: "24hr" }, (error, token) => {
        resp.send({ Result: "Logged In Successfully", authToken: token });
      });
    } else {
      resp.status(404).send({ error: "No User Found" });
    }
  } else {
    resp.status(404).send({ Error: "Email or Password are missing" });
  }
});

app.post("/add-product", async (req, resp) => {
  let product = new Product(req.body);
  let result = await product.save();
  resp.send(result);
});

app.get("/products", async (req, resp) => {
  let products = [];
  products = await Product.find();
  if (products.length > 0) {
    resp.send(products);
  } else {
    resp.send(products);
  }
});

app.delete("/product-delete/:id", async (req, resp) => {
  let result = await Product.deleteOne({ _id: req.params.id });
  resp.send(result);
});

app.get("/product-details/:id", async (req, resp) => {
  try {
    let result = await Product.findOne({ _id: req.params.id });

    if (result) {
      // If result is not null or undefined, send the result
      resp.send(result);
    } else {
      // If result is null or undefined, send an appropriate response
      resp.send({ result: "Not found" });
    }
  } catch (error) {
    console.error(error);
    resp.status(500).send({ error: "Internal Server Error" });
  }
});

app.put("/update-product/:id", async (req, resp) => {
  let result = await Product.updateOne(
    { _id: req.params.id },
    { $set: req.body }
  );
  resp.send(result);
});

app.get("/search/:key", async (req, resp) => {
  let result = await Product.find({
    $or: [
      { name: { $regex: req.params.key } },
      { category: { $regex: req.params.key } },
      { company: { $regex: req.params.key } },
      { price: { $regex: req.params.key } },
    ],
  });
  resp.send(result);
});

app.listen(5000);
