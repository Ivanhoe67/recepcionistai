const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle', timeout: 10000 });
    
    console.log('=== ANÁLISIS VISUAL DE LA PÁGINA DE LOGIN ===\n');
    
    // Verificar el logo
    const logo = await page.locator('img[alt*="RecepcionistAI"], img[alt*="Logo"]').first();
    if (await logo.count() > 0) {
      const logoBox = await logo.boundingBox();
      console.log('LOGO:');
      console.log('  - Src:', await logo.getAttribute('src'));
      console.log('  - Alt:', await logo.getAttribute('alt'));
      console.log('  - Ancho:', logoBox?.width, 'px');
      console.log('  - Alto:', logoBox?.height, 'px');
      console.log('  - Clase:', await logo.getAttribute('class'));
    }
    
    // Verificar texto de bienvenida
    console.log('\nTEXTO DE BIENVENIDA:');
    const welcome = await page.locator('text=Bienvenido a RecepcionistAI').first();
    if (await welcome.count() > 0) {
      const welcomeText = await welcome.textContent();
      const welcomeClass = await welcome.getAttribute('class');
      console.log('  - Texto:', welcomeText);
      console.log('  - Clase:', welcomeClass);
    }
    
    // Verificar formulario
    console.log('\nFORMULARIO:');
    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    const submitButton = await page.locator('button[type="submit"]').first();
    
    console.log('  - Campo Email existe:', await emailInput.count() > 0);
    console.log('  - Campo Password existe:', await passwordInput.count() > 0);
    console.log('  - Botón Submit existe:', await submitButton.count() > 0);
    
    if (await submitButton.count() > 0) {
      const buttonText = await submitButton.textContent();
      console.log('  - Texto del botón:', buttonText);
    }
    
    // Verificar colores y estilos del fondo
    console.log('\nESTILOS:');
    const body = await page.locator('body').first();
    const bodyStyles = await body.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        fontFamily: styles.fontFamily
      };
    });
    console.log('  - Background color:', bodyStyles.backgroundColor);
    console.log('  - Text color:', bodyStyles.color);
    console.log('  - Font family:', bodyStyles.fontFamily);
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
