const express = require('express');
const client = require('prom-client');

const app = express();
const port = 3000;

// 1. Configurar el registro de métricas de Prometheus
const register = new client.Registry();
client.collectDefaultMetrics({ register }); // Recolecta CPU, RAM, etc.

// 2. Crear una métrica personalizada: Contador de peticiones HTTP
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Número total de peticiones HTTP recibidas',
  labelNames: ['method', 'route', 'status_code'],
});
register.registerMetric(httpRequestCounter);

// 3. Endpoint principal (Simula tráfico normal)
app.get('/', (req, res) => {
  httpRequestCounter.inc({ method: 'GET', route: '/', status_code: 200 });
  res.send('¡Hola! La API web está funcionando correctamente.');
});

// 4. Endpoint de error (Simula fallos en la web)
app.get('/error', (req, res) => {
  httpRequestCounter.inc({ method: 'GET', route: '/error', status_code: 500 });
  res.status(500).send('Error interno del servidor simulado.');
});

// 5. Endpoint que Prometheus llamará para leer las métricas
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`Aplicación web corriendo en http://localhost:${port}`);
});