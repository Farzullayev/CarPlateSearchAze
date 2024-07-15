const puppeteer = require('puppeteer');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Dövlət qeydiyyat nişanını daxil edin: ', async (masinnomresi) => {
    try {
        if (!masinnomresi) {
            console.log('Dövlət qeydiyyat nişanını daxil edilməyib!');
            rl.close();
            return;
        }

        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        await page.setViewport({ width: 1280, height: 800 });

        await page.goto('https://services.isb.az/cmtpl/checkValidity');
        await page.type('#txtRegistrationNumber', masinnomresi);
        await page.click('#pageBody_btnCheck');

        await page.waitForXPath('/html/body/div[1]/div/div[2]/div[2]/table/tbody/tr', { timeout: 10000 });

        const xpaths = [
            '/html/body/div[1]/div/div[2]/div[2]/table/tbody/tr/td[1]',
            '/html/body/div[1]/div/div[2]/div[2]/table/tbody/tr/td[2]',
            '/html/body/div[1]/div/div[2]/div[2]/table/tbody/tr/td[3]',
            '/html/body/div[1]/div/div[2]/div[2]/table/tbody/tr/td[4]'
        ];
        const results = {};
        await Promise.all(xpaths.map(async (xpath, index) => {
            const [element] = await page.$x(xpath);
            if (element) {
                const text = await page.evaluate(el => el.textContent.trim(), element);
                switch (index) {
                    case 0:
                        results['Sığorta'] = text;
                        break;
                    case 1:
                        results['Qeydiyyat nişanı'] = text;
                        break;
                    case 2:
                        results['Marka'] = text;
                        break;
                    case 3:
                        results['Model'] = text;
                        break;
                    default:
                        break;
                }
            } else {
                results[xpath] = 'Tapılmadı!';
            }
        }));

        console.log(JSON.stringify(results, null, 2));

        await browser.close();
        rl.close();
    } catch (error) {
        console.error('Bir xəta baş verdi:', error);
        rl.close();
    }
});
