// models/Organization.ts
import mongoose from 'mongoose';

const GhataSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => `ghata_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    default: 'New Ghata'
  }
});

const MilanSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => `milan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    default: 'New Milan'
  },
  ghatas: {
    type: [GhataSchema],
    default: []
  }
});

const ValayaSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => `valay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    default: 'New Valay'
  },
  milans: {
    type: [MilanSchema],
    default: []
  }
});

const KhandaSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => `khanda_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  },
  name: {
    type: String,
    default: 'New Khanda'
  },
  code: {
    type: String,
    default: 'K1'
  },
  valays: {
    type: [ValayaSchema],
    default: []
  }
});

const OrganizationSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: 'org_1'
  },
  name: {
    type: String,
    default: 'Sangha Organization'
  },
  khandas: {
    type: [KhandaSchema],
    default: []
  }
}, {
  timestamps: true
});

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);