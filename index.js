const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

//code for mongodb database connection

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wdftcpy.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("MongoDB Connected !");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }

  // avoid try and finally
  // Connect the client to the server	(optional starting in v4.7)
  await client.connect();
  const db = client.db("herosHideout");
  const toysCollection = db.collection("allToy");

  //all get api

  // for load all data from this collection
  app.get("/allToy", async (req, res) => {
    const limit = parseInt(req.query?.limit);
    const allToy = await toysCollection.find({}).limit(limit).toArray();
    res.send(allToy);
  });

  // for search
  app.get("/findToyByName/:name", async (req, res) => {
    const name = req.params.name;

    const query = { name: { $regex: name, $options: "i" } };
    const result = await toysCollection.find(query).toArray();

    res.send(result);
  });

  // for load a toy data from this collection by id
  app.get("/toyDetails/:id", async (req, res) => {
    const toy = await toysCollection.findOne({
      _id: new ObjectId(req.params.id),
    });
    res.send(toy);
  });

  // for load all data from this collection by a user
  app.get("/myToys/:email", async (req, res) => {
    const sort = req.query?.sort;
    if (sort == true) {
      const myToys = await toysCollection
        .find({
          sellerMail: req.params.email,
        })
        .sort({ price: 1 })
        .collation({ locale: "en_US", numericOrdering: true })
        .toArray();
      res.send(myToys);
    } else {
      const myToys = await toysCollection
        .find({
          sellerMail: req.params.email,
        })
        .collation({ locale: "en_US", numericOrdering: true })
        .toArray();
      res.send(myToys);
    }
  });

  // for load all data from this collection by a sub-category
  app.get("/toysBySubCategory/:subCat", async (req, res) => {
    const subCategoryToys = await toysCollection
      .find({
        subCategory: req.params.subCat,
      })
      .toArray();
    res.send(subCategoryToys);
  });

  //all post api
  // for add a toy
  app.post("/addAToy", async (req, res) => {
    const body = req.body;
    const result = await toysCollection.insertOne(body);
    res.send(result);
  });

  // all put and fetch api

  // for edit a toy data from this collection by id
  app.put("/toyDetails/:id", async (req, res) => {
    const id = req.params.id;
    const updateToy = req.body;
    const filter = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        description: updateToy.description,
        name: updateToy.name,
        pictureUrl: updateToy.pictureUrl,
        price: updateToy.price,
        quantity: updateToy.quantity,
        rating: updateToy.rating,
        sellerMail: updateToy.sellerMail,
        sellerName: updateToy.sellerName,
        subCategory: updateToy.subCategory,
      },
    };
    const result = await toysCollection.updateOne(filter, updateDoc);
    res.send(result);
  });

  // all delete api
  // for delete a toy by id
  app.delete("/toyDetails/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await toysCollection.deleteOne(query);
    res.send(result);
  });
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(`
  <h1 style="text-align:center; margin-top:5rem">
      It's a Backed Server of 
      <b style="color:red;padding:2rem">Heros Hideout</b> Site !
      <br/><br/>
      Site Port : <b style="color:red"> ${port} </b>
  </h1>`);
});

app.listen(port, () => {
  console.log(`Assignment Eleven is On Port:${port}`);
});
