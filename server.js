require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8000;
const DATA_FILE = path.join(__dirname, 'data', 'inquiries.json');
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Helper to read database
const getInquiries = () => {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            // Make sure folder and file exist
            fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
            fs.writeFileSync(DATA_FILE, JSON.stringify([]));
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        console.error('Error reading database file:', err);
        return [];
    }
};
// Helper to write database
const saveInquiries = (data) => {
    try {
        fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4));
        return true;
    } catch (err) {
        console.error('Error writing database file:', err);
        return false;
    }
};
// ==========================================================================
// API ENDPOINTS
// ==========================================================================
// 1. Submit Inquiry (POST)
app.post('/api/inquire', (req, res) => {
    const { name, phone, email, city, projectType, budget, message } = req.body;
    // Validation
    if (!name || !phone || !city) {
        return res.status(400).json({ 
            success: false, 
            message: 'Validation failed: Name, Phone, and City are required fields.' 
        });
    }
    const inquiries = getInquiries();
    
    const newInquiry = {
        id: Date.now().toString(),
        name: name.trim(),
        phone: phone.trim(),
        email: (email || '').trim(),
        city: city.trim(),
        projectType: projectType || 'Residential Interior',
        budget: budget || 'Standard Custom',
        message: (message || '').trim(),
        status: 'New', // New, Contacted, In Progress, Closed
        timestamp: new Date().toISOString()
    };
    inquiries.push(newInquiry);
    
    if (saveInquiries(inquiries)) {
        res.status(201).json({ 
            success: true, 
            message: 'Consultation request received successfully!', 
            data: newInquiry 
        });
    } else {
        res.status(500).json({ 
            success: false, 
            message: 'Server error: Failed to save your consultation request.' 
        });
    }
});
// 2. Admin Login (POST)
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'shivamadmin2026';
    if (password === adminPassword) {
        res.status(200).json({ 
            success: true, 
            token: adminPassword // Stateless token for simplicity
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Access Denied: Invalid admin security password.' 
        });
    }
});
// Admin Authorization Middleware
const authorizeAdmin = (req, res, next) => {
    const token = req.headers.authorization;
    const adminPassword = process.env.ADMIN_PASSWORD || 'shivamadmin2026';
    if (token === adminPassword) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: 'Forbidden: You do not have permission to access admin APIs.' 
        });
    }
};
// 3. Get All Inquiries (GET) - Admin Only
app.get('/api/inquiries', authorizeAdmin, (req, res) => {
    const inquiries = getInquiries();
    // Return sorted by date (newest first)
    inquiries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.status(200).json({ success: true, data: inquiries });
});
// 4. Update Inquiry Status (PATCH) - Admin Only
app.patch('/api/inquiries/:id', authorizeAdmin, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['New', 'Contacted', 'In Progress', 'Closed'];
    if (!status || !validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: 'Invalid status update.' });
    }
    const inquiries = getInquiries();
    const index = inquiries.findIndex(inq => inq.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }
    inquiries[index].status = status;
    
    if (saveInquiries(inquiries)) {
        res.status(200).json({ success: true, data: inquiries[index] });
    } else {
        res.status(500).json({ success: false, message: 'Failed to update status.' });
    }
});
// 5. Delete Inquiry (DELETE) - Admin Only
app.delete('/api/inquiries/:id', authorizeAdmin, (req, res) => {
    const { id } = req.params;
    
    let inquiries = getInquiries();
    const index = inquiries.findIndex(inq => inq.id === id);
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Inquiry not found.' });
    }
    inquiries = inquiries.filter(inq => inq.id !== id);
    
    if (saveInquiries(inquiries)) {
        res.status(200).json({ success: true, message: 'Inquiry deleted successfully!' });
    } else {
        res.status(500).json({ success: false, message: 'Failed to delete inquiry.' });
    }
});
// ==========================================================================
// FRONTEND SERVING
// ==========================================================================
// Premium Clean URL Routing (e.g., serving /about from about.html)
app.get('/:page', (req, res, next) => {
    const pagePath = path.join(__dirname, 'public', `${req.params.page}.html`);
    fs.access(pagePath, fs.constants.F_OK, (err) => {
        if (!err) {
            res.sendFile(pagePath);
        } else {
            next();
        }
    });
});
// Static files fallback
app.use(express.static(path.join(__dirname, 'public')));
// Default Home Page fallback
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// Start Server
app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`SHIVAM ENTERPRISES SERVER ACTIVE ON PORT ${PORT}`);
    console.log(`View live website at http://localhost:${PORT}`);
    console.log(`====================================================`);
});
