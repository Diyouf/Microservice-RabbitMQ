const express = require('express')
const app = express()
const mongoose = require('mongoose')
const Product = require('./productModel')

app.use(express.json())

mongoose.connect('mongodb://127.0.0.1:27017/MicroservicesProducts')
    .then(() => {
        console.log('mongodb conneected successfully')
    })
    .catch((err) => {
        console.log(err)
    })

app.post("/product/buy", async (req, res) => {
    const { ids } = req.body;
    const products = await Product.find({ _id: { $in: ids } });
    channel.sendToQueue(
        "ORDER",
        Buffer.from(
            JSON.stringify({
                products,
                userEmail: req.user.email,
            })
        )
    );
})



app.post('/product/create', async (req, res) => {
    const { name, price, description } = req.body
    const newProduct = new Product({
        name,
        description,
        price
    })
    await newProduct.save()
    res.json(newProduct)
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