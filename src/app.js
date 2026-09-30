const express = require('express');
const cors = require('cors');
require('dotenv').config();

const loanRoutes = require('./routes/loanRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root Endpoint - Info & Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'Library Loan Management REST API (Responsi PPB 2026)',
    version: '1.0.0',
    status: 'Active',
    endpoints: {
      getAllLoans: 'GET /loans',
      filterLoansByStatus: 'GET /loans?status=Terlambat',
      filterLoansByMember: 'GET /loans?member_name=Ahmad',
      filterLoansByTitle: 'GET /loans?book_title=Clean',
      getLoanDetail: 'GET /loans/:id',
      createLoan: 'POST /loans',
      updateLoan: 'PUT /loans/:id',
      deleteLoan: 'DELETE /loans/:id'
    }
  });
});

// Routes
app.use('/loans', loanRoutes);

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal pada server',
    error: err.message
  });
});

module.exports = app;
