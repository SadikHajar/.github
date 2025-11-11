const puppeteer = require('puppeteer');
const aiService = require('./aiService');
const storage = require('./storage');

let currentStatus = {
  isRunning: false,
  currentJob: null,
  totalApplied: 0,
  errors: []
};

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getStatus() {
  return currentStatus;
}

async function startApplicationProcess(config, cvData) {
  currentStatus.isRunning = true;
  currentStatus.totalApplied = 0;
  currentStatus.errors = [];

  let browser;
  
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    await loginToLinkedIn(page, config.linkedinCredentials);
    
    await delay(3000);

    const jobs = await searchJobs(page, config.jobPreferences);
    
    console.log(`Found ${jobs.length} jobs to apply to`);

    for (const job of jobs.slice(0, config.jobPreferences.maxApplications || 10)) {
      try {
        currentStatus.currentJob = job.title;
        
        await applyToJob(page, job, cvData, config);
        
        await storage.saveApplication({
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          jobUrl: job.url,
          status: 'applied'
        });

        currentStatus.totalApplied++;
        
        await delay(5000 + Math.random() * 5000);
        
      } catch (error) {
        console.error(`Failed to apply to ${job.title}:`, error.message);
        currentStatus.errors.push(`${job.title}: ${error.message}`);
        
        await storage.saveApplication({
          jobTitle: job.title,
          company: job.company,
          location: job.location,
          jobUrl: job.url,
          status: 'failed',
          error: error.message
        });
      }
    }

  } catch (error) {
    console.error('Application process error:', error);
    currentStatus.errors.push(error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    currentStatus.isRunning = false;
    currentStatus.currentJob = null;
  }
}

async function loginToLinkedIn(page, credentials) {
  console.log('Logging into LinkedIn...');
  
  await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
  
  await page.type('#username', credentials.email, { delay: 100 });
  await page.type('#password', credentials.password, { delay: 100 });
  
  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
  ]);

  await delay(2000);
  
  const currentUrl = page.url();
  if (currentUrl.includes('/checkpoint/') || currentUrl.includes('/challenge/')) {
    throw new Error('LinkedIn security challenge detected. Please login manually first.');
  }
  
  console.log('Successfully logged into LinkedIn');
}

async function searchJobs(page, preferences) {
  console.log('Searching for jobs...');
  
  const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(preferences.jobTitle)}&location=${encodeURIComponent(preferences.location)}&f_AL=true`;
  
  await page.goto(searchUrl, { waitUntil: 'networkidle2' });
  await delay(3000);

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight / 2);
  });
  await delay(2000);

  const jobs = await page.evaluate(() => {
    const jobCards = document.querySelectorAll('.job-card-container, .jobs-search-results__list-item');
    const jobList = [];

    jobCards.forEach(card => {
      try {
        const titleElement = card.querySelector('.job-card-list__title, .job-card-container__link');
        const companyElement = card.querySelector('.job-card-container__company-name, .job-card-container__primary-description');
        const locationElement = card.querySelector('.job-card-container__metadata-item');
        const linkElement = card.querySelector('a[href*="/jobs/view/"]');

        if (titleElement && linkElement) {
          jobList.push({
            title: titleElement.textContent.trim(),
            company: companyElement ? companyElement.textContent.trim() : 'Unknown',
            location: locationElement ? locationElement.textContent.trim() : 'Unknown',
            url: linkElement.href
          });
        }
      } catch (e) {
        console.error('Error parsing job card:', e);
      }
    });

    return jobList;
  });

  return jobs.filter(job => job.title && job.url);
}

async function applyToJob(page, job, cvData, config) {
  console.log(`Applying to: ${job.title} at ${job.company}`);
  
  await page.goto(job.url, { waitUntil: 'networkidle2' });
  await delay(2000);

  const easyApplyButton = await page.$('button.jobs-apply-button');
  
  if (!easyApplyButton) {
    throw new Error('Easy Apply not available for this job');
  }

  await easyApplyButton.click();
  await delay(2000);

  let continueApplying = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (continueApplying && attempts < maxAttempts) {
    attempts++;
    
    await fillFormFields(page, cvData);
    
    await delay(1500);

    const nextButton = await page.$('button[aria-label="Continue to next step"], button[aria-label="Review your application"]');
    const submitButton = await page.$('button[aria-label="Submit application"]');

    if (submitButton) {
      await submitButton.click();
      console.log(`Successfully applied to ${job.title}`);
      await delay(2000);
      continueApplying = false;
    } else if (nextButton) {
      await nextButton.click();
      await delay(2000);
    } else {
      const closeButton = await page.$('button[aria-label="Dismiss"]');
      if (closeButton) {
        await closeButton.click();
      }
      throw new Error('Could not complete application - complex form detected');
    }
  }

  if (attempts >= maxAttempts) {
    throw new Error('Application took too many steps - likely requires manual input');
  }
}

async function fillFormFields(page, cvData) {
  const inputs = await page.$$('input[type="text"], input[type="email"], input[type="tel"], textarea');
  
  for (const input of inputs) {
    try {
      const label = await page.evaluate(el => {
        const labelElement = el.closest('label') || document.querySelector(`label[for="${el.id}"]`);
        return labelElement ? labelElement.textContent.toLowerCase() : el.placeholder?.toLowerCase() || '';
      }, input);

      const currentValue = await page.evaluate(el => el.value, input);
      
      if (currentValue) continue;

      let valueToFill = '';

      if (label.includes('first name') || label.includes('prénom')) {
        valueToFill = cvData.parsedData.name.split(' ')[0];
      } else if (label.includes('last name') || label.includes('nom')) {
        const nameParts = cvData.parsedData.name.split(' ');
        valueToFill = nameParts[nameParts.length - 1];
      } else if (label.includes('email') || label.includes('e-mail')) {
        valueToFill = cvData.parsedData.email;
      } else if (label.includes('phone') || label.includes('téléphone')) {
        valueToFill = cvData.parsedData.phone;
      } else if (label.includes('city') || label.includes('ville')) {
        valueToFill = cvData.parsedData.location;
      }

      if (valueToFill) {
        await input.click({ clickCount: 3 });
        await input.type(valueToFill, { delay: 50 });
      }
    } catch (e) {
      console.error('Error filling field:', e.message);
    }
  }
}

module.exports = {
  startApplicationProcess,
  getStatus
};
