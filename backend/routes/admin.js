const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { verifyAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Order = require('../models/Order');

// 1. Get branch-specific orders
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    // Admins only see their branch. SuperAdmins see the requested branch or All.
    let branch = req.user.branch;
    if (req.user.role === 'superadmin') {
      branch = req.query.branch || 'All';
    }

    const filter = {};
    if (branch && branch !== 'All') {
      filter.branch = branch;
    }

    const orders = await Order.find(filter)
      .populate('user', 'name phone address landmark')
      .populate('deliveryAgentId', 'name phone agentId')
      .sort({ createdAt: -1 })
      .lean();
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// 2. Admin update order status (already branch-filtered by being part of order lookup if we wanted, but simple ID is enough)
router.patch('/order/:id', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });
    
    // Security: Admin can only update their branch orders
    if (req.user.role === 'admin' && order.branch !== req.user.branch) {
      return res.status(403).json({ msg: 'Unauthorized for this branch' });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// 3. Create systematic agent for the admin's branch
router.post('/agents', verifyAdmin, async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    const branch = req.user.branch; // Branch from admin profile
    
    if (!branch) return res.status(400).json({ msg: 'Admin must have a branch assigned' });

    // Generate Systematic ID: SWAD_[BRANCH_INITIALS]_[COUNT]
    const bInit = branch.substring(0, 3).toUpperCase();
    const count = await Agent.countDocuments({ branch });
    const agentId = `SWAD_${bInit}_${(count + 1).toString().padStart(3, '0')}`;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'agent123', salt);

    const agent = new Agent({
      name,
      phone,
      agentId,
      password: hashedPassword,
      branch
    });

    await agent.save();
    res.status(201).json({ 
      msg: 'Agent created successfully',
      agentId,
      password: password || 'agent123'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// 4. Get branch-specific agents for dropdown
router.get('/agents', verifyAdmin, async (req, res) => {
  try {
    let branch = req.user.branch;
    if (req.user.role === 'superadmin') {
      branch = req.query.branch; // Superadmin can filter manually
    }
    
    const filter = { isActive: true };
    if (branch) filter.branch = branch;

    const agents = await Agent.find(filter).select('name phone agentId branch').lean();
    res.json(agents);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

// 5. Assign agent to order
router.patch('/order/assign/:id', verifyAdmin, async (req, res) => {
  try {
    const { agentId } = req.body; // Internal MongoDB ID of Agent
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    // Ensure agent exists and is in the same branch
    const agent = await Agent.findById(agentId);
    if (!agent || agent.branch !== order.branch) {
      return res.status(400).json({ msg: 'Invalid agent for this branch' });
    }

    order.deliveryAgentId = agentId;
    if (order.status === 'pending') order.status = 'preparing';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

module.exports = router;
