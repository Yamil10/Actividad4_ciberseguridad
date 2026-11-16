# Guía del laboratorio de ciberseguridad

## Preparación en Visual Studio Code

Instala desde `Ctrl + Shift + X`:

- **Docker** (`ms-azuretools.vscode-docker`)
- **REST Client** (`humao.rest-client`) o **Thunder Client** (`rangav.vscode-thunder-client`)

También puedes usar la paleta de comandos o la terminal:

```bash
code --install-extension ms-azuretools.vscode-docker
code --install-extension humao.rest-client
```

## Fase 1: DVWA y OWASP ZAP

Requiere Docker y una instalación local de OWASP ZAP:

```bash
docker run --rm -it -p 8080:80 vulnerables/web-dvwa
```

Abre `http://localhost:8080`, inicia sesión con `admin/password`, pulsa **Create / Reset Database** y cambia **DVWA Security** a **Low**. En ZAP usa **Automated Scan** contra esa URL y conserva las evidencias de la pestaña **Alerts**.

Casos a documentar:

1. **SQL Injection (A03:2021 - Injection):** en el módulo correspondiente prueba `' OR '1'='1`.
2. **XSS Reflected (A03:2021 - Injection):** prueba `<script>alert('XSS')</script>`.
3. **Broken Access Control (A01:2021):** comprueba el acceso directo a `/vulnerabilities/exec/` y registra si la aplicación no exige autorización.

Realiza estas pruebas únicamente contra el DVWA local del laboratorio. Añade capturas, URL, fecha, nivel de seguridad y resultado a tu informe.

## Fase 2: API Express

La implementación está en [`api-segura/server.js`](./api-segura/server.js). Consulta [`api-segura/README.md`](./api-segura/README.md) para instalar dependencias, obtener el JWT y probar entrada válida, SQLi y `429`.

## Fase 3: pfSense, pfBlockerNG y Snort

Esta fase necesita VirtualBox/VMware y una VM de pfSense, por lo que no se ejecuta desde este repositorio.

1. Crea una interfaz WAN (NAT o puente) y una LAN en red interna `192.168.10.0/24`; usa `192.168.10.1` como dirección LAN de pfSense.
2. Desde una VM de pruebas, accede a `https://192.168.10.1`. En **Firewall > Rules > LAN**, bloquea tráfico no autorizado y permite explícitamente solo lo necesario, incluido HTTP/HTTPS si el laboratorio lo requiere.
3. Instala **pfBlockerNG**, activa DNSBL y configura un feed de phishing confiable. Verifica desde la VM interna que un dominio de prueba se resuelve a la IP virtual de bloqueo configurada. No asumas `10.10.10.1`: confirma la dirección en tu configuración DNSBL.
4. Instala **Snort**, selecciona LAN, activa **Block Offenders** y agrega la regla:

```text
alert tcp any any -> $HOME_NET any (msg:"ALERTA: Escaneo de puertos Nmap SYN detectado"; flags:S; threshold:type threshold, track by_src, count 15, seconds 5; sid:1000001; rev:1;)
```

5. Desde una VM atacante autorizada ejecuta:

```bash
nmap -sS -p 1-100 192.168.10.1
```

Revisa **Services > Snort > Alerts** y **Blocked**. La regla puede requerir ajuste según la versión de Snort, la interfaz y el tráfico observado; registra el SID, IP origen, hora y evidencia de bloqueo.

## Entregables

- Resultados y capturas de DVWA/ZAP.
- Evidencia de las respuestas `400`, `401`, `403`, `200` y `429` de la API.
- Evidencia de reglas, DNSBL, alertas y bloqueo en pfSense/Snort.
- [`evaluacion_riesgos.md`](./evaluacion_riesgos.md) completado con fecha, alcance y evidencias.
