const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
const port = process.env.PORT || 5000;

// mideware
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vo9rggr.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


// // verify jwt
// const verifyJWT = (req, res, next) => {
//     console.log('hitting veryfi jwt')
//     console.log(req.header.authorization);
//     const authorization = req.headers.authorization;
//     if (!authorization) {
//         return res.status(401).send({ error: true, message: "unauthorized access" })
//     }
//     const token = authorization.split(' '[1]);
//     console.log('token inside verify jwt', token);
//     jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
//         if (error) {
//             return res.status(403).send({ error: true, message: 'unauthorized access' })
//         }
//         req.decoded = decoded;
//         next();
//     })
// }

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        // service
        const carDoctorData = client.db('carDoctor').collection('services')
        // booking data
        const bookingCollection = client.db('carDoctor').collection('bookings')


        // jwt token er jonno /////////// tar por ai khan theke login page a
        app.post('/jwt', (req, res) => {
            const user = req.body;
            console.log(user);

            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '1h' })
            res.send({ token })

        })
        ///////////////////////// jwt end

        // SERVICES DATA
        app.get('/services', async (req, res) => {
            const result = await carDoctorData.find().toArray()
            res.send(result)
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {

                // Include only the `title` and `imdb` fields in the returned document
                projection: { title: 1, price: 1, service_id: 1, img: 1 },
            };
            const result = await carDoctorData.findOne(query, options)
            res.send(result)
        })

        // bookings data
        app.get('/bookings', async (req, res) => {
            const decoded = req.decoded;
            console.log('come back after verify', decoded);
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray()
            res.send(result)
        })

        // form theke data aner jonno
        app.post('/bookings', async (req, res) => {
            const books = req.body;
            console.log(books);
            const result = await bookingCollection.insertOne(books)
            res.send(result)
        })

        app.delete('/bookings/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.send(result)
        })

        // confirm button er
        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const updateBooking = req.body;
            console.log(updateBooking);
            const updateDoc = {
                $set: {
                    status: updateBooking.status
                },
            };

            const result = await bookingCollection.updateOne(filter, updateDoc)
            res.send(result)

        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Car Doctor is Running')
})

app.listen(port, () => {
    console.log(`Car doctor on port ${port}`)
})
