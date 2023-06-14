const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();

const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const stripe = require('stripe')(process.env.PAYMENT_SECRET_KEY)
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error: true, massage: 'unauthorize access'});
  }
  const token = authorization.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if(err){
      return res.status(401).send({error: true, massage: 'unauthorize access'})
    }
    req.decoded = decoded;
    next();
  })
}


const uri =
 "mongodb+srv://ahaduzzaman45503:d4IbTfNI8nR5uH0V@cluster0.qzwnegb.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


async function run() {
    try {

        await client.connect();
        
        
        const allInstractordatabase = client.db("football-acadamy");
        const allInstractorCollection = allInstractordatabase.collection("acadamy-person");
        const extradatabase = client.db("Extra-Section");
        const ExtraCollection = extradatabase.collection("Extra-Section-single");
        const footballclassdatabase = client.db("football-class");
        const footballclassCollection = footballclassdatabase.collection("football-class-info");
        const allusersdatabase = client.db("allusers");
        const allUsersCollection = allusersdatabase.collection("users");
        const addclassdatabase = client.db("add-class");
        const addClassCollection = addclassdatabase.collection("add-class-data");
        const SelectClassdatabase = client.db("select-class");
        const SelectClassCollection = SelectClassdatabase.collection("select-class-data");
        
        const verifyAdmin = async (req, res, next) => {
          const email = req.decoded.email;
          const query = {email: email}
          const user = await allUsersCollection.findOne(query);
          if(user?.role !== 'admin'){
            return res.status(403).send({error: true, massage: 'forbidden message'});
          }
          next()
        }
        
        app.get("/instractor", async (req, res) => {
          const cursor = allInstractorCollection.find();
          const result = await cursor.toArray();
          res.send(result);
        });

    
        app.get("/extrasection", async (req, res) => {
          const cursor = ExtraCollection.find();
          const result = await cursor.toArray();
          res.send(result);
        });

    
        app.get("/footballclass", async (req, res) => {
          const cursor = footballclassCollection.find();
          const result = await cursor.toArray();
          res.send(result);
        });

        app.put('/users/:email', async (req, res) => {
          const email = req.params.email
          const user = req.body
          console.log("user", user);
          const query = {email: email}
          const options = {upsert: true}
          const updateDoc = {
            $set: user,
          }
          const result = await allUsersCollection.updateOne(query, updateDoc, options)
          console.log(result)
          res.send(result)
        })

        app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
          const result = await allUsersCollection.find().toArray();
          res.send(result);
        })

        app.patch('/users/admin/:id', async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id)}
          const updateDoc = {
            $set: {
              role: 'admin'
            },
          };
          const result = await allUsersCollection.updateOne(filter, updateDoc);
          res.send(result)
        } )

        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
          const email = req.params.email;
          const query = {email: email}
          if(req.decoded.email !== email){
            res.send({ admin: false})
          }
          const user = await  allUsersCollection.findOne(query);
          const result = {admin: user?.role === 'admin'}
          res.send(result);
        })

        app.post('/jwt', (req, res)=> {
          const user = req.body;
          console.log(user);
          // console.log({jwt: process.env.ACCESS_TOKEN_SECRET});
          const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h'})
            res.send({ token })
        })

        // Add Class Data
    
        app.post("/addclassdata", async (req, res) => {
          const classData = req.body;
          console.log("new car data", classData);
          const result = await addClassCollection.insertOne(classData);
          res.send(result);
        });

        // Get All Class Data
        app.get("/addclassdata", async (req, res) => {
          const cursor = addClassCollection.find();
          const result = await cursor.toArray();
          res.send(result);
        });

        // Student Dashboard my Classes

        app.post("/selectclass", async (req, res) => {
          const singleClass = req.body; 
          const result = await SelectClassCollection.insertOne(singleClass)
          res.send(result);
        });

        app.get("/selectclass", verifyJWT, async (req, res) => {
          const cursor = SelectClassCollection.find();
          const decodedEmail = req.decoded.email;
          if(email !== decodedEmail){
            return res.status(401).send({error: true, massage: 'Porviden '});
          }
          const result = await cursor.toArray();
          res.send(result);
        });

        app.delete('/selectclass/:id', async(req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id)};
          const result = await SelectClassCollection.deleteOne(query);
          res.send(result)
        })

        // All about payment 
        app.post('/createpayment', async (req, res) => {
          const {price} = req.body;
          const amount = price * 100;
          const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            payment_method_types: ['card']
          });
          res.send({
            clientSecret: paymentIntent.client_secret
            })
          })

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