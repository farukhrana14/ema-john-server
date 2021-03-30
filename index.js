const express = require("express");
const MongoClient = require("mongodb").MongoClient;
const cors = require("cors");
require("dotenv").config();
const port = 5000;


const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster2.p0yoe.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {useNewUrlParser: true, useUnifiedTopology: true,});

// The server app
const app = express();



// MiddleWare: parse application/x-www-form-urlencoded .. Cross Origin allowed by CORS
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//mongo connection

client.connect((err) => {
  const productsCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.COLLECTION_NAME}`);
  const ordersCollection = client.db(`${process.env.DB_NAME}`).collection('orders');
  
  //API for root
  app.get('/', (req, res)=> {
    res.send('db working ...')
  })




  //API for adding products by POST
    app.post('/addProduct', (req, res)=> {
        const product = req.body;
        productsCollection.insertOne(product)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    //API for sending data to frontend for all products 
    app.get('/products', (req, res)=> {
        productsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents);
        })
    })

    //API for sending data to frontend for single product by Key received from URL parameter
   app.get('/product/:key', (req, res)=> {
     console.log(req.params);
     productsCollection.find({key: req.params.key})
     .toArray((err, documents)=> {
      console.log(documents); 
      res.send(documents);
     })
   })
    
    
    //API for sending data to frontend for multiple products by Key received from body
    app.post('/productsByKeys', (req, res)=> {
        const productKeys = req.body;
        productsCollection.find({key: {$in: productKeys}})
        .toArray((err, documents) => {
            res.send(documents);
        })
        
    })

     //API for placing orders by POST
     app.post('/addOrder', (req, res)=> {
      const order = req.body;
      ordersCollection.insertOne(order)
      .then(result => {
          res.send(result.insertedCount > 0);
      })
  })

    


  console.log('DataBase Connected');
});

app.listen(process.env.PORT || port);
