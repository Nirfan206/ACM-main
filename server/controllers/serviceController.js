// controllers/service.controller.js
const Service = require('../models/Service');

/**
 * GET /api/services
 * Fetch all services
 */
const getServices = async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching services', error: err.message });
  }
};

/**
 * POST /api/services
 * Create a new service
 */
const createService = async (req, res) => {
  try {
    const { type, description, category, imageUrl } = req.body; 
    
    // Basic validation
    if (!type) { 
      return res.status(400).json({ message: 'Service Type is required' }); 
    }
    if (!imageUrl) { // NEW: Make imageUrl compulsory
      return res.status(400).json({ message: 'Service Image URL is required' });
    }

    const service = await Service.create({ type, description, category, imageUrl }); 
    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({ message: 'Error creating service', error: err.message });
  }
};

/**
 * PUT /api/services/:id
 * Update a service by ID
 */
const updateService = async (req, res) => {
  try {
    const { type, description, category, imageUrl } = req.body;
    const updateFields = { type, description, category, imageUrl };

    if (!imageUrl) { // NEW: Make imageUrl compulsory for updates too
      return res.status(400).json({ message: 'Service Image URL is required' });
    }

    const service = await Service.findByIdAndUpdate(req.params.id, updateFields, { new: true });

    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.json(service);
  } catch (err) {
    res.status(500).json({ message: 'Error updating service', error: err.message });
  }
};

/**
 * DELETE /api/services/:id
 * Delete a service by ID
 */
const deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) return res.status(404).json({ message: 'Service not found' });

    res.json({ message: 'Service deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting service', error: err.message });
  }
};

module.exports = { getServices, createService, updateService, deleteService };