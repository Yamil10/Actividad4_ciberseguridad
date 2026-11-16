# API segura de laboratorio

## Requisitos

- Node.js 18 o superior.
- npm.

## Instalación y ejecución

```bash
cd api-segura
npm install
cp .env.example .env
# Edita .env y sustituye JWT_SECRET por una cadena aleatoria de 32 caracteres o más.
npm start
```

La API queda disponible en `http://localhost:3000`.

El secreto no está en el código ni debe subirse al repositorio. La validación reduce la superficie de entrada, pero una aplicación conectada a una base de datos debe usar consultas parametrizadas/prepared statements; `express-validator` por sí solo no reemplaza esa protección.

## Pruebas con curl, REST Client o Thunder Client

Obtener un token:

```bash
curl -s -X POST http://localhost:3000/login
```

Petición válida:

```bash
curl -i -X POST http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer PEGA_AQUI_EL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"juan123"}'
```

Entrada rechazada:

```bash
curl -i -X POST http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer PEGA_AQUI_EL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'\'' OR 1=1--"}'
```

La respuesta esperada para la entrada inválida es `400`. Sin token se obtiene `401` y con un token inválido o expirado, `403`.

## Prueba de rate limiting

Para una prueba rápida, establece `RATE_LIMIT_MAX=3` en `.env`, reinicia el servidor y ejecuta cuatro solicitudes consecutivas. La cuarta debe responder `429 Too Many Requests`. Después vuelve a `100` para la configuración del laboratorio.

