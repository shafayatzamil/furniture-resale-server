const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.cruea6x.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.use(cors());
app.use(express.json());

async function run() {
  try {
    const usersCollection = client.db("furniture-db").collection("users");
    const productsCollection = client.db("furniture-db").collection("products");
    const bookingCollection = client.db("furniture-db").collection("bookings");
    const categoryCollection = client.db("furniture-db").collection("category");

    app.post("/users", async (req, res) => {
      const result = await usersCollection.insertOne(req.body);
      if (result.insertedId) {
        res.send({
          success: true,
          message: `Successfully created the  with id ${result.insertedId}`,
        });
      } else {
        res.send({
          success: false,
          error: "Couldn't create the product",
        });
      }
    });

    // user admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    // user admin update
    app.put("/user/admin/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      console.log(filter);
      const updateDoc = {
        $set: { role: "admin" },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.get("/myorder/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await bookingCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/myproduct/:email", async (req, res) => {
      const email = req.params.email;
      const query = { seller: email };
      const result = await productsCollection.find(query).toArray();
      res.send(result);
    });

    // admin check
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    // seller check
    app.get("/seller/:email", async (req, res) => {
      const email = req.params.email;

      const user = await usersCollection.findOne({ email: email });
      const isSeller = user.role === "seller";
      res.send({ seller: isSeller });
    });

    // alluser
    app.get("/users", async (req, res) => {
      const query = {};
      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    // delete user by admin
    app.delete("/users/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const signleUser = await usersCollection.findOne({ _id: ObjectId(id) });

        if (!signleUser?._id) {
          res.send({
            success: false,
            error: "User doesn't exist",
          });
          return;
        }

        const result = await usersCollection.deleteOne({ _id: ObjectId(id) });

        if (result.deletedCount) {
          res.send({
            success: true,
            message: `Successfully deleted the ${signleUser.name}`,
          });
        } else {
        }
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    //delet products by admin
    app.delete("/products/:id", async (req, res) => {
      const { id } = req.params;

      try {
        const signleProduct = await productsCollection.findOne({
          _id: ObjectId(id),
        });

        if (!signleProduct?._id) {
          res.send({
            success: false,
            error: "Product doesn't exist",
          });
          return;
        }

        const result = await productsCollection.deleteOne({
          _id: ObjectId(id),
        });

        if (result.deletedCount) {
          res.send({
            success: true,
            message: `Successfully deleted the ${signleProduct.name}`,
          });
        } else {
        }
      } catch (error) {
        res.send({
          success: false,
          error: error.message,
        });
      }
    });

    // add a booking
    app.post("/bookings", async (req, res) => {
      const result = await bookingCollection.insertOne(req.body);

      if (result.insertedId) {
        res.send({
          success: true,
          message: `Successfully created the  with id ${result.insertedId}`,
        });
      } else {
        res.send({
          success: false,
          error: "Couldn't create the product",
        });
      }
    });

    // add a products
    app.post("/addproducts", async (req, res) => {
      const result = await productsCollection.insertOne(req.body);

      if (result.insertedId) {
        res.send({
          success: true,
          message: `Successfully created the  with id ${result.insertedId}`,
        });
      } else {
        res.send({
          success: false,
          error: "Couldn't create the product",
        });
      }
    });

    //products by id
    app.get("/products/:id", async (req, res) => {
      const { id } = req.params;
      const signleProduct = await productsCollection.findOne({
        _id: ObjectId(id),
      });

      res.send(signleProduct);
    });

    // category
    app.get("/category", async (req, res) => {
      const cursor = categoryCollection.find({});
      const categories = await cursor.toArray();
      res.send(categories);
    });

    app.get("/category/:id", async (req, res) => {
      const { id } = req.params;
      const query = productsCollection.find({
        category: id,
      });

      const categoryItems = await query.toArray();

      res.send(categoryItems);
    });

    //product by name
    app.get("/products/:name", async (req, res) => {
      const name = req.params.name;
      console.log(name);
      const categoryItem = await productsCollection?.find(
        (p) => p.category == name
      );
      res.send(categoryItem);
    });

    // product by

    app.get("/products", async (req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    });

    console.log("Database Connected...");
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("server is running ...");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
