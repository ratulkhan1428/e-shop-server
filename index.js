const express = require('express');
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const admin = require('firebase-admin');

const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tinmm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const productCollection = client.db("eShop").collection("products");
    const orderCollection = client.db("eShop").collection("orders");

    app.get('/products', (req, res) => {
        productCollection.find()
        .toArray((err, products) => {
            res.send(products)
        })
    })

    app.get('/product/:id', (req, res) => {
        productCollection.find({_id: ObjectId(req.params.id)})
        .toArray((err, products) => {
            res.send(products)
        })
    })

    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        console.log('adding new product: ', newProduct);
        productCollection.insertOne(newProduct)
        .then(result => {
            console.log('inserted count', result.insertedCount);
            res.send(result.insertedCount > 0);
        })

    })

    app.post('/addOrder', (req, res) => {
        const newOrder = req.body;
        orderCollection.insertOne(newOrder)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/orders', (req, res) => {
        orderCollection.find({})
        .toArray((err, products) => {
            res.send(products)
        })
    })

    app.delete('/deleteProduct/:id', (req, res) => {
        const id = ObjectId(req.params.id)
        console.log('delete this', id);
        productCollection.findOneAndDelete({_id: id})
        .then(result => {
            res.send(!!result.value)
            console.log(result.value)
        })
    })

    // app.get('/orders', (req, res) => {
    //     const bearer = req.headers.authorization;
    //     if(bearer && bearer.startsWith('Bearer ')) {
    //         const idToken = bearer.split(' ')[1];

    //         admin.auth().verifyIdToken(idToken)
    //         .then((decodedToken) => {
    //             const tokenEmail = decodedToken.email;
    //             const queryEmail = req.query.email;
    //             if(tokenEmail == queryEmail) {
    //                 orderCollection.find({email: queryEmail})
    //                 .toArray((err, products) => {
    //                     res.status(200).send(products);
    //                 })
    //             }
    //             else{
    //                 res.status(401).send('unauthorized access');
    //             }
    //         })
    //         .catch((error) => {
    //             res.status(401).send('unauthorized access');
    //         });
    //     }
    //     else{
    //         res.status(401).send('unauthorized access');
    //     }

    // })

//   client.close();
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})