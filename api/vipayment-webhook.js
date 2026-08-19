const crypto = require('crypto');

module.exports = async (req, res) => {
  // 1. Validasi Method wajib POST sesuai dokumentasi VIPayment
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method salah!' });

  try {
    // Ambil env API ID dan KEY lu (.trim biar aman dari spasi gaib)
    const apiId = process.env.VIP_ID ? process.env.VIP_ID.trim() : ''; 
    const apiKey = process.env.VIP_KEY ? process.env.VIP_KEY.trim() : '';

    // 2. Validasi Signature: Ambil dari header 'x-client-signature'
   // 2. Validasi Signature: Ambil dari header 'x-client-signature'
    const incomingSignature = req.headers['x-client-signature'];
    const expectedSignature = crypto.createHash('md5').update(apiId + apiKey).digest('hex');

    // Proteksi tambahan: Kalau diakses manual lewat browser/localhost tanpa header signature
    if (!incomingSignature) {
        return res.status(200).json({ success: true, message: 'Endpoint aman, menunggu callback asli, Cuy!' });
    }

    // Proteksi: Kalau signature dikirim tapi gak cocok, tendang!
    if (incomingSignature !== expectedSignature) {
        console.error('⚠️ Peringatan: Signature Webhook VIPayment Tidak Valid!');
        return res.status(401).json({ success: false, message: 'Invalid Signature, Cuy!' });
    }

    // 3. Ambil data callback utama dari VIPayment
    const callbackData = req.body.data;
    if (!callbackData) {
        return res.status(400).json({ success: false, message: 'Data tidak ditemukan' });
    }

    const { trxid, data: targetGame, zone, service, status, note, price } = callbackData;

    // TRACKING LOG (Biar gampang lu pantau lewat log Vercel)
    console.log(`[VIPayment Webhook] TrxID: ${trxid} | Game ID: ${targetGame}(${zone}) | Status: ${status}`);

    // 4. Logika Alur Status Orderan
    if (status === 'success') {
        // TODO: Taruh kodingan koneksi database lu di sini buat update status orderan jadi "SUKSES"
        // TODO: Taruh kodingan API WhatsApp Gateway lu di sini buat kirim notifikasi otomatis ke pembeli
        console.log(`✅ Mantap! Top up ${service} sukses dikirim.`);

    } else if (status === 'error') {
        // TODO: Taruh kodingan lu di sini buat update database jadi "GAGAL" (atau proses refund otomatis/manual)
        console.log(`❌ Waduh Gagal! Catatan sistem: ${note}`);

    } else if (status === 'processing' || status === 'waiting') {
        console.log(`⏳ Orderan sedang diproses atau mengantre di server supplier...`);
    }

    // 5. WAJIB: Kirim balik teks biasa 'Callback Received' atau status 200 biar VIPayment tahu datanya udah lu terima
    return res.status(200).send('Callback Received');

  } catch (error) {
    console.error('Error detail webhook:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};