import express from "express";
import cartRoutes from "./routes/cartRoutes.js";

const app = express();
app.use(express.json());
const port = process.env.PORT || 4001;

app.use("/cart", cartRoutes);

app.listen(port, function () {
    console.log("Cart service listening on port %d.", port);
});