const express = require('express')
//add cors
const cors = require('cors')
const app = express()
//add process.env.PORT
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

//MongoDb--Start
const { MongoClient, ServerApiVersion } = require('mongodb');
//Enter userID and password from the mongodb database
const uri = `mongodb+srv://twitter_admin:OxDqgqNVxwO4PxTG@twitter.qzxb7at.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
     // } finally {
    //   // Ensures that the client will close when you finish/error
    //   await client.close();
    
    const postCollection = client.db('database').collection('posts') //this is post collection
    const userCollection = client.db('database').collection('users') //this is user collection

    // get posts from the post collection
    app.get('/post', async (req, res)=>{
      // Find all the post
      const post = (await postCollection.find().toArray()).reverse();
      // send all the post to the frontend
      res.send(post);
    })

    // post: insert posts in twitter in the post collection
    app.post('/post', async (req, res) =>{
      // get the body of the post i.e. data in the post
      const post = req.body;
      // wait for the insertion or adding of the post in the posts collection
      const result = await postCollection.insertOne(post);
      // send result to the frontend
      res.send(result);
    }) 

    //getting user from the database
    app.get('/loggedInUser', async (req, res) => {
      const email = req.query.email;
      const user = await userCollection.find({email: email}).toArray();
      res.send(user);
    })

    app.get('/userPost', async (req, res) => {
      const email = req.query.email;
      const post = (await postCollection.find({email: email}).toArray()).reverse();
      res.send(post);
    })

    app.get('/user', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.post('/register', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    // patch method to update
    app.patch('/userUpdates/:email', async (req, res)=>{   //email as a parameter
      const filter = req.params;  //get email from frontend
      const profile = req.body;
      const options = {upsert:true};
      const updateDoc = {$set:profile};
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

  } catch(error){
    console.log(error);
  }
}
run().catch(console.dir);
//Mongodb-end

app.get('/', (req, res) => {
  res.send('Hello From Twitter')
})

app.listen(port, () => {
  console.log(`Twitter app listening on port ${port}`)
})