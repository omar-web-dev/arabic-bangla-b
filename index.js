const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.vbwbv4w.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();

    //collections
    const categoriesCollection = client
      .db("arabic-bangla")
      .collection("categories");
    const subCategoriesCollection = client
      .db("arabic-bangla")
      .collection("sub-category");

    //apis
    //get all categories
    app.get("/categories", async (req, res) => {
      const categories = await categoriesCollection.find({}).toArray();
      res.send(categories);
    });

    app.get("/sub-category", async (req, res) => {
      let query = {};
      if (req.query.category) {
        query = {
          category: req.query.category,
        };
      }
      const cursor = subCategoriesCollection.find(query);
      const review = await cursor.toArray();
      res.send(review);
    });

    //get a category
    app.get("/category/:id", async (req, res) => {
      const category = await categoriesCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(category);
    });

    app.put("/category/:id", async (req, res) => {
      const category = req.body;
      const filter = { _id: new ObjectId(req.params.id) };
      const updatedDoc = {
        $set: category,
      };
      const options = { upsert: true };
      const result = await categoriesCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    // add sub category
    app.post("/sub-category", async (req, res) => {
      const subCategory = req.body;
      const result = await subCategoriesCollection.insertOne(subCategory);
      res.send(result);
    });
    // get sub category by slug
    app.get("/sub-category/:slug", async (req, res) => {
      const subcategory = await subCategoriesCollection.findOne({
        slug: req.params.slug,
      });
      res.send(subcategory);
    });
    // get all sub categories
    app.get("/sub-categories", async (req, res) => {
      const subCategories = await subCategoriesCollection.find({}).toArray();
      res.send(subCategories);
    });
    //delete sub category by _id
    app.delete("/delete-sub-category/:id", async (req, res) => {
      const id = req.params.id;
      const result = await subCategoriesCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });
    //patch sub category by slug
    app.patch("/update-sub-category/:slug", async (req, res) => {
      const content = req.body;
      const filter = { slug: req.params.slug };
      const updatedDoc = {
        $set: content,
      };
      const result = await subCategoriesCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });
    console.log("Connected to Database");
  } finally {
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Arabic-Bangla");
});
app.listen(port, () => console.log(`Listening on port ${port}`));