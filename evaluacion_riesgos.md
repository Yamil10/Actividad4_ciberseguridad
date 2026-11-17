# Evaluación de Riesgos y Resultados de Laboratorio - Actividad 4

- **Fecha de ejecución:** 16 de noviembre de 2026
- **Entorno:** Fedora Linux (ARM64), Podman, Node.js/Express, OWASP ZAP.
- **Alcance:** Análisis OWASP Top 10, endurecimiento de API REST con JWT/Rate Limiting y seguridad perimetral (Firewall, DNS anti-phishing e IDS/IPS con regla Snort sid:1000001).

## Fase 1: Análisis de Vulnerabilidades Web (OWASP ZAP)

- **Objetivo:** http://localhost:8080 (OWASP Juice Shop como equivalente ARM64 de DVWA).
- **Evidencia:** Reporte exportado en [reporte_zap.html](./reporte_zap.html) (16 Nov 2026 11:16:17).

| Categoría OWASP Top 10 | Vector / Endpoint | Resultado | Riesgo y Mitigación |
| :--- | :--- | :--- | :--- |
| A03:2021 - SQL Injection | /#/login (' OR '1'='1) | Bypass de autenticación exitoso | Crítico: Usar consultas parametrizadas |
| A03:2021 - XSS Reflected | /#/search (<script>alert('XSS')</script>) | Ejecución JS sin sanitizar | Alto: Escapar salidas y aplicar CSP |
| A01:2021 - Broken Access Control | /#/administration | Acceso a panel sin validar rol | Alto: Implementar control RBAC en backend |

## Fase 2: Seguridad en API Express (./api-segura)

| Prueba Realizada | Endpoint | Código HTTP | Interpretación |
| :--- | :--- | :--- | :--- |
| Sin cabecera Authorization | POST /api/usuarios | 401 Unauthorized | Rechazo de peticiones sin autenticar |
| Token JWT inválido | POST /api/usuarios | 403 Forbidden | Validación de firma JWT operativa |
| Payload válido (juan123) | POST /api/usuarios | 200 OK | Acceso concedido correctamente |
| Inyección SQL (admin' OR 1=1--) | POST /api/usuarios | 400 Bad Request | Bloqueo por validación de entrada |
| Ráfaga 4 peticiones (MAX=3) | POST /login | 429 Too Many Requests | Rate limiting activo contra fuerza bruta |

## Fase 3: Seguridad Perimetral, Filtrado DNS e IDS/IPS

- **3a. Firewall (iptables):** Política DROP por defecto en FORWARD, permitiendo tráfico saliente TCP 80 y 443 desde 192.168.20.0/24.
- **3b. Filtrado DNS (dnsmasq/DNSBL):** Dominio phishing-prueba.com redirigido a IP de bloqueo 10.10.10.1 (verificado con nslookup desde cliente 192.168.20.20).
- **3c. IDS/IPS (Regla sid:1000001 + Nmap SYN):** Escaneo nmap -sS -p 1-100 192.168.20.2 detectado a las 21:23:11 CST generando alerta [1:1000001:1] ALERTA: Escaneo de puertos Nmap SYN detectado desde 192.168.20.20.

---

## Escenario de Ataque a API (SQL Injection + JWT Mal Configurado)

- **Vector de ataque:** Un atacante envía un payload SQLi (' OR 1=1--) en el parámetro de usuario de un endpoint sin validación y simultáneamente falsifica un token JWT aprovechando una clave secreta débil o el algoritmo 'none' sin verificación de firma en el servidor.
- **Impacto potencial:** Compromiso total de la confidencialidad e integridad de la base de datos, suplantación de identidad de cuentas administrativas y exfiltración masiva de registros.
- **Recomendaciones de mitigación:**
  1. Utilizar consultas parametrizadas (Prepared Statements / ORM) junto con validación estricta de esquemas de entrada.
  2. Configurar secretos JWT criptográficamente robustos (>= 256 bits) almacenados en variables de entorno (.env) y forzar la verificación explícita del algoritmo de firma (HS256/RS256) y expiración.

---

## Fase 4: Evaluación Integral de Riesgos (Matriz 5x5)

| Amenaza / Vulnerabilidad | Probabilidad (1-5) | Impacto (1-5) | Nivel de Riesgo (P x I) | Estrategia de Mitigación Aplicada |
| :--- | :---: | :---: | :---: | :--- |
| Inyección SQL (SQLi) en Web / API | 5 (Muy Alta) | 5 (Catastrófico) | **25 - Crítico** | Validación de entrada con express-validator y consultas parametrizadas. |
| JWT débil o acceso sin autenticación | 4 (Alta) | 5 (Catastrófico) | **20 - Crítico** | Firma HMAC con JWT_SECRET robusto y rechazo HTTP 401/403. |
| Control de Acceso Roto (Broken Access Control) | 4 (Alta) | 4 (Mayor) | **16 - Alto** | Control de acceso basado en roles (RBAC) y denegación por defecto. |
| Cross-Site Scripting (XSS Reflejado) | 4 (Alta) | 3 (Moderado) | **12 - Alto** | Sanitización contextual, codificación HTML y cabeceras CSP. |
| Ataques de Fuerza Bruta / DoS en Login | 4 (Alta) | 3 (Moderado) | **12 - Alto** | Limitación de tasa (Rate Limiting -> HTTP 429 Too Many Requests). |
| Acceso a dominios de Phishing y escaneos de red | 3 (Media) | 4 (Mayor) | **12 - Alto** | Firewall perimetral (DROP), filtrado DNS (sinkhole 10.10.10.1) e IDS Snort (SID 1000001). |
