const supabase = require('../config/supabase');

const VALID_STATUSES = ['Dipinjam', 'Kembali', 'Terlambat'];

/**
 * Mendapatkan semua data peminjaman buku
 * Mendukung filter query: ?status=..., ?member_name=..., ?book_title=...
 */
exports.getAllLoans = async (req, res) => {
  try {
    const { status, member_name, book_title } = req.query;

    let query = supabase
      .from('loans')
      .select('*')
      .order('id', { ascending: false });

    // Filter status jika ada di query params
    if (status) {
      query = query.ilike('status', status.trim());
    }

    // Filter nama anggota jika ada
    if (member_name) {
      query = query.ilike('member_name', `%${member_name.trim()}%`);
    }

    // Filter judul buku jika ada
    if (book_title) {
      query = query.ilike('book_title', `%${book_title.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal mengambil data peminjaman',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil data peminjaman',
      count: data.length,
      filters: {
        status: status || null,
        member_name: member_name || null,
        book_title: book_title || null
      },
      data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: err.message
    });
  }
};

/**
 * Mendapatkan detail satu data peminjaman berdasarkan ID
 */
exports.getLoanById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        message: `Data peminjaman dengan ID ${id} tidak ditemukan`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail peminjaman',
      data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: err.message
    });
  }
};

/**
 * Menambahkan data peminjaman baru
 */
exports.createLoan = async (req, res) => {
  try {
    const {
      member_name,
      member_code,
      book_title,
      book_isbn,
      loan_date,
      due_date,
      return_date,
      status,
      notes
    } = req.body;

    // Validasi input wajib
    if (!member_name || !book_title || !due_date) {
      return res.status(400).json({
        success: false,
        message: 'Kolom member_name, book_title, dan due_date wajib diisi'
      });
    }

    // Validasi status jika dikirimkan
    const loanStatus = status || 'Dipinjam';
    if (!VALID_STATUSES.includes(loanStatus)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilihan yang tersedia: ${VALID_STATUSES.join(', ')}`
      });
    }

    const payload = {
      member_name: member_name.trim(),
      member_code: member_code ? member_code.trim() : null,
      book_title: book_title.trim(),
      book_isbn: book_isbn ? book_isbn.trim() : null,
      loan_date: loan_date || new Date().toISOString().split('T')[0],
      due_date,
      return_date: return_date || null,
      status: loanStatus,
      notes: notes || null
    };

    const { data, error } = await supabase
      .from('loans')
      .insert([payload])
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menambahkan data peminjaman',
        error: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Data peminjaman buku berhasil ditambahkan',
      data: data[0]
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: err.message
    });
  }
};

/**
 * Memperbarui data peminjaman berdasarkan ID
 */
exports.updateLoan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      member_name,
      member_code,
      book_title,
      book_isbn,
      loan_date,
      due_date,
      return_date,
      status,
      notes
    } = req.body;

    // Cek apakah data peminjaman ada
    const { data: existingLoan, error: checkError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingLoan) {
      return res.status(404).json({
        success: false,
        message: `Data peminjaman dengan ID ${id} tidak ditemukan`
      });
    }

    // Validasi status jika dikirimkan
    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status tidak valid. Pilihan yang tersedia: ${VALID_STATUSES.join(', ')}`
      });
    }

    const updatePayload = {
      updated_at: new Date().toISOString()
    };

    if (member_name !== undefined) updatePayload.member_name = member_name.trim();
    if (member_code !== undefined) updatePayload.member_code = member_code ? member_code.trim() : null;
    if (book_title !== undefined) updatePayload.book_title = book_title.trim();
    if (book_isbn !== undefined) updatePayload.book_isbn = book_isbn ? book_isbn.trim() : null;
    if (loan_date !== undefined) updatePayload.loan_date = loan_date;
    if (due_date !== undefined) updatePayload.due_date = due_date;
    if (return_date !== undefined) updatePayload.return_date = return_date;
    if (status !== undefined) updatePayload.status = status;
    if (notes !== undefined) updatePayload.notes = notes;

    // Jika status diubah menjadi 'Kembali' dan return_date belum diisi, otomatis set hari ini
    if (status === 'Kembali' && !return_date && !existingLoan.return_date) {
      updatePayload.return_date = new Date().toISOString().split('T')[0];
    }

    const { data, error } = await supabase
      .from('loans')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal memperbarui data peminjaman',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: `Data peminjaman ID ${id} berhasil diperbarui`,
      data: data[0]
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: err.message
    });
  }
};

/**
 * Menghapus data peminjaman berdasarkan ID
 */
exports.deleteLoan = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah data peminjaman ada
    const { data: existingLoan, error: checkError } = await supabase
      .from('loans')
      .select('*')
      .eq('id', id)
      .single();

    if (checkError || !existingLoan) {
      return res.status(404).json({
        success: false,
        message: `Data peminjaman dengan ID ${id} tidak ditemukan`
      });
    }

    const { error } = await supabase
      .from('loans')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Gagal menghapus data peminjaman',
        error: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: `Data peminjaman ID ${id} berhasil dihapus`,
      data: existingLoan
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: err.message
    });
  }
};
