import mongoose from 'mongoose';

const ValayaSchema = new mongoose.Schema({
  _id: String,
  name: String,
  milans: [String]
});

const KhandaSchema = new mongoose.Schema({
  _id: String,
  name: String,
  code: String,
  valays: [ValayaSchema],
  milans: [String]
});

const OrganizationSchema = new mongoose.Schema({
  _id: String,
  name: String,
  khandas: [KhandaSchema]
});

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);