const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri =
 "mongodb+srv://ahaduzzaman45503:d4IbTfNI8nR5uH0V@cluster0.qzwnegb.mongodb.net/?retryWrites=true&w=majority";

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
        const allInstractordatabase = client.db("football-acadamy");
        const allInstractorCollection = allInstractordatabase.collection("acadamy-person");
    
        app.get("/instractor", async (req, res) => {
          const cursor = allInstractorCollection.find();
          const result = await cursor.toArray();
          res.send(result);
        });

        const extradatabase = client.db("Extra-Section");
        const ExtraCollection = extradatabase.collection("Extra-Section-single");
    
        app.get("/extrasection", async (req, res) => {
          const cursor = ExtraCollection.find();
          const result = await cursor.toArray();
          res.send(result);
        });
  
      console.log(
        "Pinged your deployment. You successfully connected to MongoDB!"
      );
    } finally {
    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Server is running')
})

app.listen(port, () => {
  console.log(`Football accadamy ai rastay colthe che ${port}`)
})