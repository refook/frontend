// Vercel Serverless Function для CORS proxy
export default async function handler(req, res) {
  // Настройка CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { path } = req.query;
    
    if (!path) {
      return res.status(400).json({ error: 'Path parameter is required' });
    }

    // Строим URL для проксирования
    const targetUrl = `https://refook.ru/v1/${path}`;
    
    console.log(`Proxying ${req.method} request to: ${targetUrl}`);
    console.log('Request body:', req.body);

    // Подготавливаем тело запроса
    let requestBody = undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      requestBody = JSON.stringify(req.body);
      console.log('Prepared request body:', requestBody);
    }

    // Подготавливаем заголовки для проксирования
    const proxyHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Передаем Authorization header, если он есть
    if (req.headers.authorization) {
      proxyHeaders.Authorization = req.headers.authorization;
      console.log('Forwarding Authorization header');
    }

    // Выполняем запрос к целевому API
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: proxyHeaders,
      body: requestBody
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText);
      return res.status(response.status).json({ 
        error: `API request failed with status ${response.status}`,
        details: errorText
      });
    }

    const data = await response.json();
    console.log('API response received successfully');
    res.status(200).json(data);

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal proxy error',
      details: error.message 
    });
  }
} 