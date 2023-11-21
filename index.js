const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
const BlogDB = "ProgrammingBlog";
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhtgohj.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient
const client = new MongoClient(uri);

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log("Connected to MongoDB!");
    const blogsCollection = client.db(BlogDB).collection("blogs");
    const wishlistCollection = client.db(BlogDB).collection("wishlist");

 // Routes
app.get('/allblogs', async (req, res) => {
  const options = {
    // Sort returned documents in descending order by date (latest first)
    sort: { date: -1 },
    // Include only the `date` field in each returned document
    projection: {},
  };
  const cursor = blogsCollection.find({}, options); // Pass the options object as the second parameter
  const result = await cursor.toArray();
  //   console.log(result);
  res.send(result);
});

    app.post('/allblogs', async (req, res)=> {
      const newBlog = req.body;
      const result = await blogsCollection.insertOne(newBlog);
      res.send(result);
    })
    app.put('/allblogs/:id', async (req, res) => {
      const id = req.params.id;
      console.log('Received ID:', id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateBlog = req.body;
      const blog = {
        $set: {
          title: updateBlog.title,
          image:updateBlog.image,
          category: updateBlog.category,
          short:updateBlog.short,
          long: updateBlog.long,
          time: updateBlog.time,
          date: updateBlog.date
        }
      };
      const result = await blogsCollection.updateOne(filter, blog, options);
      res.send(result);
    });


    // server
    app.get('/wishlist/:email', async (req, res)=>{
      const email = req.params.email;
      console.log(email);
      const cursor = wishlistCollection.find({email:email});
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/wishlist/:email', async (req, res)=>{
      const newWishlist = req.body;
      const result = await wishlistCollection.insertOne(newWishlist);
      console.log(result)
      res.send(result);
    })
    app.delete('/wishlist/:_id', async (req, res) => {
      const _id = req.params._id;
      console.log('Received delete request for ID:', _id); // Add this line for debugging
      const query = { _id: _id };
      const result = await wishlistCollection.deleteOne(query);
      console.log('Delete result:', result);
      res.send(result);
    });

  

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
