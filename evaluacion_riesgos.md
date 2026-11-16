# Evaluación integral de riesgos

**Escala:** Probabilidad e impacto se califican de 1 a 5. El riesgo es `Probabilidad × Impacto`.

| Amenaza / vulnerabilidad | Vector de ataque | Probabilidad | Impacto | Riesgo | Nivel | Estrategia de mitigación |
|---|---|---:|---:|---:|---|---|
| Inyección SQL (DVWA / API) | Manipulación de parámetros con comillas y operadores booleanos. | 5 | 5 | 25 | Crítico | Usar consultas parametrizadas (prepared statements), validación estricta de tipos y mínimos privilegios en la cuenta de base de datos. |
| JWT mal configurado / sin expiración | Robo de token o falsificación si se acepta `none` o se usa una clave débil. | 4 | 5 | 20 | Alto | Usar secretos aleatorios robustos, fijar `HS256`/`RS256`, validar algoritmo y firma, y usar expiración corta (`15m`). |
| XSS reflejado (DVWA) | Inyección de etiquetas `<script>` en formularios sin sanitizar. | 4 | 4 | 16 | Alto | Codificar la salida HTML, validar entradas y establecer una política `Content-Security-Policy`. |
| Escaneo de puertos y fuerza bruta | Reconocimiento automatizado con Nmap y saturación de endpoints. | 5 | 3 | 15 | Medio-Alto | Activar reglas IPS de Snort con bloqueo, limitar servicios expuestos y aplicar rate limiting de 100 solicitudes/minuto en la aplicación. |
| Control de acceso roto | Acceso directo a rutas internas sin comprobar rol o autorización. | 3 | 5 | 15 | Medio-Alto | Aplicar autorización por recurso y rol en cada endpoint; no confiar solo en ocultar rutas. |
| Phishing / resolución maliciosa | Consulta de dominios incluidos en feeds de phishing desde la red LAN. | 3 | 4 | 12 | Medio | Activar DNSBL de pfBlockerNG, mantener feeds actualizados y registrar/bloquear consultas sospechosas. |

## Escenario teórico: API con SQLi y JWT

Un atacante obtiene o roba un JWT válido mediante phishing, exposición accidental en registros o un cliente comprometido. Después envía el token a un endpoint de usuarios e intenta modificar un parámetro con una condición booleana (`' OR '1'='1`) para alterar una consulta SQL. Si el endpoint no valida la firma, expiración, algoritmo y rol, y además concatena el parámetro en una consulta, el atacante podría leer o modificar datos con los permisos de la cuenta.

**Controles preventivos:** algoritmo permitido explícitamente, secreto fuera del repositorio, expiración de 15 minutos, autorización por rol y consultas parametrizadas. **Controles de detección:** logs sin tokens completos, alertas por repetición de errores 400/401/403, rate limiting, Snort y revisión de eventos de pfSense. **Respuesta:** revocar sesiones, rotar el secreto, bloquear el origen, revisar consultas y preservar evidencias.

