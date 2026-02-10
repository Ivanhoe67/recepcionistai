const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Navegando a http://localhost:3000/login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 10000 });
    
    console.log('\nBuscando elementos en la página...');
    
    // Verificar el logo
    const logo = await page.locator('img[alt*="RecepcionistAI"], img[alt*="Logo"]').first();
    const logoExists = await logo.count() > 0;
    console.log('Logo encontrado:', logoExists);
    
    if (logoExists) {
      const logoSrc = await logo.getAttribute('src');
      console.log('Logo src:', logoSrc);
    }
    
    // Verificar el texto de bienvenida
    const welcomeText = await page.locator('text=Bienvenido a RecepcionistAI').first();
    const welcomeExists = await welcomeText.count() > 0;
    console.log('Texto "Bienvenido a RecepcionistAI" encontrado:', welcomeExists);
    
    // Tomar screenshot
    console.log('\nTomando screenshot...');
    await page.screenshot({ 
      path: 'D:/SaaS Factory Proyectos/recepcionistai/login-screenshot.png',
      fullPage: true 
    });
    console.log('Screenshot guardado en: D:/SaaS Factory Proyectos/recepcionistai/login-screenshot.png');
    
    // Obtener información adicional
    const title = await page.title();
    console.log('\nTítulo de la página:', title);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
