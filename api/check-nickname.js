const axios = require('axios');
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method salah!' });

  try {
    const { targetId, zoneId } = req.body;
    
    const apiId = process.env.VIP_ID ? process.env.VIP_ID.trim() : ''; 
    const apiKey = process.env.VIP_KEY ? process.env.VIP_KEY.trim() : '';

    const rawSignature = apiId + apiKey;
    const dynamicSign = crypto.createHash('md5').update(rawSignature).digest('hex');

    // TRACKING LOG
    console.log(`[PELACAK] API_ID asli: ${apiId}`);
    console.log(`[PELACAK] Hasil MD5 Hex: ${dynamicSign}`);

    const payload = new URLSearchParams();
    payload.append('key', apiKey);
    payload.append('sign', dynamicSign);
    payload.append('type', 'get-nickname');
    payload.append('code', 'mobile-legends');
    payload.append('target', targetId);
    payload.append('additional_target', zoneId);

    const response = await axios.post('https://vip-reseller.co.id/api/game-feature', payload, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    console.log('Respons Server Supplier:', response.data);

   if (response.data && (response.data.result === true || response.data.status === true)) {
    // Ambil nickname dengan aman tanpa bikin crash walau data.username kosong
    const targetName = response.data.data 
        ? (response.data.data.username || (typeof response.data.data === 'string' ? response.data.data : 'No Name'))
        : 'No Name';

    return res.status(200).json({ 
        success: true, 
        nickname: targetName 
    });

    } else {
        // Ganti properti jadi 'message' biar frontend gampang bedainnya
        return res.status(400).json({ 
            success: false, 
            message: response.data.message || 'ID atau Server salah, Cuy!' 
        });
    }

  } catch (error) {
    console.error('Error detail:', error.message);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};