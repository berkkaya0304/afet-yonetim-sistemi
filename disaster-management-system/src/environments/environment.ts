export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080', // Proxy kullanırken boş bırakıyoruz
  apiUrl: 'http://localhost:8080', // Proxy kullanırken boş bırakıyoruz
  apiVersion: 'v1',
  websocketUrl: 'http://localhost:8086/ws' // SockJS için HTTP URL kullan (ws:// değil)
};
