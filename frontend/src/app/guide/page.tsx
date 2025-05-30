'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeftIcon, 
  DocumentArrowDownIcon,
  MapPinIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  CheckCircleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

export default function UserGuide() {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      // Direct download of the pre-generated PDF
      const a = document.createElement('a');
      a.href = '/tax-scanner-user-guide.pdf';
      a.download = 'tax-scanner-user-guide.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Sorry, there was an error downloading the PDF. Please try again later.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Tax Scanner
            </Link>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Guide'}
            </button>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Tax Scanner User Guide</h1>
          <p className="text-xl text-gray-600">Your friendly guide to finding sales tax rates</p>
        </div>

        {/* Friendly Welcome */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">👋 Welcome!</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Hi there! This guide will help you get the most out of Tax Scanner. Whether you're a restaurant owner, 
            manager, or just need to find sales tax rates quickly, we've got you covered. Don't worry if technology 
            isn't your thing – we'll walk through everything step by step.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📖 What's in This Guide</h2>
          <ol className="space-y-3 text-lg">
            <li><a href="#what-is-this" className="text-blue-600 hover:text-blue-800">What is Tax Scanner?</a></li>
            <li><a href="#getting-started" className="text-blue-600 hover:text-blue-800">Getting Started (Super Easy!)</a></li>
            <li><a href="#using-gps" className="text-blue-600 hover:text-blue-800">Using GPS to Find Your Location</a></li>
            <li><a href="#manual-selection" className="text-blue-600 hover:text-blue-800">Picking Your Location Manually</a></li>
            <li><a href="#reading-results" className="text-blue-600 hover:text-blue-800">Understanding Your Results</a></li>
            <li><a href="#mobile-tips" className="text-blue-600 hover:text-blue-800">Using Tax Scanner on Your Phone</a></li>
            <li><a href="#when-things-go-wrong" className="text-blue-600 hover:text-blue-800">When Things Don't Work (Don't Panic!)</a></li>
            <li><a href="#need-help" className="text-blue-600 hover:text-blue-800">Need More Help?</a></li>
          </ol>
        </div>

        {/* What is Tax Scanner? */}
        <div id="what-is-this" className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <ComputerDesktopIcon className="w-8 h-8 mr-3 text-blue-600" />
            What is Tax Scanner?
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Tax Scanner is a simple website that helps you find sales tax rates for any location in Texas. 
            Think of it as your friendly tax rate calculator that's always available, right in your web browser.
          </p>
          
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-green-900 mb-4">Why You'll Love Tax Scanner:</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <strong>No downloads needed</strong> – Just open your web browser and go!
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <strong>Works on everything</strong> – Your phone, tablet, computer, whatever you have
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <strong>Always up-to-date</strong> – We get our information straight from the Texas government
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <strong>Super fast</strong> – Find tax rates in seconds, not minutes
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
                <strong>Free to use</strong> – No hidden fees, no signup required
              </li>
            </ul>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed">
            We built this especially for restaurant owners and business managers who need accurate tax information quickly. 
            No more digging through government websites or calling around – just simple, reliable tax rates at your fingertips.
          </p>
        </div>

        {/* Getting Started */}
        <div id="getting-started" className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🚀 Getting Started (Super Easy!)</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Ready to find some tax rates? Great! It literally takes less than a minute. Here's all you need to do:
          </p>

          <div className="space-y-6">
            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Open Your Web Browser</h3>
              <p className="text-gray-700">
                Use whatever browser you normally use – Chrome, Safari, Firefox, Edge, they all work perfectly. 
                On your phone, computer, or tablet.
              </p>
            </div>

            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Go to Tax Scanner</h3>
              <p className="text-gray-700 mb-2">
                Type this address in your browser: <strong>https://taxscanner.vercel.app</strong>
              </p>
              <p className="text-gray-700">Or bookmark it so you can find it easily next time!</p>
            </div>

            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choose How You Want to Find Your Location</h3>
              <p className="text-gray-700 mb-3">You have two super easy options:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <MapPinIcon className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" />
                  <strong>"Use My Current Location" button</strong> – Let your device figure out where you are (fastest way!)
                </li>
                <li className="flex items-start">
                  <div className="w-5 h-5 mt-1 mr-3 flex-shrink-0 bg-blue-600 rounded-sm"></div>
                  <strong>Pick from the dropdowns</strong> – Choose your state, county, and city manually
                </li>
              </ul>
            </div>

            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Your Tax Rates!</h3>
              <p className="text-gray-700">
                Click "Get Tax Rates" and boom – you'll see all the tax information for your location. That's it!
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mt-8">
            <div className="flex items-start">
              <LightBulbIcon className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong className="text-yellow-900">💡 Pro Tip:</strong>
                <p className="text-gray-700 mt-1">
                  The location button is usually faster, but if you're inside a big building or somewhere with poor GPS, 
                  the dropdown menus might work better.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Using GPS */}
        <div id="using-gps" className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <MapPinIcon className="w-8 h-8 mr-3 text-blue-600" />
            Using GPS to Find Your Location
          </h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            This is the fastest way to get tax rates – just let your device do the work for you!
          </p>

          <div className="space-y-6">
            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Click "Use My Current Location"</h3>
              <p className="text-gray-700">You'll see a big blue button with a location icon. Just click it!</p>
            </div>

            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Say "Allow" When Your Browser Asks</h3>
              <p className="text-gray-700">
                Your browser will pop up a little message asking if Tax Scanner can access your location. 
                Click "Allow" or "Yes" – we promise we only use it to find tax rates and nothing else!
              </p>
            </div>

            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Watch the Magic Happen</h3>
              <p className="text-gray-700">
                Tax Scanner will automatically fill in your state, county, and city. Pretty cool, right?
              </p>
            </div>

            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Click "Get Tax Rates"</h3>
              <p className="text-gray-700">And you're done! You'll see all your tax information in just a few seconds.</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mt-8">
            <div className="flex items-start">
              <QuestionMarkCircleIcon className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong className="text-yellow-900">🤔 Not Working?</strong>
                <p className="text-gray-700 mt-1">
                  No worries! Sometimes GPS takes a moment to warm up, especially if you're indoors. 
                  Try moving closer to a window, or just use the dropdown menus instead – they work just as well!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Manual Selection */}
        <div id="manual-selection" className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📋 Picking Your Location Manually</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Sometimes you want to be extra precise, or maybe GPS isn't working great. No problem! 
            The dropdown menus are super simple to use.
          </p>

          <div className="space-y-6">
            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Pick Your State</h3>
              <p className="text-gray-700">
                Click on the first dropdown that says "Select a state" and choose Texas. 
                (Right now, we focus on Texas, but we're working on adding more states!)
              </p>
            </div>

            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Choose Your County</h3>
              <p className="text-gray-700">
                After you pick Texas, the second dropdown will light up with all the counties. 
                Find yours and click it. They're in alphabetical order to make it easy to find.
              </p>
            </div>

            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Select Your City</h3>
              <p className="text-gray-700">
                Once you've chosen your county, the third dropdown will show all the cities in that county. Pick yours!
              </p>
            </div>

            <div className="relative bg-gray-50 border-2 border-gray-200 rounded-xl p-6 pl-16">
              <div className="absolute left-6 top-6 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Get Your Results</h3>
              <p className="text-gray-700">Click the "Get Tax Rates" button and you'll see all your tax information.</p>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mt-8">
            <div className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong className="text-green-900">✨ Cool Feature:</strong>
                <p className="text-gray-700 mt-1">
                  As you make selections, the dropdowns automatically update to show only the relevant options. 
                  This makes it impossible to pick invalid combinations!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Understanding Results */}
        <div id="reading-results" className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📊 Understanding Your Results</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Great! You've got your tax rates. But what do all those numbers mean? Let's break it down in plain English:
          </p>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-green-900 mb-4">What You'll See:</h3>
            <ul className="space-y-3 text-gray-700">
              <li><strong>State Tax</strong> – This is Texas's base sales tax rate (currently 6.25%)</li>
              <li><strong>County Tax</strong> – Your county might add a little extra tax</li>
              <li><strong>City Tax</strong> – Some cities add their own tax on top</li>
              <li><strong>Total Tax Rate</strong> – This is the big number you care about! It's everything added together</li>
              <li><strong>Last Updated</strong> – When we last got fresh data from the government</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <div className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0 text-xl">💰</div>
              <div>
                <strong className="text-yellow-900">The Bottom Line:</strong>
                <p className="text-gray-700 mt-1">
                  The "Total Tax Rate" is what you need for your business. That's the percentage you'll charge customers on top of your menu prices.
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>For example:</strong> If your total tax rate is 8.25% and someone orders $100 worth of food, 
            you'd charge them $108.25 total ($100 + $8.25 in tax).
          </p>
        </div>

        {/* Mobile Tips */}
        <div id="mobile-tips" className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <DevicePhoneMobileIcon className="w-8 h-8 mr-3 text-blue-600" />
            Using Tax Scanner on Your Phone
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Tax Scanner works beautifully on phones and tablets! Here are some tips to make it even easier:
          </p>

          <ul className="space-y-4 text-gray-700">
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong>Add it to your home screen</strong> – In your browser, tap "Share" then "Add to Home Screen" for quick access
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong>GPS works great on phones</strong> – Your phone's location is usually very accurate
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong>Everything resizes perfectly</strong> – Buttons and text automatically get bigger for easy tapping
              </div>
            </li>
            <li className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong>Works offline too</strong> – Once you've loaded the page, you can use it even if your internet gets spotty
              </div>
            </li>
          </ul>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mt-8">
            <div className="flex items-start">
              <DevicePhoneMobileIcon className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong className="text-yellow-900">📱 Phone Tip:</strong>
                <p className="text-gray-700 mt-1">
                  If you're using this at work a lot, bookmark it or add it to your home screen. You'll thank yourself later!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div id="when-things-go-wrong" className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
            <ExclamationTriangleIcon className="w-8 h-8 mr-3 text-blue-600" />
            When Things Don't Work (Don't Panic!)
          </h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Sometimes technology has hiccups. Here are the most common issues and how to fix them quickly:
          </p>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="w-6 h-6 mr-2 text-red-600" />
                Location Problems
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong>Browser says "location denied"</strong> – You accidentally clicked "Block." 
                  Just refresh the page and try again, clicking "Allow" this time
                </li>
                <li>
                  <strong>Wrong location detected</strong> – GPS sometimes takes a minute to get precise. 
                  Try refreshing or just use the dropdown menus instead
                </li>
                <li>
                  <strong>Location button doesn't work indoors</strong> – Totally normal! GPS doesn't work well inside big buildings. 
                  Use the dropdowns – they're just as fast
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Dropdown Problems</h3>
              <ul className="space-y-3 text-gray-700">
                <li><strong>Counties won't load</strong> – Make sure you picked a state first. The dropdowns work in order</li>
                <li><strong>No cities showing up</strong> – Double-check that you've selected both a state and county</li>
                <li><strong>Everything loads really slowly</strong> – Your internet might be having a slow day. Give it a moment, or try refreshing</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">🌐 General Website Issues</h3>
              <ul className="space-y-3 text-gray-700">
                <li><strong>Page won't load at all</strong> – Check your internet connection, or try again in a few minutes</li>
                <li><strong>Looks weird or broken</strong> – Try refreshing the page (press F5 or pull down on mobile)</li>
                <li><strong>Buttons don't work</strong> – Make sure JavaScript is enabled in your browser (it usually is by default)</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mt-8">
            <div className="flex items-start">
              <CheckCircleIcon className="w-6 h-6 text-green-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong className="text-green-900">🛠️ Quick Fix for Everything:</strong>
                <p className="text-gray-700 mt-1">
                  When in doubt, refresh the page! It fixes about 90% of website issues.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Need Help */}
        <div id="need-help" className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">📞 Need More Help?</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            We're here to help! If something's not working or you have questions, here's what you need to know:
          </p>

          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-bold text-green-900 mb-4">📋 Quick Reference:</h3>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Website:</strong> <a href="/" className="text-blue-600 hover:text-blue-800">https://taxscanner.vercel.app</a></li>
              <li><strong>What we cover:</strong> All of Texas (more states coming soon!)</li>
              <li><strong>How often we update:</strong> Every few months when the government releases new data</li>
              <li><strong>Cost:</strong> Completely free – no catch, no signup needed</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mt-1 mr-3 flex-shrink-0" />
              <div>
                <strong className="text-yellow-900">⚖️ Important Legal Note:</strong>
                <p className="text-gray-700 mt-1">
                  While we get our data directly from official government sources and keep it as current as possible, 
                  please double-check tax rates for any critical business decisions. Rules can change, and we want you to stay compliant!
                </p>
              </div>
            </div>
          </div>

          <p className="text-lg text-gray-700 leading-relaxed">
            <strong>Thanks for using Tax Scanner!</strong> We hope this makes your life a little easier. 
            If you find it helpful, feel free to share it with other business owners who might need it too.
          </p>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 rounded-xl p-8 text-center">
          <p className="text-lg font-bold text-gray-900 mb-2">Tax Scanner v2</p>
          <p className="text-gray-600 mb-2">© 2025 Tax Scanner • Data from the Texas Comptroller's office</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Tax Scanner
            </Link>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="text-blue-600 hover:text-blue-800 font-medium disabled:text-gray-400"
            >
              {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF Guide'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 