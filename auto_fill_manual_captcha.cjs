const puppeteer = require('puppeteer');
const fs = require('fs');

const FORM_URL = 'https://dopx1998.github.io/formdomart/?fbclid=IwY2xjawLsYPdleHRuA2FlbQIxMQABHje__4_HtyytHI5nqS2DkSB6SbR53qqKdVacgvO78yCFhI7AjPghjHVh8UKc_aem_TEXruU42EPrgzSHEwbpVJw';

(async () => {
  const browser = await puppeteer.launch({ headless: false });
  const dataLines = fs.readFileSync('data.txt', 'utf-8').split('\n').filter(Boolean);

  for (const personData of dataLines) {
    const [hoten, ngay, thang, nam, sdt, email, cccd] = personData.split('|').map(s => s.trim());

    const page = await browser.newPage();
    await page.goto(FORM_URL, { waitUntil: 'networkidle2' });

    // Chọn ngày bán hàng
    await page.waitForSelector('#slNgayBanHang');
    await page.select('#slNgayBanHang', '2025-08-08'); // value thật trong option

    // Chọn phiên
    await page.waitForSelector('#slPhien');
    await page.select('#slPhien', '1'); // value thật trong option

    // Điền thông tin
    await page.type('#txtHoTen', hoten);
    await page.type('#txtNgay', ngay);
    await page.type('#txtThang', thang);
    await page.type('#txtNam', nam);
    await page.type('#txtSoDienThoai', sdt);
    await page.type('#txtEmail', email);
    await page.type('#txtCCCD', cccd);

    console.log(`✅ Đã điền xong cho ${hoten} — nhập captcha và bấm Đăng ký.`);
  }
})();
