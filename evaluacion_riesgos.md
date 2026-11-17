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
