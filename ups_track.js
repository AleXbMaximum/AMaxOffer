// ==UserScript==
// @name         UPS Package Tracker Enhanced
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Track UPS packages directly from any website with saved tracking history
// @author       You
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      ups.com
// @connect      webapis.ups.com
// @connect      onlinetools.ups.com
// @connect      wwwapps.ups.com
// @connect      *
// ==/UserScript==

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        // API endpoint for tracking
        trackingApiUrl: 'https://webapis.ups.com/track/api/Track/GetStatus?loc=en_US',
        // Keep the original URL for "View on UPS.com" links
        trackingWebUrl: 'https://www.ups.com/track?loc=en_US&tracknum=',
        // Cookie management URL
        upsAuthUrl: 'https://www.ups.com/track',
        maxHistoryItems: 10,
        maxActivityDisplay: 5,
        refreshInterval: 30 * 60 * 1000, // 30 minutes
        authRetryLimit: 2
    };

    // Add CSS styles
    GM_addStyle(`
        #ups-tracker-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            background: var(--ups-bg-color, #fff);
            color: var(--ups-text-color, #333);
            border: 1px solid var(--ups-border-color, #ccc);
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.2);
            z-index: 9999;
            font-family: Arial, sans-serif;
            overflow: hidden;
            transition: all 0.3s ease;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
        }
        #ups-tracker-container.dark-mode {
            --ups-bg-color: #222;
            --ups-text-color: #eee;
            --ups-border-color: #444;
            --ups-input-bg: #333;
            --ups-secondary-bg: #333;
            --ups-hover-color: #555;
        }
        #ups-tracker-container:not(.dark-mode) {
            --ups-bg-color: #fff;
            --ups-text-color: #333;
            --ups-border-color: #ccc;
            --ups-input-bg: #fff;
            --ups-secondary-bg: #f5f5f5;
            --ups-hover-color: #f0f0f0;
        }
        #ups-tracker-header {
            background: #351c15;
            color: white;
            padding: 10px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #ups-tracker-header-title {
            display: flex;
            align-items: center;
        }
        #ups-tracker-header img {
            height: 20px;
            margin-right: 5px;
        }
        #ups-tracker-header-actions {
            display: flex;
            gap: 10px;
        }
        #ups-tracker-content {
            padding: 15px;
            overflow-y: auto;
            flex-grow: 1;
        }
        #ups-tracker-input {
            display: flex;
            margin-bottom: 10px;
        }
        #ups-tracker-input input {
            flex-grow: 1;
            padding: 8px;
            border: 1px solid var(--ups-border-color, #ccc);
            border-radius: 4px 0 0 4px;
            background: var(--ups-input-bg, #fff);
            color: var(--ups-text-color, #333);
        }
        #ups-tracker-input button {
            background: #351c15;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 0 4px 4px 0;
            cursor: pointer;
        }
        #ups-tracker-results {
            font-size: 13px;
            line-height: 1.4;
        }
        .ups-milestone {
            margin-bottom: 5px;
            padding-left: 15px;
            position: relative;
        }
        .ups-milestone.current {
            font-weight: bold;
        }
        .ups-milestone.current:before {
            content: "►";
            position: absolute;
            left: 0;
            color: #351c15;
        }
        .ups-activity {
            margin-bottom: 3px;
            border-left: 2px solid var(--ups-border-color, #eee);
            padding-left: 10px;
        }
        .ups-toggle {
            background: none;
            border: none;
            color: #351c15;
            text-decoration: underline;
            cursor: pointer;
            font-size: 12px;
            padding: 0;
            margin-top: 5px;
        }
        .ups-history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px;
            margin-bottom: 5px;
            background: var(--ups-secondary-bg, #f5f5f5);
            border-radius: 4px;
            cursor: pointer;
        }
        .ups-history-item:hover {
            background: var(--ups-hover-color, #f0f0f0);
        }
        .ups-history-number {
            font-weight: bold;
        }
        .ups-history-actions {
            display: flex;
            gap: 5px;
        }
        .ups-history-remove {
            color: #d43f3a;
            cursor: pointer;
        }
        .ups-button {
            background: none;
            border: none;
            cursor: pointer;
            color: white;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        .ups-button:hover {
            opacity: 1;
        }
        .ups-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
        }
        .ups-section {
            margin-bottom: 15px;
        }
        .ups-section-title {
            font-weight: bold;
            margin-bottom: 5px;
            border-bottom: 1px solid var(--ups-border-color, #eee);
            padding-bottom: 2px;
        }
        .ups-tab-container {
            margin-bottom: 15px;
        }
        .ups-tabs {
            display: flex;
            border-bottom: 1px solid var(--ups-border-color, #ccc);
            margin-bottom: 10px;
        }
        .ups-tab {
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
        }
        .ups-tab.active {
            border-bottom: 2px solid #351c15;
            font-weight: bold;
        }
        .ups-tab-content {
            display: none;
        }
        .ups-tab-content.active {
            display: block;
        }
        .ups-copy-btn {
            background: #351c15;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 11px;
            margin-left: 5px;
        }
        .ups-progress-bar {
            height: 8px;
            background: #ddd;
            border-radius: 4px;
            margin: 5px 0;
            overflow: hidden;
        }
        .ups-progress-bar-fill {
            height: 100%;
            background: #351c15;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        .ups-empty-history {
            color: #777;
            text-align: center;
            padding: 20px 0;
        }
        .ups-tooltip {
            position: relative;
            display: inline-block;
        }
        .ups-tooltip .ups-tooltip-text {
            visibility: hidden;
            width: 120px;
            background-color: #555;
            color: #fff;
            text-align: center;
            border-radius: 6px;
            padding: 5px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            margin-left: -60px;
            opacity: 0;
            transition: opacity 0.3s;
            font-size: 11px;
        }
        .ups-tooltip .ups-tooltip-text::after {
            content: "";
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border-width: 5px;
            border-style: solid;
            border-color: #555 transparent transparent transparent;
        }
        .ups-tooltip:hover .ups-tooltip-text {
            visibility: visible;
            opacity: 1;
        }
        @media (max-width: 480px) {
            #ups-tracker-container {
                width: 90%;
                right: 5%;
                bottom: 10px;
            }
        }
        .ups-package-info {
            margin-bottom: 15px;
            padding: 10px;
            background: var(--ups-secondary-bg, #f5f5f5);
            border-radius: 4px;
        }
        .ups-package-detail {
            display: flex;
            margin-bottom: 5px;
        }
        .ups-package-label {
            font-weight: bold;
            width: 120px;
            flex-shrink: 0;
        }
        .ups-package-value {
            flex-grow: 1;
        }
        .ups-external-link {
            color: #351c15;
            text-decoration: none;
            font-weight: bold;
        }
        .ups-external-link:hover {
            text-decoration: underline;
        }
        .ups-open-button {
            display: inline-block;
            background: #351c15;
            color: white;
            text-decoration: none;
            padding: 8px 15px;
            border-radius: 4px;
            margin-top: 10px;
            font-weight: bold;
        }
    `);

    // Utility functions
    const Utils = {
        saveTrackingHistory(trackingNumber, label = '') {
            let history = GM_getValue('ups_tracking_history', []);

            // Remove if exists
            history = history.filter(item => item.number !== trackingNumber);

            // Add to beginning
            history.unshift({
                number: trackingNumber,
                label: label,
                timestamp: Date.now()
            });

            // Limit size
            if (history.length > CONFIG.maxHistoryItems) {
                history = history.slice(0, CONFIG.maxHistoryItems);
            }

            GM_setValue('ups_tracking_history', history);
        },

        getTrackingHistory() {
            return GM_getValue('ups_tracking_history', []);
        },

        removeFromHistory(trackingNumber) {
            let history = GM_getValue('ups_tracking_history', []);
            history = history.filter(item => item.number !== trackingNumber);
            GM_setValue('ups_tracking_history', history);
        },

        formatDate(dateStr, timeStr) {
            if (!dateStr) return 'Unknown';
            return `${dateStr || ''} ${timeStr || ''}`.trim();
        },

        copyToClipboard(text) {
            const el = document.createElement('textarea');
            el.value = text;
            document.body.appendChild(el);
            el.select();
            document.execCommand('copy');
            document.body.removeChild(el);
        },

        showTooltip(element, message) {
            const tooltip = document.createElement('span');
            tooltip.className = 'ups-tooltip-text';
            tooltip.textContent = message;
            element.appendChild(tooltip);

            setTimeout(() => {
                tooltip.style.visibility = 'visible';
                tooltip.style.opacity = '1';
            }, 10);

            setTimeout(() => {
                tooltip.style.visibility = 'hidden';
                tooltip.style.opacity = '0';
                setTimeout(() => tooltip.remove(), 300);
            }, 2000);
        },

        isDarkMode() {
            return GM_getValue('ups_dark_mode', false);
        },

        toggleDarkMode() {
            const currentMode = this.isDarkMode();
            GM_setValue('ups_dark_mode', !currentMode);
            return !currentMode;
        },

        validateTrackingNumber(trackingNum) {
            if (!trackingNum || trackingNum.length < 10) {
                return false;
            }
            // Basic validation for common UPS formats
            return /^1Z[0-9A-Z]{16}$|^T\d{10}$|^[a-zA-Z0-9]{9,}$/.test(trackingNum.trim());
        },

        // Get CSRF token from cookies
        getCSRFToken() {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('X-XSRF-TOKEN-ST=')) {
                    return cookie.substring('X-XSRF-TOKEN-ST='.length, cookie.length);
                }
                if (cookie.startsWith('XSRF-TOKEN=')) {
                    return cookie.substring('XSRF-TOKEN='.length, cookie.length);
                }
                if (cookie.startsWith('X-CSRF-TOKEN=')) {
                    return cookie.substring('X-CSRF-TOKEN='.length, cookie.length);
                }
            }
            // If no token found, return empty string
            return '';
        },

        // Process tracking API response
        processTrackingResponse(data, trackingNumber) {
            try {
                // Check if response has expected structure
                if (!data || !data.trackDetails || !data.trackDetails[0]) {
                    throw new Error('Invalid response format');
                }

                const trackDetail = data.trackDetails[0];

                // Initialize tracking data structure
                const tracking = {
                    trackingNumber: trackingNumber,
                    status: 'Unknown',
                    scheduledDelivery: '',
                    lastActivity: '',
                    lastLocation: '',
                    lastDate: '',
                    service: '',
                    deliveryLocation: '',
                    progress: 0,
                    progressType: '',
                    activities: []
                };

                // Extract status
                if (trackDetail.packageStatus) {
                    tracking.status = trackDetail.packageStatus || 'Unknown';
                }

                // Extract progress information
                if (trackDetail.progressBarPercentage) {
                    tracking.progress = parseInt(trackDetail.progressBarPercentage) || 0;
                    tracking.progressType = trackDetail.progressBarType || '';
                }

                // Extract scheduled delivery
                if (trackDetail.scheduledDeliveryDateDetail) {
                    const monthKey = trackDetail.scheduledDeliveryDateDetail.monthCMSKey || '';
                    const month = monthKey.replace('cms.stapp.', '');
                    const day = trackDetail.scheduledDeliveryDateDetail.dayNum || '';
                    const time = trackDetail.packageStatusTime ? trackDetail.packageStatusTime.replace('cms.stapp.', '') : '';

                    tracking.scheduledDelivery = `${month.toUpperCase()} ${day}${time ? ' ' + time : ''}`;
                }

                // Extract service type
                if (trackDetail.additionalInformation && trackDetail.additionalInformation.serviceInformation) {
                    tracking.service = trackDetail.additionalInformation.serviceInformation.serviceName || '';
                }

                // Extract activities from shipmentProgressActivities
                if (trackDetail.shipmentProgressActivities && Array.isArray(trackDetail.shipmentProgressActivities)) {
                    tracking.activities = trackDetail.shipmentProgressActivities.map(activity => {
                        return {
                            date: `${activity.date || ''} ${activity.time || ''}`.trim(),
                            location: activity.location || '',
                            description: activity.activityScan || 'Activity'
                        };
                    });

                    // Set the first activity as the last activity
                    if (tracking.activities.length > 0) {
                        const latestActivity = tracking.activities[0];
                        tracking.lastActivity = latestActivity.description;
                        tracking.lastLocation = latestActivity.location;
                        tracking.lastDate = latestActivity.date;
                    }
                }

                // Extract delivery location
                if (trackDetail.shipToAddress) {
                    const address = trackDetail.shipToAddress;
                    tracking.deliveryLocation = [
                        address.streetAddress1,
                        address.city,
                        address.state || address.province,
                        address.zipCode,
                        address.country
                    ].filter(Boolean).join(', ');
                }

                return tracking;
            } catch (error) {
                console.error('Error processing tracking response:', error);
                return null;
            }
        },

        // Get authentication from UPS
        getUPSAuthentication() {
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'GET',
                    url: CONFIG.upsAuthUrl,
                    onload: function (response) {
                        if (response.status >= 200 && response.status < 300) {
                            resolve(true);
                        } else {
                            reject(new Error(`Failed to authenticate with UPS. Status: ${response.status}`));
                        }
                    },
                    onerror: function (error) {
                        reject(new Error('Failed to connect to UPS servers'));
                    }
                });
            });
        }
    };

    // Create tracker UI
    const createTrackerUI = () => {
        const container = document.createElement('div');
        container.id = 'ups-tracker-container';

        if (Utils.isDarkMode()) {
            container.classList.add('dark-mode');
        }

        container.innerHTML = `
            <div id="ups-tracker-header">
                <div id="ups-tracker-header-title">
                    <img src="https://www.ups.com/assets/resources/images/UPS_logo.svg" alt="UPS">
                    Package Tracker
                </div>
                <div id="ups-tracker-header-actions">
                    <button class="ups-button ups-theme-toggle" title="Toggle Dark Mode">🌓</button>
                    <button class="ups-button ups-close" title="Close Tracker">&times;</button>
                </div>
            </div>
            <div id="ups-tracker-content">
                <div class="ups-tab-container">
                    <div class="ups-tabs">
                        <div class="ups-tab active" data-tab="track">Track</div>
                        <div class="ups-tab" data-tab="history">History</div>
                    </div>

                    <div class="ups-tab-content active" data-tab="track">
                        <div id="ups-tracker-input">
                            <input type="text" placeholder="Enter UPS tracking number" />
                            <button>Track</button>
                        </div>
                        <div id="ups-tracker-results"></div>
                    </div>

                    <div class="ups-tab-content" data-tab="history">
                        <div id="ups-history-container"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Handle close button
        container.querySelector('.ups-close').addEventListener('click', () => {
            container.style.display = 'none';
        });

        // Handle theme toggle
        container.querySelector('.ups-theme-toggle').addEventListener('click', () => {
            const isDark = Utils.toggleDarkMode();
            container.classList.toggle('dark-mode', isDark);
        });

        // Handle tab switching
        container.querySelectorAll('.ups-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Update tabs
                container.querySelectorAll('.ups-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Update content
                const tabName = tab.dataset.tab;
                container.querySelectorAll('.ups-tab-content').forEach(content => {
                    content.classList.toggle('active', content.dataset.tab === tabName);
                });

                // Load history if needed
                if (tabName === 'history') {
                    loadTrackingHistory();
                }
            });
        });

        // Handle track button
        container.querySelector('#ups-tracker-input button').addEventListener('click', () => {
            const trackingNumber = container.querySelector('#ups-tracker-input input').value.trim();
            if (Utils.validateTrackingNumber(trackingNumber)) {
                trackPackage(trackingNumber);
                Utils.saveTrackingHistory(trackingNumber);
            } else {
                showError('Please enter a valid UPS tracking number');
            }
        });

        // Handle enter key
        container.querySelector('#ups-tracker-input input').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                const trackingNumber = e.target.value.trim();
                if (Utils.validateTrackingNumber(trackingNumber)) {
                    trackPackage(trackingNumber);
                    Utils.saveTrackingHistory(trackingNumber);
                } else {
                    showError('Please enter a valid UPS tracking number');
                }
            }
        });

        return container;
    };

    // Show error message
    const showError = (message) => {
        const resultsDiv = document.getElementById('ups-tracker-results');
        resultsDiv.innerHTML = `<p style="color: #d9534f;">${message}</p>`;
    };

    // Load tracking history
    const loadTrackingHistory = () => {
        const historyContainer = document.getElementById('ups-history-container');
        const history = Utils.getTrackingHistory();

        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="ups-empty-history">
                    <p>No tracking history yet</p>
                    <p>Track packages to save them here</p>
                </div>
            `;
            return;
        }

        let html = '';

        history.forEach(item => {
            const label = item.label || item.number;
            const date = new Date(item.timestamp).toLocaleDateString();

            html += `
                <div class="ups-history-item" data-number="${item.number}">
                    <div class="ups-history-info">
                        <div class="ups-history-number">${label}</div>
                        <div class="ups-history-date">Added: ${date}</div>
                    </div>
                    <div class="ups-history-actions">
                        <span class="ups-history-remove" data-number="${item.number}" title="Remove">❌</span>
                    </div>
                </div>
            `;
        });

        historyContainer.innerHTML = html;

        // Add click handlers for history items
        historyContainer.querySelectorAll('.ups-history-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('ups-history-remove')) {
                    const number = item.dataset.number;
                    trackPackage(number);

                    // Switch to tracking tab
                    document.querySelector('.ups-tab[data-tab="track"]').click();
                }
            });
        });

        // Add remove handlers
        historyContainer.querySelectorAll('.ups-history-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const number = btn.dataset.number;
                Utils.removeFromHistory(number);
                loadTrackingHistory();
            });
        });
    };

    // Track package function
    const trackPackage = (trackingNumber) => {
        const resultsDiv = document.getElementById('ups-tracker-results');
        resultsDiv.innerHTML = '<p>Loading tracking information...</p>';

        // Use the fetch API method with retry support
        fetchTrackingAPI(trackingNumber, 0);
    };

    // New enhanced function to fetch tracking info using the API with retry/auth support
    const fetchTrackingAPI = async (trackingNumber, retryCount = 0) => {
        const resultsDiv = document.getElementById('ups-tracker-results');

        // Check if we have a CSRF token
        let csrfToken = Utils.getCSRFToken();

        // If no token, try to get one first
        if (!csrfToken && retryCount < CONFIG.authRetryLimit) {
            resultsDiv.innerHTML = '<p>Obtaining UPS authentication...</p>';
            try {
                // Try to get authentication from UPS
                await Utils.getUPSAuthentication();

                // Check if we got a token after authentication
                csrfToken = Utils.getCSRFToken();

                if (!csrfToken) {
                    throw new Error('Could not obtain authentication token');
                }

                // Now retry with the token
                setTimeout(() => fetchTrackingAPI(trackingNumber, retryCount + 1), 1000);
                return;
            } catch (error) {
                console.error('Authentication error:', error);
                resultsDiv.innerHTML = `
                    <div class="ups-section">
                        <p>Unable to authenticate with UPS API. Tracking is available on the official site:</p>
                        <a href="${CONFIG.trackingWebUrl}${trackingNumber}" target="_blank" class="ups-open-button">
                            Track on UPS.com
                        </a>
                    </div>
                `;
                return;
            }
        }

        // Prepare request payload
        const payload = {
            Locale: "en_US",
            TrackingNumber: [trackingNumber],
            isBarcodeScanned: false,
            Requester: "st/trackdetails",
            returnToValue: ""
        };

        // Prepare headers
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json, text/plain, */*',
            'Origin': 'https://www.ups.com',
            'Referer': 'https://www.ups.com/'
        };

        // Add CSRF token if available
        if (csrfToken) {
            headers['x-xsrf-token'] = csrfToken;
        }

        // Use GM_xmlhttpRequest for cross-domain support
        GM_xmlhttpRequest({
            method: 'POST',
            url: CONFIG.trackingApiUrl,
            headers: headers,
            data: JSON.stringify(payload),
            responseType: 'json',
            onload: function (response) {
                if (response.status >= 200 && response.status < 300) {
                    try {
                        const data = typeof response.response === 'string'
                            ? JSON.parse(response.response)
                            : response.response;

                        // Process the API response
                        const trackingInfo = Utils.processTrackingResponse(data, trackingNumber);

                        if (trackingInfo) {
                            // Display the tracking information
                            displayTrackingResults(trackingInfo);
                        } else {
                            // Fall back to basic tracking link
                            resultsDiv.innerHTML = `
                                <div class="ups-section">
                                    <p>Unable to process tracking information. View on the official site:</p>
                                    <a href="${CONFIG.trackingWebUrl}${trackingNumber}" target="_blank" class="ups-open-button">
                                        View on UPS.com
                                    </a>
                                </div>
                            `;
                        }
                    } catch (error) {
                        console.error('Response processing error:', error);
                        resultsDiv.innerHTML = `
                            <p>Error processing tracking data: ${error.message}</p>
                            <a href="${CONFIG.trackingWebUrl}${trackingNumber}" target="_blank" class="ups-open-button">
                                Track on UPS.com
                            </a>
                        `;
                    }
                } else if (response.status === 401 || response.status === 403) {
                    // Authentication issue
                    if (retryCount < CONFIG.authRetryLimit) {
                        resultsDiv.innerHTML = '<p>Retrying authentication...</p>';
                        setTimeout(() => fetchTrackingAPI(trackingNumber, retryCount + 1), 1000);
                    } else {
                        resultsDiv.innerHTML = `
                            <p>Authentication required for UPS tracking.</p>
                            <a href="${CONFIG.trackingWebUrl}${trackingNumber}" target="_blank" class="ups-open-button">
                                Track on UPS.com
                            </a>
                        `;
                    }
                } else {
                    // Other API errors
                    resultsDiv.innerHTML = `
                        <p>Error from UPS API: ${response.status} ${response.statusText}</p>
                        <a href="${CONFIG.trackingWebUrl}${trackingNumber}" target="_blank" class="ups-open-button">
                            Track on UPS.com
                        </a>
                    `;
                }
            },
            onerror: function (error) {
                console.error('Request error:', error);
                resultsDiv.innerHTML = `
                    <p>Error connecting to UPS servers</p>
                    <a href="${CONFIG.trackingWebUrl}${trackingNumber}" target="_blank" class="ups-open-button">
                        Track on UPS.com
                    </a>
                `;
            }
        });
    };

    // Display tracking results
    const displayTrackingResults = (trackingInfo) => {
        const resultsDiv = document.getElementById('ups-tracker-results');

        let html = '';

        // Main status section with progress bar
        html += `
            <div class="ups-section">
                <div class="ups-section-title">
                    Status
                    <button class="ups-copy-btn" data-copy="${trackingInfo.trackingNumber}">Copy</button>
                </div>
                <p><strong>${trackingInfo.status || 'Unknown'}</strong></p>

                ${trackingInfo.progress ?
                `<div class="ups-progress-bar">
                    <div class="ups-progress-bar-fill" style="width: ${trackingInfo.progress}%"></div>
                </div>` : ''}

                ${trackingInfo.scheduledDelivery ?
                `<div class="ups-package-detail">
                        <div class="ups-package-label">Estimated Delivery:</div>
                        <div class="ups-package-value">${trackingInfo.scheduledDelivery}</div>
                     </div>` : ''}

                ${trackingInfo.service ?
                `<div class="ups-package-detail">
                        <div class="ups-package-label">Service:</div>
                        <div class="ups-package-value">${trackingInfo.service}</div>
                     </div>` : ''}
            </div>
        `;

        // Last Activity section
        if (trackingInfo.lastActivity) {
            html += `
                <div class="ups-section">
                    <div class="ups-section-title">Latest Activity</div>
                    <p><strong>${trackingInfo.lastActivity}</strong></p>
                    <p>${trackingInfo.lastLocation || ''} - ${trackingInfo.lastDate || ''}</p>
                </div>
            `;
        }

        // Location section
        if (trackingInfo.deliveryLocation) {
            html += `
                <div class="ups-section">
                    <div class="ups-section-title">Delivery Location</div>
                    <p>${trackingInfo.deliveryLocation}</p>
                </div>
            `;
        }

        // Activities section
        if (trackingInfo.activities && trackingInfo.activities.length > 0) {
            html += `
                <div class="ups-section">
                    <div class="ups-section-title">Activity History</div>
                    <div id="ups-activities-list">
            `;

            const displayCount = Math.min(trackingInfo.activities.length, CONFIG.maxActivityDisplay);

            for (let i = 0; i < displayCount; i++) {
                const activity = trackingInfo.activities[i];
                html += `
                    <div class="ups-activity">
                        <div><strong>${activity.date || ''}</strong></div>
                        <div>${activity.description || 'Unknown'}</div>
                        <div>${activity.location || ''}</div>
                    </div>
                `;
            }

            if (trackingInfo.activities.length > CONFIG.maxActivityDisplay) {
                html += `
                    <button class="ups-toggle" id="ups-show-more">Show ${trackingInfo.activities.length - CONFIG.maxActivityDisplay} more activities</button>
                `;
            }

            html += `</div></div>`;
        }

        // Label edit section
        html += `
            <div class="ups-section">
                <div class="ups-section-title">Tracking Label</div>
                <div style="display: flex; margin-bottom: 10px;">
                    <input type="text" id="ups-tracking-label" placeholder="Add a label for this package"
                           style="flex-grow: 1; padding: 5px; border: 1px solid var(--ups-border-color, #ccc); border-radius: 4px; background: var(--ups-input-bg, #fff); color: var(--ups-text-color, #333);">
                    <button id="ups-save-label" style="margin-left: 5px; background: #351c15; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Save</button>
                </div>
            </div>
        `;

        // UPS website link
        html += `
            <div class="ups-section">
                <a href="${CONFIG.trackingWebUrl}${trackingInfo.trackingNumber}" target="_blank" class="ups-external-link">
                    View full details on UPS.com →
                </a>
            </div>
        `;

        resultsDiv.innerHTML = html;

        // Set label if exists
        const history = Utils.getTrackingHistory();
        const existingItem = history.find(item => item.number === trackingInfo.trackingNumber);
        if (existingItem && existingItem.label) {
            document.getElementById('ups-tracking-label').value = existingItem.label;
        }

        // Handle save label button
        const saveLabelBtn = document.getElementById('ups-save-label');
        if (saveLabelBtn) {
            saveLabelBtn.addEventListener('click', () => {
                const label = document.getElementById('ups-tracking-label').value.trim();
                Utils.saveTrackingHistory(trackingInfo.trackingNumber, label);
                Utils.showTooltip(saveLabelBtn, 'Label saved!');
            });
        }

        // Handle show more button
        const showMoreBtn = document.getElementById('ups-show-more');
        if (showMoreBtn && trackingInfo.activities) {
            showMoreBtn.addEventListener('click', () => {
                let activitiesHtml = '';
                trackingInfo.activities.forEach(activity => {
                    activitiesHtml += `
                        <div class="ups-activity">
                            <div><strong>${activity.date || ''}</strong></div>
                            <div>${activity.description || 'Unknown'}</div>
                            <div>${activity.location || ''}</div>
                        </div>
                    `;
                });

                document.getElementById('ups-activities-list').innerHTML = activitiesHtml;
            });
        }

        // Handle copy status button
        const copyStatusBtn = document.querySelector('.ups-copy-btn');
        if (copyStatusBtn) {
            copyStatusBtn.addEventListener('click', () => {
                const status = `${trackingInfo.status || 'Unknown'} - ${trackingInfo.trackingNumber}`;
                Utils.copyToClipboard(status);
                Utils.showTooltip(copyStatusBtn, 'Copied!');
            });
        }
    };

    // Create floating action button to show tracker
    const createFAB = () => {
        const fab = document.createElement('div');
        fab.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: #351c15;
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            z-index: 9998;
            font-size: 24px;
            transition: transform 0.3s ease;
        `;
        fab.innerHTML = '📦';
        fab.title = 'Track UPS Package';
        fab.id = 'ups-tracker-fab';

        document.body.appendChild(fab);

        let tracker = null;

        fab.addEventListener('click', () => {
            if (!tracker) {
                tracker = createTrackerUI();
            } else {
                tracker.style.display = tracker.style.display === 'none' ? 'flex' : 'none';
            }
        });

        fab.addEventListener('mouseover', () => {
            fab.style.transform = 'scale(1.1)';
        });

        fab.addEventListener('mouseout', () => {
            fab.style.transform = 'scale(1)';
        });
    };

    // Setup automatic tracking refresh
    const setupAutoRefresh = () => {
        setInterval(() => {
            const trackingNumber = document.querySelector('#ups-tracker-input input')?.value?.trim();
            const resultsDiv = document.getElementById('ups-tracker-results');

            // Only refresh if we're currently tracking something and results are visible
            if (trackingNumber && resultsDiv?.innerHTML.includes(trackingNumber) &&
                document.getElementById('ups-tracker-container')?.style.display !== 'none') {
                trackPackage(trackingNumber);
            }
        }, CONFIG.refreshInterval);
    };

    // Initialize
    createFAB();
    setupAutoRefresh();
})();