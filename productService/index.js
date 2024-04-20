const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Product = require('./productModel')
const amqp = require("amqplib");

app.use(express.json())
let channel, connection


mongoose.connect('mongodb://127.0.0.1:27017/MicroservicesProducts')
    .then(() => {
        console.log('mongodb conneected successfully')
    })
    .catch((err) => {
        console.log(err)
    })


async function connect() {
    const amqpServer = "amqp://localhost:5672";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("PRODUCT");
}
connect();

app.post("/product/buy", async (req, res) => {
    try {
        let order
        const { ids } = req.body;
        const products = await Product.find({ _id: { $in: ids } });
        channel.sendToQueue(
            "ORDER",
            Buffer.from(
                JSON.stringify({
                    products,
                    userEmail: "diyoufkv7@gmail.com",
                })
            )
        );

        const orderPromise = new Promise((resolve, reject) => {
            channel.consume("PRODUCT", (data) => {
                const orderMark = JSON.parse(data.content);
                channel.ack(data);
                resolve(orderMark);
            });
        });
        order = await orderPromise

        return res.status(202).json(order);

    } catch (error) {
        console.log(error)
    }
})

app.get("/product/getAll", async (req, res) => {
    try {
        const allProduct = await Product.find({})
        return res.status(200).json(allProduct)
    } catch (error) {
        console.log(error)
    }

})



app.post('/product/create', async (req, res) => {
    try {
        const { name, price, description } = req.body
        const newProduct = new Product({
            name,
            description,
            price
        })
        await newProduct.save()
        return res.json(newProduct)
    } catch (error) {
        console.log(error)
    }
})


process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed');
        process.exit(0);
    });
});


app.listen(3002, () => {
    console.log('Product Service running at 3002')
})