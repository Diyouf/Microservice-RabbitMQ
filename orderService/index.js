const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Order = require('./orderModel')
const amqp = require('amqplib')

app.use(express.json());
let channel, connection

mongoose.connect('mongodb://127.0.0.1:27017/MicroservicesOrder')
    .then(() => {
        console.log("Database connected and Working");
    })
    .catch((error) => {
        console.error("Error connecting to database:", error);
    });


async function craeteOrder(product, userEmail) {
    let totalPrice = 0

    for (let i = 0; i < product.length; i++) {
        totalPrice += product[i].price
    }

    const newOrder = new Order({
        products: product,
        user: userEmail,
        total_price: totalPrice
    })

    await newOrder.save()

    return newOrder
}

async function connect() {
    const amqpServer = "amqp://localhost";
    connection = await amqp.connect(amqpServer);
    channel = await connection.createChannel();
    await channel.assertQueue("ORDER");


}

app.get('/orders/getAll', async (req, res) => {
    const orders = await Order.find({})
    return res.json(orders)
})

connect().then(() => {
    channel.consume("ORDER", async (data) => {
        const { products, userEmail } = JSON.parse(data.content);
        const newOrder = await craeteOrder(products, userEmail)
        channel.ack(data);
        console.log(newOrder)
        channel.sendToQueue(
            "PRODUCT",
            Buffer.from(JSON.stringify(newOrder))
        );

    })
}).catch(error => {
    console.error("Error connecting to RabbitMQ:", error);
});


app.listen(3001, () => {
    console.log('order Service running at 3001 ')
})