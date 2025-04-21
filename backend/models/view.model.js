const mongoose = require("mongoose");

const viewSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("View", viewSchema);