require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const app = express();
const port = Number(process.env.PORT || 3000);
const secretKey = process.env.JWT_SECRET;
const rateLimitMax = Number(process.env.RATE_LIMIT_MAX || 100);

if (!secretKey || secretKey.length < 32) {
  throw new Error('JWT_SECRET debe existir y tener al menos 32 caracteres.');
}

if (!Number.isInteger(rateLimitMax) || rateLimitMax < 1) {
  throw new Error('RATE_LIMIT_MAX debe ser un entero positivo.');
}

app.use(express.json({ limit: '10kb' }));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: rateLimitMax,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes. Intenta en un minuto.' }
});
app.use(limiter);

app.post('/login', (_req, res) => {
  const token = jwt.sign(
    { user: 'estudiante', role: 'user' },
    secretKey,
    { algorithm: 'HS256', expiresIn: '15m' }
  );

  res.json({ access_token: token, token_type: 'Bearer' });
});

function verificarJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  const [scheme, token] = authHeader ? authHeader.split(' ') : [];

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Se requiere un token Bearer.' });
  }

  try {
    req.user = jwt.verify(token, secretKey, { algorithms: ['HS256'] });
    next();
  } catch (_error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
}

app.post(
  '/api/usuarios',
  verificarJWT,
  body('username')
    .isAlphanumeric()
    .withMessage('username solo puede contener letras y números.')
    .trim()
    .escape(),
  (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Entrada inválida detectada (posible inyección).',
        detalles: errors.array()
      });
    }

    return res.json({
      mensaje: `Usuario ${req.body.username} procesado de forma segura.`
    });
  }
);

app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

app.listen(port, () => {
  console.log(`API ejecutándose en http://localhost:${port}`);
});

