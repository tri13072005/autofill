const puppeteer = require('puppeteer');
const fs = require('fs');

const FORM_URL = 'https://dopx1998.github.io/formdomart/?fbclid=IwY2xjawLsYPdleHRuA2FlbQIxMQABHje__4_HtyytHI5nqS2DkSB6SbR53qqKdVacgvO78yCFhI7AjPghjHVh8UKc_aem_TEXruU42EPrgzSHEwbpVJw';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const dataLines = fs.readFileSync('data.txt', 'utf-8').split('\n').filter(Boolean);

  for (const personData of dataLines) {
    const [hoten, ngay, thang, nam, sdt, email, cccd] = personData.split('|').map(s => s.trim());
    const page = await browser.newPage();
    try {
      await page.goto(FORM_URL, { waitUntil: 'networkidle2' });

      // Wait for countdown to disappear and form to show
      // Try to wait for the countdown element to disappear, fallback to waiting for form field
      try {
        await page.waitForSelector('#txtHoTen', { timeout: 35000, visible: true });
      } catch {
        // fallback: wait for any input field to appear
        await page.waitForSelector('input', { timeout: 35000, visible: true });
      }

      // Chọn ngày bán hàng
      await page.waitForSelector('#slNgayBanHang');
      await page.select('#slNgayBanHang', '2025-08-08'); // value thật trong option

      // Chọn phiên
      await page.waitForSelector('#slPhien');
      await page.select('#slPhien', '1'); // value thật trong option

      // Điền thông tin
      await page.type('#txtHoTen', hoten);

      // Try to fill date of birth: prefer single field, fallback to separate fields
      const dateValue = `${nam}-${thang.padStart(2, '0')}-${ngay.padStart(2, '0')}`;
      if (await page.$('#txtNgaySinh')) {
        await page.type('#txtNgaySinh', dateValue);
      } else {
        // fallback: try separate fields
        if (await page.$('#txtNgay')) await page.type('#txtNgay', ngay);
        if (await page.$('#txtThang')) await page.type('#txtThang', thang);
        if (await page.$('#txtNam')) await page.type('#txtNam', nam);
      }

      await page.type('#txtSoDienThoai', sdt);
      await page.type('#txtEmail', email);
      await page.type('#txtCCCD', cccd);

      // Try to auto-submit the form (if captcha is not required)
      const submitBtn = await page.$('#btnDangKy');
      if (submitBtn) {
        await submitBtn.click();
        console.log(`✅ Đã điền và bấm Đăng ký cho ${hoten}.`);
      } else {
        console.log(`✅ Đã điền xong cho ${hoten} — không tìm thấy nút Đăng ký.`);
      }
    } catch (err) {
      console.log(`❌ Lỗi khi điền form cho ${hoten}: ${err.message}. Bỏ qua.`);
    }
  }
})();
