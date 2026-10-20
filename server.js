require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const mysql = require('mysql2/promise');
const { Resend } = require('resend');

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY);

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

app.use(express.json());
app.use(cors()); // en producción: cors({ origin: 'https://truelock.onrender.com' })

const hash = (codigo) => crypto.createHash('sha256').update(String(codigo)).digest('hex');
const emailValido = (e) => typeof e === 'string' && /^\S+@\S+\.\S+$/.test(e);

// ---------- ENVIAR CÓDIGO ----------
app.post('/api/enviar-codigo', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  if (!emailValido(email)) {
    return res.status(400).json({ ok: false, mensaje: 'Correo inválido' });
  }

  try {
    const [recientes] = await db.query(
      'SELECT id FROM codigos_verificacion WHERE email = ? AND creado > (NOW() - INTERVAL 60 SECOND)',
      [email]
    );
    if (recientes.length > 0) {
      return res.status(429).json({ ok: false, mensaje: 'Espera un minuto antes de pedir otro código' });
    }

    // 4 dígitos (permite ceros al inicio: 0042)
    const codigo = crypto.randomInt(0, 10000).toString().padStart(4, '0');

    await db.query('DELETE FROM codigos_verificacion WHERE email = ?', [email]);
    await db.query(
      'INSERT INTO codigos_verificacion (email, codigo_hash, expira) VALUES (?, ?, NOW() + INTERVAL 10 MINUTE)',
      [email, hash(codigo)]
    );

    const { error } = await resend.emails.send({
      from: `TrueLock <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Tu código de verificación de TrueLock',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:400px;margin:auto;text-align:center">
          <h2>Verifica tu cuenta de TrueLock</h2>
          <p>Tu código es:</p>
          <p style="font-size:40px;letter-spacing:10px;font-weight:bold">${codigo}</p>
          <p>Expira en 10 minutos. Si no fuiste tú, ignora este correo.</p>
        </div>`,
    });

    if (error) {
      console.error('Error de Resend:', error);
      await db.query('DELETE FROM codigos_verificacion WHERE email = ?', [email]);
      return res.status(500).json({ ok: false, mensaje: 'No se pudo enviar el correo' });
    }

    res.json({ ok: true, mensaje: 'Código enviado' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
});

// ---------- VERIFICAR CÓDIGO ----------
app.post('/api/verificar-codigo', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const codigo = String(req.body.codigo || '').trim();

  if (!emailValido(email) || !/^\d{4}$/.test(codigo)) {
    return res.status(400).json({ ok: false, mensaje: 'Datos inválidos' });
  }

  try {
    const [filas] = await db.query(
      'SELECT id, codigo_hash, intentos, expira < NOW() AS vencido FROM codigos_verificacion WHERE email = ? ORDER BY id DESC LIMIT 1',
      [email]
    );

    if (filas.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'Solicita un código primero' });
    }

    const registro = filas[0];

    if (registro.vencido) {
      await db.query('DELETE FROM codigos_verificacion WHERE id = ?', [registro.id]);
      return res.status(400).json({ ok: false, mensaje: 'El código expiró. Pide uno nuevo.' });
    }

    if (registro.intentos >= 5) {
      await db.query('DELETE FROM codigos_verificacion WHERE id = ?', [registro.id]);
      return res.status(429).json({ ok: false, mensaje: 'Demasiados intentos. Pide otro código.' });
    }

    if (registro.codigo_hash !== hash(codigo)) {
      await db.query('UPDATE codigos_verificacion SET intentos = intentos + 1 WHERE id = ?', [registro.id]);
      return res.status(400).json({ ok: false, mensaje: 'Código incorrecto' });
    }

    await db.query('DELETE FROM codigos_verificacion WHERE id = ?', [registro.id]);
    res.json({ ok: true, mensaje: 'Correo verificado' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, mensaje: 'Error del servidor' });
  }
});

const PORT = process.env.PORT || 11396;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));