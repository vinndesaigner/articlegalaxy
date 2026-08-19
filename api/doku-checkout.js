// api/doku-checkout.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method tidak diizinkan' });
    }

    const { targetId, zoneId, nominal, payment } = req.body;

    try {
        console.log(`Memproses checkout DOKU untuk ID: ${targetId}, Nominal: ${nominal}`);

        // 1. RUMUS MARKUP HARGA (BIAR LU UNTUNG!)
        // Nanti lu bisa bikin logic pemetaan nominal ke harga di sini
        let hargaModal = 6325; // Contoh modal 40 FC Points
        let keuntungan = 1675; // Keuntungan lu per transaksi
        let totalHargaJual = hargaModal + keuntungan;

        // 2. KREDENSIAL DOKU (Hari Senin tinggal lu ganti pake yang asli)
        const DOKU_CLIENT_ID = process.env.DOKU_CLIENT_ID || 'MOCK_CLIENT_ID';
        const DOKU_SECRET_KEY = process.env.DOKU_SECRET_KEY || 'MOCK_SECRET_KEY';

        // 3. LOGIKA REQUEST KE API CHECKOUT DOKU
        // Nanti di sini kita masukin script generate Signature DOKU & hit ke API Jokul
        
        // Ini simulasi URL Checkout DOKU yang bakal dikirim balik ke frontend
        const mockPaymentUrl = "https://sandbox.doku.com/checkout/mock-page-invoice"; 

        // Kirim link pembayaran ke frontend
        return res.status(200).json({ 
            success: true, 
            payment_url: mockPaymentUrl 
        });

    } catch (error) {
        console.error('Error di DOKU Checkout backend:', error);
        return res.status(500).json({ message: 'Gagal memproses ke DOKU' });
    }
}