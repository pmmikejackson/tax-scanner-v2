#!/usr/bin/env node

/**
 * Tax Scanner v2 - User Guide Generator
 * 
 * This script automatically generates a comprehensive PDF user guide with:
 * - Live screenshots from the deployed application
 * - Step-by-step instructions with images
 * - Professional formatting and branding
 * - Version synchronization with the app
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const moment = require('moment');

// Configuration
const CONFIG = {
  // Your deployed app URL
  APP_URL: 'https://taxscanner.vercel.app',
  // Output directory
  OUTPUT_DIR: path.join(__dirname, 'user-guide', 'output'),
  IMAGES_DIR: path.join(__dirname, 'user-guide', 'images'),
  TEMPLATES_DIR: path.join(__dirname, 'user-guide', 'templates'),
  
  // Screenshot settings
  VIEWPORT: { width: 1920, height: 1080 },
  MOBILE_VIEWPORT: { width: 1024, height: 768 }, // iPad landscape
  
  // PDF settings
  PDF_OPTIONS: {
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    }
  }
};

class UserGuideGenerator {
  constructor() {
    this.browser = null;
    this.page = null;
    this.version = '0.1.4'; // Will be read from package.json
  }

  async init() {
    console.log('🚀 Starting Tax Scanner v2 User Guide Generation...');
    
    // Create directories
    await this.ensureDirectories();
    
    // Launch browser for screenshot capture
    console.log('📖 Launching browser for screenshot capture...');
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 60000 // 60 second timeout
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport(CONFIG.VIEWPORT);
    
    // Set longer timeout for page navigation
    this.page.setDefaultNavigationTimeout(60000); // 60 seconds
    this.page.setDefaultTimeout(60000); // 60 seconds
    
    // Read version from frontend package.json
    try {
      const packageJson = require('../frontend/package.json');
      this.version = packageJson.version;
    } catch (error) {
      console.warn('Could not read version from package.json:', error.message);
    }
    
    console.log(`📖 Generating guide for version ${this.version}`);
  }

  async ensureDirectories() {
    const dirs = [CONFIG.OUTPUT_DIR, CONFIG.IMAGES_DIR, CONFIG.TEMPLATES_DIR];
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async captureScreenshots() {
    console.log('📸 Capturing live screenshots...');
    
    const screenshots = [];
    
    try {
      // Wait for page to load completely
      await this.page.goto(CONFIG.APP_URL, { 
        waitUntil: 'networkidle0',
        timeout: 60000 
      });
      
      // Wait additional time for all elements to render
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 1. Homepage - Main Interface
      console.log('📸 Capturing: Homepage');
      const homepagePath = path.join(CONFIG.IMAGES_DIR, 'homepage-main.png');
      await this.page.screenshot({
        path: homepagePath,
        fullPage: true
      });
      const homepageData = await fs.readFile(homepagePath);
      screenshots.push({
        name: 'Homepage - Main Interface',
        path: 'homepage-main.png',
        imageData: homepageData.toString('base64')
      });
      
      // 2. Focus on location button
      console.log('📸 Capturing: Location Detection');
      await this.page.evaluate(() => {
        const button = document.querySelector('button[class*="btn-primary"]');
        if (button) {
          button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const buttonPath = path.join(CONFIG.IMAGES_DIR, 'location-button.png');
      await this.page.screenshot({
        path: buttonPath,
        fullPage: false
      });
      const buttonData = await fs.readFile(buttonPath);
      screenshots.push({
        name: 'Location Detection Button',
        path: 'location-button.png',
        imageData: buttonData.toString('base64')
      });
      
      // 3. Manual Selection Dropdowns (focus on form)
      console.log('📸 Capturing: Manual Selection');
      await this.page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      const formPath = path.join(CONFIG.IMAGES_DIR, 'manual-selection.png');
      await this.page.screenshot({
        path: formPath,
        fullPage: false
      });
      const formData = await fs.readFile(formPath);
      screenshots.push({
        name: 'Manual Selection Dropdowns',
        path: 'manual-selection.png',
        imageData: formData.toString('base64')
      });
      
      // 4. Perform Dallas Tax Lookup for Real Results
      console.log('📸 Performing Dallas tax lookup for real results');
      await this.page.reload({ waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Select Texas
      await this.page.waitForSelector('select[id="state"]');
      await this.page.select('select[id="state"]', 'TX');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Select Dallas County
      await this.page.waitForSelector('select[id="county"]');
      await this.page.select('select[id="county"]', 'dallas');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Select Dallas City
      await this.page.waitForSelector('select[id="city"]');
      await this.page.select('select[id="city"]', 'dallas');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Submit the form
      await this.page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 5. Capture Tax Results with Real Dallas Data
      console.log('📸 Capturing: Real Dallas Tax Results');
      const resultsPath = path.join(CONFIG.IMAGES_DIR, 'tax-results.png');
      await this.page.screenshot({
        path: resultsPath,
        fullPage: false
      });
      const resultsData = await fs.readFile(resultsPath);
      screenshots.push({
        name: 'Tax Results Display - Dallas, TX',
        path: 'tax-results.png',
        imageData: resultsData.toString('base64')
      });
      
      // 6. Focused Location Button Screenshot (highlighted)
      console.log('📸 Capturing: Focused Location Button');
      await this.page.setViewport(CONFIG.VIEWPORT);
      await this.page.goto(CONFIG.APP_URL, { waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add highlighting to location button
      await this.page.evaluate(() => {
        const button = document.querySelector('button[class*="btn-primary"]');
        if (button) {
          button.style.outline = '4px solid #ff6b6b';
          button.style.outlineOffset = '2px';
          button.style.boxShadow = '0 0 0 8px rgba(255, 107, 107, 0.3)';
          button.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const buttonElement = await this.page.$('button[class*="btn-primary"]');
      if (buttonElement) {
        const buttonPath = path.join(CONFIG.IMAGES_DIR, 'location-button-highlighted.png');
        await buttonElement.screenshot({
          path: buttonPath,
          padding: 50
        });
        const buttonData = await fs.readFile(buttonPath);
        screenshots.push({
          name: 'Location Detection Button (Highlighted)',
          path: 'location-button-highlighted.png',
          imageData: buttonData.toString('base64')
        });
      }
      
      // 7-9. iPad Landscape Views - Multiple focused screenshots
      await this.page.setViewport(CONFIG.MOBILE_VIEWPORT);
      await this.page.reload({ waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // iPad Landscape - Homepage view (full page)
      console.log('📸 Capturing: iPad Landscape Homepage');
      const ipadHomePath = path.join(CONFIG.IMAGES_DIR, 'ipad-homepage.png');
      await this.page.screenshot({
        path: ipadHomePath,
        fullPage: false
      });
      const ipadHomeData = await fs.readFile(ipadHomePath);
      screenshots.push({
        name: 'iPad View - Homepage',
        path: 'ipad-homepage.png',
        imageData: ipadHomeData.toString('base64')
      });
      
      // iPad Landscape - Form focused view
      console.log('📸 Capturing: iPad Landscape Form');
      await this.page.evaluate(() => {
        const form = document.querySelector('form');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const ipadFormPath = path.join(CONFIG.IMAGES_DIR, 'ipad-form.png');
      await this.page.screenshot({
        path: ipadFormPath,
        fullPage: false
      });
      const ipadFormData = await fs.readFile(ipadFormPath);
      screenshots.push({
        name: 'iPad View - Selection Form',
        path: 'ipad-form.png',
        imageData: ipadFormData.toString('base64')
      });
      
      // iPad Landscape - Results view (perform Dallas lookup)
      console.log('📸 Capturing: iPad Landscape Results');
      await this.page.reload({ waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Select Texas, Dallas County, Dallas City for results
      await this.page.waitForSelector('select[id="state"]');
      await this.page.select('select[id="state"]', 'TX');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.page.waitForSelector('select[id="county"]');
      await this.page.select('select[id="county"]', 'dallas');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.page.waitForSelector('select[id="city"]');
      await this.page.select('select[id="city"]', 'dallas');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await this.page.click('button[type="submit"]');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const ipadResultsPath = path.join(CONFIG.IMAGES_DIR, 'ipad-results.png');
      await this.page.screenshot({
        path: ipadResultsPath,
        fullPage: false
      });
      const ipadResultsData = await fs.readFile(ipadResultsPath);
      screenshots.push({
        name: 'iPad View - Tax Results',
        path: 'ipad-results.png',
        imageData: ipadResultsData.toString('base64')
      });
      
    } catch (error) {
      console.error('Screenshot capture error:', error);
      // Fall back to placeholder on error
      screenshots.push({
        name: 'Error - Using Placeholder',
        path: 'placeholder'
      });
    }
    
    console.log(`📸 Captured ${screenshots.length} screenshots`);
    return screenshots;
  }

  async generateHTML(screenshots, isPDF = false) {
    console.log('📝 Generating HTML content...', isPDF ? '(PDF version)' : '(Web version)');
    
    // Register Handlebars helpers
    handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });
    
    handlebars.registerHelper('contains', function(str, substr) {
      return str && str.includes && str.includes(substr);
    });
    
    // Read or create HTML template
    const templatePath = path.join(CONFIG.TEMPLATES_DIR, 'user-guide.hbs');
    let template;
    
    try {
      template = await fs.readFile(templatePath, 'utf8');
    } catch (error) {
      // Create default template
      template = await this.createDefaultTemplate(isPDF);
      await fs.writeFile(templatePath, template);
    }
    
    const compile = handlebars.compile(template);
    
    // For PDF, use optimized smaller images by filtering out the largest ones
    let optimizedScreenshots = screenshots;
    if (isPDF) {
      console.log('📄 Optimizing screenshots for PDF');
      // For PDF, include key screenshots but exclude some duplicates
      optimizedScreenshots = screenshots.filter(screenshot => {
        const isEssential = screenshot.name.includes('Homepage') || 
                          screenshot.name.includes('Tax Results') ||
                          screenshot.name.includes('Highlighted') ||
                          screenshot.name.includes('iPad View');
        return isEssential;
      });
      console.log(`📄 PDF will include ${optimizedScreenshots.length} of ${screenshots.length} screenshots`);
    }
    
    const data = {
      title: 'Tax Scanner v2 - User Guide',
      version: this.version,
      generatedDate: moment().format('MMMM Do, YYYY'),
      generatedTime: moment().format('h:mm A'),
      appUrl: CONFIG.APP_URL,
      screenshots: isPDF ? optimizedScreenshots : screenshots,
      year: 2025,
      isPDF: isPDF
    };
    
    // Debug logging (only for web version to avoid spam)
    if (!isPDF) {
      console.log('📝 Template data - screenshots count:', screenshots.length);
      screenshots.forEach((screenshot, index) => {
        console.log(`📝 Screenshot ${index + 1}:`, {
          name: screenshot.name,
          path: screenshot.path,
          hasImageData: !!screenshot.imageData,
          imageDataLength: screenshot.imageData ? screenshot.imageData.length : 0
        });
      });
    }
    
    return compile(data);
  }

  async createDefaultTemplate(isPDF) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.7;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 2.5em;
        }
        .header p {
            font-size: 1.2em;
            color: #666;
            margin-top: 10px;
        }
        .version-info {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
            border-left: 5px solid #2563eb;
        }
        .section {
            margin: 40px 0;
            page-break-inside: avoid;
        }
        .section h2 {
            color: #2563eb;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 10px;
            font-size: 1.8em;
        }
        .screenshot {
            margin: 30px 0;
            text-align: center;
            page-break-inside: avoid;
            background: #f9fafb;
            padding: 20px;
            border-radius: 10px;
        }
        .screenshot img {
            max-width: 100%;
            height: auto;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .screenshot-caption {
            font-weight: 600;
            color: #374151;
            margin-top: 15px;
            font-size: 1.1em;
        }
        .mobile-screenshot {
            margin: 15px 0;
            padding: 15px;
        }
        .mobile-screenshot img {
            border-radius: 15px !important;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
        .mobile-screenshot .screenshot-caption {
            margin-top: 10px;
            font-size: 1em;
        }
        .mobile-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin: 30px 0;
            gap: 20px;
            flex-wrap: wrap;
        }
        .mobile-column {
            flex: 1;
            min-width: 200px;
            text-align: center;
            background: #f9fafb;
            padding: 20px;
            border-radius: 15px;
            border: 1px solid #e5e7eb;
        }
        .ipad-mockup {
            position: relative;
            background: #1f2937;
            border-radius: 20px;
            padding: 25px 20px;
            margin: 0 auto 15px;
            width: fit-content;
            box-shadow: 0 15px 40px rgba(0,0,0,0.4);
            border: 3px solid #374151;
        }
        .ipad-mockup::before {
            content: '';
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 8px;
            background: #6b7280;
            border-radius: 4px;
        }
        .ipad-mockup::after {
            content: '';
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 6px;
            background: #6b7280;
            border-radius: 3px;
        }
        .ipad-mockup img {
            border-radius: 12px;
            display: block;
            max-width: 480px;
            width: 480px;
            height: auto;
            border: 2px solid #4b5563;
        }
        .highlight-box {
            background: #ecfdf5;
            border: 2px solid #10b981;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .tip-box {
            background: #fef3c7;
            border: 2px solid #f59e0b;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .step {
            background: #fff;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            padding: 25px;
            margin: 20px 0;
            position: relative;
            padding-left: 70px;
        }
        .step-number {
            position: absolute;
            left: 25px;
            top: 25px;
            background: #2563eb;
            color: white;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 1.1em;
        }
        .step h3 {
            margin-top: 0;
            color: #1f2937;
            font-size: 1.3em;
        }
        .footer {
            text-align: center;
            margin-top: 60px;
            padding-top: 30px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 0.95em;
        }
        ul, ol {
            padding-left: 25px;
        }
        li {
            margin: 8px 0;
        }
        strong {
            color: #1f2937;
        }
        .friendly-intro {
            background: #f0f9ff;
            padding: 25px;
            border-radius: 15px;
            margin: 30px 0;
            border: 2px solid #2563eb;
        }
        .friendly-intro h3 {
            color: #1e40af;
            margin-top: 0;
        }
        @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>{{title}}</h1>
        <p>Your friendly guide to finding sales tax rates</p>
    </div>

    <div class="version-info">
        <strong>Guide Version:</strong> {{version}}<br>
        <strong>Last Updated:</strong> {{generatedDate}} at {{generatedTime}}<br>
        <strong>Website:</strong> <a href="{{appUrl}}">{{appUrl}}</a>
    </div>

    <div class="friendly-intro">
        <h3>👋 Welcome!</h3>
        <p>Hi there! This guide will help you get the most out of Tax Scanner. Whether you're a restaurant owner, manager, or just need to find sales tax rates quickly, we've got you covered. Don't worry if technology isn't your thing – we'll walk through everything step by step.</p>
    </div>

    <div class="section">
        <h2>📖 What's in This Guide</h2>
        <ol>
            <li><a href="#what-is-this">What is Tax Scanner?</a></li>
            <li><a href="#getting-started">Getting Started (Super Easy!)</a></li>
            <li><a href="#using-gps">Using GPS to Find Your Location</a></li>
            <li><a href="#manual-selection">Picking Your Location Manually</a></li>
            <li><a href="#reading-results">Understanding Your Results</a></li>
            <li><a href="#mobile-tips">Using Tax Scanner on Your Phone</a></li>
            <li><a href="#when-things-go-wrong">When Things Don't Work (Don't Panic!)</a></li>
            <li><a href="#need-help">Need More Help?</a></li>
        </ol>
    </div>

    <div class="section" id="what-is-this">
        <h2>🏢 What is Tax Scanner?</h2>
        <p>Tax Scanner is a simple website that helps you find sales tax rates for any location in Texas. Think of it as your friendly tax rate calculator that's always available, right in your web browser.</p>
        
        <div class="highlight-box">
            <h3>Why You'll Love Tax Scanner:</h3>
            <ul>
                <li><strong>No downloads needed</strong> – Just open your web browser and go!</li>
                <li><strong>Works on everything</strong> – Your phone, tablet, computer, whatever you have</li>
                <li><strong>Always up-to-date</strong> – We get our information straight from the Texas government</li>
                <li><strong>Super fast</strong> – Find tax rates in seconds, not minutes</li>
                <li><strong>Free to use</strong> – No hidden fees, no signup required</li>
            </ul>
        </div>

        <p>We built this especially for restaurant owners and business managers who need accurate tax information quickly. No more digging through government websites or calling around – just simple, reliable tax rates at your fingertips.</p>
    </div>

    <div class="section">
        <h2>📱 See Tax Scanner in Action</h2>
        <p>Here's what Tax Scanner looks like when you use it. Don't worry if it looks different on your device – it automatically adjusts to fit your screen perfectly!</p>
        
        {{#each screenshots}}
        {{#if (contains name 'iPad View')}}
        {{! iPad screenshots will be handled separately below }}
        {{else}}
        <div class="screenshot">
            {{#if imageData}}
            <img src="data:image/png;base64,{{imageData}}" alt="{{name}}" style="max-width: 100%; height: auto; {{#if ../isPDF}}max-height: 400px;{{/if}}" />
            {{else}}
            <div style="background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 15px; padding: 60px 40px; text-align: center; color: #64748b; font-size: 1.1em;">
                <div style="font-size: 3em; margin-bottom: 20px;">📱💻</div>
                <strong>Screenshot Unavailable</strong><br>
                <p style="margin: 10px 0; font-size: 0.95em;">Visit <a href="{{../appUrl}}" style="color: #2563eb;">{{../appUrl}}</a> to see it in action!</p>
            </div>
            {{/if}}
            <div class="screenshot-caption">{{name}}</div>
        </div>
        {{/if}}
        {{/each}}
        
        <div class="section">
            <h2>📱 iPad Landscape Interface</h2>
            <p>Here's how Tax Scanner looks and works on your iPad in landscape mode - it provides a desktop-like experience with bigger screens:</p>
            
            <div class="mobile-row">
                {{#each screenshots}}
                {{#if (contains name 'iPad View - Homepage')}}
                <div class="mobile-column">
                    <div class="ipad-mockup">
                        <img src="data:image/png;base64,{{imageData}}" alt="{{name}}" />
                    </div>
                    <h3>Step 1: Homepage & Location</h3>
                    <p>Full desktop-like layout on iPad landscape. Tap "Use My Current Location" for instant GPS detection, or use the dropdown menus below.</p>
                </div>
                {{/if}}
                {{#if (contains name 'iPad View - Selection Form')}}
                <div class="mobile-column">
                    <div class="ipad-mockup">
                        <img src="data:image/png;base64,{{imageData}}" alt="{{name}}" />
                    </div>
                    <h3>Step 2: Manual Selection</h3>
                    <p>Choose your state, county, and city from the easy-to-use dropdown menus. The larger screen makes selection even easier.</p>
                </div>
                {{/if}}
                {{#if (contains name 'iPad View - Tax Results')}}
                <div class="mobile-column">
                    <div class="ipad-mockup">
                        <img src="data:image/png;base64,{{imageData}}" alt="{{name}}" />
                    </div>
                    <h3>Step 3: View Results</h3>
                    <p>See your tax results in full detail on the larger iPad screen - perfect for business use with clear, readable information.</p>
                </div>
                {{/if}}
                {{/each}}
            </div>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section" id="getting-started">
        <h2>🚀 Getting Started (Super Easy!)</h2>
        <p>Ready to find some tax rates? Great! It literally takes less than a minute. Here's all you need to do:</p>
        
        <div class="step">
            <div class="step-number">1</div>
            <h3>Open Your Web Browser</h3>
            <p>Use whatever browser you normally use – Chrome, Safari, Firefox, Edge, they all work perfectly. On your phone, computer, or tablet.</p>
        </div>

        <div class="step">
            <div class="step-number">2</div>
            <h3>Go to Tax Scanner</h3>
            <p>Type this address in your browser: <strong>{{appUrl}}</strong></p>
            <p>Or bookmark it so you can find it easily next time!</p>
        </div>

        <div class="step">
            <div class="step-number">3</div>
            <h3>Choose How You Want to Find Your Location</h3>
            <p>You have two super easy options:</p>
            <ul>
                <li><strong>"Use My Current Location" button</strong> – Let your device figure out where you are (fastest way!)</li>
                <li><strong>Pick from the dropdowns</strong> – Choose your state, county, and city manually</li>
            </ul>
        </div>

        <div class="step">
            <div class="step-number">4</div>
            <h3>Get Your Tax Rates!</h3>
            <p>Click "Get Tax Rates" and boom – you'll see all the tax information for your location. That's it!</p>
        </div>

        <div class="tip-box">
            <strong>💡 Pro Tip:</strong> The location button is usually faster, but if you're inside a big building or somewhere with poor GPS, the dropdown menus might work better.
        </div>
    </div>

    <div class="section" id="using-gps">
        <h2>📍 Using GPS to Find Your Location</h2>
        <p>This is the fastest way to get tax rates – just let your device do the work for you!</p>
        
        <div class="step">
            <div class="step-number">1</div>
            <h3>Click "Use My Current Location"</h3>
            <p>You'll see a big blue button with a location icon. Just click it!</p>
        </div>

        <div class="step">
            <div class="step-number">2</div>
            <h3>Say "Allow" When Your Browser Asks</h3>
            <p>Your browser will pop up a little message asking if Tax Scanner can access your location. Click "Allow" or "Yes" – we promise we only use it to find tax rates and nothing else!</p>
        </div>

        <div class="step">
            <div class="step-number">3</div>
            <h3>Watch the Magic Happen</h3>
            <p>Tax Scanner will automatically fill in your state, county, and city. Pretty cool, right?</p>
        </div>

        <div class="step">
            <div class="step-number">4</div>
            <h3>Click "Get Tax Rates"</h3>
            <p>And you're done! You'll see all your tax information in just a few seconds.</p>
        </div>

        <div class="tip-box">
            <strong>🤔 Not Working?</strong> No worries! Sometimes GPS takes a moment to warm up, especially if you're indoors. Try moving closer to a window, or just use the dropdown menus instead – they work just as well!
        </div>
    </div>

    <div class="section" id="manual-selection">
        <h2>📋 Picking Your Location Manually</h2>
        <p>Sometimes you want to be extra precise, or maybe GPS isn't working great. No problem! The dropdown menus are super simple to use.</p>
        
        <div class="step">
            <div class="step-number">1</div>
            <h3>Pick Your State</h3>
            <p>Click on the first dropdown that says "Select a state" and choose Texas. (Right now, we focus on Texas, but we're working on adding more states!)</p>
        </div>

        <div class="step">
            <div class="step-number">2</div>
            <h3>Choose Your County</h3>
            <p>After you pick Texas, the second dropdown will light up with all the counties. Find yours and click it. They're in alphabetical order to make it easy to find.</p>
        </div>

        <div class="step">
            <div class="step-number">3</div>
            <h3>Select Your City</h3>
            <p>Once you've chosen your county, the third dropdown will show all the cities in that county. Pick yours!</p>
        </div>

        <div class="step">
            <div class="step-number">4</div>
            <h3>Get Your Results</h3>
            <p>Click the "Get Tax Rates" button and you'll see all your tax information.</p>
        </div>

        <div class="highlight-box">
            <strong>✨ Cool Feature:</strong> As you make selections, the dropdowns automatically update to show only the relevant options. This makes it impossible to pick invalid combinations!
        </div>
    </div>

    <div class="section" id="reading-results">
        <h2>📊 Understanding Your Results</h2>
        <p>Great! You've got your tax rates. But what do all those numbers mean? Let's break it down in plain English:</p>
        
        <div class="highlight-box">
            <h3>What You'll See:</h3>
            <ul>
                <li><strong>State Tax</strong> – This is Texas's base sales tax rate (currently 6.25%)</li>
                <li><strong>County Tax</strong> – Your county might add a little extra tax</li>
                <li><strong>City Tax</strong> – Some cities add their own tax on top</li>
                <li><strong>Total Tax Rate</strong> – This is the big number you care about! It's everything added together</li>
                <li><strong>Last Updated</strong> – When we last got fresh data from the government</li>
            </ul>
        </div>

        <div class="tip-box">
            <strong>💰 The Bottom Line:</strong> The "Total Tax Rate" is what you need for your business. That's the percentage you'll charge customers on top of your menu prices.
        </div>

        <p><strong>For example:</strong> If your total tax rate is 8.25% and someone orders $100 worth of food, you'd charge them $108.25 total ($100 + $8.25 in tax).</p>
    </div>

    <div class="section" id="mobile-tips">
        <h2>📱 Using Tax Scanner on Your Phone</h2>
        <p>Tax Scanner works beautifully on phones and tablets! Here are some tips to make it even easier:</p>
        
        <ul>
            <li><strong>Add it to your home screen</strong> – In your browser, tap "Share" then "Add to Home Screen" for quick access</li>
            <li><strong>GPS works great on phones</strong> – Your phone's location is usually very accurate</li>
            <li><strong>Everything resizes perfectly</strong> – Buttons and text automatically get bigger for easy tapping</li>
            <li><strong>Works offline too</strong> – Once you've loaded the page, you can use it even if your internet gets spotty</li>
        </ul>

        <div class="tip-box">
            <strong>📱 Phone Tip:</strong> If you're using this at work a lot, bookmark it or add it to your home screen. You'll thank yourself later!
        </div>
    </div>

    <div class="section" id="when-things-go-wrong">
        <h2>🔧 When Things Don't Work (Don't Panic!)</h2>
        <p>Sometimes technology has hiccups. Here are the most common issues and how to fix them quickly:</p>
        
        <h3>🗺️ Location Problems</h3>
        <ul>
            <li><strong>Browser says "location denied"</strong> – You accidentally clicked "Block." Just refresh the page and try again, clicking "Allow" this time</li>
            <li><strong>Wrong location detected</strong> – GPS sometimes takes a minute to get precise. Try refreshing or just use the dropdown menus instead</li>
            <li><strong>Location button doesn't work indoors</strong> – Totally normal! GPS doesn't work well inside big buildings. Use the dropdowns – they're just as fast</li>
        </ul>

        <h3>📋 Dropdown Problems</h3>
        <ul>
            <li><strong>Counties won't load</strong> – Make sure you picked a state first. The dropdowns work in order</li>
            <li><strong>No cities showing up</strong> – Double-check that you've selected both a state and county</li>
            <li><strong>Everything loads really slowly</strong> – Your internet might be having a slow day. Give it a moment, or try refreshing</li>
        </ul>

        <h3>🌐 General Website Issues</h3>
        <ul>
            <li><strong>Page won't load at all</strong> – Check your internet connection, or try again in a few minutes</li>
            <li><strong>Looks weird or broken</strong> – Try refreshing the page (press F5 or pull down on mobile)</li>
            <li><strong>Buttons don't work</strong> – Make sure JavaScript is enabled in your browser (it usually is by default)</li>
        </ul>

        <div class="highlight-box">
            <strong>🛠️ Quick Fix for Everything:</strong> When in doubt, refresh the page! It fixes about 90% of website issues.
        </div>
    </div>

    <div class="section" id="need-help">
        <h2>📞 Need More Help?</h2>
        <p>We're here to help! If something's not working or you have questions, here's what you need to know:</p>
        
        <div class="highlight-box">
            <h3>📋 Quick Reference:</h3>
            <ul>
                <li><strong>Website:</strong> <a href="{{appUrl}}">{{appUrl}}</a></li>
                <li><strong>What we cover:</strong> All of Texas (more states coming soon!)</li>
                <li><strong>How often we update:</strong> Every few months when the government releases new data</li>
                <li><strong>Cost:</strong> Completely free – no catch, no signup needed</li>
            </ul>
        </div>

        <div class="tip-box">
            <strong>⚖️ Important Legal Note:</strong> While we get our data directly from official government sources and keep it as current as possible, please double-check tax rates for any critical business decisions. Rules can change, and we want you to stay compliant!
        </div>

        <p><strong>Thanks for using Tax Scanner!</strong> We hope this makes your life a little easier. If you find it helpful, feel free to share it with other business owners who might need it too.</p>
    </div>

    <div class="footer">
        <p><strong>Tax Scanner v2 - Version {{version}}</strong></p>
        <p>This guide was created on {{generatedDate}} at {{generatedTime}}</p>
        <p>© {{year}} Tax Scanner • Data from the Texas Comptroller's office</p>
    </div>
</body>
</html>`;
  }

  async generatePDF(screenshots) {
    console.log('📄 Generating PDF...');
    
    try {
      // Generate PDF-specific HTML (uses file paths instead of base64)
      const pdfHtml = await this.generateHTML(screenshots, true);
      
      // Launch browser just for PDF generation
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
      });
      
      const page = await browser.newPage();
      
      // Set a longer timeout for PDF generation
      page.setDefaultTimeout(60000);
      
      await page.setContent(pdfHtml, { waitUntil: 'networkidle0', timeout: 60000 });
      
      const pdfPath = path.join(CONFIG.OUTPUT_DIR, `tax-scanner-user-guide.pdf`);
      
      await page.pdf({
        path: pdfPath,
        ...CONFIG.PDF_OPTIONS,
        timeout: 60000
      });
      
      await page.close();
      await browser.close();
      
      // Verify the PDF file exists and get its size
      const stats = await fs.stat(pdfPath);
      console.log(`📄 PDF generated successfully: ${pdfPath} (${Math.round(stats.size / 1024)}KB)`);
      
      return pdfPath;
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.browser) {
      console.log('🧹 Closing browser...');
      await this.browser.close();
    }
    console.log('🧹 Cleanup completed');
  }

  async generate() {
    try {
      await this.init();
      
      // Capture screenshots from live app
      const screenshots = await this.captureScreenshots();
      
      // Generate HTML content
      const html = await this.generateHTML(screenshots);
      
      // Save HTML for debugging
      const htmlPath = path.join(CONFIG.OUTPUT_DIR, `tax-scanner-user-guide-v${this.version}.html`);
      await fs.writeFile(htmlPath, html);
      console.log(`📝 HTML saved: ${htmlPath}`);
      
      // Generate PDF
      const pdfPath = await this.generatePDF(screenshots);
      
      // Copy PDF to frontend public directory for web access
      const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public');
      await fs.mkdir(frontendPublicDir, { recursive: true });
      const publicPdfPath = path.join(frontendPublicDir, 'tax-scanner-user-guide.pdf');
      
      try {
        await fs.copyFile(pdfPath, publicPdfPath);
        const publicStats = await fs.stat(publicPdfPath);
        console.log(`📄 PDF copied to public directory: ${publicPdfPath} (${Math.round(publicStats.size / 1024)}KB)`);
        console.log(`📄 PDF will be available at: ${CONFIG.APP_URL}/tax-scanner-user-guide.pdf`);
      } catch (copyError) {
        console.error('❌ Failed to copy PDF to public directory:', copyError);
        throw copyError;
      }
      
      console.log('✅ User guide generation completed successfully!');
      console.log(`📊 Generated files:`);
      console.log(`   - PDF: ${pdfPath}`);
      console.log(`   - HTML: ${htmlPath}`);
      console.log(`   - Screenshots: ${screenshots.length} images in ${CONFIG.IMAGES_DIR}`);
      
      return { pdfPath, htmlPath, screenshots };
      
    } catch (error) {
      console.error('❌ Error generating user guide:', error);
      throw error;
    } finally {
      await this.cleanup();
    }
  }
}

// CLI execution
if (require.main === module) {
  const generator = new UserGuideGenerator();
  generator.generate().catch(console.error);
}

module.exports = UserGuideGenerator; 