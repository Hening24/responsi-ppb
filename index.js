const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 REST API Peminjaman Buku Perpustakaan Aktif!`);
  console.log(`📡 URL Lokal: http://localhost:${PORT}`);
  console.log(`📚 Endpoints: http://localhost:${PORT}/loans`);
  console.log(`===============================================`);
});
