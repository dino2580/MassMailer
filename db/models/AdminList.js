const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
  title: { type: String, required: true },
  customProperties: { type: Map, of: String },
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
}, { timestamps: true });
module.exports = mongoose.model('AdminList', ListSchema);
