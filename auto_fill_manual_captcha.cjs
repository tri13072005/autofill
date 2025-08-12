const puppeteer = require('puppeteer');
const fs = require('fs');

const FORM_URL = 'https://popmartstt.com/?zarsrc=1303&utm_source=zalo&utm_medium=zalo&utm_campaign=zalo';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const dataLines = fs.readFileSync('data.txt', 'utf-8').split('\n').filter(Boolean);

  for (const personData of dataLines) {
    const [hoten, ngay, thang, nam, sdt, email, cccd] = personData.split('|').map(s => s.trim());
    // Ensure day and month are always two digits
    const paddedNgay = ngay.padStart(2, '0');
    const paddedThang = thang.padStart(2, '0');
    const dateValue = `${nam}-${paddedThang}-${paddedNgay}`;
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

      // Autofill date of birth fields
      if (await page.$('#txtNgaySinh')) {
        await page.type('#txtNgaySinh', dateValue);
      } else if (
        await page.$('#txtNgaySinh_Ngay') &&
        await page.$('#txtNgaySinh_Thang') &&
        await page.$('#txtNgaySinh_Nam')
      ) {
        await page.evaluate((d, m, y) => {
          document.querySelector('#txtNgaySinh_Ngay').value = d;
          document.querySelector('#txtNgaySinh_Thang').value = m;
          document.querySelector('#txtNgaySinh_Nam').value = y;
        }, paddedNgay, paddedThang, nam);
      } else {
        if (await page.$('#txtNgay')) await page.type('#txtNgay', paddedNgay);
        if (await page.$('#txtThang')) await page.type('#txtThang', paddedThang);
        if (await page.$('#txtNam')) await page.type('#txtNam', nam);
      }

      await page.type('#txtSoDienThoai', sdt);
      await page.type('#txtEmail', email);
      await page.type('#txtCCCD', cccd);

      // Try to auto-submit the form (if captcha is not required)

    } catch (err) {
      console.log(`❌ Lỗi khi điền form cho ${hoten}: ${err.message}. Bỏ qua.`);
    }
  }
})();
