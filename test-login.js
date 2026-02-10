const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // 1. Navegar a login
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    
    // 2. Tomar screenshot
    await page.screenshot({ path: 'd:/SaaS Factory Proyectos/recepcionistai/login-screenshot.png', fullPage: true });
    console.log('✓ Screenshot guardado en: d:/SaaS Factory Proyectos/recepcionistai/login-screenshot.png');
    
    // 3. Verificar título
    const title = await page.title();
    console.log(`✓ Título de la página: "${title}"`);
    
    if (title === 'RecepcionistAI') {
      console.log('✓ El título coincide con "RecepcionistAI"');
    } else {
      console.log(`✗ El título NO coincide. Esperado: "RecepcionistAI", Obtenido: "${title}"`);
    }
    
    // 4. Verificar favicon
    const faviconLink = await page.$('link[rel="icon"]');
    const faviconHref = faviconLink ? await faviconLink.getAttribute('href') : null;
    
    if (faviconHref) {
      console.log(`✓ Favicon encontrado: ${faviconHref}`);
    } else {
      console.log('✗ No se encontró favicon en el HTML');
    }
    
    // Información adicional
    const url = page.url();
    console.log(`\nURL actual: ${url}`);
    
  } catch (error) {
    console.error('Error durante las verificaciones:', error.message);
  } finally {
    await browser.close();
  }
})();
