// ==UserScript==
// @name         AMaxOffer
// @version      3.0.2
// @description  AMaxOffer Offers and Account Management Tool for American Express Site
// @match        https://global.americanexpress.com/*
// @connect      uscardforum.com
// @updateURL    https://github.com/AleXbMaximum/AMaxOffer/raw/main/dist/AMaxOffer.user.js
// @downloadURL  https://github.com/AleXbMaximum/AMaxOffer/raw/main/dist/AMaxOffer.user.js
// @grant        GM.xmlHttpRequest
// @grant        GM.addElement
// @grant        GM.notification
// @grant        GM.openInTab
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.listValues
// @grant        GM.setValue
// @grant        GM_cookie
// @grant        unsafeWindow
// @resource materialIcons https://fonts.googleapis.com/icon?family=Material+Icons

// ==/UserScript==

// @license    CC BY-NC-ND 4.0

(function () {
    'use strict';

    const scriptVersion = "3.0";

    // =========================================================================
    // Section 1: Global Styles
    // =========================================================================
    const addGlobalStyle = () => {
        const style = document.createElement('style');
        style.id = 'amaxoffer-global-styles';
        style.textContent = `
        @font-face {
            font-family: 'AmexFont';
            src: url("https://www.aexp-static.com/cdaas/one/statics/@americanexpress/static-assets/2.31.2/package/dist/iconfont/dls-icons.woff?v=2.31.2") format('woff');
            font-weight: normal;
            font-style: normal;
        }
        
        :root {
            /* Color Variables */
            --ios-blue: #007AFF;
            --ios-dark-blue: #0062CC;
            --ios-background: rgba(255, 255, 255, 0.8);
            --ios-secondary-bg: rgba(249, 249, 251, 0.6);
            --ios-border: rgba(230, 230, 230, 0.7);
            --ios-text-primary: #1c1c1e;
            --ios-text-secondary: #2c2c2e;
            --ios-radius: 18px;
            --ios-shadow: 0 12px 32px rgba(0, 0, 0, 0.42);
            --ios-font: 'AmexFont', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            --ios-header-bg: linear-gradient(to right, rgba(245, 245, 247, 0.9), rgba(235, 235, 242, 0.85));
            
            --ios-green: rgb(32, 169, 69);
            --ios-orange: rgb(215, 129, 0);
            --ios-red: rgb(215, 49, 38);
            --ios-gray: rgb(142, 142, 147);
            --ios-light-gray: rgba(142, 142, 147, 0.1);
            --ios-title-gradient: linear-gradient(45deg, #4CAF50, #2196F3);
            --ios-button-gradient: linear-gradient(45deg, rgb(84,99,86), rgb(27,66,29));
        }
        
        /* Main Container */
        .amaxoffer-container {
            position: fixed;
            top: 5%;
            left: 5%;
            background: url("https://www.aexp-static.com/cdaas/one/statics/@americanexpress/static-assets/2.28.0/package/dist/img/brand/worldservice-tile-gray.svg") repeat, #fefefe;
            border-radius: 12px;
            z-index: 10000;
            font-family: var(--ios-font);
            box-shadow: var(--ios-shadow);
            max-height: 90vh;
            overflow: hidden;
            width: 90%;
            max-width: 1400px;
            border: 1px solid rgba(0,0,0,0.15);
            transition: all 0.3s ease;
        }
        
        .amaxoffer-minimized {
            width: 200px !important;
            height: 75px !important;
            transform: scale(0.98);
            box-shadow: 0 12px 18px rgba(0,0,0,0.20);
        }
        
        .amaxoffer-expanded {
            width: 90% !important;
            height: auto !important;
            transform: none;
            box-shadow: var(--ios-shadow);
        }
        
        /* Header Styles */
        .amaxoffer-header {
            background-color: #f8f9fa;
            border-bottom: 1px solid rgba(0,0,0,0.08);
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: grab;
            user-select: none;
        }
        
        .amaxoffer-title {
            font-size: 1.4rem;
            font-weight: 600;
            background: var(--ios-title-gradient);
            -webkit-background-clip: text;
            color: transparent;
            letter-spacing: -0.5px;
        }
        
        .amaxoffer-nav {
            display: flex;
            gap: 12px;
            background: #f8f9fa;
            border-radius: 8px;
            padding: 4px;
        }
        
        .amaxoffer-nav-button {
            cursor: pointer;
            font-size: 18px;
            padding: 8px 20px;
            border: none;
            background: transparent;
            border-radius: 8px;
            transition: all 0.2s ease;
            color: #2c3e50;
            font-weight: 500;
        }
        
        .amaxoffer-nav-button:hover {
            transform: scale(1.05);
            background-color: #f0f0f0;
        }
        
        .amaxoffer-nav-button.active {
            background-color: #4CAF50;
            color: black;
            font-weight: 800;
        }
        
        .amaxoffer-toggle-btn {
            font-size: 1.2rem;
            border: 1px dashed #ccc;
            border-radius: 6px;
            width: 50px;
            height: 50px;
            display: inline-flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            background: transparent;
            transition: all 0.2s ease;
        }
        
        .amaxoffer-toggle-btn:hover {
            background-color: #f0f0f0;
        }
        
        /* Content Area */
        .amaxoffer-content {
            padding: 20px;
            overflow-y: auto;
            max-height: calc(80vh - 64px);
        }
        
        /* Table Styles */
        .ios-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 15px;
            font-family: var(--ios-font);
            margin: 16px 0;
            border-radius: var(--ios-radius);
            overflow: hidden;
            background-color: var(--ios-background);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: var(--ios-shadow);
            border: 1px solid var(--ios-border);
        }
        
        /* Header styles */
        .ios-table-head {
            background: var(--ios-header-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 10;
            width: 100%;
        }
        
        .ios-table th {
            padding: 16px 14px;
            text-align: center;
            font-weight: 600;
            color: var(--ios-text-primary);
            border-bottom: 1px solid rgba(60, 60, 67, 0.12);
            letter-spacing: -0.01em;
            vertical-align: middle;
        }
        
        .ios-table th.sortable {
            cursor: pointer;
            position: relative;
            padding-right: 32px;
        }
        
        .ios-table th.sortable:hover {
            background-color: rgba(0, 0, 0, 0.02);
        }
        
        /* Sort button styles */
        .ios-sort-button {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            width: 22px;
            height: 22px;
            border-radius: 11px;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Row and cell styles */
        .ios-table tr {
            position: relative;
        }
        
        .ios-table tr:nth-child(even) {
            background-color: var(--ios-secondary-bg);
        }
        
        .ios-table tr:hover {
            background-color: rgba(242, 242, 247, 0.85);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
            z-index: 5;
        }
        
        .ios-table td {
            padding: 16px 14px;
            text-align: center;
            color: var(--ios-text-secondary);
            border-bottom: 1px solid rgba(60, 60, 67, 0.04);
            vertical-align: middle;
            display: table-cell;
            height: 100%;
        }
        
        .ios-table tr:last-child td {
            border-bottom: none;
        }
        
        /* Currency formatting */
        .ios-currency {
            font-variant-numeric: tabular-nums;
            font-weight: normal;
            letter-spacing: -0.01em;
            text-align: center;
            display: block;
        }
        
        /* Status pills */
        .ios-status {
            padding: 5px 10px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
            display: inline-block;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            margin: 0 auto;
        }
        
        .ios-status.active, .ios-status.success {
            background-color: rgba(52, 199, 89, 0.15);
            color: var(--ios-green);
            border: 1px solid rgba(52, 199, 89, 0.25);
        }
        
        .ios-status.pending {
            background-color: rgba(255, 149, 0, 0.15);
            color: var(--ios-orange);
            border: 1px solid rgba(255, 149, 0, 0.25);
        }
        
        .ios-status.inactive, .ios-status.failed, .ios-status.canceled {
            background-color: rgba(255, 59, 48, 0.15);
            color: var(--ios-red);
            border: 1px solid rgba(255, 59, 48, 0.25);
        }
        
        /* Highlight for search results */
        .ios-highlight-row {
            background-color: rgba(255, 204, 0, 0.2) !important;
            border-left: 4px solid rgba(255, 204, 0, 0.8) !important;
        }
        .ios-highlight-row:hover {
            background-color: rgba(255, 204, 0, 0.25) !important;
        }
        /* Empty state */
        .ios-empty-state {
            padding: 60px 20px;
            text-align: center;
        }
        
        .ios-empty-state-container {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }
        
        .ios-empty-state-icon {
            width: 64px;
            height: 64px;
            border-radius: 32px;
            background-color: var(--ios-light-gray);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 16px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .ios-empty-state-title {
            color: #3a3a3c;
            font-size: 17px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .ios-empty-state-message {
            color: var(--ios-gray);
            opacity: 0.9;
            font-size: 15px;
            max-width: 260px;
            line-height: 1.4;
        }
        
        .ios-empty-button {
            margin-top: 20px;
            background-color: var(--ios-blue);
            color: white;
            border: none;
            border-radius: 18px;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 122, 255, 0.3);
        }
        
        /* iOS Search Component */
        .ios-search-container {
            position: relative;
            box-sizing: border-box;
            width: 200px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
            border-radius: 10px;
        }
        
        .ios-search-input {
            width: 100%;
            padding: 10px 32px 10px 12px;
            border-radius: 10px;
            border: 1px solid #e0e0e0;
            background-color: rgba(250, 250, 250, 0.8);
            font-size: 14px;
            font-family: var(--ios-font);
        }
        
        .ios-search-input:focus {
            outline: none;
            border-color: var(--ios-blue);
            box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.08);
        }
        
        .ios-search-icon {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            opacity: 0.6;
            color: var(--ios-blue);
            pointer-events: none;
        }
        
        .ios-search-input:focus + .ios-search-icon {
            opacity: 0.8;
        }
        
        /* Filter Card */
        .filter-card {
            background: #ffffff;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            width: 100%;
            box-sizing: border-box;
        }
        
        .filter-group {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .filter-label {
            font-weight: 600;
            font-size: 0.9rem;
        }
        
        .filter-select {
            padding: 8px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
            font-size: 0.9rem;
            cursor: pointer;
        }
        
        /* iOS Action Buttons */
        .ios-button {
            padding: 10px 24px;
            height: 42px;
            max-height: 42px;
            border: none;
            border-radius: 12px;
            background: var(--ios-blue);
            color: white;
            font-weight: 600;
            font-size: 16px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
            overflow: hidden;
        }
        
        .ios-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
            opacity: 0.95;
        }
        
        .ios-button:active {
            transform: scale(0.98);
        }
        
        .ios-button.green {
            background: var(--ios-green);
        }
        
        /* Summary Page Styles */
        .summary-container {
            padding: 24px;
            background: rgba(250, 250, 250, 0.95);
            border-radius: 20px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06);
            font-family: var(--ios-font);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border: 1px solid rgba(209, 213, 219, 0.3);
            max-width: 1000px;
            margin: 0 auto;
        }
        
        .summary-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 28px;
            padding-bottom: 20px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }
        
        .summary-title {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            color: #1c1c1e;
            letter-spacing: -0.5px;
        }
        
        .update-badge {
            background: rgba(0, 122, 255, 0.1);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            color: #007AFF;
            font-weight: 500;
            min-width: 250px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(0, 122, 255, 0.2);
        }
        
        .refresh-status {
            font-size: 14px;
            color: #8e8e93;
            font-weight: 500;
            margin-right: 16px;
            min-width: 150px;
            max-height: 42px;
            line-height: 42px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            text-align: right;
        }
        
        .stats-container {
            display: flex;
            flex-direction: column;
            gap: 24px;
            margin-bottom: 32px;
        }
        
        .stats-row {
            display: grid;
            gap: 16px;
            grid-template-columns: 1fr 1fr 1fr 1fr;
            margin-bottom: 20px;
        }
        
        @media (max-width: 1200px) {
            .stats-row {
                grid-template-columns: 1fr 1fr;
            }
        }
        
        @media (max-width: 600px) {
            .stats-row {
                grid-template-columns: 1fr;
            }
        }
        
        .stat-item {
            background: rgba(255, 255, 255, 0.8);
            padding: 20px;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
            text-align: center;
            flex: 1;
            min-width: 160px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border: 1px solid rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .stat-item:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
        }
        
        .stat-container {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        
        .icon-container {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .stat-value {
            font-size: 28px;
            font-weight: 700;
        }
        
        .stat-label {
            font-size: 14px;
            color: #8e8e93;
            font-weight: 500;
        }
        
        /* Button container */
        .button-container {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            margin-top: 16px;
            flex-wrap: wrap;
            gap: 10px;
            max-height: 60px;
            overflow: visible;
        }
        
        .action-buttons {
            display: flex;
            gap: 16px;
            flex-wrap: wrap;
            align-items: center;
            max-height: 50px;
            height: 50px;
        }
        
        /* Offer Modal Styles */
        .offer-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.4);
            backdrop-filter: blur(4px);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .offer-popup {
            background: #fff;
            border-radius: 12px;
            padding: 24px;
            width: 90%;
            max-width: 440px;
            max-height: 90vh;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            position: relative;
        }
        
        .offer-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 16px;
            border-bottom: 1px solid #eee;
        }
        
        .offer-title {
            margin: 0;
            font-size: 1.2rem;
            font-weight: 600;
            background: linear-gradient(45deg, #2c3e50, #4CAF50);
            -webkit-background-clip: text;
            color: transparent;
        }
        
        .close-button {
            background: none;
            border: none;
            font-size: 1.5rem;
            color: #666;
            cursor: pointer;
            padding: 4px;
            transition: all 0.2s ease;
        }
        
        .close-button:hover {
            color: #ff4444;
        }
        
        .enroll-all-button {
            width: 100%;
            margin: 0 0 20px 0;
            background: var(--ios-button-gradient);
            color: white;
            border-radius: 8px;
            font-weight: 500;
            border: none;
            padding: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
        }
        
        .card-section {
            margin-bottom: 24px;
        }
        
        .section-title {
            margin: 0 0 12px 0;
            font-size: 0.95rem;
        }
        
        .section-title.enrolled {
            color: #4CAF50;
        }
        
        .section-title.eligible {
            color: #2196F3;
        }
        
        .card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
            gap: 8px;
        }
        
        .card-item {
            padding: 8px;
            border-radius: 6px;
            text-align: center;
            font-size: 0.85rem;
            transition: all 0.2s ease;
        }
        
        .card-item.enrolled {
            background-color: #e8f5e9;
        }
        
        .card-item.eligible {
            background-color: #e3f2fd;
            cursor: pointer;
        }
        
        .card-item.eligible:hover {
            transform: translateY(-2px);
        }
        
        /* Benefits Section Styles */
        .benefits-container {
            padding: 20px 16px;
            font-family: 'Segoe UI', system-ui, sans-serif;
            background-color: rgba(255, 255, 255, 0.04);
            border-radius: 12px;
            max-width: 800px;
            margin: 0 auto;
            color: #333;
        }
        
        .status-legend {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
            justify-content: center;
            flex-wrap: wrap;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .legend-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .legend-label {
            color: #757575;
            font-size: 14px;
        }
        
        .accordion-item {
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            margin-bottom: 15px;
            background-color: #ffffff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        
        .accordion-item:hover {
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        
        .accordion-header {
            padding: 16px;
            cursor: pointer;
            transition: background-color 0.2s ease;
            background-color: #f9f9f9;
        }
        
        .accordion-header:hover {
            background-color: #f0f0f0;
        }
        
        .title-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .accordion-title {
            font-size: 17px;
            font-weight: 500;
            color: #3a4e63;
        }
        
        .mini-bar {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 12px;
        }
        
        .mini-card {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 8px;
            font-size: 14px;
            color: #444;
        }
        
        .status-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
        }
        
        .card-ending {
            font-weight: 500;
        }
        
        .accordion-body {
            padding: 0 16px;
            overflow: hidden;
            max-height: 0;
            transition: max-height 0.4s ease-in-out, padding 0.4s ease-in-out;
        }
        
        .tracker-card {
            border: 1px solid #ddd;
            border-radius: 10px;
            padding: 16px;
            margin: 12px 0;
            background-color: #fff;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
            transition: background-color 0.3s ease;
        }
        
        .card-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
        }
        
        .card-number {
            font-weight: 500;
            color: #666;
        }
        
        .date-range {
            color: #888;
            font-size: 14px;
        }
        
        .progress-container {
            margin-bottom: 12px;
        }
        
        .progress-text {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .progress-label {
            color: #777;
        }
        
        .progress-amount {
            color: #000;
        }
        
        .progress-bar-wrapper {
            height: 12px;
            border-radius: 8px;
            background-color: #f0f0f0;
            position: relative;
            overflow: hidden;
            border: 1px solid #ddd;
            width: 100%;
            box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .progress-fill {
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            transition: width 0.3s ease;
        }
        
        .progress-fill.achieved {
            background-color: #8fbc8f;
        }
        
        .progress-fill.in-progress {
            background-color: #87cefa;
        }
        
        .message-div {
            margin-top: 12px;
            padding: 12px;
            background: #f9f9f9;
            border-radius: 8px;
            color: #222;
            font-size: 14px;
        }
        
        /* Media queries for responsive design */
        @media (max-width: 768px) {
            .amaxoffer-container {
                width: 95%;
                left: 2.5%;
            }
            
            .summary-header,
            .button-container {
                flex-direction: column;
                align-items: stretch;
            }
            
            .update-badge {
                margin-top: 10px;
            }
        }
        `;
        document.head.appendChild(style);
    };

    // Call this function to add the global styles at the beginning
    addGlobalStyle();

    const UI_STYLES = {
        // Layout containers
        containers: {
            card: 'background:var(--ios-background); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-radius:14px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); border:1px solid var(--ios-border);',
            page: 'display:flex; flex-direction:column; gap:20px; padding:20px; max-width:100%; margin:0 auto; font-family:var(--ios-font); transition:all 0.3s ease;',
            modal: 'background-color:#fff; border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.15); overflow:hidden; transition:all 0.3s cubic-bezier(0.16, 1, 0.3, 1);',
            flexRow: 'display:flex; align-items:center; gap:12px;',
            flexColumn: 'display:flex; flex-direction:column; gap:12px;',
            gridContainer: 'display:grid; gap:16px;',
        },

        // Text styles
        text: {
            title: 'font-size:20px; font-weight:600; color:#1c1c1e; margin:0 0 16px 0;',
            subtitle: 'font-size:16px; font-weight:600; color:#3a3a3c; margin:0 0 12px 0;',
            body: 'font-size:14px; color:#4a4a4a; line-height:1.5;',
            label: 'font-size:13px; color:var(--ios-gray); font-weight:500;',
            value: 'font-size:15px; font-weight:600; color:#1c1c1e;',
            currency: 'font-variant-numeric:tabular-nums; font-weight:600; text-align:center;',
        },

        // Form controls
        controls: {
            input: 'width:100%; padding:10px 12px; border-radius:8px; border:1px solid #ddd; font-size:14px; outline:none; transition:all 0.2s ease;',
            select: 'padding:10px 12px; border-radius:8px; border:1px solid #ddd; font-size:14px; outline:none; background-color:white; cursor:pointer;',
            search: 'position:relative; width:100%; padding:10px 32px 10px 12px; border-radius:10px; border:1px solid #e0e0e0; background-color:rgba(250, 250, 250, 0.8); font-size:14px; font-family:var(--ios-font);',
        },

        // Buttons
        buttons: {
            primary: 'background-color:var(--ios-blue); color:white; border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
            secondary: 'background-color:rgba(142, 142, 147, 0.1); color:var(--ios-text-secondary); border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
            danger: 'background-color:var(--ios-red); color:white; border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
            success: 'background-color:var(--ios-green); color:white; border:none; border-radius:10px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;',
        },

        // Status indicators
        status: {
            active: 'background-color:rgba(52, 199, 89, 0.15); color:var(--ios-green); border:1px solid rgba(52, 199, 89, 0.25);',
            pending: 'background-color:rgba(255, 149, 0, 0.15); color:var(--ios-orange); border:1px solid rgba(255, 149, 0, 0.25);',
            inactive: 'background-color:rgba(255, 59, 48, 0.15); color:var(--ios-red); border:1px solid rgba(255, 59, 48, 0.25);',
        },

        // Badges
        badges: {
            primary: 'padding:4px 10px; border-radius:12px; font-size:13px; font-weight:500; white-space:nowrap; display:inline-flex; align-items:center; gap:4px;',
            small: 'padding:3px 6px; font-size:11px; border-radius:8px; font-weight:500;',
            medium: 'padding:4px 8px; font-size:12px; border-radius:10px; font-weight:500;',
            large: 'padding:5px 10px; font-size:13px; border-radius:12px; font-weight:500;',
        },

        // Animations
        animations: {
            fadeIn: 'animation: fadeIn 0.3s ease forwards;',
            slideIn: 'animation: slideIn 0.3s ease forwards;',
            bounce: 'animation: bounce 0.3s ease;',
        },

        // Common utility styles
        utils: {
            shadow: 'box-shadow:0 4px 12px rgba(0,0,0,0.08);',
            shadowHover: 'box-shadow:0 8px 24px rgba(0,0,0,0.12);',
            roundedCorners: 'border-radius:12px;',
            border: 'border:1px solid rgba(0,0,0,0.08);',
            transition: 'transition:all 0.2s ease;',
            truncate: 'white-space:nowrap; overflow:hidden; text-overflow:ellipsis;',
        },

        // Page layout shortcuts
        pageContainer: 'display:flex; flex-direction:column; gap:20px; padding:20px; max-width:100%; margin:0 auto; font-family:var(--ios-font); transition:all 0.3s ease;',
        cardContainer: 'background:var(--ios-background); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-radius:14px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); border:1px solid var(--ios-border);',
    };

    // =========================================================================
    // Section 1: Utility Functions & Obfuscated URL Constants
    // =========================================================================

    const API_member = "https://global.americanexpress.com/api/servicing/v1/member";
    const API_Enroll = "https://functions.americanexpress.com/CreateCardAccountOfferEnrollment.v1";
    const API_offer = "https://functions.americanexpress.com/ReadCardAccountOffersList.v1";
    const API_USCF1 = "https://www.uscardforum.com/session/current.json";
    const API_USCF2 = "https://www.uscardforum.com/u/";
    const API_balance = "https://global.americanexpress.com/api/servicing/v1/financials/balances?extended_details=deferred,non_deferred,pay_in_full,pay_over_time,early_pay";
    const API_balancePending = "https://global.americanexpress.com/api/servicing/v1/financials/transaction_summary?status=pending";
    const API_benefit = "https://functions.americanexpress.com/ReadBestLoyaltyBenefitsTrackers.v1";

    // =========================================================================
    // Section 2: Global State Variables
    // =========================================================================

    //  1) PRIMARY DATA & TRACKERS
    let glb_account = [];
    let glb_offer = [];
    let glb_offer_expired = [];
    let glb_offer_redeemed = [];
    let glb_benefit = [];
    let glb_balance = {};
    let glb_priorityCards = [];
    let glb_excludedCards = [];

    //  2) VIEW / UI STATES
    let glb_view_page = "members";  // Possible: "summary", "members", "offers", "benefits"
    let glb_view_mini = true;       // Whether the main container is collapsed
    const glb_view_scroll = {
        members: { scrollTop: 0 },
        offers: { scrollTop: 0 },
        benefits: { scrollTop: 0 },
    };
    let glb_memberSortState = { key: "", direction: 1 };
    let glb_offerSortState = { key: "", direction: 1 };

    //  3) FILTER STATES
    const glb_filters = {
        memberStatus: "Active", // "all", "Active", "Canceled"
        memberCardtype: "all",  // "all", "BASIC", "SUPP"
        offerFav: false,        // Hide non-favorite offers
        offerMerchantSearch: "",
        memberMerchantSearch: "",
        offerCardEnding: "",
    };

    //  5) MISCELLANEOUS 
    let lastUpdate = "";        // Last time data was fetched
    let runInBatchesLimit = 100; // Concurrency limit when enrolling in batches
    let storage_accToken = "";       // Suffix for the token to avoid conflicts
    let btnRefresh, refreshStatusEl;

    let content, viewBtns, toggleBtn, container, btnMembers, btnOffers, btnBenefits;

    // =========================================================================
    // Section 3: UI Elements Creation
    // =========================================================================

    // Utility to create an element with optional properties.
    function ui_createElement(tag, { text = '', className = '', styles = {}, styleString = '', props = {}, children = [], events = {} } = {}) {
        const el = document.createElement(tag);
        if (text) el.textContent = text;
        if (className) el.className = className;

        // Apply either style object or style string
        if (styleString) {
            el.style.cssText = styleString;
        } else {
            Object.assign(el.style, styles);
        }

        // Apply properties
        Object.entries(props).forEach(([key, value]) => (el[key] = value));

        // Add children
        children.forEach(child => {
            if (child) el.appendChild(child);
        });

        // Add event listeners
        Object.entries(events).forEach(([event, handler]) => {
            el.addEventListener(event, handler);
        });

        return el;
    }

    // Helper to create a button with default styling and hover effects.
    const ui_createBtn_v1 = (label, onClick, { className = '', styles = {} } = {}) => {
        const btn = ui_createElement('button', {
            text: label,
            className: className || 'amaxoffer-nav-button',
            styles
        });
        btn.addEventListener('click', onClick);
        return btn;
    };

    function ui_createBtn_v2(config = {}) {
        const {
            label = '',
            icon = null,
            onClick = () => { },
            type = 'primary',
            size = 'medium',
            fullWidth = false,
            maxWidth = null,
            customStyle = '',
            disabled = false
        } = config;

        // Size styles
        const sizeStyles = {
            small: 'padding:6px 12px; font-size:13px;',
            medium: 'padding:10px 16px; font-size:14px;',
            large: 'padding:12px 24px; font-size:16px;'
        };

        // Combine styles
        const styleString = `
            ${UI_STYLES.buttons[type] || UI_STYLES.buttons.primary}
            ${sizeStyles[size] || sizeStyles.medium}
            ${fullWidth ? 'width:100%;' : ''}
            ${maxWidth ? `max-width:${maxWidth};` : ''}
            ${customStyle}
        `;

        const content = icon ? `${icon} ${label}` : label;

        const btn = ui_createElement('button', {
            props: {
                innerHTML: content,
                disabled
            },
            styleString,
            events: {
                click: onClick,
                mouseenter: (e) => {
                    if (disabled) return;
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = UI_STYLES.utils.shadowHover;
                },
                mouseleave: (e) => {
                    if (disabled) return;
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = UI_STYLES.utils.shadow;
                }
            }
        });

        return btn;
    }

    // Optimized empty state creator
    function ui_createEmptyState(container, options = {}) {
        const {
            title = 'No Items Found',
            message = 'Try adjusting your search or filters',
            buttonText = 'Reset Filters',
            iconSvg = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>',
            callback = handleoffers_resetAllFilters
        } = options;

        container.style.cssText = 'display:flex; flex-direction:column; align-items:center; justify-content:center; padding:80px 20px; text-align:center; background-color:rgba(0,0,0,0.02); border-radius:16px; margin:20px 0;';

        // Illustration
        const illustration = document.createElement('div');
        illustration.style.cssText = 'margin-bottom:24px; width:100px; height:100px; display:flex; align-items:center; justify-content:center;';
        illustration.innerHTML = `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5">${iconSvg}</svg>`;

        // Message elements
        const titleElement = document.createElement('div');
        titleElement.style.cssText = 'font-size:18px; font-weight:600; margin-bottom:12px; color:#1c1c1e;';
        titleElement.textContent = title;

        const subtitleElement = document.createElement('div');
        subtitleElement.style.cssText = 'font-size:14px; color:var(--ios-gray); max-width:400px; margin:0 auto 24px;';
        subtitleElement.textContent = message;

        // Reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = buttonText;
        resetButton.style.cssText = 'padding:10px 20px; background-color:var(--ios-blue); color:white; border:none; border-radius:10px; font-size:14px; font-weight:500; cursor:pointer; box-shadow:0 2px 8px rgba(0, 122, 255, 0.3); transition:all 0.2s ease;';

        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.transform = 'translateY(-2px)';
            resetButton.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.4)';
        });

        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.transform = 'translateY(0)';
            resetButton.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';
        });

        resetButton.addEventListener('click', callback);

        // Assemble empty state
        container.appendChild(illustration);
        container.appendChild(titleElement);
        container.appendChild(subtitleElement);
        container.appendChild(resetButton);

        return container;
    }

    function ui_createFilterBar(options = {}) {
        const {
            searchPlaceholder = 'Search...',
            resetCallback = () => { },
            onSearch = () => { },
            additionalControls = []
        } = options;

        const filtersCard = ui_createElement('div', {
            styleString: `
                    ${UI_STYLES.containers.card}
                    display:flex; flex-wrap:wrap; gap:16px; 
                    margin-bottom:8px; align-items:center; 
                    justify-content:flex-end;
                `
        });

        // Create search container
        const searchContainer = ui_createElement('div', {
            styleString: 'display:flex; gap:12px; align-items:center; flex-wrap:nowrap; margin-left:auto;'
        });

        // Search input container
        const searchInputContainer = ui_createElement('div', {
            styleString: 'position:relative; width:250px; max-width:300px; margin-right:4px; box-shadow:0 1px 3px rgba(0, 0, 0, 0.03); border-radius:10px;'
        });

        // Search icon
        const searchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        searchIcon.setAttribute('width', '16');
        searchIcon.setAttribute('height', '16');
        searchIcon.setAttribute('viewBox', '0 0 24 24');
        searchIcon.style.cssText = 'color:var(--ios-blue); opacity:0.6; position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none;';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z');
        path.setAttribute('fill', 'currentColor');
        searchIcon.appendChild(path);

        // Create search input
        const input = ui_createElement('input', {
            props: {
                type: 'text',
                placeholder: searchPlaceholder,
                className: 'ios-search-input',
            },
            styleString: UI_STYLES.controls.search,
            events: {
                input: util_debounce(() => {
                    onSearch(input.value);
                }, 300)
            }
        });

        searchInputContainer.appendChild(input);
        searchInputContainer.appendChild(searchIcon);
        searchContainer.appendChild(searchInputContainer);

        // Add additional controls
        additionalControls.forEach(control => {
            searchContainer.appendChild(control);
        });

        // Add reset button
        const resetButton = ui_createBtn_v2({
            label: 'Reset Filters',
            type: 'secondary',
            onClick: resetCallback
        });

        searchContainer.appendChild(resetButton);
        filtersCard.appendChild(searchContainer);

        return filtersCard;
    }

    // Helper function to create stylized badge elements
    function ui_createBadge(config = {}) {
        const {
            label = '',
            value = '',
            color = '#333',
            size = 'medium',
            customStyle = ''
        } = config;

        // Return null if no value provided
        if (!value || value === 'N/A') return null;

        // Set background based on color
        const styleString = `
            ${UI_STYLES.badges[size] || UI_STYLES.badges.medium}
            background-color: ${color}15;
            color: ${color};
            border: 1px solid ${color}30;
            ${UI_STYLES.utils.transition}
            ${customStyle}
        `;

        const badge = ui_createElement('div', {
            styleString,
            events: {
                mouseenter: (e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = `0 2px 5px ${color}20`;
                },
                mouseleave: (e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                }
            }
        });

        // Create label part if provided
        if (label) {
            const labelSpan = ui_createElement('span', {
                text: `${label}:`,
                styleString: 'opacity: 0.8; font-weight: 400;'
            });
            badge.appendChild(labelSpan);
        }

        // Create value part
        const valueSpan = ui_createElement('span', {
            text: value
        });
        badge.appendChild(valueSpan);

        return badge;
    }

    function ui_createCard(config = {}) {
        const {
            title = '',
            content = [],
            footer = null,
            customStyle = '',
            hover = true
        } = config;

        const card = ui_createElement('div', {
            styleString: `
                ${UI_STYLES.containers.card}
                ${customStyle}
            `,
            events: hover ? {
                mouseenter: (e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = UI_STYLES.utils.shadowHover;
                },
                mouseleave: (e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = UI_STYLES.utils.shadow;
                }
            } : {}
        });

        // Add title if provided
        if (title) {
            const titleEl = ui_createElement('h3', {
                text: title,
                styleString: UI_STYLES.text.title
            });
            card.appendChild(titleEl);
        }

        // Add content
        content.forEach(item => {
            if (item) card.appendChild(item);
        });

        // Add footer if provided
        if (footer) {
            const footerEl = ui_createElement('div', {
                styleString: 'margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.08);',
                children: Array.isArray(footer) ? footer : [footer]
            });
            card.appendChild(footerEl);
        }

        return card;
    }

    function ui_createToggleSwitch(options = {}) {
        const {
            isChecked = false,
            onChange = () => { },
            color = 'var(--ios-blue)',
            size = 'medium',
            label = '',
            labelPosition = 'right'
        } = options;

        // Determine toggle size
        const sizes = {
            small: { width: '30px', height: '18px', knobSize: '14px' },
            medium: { width: '36px', height: '22px', knobSize: '18px' },
            large: { width: '44px', height: '26px', knobSize: '22px' }
        };

        const { width, height, knobSize } = sizes[size] || sizes.medium;

        const toggleContainer = ui_createElement('div', {
            styleString: 'display:flex; align-items:center; gap:8px;'
        });

        // Create the toggle
        const toggle = ui_createElement('div', {
            styleString: `
                display:inline-block;
                position:relative;
                width:${width};
                height:${height};
                border-radius:${parseInt(height) / 2}px;
                cursor:pointer;
                transition:background-color 0.3s ease;
                box-shadow:0 1px 3px rgba(0,0,0,0.1) inset;
                background-color:${isChecked ? color : '#e9e9ea'};
            `,
            events: {
                click: () => {
                    const newState = !isChecked;
                    toggle.style.backgroundColor = newState ? color : '#e9e9ea';
                    knob.style.left = newState ? `calc(100% - ${parseInt(knobSize) + 2}px)` : '2px';

                    // Add animation effect
                    knob.animate([
                        { transform: 'scale(0.9)' },
                        { transform: 'scale(1.1)' },
                        { transform: 'scale(1)' }
                    ], { duration: 300, easing: 'ease-out' });

                    onChange(newState);
                },
                mouseenter: () => knob.style.transform = 'scale(1.05)',
                mouseleave: () => knob.style.transform = 'scale(1)',
                mousedown: () => knob.style.transform = 'scale(0.95)',
                mouseup: () => knob.style.transform = 'scale(1.05)'
            }
        });

        // Create the knob
        const knob = ui_createElement('div', {
            styleString: `
                position:absolute;
                width:${knobSize};
                height:${knobSize};
                border-radius:50%;
                background-color:#ffffff;
                box-shadow:0 1px 3px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1);
                top:2px;
                left:${isChecked ? `calc(100% - ${parseInt(knobSize) + 2}px)` : '2px'};
                transition:left 0.3s ease, transform 0.1s ease;
            `
        });

        toggle.appendChild(knob);

        // Add label if provided
        if (label) {
            const labelEl = ui_createElement('span', {
                text: label,
                styleString: UI_STYLES.text.label
            });

            if (labelPosition === 'left') {
                toggleContainer.appendChild(labelEl);
                toggleContainer.appendChild(toggle);
            } else {
                toggleContainer.appendChild(toggle);
                toggleContainer.appendChild(labelEl);
            }
        } else {
            toggleContainer.appendChild(toggle);
        }

        return toggleContainer;
    }

    // Reusable action button creator
    function createResetBtn(text, icon, onClick, bgColor = 'var(--ios-blue)', textColor = 'white') {
        return ui_createBtn_v2({
            label: text,
            icon: icon,
            onClick: onClick,
            bgColor: bgColor,
            textColor: textColor,
            type: bgColor === 'rgba(142, 142, 147, 0.1)' ? 'secondary' : 'primary'
        });
    }

    // Core table renderer with iOS styling and smaller text
    function ui_renderDataTable(headers, colWidths, items, cellRenderer, sortHandler, sortableKeys) {
        // Create main table element with clean styling
        const tableElement = document.createElement('table');
        tableElement.className = 'ios-table';
        tableElement.style.fontSize = '13px';
        tableElement.style.borderCollapse = 'separate';
        tableElement.style.borderSpacing = '0';
        tableElement.style.width = '100%';
        tableElement.style.backgroundColor = '#ffffff';
        tableElement.style.overflow = 'hidden';
        tableElement.style.boxShadow = 'none';

        // Create and append header
        const thead = createTableHeader(headers, colWidths, sortHandler, sortableKeys);
        tableElement.appendChild(thead);

        // Create and append body
        const tbody = createTableBody(headers, colWidths, items, cellRenderer);
        tableElement.appendChild(tbody);

        return tableElement;

        // Helper function: Create table header
        function createTableHeader(headers, colWidths, sortHandler, sortableKeys) {
            const thead = document.createElement('thead');
            thead.className = 'ios-table-head';
            thead.style.position = 'sticky';
            thead.style.top = '0';
            thead.style.zIndex = '2';
            thead.style.background = '#f5f5f7';
            thead.style.borderBottom = '1px solid rgba(60, 60, 67, 0.2)';
            thead.style.backdropFilter = 'none';
            thead.style.webkitBackdropFilter = 'none';

            const headerRow = document.createElement('tr');

            headers.forEach(headerItem => {
                const th = createHeaderCell(headerItem, colWidths, sortHandler, sortableKeys);
                headerRow.appendChild(th);
            });

            thead.appendChild(headerRow);
            return thead;
        }

        // Helper function: Create header cell with sort functionality
        function createHeaderCell(headerItem, colWidths, sortHandler, sortableKeys) {
            const th = document.createElement('th');
            th.textContent = headerItem.label;

            // Base styling
            th.style.fontSize = '13px';
            th.style.padding = '12px 14px';
            th.style.fontWeight = '600';
            th.style.color = 'var(--ios-text-primary)';
            th.style.letterSpacing = '-0.01em';
            th.style.textAlign = 'center';
            th.style.borderBottom = '1px solid rgba(60, 60, 67, 0.12)';
            th.style.verticalAlign = 'middle';
            th.style.backgroundColor = '#f5f5f7';

            // Apply column width if specified
            if (colWidths[headerItem.key]) {
                th.style.width = colWidths[headerItem.key];
            }

            // Add sort functionality if sortable
            if (sortableKeys && sortableKeys.includes(headerItem.key) && sortHandler) {
                makeCellSortable(th, headerItem.key, sortHandler);
            }

            return th;
        }

        // Helper function: Add sort functionality to header cell
        function makeCellSortable(th, key, sortHandler) {
            th.className = 'sortable';
            th.setAttribute('data-sort-key', key);
            th.style.paddingRight = '22px';
            th.style.position = 'relative';
            th.style.cursor = 'pointer';
            th.style.transition = 'background-color 0.2s ease';

            // Hover effect
            th.addEventListener('mouseenter', () => {
                th.style.backgroundColor = 'rgba(245, 245, 247, 0.9)';
            });

            th.addEventListener('mouseleave', () => {
                th.style.backgroundColor = '#f5f5f7';
            });

            // Create sort button
            const sortButton = document.createElement('div');
            sortButton.className = 'ios-sort-button';
            sortButton.style.position = 'absolute';
            sortButton.style.right = '4px';
            sortButton.style.top = '50%';
            sortButton.style.transform = 'translateY(-50%)';
            sortButton.style.width = '18px';
            sortButton.style.height = '18px';
            sortButton.style.borderRadius = '9px';
            sortButton.style.display = 'flex';
            sortButton.style.alignItems = 'center';
            sortButton.style.justifyContent = 'center';

            // Sort icon
            const sortIcon = document.createElement('span');
            sortIcon.textContent = '•';
            sortIcon.style.color = 'var(--ios-blue)';
            sortIcon.style.fontSize = '12px';

            // Check current sort state
            if (window.glb_memberSortState?.key === key) {
                sortIcon.textContent = window.glb_memberSortState.direction === 1 ? '↑' : '↓';
            } else if (window.glb_offerSortState?.key === key) {
                sortIcon.textContent = window.glb_offerSortState.direction === 1 ? '↑' : '↓';
            }

            sortButton.appendChild(sortIcon);
            th.appendChild(sortButton);

            // Handle click to sort
            th.addEventListener('click', () => {
                sortHandler(key);

                // Reset all sort indicators
                th.closest('tr').querySelectorAll('th').forEach(header => {
                    const icon = header.querySelector('.ios-sort-button span');
                    if (icon) icon.textContent = '•';
                });

                // Update this column's indicator
                // We need to delay to ensure the sort state has been updated
                setTimeout(() => {
                    const direction = (window.glb_memberSortState?.key === key)
                        ? window.glb_memberSortState.direction
                        : window.glb_offerSortState?.direction;

                    sortIcon.textContent = direction === 1 ? '↑' : '↓';
                }, 0);
            });
        }

        // Helper function: Create table body with rows
        function createTableBody(headers, colWidths, items, cellRenderer) {
            const tbody = document.createElement('tbody');

            // Show empty state if no items
            if (!items || items.length === 0) {
                appendEmptyState(tbody, headers.length);
                return tbody;
            }

            // Create rows for each item
            items.forEach((item, idx) => {
                const row = createTableRow(item, headers, colWidths, cellRenderer);
                tbody.appendChild(row);
            });

            return tbody;
        }

        // Helper function: Create a single table row
        function createTableRow(item, headers, colWidths, cellRenderer) {
            const row = document.createElement('tr');
            row.style.transition = 'background-color 0.2s ease';

            // Check for highlighting more explicitly with debugging
            const shouldHighlight = shouldHighlightItem(item);

            if (shouldHighlight) {
                // Make the highlight more pronounced
                row.classList.add('ios-highlight-row');
                row.style.backgroundColor = 'rgba(255, 204, 0, 0.2) !important';
                row.style.borderLeft = '4px solid rgba(255, 204, 0, 0.8)';
            }

            // Alternate row styling - only apply if not highlighted
            if (!shouldHighlight && item._index % 2 === 1) {
                row.style.backgroundColor = 'var(--ios-secondary-bg)';
            }

            // Hover effect that preserves highlighting
            row.addEventListener('mouseenter', () => {
                if (!shouldHighlight) {
                    row.style.backgroundColor = 'rgba(242, 242, 247, 0.85)';
                }
            });

            row.addEventListener('mouseleave', () => {
                if (!shouldHighlight) {
                    if (item._index % 2 === 1) {
                        row.style.backgroundColor = 'var(--ios-secondary-bg)';
                    } else {
                        row.style.backgroundColor = '';
                    }
                } else {
                    row.style.backgroundColor = 'rgba(255, 204, 0, 0.2) !important';
                }
            });

            // Create cells for each header
            headers.forEach(headerItem => {
                const td = createTableCell(item, headerItem, colWidths, cellRenderer);
                row.appendChild(td);
            });

            return row;
        }
        // Helper function: Create table cell with content
        function createTableCell(item, headerItem, colWidths, cellRenderer) {
            const td = document.createElement('td');
            td.style.fontSize = '13px';
            td.style.padding = '10px 14px';
            td.style.textAlign = 'center';
            td.style.borderBottom = '1px solid rgba(60, 60, 67, 0.04)';
            td.style.verticalAlign = 'middle';

            // Apply column width if specified
            if (colWidths[headerItem.key]) {
                td.style.width = colWidths[headerItem.key];
                td.style.maxWidth = colWidths[headerItem.key];
                td.style.whiteSpace = 'normal';
                td.style.wordWrap = 'break-word';
            }

            // Use cellRenderer to get content
            const content = cellRenderer(item, headerItem);

            // Handle different types of content
            if (content instanceof Node) {
                handleNodeContent(td, content);
            } else if (typeof content === 'string') {
                handleStringContent(td, content);
            } else {
                td.textContent = content || '';
            }

            return td;
        }

        // Helper function: Handle Node content
        function handleNodeContent(td, content) {
            // Center images
            if (content.tagName === 'IMG') {
                content.style.display = 'block';
                content.style.margin = '0 auto';
            }
            // Center controls
            else if (content.tagName === 'BUTTON' || content.tagName === 'INPUT') {
                content.style.margin = '0 auto';
                content.style.display = 'block';
                content.style.fontSize = '12px'; // Smaller text
            }

            td.appendChild(content);
        }

        // Helper function: Handle string content
        function handleStringContent(td, content) {
            // Format currency
            if (/^\$?\d+(\.\d{2})?$/.test(content)) {
                const span = document.createElement('span');
                span.className = 'ios-currency';
                span.textContent = content;
                span.style.fontSize = '13px';
                td.appendChild(span);
            }
            // Handle status-like text
            else if (['active', 'inactive', 'pending', 'completed', 'failed', 'success', 'canceled'].includes(content.toLowerCase())) {
                const statusSpan = document.createElement('span');
                statusSpan.className = `ios-status ${content.toLowerCase()}`;
                statusSpan.textContent = content;
                statusSpan.style.fontSize = '12px';
                td.appendChild(statusSpan);
            }
            // Regular text content
            else {
                td.textContent = content || '';
            }
        }

        // Helper function: Append empty state message
        function appendEmptyState(tbody, colSpan) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = colSpan;
            emptyCell.className = 'ios-empty-state';

            const container = document.createElement('div');
            ui_createEmptyState(container, {
                callback: handleoffers_resetAllFilters
            });

            emptyCell.appendChild(container);
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        }

        // Helper function: Reset filters
        function handleoffers_resetAllFilters() {
            if (typeof window.glb_filters !== 'undefined') {
                // Reset all relevant filters
                if (window.glb_filters.memberMerchantSearch) {
                    window.glb_filters.memberMerchantSearch = '';
                }

                if (window.glb_filters.offerMerchantSearch) {
                    window.glb_filters.offerMerchantSearch = '';
                }

                if (window.glb_filters.offerCardEnding) {
                    window.glb_filters.offerCardEnding = '';
                }

                if (window.glb_filters.offerFav) {
                    window.glb_filters.offerFav = false;
                }

                if (window.glb_filters.memberStatus !== 'Active') {
                    window.glb_filters.memberStatus = 'Active';
                }

                if (window.glb_filters.memberCardtype !== 'all') {
                    window.glb_filters.memberCardtype = 'all';
                }

                // Refresh the view
                if (typeof window.ui_renderCurrentView === 'function') {
                    window.ui_renderCurrentView();
                }
            }
        }

        // Helper function: Determine whether to highlight item
        function shouldHighlightItem(item) {
            // For accounts tab - check for merchant search match
            if (item.cardEnding && glb_filters.memberMerchantSearch) {
                const searchTerm = glb_filters.memberMerchantSearch.trim().toLowerCase();

                // Don't proceed if search term is empty
                if (!searchTerm) return false;

                // First check direct card property matches
                const accountMatches =
                    item.cardEnding.toLowerCase().includes(searchTerm) ||
                    (item.embossed_name && item.embossed_name.toLowerCase().includes(searchTerm)) ||
                    (item.description && item.description.toLowerCase().includes(searchTerm));

                if (accountMatches) return true;

                // Check if any offers match this account and search term
                const matchingOffers = glb_offer.filter(offer => {
                    const nameMatch = offer.name.toLowerCase().includes(searchTerm);

                    // Important fix: Check account_token, not cardEnding
                    const isEligible = Array.isArray(offer.eligibleCards) &&
                        offer.eligibleCards.includes(item.account_token);
                    const isEnrolled = Array.isArray(offer.enrolledCards) &&
                        offer.enrolledCards.includes(item.account_token);

                    return nameMatch && (isEligible || isEnrolled);
                });

                return matchingOffers.length > 0;
            }

            return false;
        }
    }

    // Build the UI container with a custom font, header with title and navigation buttons, and a content area.
    function ui_createMain() {
        // Create the main container
        const container = ui_createElement('div', {
            props: { id: 'card-utility-overlay' },
            className: 'amaxoffer-container amaxoffer-minimized'
        });

        // Title element
        const title = ui_createElement('span', {
            text: 'AMaxOffer',
            className: 'amaxoffer-title'
        });

        // Navigation buttons for different views (without Summary)
        const btnMembers = ui_createBtn_v1('Members', () => ui_changeTab('members', btnMembers));
        const btnOffers = ui_createBtn_v1('Offers', () => ui_changeTab('offers', btnOffers));
        const btnBenefits = ui_createBtn_v1('Benefits', () => ui_changeTab('benefits', btnBenefits));

        // Navigation container with centered positioning
        const viewBtns = ui_createElement('div', {
            className: 'amaxoffer-nav',
            children: [btnMembers, btnOffers, btnBenefits],
            styleString: 'display:none; position:absolute; left:50%; transform:translateX(-50%); z-index:1;'
        });

        // Create refresh button
        const refreshIcon = `<svg style="width:16px;height:16px;fill:white;margin-right:4px" viewBox="0 0 24 24">
            <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4C7.58 4 4 7.58 4 12s3.58 8 8 8a7.94 7.94 0 0 0 6.65-3.65l-1.42-1.42A5.973 5.973 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>`;

        btnRefresh = ui_createBtn_v2({
            label: 'Refresh',
            icon: refreshIcon,
            type: 'primary',
            onClick: async () => {
                try {
                    refreshStatusEl.textContent = "Refreshing accounts...";
                    await api_fetchAccounts();

                    refreshStatusEl.textContent = "Refreshing offers...";
                    await api_refreshOffersList();

                    refreshStatusEl.textContent = "Refreshing balances...";
                    await api_fetchAllBalances();

                    refreshStatusEl.textContent = "Refreshing benefits...";
                    await api_fetchAllBenefits();

                    lastUpdate = new Date().toLocaleString();
                    storage_manageData("set", storage_accToken, ["lastUpdate", "scriptVersion"]);

                    refreshStatusEl.textContent = "Refresh complete.";
                    setTimeout(() => {
                        refreshStatusEl.textContent = "";
                    }, 3000);

                    await ui_renderCurrentView();
                } catch (e) {
                    console.error('Error refreshing data:', e);
                    refreshStatusEl.textContent = "Error refreshing data.";
                }
            },
            customStyle: 'display:none; align-items:center; justify-content:center;'
        });

        // Create status element for refresh operations
        refreshStatusEl = ui_createElement('div', {
            className: 'refresh-status',
            props: { id: 'refresh-status' },
            styleString: 'font-size:12px; color:#8e8e93; margin-right:8px; display:none;'
        });

        // Toggle button for minimizing/expanding
        const toggleBtn = ui_createBtn_v1('➕', ui_toggleMinimize, {
            className: 'amaxoffer-toggle-btn'
        });

        // Right-side controls
        const rightControls = ui_createElement('div', {
            styleString: 'display:flex; align-items:center; justify-content:flex-end; margin-left:auto;',
            children: [refreshStatusEl, btnRefresh, toggleBtn]
        });

        // Header with position relative for absolute positioning of navButtons
        const header = ui_createElement('div', {
            props: { id: 'card-utility-header' },
            className: 'amaxoffer-header',
            styleString: 'position:relative;',
            children: [title, viewBtns, rightControls]
        });

        // Main content area
        const content = ui_createElement('div', {
            props: { id: 'card-utility-content' },
            className: 'amaxoffer-content',
            text: 'Loading...',
            styleString: 'display:none;'
        });

        container.append(header, content);
        document.body.appendChild(container);

        // Make the header draggable
        ui_makeDraggable(header, container);

        return { container, content, viewBtns, toggleBtn, btnMembers, btnOffers, btnBenefits };
    }

    // Make an element draggable by tracking mouse movement.
    const ui_makeDraggable = (handle, container) => {
        let shiftX = 0,
            shiftY = 0;
        let latestX = 0,
            latestY = 0;
        let animationFrameId = null;

        const updatePosition = () => {
            container.style.left = `${latestX - shiftX}px`;
            container.style.top = `${latestY - shiftY}px`;
            animationFrameId = null;
        };

        const onMouseMove = e => {
            latestX = e.clientX;
            latestY = e.clientY;
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updatePosition);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        };

        handle.addEventListener('mousedown', e => {
            e.preventDefault(); // Prevent text selection and other default actions.
            const rect = container.getBoundingClientRect();
            shiftX = e.clientX - rect.left;
            shiftY = e.clientY - rect.top;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    };

    // Toggle the minimized/expanded state of the UI container.
    const ui_toggleMinimize = () => {
        glb_view_mini = !glb_view_mini;
        content.style.display = glb_view_mini ? 'none' : 'block';
        viewBtns.style.display = glb_view_mini ? 'none' : 'flex';
        btnRefresh.style.display = glb_view_mini ? 'none' : 'flex';
        refreshStatusEl.style.display = glb_view_mini ? 'none' : 'block';
        toggleBtn.textContent = glb_view_mini ? '➕' : '➖';

        if (glb_view_mini) {
            container.classList.add('amaxoffer-minimized');
            container.classList.remove('amaxoffer-expanded');
        } else {
            container.classList.remove('amaxoffer-minimized');
            container.classList.add('amaxoffer-expanded');
        }

        if (!glb_view_mini) {
            container.addEventListener('transitionend', function onTransitionEnd(e) {
                if (e.propertyName === 'height') {
                    ui_renderCurrentView();
                    container.removeEventListener('transitionend', onTransitionEnd);
                }
            });
        }
    };

    // Switch between views, update button styles, and trigger re-rendering.
    const ui_changeTab = (view, activeBtn) => {
        ui_saveScrollPos();
        glb_view_page = view;
        [btnMembers, btnOffers, btnBenefits].forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
        ui_renderCurrentView();
    };

    // Save the current scroll position for the active view.
    const ui_saveScrollPos = () => {
        if (content) {
            glb_view_scroll[glb_view_page].scrollTop = content.scrollTop;
        }
    };


    // =========================================================================
    // Section 4: General Helper Functions
    // =========================================================================

    const util_antiKickOff = (() => {
        // Instead of overriding prototype methods, create a wrapper for the element
        const managedElements = new Map();

        const manage = (element) => {
            if (managedElements.has(element)) return managedElements.get(element);

            const listeners = [];
            const originalAdd = element.addEventListener.bind(element);
            const originalRemove = element.removeEventListener.bind(element);

            const wrapper = {
                addListener: (type, listener, options) => {
                    listeners.push({ type, listener, options });
                    return originalAdd(type, listener, options);
                },
                removeListener: (type, listener, options) => {
                    const index = listeners.findIndex(l =>
                        l.type === type && l.listener === listener && l.options === options);
                    if (index !== -1) listeners.splice(index, 1);
                    return originalRemove(type, listener, options);
                },
                getListeners: (typeFilter) => typeFilter ?
                    listeners.filter(l => l.type === typeFilter) : [...listeners]
            };

            managedElements.set(element, wrapper);
            return wrapper;
        };
        // Private registry to track event listeners.
        const registry = new WeakMap();

        // Preserve original methods.
        const origAddEventListener = EventTarget.prototype.addEventListener;
        const origRemoveEventListener = EventTarget.prototype.removeEventListener;

        // Override addEventListener to store registrations.
        EventTarget.prototype.addEventListener = function (type, listener, options) {
            if (!registry.has(this)) {
                registry.set(this, []);
            }
            registry.get(this).push({ type, listener, options });
            return origAddEventListener.call(this, type, listener, options);
        };

        // Override removeEventListener to update our registry.
        EventTarget.prototype.removeEventListener = function (type, listener, options) {
            if (registry.has(this)) {
                const arr = registry.get(this);
                for (let i = 0; i < arr.length; i++) {
                    const item = arr[i];
                    if (item.type === type && item.listener === listener && item.options === options) {
                        arr.splice(i, 1);
                        break;
                    }
                }
            }
            return origRemoveEventListener.call(this, type, listener, options);
        };

        // Helper to retrieve tracked event listeners.
        const getTrackedEventListeners = (target, typeFilter) => {
            const arr = registry.get(target) || [];
            return typeFilter ? arr.filter(item => item.type === typeFilter) : arr;
        };

        // Remove all "visibilitychange" listeners from the document.
        const removeVisibilityListeners = () => {
            const visListeners = getTrackedEventListeners(document, 'visibilitychange');
            visListeners.forEach(({ listener, options }) => {
                document.removeEventListener('visibilitychange', listener, options);
            });
            console.log("Removed all 'visibilitychange' listeners from document using our tracker.");
        };

        // Function to extend the session by calling window.timeout.checkVisibility.
        const extendSession = () => {

            const realWindow = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;
            if (realWindow.timeout && typeof realWindow.timeout.checkVisibility === 'function') {
                console.log("Extending session....");
                realWindow.timeout.checkVisibility({ hidden: true });
            }
        };


        // Public API.
        return {
            getTrackedEventListeners,
            removeVisibilityListeners,
            startSessionExtender: (interval = 60000) => setInterval(extendSession, interval)
        };
    })();

    util_antiKickOff.removeVisibilityListeners();
    util_antiKickOff.startSessionExtender(60000);


    function util_formatDate(dateStr, roundUp = false) {
        let d = new Date(dateStr);
        if (roundUp && !isNaN(d)) {
            d.setDate(d.getDate() + 1);
        }
        if (isNaN(d)) return 'N/A';
        let mm = String(d.getMonth() + 1).padStart(2, '0');
        let dd = String(d.getDate()).padStart(2, '0');
        let yy = String(d.getFullYear()).slice(-2);
        return `${mm}-${dd}-${yy}`;
    }


    function util_cleanValue(val) {
        if (val === "N/A" || val === null || val === undefined || val === "" || val === 0) {
            return "0";
        }
        return val;
    }


    // Parse card index into main and sub-index components
    function util_parseCardIndex(indexStr) {
        if (!indexStr) return [0, 0];
        const parts = indexStr.split('-');
        const main = parseInt(parts[0], 10) || 0;
        const sub = parts.length > 1 ? (parseInt(parts[1], 10) || 0) : 0;
        return [main, sub];
    }


    // Parse a numeric value from a string, cleaning common symbols
    function util_parseNumber(str) {
        if (!str) return NaN;
        const cleaned = str.replace(/[$,%]/g, '').replace(/\s*back\s*/i, '').trim();
        return parseFloat(cleaned) || NaN;
    }


    // Run tasks in batches to control concurrency
    async function util_runTasksInBatches(tasks, limit) {
        const results = [];
        let i = 0;
        while (i < tasks.length) {
            const chunk = tasks.slice(i, i + limit);
            // Each "task" returns a single object: { offerId, accountToken, result: boolean }
            const chunkResults = await Promise.all(chunk.map(fn => fn()));
            results.push(...chunkResults);
            i += limit;
        }
        return results;
    }


    // Utility to get the basic account ending for a supplementary account
    function members_getParentCardNumber(suppAccount) {
        const parts = suppAccount.cardIndex.split('-');
        if (parts.length > 1) {
            const mainIndex = parts[0];
            // Find the basic account whose cardIndex equals mainIndex and has relationship "BASIC"
            const basicAccount = glb_account.find(acc => acc.cardIndex === mainIndex && acc.relationship === "BASIC");
            if (basicAccount) {
                return basicAccount.cardEnding;
            }
        }
        return "N/A";
    }


    // Utility to sort the account data based on a key
    function members_sortTable(key) {
        if (glb_memberSortState.key === key) {
            glb_memberSortState.direction *= -1;
        } else {
            glb_memberSortState.key = key;
            glb_memberSortState.direction = 1;
        }
        if (key === 'cardIndex') {
            glb_account.sort((a, b) => {
                const [aMain, aSub] = util_parseCardIndex(a.cardIndex);
                const [bMain, bSub] = util_parseCardIndex(b.cardIndex);
                if (aMain === bMain) {
                    return glb_memberSortState.direction * (aSub - bSub);
                }
                return glb_memberSortState.direction * (aMain - bMain);
            });
        } else {
            glb_account.sort((a, b) => {
                const valA = a[key] || "";
                const valB = b[key] || "";
                return glb_memberSortState.direction * valA.toString().localeCompare(valB.toString());
            });
        }
        ui_saveScrollPos();
        const container = document.getElementById('members-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(members_renderTable());
        }
    }


    // Utility to sort the offer data based on a key
    function offers_sortTable(key) {
        if (glb_offerSortState.key === key) {
            glb_offerSortState.direction *= -1;
        } else {
            glb_offerSortState.key = key;
            glb_offerSortState.direction = (key === "favorite") ? -1 : 1;
        }

        glb_offer.sort((a, b) => {
            if (key === "favorite") {
                if (a.favorite === b.favorite) return 0;
                return a.favorite ? -1 * glb_offerSortState.direction : 1 * glb_offerSortState.direction;
            }

            const numericColumns = ["reward", "threshold", "percentage"];

            if (numericColumns.includes(key)) {
                const numA = util_parseNumber(a[key] || "");
                const numB = util_parseNumber(b[key] || "");

                if (isNaN(numA) && isNaN(numB)) {
                    return glb_offerSortState.direction * String(a[key] || "").localeCompare(String(b[key] || ""));
                } else if (isNaN(numA)) {
                    return 1 * glb_offerSortState.direction;
                } else if (isNaN(numB)) {
                    return -1 * glb_offerSortState.direction;
                }
                return glb_offerSortState.direction * (numA - numB);
            } else if (key === "eligibleCards" || key === "enrolledCards") {
                const lenA = Array.isArray(a[key]) ? a[key].length : 0;
                const lenB = Array.isArray(b[key]) ? b[key].length : 0;
                return glb_offerSortState.direction * (lenA - lenB);
            } else {
                return glb_offerSortState.direction * String(a[key] || "").localeCompare(String(b[key] || ""));
            }
        });

        ui_saveScrollPos();

        const container = document.getElementById('offers-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(offers_renderTableView());
        } else {
            // If we're in grid view, update the display container
            const displayContainer = document.getElementById('offers-display-container');
            if (displayContainer) {
                displayContainer.innerHTML = "";
                const displayMode = localStorage.getItem('amaxoffer_offers_display') || 'table';
                if (displayMode === 'grid') {
                    displayContainer.appendChild(offers_renderGridView());
                } else {
                    displayContainer.appendChild(offers_renderTableView());
                }
            }
        }
    }

    // Utility to parse offer details from the description
    function offers_parseDescription(description = "") {
        const parseDollar = (str) => parseFloat(str.replace(/[,\$]/g, ""));
        const toMoneyString = (num) => {
            if (num == null || isNaN(num)) return null;
            return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
        };

        let thresholdVal = null;
        let rewardVal = null;
        let percentageVal = null;
        let threshold = null;
        let reward = null;
        let percentage = null;
        let times = null;
        let total = null;

        {
            const spendRegex = /Spend\s*\$(\d[\d,\.]*)/i;
            const spendMatch = description.match(spendRegex);
            if (spendMatch) {
                thresholdVal = parseDollar(spendMatch[1]);
            }
        }
        {
            const percentRegex = /(?:Earn|Get)\s+(\d+(\.\d+)?)%\s*back/i;
            const percentMatch = description.match(percentRegex);
            if (percentMatch) {
                percentageVal = parseFloat(percentMatch[1]);
            }
        }
        {
            const mrPointsPerDollarRegex = /Earn\s*\+?(\d+)\s*Membership Rewards(?:®)?\s*points?\s*per\s*(?:eligible\s*)?dollar spent/i;
            const mrPointsPerDollarMatch = description.match(mrPointsPerDollarRegex);
            if (mrPointsPerDollarMatch) {
                const mrPointsEachDollar = parseFloat(mrPointsPerDollarMatch[1]);
                if (!percentageVal) {
                    percentageVal = mrPointsEachDollar;
                }
                const mrPointsCapRegex = /up to\s*(\d[\d,\.]*)\s*(points|pts)/i;
                const mrPointsCapMatch = description.match(mrPointsCapRegex);
                if (mrPointsCapMatch) {
                    const capVal = parseDollar(mrPointsCapMatch[1]);
                    rewardVal = capVal * 0.01;
                }
            }
        }
        {
            const earnGetRegex = /(?:earn|get)\s*\$(\d[\d,\.]*)/i;
            const earnGetMatch = description.match(earnGetRegex);
            if (earnGetMatch) {
                rewardVal = parseDollar(earnGetMatch[1]);
            }
            const upToTotalRegex = /up to (?:a total of )?\$(\d[\d,\.]*)/i;
            const upToTotalMatch = description.match(upToTotalRegex);
            if (upToTotalMatch) {
                rewardVal = parseDollar(upToTotalMatch[1]);
            }
        }
        {
            const mrPointsRewardRegex = /Earn\s+([\d,]+)\s*Membership Rewards(?:®)?\s*points(?!\s*per)/i;
            const mrPointsRewardMatch = description.match(mrPointsRewardRegex);
            if (mrPointsRewardMatch) {
                const points = parseInt(mrPointsRewardMatch[1].replace(/,/g, ""), 10);
                rewardVal = points * 0.01;
            }
        }
        {
            const upToTimesRegex = /up to\s+(\d+)\s+times?/i;
            const upToTimesMatch = description.match(upToTimesRegex);
            if (upToTimesMatch) {
                times = upToTimesMatch[1];
            }
        }
        {
            const totalOfRegex = /\(total of\s*\$(\d[\d,\.]*)\)/i;
            const totalOfMatch = description.match(totalOfRegex);
            if (totalOfMatch) {
                total = toMoneyString(parseDollar(totalOfMatch[1]));
            }
        }
        const haveThreshold = (thresholdVal != null && !isNaN(thresholdVal));
        const haveReward = (rewardVal != null && !isNaN(rewardVal));
        const havePercent = (percentageVal != null && !isNaN(percentageVal));

        if (haveThreshold && haveReward && !havePercent && thresholdVal > 0) {
            percentageVal = (rewardVal / thresholdVal) * 100;
        } else if (haveThreshold && havePercent && !haveReward) {
            rewardVal = thresholdVal * (percentageVal / 100);
        } else if (haveReward && havePercent && !haveThreshold && percentageVal !== 0) {
            thresholdVal = rewardVal / (percentageVal / 100);
        } else if (havePercent && !haveThreshold && !haveReward) {
            thresholdVal = 10000;
            rewardVal = thresholdVal * (percentageVal / 100);
        }
        if (thresholdVal != null) threshold = toMoneyString(thresholdVal);
        if (rewardVal != null) reward = toMoneyString(rewardVal);
        if (percentageVal != null) {
            const rounded = Math.round(percentageVal * 10) / 10;
            percentage = `${rounded}%`;
        }
        return { threshold, reward, percentage, times, total };
    }

    // util_debounce function for input events
    function util_debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Helper to darken a color
    function util_darkenColor(color) {
        if (color.startsWith('var(')) return color;
        if (color.startsWith('rgba(')) {
            // For rgba, just return a slightly more opaque version
            return color.replace(/rgba\(([^,]+,[^,]+,[^,]+),\s*([^)]+)\)/, (_, rgb, alpha) =>
                `rgba(${rgb}, ${Math.min(parseFloat(alpha) + 0.1, 1)})`);
        }
        // For hex colors (simplified approach)
        if (color.startsWith('#')) {
            const hex = color.slice(1);
            const num = parseInt(hex, 16);
            const r = (num >> 16) * 0.8;
            const g = ((num >> 8) & 0xFF) * 0.8;
            const b = (num & 0xFF) * 0.8;
            return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        }
        return color; // Return original if we can't easily darken it
    }



    // =========================================================================
    // Section 5: Data Fetching Functions
    // =========================================================================

    async function api_fetchAccounts(readonly = false) {
        try {
            const res = await fetch(API_member, {
                method: 'GET',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!res.ok) {
                console.error('Failed to fetch account data (status not OK)');
                return false;
            }
            const data = await res.json();
            if (!data || !Array.isArray(data.accounts)) {
                throw new Error('Invalid account data received');
            }
            glb_account = [];
            let mainCounter = 1;
            data.accounts.forEach(item => {
                const mainAccount = {
                    cardEnding: item.account?.display_account_number || 'N/A',
                    relationship: item.account?.relationship || 'N/A',
                    supplementary_index: item.account?.supplementary_index || 'N/A',
                    account_status: Array.isArray(item.status?.account_status) ? item.status.account_status[0] : (item.status?.account_status || 'N/A'),
                    days_past_due: (item.status?.days_past_due !== undefined) ? item.status.days_past_due : 'N/A',
                    account_setup_date: item.status?.account_setup_date || 'N/A',
                    description: item.product?.description || 'N/A',
                    small_card_art: item.product?.small_card_art || 'N/A',
                    embossed_name: item.profile?.embossed_name || 'N/A',
                    account_token: item.account_token || 'N/A',
                    cardIndex: mainCounter.toString(),
                    eligibleOffers: 0,
                    enrolledOffers: 0
                };
                glb_account.push(mainAccount);
                if (Array.isArray(item.supplementary_accounts)) {
                    item.supplementary_accounts.forEach(supp => {
                        const suppIndex = supp.account?.supplementary_index ? parseInt(supp.account.supplementary_index, 10) : 'N/A';
                        const suppAccount = {
                            cardEnding: supp.account?.display_account_number || 'N/A',
                            relationship: supp.account?.relationship || 'N/A',
                            supplementary_index: supp.account?.supplementary_index || 'N/A',
                            account_status: Array.isArray(supp.status?.account_status) ? supp.status.account_status[0] : (supp.status?.account_status || 'N/A'),
                            days_past_due: (supp.status?.days_past_due !== undefined) ? supp.status.days_past_due : 'N/A',
                            account_setup_date: supp.status?.account_setup_date || 'N/A',
                            description: supp.product?.description || 'N/A',
                            small_card_art: supp.product?.small_card_art || 'N/A',
                            embossed_name: supp.profile?.embossed_name || 'N/A',
                            account_token: supp.account_token || 'N/A',
                            cardIndex: `${mainCounter}-${suppIndex}`,
                            eligibleOffers: 0,
                            enrolledOffers: 0
                        };
                        glb_account.push(suppAccount);
                    });
                }
                mainCounter++;
            });
        } catch (error) {
            console.error('Error fetching account data:', error);
            content.innerHTML = `<p style="color: red;">Error fetching account data: ${error.message}</p>`;
            return false;
        }

        if (Array.isArray(glb_account) && glb_account.length > 0) {
            storage_accToken = glb_account[0].account_token;
            if (!readonly) {
                storage_manageData("set", storage_accToken, ["account"]);
            }
            return true;
        }
        return false;
    }


    async function api_fetchOfferList(accountToken) {
        const payload = {
            accountNumberProxy: accountToken,
            locale: "en-US",
            offerRequestType: "LIST",
            source: "STANDARD",
            status: ["ELIGIBLE", "ENROLLED"],
            typeOf: "MERCHANT",
            userOffset: "-06:00"
        };
        try {
            const res = await fetch(API_offer, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://global.americanexpress.com'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`Offers fetch error: ${res.status}`);
            const json = await res.json();
            return json.offers || [];
        } catch (error) {
            console.error(`Error fetching offers for token ${accountToken}:`, error);
            return [];
        }
    }

    async function api_fetchOfferDetails(accountToken, offerId) {

        // Generate timestamp in required format with offset
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const offsetTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        const requestDateTimeWithOffset = `${offsetTime.getUTCFullYear()}-${pad(offsetTime.getUTCMonth() + 1)}_${pad(offsetTime.getUTCDate())}T${pad(offsetTime.getUTCHours())}:${pad(offsetTime.getUTCMinutes())}:${pad(offsetTime.getUTCSeconds())}-06:00`;

        const payload = {
            accountNumberProxy: accountToken,
            identifier: offerId,
            identifierType: "OFFER",
            locale: "en-US",
            offerRequestType: "DETAILS",
            requestDateTimeWithOffset: requestDateTimeWithOffset,
            source: "STANDARD",
            userOffset: "-06:00"
        };

        try {
            const res = await fetch(API_offer, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://global.americanexpress.com'
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error(`Failed to fetch offer details: ${res.status}`);
            }

            const data = await res.json();
            return {
                terms: data.terms || null,
                long_description: data.long_description || null,
                name: data.name,
                logo_url: data.logo_url,
                expiry_date: data.expiry_date,
                achievement_type: data.achievement_type,
                category: data.category,
                redemption_types: data.redemption_types,
                location: data.location,
                cta: data.cta
            };
        } catch (error) {
            console.error("Error fetching offer details:", error);
            return null;
        }
    }

    async function api_refreshOffersList() {
        // Store current offers for comparison
        const oldOffers = Array.isArray(glb_offer) ? [...glb_offer] : [];
        const offerInfoTable = {};

        const activeAccounts = glb_account.filter(acc =>
            acc.account_status && acc.account_status.trim().toLowerCase() === "active"
        );

        const skipPatterns = [
            "Your FICO&#174",
            "The Hotel Collection",
            "3X on Amex Travel",
            "Flexible Business Credit",
            "Apple Pay",
            "More Coffee",
            "More Travel",
            "Send Money to Friends",
            "Considering a Big Purchase"
        ];

        await Promise.all(activeAccounts.map(async (acc) => {
            const offers = await api_fetchOfferList(acc.account_token);
            offers.forEach(offer => {
                const sourceId = offer.source_id;
                if (!sourceId) return;
                const offerName = (offer.name || "").toLowerCase();
                if (skipPatterns.some(pattern => offerName.includes(pattern.toLowerCase()))) {
                    return;
                }

                if (!offerInfoTable[sourceId]) {
                    const details = offers_parseDescription(offer.short_description || "");
                    offerInfoTable[sourceId] = {
                        source_id: sourceId,
                        offerId: offer.id || "N/A",
                        name: offer.name || "N/A",
                        achievement_type: offer.achievement_type || "N/A",
                        category: offer.category || "N/A",
                        expiry_date: offer.expiry_date || "N/A",
                        logo: offer.logo_url || "N/A",
                        redemption_types: offer.redemption_types ? offer.redemption_types.join(', ') : "N/A",
                        short_description: offer.short_description || "N/A",
                        threshold: details.threshold,
                        reward: details.reward,
                        percentage: details.percentage,
                        eligibleCards: [],
                        enrolledCards: [],
                        favorite: false
                    };
                }

                if (offer.status === "ELIGIBLE") {
                    if (!offerInfoTable[sourceId].eligibleCards.includes(acc.account_token)) {
                        offerInfoTable[sourceId].eligibleCards.push(acc.account_token);
                    }
                } else if (offer.status === "ENROLLED") {
                    if (!offerInfoTable[sourceId].enrolledCards.includes(acc.account_token)) {
                        offerInfoTable[sourceId].enrolledCards.push(acc.account_token);
                    }
                }
            });
        }));


        // Convert to array for processing
        const newOffers = Object.values(offerInfoTable);

        // Process changes and update global state
        const changeStats = await offers_processChanges(oldOffers, newOffers);


        // Update card offer counts
        glb_account.forEach(acc => {
            acc.eligibleOffers = 0;
            acc.enrolledOffers = 0;
        });

        glb_offer.forEach(offer => {
            if (Array.isArray(offer.eligibleCards)) {
                offer.eligibleCards.forEach(cardToken => {
                    const acc = glb_account.find(a => a.account_token === cardToken);
                    if (acc) acc.eligibleOffers = (acc.eligibleOffers || 0) + 1;
                });
            }
            if (Array.isArray(offer.enrolledCards)) {
                offer.enrolledCards.forEach(cardToken => {
                    const acc = glb_account.find(a => a.account_token === cardToken);
                    if (acc) acc.enrolledOffers = (acc.enrolledOffers || 0) + 1;
                });
            }
        });

        storage_manageData("set", storage_accToken, ["account", "offer", "offer_expired", "offer_redeemed"]);

        return changeStats;
    }


    async function offers_processChanges(oldOffers, newOffers) {
        const stats = { newCount: 0, expiredCount: 0, redeemedCount: 0 };

        // Create maps for easier lookup
        const prevOfferMap = new Map();
        oldOffers.forEach(offer => {
            if (offer.source_id) prevOfferMap.set(offer.source_id, offer);
        });

        // Initialize tracking arrays
        window.glb_offer_expired = glb_offer_expired || [];
        window.glb_offer_redeemed = glb_offer_redeemed || [];

        // 1. Process favorites and preserve detailed fields
        for (const newOffer of newOffers) {
            const prevOffer = prevOfferMap.get(newOffer.source_id);
            if (prevOffer) {
                // Preserve favorite status
                if (prevOffer.favorite) newOffer.favorite = true;

                // Preserve detailed fields
                if (prevOffer.terms) newOffer.terms = prevOffer.terms;
                if (prevOffer.long_description) newOffer.long_description = prevOffer.long_description;
                if (prevOffer.location) newOffer.location = prevOffer.location;
                if (prevOffer.cta) newOffer.cta = prevOffer.cta;
            }

            // Track new offers
            if (!prevOfferMap.has(newOffer.source_id)) {
                stats.newCount++;
            }
        }

        // 2. Fetch missing details for non-DEFAULT offers
        const detailPromises = [];

        for (const newOffer of newOffers) {
            if (newOffer.category === "DEFAULT") continue;

            if (!newOffer.terms || !newOffer.long_description) {
                const account = glb_account.find(acc =>
                    acc.account_status?.trim().toLowerCase() === "active" &&
                    (newOffer.eligibleCards?.includes(acc.account_token) ||
                        newOffer.enrolledCards?.includes(acc.account_token))
                );

                if (account) {
                    detailPromises.push((async () => {
                        const details = await api_fetchOfferDetails(account.account_token, newOffer.offerId);
                        if (details) {
                            newOffer.terms = details.terms || null;
                            newOffer.long_description = details.long_description || null;
                            if (details.location) newOffer.location = details.location;
                            if (details.cta) newOffer.cta = details.cta;
                        }
                        return details;
                    })());
                }
            }
        }

        // Wait for all detail fetches to complete
        if (detailPromises.length > 0) {
            const results = await Promise.all(detailPromises);
            console.log(`Completed ${results.filter(Boolean).length}/${detailPromises.length} detail fetches`);
        }

        // 3. Identify expired offers
        for (const [sourceId, prevOffer] of prevOfferMap.entries()) {
            if (!newOffers.some(o => o.source_id === sourceId)) {
                stats.expiredCount++;

                const expiredOffer = { ...prevOffer };
                expiredOffer.expiredDate = new Date().toISOString();
                window.glb_offer_expired.push(expiredOffer);
            }
        }

        // 4. Identify redeemed offers
        for (const [sourceId, prevOffer] of prevOfferMap.entries()) {
            const newOffer = newOffers.find(o => o.source_id === sourceId);
            if (newOffer) {
                const prevEnrolled = new Set(prevOffer.enrolledCards || []);
                const newEnrolled = new Set(newOffer.enrolledCards || []);

                const redeemedCards = [];

                prevEnrolled.forEach(card => {
                    if (!newEnrolled.has(card)) {
                        const cardAccount = glb_account.find(acc =>
                            acc.account_token === card &&  // Use account_token for comparison
                            acc.account_status?.trim().toLowerCase() === "active"
                        );

                        if (cardAccount) redeemedCards.push(card);  // This is now correct (token)
                    }
                });

                if (redeemedCards.length > 0) {
                    stats.redeemedCount += redeemedCards.length;

                    window.glb_offer_redeemed.push({
                        source_id: sourceId,
                        offerId: newOffer.offerId,
                        name: newOffer.name,
                        redeemedCards: redeemedCards,
                        redeemedDate: new Date().toISOString()
                    });
                }
            }
        }

        // Update global offers array with the new data
        window.glb_offer = newOffers;

        glb_offer = window.glb_offer;
        glb_offer_expired = window.glb_offer_expired;
        glb_offer_redeemed = window.glb_offer_redeemed;

        return stats;
    }


    async function api_fetchAccountBalance(accountToken) {
        if (!accountToken) {
            console.error("Account token is required");
            return null;
        }
        try {
            const balancesUrl = API_balance;
            const pTransactionUrl = API_balancePending;

            const [balancesResponse, pTransactionResponse] = await Promise.all([
                fetch(balancesUrl, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'account_tokens': accountToken
                    }
                }),
                fetch(pTransactionUrl, {
                    method: 'GET',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'account_tokens': accountToken
                    }
                })
            ]);

            if (!balancesResponse.ok) { console.error("Failed to fetch balances, status:", balancesResponse.status); return null; }
            if (!pTransactionResponse.ok) { console.error("Failed to fetch pending transaction summary, status:", pTransactionResponse.status); return null; }

            const balanceData = await balancesResponse.json();
            const pTransactionData = await pTransactionResponse.json();

            let balanceInfo = {};
            if (Array.isArray(balanceData) && balanceData.length > 0) {
                balanceInfo = {
                    statement_balance_amount: balanceData[0].statement_balance_amount,
                    remaining_statement_balance_amount: balanceData[0].remaining_statement_balance_amount
                };
            } else { console.error("Unexpected data format for balances:", balanceData); }

            let pTransactionInfo = {};
            if (Array.isArray(pTransactionData) && pTransactionData.length > 0) {
                pTransactionInfo = {
                    debits_credits_payments_total_amount: pTransactionData[0].total?.debits_credits_payments_total_amount
                };
            } else { console.error("Unexpected data format for pending transaction  summary:", pTransactionData); }

            return {
                ...balanceInfo,
                ...pTransactionInfo
            };
        } catch (error) { console.error("Error fetching financial data:", error); return null; }
    }


    async function api_fetchAllBalances() {
        const basicAccounts = glb_account.filter(acc => acc.relationship === "BASIC");
        try {
            await Promise.all(basicAccounts.map(async (acc) => {
                if (!acc.financialData) {
                    acc.financialData = await api_fetchAccountBalance(acc.account_token);
                }
            }));

            storage_manageData("set", storage_accToken, ["account"]);
        } catch (error) {
            return;
        }

    }


    async function api_fetchAccountBenefits(accountToken, locale = "en-US", limit = "ALL") {
        const url = API_benefit;
        const payload = [{ accountToken, locale, limit }];

        try {
            const response = await fetch(url, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "*/*"
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                console.error("Failed to fetch Best Loyalty Benefits Trackers. Status:", response.status);
                return null;
            }

            // The response is expected to be an array of objects, each containing a .trackers array.
            const data = await response.json();
            const trackers = [];

            data.forEach(item => {
                if (Array.isArray(item.trackers)) {
                    item.trackers.forEach(trackerObj => {

                        const {
                            benefitId,
                            sorBenefitId,
                            category,
                            periodStartDate,
                            periodEndDate,
                            trackerDuration,
                            benefitName,
                            qualifiedDetailAvailable,
                            status,
                            terms,
                            tracker,   // subobject: { targetAmount, spentAmount, remainingAmount, targetUnit, targetCurrency, targetCurrencySymbol }
                            progress   // subobject: { updateInterval, title, message, usedLabel, togoLabel, totalSavingsYearToDate, hideProgressBar }
                        } = trackerObj;

                        // Push everything into an array with a standardized structure
                        trackers.push({
                            benefitId,
                            sorBenefitId,
                            category,
                            periodStartDate,
                            periodEndDate,
                            trackerDuration,        // e.g., "Monthly", "HalfYear", "CalenderYear", etc.
                            benefitName,
                            qualifiedDetailAvailable,
                            status,
                            terms,                  // array of HTML strings
                            tracker: tracker ? {
                                targetAmount: tracker.targetAmount,
                                spentAmount: tracker.spentAmount,
                                remainingAmount: tracker.remainingAmount,
                                targetUnit: tracker.targetUnit,
                                targetCurrency: tracker.targetCurrency,
                                targetCurrencySymbol: tracker.targetCurrencySymbol
                            } : null,
                            progress: progress ? {
                                updateInterval: progress.updateInterval,
                                title: progress.title,
                                message: progress.message,
                                usedLabel: progress.usedLabel,
                                togoLabel: progress.togoLabel,
                                totalSavingsYearToDate: progress.totalSavingsYearToDate,
                                hideProgressBar: progress.hideProgressBar
                            } : null
                        });
                    });
                }
            });

            return trackers;
        } catch (error) {
            console.error("Error fetching Best Loyalty Benefits Trackers:", error);
            return null;
        }
    }


    async function api_fetchAllBenefits() {
        const basicAccounts = glb_account.filter(acc => acc.relationship === "BASIC");
        let newTrackers = [];
        await Promise.all(basicAccounts.map(async (acc) => {
            const trackers = await api_fetchAccountBenefits(acc.account_token);
            if (Array.isArray(trackers)) {
                trackers.forEach(tracker => {
                    // Attach the BASIC card's display number so we know which card the tracker is for
                    tracker.cardEnding = acc.cardEnding;
                    // Ensure numeric values for spent and target amounts
                    tracker.spentAmount = parseFloat(tracker.spentAmount) || 0;
                    tracker.targetAmount = parseFloat(tracker.targetAmount) || 0;
                    newTrackers.push(tracker);
                });
            }
        }));

        if (Array.isArray(newTrackers)) {
            glb_benefit = newTrackers;
            storage_manageData("set", storage_accToken, "benefit");
        }

    }


    async function api_verifyTrustLevel() {
        return new Promise((resolve) => {
            GM.xmlHttpRequest({
                method: "GET",
                url: API_USCF1,
                onload: function (response) {
                    if (response.status !== 200) {
                        console.log("Session request failed");
                        return resolve(0);
                    }
                    try {
                        const sessionData = JSON.parse(response.responseText);
                        const username = sessionData?.current_user?.username;
                        if (!username) {
                            console.log("No current user found");
                            return resolve(0);
                        }
                        GM.xmlHttpRequest({
                            method: "GET",
                            url: API_USCF2 + encodeURIComponent(username) + ".json",
                            onload: function (resp) {
                                if (resp.status !== 200) {
                                    console.log(`User JSON fetch failed for ${username}`);
                                    return resolve(0);
                                }
                                try {
                                    const userData = JSON.parse(resp.responseText);
                                    const trustLevel = userData?.user?.trust_level;
                                    resolve(trustLevel ?? 0);
                                } catch (e) {
                                    console.error("Error parsing user JSON:", e);
                                    resolve(0);
                                }
                            },
                            onerror: function (err) {
                                console.error("Error fetching user JSON:", err);
                                resolve(0);
                            }
                        });
                    } catch (e) {
                        console.error("Error parsing session JSON:", e);
                        resolve(0);
                    }
                },
                onerror: function (err) {
                    console.error("Error fetching session:", err);
                    resolve(0);
                }
            });
        });
    }


    async function api_enrollInOffer(accountToken, offerIdentifier) {
        const now = new Date();
        const pad = n => n.toString().padStart(2, '0');
        const offsetTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
        const requestDateTimeWithOffset = `${offsetTime.getUTCFullYear()}-${pad(offsetTime.getUTCMonth() + 1)}-${pad(offsetTime.getUTCDate())}T${pad(offsetTime.getUTCHours())}:${pad(offsetTime.getUTCMinutes())}:${pad(offsetTime.getUTCSeconds())}-06:00`;

        const payload = {
            accountNumberProxy: accountToken,
            identifier: offerIdentifier,
            locale: "en-US",
            requestDateTimeWithOffset: requestDateTimeWithOffset,
            userOffset: "-06:00"
        };

        try {
            const res = await fetch(API_Enroll, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Origin': 'https://global.americanexpress.com'
                },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.isEnrolled) {
                return { offerId: offerIdentifier, accountToken, result: true };
            } else {
                // Record explanationMessage when enrollment fails.
                return {
                    offerId: offerIdentifier,
                    accountToken,
                    result: false,
                    explanationMessage: json.explanationMessage
                };
            }
        } catch (error) {
            return { offerId: offerIdentifier, accountToken, result: false };
        }
    }


    async function api_batchEnrollOffers(offerSourceId, accountToken) {
        // Helper to delay execution
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

        // Counters for statistics.
        let totalEnrollAttempts = 0;
        let successfulEnrollments = 0;
        const tasks = [];

        // Filter out offers that are not eligible.
        const eligibleOffers = glb_offer.filter(offer => {
            if (offerSourceId && offer.source_id !== offerSourceId) return false;
            if (offer.category === "DEFAULT") {
                console.log(`Skipping offer "${offer.name}" because its category is DEFAULT`);
                return false;
            }
            return true;
        });

        // Helper to update the enrollment status in the offer object.
        const updateOfferEnrollment = (offer, account) => {

            offer.eligibleCards = offer.eligibleCards.filter(c => c !== account.account_token);

            // Add to enrolled if not there already
            if (!offer.enrolledCards.includes(account.account_token)) {
                offer.enrolledCards.push(account.account_token);
            }
        };

        // Build tasks: for each offer, for each eligible card, find active matching accounts.
        eligibleOffers.forEach(offer => {
            offer.eligibleCards.forEach(cardToken => {
                const matchingAccounts = glb_account.filter(acc =>
                    acc.account_token === cardToken &&
                    acc.account_status?.trim().toLowerCase() === "active" &&
                    (!accountToken || acc.account_token === accountToken)
                );

                matchingAccounts.forEach(account => {
                    tasks.push(async () => {
                        totalEnrollAttempts++;

                        if (glb_excludedCards.includes(account.account_token)) {
                            console.log(`Skipping card ${account.cardEnding} as it is excluded.`);
                            return { offerId: offer.offerId, accountToken: account.account_token, result: false, explanationMessage: "Card excluded" };
                        }

                        // Delay for non-priority cards.
                        if (!glb_priorityCards.includes(account.account_token)) {
                            await delay(500);
                        }

                        try {
                            const enrollResult = await api_enrollInOffer(account.account_token, offer.offerId);
                            if (enrollResult.result) {
                                successfulEnrollments++;
                                console.log(`Enroll "${offer.name}" on card ${account.cardEnding} successful`);
                                updateOfferEnrollment(offer, account);
                                return { offerId: offer.offerId, accountToken: account.account_token, result: true };
                            } else {
                                console.log(`Enroll "${offer.name}" on card ${account.cardEnding} failed. Reason: ${enrollResult.explanationMessage || "No explanation provided."}`);
                                return {
                                    offerId: offer.offerId,
                                    accountToken: account.account_token,
                                    result: false,
                                    explanationMessage: enrollResult.explanationMessage
                                };
                            }
                        } catch (err) {
                            console.log(`Enroll "${offer.name}" on card ${account.cardEnding} errored:`, err);
                            return {
                                offerId: offer.offerId,
                                accountToken: account.account_token,
                                result: false,
                                explanationMessage: err.message || "Error occurred"
                            };
                        }
                    });
                });
            });
        });

        // Execute tasks in batches.
        const enrollmentResults = await util_runTasksInBatches(tasks, runInBatchesLimit);
        await api_refreshOffersList();

        if (totalEnrollAttempts > 0) {
            const successRate = ((successfulEnrollments / totalEnrollAttempts) * 100).toFixed(2);
            console.log(`Enrollment success rate: ${successfulEnrollments}/${totalEnrollAttempts} (${successRate}%)`);
        } else {
            console.log('No enrollment attempts were made.');
        }
        return enrollmentResults;
    }


    async function util_runTasksInBatches(tasks, limit) {
        const results = [];
        let i = 0;
        while (i < tasks.length) {
            const chunk = tasks.slice(i, i + limit);
            try {
                const chunkResults = await Promise.allSettled(chunk.map(fn => fn()));
                results.push(...chunkResults.map(result =>
                    result.status === 'fulfilled' ? result.value :
                        { result: false, error: result.reason }
                ));
            } catch (error) {
                console.error("Batch processing error:", error);
            }
            i += limit;
        }
        return results;
    }


    // =========================================================================
    // Section 6: UI Rendering Functions
    // =========================================================================


    // Enhanced members page with optimized rendering
    function members_renderPage() {
        const containerDiv = ui_createElement('div', {
            styleString: UI_STYLES.pageContainer
        });

        containerDiv.appendChild(members_renderStatsBar());
        containerDiv.appendChild(members_renderFilterBar());

        const tableWrapper = ui_createElement('div', {
            props: { id: 'members-table-container' },
            styleString: 'overflow-x:auto;'
        });
        tableWrapper.appendChild(members_renderTable());

        containerDiv.appendChild(tableWrapper);
        return containerDiv;
    }

    // Optimized stats bar with reusable stat item creator
    function members_renderStatsBar() {
        const statsBar = document.createElement('div');
        statsBar.style.cssText = UI_STYLES.cardContainer + ' display:flex; flex-wrap:wrap; gap:16px; justify-content:space-between;';

        // Calculate statistics once
        const stats = members_calculateStats();

        // Helper function for creating stat items
        function createStatItem(label, value, icon, color, filterAction) {
            const statItem = document.createElement('div');
            statItem.style.cssText = `display:flex; align-items:center; gap:10px; padding:10px 16px; background-color:rgba(${color}, 0.1); border-radius:10px; border:1px solid rgba(${color}, 0.2); min-width:150px; transition:all 0.2s ease; ${filterAction ? 'cursor:pointer;' : ''}`;

            if (filterAction) {
                statItem.addEventListener('mouseenter', () => {
                    statItem.style.transform = 'translateY(-2px)';
                    statItem.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                });
                statItem.addEventListener('mouseleave', () => {
                    statItem.style.transform = 'translateY(0)';
                    statItem.style.boxShadow = 'none';
                });
                statItem.addEventListener('click', filterAction);
            }

            const iconElement = document.createElement('div');
            iconElement.innerHTML = icon;
            iconElement.style.color = `rgb(${color})`;

            const textContainer = document.createElement('div');
            textContainer.style.cssText = 'display:flex; flex-direction:column;';

            const valueElement = document.createElement('div');
            valueElement.textContent = value;
            valueElement.style.cssText = `font-size:18px; font-weight:600; color:rgb(${color});`;

            const labelElement = document.createElement('div');
            labelElement.textContent = label;
            labelElement.style.cssText = 'font-size:12px; color:var(--ios-text-secondary);';

            textContainer.appendChild(valueElement);
            textContainer.appendChild(labelElement);
            statItem.appendChild(iconElement);
            statItem.appendChild(textContainer);

            return statItem;
        }

        // Define stat icons - using SVG constants for readability
        const ICONS = {
            CARD: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/></svg>`,
            ACTIVE: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>`,
            BASIC: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/></svg>`,
            BALANCE: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/></svg>`,
            PENDING: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-14v7l5.2 3.2.8-1.3-4.5-2.7V6H11z" fill="currentColor"/></svg>`,
            REMAIN: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M16 6v8h3v4h2V6c0-1.1-.9-2-2-2H7L7 6h9zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zm2-8h6v8H5v-8z" fill="currentColor"/></svg>`
        };

        // Add stat items with click handlers
        statsBar.appendChild(createStatItem('Total Cards', stats.totalCards, ICONS.CARD, '52, 152, 219', () => {
            glb_filters.memberStatus = 'all';
            glb_filters.memberCardtype = 'all';
            members_applyFilters();
        }));

        statsBar.appendChild(createStatItem('Active Cards', stats.activeCards, ICONS.ACTIVE, '46, 204, 113', () => {
            glb_filters.memberStatus = 'Active';
            glb_filters.memberCardtype = 'all';
            members_applyFilters();
        }));

        statsBar.appendChild(createStatItem('Basic Cards', stats.basicCards, ICONS.BASIC, '155, 89, 182', () => {
            glb_filters.memberStatus = 'all';
            glb_filters.memberCardtype = 'BASIC';
            members_applyFilters();
        }));


        statsBar.appendChild(createStatItem('Total Balance', `$${stats.totalBalance.toFixed(2)}`, ICONS.BALANCE, '255, 149, 0'));
        statsBar.appendChild(createStatItem('Total Pending', `$${stats.totalPending.toFixed(2)}`, ICONS.PENDING, '0, 122, 255'));
        statsBar.appendChild(createStatItem('Remain Statement', `$${stats.totalRemaining.toFixed(2)}`, ICONS.REMAIN, '255, 45, 85'));

        return statsBar;
    }
    // Helper function to calculate stats once
    function members_calculateStats() {
        const totalCards = glb_account.length;
        const activeCards = glb_account.filter(acc => acc.account_status === "Active").length;
        const basicCards = glb_account.filter(acc => acc.relationship === "BASIC").length;

        // Calculate financial metrics
        const { totalBalance, totalPending, totalRemaining } = glb_account
            .filter(acc => acc.relationship === "BASIC" && acc.financialData)
            .reduce((fin, acc) => {
                fin.totalBalance += parseFloat(acc.financialData.statement_balance_amount) || 0;
                fin.totalPending += parseFloat(acc.financialData.debits_credits_payments_total_amount) || 0;
                fin.totalRemaining += parseFloat(acc.financialData.remaining_statement_balance_amount) || 0;
                return fin;
            }, { totalBalance: 0, totalPending: 0, totalRemaining: 0 });

        return { totalCards, activeCards, basicCards, totalBalance, totalPending, totalRemaining };
    }

    // Helper function to update filter UI and render page
    function members_applyFilters() {
        // Update UI elements if they exist
        const statusFilter = document.getElementById('status-filter');
        const typeFilter = document.getElementById('type-filter');

        if (statusFilter) statusFilter.value = glb_filters.memberStatus;
        if (typeFilter) typeFilter.value = glb_filters.memberCardtype;

        ui_renderCurrentView();
    }

    // Streamlined filter bar with enhanced search
    function members_renderFilterBar() {
        return ui_createFilterBar({
            searchPlaceholder: 'Search offers...',
            onSearch: (value) => {
                glb_filters.memberMerchantSearch = value.toLowerCase();
                ui_renderCurrentView();
            },
            resetCallback: () => {
                glb_filters.memberStatus = 'Active';
                glb_filters.memberCardtype = 'all';
                glb_filters.memberMerchantSearch = '';
                ui_renderCurrentView();
            }
        });
    }

    // Optimized members table renderer
    function members_renderTable() {
        const headers = [
            { label: "Index", key: "cardIndex" },
            { label: "Logo", key: "small_card_art" },
            { label: "Card Ending", key: "cardEnding" },
            { label: "User Name", key: "embossed_name" },
            { label: "Type", key: "relationship" },
            { label: "Opened", key: "account_setup_date" },
            { label: "Status", key: "account_status" },
            { label: "Balance", key: "StatementBalance" },
            { label: "Pending", key: "pending" },
            { label: "Remaining", key: "remainingStaBal" },
            { label: "Eligible", key: "eligibleOffers" },
            { label: "Enrolled", key: "enrolledOffers" },
            { label: "Priority", key: "priority" },
            { label: "Exclude", key: "exclude" }
        ];

        const colWidths = {
            cardIndex: "60px", small_card_art: "70px", cardEnding: "110px",
            embossed_name: "180px", relationship: "85px", account_setup_date: "100px",
            account_status: "90px", StatementBalance: "100px", pending: "100px",
            remainingStaBal: "110px", eligibleOffers: "90px", enrolledOffers: "90px",
            priority: "80px", exclude: "80px"
        };

        // Apply filters
        const filteredAccounts = glb_account.filter(acc => {
            const statusMatch = glb_filters.memberStatus === 'all' ||
                acc.account_status.trim().toLowerCase() === glb_filters.memberStatus.toLowerCase();
            const typeMatch = glb_filters.memberCardtype === 'all' ||
                acc.relationship === glb_filters.memberCardtype;
            return statusMatch && typeMatch;
        });

        // Define cell rendering with organized handlers for each column type
        const cellRenderer = (item, headerItem) => {
            const key = headerItem.key;
            const handlers = {
                small_card_art: () => {
                    if (item.small_card_art && item.small_card_art !== 'N/A') {
                        const imgContainer = document.createElement('div');
                        imgContainer.style.cssText = 'display:flex; justify-content:center; align-items:center; height:40px;';

                        const img = document.createElement('img');
                        img.src = item.small_card_art;
                        img.alt = "Card Logo";
                        img.style.cssText = 'max-width:40px; max-height:40px; border-radius:4px; transition:transform 0.2s ease;';

                        imgContainer.addEventListener('mouseenter', () => img.style.transform = 'scale(1.15)');
                        imgContainer.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');

                        imgContainer.appendChild(img);
                        return imgContainer;
                    }
                    return 'N/A';
                },

                cardIndex: () => {
                    const [mainIndex, subIndex] = util_parseCardIndex(item.cardIndex);
                    const indexSpan = document.createElement('span');
                    indexSpan.style.fontFamily = 'var(--ios-font)';
                    indexSpan.style.fontSize = '13px';
                    indexSpan.innerHTML = subIndex ?
                        `<strong>${mainIndex}</strong>-${subIndex}` :
                        `<strong>${mainIndex}</strong>`;
                    return indexSpan;
                },

                cardEnding: () => {
                    const cardNum = document.createElement('div');
                    cardNum.style.cssText = 'font-weight:500; color:#1c1c1e; font-size:14px; padding:4px 8px; border-radius:6px; background-color:rgba(0,0,0,0.03); display:inline-block;';
                    cardNum.textContent = item[key];
                    return cardNum;
                },

                embossed_name: () => {
                    const nameDiv = document.createElement('div');
                    nameDiv.style.cssText = 'max-width:170px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500; font-size:13px;';
                    nameDiv.textContent = item[key];
                    nameDiv.title = item[key];
                    return nameDiv;
                },

                account_setup_date: () => {
                    return (item[key] && item[key] !== 'N/A') ? util_formatDate(item[key]) : 'N/A';
                },

                eligibleOffers: () => createOfferBadge(item[key], 'eligible', item.account_token),
                enrolledOffers: () => createOfferBadge(item[key], 'enrolled', item.account_token),

                relationship: () => {
                    if (item.relationship === "SUPP") {
                        const parentCardNum = members_getParentCardNumber(item);
                        const relationBadge = document.createElement('div');
                        relationBadge.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:2px;';

                        const typeLabel = document.createElement('span');
                        typeLabel.textContent = 'SUPP';
                        typeLabel.style.cssText = 'font-size:12px; color:var(--ios-blue); font-weight:600;';

                        const parentLabel = document.createElement('span');
                        parentLabel.textContent = `→ ${parentCardNum}`;
                        parentLabel.style.cssText = 'font-size:11px; color:var(--ios-gray);';

                        relationBadge.appendChild(typeLabel);
                        relationBadge.appendChild(parentLabel);
                        return relationBadge;
                    }

                    const typeBadge = document.createElement('span');
                    typeBadge.textContent = 'BASIC';
                    typeBadge.style.cssText = 'font-size:12px; font-weight:600; color:var(--ios-green);';
                    return typeBadge;
                },

                account_status: () => {
                    const statusBadge = document.createElement('span');
                    statusBadge.textContent = item[key];
                    statusBadge.style.cssText = `
                    display:inline-block; padding:4px 10px; border-radius:12px; font-size:12px; 
                    font-weight:600; text-transform:capitalize;
                    ${getStatusStyle(item[key].toLowerCase())}
                    `;
                    return statusBadge;
                },

                pending: () => createFinancialValue(item, 'debits_credits_payments_total_amount'),
                remainingStaBal: () => createFinancialValue(item, 'remaining_statement_balance_amount'),
                StatementBalance: () => createFinancialValue(item, 'statement_balance_amount'),

                priority: () => createToggleSwitch(item, 'priority'),
                exclude: () => createToggleSwitch(item, 'exclude')
            };

            // Use the appropriate handler or default
            return handlers[key] ? handlers[key]() : (util_cleanValue(item[key]) || '');
        };

        // Helper function for offer badges
        function createOfferBadge(count, type, accountToken) {
            const parsedCount = parseInt(count || 0);
            const container = document.createElement('div');
            container.style.cssText = 'height:32px; display:flex; align-items:center; justify-content:center;';

            if (parsedCount > 0) {
                const isEligible = type === 'eligible';
                const btn = document.createElement('button');

                // Use appropriate colors and icons based on type
                const bgColor = isEligible ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.1)';
                const textColor = isEligible ? 'var(--ios-blue)' : 'var(--ios-green)';
                const borderColor = isEligible ? 'rgba(0, 122, 255, 0.2)' : 'rgba(52, 199, 89, 0.2)';
                const icon = isEligible ?
                    `<svg width="12" height="12" viewBox="0 0 24 24" fill="${textColor}" style="margin-right:4px"><path d="M9.5 16.5v-9l7 4.5-7 4.5z"/></svg>` :
                    `<svg width="12" height="12" viewBox="0 0 24 24" fill="${textColor}" style="margin-right:4px"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;

                btn.className = isEligible ? 'eligible-badge' : 'enrolled-badge';
                btn.style.cssText = `
                border-radius:16px; background-color:${bgColor}; color:${textColor}; 
                border:1px solid ${borderColor}; padding:5px 12px; font-weight:600; 
                font-size:13px; cursor:pointer; transition:all 0.2s ease; display:flex; 
                align-items:center; justify-content:center; min-width:40px;
                `;
                btn.innerHTML = icon + parsedCount;

                // Add hover effects
                btn.addEventListener('mouseover', () => {
                    btn.style.transform = 'scale(1.05) translateY(-2px)';
                    btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                    btn.style.backgroundColor = isEligible ? 'rgba(0, 122, 255, 0.15)' : 'rgba(52, 199, 89, 0.15)';
                });

                btn.addEventListener('mouseout', () => {
                    btn.style.transform = 'scale(1) translateY(0)';
                    btn.style.boxShadow = 'none';
                    btn.style.backgroundColor = isEligible ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.1)';
                });

                // Click handler for showing offers popup - use accountToken here, not cardEnding
                btn.addEventListener('click', () => {
                    members_showCardOffers(accountToken, type);
                });

                container.appendChild(btn);
            } else {
                // Zero count indicator
                const zeroSpan = document.createElement('span');
                zeroSpan.textContent = '0';
                zeroSpan.style.cssText = 'color:var(--ios-gray); font-size:13px; font-weight:400; opacity:0.6;';
                container.appendChild(zeroSpan);
            }

            return container;
        }

        // Helper function for financial values
        function createFinancialValue(item, fieldName) {
            if (item.relationship === "BASIC") {
                if (item.financialData) {
                    const value = item.financialData[fieldName];
                    const sanitizedValue = util_cleanValue(value);
                    const numValue = parseFloat(sanitizedValue);

                    const amountDiv = document.createElement('div');
                    amountDiv.style.cssText = `
                    font-variant-numeric:tabular-nums; font-family:var(--ios-font); 
                    font-weight:${numValue > 0 ? '600' : '400'}; 
                    color:${numValue > 0 ? '#1c1c1e' : '#8e8e93'};
                    `;

                    // Format with dollar sign and commas
                    amountDiv.textContent = numValue.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        minimumFractionDigits: 2
                    });

                    return amountDiv;
                }

                // Loading spinner for data being fetched
                return createLoadingSpinner();
            }

            return ""; // Empty cell for non-BASIC cards
        }

        // Helper function for toggle switches
        function createToggleSwitch(account, type) {

            const isChecked = type === 'priority'
                ? glb_priorityCards.includes(account.account_token)
                : glb_excludedCards.includes(account.account_token);

            const toggleContainer = document.createElement('div');
            toggleContainer.style.cssText = 'display:flex; justify-content:center; align-items:center;';

            // Create the toggle
            const toggle = document.createElement('div');
            toggle.style.cssText = `
            display:inline-block; position:relative; width:36px; height:22px; 
            border-radius:11px; cursor:pointer; transition:background-color 0.3s ease; 
            box-shadow:0 1px 3px rgba(0,0,0,0.1) inset; 
            background-color:${isChecked ? (type === 'priority' ? 'var(--ios-blue)' : 'var(--ios-red)') : '#e9e9ea'};
            `;

            // Create the toggle knob
            const knob = document.createElement('div');
            knob.style.cssText = `
            position:absolute; width:18px; height:18px; border-radius:9px; 
            background-color:#ffffff; box-shadow:0 1px 3px rgba(0, 0, 0, 0.15), 0 1px 2px rgba(0, 0, 0, 0.1); 
            top:2px; left:${isChecked ? '16px' : '2px'}; transition:left 0.3s ease, transform 0.1s ease;
            `;

            // Add interactions
            toggle.addEventListener('mouseenter', () => knob.style.transform = 'scale(1.05)');
            toggle.addEventListener('mouseleave', () => knob.style.transform = 'scale(1)');
            toggle.addEventListener('mousedown', () => knob.style.transform = 'scale(0.95)');
            toggle.addEventListener('mouseup', () => knob.style.transform = 'scale(1.05)');

            // Add click handler
            toggle.addEventListener('click', () => {
                const newState = !isChecked;

                // Update the visual state
                knob.style.left = newState ? '16px' : '2px';
                toggle.style.backgroundColor = newState
                    ? (type === 'priority' ? 'var(--ios-blue)' : 'var(--ios-red)')
                    : '#e9e9ea';

                // Add animation effect
                knob.animate([
                    { transform: 'scale(0.9)' },
                    { transform: 'scale(1.1)' },
                    { transform: 'scale(1)' }
                ], { duration: 300, easing: 'ease-out' });

                // Update data state using account token
                if (type === 'priority') {
                    if (newState) {
                        if (!glb_priorityCards.includes(account.account_token)) {
                            glb_priorityCards.push(account.account_token);
                        }
                    } else {
                        glb_priorityCards = glb_priorityCards.filter(token => token !== account.account_token);
                    }
                    storage_manageData("set", storage_accToken, ["priorityCards"]);
                } else {
                    if (newState) {
                        if (!glb_excludedCards.includes(account.account_token)) {
                            glb_excludedCards.push(account.account_token);
                        }
                    } else {
                        glb_excludedCards = glb_excludedCards.filter(token => token !== account.account_token);
                    }
                    storage_manageData("set", storage_accToken, ["excludedCards"]);
                }
            });

            // Set tooltip
            toggle.title = type === 'priority' ? 'Priority Card (Enroll First)' : 'Exclude Card (Skip Enrollment)';

            // Assemble toggle
            toggle.appendChild(knob);
            toggleContainer.appendChild(toggle);

            return toggleContainer;
        }

        // Helper for status styles
        function getStatusStyle(status) {
            if (status === 'active') {
                return 'background-color:rgba(52, 199, 89, 0.15); color:var(--ios-green); border:1px solid rgba(52, 199, 89, 0.25);';
            } else if (status === 'canceled') {
                return 'background-color:rgba(255, 59, 48, 0.15); color:var(--ios-red); border:1px solid rgba(255, 59, 48, 0.25);';
            } else {
                return 'background-color:rgba(255, 149, 0, 0.15); color:var(--ios-orange); border:1px solid rgba(255, 149, 0, 0.25);';
            }
        }

        // Helper for loading spinner
        function createLoadingSpinner() {
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'loading-spinner';
            loadingSpinner.style.cssText = 'width:16px; height:16px; border:2px solid rgba(0, 122, 255, 0.2); border-top:2px solid var(--ios-blue); border-radius:50%; margin:0 auto; animation:spin 1s linear infinite;';

            // Add CSS animation if needed
            if (!document.querySelector('style#spinner-animation')) {
                const style = document.createElement('style');
                style.id = 'spinner-animation';
                style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
                document.head.appendChild(style);
            }

            return loadingSpinner;
        }

        // Define sortable columns
        const sortableKeys = [
            "cardIndex", "cardEnding", "embossed_name", "relationship",
            "account_setup_date", "account_status", "StatementBalance", "pending",
            "remainingStaBal", "eligibleOffers", "enrolledOffers"
        ];

        // Create and return the table
        const tableElement = ui_renderDataTable(headers, colWidths, filteredAccounts, cellRenderer, members_sortTable, sortableKeys);
        return tableElement;
    }

    // Enhanced render for the offer-on-card popup
    function members_showCardOffers(accountToken, offerType) {
        const existingOverlay = document.getElementById('offer-details-overlay');
        if (existingOverlay) existingOverlay.remove();

        const account = glb_account.find(acc => acc.account_token === accountToken);
        const displayNumber = account.cardEnding;

        // Create the overlay with enhanced blur effect
        const overlay = document.createElement('div');
        overlay.id = 'offer-details-overlay';
        overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0,0,0,0.4);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 10001;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: opacity 0.3s ease;
        `;

        // Modern popup container with enhanced styling
        const popup = document.createElement('div');
        popup.style.cssText = `
        background: #ffffff;
        border-radius: 16px;
        padding: 24px;
        width: 90%;
        max-width: 680px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 12px 32px rgba(0,0,0,0.2);
        position: relative;
        transform: translateY(20px);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
        `;

        // Card details section
        const cardDetailsSection = document.createElement('div');
        cardDetailsSection.style.marginBottom = '20px';

        if (account) {
            // Card info header
            const cardInfo = document.createElement('div');
            cardInfo.style.display = 'flex';
            cardInfo.style.alignItems = 'center';
            cardInfo.style.gap = '16px';
            cardInfo.style.marginBottom = '16px';

            // Card logo if available
            if (account.small_card_art && account.small_card_art !== 'N/A') {
                const cardLogo = document.createElement('img');
                cardLogo.src = account.small_card_art;
                cardLogo.alt = 'Card Logo';
                cardLogo.style.width = '60px';
                cardLogo.style.height = '60px';
                cardLogo.style.borderRadius = '8px';
                cardLogo.style.objectFit = 'contain';
                cardInfo.appendChild(cardLogo);
            }

            // Card details text
            const cardText = document.createElement('div');
            cardText.style.flex = '1';

            const cardTitle = document.createElement('div');
            cardTitle.textContent = account.description || 'Card';
            cardTitle.style.fontSize = '18px';
            cardTitle.style.fontWeight = '600';
            cardTitle.style.marginBottom = '4px';

            const cardNumber = document.createElement('div');
            cardNumber.textContent = `${displayNumber} - ${account.embossed_name || ''}`;
            cardNumber.style.fontSize = '15px';
            cardNumber.style.color = '#666';

            cardText.appendChild(cardTitle);
            cardText.appendChild(cardNumber);
            cardInfo.appendChild(cardText);

            cardDetailsSection.appendChild(cardInfo);
        }

        overlay.appendChild(popup);

        // Header section
        const topRow = document.createElement('div');
        topRow.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
    `;

        // Title with badge indicating offer type
        const headerTitle = document.createElement('div');
        headerTitle.style.display = 'flex';
        headerTitle.style.alignItems = 'center';
        headerTitle.style.gap = '10px';

        const titleLabel = document.createElement('h3');
        titleLabel.textContent = 'Card Offers';
        titleLabel.style.cssText = `
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
    color: #1c1c1e;
    `;

        const offerTypeBadge = document.createElement('span');
        offerTypeBadge.textContent = offerType === 'eligible' ? 'Eligible' : 'Enrolled';
        offerTypeBadge.style.fontSize = '13px';
        offerTypeBadge.style.fontWeight = '600';
        offerTypeBadge.style.padding = '4px 10px';
        offerTypeBadge.style.borderRadius = '12px';

        if (offerType === 'eligible') {
            offerTypeBadge.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
            offerTypeBadge.style.color = 'var(--ios-blue)';
            offerTypeBadge.style.border = '1px solid rgba(0, 122, 255, 0.2)';
        } else {
            offerTypeBadge.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
            offerTypeBadge.style.color = 'var(--ios-green)';
            offerTypeBadge.style.border = '1px solid rgba(52, 199, 89, 0.2)';
        }

        headerTitle.appendChild(titleLabel);
        headerTitle.appendChild(offerTypeBadge);

        // Close button with enhanced styling
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
    background: rgba(0,0,0,0.05);
    border: none;
    font-size: 1.5rem;
    color: #666;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    `;

        closeBtn.addEventListener('mouseover', () => {
            closeBtn.style.backgroundColor = 'rgba(0,0,0,0.1)';
            closeBtn.style.color = '#ff4444';
        });

        closeBtn.addEventListener('mouseout', () => {
            closeBtn.style.backgroundColor = 'rgba(0,0,0,0.05)';
            closeBtn.style.color = '#666';
        });

        closeBtn.addEventListener('click', () => {
            // Fade out animation
            popup.style.transform = 'translateY(20px)';
            popup.style.opacity = '0';
            overlay.style.opacity = '0';

            // Remove after animation completes
            setTimeout(() => {
                overlay.remove();
            }, 300);
        });

        topRow.appendChild(headerTitle);
        topRow.appendChild(closeBtn);

        // Content Area
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
    font-size: 14px;
    line-height: 1.6;
    `;

        // Determine relevant offers based on offerType and account token
        let relevantOffers = [];
        if (offerType === 'eligible') {
            relevantOffers = glb_offer.filter(offer =>
                Array.isArray(offer.eligibleCards) &&
                offer.eligibleCards.includes(accountToken)
            );
        } else if (offerType === 'enrolled') {
            relevantOffers = glb_offer.filter(offer =>
                Array.isArray(offer.enrolledCards) &&
                offer.enrolledCards.includes(accountToken)
            );
        }

        // Actions section (only for eligible offers)
        if (offerType === 'eligible' && relevantOffers.length > 0) {
            const actionsSection = document.createElement('div');
            actionsSection.style.marginBottom = '20px';

            const enrollAllBtn = document.createElement('button');
            enrollAllBtn.textContent = 'Enroll All Offers';
            enrollAllBtn.style.width = '100%';
            enrollAllBtn.style.padding = '12px';
            enrollAllBtn.style.borderRadius = '12px';
            enrollAllBtn.style.border = 'none';
            enrollAllBtn.style.backgroundColor = 'var(--ios-blue)';
            enrollAllBtn.style.color = '#fff';
            enrollAllBtn.style.fontSize = '15px';
            enrollAllBtn.style.fontWeight = '600';
            enrollAllBtn.style.cursor = 'pointer';
            enrollAllBtn.style.display = 'flex';
            enrollAllBtn.style.alignItems = 'center';
            enrollAllBtn.style.justifyContent = 'center';
            enrollAllBtn.style.gap = '8px';
            enrollAllBtn.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';
            enrollAllBtn.style.transition = 'all 0.2s ease';

            // Add icon to button
            enrollAllBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/>
        </svg>
        Enroll All Offers
        `;

            enrollAllBtn.addEventListener('mouseover', () => {
                enrollAllBtn.style.backgroundColor = '#0062CC';
                enrollAllBtn.style.transform = 'translateY(-2px)';
                enrollAllBtn.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.4)';
            });

            enrollAllBtn.addEventListener('mouseout', () => {
                enrollAllBtn.style.backgroundColor = 'var(--ios-blue)';
                enrollAllBtn.style.transform = 'translateY(0)';
                enrollAllBtn.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';
            });

            enrollAllBtn.addEventListener('click', async () => {
                // Change button to loading state
                const originalText = enrollAllBtn.innerHTML;
                enrollAllBtn.innerHTML = `
            <div class="loading-spinner" style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></div>
            Enrolling...
            `;
                enrollAllBtn.disabled = true;
                enrollAllBtn.style.opacity = '0.8';

                // Call batch enrollment function for this card
                try {
                    await api_batchEnrollOffers(null, accountToken);

                    // Update button to success state
                    enrollAllBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                Enrolled Successfully
                `;
                    enrollAllBtn.style.backgroundColor = 'var(--ios-green)';

                    // Close and refresh after delay
                    setTimeout(() => {
                        closeBtn.click();
                        ui_renderCurrentView();
                    }, 1500);
                } catch (err) {
                    // Show error state
                    enrollAllBtn.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                Error: Try Again
                `;
                    enrollAllBtn.style.backgroundColor = 'var(--ios-red)';

                    // Reset after delay
                    setTimeout(() => {
                        enrollAllBtn.innerHTML = originalText;
                        enrollAllBtn.disabled = false;
                        enrollAllBtn.style.opacity = '1';
                        enrollAllBtn.style.backgroundColor = 'var(--ios-blue)';
                    }, 2000);

                    console.error('Enrollment error:', err);
                }
            });

            actionsSection.appendChild(enrollAllBtn);
            contentDiv.appendChild(actionsSection);
        }

        // Offers list with styled cards
        const offersList = document.createElement('div');
        offersList.style.display = 'flex';
        offersList.style.flexDirection = 'column';
        offersList.style.gap = '12px';

        if (relevantOffers.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.style.textAlign = 'center';
            emptyState.style.padding = '30px 20px';
            emptyState.style.backgroundColor = 'rgba(0,0,0,0.02)';
            emptyState.style.borderRadius = '12px';

            const emptyIcon = document.createElement('div');
            emptyIcon.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
            `;
            emptyIcon.style.marginBottom = '16px';

            const emptyText = document.createElement('div');
            emptyText.textContent = `No ${offerType} offers found for this card.`;
            emptyText.style.fontSize = '15px';
            emptyText.style.color = '#666';

            emptyState.appendChild(emptyIcon);
            emptyState.appendChild(emptyText);
            offersList.appendChild(emptyState);
        } else {
            // Sort offers by name
            relevantOffers.sort((a, b) => a.name.localeCompare(b.name));

            relevantOffers.forEach(offer => {
                const offerCard = document.createElement('div');
                offerCard.style.padding = '14px';
                offerCard.style.borderRadius = '12px';
                offerCard.style.border = '1px solid rgba(0,0,0,0.08)';
                offerCard.style.display = 'flex';
                offerCard.style.gap = '14px';
                offerCard.style.backgroundColor = offer.favorite ? 'rgba(255, 149, 0, 0.05)' : 'white';
                offerCard.style.transition = 'all 0.2s ease';

                offerCard.addEventListener('mouseenter', () => {
                    offerCard.style.backgroundColor = offer.favorite ? 'rgba(255, 149, 0, 0.1)' : 'rgba(0,0,0,0.02)';
                    offerCard.style.transform = 'translateY(-2px)';
                    offerCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                });

                offerCard.addEventListener('mouseleave', () => {
                    offerCard.style.backgroundColor = offer.favorite ? 'rgba(255, 149, 0, 0.05)' : 'white';
                    offerCard.style.transform = 'translateY(0)';
                    offerCard.style.boxShadow = 'none';
                });

                // Offer logo
                if (offer.logo && offer.logo !== 'N/A') {
                    const logoContainer = document.createElement('div');
                    logoContainer.style.width = '48px';
                    logoContainer.style.height = '48px';
                    logoContainer.style.display = 'flex';
                    logoContainer.style.alignItems = 'center';
                    logoContainer.style.justifyContent = 'center';
                    logoContainer.style.flexShrink = '0';

                    const logo = document.createElement('img');
                    logo.src = offer.logo;
                    logo.alt = offer.name;
                    logo.style.maxWidth = '100%';
                    logo.style.maxHeight = '100%';
                    logo.style.borderRadius = '6px';

                    logoContainer.appendChild(logo);
                    offerCard.appendChild(logoContainer);
                }

                // Offer content
                const offerContent = document.createElement('div');
                offerContent.style.flex = '1';
                offerContent.style.minWidth = '0'; // Important for text truncation

                // Offer name with favorite indicator
                const nameRow = document.createElement('div');
                nameRow.style.display = 'flex';
                nameRow.style.alignItems = 'center';
                nameRow.style.gap = '6px';
                nameRow.style.marginBottom = '4px';

                if (offer.favorite) {
                    const starIcon = document.createElement('span');
                    starIcon.textContent = '★';
                    starIcon.style.color = '#ff9500';
                    starIcon.style.fontSize = '14px';
                    nameRow.appendChild(starIcon);
                }

                const offerName = document.createElement('div');
                offerName.textContent = offer.name;
                offerName.style.fontWeight = '600';
                offerName.style.fontSize = '15px';
                offerName.style.whiteSpace = 'nowrap';
                offerName.style.overflow = 'hidden';
                offerName.style.textOverflow = 'ellipsis';
                nameRow.appendChild(offerName);

                // Offer details
                const offerDetails = document.createElement('div');
                offerDetails.style.fontSize = '13px';
                offerDetails.style.color = '#666';
                offerDetails.style.lineHeight = '1.4';
                offerDetails.style.marginBottom = '8px';

                // Format description - truncate if too long
                const description = offer.short_description;
                if (description && description.length > 100) {
                    offerDetails.textContent = description.substring(0, 100) + '...';
                    offerDetails.title = description; // Show full text on hover
                } else {
                    offerDetails.textContent = description || 'No description available';
                }

                // Offer metrics
                const metricsRow = document.createElement('div');
                metricsRow.style.display = 'flex';
                metricsRow.style.gap = '8px';
                metricsRow.style.flexWrap = 'wrap';

                // Helper to create a metric badge
                function createBadge(label, value, color = 'rgba(0,0,0,0.7)') {
                    return ui_createBadge({
                        label: label,
                        value: value,
                        color: color,
                        size: 'medium'
                    });
                }

                // Add metrics if available
                const thresholdBadge = createBadge('Spend', offer.threshold, '#1c1c1e');
                const rewardBadge = createBadge('Reward', offer.reward, 'var(--ios-green)');
                const percentBadge = createBadge('Rate', offer.percentage, 'var(--ios-blue)');
                const expiryBadge = createBadge('Expires', util_formatDate(offer.expiry_date), 'var(--ios-orange)');

                if (thresholdBadge) metricsRow.appendChild(thresholdBadge);
                if (rewardBadge) metricsRow.appendChild(rewardBadge);
                if (percentBadge) metricsRow.appendChild(percentBadge);
                if (expiryBadge) metricsRow.appendChild(expiryBadge);

                // Assemble offer content
                offerContent.appendChild(nameRow);
                offerContent.appendChild(offerDetails);
                offerContent.appendChild(metricsRow);
                offerCard.appendChild(offerContent);

                // Action button - only for eligible offers
                if (offerType === 'eligible') {
                    const enrollButton = document.createElement('button');
                    enrollButton.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                    `;
                    enrollButton.title = 'Enroll in this offer';
                    enrollButton.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                    enrollButton.style.color = 'var(--ios-blue)';
                    enrollButton.style.border = 'none';
                    enrollButton.style.borderRadius = '50%';
                    enrollButton.style.width = '36px';
                    enrollButton.style.height = '36px';
                    enrollButton.style.display = 'flex';
                    enrollButton.style.alignItems = 'center';
                    enrollButton.style.justifyContent = 'center';
                    enrollButton.style.cursor = 'pointer';
                    enrollButton.style.alignSelf = 'center';
                    enrollButton.style.transition = 'all 0.2s ease';
                    enrollButton.style.flexShrink = '0';

                    enrollButton.addEventListener('mouseenter', () => {
                        enrollButton.style.backgroundColor = 'var(--ios-blue)';
                        enrollButton.style.color = 'white';
                        enrollButton.style.transform = 'scale(1.1)';
                    });

                    enrollButton.addEventListener('mouseleave', () => {
                        enrollButton.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                        enrollButton.style.color = 'var(--ios-blue)';
                        enrollButton.style.transform = 'scale(1)';
                    });

                    enrollButton.addEventListener('click', async (e) => {
                        e.stopPropagation();

                        enrollButton.innerHTML = `<div class="loading-spinner" style="width:14px;height:14px;border:2px solid rgba(0,122,255,0.3);border-top:2px solid var(--ios-blue);border-radius:50%;animation:spin 1s linear infinite;"></div>`;
                        enrollButton.style.pointerEvents = 'none';

                        try {
                            const res = await api_enrollInOffer(accountToken, offer.offerId);

                            if (res.result) {
                                // Enrollment successful
                                enrollButton.innerHTML = `
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                </svg>
                                `;
                                enrollButton.style.backgroundColor = 'var(--ios-green)';
                                enrollButton.style.color = 'white';

                                // Update offer data
                                const idx = offer.eligibleCards.indexOf(accountToken);
                                if (idx !== -1) offer.eligibleCards.splice(idx, 1);
                                if (!offer.enrolledCards.includes(accountToken)) {
                                    offer.enrolledCards.push(accountToken);
                                }

                                // Animate the card away after success
                                offerCard.style.transform = 'translateX(100%)';
                                offerCard.style.opacity = '0';

                                // Remove after animation
                                setTimeout(() => {
                                    offerCard.remove();

                                    // If no more offers, refresh the entire popup
                                    if (offersList.childElementCount === 0) {
                                        members_showCardOffers(accountToken, offerType);
                                    }
                                }, 500);
                            } else {
                                // Enrollment failed
                                enrollButton.innerHTML = `
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="15" y1="9" x2="9" y2="15"></line>
                                    <line x1="9" y1="9" x2="15" y2="15"></line>
                                </svg>
                                `;
                                enrollButton.style.backgroundColor = 'var(--ios-red)';
                                enrollButton.style.color = 'white';

                                // Reset after delay
                                setTimeout(() => {
                                    enrollButton.innerHTML = `
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                    </svg>
                                    `;
                                    enrollButton.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                                    enrollButton.style.color = 'var(--ios-blue)';
                                    enrollButton.style.pointerEvents = 'auto';
                                }, 2000);
                            }
                        } catch (err) {
                            console.error('Error enrolling offer:', err);

                            // Show error state
                            enrollButton.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            `;
                            enrollButton.style.backgroundColor = 'var(--ios-red)';
                            enrollButton.style.color = 'white';

                            // Reset after delay
                            setTimeout(() => {
                                enrollButton.innerHTML = `
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                </svg>
                                `;
                                enrollButton.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                                enrollButton.style.color = 'var(--ios-blue)';
                                enrollButton.style.pointerEvents = 'auto';
                            }, 2000);
                        }
                    });

                    offerCard.appendChild(enrollButton);
                }

                offersList.appendChild(offerCard);
            });
        }

        contentDiv.appendChild(offersList);

        popup.appendChild(topRow);
        popup.appendChild(cardDetailsSection);
        popup.appendChild(contentDiv);
        document.body.appendChild(overlay);

        // Animate in
        setTimeout(() => {
            popup.style.transform = 'translateY(0)';
            popup.style.opacity = '1';
        }, 10);
    }

    // Enhanced offers_renderPage with better structure
    function offers_renderPage() {
        const containerDiv = document.createElement('div');
        containerDiv.style.cssText = UI_STYLES.pageContainer;

        // Add components sequentially
        containerDiv.appendChild(offers_renderStatsBar());

        // Create tab navigation for current vs history
        const tabContainer = document.createElement('div');
        tabContainer.style.cssText = 'display:flex; margin-bottom:16px; background-color:rgba(255,255,255,0.6); border-radius:10px; padding:4px; border:1px solid var(--ios-border);';

        const currentTab = document.createElement('button');
        currentTab.textContent = 'Current Offers';
        currentTab.style.cssText = 'flex:1; padding:10px; border:none; border-radius:8px; background-color:var(--ios-blue); color:white; font-weight:500; cursor:pointer;';

        const historyTab = document.createElement('button');
        historyTab.textContent = 'Offer History';
        historyTab.style.cssText = 'flex:1; padding:10px; border:none; border-radius:8px; background-color:transparent; color:var(--ios-text-secondary); font-weight:500; cursor:pointer;';

        const displayContainer = document.createElement('div');
        displayContainer.id = 'offers-display-container';

        // Initialize with current offers view
        const displayMode = localStorage.getItem('amaxoffer_offers_display') || 'table';
        displayContainer.appendChild(displayMode === 'grid' ? offers_renderGridView() : offers_renderTableView());

        // Tab click handlers
        currentTab.addEventListener('click', () => {
            currentTab.style.backgroundColor = 'var(--ios-blue)';
            currentTab.style.color = 'white';
            historyTab.style.backgroundColor = 'transparent';
            historyTab.style.color = 'var(--ios-text-secondary)';

            displayContainer.innerHTML = '';
            displayContainer.appendChild(displayMode === 'grid' ? offers_renderGridView() : offers_renderTableView());
        });

        historyTab.addEventListener('click', () => {
            historyTab.style.backgroundColor = 'var(--ios-blue)';
            historyTab.style.color = 'white';
            currentTab.style.backgroundColor = 'transparent';
            currentTab.style.color = 'var(--ios-text-secondary)';

            displayContainer.innerHTML = '';
            displayContainer.appendChild(offers_renderHistoryView());
        });

        tabContainer.appendChild(currentTab);
        tabContainer.appendChild(historyTab);
        containerDiv.appendChild(tabContainer);
        containerDiv.appendChild(offers_renderSearchBar());
        containerDiv.appendChild(displayContainer);

        return containerDiv;
    }

    // Create a table for historical offers
    function offers_renderHistoryView() {
        const historyContainer = document.createElement('div');
        historyContainer.style.cssText = 'display:flex; flex-direction:column; gap:24px;';

        // Expired offers section
        const expiredSection = document.createElement('div');
        expiredSection.style.cssText = 'background:white; border-radius:12px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.08);';

        const expiredTitle = document.createElement('h3');
        expiredTitle.textContent = 'Expired Offers';
        expiredTitle.style.cssText = 'margin:0 0 16px 0; font-size:18px; font-weight:600; color:#333; display:flex; align-items:center; gap:8px;';
        expiredTitle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--ios-red)" opacity="0.8">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4-12H8v2h8V8zm0 4H8v2h8v-2z"/>
            </svg>
            Expired Offers (${glb_offer_expired.length})
        `;

        expiredSection.appendChild(expiredTitle);

        if (glb_offer_expired.length === 0) {
            const emptyExpired = document.createElement('div');
            emptyExpired.textContent = 'No expired offers tracked yet';
            emptyExpired.style.cssText = 'text-align:center; padding:20px; color:#888; background:rgba(0,0,0,0.02); border-radius:8px;';
            expiredSection.appendChild(emptyExpired);
        } else {
            expiredSection.appendChild(offers_renderHistoryTable(glb_offer_expired, 'expired'));
        }

        // Redeemed offers section
        const redeemedSection = document.createElement('div');
        redeemedSection.style.cssText = 'background:white; border-radius:12px; padding:20px; box-shadow:0 4px 12px rgba(0,0,0,0.08);';

        const redeemedTitle = document.createElement('h3');
        redeemedTitle.textContent = 'Redeemed Offers';
        redeemedTitle.style.cssText = 'margin:0 0 16px 0; font-size:18px; font-weight:600; color:#333; display:flex; align-items:center; gap:8px;';
        redeemedTitle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--ios-green)" opacity="0.8">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
            Redeemed Offers (${glb_offer_redeemed.length})
        `;

        redeemedSection.appendChild(redeemedTitle);

        if (glb_offer_redeemed.length === 0) {
            const emptyRedeemed = document.createElement('div');
            emptyRedeemed.textContent = 'No redeemed offers tracked yet';
            emptyRedeemed.style.cssText = 'text-align:center; padding:20px; color:#888; background:rgba(0,0,0,0.02); border-radius:8px;';
            redeemedSection.appendChild(emptyRedeemed);
        } else {
            redeemedSection.appendChild(offers_renderHistoryTable(glb_offer_redeemed, 'redeemed'));
        }

        historyContainer.appendChild(expiredSection);
        historyContainer.appendChild(redeemedSection);

        return historyContainer;
    }

    // Create a table for historical offers
    function offers_renderHistoryTable(offers, type) {
        const tableElement = document.createElement('table');
        tableElement.className = 'ios-table';
        tableElement.style.cssText = 'width:100%; border-collapse:separate; border-spacing:0; font-size:14px;';

        // Create headers based on type
        const thead = document.createElement('thead');
        thead.className = 'ios-table-head';

        const headerRow = document.createElement('tr');

        const headers = [
            { label: "Name", key: "name" },
            { label: type === 'expired' ? "Expired Date" : "Redeemed Date", key: type === 'expired' ? "expiredDate" : "redeemedDate" }
        ];

        // Add card column for redeemed offers
        if (type === 'redeemed') {
            headers.push({ label: "Redeemed Cards", key: "redeemedCards" });
        }

        // Create header cells
        headers.forEach(header => {
            const th = document.createElement('th');
            th.textContent = header.label;
            th.style.cssText = 'padding:12px 16px; text-align:left; border-bottom:1px solid rgba(0,0,0,0.1);';
            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        tableElement.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');

        // Sort by date descending (newest first)
        const sortedOffers = [...offers].sort((a, b) => {
            const dateKey = type === 'expired' ? 'expiredDate' : 'redeemedDate';
            return new Date(b[dateKey]) - new Date(a[dateKey]);
        });

        sortedOffers.forEach((offer, index) => {
            const row = document.createElement('tr');
            row.style.cssText = index % 2 === 0 ? 'background-color:white;' : 'background-color:rgba(0,0,0,0.02);';

            // Name cell
            const nameCell = document.createElement('td');
            nameCell.textContent = offer.name;
            nameCell.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05); font-weight:500;';
            row.appendChild(nameCell);

            // Date cell
            const dateCell = document.createElement('td');
            const dateKey = type === 'expired' ? 'expiredDate' : 'redeemedDate';
            const date = new Date(offer[dateKey]);
            dateCell.textContent = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            dateCell.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05);';
            row.appendChild(dateCell);

            // Add cards for redeemed offers
            if (type === 'redeemed' && offer.redeemedCards) {
                const cardsCell = document.createElement('td');
                cardsCell.style.cssText = 'padding:12px 16px; border-bottom:1px solid rgba(0,0,0,0.05);';

                offer.redeemedCards.forEach((card, i) => {
                    const cardBadge = document.createElement('span');
                    cardBadge.textContent = card;
                    cardBadge.style.cssText = 'display:inline-block; padding:3px 8px; background-color:rgba(0,0,0,0.05); border-radius:10px; margin-right:6px; margin-bottom:6px; font-size:13px;';
                    cardsCell.appendChild(cardBadge);

                    if (i < offer.redeemedCards.length - 1) {
                        cardsCell.appendChild(document.createTextNode(' '));
                    }
                });

                row.appendChild(cardsCell);
            }

            tbody.appendChild(row);
        });

        tableElement.appendChild(tbody);
        return tableElement;
    }

    // Optimized stats bar with calculation caching and efficient layout
    function offers_renderStatsBar() {
        const statsBar = document.createElement('div');
        statsBar.style.cssText = UI_STYLES.cardContainer + ' display:flex; flex-wrap:wrap; gap:16px; justify-content:space-between;';

        // Calculate stats once and reuse
        const stats = offers_calculateStats();

        // Helper for creating stat items
        const createStatItem = (label, value, icon, color, filterAction) => {
            const statItem = document.createElement('div');
            statItem.style.cssText = `display:flex; align-items:center; gap:10px; padding:10px 16px; background-color:rgba(${color}, 0.1); border-radius:10px; border:1px solid rgba(${color}, 0.2); min-width:150px; transition:all 0.2s ease; ${filterAction ? 'cursor:pointer;' : ''}`;

            if (filterAction) {
                statItem.addEventListener('mouseenter', () => {
                    statItem.style.transform = 'translateY(-2px)';
                    statItem.style.boxShadow = '0 4px 8px rgba(0,0,0,0.08)';
                });
                statItem.addEventListener('mouseleave', () => {
                    statItem.style.transform = 'translateY(0)';
                    statItem.style.boxShadow = 'none';
                });
                statItem.addEventListener('click', filterAction);
            }

            const iconElement = document.createElement('div');
            iconElement.innerHTML = icon;
            iconElement.style.color = `rgb(${color})`;

            const textContainer = document.createElement('div');
            textContainer.style.cssText = 'display:flex; flex-direction:column;';

            const valueElement = document.createElement('div');
            valueElement.textContent = value;
            valueElement.style.cssText = `font-size:18px; font-weight:600; color:rgb(${color});`;

            const labelElement = document.createElement('div');
            labelElement.textContent = label;
            labelElement.style.cssText = 'font-size:12px; color:var(--ios-text-secondary);';

            textContainer.appendChild(valueElement);
            textContainer.appendChild(labelElement);
            statItem.appendChild(iconElement);
            statItem.appendChild(textContainer);

            return statItem;
        };

        // Define all icons
        const ICONS = {
            TOTAL: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/></svg>`,
            FAVORITE: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="currentColor"/></svg>`,
            EXPIRING: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/></svg>`,
            ENROLLED: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/></svg>`,
            PENDING: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm1-10c-2.76 0-5 2.24-5 5h2c0-1.65 1.35-3 3-3s3 1.35 3 3c0 1.65-1.35 3-3 3v2c2.76 0 5-2.24 5-5s-2.24-5-5-5z" fill="currentColor"/></svg>`,
            ELIGIBLE: `<svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2s-2 .89-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm1.5-6c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v1h-3v-1z" fill="currentColor"/></svg>`
        };

        // Add all stats with click handlers
        statsBar.appendChild(createStatItem('Total Offers', stats.totalOffers, ICONS.TOTAL, '52, 152, 219', () => {
            offers_resetAllFilters();
            ui_renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Favorites', stats.favoriteOffers, ICONS.FAVORITE, '255, 149, 0', () => {
            offers_resetAllFilters();
            glb_filters.offerFav = true;
            ui_renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Expiring Soon', stats.expiringSoon, ICONS.EXPIRING, '244, 67, 54', () => {
            offers_resetAllFilters();
            glb_filters.customFilter = offers_expiringFilter();
            ui_renderCurrentView();
        }));

        // statsBar.appendChild(createStatItem('Fully Enrolled', stats.distinctFullyEnrolled, ICONS.ENROLLED, '88, 86, 214', () => {
        //     offers_resetAllFilters();
        //     glb_filters.enrollmentStatus = 'fully';
        //     ui_renderCurrentView();
        // }));

        statsBar.appendChild(createStatItem('Pending Enrollment', stats.distinctNotFullyEnrolled, ICONS.PENDING, '255, 204, 0', () => {
            offers_resetAllFilters();
            glb_filters.enrollmentStatus = 'pending';
            ui_renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Total Eligible', stats.totalEligible, ICONS.ELIGIBLE, '142, 142, 147', () => {
            offers_resetAllFilters();
            glb_filters.eligibleOnly = true;
            ui_renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Total Enrolled', stats.totalEnrolled, ICONS.TOTAL, '50, 173, 230', () => {
            offers_resetAllFilters();
            glb_filters.enrolledOnly = true;
            ui_renderCurrentView();
        }));

        return statsBar;
    }

    // Helper functions for offer stats
    function offers_calculateStats() {
        // Compute offer statistics
        const {
            distinctFullyEnrolled,
            distinctNotFullyEnrolled,
            totalEligible,
            totalEnrolled
        } = glb_offer.reduce((stats, offer) => {
            if (offer.category === "DEFAULT") return stats;
            const eligible = offer.eligibleCards?.length || 0;
            const enrolled = offer.enrolledCards?.length || 0;
            stats.totalEligible += eligible;
            stats.totalEnrolled += enrolled;
            if (eligible + enrolled > 0) {
                enrolled === (eligible + enrolled)
                    ? stats.distinctFullyEnrolled++
                    : stats.distinctNotFullyEnrolled++;
            }
            return stats;
        }, { distinctFullyEnrolled: 0, distinctNotFullyEnrolled: 0, totalEligible: 0, totalEnrolled: 0 });

        // Calculate other stats
        const totalOffers = glb_offer.length;
        const favoriteOffers = glb_offer.filter(offer => offer.favorite).length;

        // Calculate expiring soon
        const now = new Date();
        const twoWeeksFromNow = new Date(now);
        twoWeeksFromNow.setDate(now.getDate() + 14);
        const expiringSoon = glb_offer.filter(offer => {
            if (!offer.expiry_date || offer.expiry_date === 'N/A') return false;
            const expiryDate = new Date(offer.expiry_date);
            return !isNaN(expiryDate) && expiryDate > now && expiryDate <= twoWeeksFromNow;
        }).length;

        return {
            totalOffers,
            favoriteOffers,
            expiringSoon,
            distinctFullyEnrolled,
            distinctNotFullyEnrolled,
            totalEligible,
            totalEnrolled
        };
    }

    // Reset all filters
    function offers_resetAllFilters() {
        glb_filters.offerFav = false;
        glb_filters.offerMerchantSearch = '';
        glb_filters.offerCardEnding = '';
        glb_filters.enrollmentStatus = null;
        glb_filters.eligibleOnly = false;
        glb_filters.enrolledOnly = false;
        glb_filters.customFilter = null;
    }

    // Create expiring soon filter
    function offers_expiringFilter() {
        return (offer) => {
            if (!offer.expiry_date || offer.expiry_date === 'N/A') return false;
            const expiryDate = new Date(offer.expiry_date);
            const now = new Date();
            const twoWeeksFromNow = new Date(now);
            twoWeeksFromNow.setDate(now.getDate() + 30);
            return !isNaN(expiryDate) && expiryDate > now && expiryDate <= twoWeeksFromNow;
        };
    }

    // Enhanced search bar with better organization
    function offers_renderSearchBar() {
        const filterCard = document.createElement('div');
        filterCard.style.cssText = 'background:var(--ios-background); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); border-radius:14px; padding:16px 20px; box-shadow:0 4px 12px rgba(0,0,0,0.08); display:flex; gap:16px; flex-wrap:wrap; width:100%; box-sizing:border-box; border:1px solid var(--ios-border); margin-bottom:8px; align-items:center;';

        // Create left container with view toggle and enroll button
        const filterContainer = offers_Container_filter();
        filterCard.appendChild(filterContainer);

        // Create right container with search and reset
        const searchContainer = offers_Container_search();
        filterCard.appendChild(searchContainer);

        return filterCard;
    }

    // Create left filter container with controls
    function offers_Container_filter() {
        const filterContainer = document.createElement('div');
        filterContainer.style.cssText = 'display:flex; flex-wrap:wrap; gap:12px; flex:1; align-items:center;';

        // Add view mode toggle
        const viewModeToggle = createViewModeToggle();
        filterContainer.appendChild(viewModeToggle);

        // Add Enroll All button
        const enrollAllBtn = ui_createBtn_v2({
            label: 'Enroll All Offers',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>',
            onClick: async () => {
                try {
                    await api_batchEnrollOffers();
                    ui_renderCurrentView();
                } catch (e) {
                    console.error('Error enrolling all:', e);
                }
            },
            bgColor: 'var(--ios-green)',
            size: 'large',
            fullWidth: true,
            maxWidth: '200px'
        });

        filterContainer.appendChild(enrollAllBtn);
        return filterContainer;
    }

    // Create view mode toggle
    function createViewModeToggle() {
        const currentMode = localStorage.getItem('amaxoffer_offers_display') || 'table';

        const toggleContainer = document.createElement('div');
        toggleContainer.style.cssText = 'display:flex; border-radius:10px; overflow:hidden; border:1px solid var(--ios-border); background-color:rgba(250, 250, 250, 0.5);';

        // Table view button
        const tableBtn = document.createElement('button');
        tableBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"/>
        </svg>
        `;
        tableBtn.style.cssText = `padding:8px 12px; border:none; background-color:${currentMode === 'table' ? 'rgba(0, 122, 255, 0.1)' : 'transparent'}; color:${currentMode === 'table' ? 'var(--ios-blue)' : 'var(--ios-text-secondary)'}; cursor:pointer; transition:all 0.2s ease;`;

        // Grid view button
        const gridBtn = document.createElement('button');
        gridBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 3v8h8V3H3zm0 18h8v-8H3v8zm10 0h8v-8h-8v8zm8-18h-8v8h8V3z"/>
        </svg>
        `;
        gridBtn.style.cssText = `padding:8px 12px; border:none; background-color:${currentMode === 'grid' ? 'rgba(0, 122, 255, 0.1)' : 'transparent'}; color:${currentMode === 'grid' ? 'var(--ios-blue)' : 'var(--ios-text-secondary)'}; cursor:pointer; transition:all 0.2s ease;`;

        // Add event listeners
        tableBtn.addEventListener('click', () => updateViewMode('table', tableBtn, gridBtn));
        gridBtn.addEventListener('click', () => updateViewMode('grid', gridBtn, tableBtn));

        // Add hover effects
        const hoverEffect = (btn, mode) => {
            btn.addEventListener('mouseenter', () => {
                if (currentMode !== mode) {
                    btn.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                }
            });
            btn.addEventListener('mouseleave', () => {
                if (currentMode !== mode) {
                    btn.style.backgroundColor = 'transparent';
                }
            });
        };

        hoverEffect(tableBtn, 'table');
        hoverEffect(gridBtn, 'grid');

        toggleContainer.appendChild(tableBtn);
        toggleContainer.appendChild(gridBtn);
        return toggleContainer;
    }

    // Update view mode
    function updateViewMode(mode, activeBtn, inactiveBtn) {
        localStorage.setItem('amaxoffer_offers_display', mode);

        // Update button styles
        activeBtn.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
        activeBtn.style.color = 'var(--ios-blue)';
        inactiveBtn.style.backgroundColor = 'transparent';
        inactiveBtn.style.color = 'var(--ios-text-secondary)';

        // Update the display
        const container = document.getElementById('offers-display-container');
        if (container) {
            container.innerHTML = '';
            container.appendChild(mode === 'grid' ? offers_renderGridView() : offers_renderTableView());
        }
    }

    // Create search container
    function offers_Container_search() {
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'display:flex; gap:12px; align-items:center; flex-wrap:wrap; flex:1; justify-content:flex-end;';

        // Merchant search
        const merchantSearchContainer = document.createElement('div');
        merchantSearchContainer.style.cssText = 'position:relative; box-sizing:border-box; min-width:180px; max-width:300px; flex:1; box-shadow:0 1px 3px rgba(0, 0, 0, 0.03); border-radius:10px;';

        const merchantInput = document.createElement('input');
        merchantInput.className = 'ios-search-input';
        merchantInput.type = 'text';
        merchantInput.placeholder = 'Search merchants...';
        merchantInput.value = glb_filters.offerMerchantSearch || '';
        merchantInput.style.cssText = 'width:100%; padding:10px 32px 10px 12px; border-radius:10px; border:1px solid #e0e0e0; background-color:rgba(250, 250, 250, 0.8); font-size:14px; font-family:var(--ios-font);';

        const merchantSearchIcon = document.createElement('div');
        merchantSearchIcon.className = 'ios-search-icon';
        merchantSearchIcon.style.cssText = 'position:absolute; right:10px; top:50%; transform:translateY(-50%); opacity:0.6; color:var(--ios-blue); pointer-events:none;';
        merchantSearchIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
        </svg>
        `;

        merchantInput.addEventListener('input', util_debounce(() => {
            glb_filters.offerMerchantSearch = merchantInput.value.toLowerCase();
            ui_renderCurrentView();
        }, 300));

        merchantSearchContainer.appendChild(merchantInput);
        merchantSearchContainer.appendChild(merchantSearchIcon);
        searchContainer.appendChild(merchantSearchContainer);

        // Card ending search
        const cardSearchContainer = document.createElement('div');
        cardSearchContainer.style.cssText = 'position:relative; box-sizing:border-box; min-width:150px; max-width:200px; flex:0.7; box-shadow:0 1px 3px rgba(0, 0, 0, 0.03); border-radius:10px;';

        const cardInput = document.createElement('input');
        cardInput.className = 'ios-search-input';
        cardInput.type = 'text';
        cardInput.placeholder = 'Card ending...';
        cardInput.value = glb_filters.offerCardEnding || '';
        cardInput.style.cssText = 'width:100%; padding:10px 32px 10px 12px; border-radius:10px; border:1px solid #e0e0e0; background-color:rgba(250, 250, 250, 0.8); font-size:14px; font-family:var(--ios-font);';

        const cardSearchIcon = document.createElement('div');
        cardSearchIcon.className = 'ios-search-icon';
        cardSearchIcon.style.cssText = 'position:absolute; right:10px; top:50%; transform:translateY(-50%); opacity:0.6; color:var(--ios-blue); pointer-events:none;';
        cardSearchIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="2" y="5" width="20" height="14" rx="2"/>
            <line x1="2" y1="10" x2="22" y2="10"/>
        </svg>
        `;

        cardInput.addEventListener('input', util_debounce(() => {
            glb_filters.offerCardEnding = cardInput.value;
            ui_renderCurrentView();
        }, 300));

        cardSearchContainer.appendChild(cardInput);
        cardSearchContainer.appendChild(cardSearchIcon);
        searchContainer.appendChild(cardSearchContainer);

        // Reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Filters';
        resetButton.style.cssText = 'padding:10px 16px; border-radius:10px; border:none; background-color:rgba(142, 142, 147, 0.1); color:var(--ios-text-secondary); font-size:13px; font-weight:500; cursor:pointer; transition:all 0.2s ease; display:flex; align-items:center; gap:8px;';

        const resetIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        resetIcon.setAttribute('width', '16');
        resetIcon.setAttribute('height', '16');
        resetIcon.setAttribute('viewBox', '0 0 24 24');
        resetIcon.setAttribute('fill', 'none');
        resetIcon.setAttribute('stroke', 'currentColor');
        resetIcon.setAttribute('stroke-width', '2');
        resetIcon.setAttribute('stroke-linecap', 'round');
        resetIcon.setAttribute('stroke-linejoin', 'round');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M3 12h18M3 6h18M3 18h18');
        resetIcon.appendChild(path);
        resetButton.prepend(resetIcon);

        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.2)';
        });

        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.1)';
        });

        resetButton.addEventListener('click', () => {
            // Reset all filters
            merchantInput.value = '';
            cardInput.value = '';
            offers_resetAllFilters();
            ui_renderCurrentView();
        });

        searchContainer.appendChild(resetButton);
        return searchContainer;
    }


    // Optimized filter offers
    function offers_filterOffersList() {
        return glb_offer.filter(o => {
            // Check favorite filter
            if (glb_filters.offerFav && !o.favorite) return false;

            // Check merchant search
            if (glb_filters.offerMerchantSearch && !o.name.toLowerCase().includes(glb_filters.offerMerchantSearch)) return false;

            // Check card ending filter
            if (glb_filters.offerCardEnding) {
                const eligible = Array.isArray(o.eligibleCards) && o.eligibleCards.includes(glb_filters.offerCardEnding);
                const enrolled = Array.isArray(o.enrolledCards) && o.enrolledCards.includes(glb_filters.offerCardEnding);
                if (!eligible && !enrolled) return false;
            }

            // Check enrollment status filters
            if (glb_filters.enrollmentStatus === 'fully') {
                const eligible = o.eligibleCards?.length || 0;
                const enrolled = o.enrolledCards?.length || 0;
                if (eligible + enrolled === 0 || enrolled !== eligible + enrolled) return false;
            }

            if (glb_filters.enrollmentStatus === 'pending') {
                const eligible = o.eligibleCards?.length || 0;
                const enrolled = o.enrolledCards?.length || 0;
                if (eligible + enrolled === 0 || enrolled === eligible + enrolled) return false;
            }

            if (glb_filters.eligibleOnly) {
                if ((o.eligibleCards?.length || 0) === 0) return false;
            }

            if (glb_filters.enrolledOnly) {
                if ((o.enrolledCards?.length || 0) === 0) return false;
            }

            // Check custom filter for expiring soon
            if (glb_filters.customFilter && typeof glb_filters.customFilter === 'function') {
                if (!glb_filters.customFilter(o)) return false;
            }

            return true;
        });
    }


    // Renderer for offers table (optimizing cell creation)
    function offers_renderTableView() {
        // Filter offers based on search criteria
        const filteredOffers = offers_filterOffersList();

        const headers = [
            { label: "★", key: "favorite" },
            { label: "Logo", key: "logo" },
            { label: "Offer", key: "name" },
            { label: "Type", key: "achievement_type" },
            { label: "Category", key: "category" },
            { label: "Expiry", key: "expiry_date" },
            { label: "Usage", key: "redemption_types" },
            { label: "Description", key: "short_description" },
            { label: "Threshold", key: "threshold" },
            { label: "Reward", key: "reward" },
            { label: "Percent", key: "percentage" },
            { label: "Eligible", key: "eligibleCards" },
            { label: "Enrolled", key: "enrolledCards" }
        ];

        const colWidths = {
            favorite: "40px", logo: "70px", name: "180px", achievement_type: "70px",
            category: "90px", expiry_date: "110px", redemption_types: "80px",
            short_description: "230px", threshold: "90px", reward: "90px",
            percentage: "80px", eligibleCards: "80px", enrolledCards: "80px"
        };

        // Check if we have any offers after filtering
        if (filteredOffers.length === 0) {
            const container = document.createElement('div');
            return ui_createEmptyState(container, {
                title: 'No Offers Found',
                message: glb_filters.offerFav ? 'No favorite offers found' :
                    (glb_filters.offerMerchantSearch ? `No offers match "${glb_filters.offerMerchantSearch}"` : 'No offers available')
            });
        }

        // Create cell handlers for cleaner code organization
        const cellHandlers = {
            favorite: (offer) => {
                const starBtn = document.createElement('button');
                starBtn.innerHTML = offer.favorite ?
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff9500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' :
                    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
                starBtn.style.cssText = 'background:none; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; margin:0 auto; padding:5px; border-radius:50%; transition:all 0.2s ease;';

                starBtn.addEventListener('mouseenter', () => {
                    starBtn.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    starBtn.style.transform = 'scale(1.1)';
                });

                starBtn.addEventListener('mouseleave', () => {
                    starBtn.style.backgroundColor = 'transparent';
                    starBtn.style.transform = 'scale(1)';
                });

                starBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    offer.favorite = !offer.favorite;
                    starBtn.innerHTML = offer.favorite ?
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff9500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' :
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';

                    // Save to storage
                    storage_manageData("set", storage_accToken, ["offer"]);

                    // If favorite filter is on, we need to re-render
                    if (glb_filters.offerFav) {
                        ui_renderCurrentView();
                    }
                });

                return starBtn;
            },

            logo: (offer) => {
                if (offer.logo && offer.logo !== "N/A") {
                    const imgContainer = document.createElement('div');
                    imgContainer.style.cssText = 'display:flex; justify-content:center; align-items:center; height:50px;';

                    const img = document.createElement('img');
                    img.src = offer.logo;
                    img.alt = "Offer Logo";
                    img.style.cssText = 'max-width:50px; max-height:50px; border-radius:6px; transition:transform 0.2s ease;';

                    imgContainer.addEventListener('mouseenter', () => img.style.transform = 'scale(1.15)');
                    imgContainer.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');

                    imgContainer.appendChild(img);
                    return imgContainer;
                }
                return 'N/A';
            },

            name: (offer) => {
                const nameContainer = document.createElement('div');
                nameContainer.style.cssText = 'max-width:170px; font-weight:600; font-size:14px; color:var(--ios-text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; padding:8px 4px;';
                nameContainer.textContent = offer.name;
                nameContainer.title = offer.name;
                return nameContainer;
            },

            achievement_type: (offer) => {
                const achievementType = offer.achievement_type;
                const achievementDiv = document.createElement('div');

                if (achievementType === "STATEMENT_CREDIT") {
                    achievementDiv.textContent = "Cash";
                    achievementDiv.style.color = '#2e7d32';
                } else if (achievementType === "MEMBERSHIP_REWARDS") {
                    achievementDiv.textContent = "MR";
                    achievementDiv.style.color = '#1976d2';
                } else {
                    achievementDiv.textContent = achievementType;
                }

                achievementDiv.style.fontWeight = '500';
                achievementDiv.style.fontSize = '13px';
                return achievementDiv;
            },

            category: (offer) => {
                if (offer.category && offer.category !== "N/A") {
                    const cat = offer.category.toString().toLowerCase().trim();
                    const categoryDiv = document.createElement('div');
                    categoryDiv.style.cssText = 'display:flex; align-items:center; justify-content:center; gap:6px;';

                    // Map categories to icons and colors
                    const categoryMap = {
                        "default": { icon: "🔰", color: "#9e9e9e" },
                        "dining": { icon: "🍽️", color: "#d32f2f" },
                        "entertainment": { icon: "🎭", color: "#7b1fa2" },
                        "services": { icon: "⚙️", color: "#616161" },
                        "shopping": { icon: "🛍️", color: "#1976d2" },
                        "travel": { icon: "✈️", color: "#0288d1" }
                    };

                    const config = categoryMap[cat] || { icon: "•", color: "#757575" };

                    const badge = document.createElement('span');
                    badge.textContent = config.icon;

                    const label = document.createElement('span');
                    label.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                    label.style.color = config.color;
                    label.style.fontSize = '13px';

                    categoryDiv.appendChild(badge);
                    categoryDiv.appendChild(label);
                    return categoryDiv;
                }
                return 'N/A';
            },

            redemption_types: (offer) => {
                if (offer.redemption_types && offer.redemption_types !== "N/A") {
                    let parts = offer.redemption_types.toString().split(",");
                    const iconsDiv = document.createElement('div');
                    iconsDiv.style.cssText = 'display:flex; justify-content:center; gap:8px;';

                    parts.forEach(val => {
                        let trimmed = val.trim().toLowerCase();
                        const icon = document.createElement('span');
                        icon.style.cssText = 'display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:50%; background-color:rgba(0,0,0,0.05);';

                        if (trimmed.includes("instore")) {
                            icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2">
                            <path d="M3 3h18v7H3z"/>
                            <path d="M21 10v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10"/>
                            <path d="M11 14h.01M6 14h.01M16 14h.01M4 11v-1h16v1"/>
                        </svg>`;
                            icon.title = "In-Store";
                        } else if (trimmed.includes("online")) {
                            icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4caf50" stroke-width="2">
                            <path d="M12 22s8-4 8-10V4l-8-2-8 2v8c0 6 8 10 8 10z"/>
                        </svg>`;
                            icon.title = "Online";
                        } else {
                            icon.textContent = trimmed.toUpperCase().slice(0, 1);
                            icon.title = trimmed;
                        }

                        iconsDiv.appendChild(icon);
                    });
                    return iconsDiv;
                }
                return "N/A";
            },

            expiry_date: (offer) => {
                if (offer.expiry_date && offer.expiry_date !== 'N/A') {
                    const d = new Date(offer.expiry_date);
                    if (!isNaN(d)) {
                        const now = new Date();
                        const daysUntilExpiry = Math.floor((d - now) / (1000 * 60 * 60 * 24));

                        const expiryContainer = document.createElement('div');
                        expiryContainer.style.cssText = 'display:flex; flex-direction:column; align-items:center;';

                        const dateSpan = document.createElement('span');
                        dateSpan.textContent = util_formatDate(offer.expiry_date);
                        dateSpan.style.fontSize = '13px';

                        const daysSpan = document.createElement('span');

                        if (daysUntilExpiry < 0) {
                            daysSpan.textContent = 'Expired';
                            daysSpan.style.color = 'var(--ios-red)';
                        } else if (daysUntilExpiry <= 30) {
                            daysSpan.textContent = `${daysUntilExpiry} days left`;
                            daysSpan.style.color = 'var(--ios-orange)';
                        } else {
                            daysSpan.textContent = `${daysUntilExpiry} days left`;
                            daysSpan.style.color = 'var(--ios-gray)';
                            daysSpan.style.fontSize = '11px';
                        }

                        expiryContainer.appendChild(dateSpan);
                        expiryContainer.appendChild(daysSpan);
                        return expiryContainer;
                    }
                    return 'N/A';
                }
                return 'N/A';
            },

            short_description: (offer) => {
                const descContainer = document.createElement('div');
                descContainer.style.cssText = 'font-size:13px; color:var(--ios-text-secondary); max-width:220px; max-height:60px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; line-height:1.3;';
                descContainer.textContent = offer.short_description || 'No description available';
                descContainer.title = offer.short_description;
                return descContainer;
            },

            threshold: (offer) => renderFormattedValue(offer.threshold, '#1c1c1e'),
            reward: (offer) => renderFormattedValue(offer.reward, 'var(--ios-green)'),
            percentage: (offer) => renderFormattedValue(offer.percentage, 'var(--ios-blue)'),

            eligibleCards: (offer) => renderCardsCountBadge(offer, 'eligibleCards'),
            enrolledCards: (offer) => renderCardsCountBadge(offer, 'enrolledCards')
        };

        // Helper function for formatted values
        function renderFormattedValue(value, color) {
            if (value && value !== 'N/A') {
                const valueDiv = document.createElement('div');
                valueDiv.style.cssText = `font-variant-numeric:tabular-nums; font-weight:600; text-align:center; color:${color};`;
                valueDiv.textContent = value;
                return valueDiv;
            }
            return 'N/A';
        }

        // Helper function for card count badges
        function renderCardsCountBadge(offer, key) {
            const cardTokens = Array.isArray(offer[key]) ? offer[key] : [];
            const count = cardTokens.length;

            const container = document.createElement('div');
            container.style.cssText = 'height:32px; display:flex; align-items:center; justify-content:center;';

            if (count > 0) {
                const isEligible = key === 'eligibleCards';
                const btn = document.createElement('button');
                btn.className = isEligible ? 'eligible-badge' : 'enrolled-badge';

                const bgColor = isEligible ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.1)';
                const textColor = isEligible ? 'var(--ios-blue)' : 'var(--ios-green)';
                const borderColor = isEligible ? 'rgba(0, 122, 255, 0.2)' : 'rgba(52, 199, 89, 0.2)';

                btn.style.cssText = `
                border-radius:16px; background-color:${bgColor}; color:${textColor}; 
                border:1px solid ${borderColor}; padding:5px 12px; font-weight:600; 
                font-size:13px; cursor:pointer; transition:all 0.2s ease; display:flex; 
                align-items:center; justify-content:center; gap:4px;
                `;

                // Add icon based on type
                if (isEligible) {
                    btn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2">
                        <path d="M20 12v6M16 20h8M4 20h2M14 4h6M20 8V4M4 4h2M4 16h2M4 12h2M4 8h2"/>
                        <circle cx="10" cy="12" r="8" stroke-dasharray="2 2"/>
                    </svg>
                    ${count}
                    `;
                } else {
                    btn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${textColor}" stroke-width="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <path d="M22 4L12 14.01l-3-3"/>
                    </svg>
                    ${count}
                    `;
                }

                btn.addEventListener('mouseover', () => {
                    btn.style.transform = 'translateY(-2px)';
                    btn.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                });

                btn.addEventListener('mouseout', () => {
                    btn.style.transform = 'translateY(0)';
                    btn.style.boxShadow = 'none';
                });

                btn.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent row click
                    offers_showEnrollment(offer.offerId);
                });

                container.appendChild(btn);
            } else {
                // Zero count indicator
                const emptySpan = document.createElement('span');
                emptySpan.textContent = '0';
                emptySpan.style.cssText = 'color:rgba(0,0,0,0.3);';
                container.appendChild(emptySpan);
            }

            return container;
        }

        // Define cell renderer with handler pattern
        const cellRenderer = (offer, headerItem) => {
            const key = headerItem.key;
            return cellHandlers[key] ? cellHandlers[key](offer) : (offer[key] || 'N/A');
        };

        // Define sortable columns
        const sortableKeys = [
            "favorite", "name", "achievement_type", "category",
            "expiry_date", "threshold", "reward", "percentage",
            "eligibleCards", "enrolledCards"
        ];

        // Use the improved ui_renderDataTable function
        const tableElement = ui_renderDataTable(headers, colWidths, filteredOffers, cellRenderer, offers_sortTable, sortableKeys);

        // Apply required styling directly to the table
        tableElement.style.cssText = 'font-size:13px; border-collapse:separate; border-spacing:0; background-color:#ffffff; border-radius:var(--ios-radius); overflow:hidden; width:100%; box-shadow:none; border:1px solid rgba(60, 60, 67, 0.12);';

        // Make rows clickable to open enrollment modal
        setTimeout(() => {
            const rows = tableElement.querySelectorAll('tbody tr');
            rows.forEach((row, index) => {
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => {
                    if (index < filteredOffers.length) {
                        offers_showEnrollment(filteredOffers[index].offerId);
                    }
                });
            });
        }, 0);

        return tableElement;
    }

    // Optimized grid view renderer
    function offers_renderGridView() {
        // Filter offers
        const filteredOffers = offers_filterOffersList();

        // Create container
        const gridContainer = document.createElement('div');
        gridContainer.style.cssText = 'display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:20px; width:100%; margin-top:16px;';

        // Check for empty state
        if (filteredOffers.length === 0) {
            return ui_createEmptyState(gridContainer);
        }

        // Create a card for each offer
        filteredOffers.forEach(offer => {
            const card = offers_createGridCard(offer);
            gridContainer.appendChild(card);
        });

        return gridContainer;
    }

    // Helper to create each offer card
    function offers_createGridCard(offer) {
        const card = document.createElement('div');
        card.className = 'offer-card';
        card.style.cssText = `background-color:white; border-radius:16px; box-shadow:0 4px 12px rgba(0,0,0,0.08); overflow:hidden; transition:all 0.3s ease; border:${offer.favorite ? '2px solid rgba(255, 149, 0, 0.5)' : '1px solid rgba(0,0,0,0.08)'}; display:flex; flex-direction:column; height:100%;`;

        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-6px)';
            card.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        });

        // Card components
        const cardHeader = offers_createCardHeader(offer);
        const cardBody = offers_createCardBody(offer);
        const cardFooter = offers_createCardFooter(offer);

        card.appendChild(cardHeader);
        card.appendChild(cardBody);
        card.appendChild(cardFooter);

        // Make entire card clickable
        card.addEventListener('click', () => {
            offers_showEnrollment(offer.offerId);
        });

        return card;
    }

    // Create card header with merchant logo and favorite button
    function offers_createCardHeader(offer) {
        const cardHeader = document.createElement('div');
        cardHeader.style.cssText = 'padding:16px; display:flex; align-items:center; border-bottom:1px solid rgba(0,0,0,0.04);';

        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.style.cssText = 'width:48px; height:48px; background-color:rgba(0,0,0,0.03); border-radius:8px; display:flex; align-items:center; justify-content:center; margin-right:12px; flex-shrink:0;';

        if (offer.logo && offer.logo !== 'N/A') {
            const logo = document.createElement('img');
            logo.src = offer.logo;
            logo.alt = offer.name;
            logo.style.cssText = 'max-width:80%; max-height:80%;';
            logoContainer.appendChild(logo);
        } else {
            // Fallback to first letter of merchant name
            const logoText = document.createElement('div');
            logoText.textContent = offer.name.charAt(0).toUpperCase();
            logoText.style.cssText = 'font-size:24px; font-weight:600; color:rgba(0,0,0,0.7);';
            logoContainer.appendChild(logoText);
        }

        // Merchant name and category
        const nameContainer = document.createElement('div');
        nameContainer.style.cssText = 'flex:1; overflow:hidden;';

        const nameRow = document.createElement('div');
        nameRow.style.cssText = 'display:flex; align-items:center; gap:6px; margin-bottom:4px;';

        if (offer.favorite) {
            const starIcon = document.createElement('span');
            starIcon.textContent = '★';
            starIcon.style.cssText = 'color:#ff9500; font-size:14px;';
            nameRow.appendChild(starIcon);
        }

        const merchantName = document.createElement('div');
        merchantName.textContent = offer.name;
        merchantName.style.cssText = 'font-weight:600; font-size:16px; color:#1c1c1e; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;';
        nameRow.appendChild(merchantName);
        nameContainer.appendChild(nameRow);

        // Add category badge if available
        if (offer.category && offer.category !== 'N/A') {
            const categoryBadge = document.createElement('div');
            categoryBadge.textContent = offer.category;
            categoryBadge.style.cssText = 'font-size:11px; color:rgba(0,0,0,0.5); background-color:rgba(0,0,0,0.05); padding:2px 6px; border-radius:4px; display:inline-block; margin-top:4px;';
            nameContainer.appendChild(categoryBadge);
        }

        // Favorite toggle button
        const favButton = document.createElement('button');
        favButton.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="${offer.favorite ? '#ff9500' : 'none'}" 
             stroke="${offer.favorite ? '#ff9500' : '#888'}" stroke-width="2">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        `;
        favButton.style.cssText = 'background:none; border:none; cursor:pointer; padding:6px; border-radius:50%; display:flex; align-items:center; justify-content:center; transition:all 0.2s ease;';

        favButton.addEventListener('mouseenter', () => {
            favButton.style.backgroundColor = 'rgba(0,0,0,0.05)';
            favButton.style.transform = 'scale(1.1)';
        });

        favButton.addEventListener('mouseleave', () => {
            favButton.style.backgroundColor = 'transparent';
            favButton.style.transform = 'scale(1)';
        });

        favButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click
            offer.favorite = !offer.favorite;

            // Update star icon
            favButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${offer.favorite ? '#ff9500' : 'none'}" 
                 stroke="${offer.favorite ? '#ff9500' : '#888'}" stroke-width="2">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            `;

            // Update card border
            card.style.border = offer.favorite ? '2px solid rgba(255, 149, 0, 0.5)' : '1px solid rgba(0,0,0,0.08)';

            // Save to storage
            storage_manageData("set", storage_accToken, ["offer"]);

            // If favorite filter is on, we need to re-render
            if (glb_filters.offerFav) {
                ui_renderCurrentView();
            }
        });

        // Assemble header
        cardHeader.appendChild(logoContainer);
        cardHeader.appendChild(nameContainer);
        cardHeader.appendChild(favButton);

        return cardHeader;
    }

    // Create card body with offer details
    function offers_createCardBody(offer) {
        const cardBody = document.createElement('div');
        cardBody.style.cssText = 'padding:16px; flex:1; display:flex; flex-direction:column;';

        // Offer description
        const description = document.createElement('div');
        description.style.cssText = 'font-size:14px; color:#4a4a4a; margin-bottom:16px; flex:1; line-height:1.5;';

        // Truncate description if too long
        if (offer.short_description && offer.short_description.length > 120) {
            description.textContent = offer.short_description.substring(0, 120) + '...';
            description.title = offer.short_description;
        } else {
            description.textContent = offer.short_description || 'No description available';
        }

        // Offer metrics grid with reusable component
        const metricsGrid = document.createElement('div');
        metricsGrid.style.cssText = 'display:grid; grid-template-columns:repeat(2, 1fr); gap:12px; margin-bottom:16px;';

        // Helper for metric tiles
        const createMetricTile = (label, value, iconSvg) => {
            if (!value || value === 'N/A') return null;

            const tile = document.createElement('div');
            tile.style.cssText = 'background-color:rgba(0,0,0,0.02); border-radius:8px; padding:10px; display:flex; align-items:center;';

            const icon = document.createElement('div');
            icon.innerHTML = iconSvg;
            icon.style.cssText = 'margin-right:8px; color:var(--ios-blue);';

            const textContent = document.createElement('div');

            const labelEl = document.createElement('div');
            labelEl.textContent = label;
            labelEl.style.cssText = 'font-size:11px; color:rgba(0,0,0,0.5); margin-bottom:2px;';

            const valueEl = document.createElement('div');
            valueEl.textContent = value;
            valueEl.style.cssText = 'font-size:14px; font-weight:600; color:#1c1c1e;';

            textContent.appendChild(labelEl);
            textContent.appendChild(valueEl);

            tile.appendChild(icon);
            tile.appendChild(textContent);

            return tile;
        };

        // Metric icons
        const icons = {
            threshold: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M2 20h20M6 16V4M10 16V8M14 16v-4M18 16V4"/>
        </svg>`,
            reward: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v6M12 18v4M4.93 10.93l4.24 4.24M14.83 8.93l4.24-4.24M3 18h18M3 6h18"/>
        </svg>`,
            percent: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 5L5 19M9 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM15 15a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
        </svg>`,
            expiry: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
        </svg>`
        };

        // Add available metrics
        const tiles = [
            createMetricTile('Spend', offer.threshold, icons.threshold),
            createMetricTile('Reward', offer.reward, icons.reward),
            createMetricTile('Percent', offer.percentage, icons.percent),
            createMetricTile('Expires', util_formatDate(offer.expiry_date), icons.expiry)
        ];

        tiles.forEach(tile => {
            if (tile) metricsGrid.appendChild(tile);
        });

        // Assemble body
        cardBody.appendChild(description);
        cardBody.appendChild(metricsGrid);

        return cardBody;
    }

    // Create card footer with eligible/enrolled cards
    function offers_createCardFooter(offer) {
        const cardFooter = document.createElement('div');
        cardFooter.style.cssText = 'padding:16px; border-top:1px solid rgba(0,0,0,0.04); display:flex; justify-content:space-between; align-items:center;';

        // Count eligible and enrolled cards
        const eligibleCount = Array.isArray(offer.eligibleCards) ? offer.eligibleCards.length : 0;
        const enrolledCount = Array.isArray(offer.enrolledCards) ? offer.enrolledCards.length : 0;

        // Helper for badge creation
        const createCountBadge = (count, label, color, iconSvg) => {
            const badge = document.createElement('div');
            badge.style.cssText = 'display:flex; align-items:center; gap:8px;';

            const icon = document.createElement('div');
            icon.innerHTML = iconSvg;
            icon.style.color = color;

            const countContainer = document.createElement('div');

            const countValue = document.createElement('div');
            countValue.textContent = count;
            countValue.style.cssText = `font-weight:600; font-size:16px; color:${count > 0 ? color : 'rgba(0,0,0,0.3)'};`;

            const countLabel = document.createElement('div');
            countLabel.textContent = label;
            countLabel.style.cssText = 'font-size:11px; color:rgba(0,0,0,0.5);';

            countContainer.appendChild(countValue);
            countContainer.appendChild(countLabel);

            badge.appendChild(icon);
            badge.appendChild(countContainer);

            return badge;
        };

        // Badge icons
        const eligibleIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 12v6M16 20h8M4 20h2M14 4h6M20 8V4M4 4h2M4 16h2M4 12h2M4 8h2"/>
            <circle cx="10" cy="12" r="8" stroke-dasharray="2 2"/>
        </svg>
        `;

        const enrolledIcon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <path d="M22 4L12 14.01l-3-3"/>
        </svg>
        `;

        // Create badges
        const eligibleBadge = createCountBadge(eligibleCount, 'Eligible', 'var(--ios-blue)', eligibleIcon);
        const enrolledBadge = createCountBadge(enrolledCount, 'Enrolled', 'var(--ios-green)', enrolledIcon);

        // Add click handlers
        if (eligibleCount > 0) {
            eligibleBadge.style.cursor = 'pointer';
            eligibleBadge.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                offers_showEnrollment(offer.offerId);
            });

            eligibleBadge.addEventListener('mouseenter', () => {
                eligibleBadge.style.transform = 'scale(1.05)';
            });

            eligibleBadge.addEventListener('mouseleave', () => {
                eligibleBadge.style.transform = 'scale(1)';
            });
        }

        if (enrolledCount > 0) {
            enrolledBadge.style.cursor = 'pointer';
            enrolledBadge.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click
                offers_showEnrollment(offer.offerId);
            });

            enrolledBadge.addEventListener('mouseenter', () => {
                enrolledBadge.style.transform = 'scale(1.05)';
            });

            enrolledBadge.addEventListener('mouseleave', () => {
                enrolledBadge.style.transform = 'scale(1)';
            });
        }

        // Add badges to footer
        cardFooter.appendChild(eligibleBadge);
        cardFooter.appendChild(enrolledBadge);

        return cardFooter;
    }

    // Enhanced enrollment card modal
    function offers_showEnrollment(offerId) {
        // Get offer data
        const offer = glb_offer.find(o => o.offerId === offerId);

        if (!offer) {
            console.error('Offer not found for ID:', offerId);
            return;
        }

        // Remove existing overlay
        const overlayId = 'offer-details-overlay';
        const existing = document.getElementById(overlayId);
        if (existing) existing.remove();

        // Create overlay with smooth animation
        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100vw';
        overlay.style.height = '100vh';
        overlay.style.background = 'rgba(0,0,0,0.4)';
        overlay.style.backdropFilter = 'blur(8px)';
        overlay.style.WebkitBackdropFilter = 'blur(8px)';
        overlay.style.zIndex = '10001';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s ease';

        // Create modal container
        const modal = document.createElement('div');
        modal.style.backgroundColor = '#fff';
        modal.style.borderRadius = '16px';
        modal.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
        modal.style.width = '90%';
        modal.style.maxWidth = '800px';
        modal.style.maxHeight = '90vh';
        modal.style.overflow = 'hidden';
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.transform = 'translateY(40px) scale(0.95)';
        modal.style.opacity = '0';
        modal.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';

        // Modal header with offer details
        const header = document.createElement('div');
        header.style.padding = '20px';
        header.style.paddingRight = '60px';
        header.style.borderBottom = '1px solid rgba(0,0,0,0.08)';
        header.style.position = 'relative';

        // Offer title row
        const titleRow = document.createElement('div');
        titleRow.style.display = 'flex';
        titleRow.style.alignItems = 'flex-start';
        titleRow.style.gap = '16px';
        titleRow.style.marginRight = '24px'; // Space for close button

        // Logo container
        const logoContainer = document.createElement('div');
        logoContainer.style.width = '60px';
        logoContainer.style.height = '60px';
        logoContainer.style.borderRadius = '8px';
        logoContainer.style.backgroundColor = 'rgba(0,0,0,0.03)';
        logoContainer.style.display = 'flex';
        logoContainer.style.alignItems = 'center';
        logoContainer.style.justifyContent = 'center';
        logoContainer.style.overflow = 'hidden';
        logoContainer.style.flexShrink = '0';

        if (offer.logo && offer.logo !== 'N/A') {
            const logo = document.createElement('img');
            logo.src = offer.logo;
            logo.alt = offer.name;
            logo.style.maxWidth = '80%';
            logo.style.maxHeight = '80%';
            logoContainer.appendChild(logo);
        } else {
            // Fallback logo
            logoContainer.textContent = offer.name.charAt(0).toUpperCase();
            logoContainer.style.fontSize = '30px';
            logoContainer.style.fontWeight = '600';
            logoContainer.style.color = '#1c1c1e';
        }

        // Title and details
        const titleContainer = document.createElement('div');
        titleContainer.style.flex = '1';

        // Create a container for title and favorite button
        const titleFavContainer = document.createElement('div');
        titleFavContainer.style.display = 'flex';
        titleFavContainer.style.alignItems = 'center';
        titleFavContainer.style.justifyContent = 'space-between';
        titleFavContainer.style.marginBottom = '8px';


        const title = document.createElement('h2');
        title.textContent = offer.name;
        title.style.margin = '0';
        title.style.fontSize = '20px';
        title.style.fontWeight = '600';
        title.style.color = '#1c1c1e';
        title.style.flex = '1';
        title.style.overflow = 'hidden';
        title.style.textOverflow = 'ellipsis';
        title.style.whiteSpace = 'nowrap';

        const details = document.createElement('div');
        details.style.fontSize = '14px';
        details.style.color = 'var(--ios-text-secondary)';
        details.style.lineHeight = '1.4';

        // Format description
        details.textContent = offer.short_description || 'No description available';

        // Badge row for metrics
        const badgeRow = document.createElement('div');
        badgeRow.style.display = 'flex';
        badgeRow.style.flexWrap = 'wrap';
        badgeRow.style.gap = '8px';
        badgeRow.style.marginTop = '12px';

        // Helper for creating metric badges
        function createBadge(label, value, color) {
            if (!value || value === 'N/A') return null;

            const badge = document.createElement('div');
            badge.style.backgroundColor = `rgba(${color}, 0.1)`;
            badge.style.color = `rgb(${color})`;
            badge.style.padding = '5px 10px';
            badge.style.borderRadius = '12px';
            badge.style.fontSize = '13px';
            badge.style.fontWeight = '600';
            badge.style.display = 'flex';
            badge.style.alignItems = 'center';
            badge.style.gap = '4px';

            const labelSpan = document.createElement('span');
            labelSpan.textContent = label + ':';
            labelSpan.style.opacity = '0.8';
            labelSpan.style.fontWeight = '400';

            const valueSpan = document.createElement('span');
            valueSpan.textContent = value;

            badge.appendChild(labelSpan);
            badge.appendChild(valueSpan);

            return badge;
        }

        // Add available badges
        const thresholdBadge = createBadge('Spend', offer.threshold, '74, 74, 74');
        const rewardBadge = createBadge('Reward', offer.reward, '76, 175, 80');
        const percentBadge = createBadge('Rate', offer.percentage, '33, 150, 243');
        const expiryBadge = createBadge('Expires', util_formatDate(offer.expiry_date), '255, 87, 34');

        if (thresholdBadge) badgeRow.appendChild(thresholdBadge);
        if (rewardBadge) badgeRow.appendChild(rewardBadge);
        if (percentBadge) badgeRow.appendChild(percentBadge);
        if (expiryBadge) badgeRow.appendChild(expiryBadge);

        // Add type badge
        if (offer.achievement_type) {
            let typeLabel = offer.achievement_type;
            let typeColor = '97, 97, 97'; // Default gray

            if (offer.achievement_type === 'STATEMENT_CREDIT') {
                typeLabel = 'Cash Back';
                typeColor = '76, 175, 80'; // Green
            } else if (offer.achievement_type === 'MEMBERSHIP_REWARDS') {
                typeLabel = 'MR Points';
                typeColor = '33, 150, 243'; // Blue
            }

            const typeBadge = createBadge('Type', typeLabel, typeColor);
            if (typeBadge) badgeRow.appendChild(typeBadge);
        }

        // Create favorite button
        const favBtn = document.createElement('button');
        favBtn.innerHTML = offer.favorite ? `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff9500">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        ` : `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        `;
        favBtn.style.cssText = `
        background:none;
        border:none;
        padding:4px 6px;
        border-radius:16px;
        background-color:${offer.favorite ? 'rgba(255, 149, 0, 0.1)' : 'rgba(0,0,0,0.05)'};
        color:${offer.favorite ? '#ff9500' : '#666'};
        cursor:pointer;
        display:inline-flex;
        align-items:center;
        transition:all 0.2s ease;
        flex-shrink:0;
        `;

        favBtn.addEventListener('mouseenter', () => {
            favBtn.style.transform = 'scale(1.05)';
        });

        favBtn.addEventListener('mouseleave', () => {
            favBtn.style.transform = 'scale(1)';
        });

        favBtn.addEventListener('click', () => {
            offer.favorite = !offer.favorite;

            // Update button appearance
            favBtn.innerHTML = offer.favorite ? `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff9500">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            ` : `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            `;

            favBtn.style.backgroundColor = offer.favorite ? 'rgba(255, 149, 0, 0.1)' : 'rgba(0,0,0,0.05)';
            favBtn.style.color = offer.favorite ? '#ff9500' : '#666';

            // Save to storage
            storage_manageData("set", storage_accToken, ["offer"]);
        });

        // Add title and favorite button to their container
        titleFavContainer.appendChild(title);
        titleFavContainer.appendChild(favBtn);

        // Assemble title container
        titleContainer.appendChild(titleFavContainer);
        titleContainer.appendChild(details);
        titleContainer.appendChild(badgeRow);

        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
        `;
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '16px';
        closeBtn.style.right = '16px';
        closeBtn.style.width = '32px';
        closeBtn.style.height = '32px';
        closeBtn.style.borderRadius = '50%';
        closeBtn.style.border = 'none';
        closeBtn.style.backgroundColor = 'rgba(0,0,0,0.05)';
        closeBtn.style.color = '#666';
        closeBtn.style.display = 'flex';
        closeBtn.style.alignItems = 'center';
        closeBtn.style.justifyContent = 'center';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.transition = 'all 0.2s ease';
        closeBtn.style.zIndex = '5'; // Ensure close button stays above other elements

        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.backgroundColor = 'rgba(0,0,0,0.1)';
            closeBtn.style.color = '#333';
        });

        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.backgroundColor = 'rgba(0,0,0,0.05)';
            closeBtn.style.color = '#666';
        });

        closeBtn.addEventListener('click', () => {
            // Fade out animation
            modal.style.transform = 'translateY(40px) scale(0.95)';
            modal.style.opacity = '0';
            overlay.style.opacity = '0';

            // Remove after animation
            setTimeout(() => {
                overlay.remove();
            }, 300);
        });

        // Assemble header
        titleRow.appendChild(logoContainer);
        titleRow.appendChild(titleContainer);
        header.appendChild(titleRow);
        header.appendChild(closeBtn);

        // Create tabbed navigation area
        const tabContainer = document.createElement('div');
        tabContainer.style.cssText = `
        display: flex;
        border-bottom: 1px solid rgba(0,0,0,0.1);
        padding: 0 20px;
        background-color: #f8f8f8;
        `;

        // Create the tabs
        const tabs = ['Cards', 'Details', 'Terms'];
        const tabButtons = {};

        tabs.forEach((tabName, index) => {
            const tab = document.createElement('button');
            tab.textContent = tabName;
            tab.style.cssText = `
            padding: 12px 20px;
            background: none;
            border: none;
            border-bottom: 3px solid transparent;
            font-size: 15px;
            font-weight: 500;
            color: #555;
            cursor: pointer;
            transition: all 0.2s ease;
            margin-right: 8px;
            ${index === 0 ? 'border-bottom-color: var(--ios-blue); color: var(--ios-blue);' : ''}
            `;

            tab.addEventListener('mouseenter', () => {
                if (!tab.classList.contains('active')) {
                    tab.style.backgroundColor = 'rgba(0,0,0,0.03)';
                }
            });

            tab.addEventListener('mouseleave', () => {
                if (!tab.classList.contains('active')) {
                    tab.style.backgroundColor = 'transparent';
                }
            });

            tab.addEventListener('click', () => {
                // Deactivate all tabs
                Object.values(tabButtons).forEach(btn => {
                    btn.style.borderBottomColor = 'transparent';
                    btn.style.color = '#555';
                    btn.classList.remove('active');
                });

                // Activate this tab
                tab.style.borderBottomColor = 'var(--ios-blue)';
                tab.style.color = 'var(--ios-blue)';
                tab.classList.add('active');

                // Show corresponding content
                showTabContent(tabName.toLowerCase());
            });

            tabButtons[tabName.toLowerCase()] = tab;
            tabContainer.appendChild(tab);
        });

        // Create content area with tab-specific content
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
        flex: 1;
        overflow: auto;
        position: relative;
        `;

        // Content for each tab
        const tabContents = {};

        // 1. Cards tab content - eligible and enrolled cards
        tabContents.cards = document.createElement('div');
        tabContents.cards.style.cssText = `
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        `;

        // Add enroll all button if there are eligible cards
        if (Array.isArray(offer.eligibleCards) && offer.eligibleCards.length > 0) {
            const enrollAllContainer = document.createElement('div');
            enrollAllContainer.style.cssText = 'margin-bottom: 16px;';

            const enrollAllBtn = document.createElement('button');
            enrollAllBtn.style.cssText = `
            width: 100%;
            padding: 14px;
            background: linear-gradient(to right, #2196F3, #4CAF50);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0, 122, 255, 0.2);
            transition: all 0.2s ease;
            `;

            enrollAllBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <path d="M22 4L12 14.01l-3-3"/>
            </svg>
            Enroll All Eligible Cards (${offer.eligibleCards.length})
            `;

            // Add hover effects
            enrollAllBtn.addEventListener('mouseenter', () => {
                enrollAllBtn.style.transform = 'translateY(-2px)';
                enrollAllBtn.style.boxShadow = '0 6px 16px rgba(0, 122, 255, 0.3)';
            });

            enrollAllBtn.addEventListener('mouseleave', () => {
                enrollAllBtn.style.transform = 'translateY(0)';
                enrollAllBtn.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.2)';
            });

            enrollAllBtn.addEventListener('click', async () => {
                enrollAllBtn.innerHTML = '<div style="width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></div>Enrolling...';
                enrollAllBtn.disabled = true;
                enrollAllBtn.style.opacity = '0.8';

                try {
                    await api_batchEnrollOffers(offer.source_id);
                    enrollAllBtn.innerHTML = '✓ Enrolled Successfully';
                    enrollAllBtn.style.background = 'linear-gradient(to right, #4CAF50, #2E7D32)';
                    setTimeout(() => {
                        closeBtn.click();
                        ui_renderCurrentView();
                    }, 1500);
                } catch (err) {
                    console.error('Error:', err);
                    enrollAllBtn.innerHTML = '× Error - Try Again';
                    enrollAllBtn.style.background = '#F44336';
                    setTimeout(() => {
                        enrollAllBtn.disabled = false;
                        enrollAllBtn.style.opacity = '1';
                    }, 2000);
                }
            });

            enrollAllContainer.appendChild(enrollAllBtn);
            tabContents.cards.appendChild(enrollAllContainer);
        }

        // Create sections for eligible and enrolled cards



        // Create sections for eligible and enrolled cards
        const eligibleSection = createCardList('Eligible Cards', offer.eligibleCards || [], 'eligible');
        const enrolledSection = createCardList('Enrolled Cards', offer.enrolledCards || [], 'enrolled');

        // Add sections to container
        tabContents.cards.appendChild(eligibleSection);
        tabContents.cards.appendChild(enrolledSection);

        // 2. Details tab content
        tabContents.details = document.createElement('div');
        tabContents.details.style.cssText = `
        padding: 20px;
        display: none;
        `;

        // Only show details if we have long_description
        if (!offer.long_description && !offer.terms) {
            // Try to fetch detailed information if not already present
            const fetchDetailsBtn = document.createElement('button');
            fetchDetailsBtn.textContent = 'Load Detailed Information';
            fetchDetailsBtn.style.cssText = `
            margin: 40px auto;
            display: block;
            padding: 12px 24px;
            background-color: var(--ios-blue);
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 15px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            `;

            fetchDetailsBtn.addEventListener('mouseenter', () => {
                fetchDetailsBtn.style.transform = 'translateY(-2px)';
                fetchDetailsBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            });

            fetchDetailsBtn.addEventListener('mouseleave', () => {
                fetchDetailsBtn.style.transform = 'translateY(0)';
                fetchDetailsBtn.style.boxShadow = 'none';
            });

            fetchDetailsBtn.addEventListener('click', async () => {
                // Find a valid account for this offer
                const account = glb_account.find(acc =>
                    acc.account_status?.trim().toLowerCase() === "active" &&
                    (offer.eligibleCards?.includes(acc.account_token) ||
                        offer.enrolledCards?.includes(acc.account_token))
                );

                if (!account) {
                    console.error("No valid account found for this offer");
                    return;
                }

                // Change button to loading state
                fetchDetailsBtn.textContent = 'Loading...';
                fetchDetailsBtn.disabled = true;

                try {
                    const details = await api_fetchOfferDetails(account.account_token, offer.offerId);

                    if (details && (details.terms || details.long_description)) {
                        // Update the offer object with the fetched data
                        offer.terms = details.terms;
                        offer.long_description = details.long_description;

                        // Save updated data
                        storage_manageData("set", storage_accToken, ["offer"]);

                        // Rebuild the details tab content
                        buildDetailsContent();
                    } else {
                        throw new Error("No detailed information available");
                    }
                } catch (error) {
                    console.error("Error loading offer details:", error);

                    fetchDetailsBtn.textContent = 'Unable to Load Details';
                    setTimeout(() => {
                        fetchDetailsBtn.textContent = 'Try Again';
                        fetchDetailsBtn.disabled = false;
                    }, 2000);
                }
            });

            tabContents.details.appendChild(fetchDetailsBtn);
        } else {
            buildDetailsContent();
        }

        function buildDetailsContent() {
            tabContents.details.innerHTML = '';

            if (offer.long_description) {
                const detailsTitle = document.createElement('h3');
                detailsTitle.textContent = 'Offer Details';
                detailsTitle.style.cssText = `
                font-size: 18px;
                font-weight: 600;
                margin: 0 0 16px 0;
                color: #333;
                `;

                const detailsText = document.createElement('div');
                detailsText.style.cssText = `
                font-size: 15px;
                line-height: 1.6;
                color: #333;
                padding: 16px;
                background-color: rgba(0,0,0,0.02);
                border-radius: 12px;
                margin-bottom: 24px;
                `;
                detailsText.textContent = offer.long_description;

                tabContents.details.appendChild(detailsTitle);
                tabContents.details.appendChild(detailsText);
            } else {
                // Show placeholder for missing description
                const noDetailsMessage = document.createElement('div');
                noDetailsMessage.style.cssText = `
                text-align: center;
                padding: 30px;
                color: #888;
                background-color: rgba(0,0,0,0.02);
                border-radius: 12px;
                margin-bottom: 24px;
                `;
                noDetailsMessage.textContent = 'No detailed description available for this offer.';

                tabContents.details.appendChild(noDetailsMessage);
            }

            // Add redemption info if available
            if (offer.redemption_types) {
                const redemptionTitle = document.createElement('h3');
                redemptionTitle.textContent = 'Redemption Options';
                redemptionTitle.style.cssText = `
                font-size: 18px;
                font-weight: 600;
                margin: 24px 0 16px 0;
                color: #333;
                `;

                // Rest of redemption code...
            }

            // Add links if available
            if (offer.location || offer.cta) {
                // Rest of links code...
            }
        }

        function createOfferLink(text, url) {
            const link = document.createElement('a');
            link.textContent = text;
            link.href = url;
            link.target = '_blank';
            link.style.cssText = `
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 20px;
            background-color: #f5f5f5;
            color: #333;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            max-width: fit-content;
            `;

            link.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            ${text}
            `;

            link.addEventListener('mouseenter', () => {
                link.style.backgroundColor = '#eee';
                link.style.transform = 'translateY(-2px)';
            });

            link.addEventListener('mouseleave', () => {
                link.style.backgroundColor = '#f5f5f5';
                link.style.transform = 'translateY(0)';
            });

            return link;
        }

        // 3. Terms tab content
        tabContents.terms = document.createElement('div');
        tabContents.terms.style.cssText = `
        padding: 20px;
        display: none;
        `;

        if (!offer.terms) {
            // Terms aren't available - show message
            const termsPlaceholder = document.createElement('div');
            termsPlaceholder.style.cssText = `
            text-align: center;
            padding: 40px 20px;
            color: #666;
            background-color: rgba(0,0,0,0.02);
            border-radius: 12px;
            `;
            termsPlaceholder.textContent = 'No terms and conditions available for this offer.';
            tabContents.terms.appendChild(termsPlaceholder);
        } else {
            // Show terms
            const termsContainer = document.createElement('div');
            termsContainer.style.cssText = `
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            padding: 16px;
            background-color: rgba(0,0,0,0.02);
            border-radius: 12px;
            `;
            termsContainer.innerHTML = offer.terms;
            tabContents.terms.appendChild(termsContainer);
        }

        // Function to show tab content
        function showTabContent(tabName) {
            Object.entries(tabContents).forEach(([name, element]) => {
                element.style.display = name === tabName ? 'block' : 'none';
            });
        }

        // Add all tabs to content container
        Object.values(tabContents).forEach(element => {
            contentContainer.appendChild(element);
        });

        // Assemble modal
        modal.appendChild(header);
        modal.appendChild(tabContainer);
        modal.appendChild(contentContainer);

        // Add modal to overlay
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Trigger animations after a small delay
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0) scale(1)';
            modal.style.opacity = '1';
        }, 10);

        // Helper function to create a card section
        function createCardList(title, cardTokens, type) {
            const section = document.createElement('div');

            // Section header (existing code)
            const sectionHeader = document.createElement('div');
            sectionHeader.style.display = 'flex';
            sectionHeader.style.alignItems = 'center';
            sectionHeader.style.justifyContent = 'space-between';
            sectionHeader.style.marginBottom = '12px';

            const sectionTitle = document.createElement('h3');
            sectionTitle.textContent = title;
            sectionTitle.style.margin = '0';
            sectionTitle.style.fontSize = '16px';
            sectionTitle.style.fontWeight = '600';
            sectionTitle.style.color = type === 'eligible' ? 'var(--ios-blue)' : 'var(--ios-green)';

            const cardCount = document.createElement('span');
            cardCount.textContent = `${cardTokens.length || 0} cards`;
            cardCount.style.fontSize = '14px';
            cardCount.style.color = 'var(--ios-gray)';

            sectionHeader.appendChild(sectionTitle);
            sectionHeader.appendChild(cardCount);
            section.appendChild(sectionHeader);

            // Cards container
            const cardsContainer = document.createElement('div');
            cardsContainer.id = `${type}-cards-container`;
            cardsContainer.style.display = 'grid';
            cardsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(140px, 1fr))';
            cardsContainer.style.gap = '12px';

            // No cards message
            if (!cardTokens || cardTokens.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.textContent = `No ${type} cards for this offer`;
                emptyMessage.style.gridColumn = '1 / -1';
                emptyMessage.style.padding = '16px';
                emptyMessage.style.textAlign = 'center';
                emptyMessage.style.backgroundColor = 'rgba(0,0,0,0.02)';
                emptyMessage.style.borderRadius = '10px';
                emptyMessage.style.color = 'var(--ios-gray)';
                emptyMessage.style.fontSize = '14px';
                cardsContainer.appendChild(emptyMessage);
            } else {
                // Create card items
                cardTokens.forEach(cardToken => {
                    if (!cardToken) return; // Skip undefined tokens

                    // Find the card - WITH PROPER ERROR HANDLING
                    const account = glb_account.find(acc => acc.account_token === cardToken);
                    // Use optional chaining and provide a fallback value
                    const displayNumber = account.cardEnding;

                    // Create card item
                    const cardItem = document.createElement('div');
                    cardItem.id = `card-${type}-${displayNumber}`;
                    cardItem.style.backgroundColor = 'white';
                    cardItem.style.borderRadius = '12px';
                    cardItem.style.border = '1px solid rgba(0,0,0,0.08)';
                    cardItem.style.padding = '12px';
                    cardItem.style.display = 'flex';
                    cardItem.style.flexDirection = 'column';
                    cardItem.style.gap = '8px';
                    cardItem.style.transition = 'all 0.2s ease';

                    // Card logo/icon with null check
                    const cardIcon = document.createElement('div');
                    cardIcon.style.width = '40px';
                    cardIcon.style.height = '40px';
                    cardIcon.style.marginBottom = '4px';

                    if (account?.small_card_art && account.small_card_art !== 'N/A') {
                        const cardImage = document.createElement('img');
                        cardImage.src = account.small_card_art;
                        cardImage.alt = 'Card';
                        cardImage.style.width = '100%';
                        cardImage.style.height = '100%';
                        cardImage.style.objectFit = 'contain';
                        cardIcon.appendChild(cardImage);
                    } else {
                        // Fallback icon
                        cardIcon.innerHTML = `
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ios-gray)" stroke-width="1.5">
                            <rect x="2" y="5" width="20" height="14" rx="2" />
                            <line x1="2" y1="10" x2="22" y2="10" />
                        </svg>
                        `;
                    }

                    // Card number - with fallback
                    const cardNumberEl = document.createElement('div');
                    cardNumberEl.textContent = `${displayNumber}-${account.embossed_name || ''}`;
                    cardNumberEl.style.fontWeight = '400';
                    cardNumberEl.style.fontSize = '12px';

                    // Card description/name if available
                    let cardNameEl;
                    if (account) {
                        cardNameEl = document.createElement('div');
                        cardNameEl.textContent = account.description || account.embossed_name || '';
                        cardNameEl.style.fontSize = '12px';
                        cardNameEl.style.color = 'var(--ios-gray)';
                        cardNameEl.style.whiteSpace = 'nowrap';
                        cardNameEl.style.overflow = 'hidden';
                        cardNameEl.style.textOverflow = 'ellipsis';
                    }

                    // Enroll button (only for eligible cards)
                    let enrollButton;
                    if (type === 'eligible') {
                        enrollButton = document.createElement('button');
                        enrollButton.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Enroll
                        `;
                        enrollButton.style.marginTop = '8px';
                        enrollButton.style.padding = '6px 10px';
                        enrollButton.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                        enrollButton.style.color = 'var(--ios-blue)';
                        enrollButton.style.border = 'none';
                        enrollButton.style.borderRadius = '8px';
                        enrollButton.style.fontSize = '12px';
                        enrollButton.style.fontWeight = '500';
                        enrollButton.style.cursor = 'pointer';
                        enrollButton.style.display = 'flex';
                        enrollButton.style.alignItems = 'center';
                        enrollButton.style.justifyContent = 'center';
                        enrollButton.style.gap = '4px';
                        enrollButton.style.transition = 'all 0.2s ease';

                        // Hover effect
                        enrollButton.addEventListener('mouseenter', () => {
                            enrollButton.style.backgroundColor = 'rgba(0, 122, 255, 0.2)';
                        });

                        enrollButton.addEventListener('mouseleave', () => {
                            enrollButton.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                        });

                        // Enroll functionality
                        enrollButton.addEventListener('click', async (e) => {
                            e.stopPropagation(); // Prevent card click

                            if (!account) {
                                console.error('Account not found for card:', displayNumber);
                                return;
                            }

                            // Change button to loading state
                            const originalButtonHtml = enrollButton.innerHTML;
                            enrollButton.innerHTML = `
                            <div class="spinner" style="width:12px;height:12px;border:2px solid rgba(0,122,255,0.3);border-top:2px solid var(--ios-blue);border-radius:50%;animation:spin 1s linear infinite;"></div>
                            `;
                            enrollButton.disabled = true;

                            try {
                                // Call enrollment API
                                const result = await api_enrollInOffer(account.account_token, offer.offerId);

                                if (result.result) {
                                    // Success state
                                    enrollButton.innerHTML = `
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                                    </svg>
                                    `;
                                    enrollButton.style.backgroundColor = 'var(--ios-green)';
                                    enrollButton.style.color = 'white';

                                    // Update data
                                    const idx = offer.eligibleCards.indexOf(cardToken);
                                    if (idx !== -1) {
                                        offer.eligibleCards.splice(idx, 1);
                                    }
                                    if (!offer.enrolledCards.includes(account.account_token)) {
                                        offer.enrolledCards.push(account.account_token);
                                    }

                                    // Animate card movement
                                    setTimeout(() => {
                                        cardItem.style.transform = 'translateX(100%)';
                                        cardItem.style.opacity = '0';

                                        // Remove after animation and update sections
                                        setTimeout(() => {
                                            cardItem.remove();
                                            updateCardSections();
                                        }, 300);
                                    }, 500);
                                } else {
                                    // Error state
                                    enrollButton.innerHTML = `
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <line x1="15" y1="9" x2="9" y2="15"/>
                                        <line x1="9" y1="9" x2="15" y2="15"/>
                                    </svg>
                                    `;
                                    enrollButton.style.backgroundColor = 'var(--ios-red)';
                                    enrollButton.style.color = 'white';

                                    // Reset after delay
                                    setTimeout(() => {
                                        enrollButton.innerHTML = originalButtonHtml;
                                        enrollButton.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                                        enrollButton.style.color = 'var(--ios-blue)';
                                        enrollButton.disabled = false;
                                    }, 2000);
                                }
                            } catch (error) {
                                console.error('Error enrolling card:', error);

                                // Error state
                                enrollButton.innerHTML = `
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="15" y1="9" x2="9" y2="15"/>
                                    <line x1="9" y1="9" x2="15" y2="15"/>
                                </svg>
                                `;
                                enrollButton.style.backgroundColor = 'var(--ios-red)';
                                enrollButton.style.color = 'white';

                                // Reset after delay
                                setTimeout(() => {
                                    enrollButton.innerHTML = originalButtonHtml;
                                    enrollButton.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                                    enrollButton.style.color = 'var(--ios-blue)';
                                    enrollButton.disabled = false;
                                }, 2000);
                            }
                        });
                    }

                    // Assemble card item
                    cardItem.appendChild(cardIcon);
                    cardItem.appendChild(cardNumberEl);
                    if (cardNameEl) cardItem.appendChild(cardNameEl);
                    if (enrollButton) cardItem.appendChild(enrollButton);

                    // Add hover effect
                    cardItem.addEventListener('mouseenter', () => {
                        cardItem.style.transform = 'translateY(-3px)';
                        cardItem.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    });

                    cardItem.addEventListener('mouseleave', () => {
                        cardItem.style.transform = 'translateY(0)';
                        cardItem.style.boxShadow = 'none';
                    });

                    cardsContainer.appendChild(cardItem);
                });
            }

            section.appendChild(cardsContainer);
            return section;
        }

        // Helper function to update the card sections after enrollment changes
        function updateCardSections() {
            const eligibleContainer = document.getElementById('eligible-cards-container');
            const enrolledContainer = document.getElementById('enrolled-cards-container');

            if (eligibleContainer && enrolledContainer) {
                // Clear containers
                eligibleContainer.innerHTML = '';
                enrolledContainer.innerHTML = '';

                // Re-create card sections
                const newEligibleSection = createCardList('Eligible Cards', offer.eligibleCards || [], 'eligible');
                const newEnrolledSection = createCardList('Enrolled Cards', offer.enrolledCards || [], 'enrolled');

                // Get the parent elements
                const eligibleParent = eligibleContainer.parentNode;
                const enrolledParent = enrolledContainer.parentNode;

                // Replace with new sections
                eligibleParent.innerHTML = '';
                enrolledParent.innerHTML = '';

                eligibleParent.appendChild(newEligibleSection.children[0]); // Header
                eligibleParent.appendChild(newEligibleSection.children[0]); // Cards container

                enrolledParent.appendChild(newEnrolledSection.children[0]); // Header
                enrolledParent.appendChild(newEnrolledSection.children[0]); // Cards container

                // Update count badges
                const eligibleCount = eligibleParent.querySelector('span');
                if (eligibleCount) eligibleCount.textContent = `${offer.eligibleCards.length} cards`;

                const enrolledCount = enrolledParent.querySelector('span');
                if (enrolledCount) enrolledCount.textContent = `${offer.enrolledCards.length} cards`;
            }
        }

        // Show the 'Cards' tab by default
        showTabContent('cards');
    }
    //----------------------------  Benefits Page  ----------------------------//

    // Improved benefits page rendering with better state management and UI rendering
    async function benefits_renderPage() {
        // Ensure we have benefit data
        if (!glb_benefit || glb_benefit.length === 0) {
            await api_fetchAllBenefits();
        }

        const containerDiv = document.createElement('div');
        containerDiv.className = 'benefits-container';
        containerDiv.style.cssText = 'padding:20px; background-color:rgba(255,255,255,0.04); border-radius:12px; max-width:1000px; margin:0 auto;';

        // Process all data once before rendering to improve performance
        const { groupedBenefits, sortedBenefitGroups, statusCounts } = benefits_processAndGroup(glb_benefit);

        // Add benefits overview statistics
        containerDiv.appendChild(benefits_renderStatsSummary(statusCounts));

        // Create status legend with enhanced styling
        const statusLegendConfig = {
            'ACHIEVED': { label: 'Completed', color: 'var(--ios-green)' },
            'IN_PROGRESS': { label: 'In Progress', color: 'var(--ios-blue)' },
            'NOT_STARTED': { label: 'Not Started', color: 'var(--ios-gray)' }
        };

        containerDiv.appendChild(benefits_createStatusKey(statusLegendConfig));

        // Handle empty state with better user feedback
        if (sortedBenefitGroups.length === 0) {
            containerDiv.appendChild(ui_createEmptyState());
        } else {
            // Create filter controls
            const filterControls = benefits_createFilters();
            containerDiv.appendChild(filterControls);

            // Create accordion items with a document fragment for better performance
            const accordionContainer = document.createElement('div');
            accordionContainer.className = 'accordion-container';

            const fragment = document.createDocumentFragment();
            sortedBenefitGroups.forEach(groupObj => {
                fragment.appendChild(benefits_createExpandableItem(groupObj, statusLegendConfig));
            });

            accordionContainer.appendChild(fragment);
            containerDiv.appendChild(accordionContainer);
        }

        return containerDiv;
    }

    // Enhanced benefits overview with statistics
    function benefits_renderStatsSummary(statusCounts) {
        const overviewSection = document.createElement('div');
        overviewSection.style.cssText = 'display:flex; flex-wrap:wrap; gap:16px; margin-bottom:24px; justify-content:center;';

        // Create stat cards for each status
        const createStatCard = (label, value, color, icon) => {
            const card = document.createElement('div');
            card.style.cssText = `
            background-color:white; 
            border-radius:16px; 
            padding:16px 20px; 
            min-width:140px; 
            box-shadow:0 4px 12px rgba(0,0,0,0.06); 
            display:flex; 
            flex-direction:column; 
            align-items:center; 
            border-top:3px solid ${color};
            transition:transform 0.2s ease;
            `;

            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });

            const valueEl = document.createElement('div');
            valueEl.textContent = value;
            valueEl.style.cssText = `font-size:32px; font-weight:700; color:${color}; margin-bottom:8px;`;

            const labelEl = document.createElement('div');
            labelEl.textContent = label;
            labelEl.style.cssText = 'font-size:14px; color:#666; text-align:center;';

            // Add icon if provided
            if (icon) {
                const iconEl = document.createElement('div');
                iconEl.innerHTML = icon;
                iconEl.style.cssText = 'margin-bottom:10px;';
                card.appendChild(iconEl);
            }

            card.appendChild(valueEl);
            card.appendChild(labelEl);

            return card;
        };

        // Icons for stat cards
        const icons = {
            total: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${statusCounts.total ? 'var(--ios-blue)' : '#aaa'}">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
            <path d="M7 12h2v5H7v-5zm4-7h2v12h-2V5zm4 4h2v8h-2v-8z"/>
        </svg>`,
            completed: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${statusCounts.achieved ? 'var(--ios-green)' : '#aaa'}">
            <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
        </svg>`,
            inProgress: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${statusCounts.inProgress ? 'var(--ios-blue)' : '#aaa'}">
            <path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>
        </svg>`,
            notStarted: `<svg width="24" height="24" viewBox="0 0 24 24" fill="${statusCounts.notStarted ? 'var(--ios-gray)' : '#aaa'}">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
            <path d="M11 7h2v6h-2zm0 8h2v2h-2z"/>
        </svg>`
        };

        // Add stats cards
        overviewSection.appendChild(createStatCard('Total Benefits', statusCounts.total || 0, 'var(--ios-blue)', icons.total));
        overviewSection.appendChild(createStatCard('Completed', statusCounts.achieved || 0, 'var(--ios-green)', icons.completed));
        overviewSection.appendChild(createStatCard('In Progress', statusCounts.inProgress || 0, 'var(--ios-blue)', icons.inProgress));
        overviewSection.appendChild(createStatCard('Not Started', statusCounts.notStarted || 0, 'var(--ios-gray)', icons.notStarted));

        return overviewSection;
    }

    function benefits_createFilters() {
        const filterContainer = document.createElement('div');
        filterContainer.style.cssText = `
        display:flex;
        flex-wrap:wrap;
        gap:12px;
        margin-bottom:20px;
        padding:16px;
        background-color:rgba(255,255,255,0.6);
        border-radius:12px;
        box-shadow:0 2px 8px rgba(0,0,0,0.05);
        align-items:center;
        `;

        // Search input
        const searchWrapper = document.createElement('div');
        searchWrapper.style.cssText = 'position:relative; flex:1; min-width:200px;';

        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search benefits...';
        searchInput.style.cssText = `
        width:100%;
        padding:10px 12px;
        padding-left:36px;
        border-radius:8px;
        border:1px solid #ddd;
        font-size:14px;
        outline:none;
        transition:all 0.2s ease;
        `;

        searchInput.addEventListener('focus', () => {
            searchInput.style.boxShadow = '0 0 0 2px rgba(0, 122, 255, 0.2)';
            searchInput.style.borderColor = 'var(--ios-blue)';
        });

        searchInput.addEventListener('blur', () => {
            searchInput.style.boxShadow = 'none';
            searchInput.style.borderColor = '#ddd';
        });

        // Search icon
        const searchIcon = document.createElement('div');
        searchIcon.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        `;
        searchIcon.style.cssText = 'position:absolute; top:50%; left:12px; transform:translateY(-50%);';

        searchWrapper.appendChild(searchIcon);
        searchWrapper.appendChild(searchInput);

        // Status filter
        const statusFilter = document.createElement('select');
        statusFilter.style.cssText = `
        padding:10px 12px;
        border-radius:8px;
        border:1px solid #ddd;
        font-size:14px;
        outline:none;
        background-color:white;
        cursor:pointer;
        `;

        const statusOptions = [
            { value: 'all', label: 'All Statuses' },
            { value: 'ACHIEVED', label: 'Completed' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'NOT_STARTED', label: 'Not Started' }
        ];

        statusOptions.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            statusFilter.appendChild(optionEl);
        });

        // Card filter
        const cardFilter = document.createElement('select');
        cardFilter.style.cssText = `
        padding:10px 12px;
        border-radius:8px;
        border:1px solid #ddd;
        font-size:14px;
        outline:none;
        background-color:white;
        cursor:pointer;
        `;

        // Get unique card endings
        const cardNumbers = [...new Set(glb_benefit.map(benefit => benefit.cardEnding))];

        const cardOptions = [
            { value: 'all', label: 'All Cards' },
            ...cardNumbers.map(card => ({ value: card, label: `Card ending ${card}` }))
        ];

        cardOptions.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            cardFilter.appendChild(optionEl);
        });

        // Add event listeners for filtering
        const applyFilters = () => {
            const searchTerm = searchInput.value.toLowerCase();
            const selectedStatus = statusFilter.value;
            const selectedCard = cardFilter.value;

            // Find all accordion items
            const accordionItems = document.querySelectorAll('.accordion-item');

            accordionItems.forEach(item => {
                // Get title text for search
                const titleText = item.querySelector('.accordion-title').textContent.toLowerCase();

                // Get status information
                const statusMarkers = Array.from(item.querySelectorAll('.mini-card'));
                const hasStatus = selectedStatus === 'all' || statusMarkers.some(marker =>
                    marker.getAttribute('data-status') === selectedStatus
                );

                // Get card information
                const cardMarkers = Array.from(item.querySelectorAll('.card-ending'));
                const hasCard = selectedCard === 'all' || cardMarkers.some(marker =>
                    marker.textContent === selectedCard
                );

                // Determine visibility
                const matchesSearch = searchTerm === '' || titleText.includes(searchTerm);
                const isVisible = matchesSearch && hasStatus && hasCard;

                // Apply visibility
                item.style.display = isVisible ? 'block' : 'none';
            });
        };

        searchInput.addEventListener('input', applyFilters);
        statusFilter.addEventListener('change', applyFilters);
        cardFilter.addEventListener('change', applyFilters);

        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Filters';
        resetButton.style.cssText = `
        padding:10px 16px;
        border-radius:8px;
        border:none;
        background-color:rgba(142, 142, 147, 0.1);
        color:var(--ios-text-secondary);
        font-size:14px;
        cursor:pointer;
        transition:all 0.2s ease;
        `;

        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.2)';
        });

        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.1)';
        });

        resetButton.addEventListener('click', () => {
            searchInput.value = '';
            statusFilter.value = 'all';
            cardFilter.value = 'all';
            applyFilters();
        });

        // Assemble filter container
        filterContainer.appendChild(searchWrapper);
        filterContainer.appendChild(statusFilter);
        filterContainer.appendChild(cardFilter);
        filterContainer.appendChild(resetButton);

        return filterContainer;
    }

    // Process benefits data with improved analytics
    function benefits_processAndGroup(benefits) {
        // Initialize counters
        const statusCounts = {
            total: 0,
            achieved: 0,
            inProgress: 0,
            notStarted: 0
        };

        // Group benefits by benefitId and update statuses
        const groupedBenefits = benefits.reduce((grouped, trackerObj) => {
            const key = trackerObj.benefitId;

            // Check for zero or negative progress
            const spentAmount = parseFloat(trackerObj.tracker?.spentAmount) || 0;
            if (spentAmount <= 0) {
                trackerObj.status = "NOT_STARTED";
            }

            grouped[key] = grouped[key] || [];
            grouped[key].push(trackerObj);

            // Count statuses
            statusCounts.total++;
            if (trackerObj.status === 'ACHIEVED') {
                statusCounts.achieved++;
            } else if (trackerObj.status === 'IN_PROGRESS') {
                statusCounts.inProgress++;
            } else {
                statusCounts.notStarted++;
            }

            return grouped;
        }, {});

        // Enhanced sorting with more benefit types
        const sortedBenefitGroups = benefits_sortBenefits(groupedBenefits);

        return {
            groupedBenefits,
            sortedBenefitGroups,
            statusCounts
        };
    }

    // Enhanced sorting for benefit groups
    function benefits_sortBenefits(groupedBenefits) {
        // Expanded mapping of benefit IDs to display order and custom names
        const benefitSortMapping = {
            // Credits
            "200-afc-tracker": { order: 1, newName: "$200 Platinum Flight Credit", category: "Travel Credits" },
            "$200-airline-statement-credit": { order: 2, newName: "$200 Aspire Flight Credit", category: "Travel Credits" },
            "$400-hilton-aspire-resort-credit": { order: 3, newName: "$400 Hilton Aspire Resort Credit", category: "Hotel Credits" },
            "$240 flexible business credit": { order: 4, newName: "$240 Flexible Business Credit", category: "Business Credits" },
            "saks-platinum-tracker": { order: 5, newName: "$100 Saks Credit", category: "Shopping Credits" },
            "$120 dining credit for gold card": { order: 6, newName: "$120 Dining Credit (Gold)", category: "Dining Credits" },
            "$84 dunkin' credit": { order: 7, newName: "$84 Dunkin' Credit", category: "Dining Credits" },
            "$100 resy credit": { order: 8, newName: "$100 Resy Credit", category: "Dining Credits" },
            "hotel-credit-platinum-tracker": { order: 9, newName: "$200 FHR Credit", category: "Hotel Credits" },
            "digital entertainment": { order: 10, newName: "$20 Digital Entertainment Credit", category: "Entertainment Credits" },
            "$199 clear plus credit": { order: 11, newName: "$199 CLEAR Plus Credit", category: "Travel Credits" },
            "walmart+ monthly membership credit": { order: 12, newName: "Walmart+ Membership Credit", category: "Shopping Credits" },

            // Membership benefits
            "earn free night rewards": { order: 13, newName: "Earn Free Night Rewards", category: "Hotel Benefits" },
            "bd04b359-cc6b-4981-bd6f-afb9456eb9ea": { order: 14, newName: "Unlimited Delta Sky Club Access", category: "Airport Benefits" },
            "delta-sky-club-visits-platinum": { order: 15, newName: "Delta Sky Club Access Pass", category: "Airport Benefits" },

            // Additional common benefits
            "uber-cash-platinum": { order: 16, newName: "$200 Uber Cash Credit", category: "Transportation Credits" },
            "uber-cash-gold": { order: 17, newName: "$120 Uber Cash Credit", category: "Transportation Credits" },
            "dell-credit-business-platinum": { order: 18, newName: "$400 Dell Credit", category: "Business Credits" },
            "wireless-credit-business-platinum": { order: 19, newName: "Wireless Credit", category: "Business Credits" },
            "equinox-credit-platinum": { order: 20, newName: "$300 Equinox Credit", category: "Lifestyle Credits" },
            "marriott-property-credit": { order: 21, newName: "Marriott Property Credit", category: "Hotel Credits" },
            "hilton-property-credit": { order: 22, newName: "Hilton Property Credit", category: "Hotel Credits" },
            "nytimes-credit": { order: 23, newName: "NY Times Credit", category: "Digital Credits" },
            "peacock-credit": { order: 24, newName: "Peacock Credit", category: "Digital Credits" },
            "disney-bundle-credit": { order: 25, newName: "Disney Bundle Credit", category: "Digital Credits" }
        };

        // Create array of objects with enhanced metadata
        const groupArray = Object.entries(groupedBenefits).map(([key, group]) => {
            const firstTracker = group[0];
            const benefitIdKey = (firstTracker.benefitId || "").toLowerCase().trim();
            const benefitNameKey = (firstTracker.benefitName || "").toLowerCase().trim();

            const sortData = benefitSortMapping[benefitIdKey] || benefitSortMapping[benefitNameKey];
            const periodInfo = benefits_extractPeriod(firstTracker);

            return {
                key,
                trackers: group,
                order: sortData?.order || Infinity,
                displayName: sortData?.newName || firstTracker.benefitName || "",
                category: sortData?.category || benefits_inferCategoryFromTitle(firstTracker),
                periodType: periodInfo.periodType,
                periodLabel: periodInfo.periodLabel
            };
        });

        // Sort primarily by order, then by category, then by name
        return groupArray.sort((a, b) => {
            // Sort by predefined order first
            if (a.order !== b.order) {
                return a.order - b.order;
            }

            // Then by category if orders are the same
            if (a.category !== b.category) {
                return a.category.localeCompare(b.category);
            }

            // Finally by name
            return (a.displayName || "").localeCompare(b.displayName || "");
        });
    }

    function benefit_createProgressBar(options = {}) {
        const {
            current = 0,
            max = 100,
            barColor = 'var(--ios-blue)',
            height = '12px',
            animate = true,
            showPercentage = false
        } = options;

        // Calculate percentage
        const percent = max > 0 ? Math.min(100, (current / max) * 100) : 0;

        // Create wrapper
        const progressBarWrapper = ui_createElement('div', {
            styleString: `
                height: ${height};
                border-radius: 8px;
                background-color: #f0f0f0;
                position: relative;
                overflow: hidden;
                border: 1px solid #ddd;
                width: 100%;
                box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
            `
        });

        // Create fill
        const progressFill = ui_createElement('div', {
            styleString: `
                height: 100%;
                position: absolute;
                top: 0;
                left: 0;
                width: ${animate ? '0' : `${percent}%`};
                background-color: ${barColor};
                transition: width ${animate ? '1s cubic-bezier(0.22, 1, 0.36, 1)' : '0s'};
            `
        });

        // Add percentage label if needed
        if (showPercentage) {
            const percentLabel = ui_createElement('div', {
                text: `${Math.round(percent)}%`,
                styleString: `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 10px;
                    font-weight: 600;
                    color: ${percent > 50 ? 'white' : '#333'};
                    z-index: 2;
                `
            });
            progressBarWrapper.appendChild(percentLabel);
        }

        progressBarWrapper.appendChild(progressFill);

        // Animate progress bar after a short delay if animation is enabled
        if (animate) {
            setTimeout(() => {
                progressFill.style.width = `${percent}%`;
            }, 100);
        }

        return progressBarWrapper;
    }

    // Extract period information with better formatting
    function benefits_extractPeriod(tracker) {
        let periodType = "";
        let periodLabel = "";

        if (tracker.trackerDuration) {
            const duration = tracker.trackerDuration.toLowerCase();

            if (duration.includes("month")) {
                periodType = "monthly";
                periodLabel = "Monthly";
            } else if (duration.includes("year")) {
                periodType = "yearly";
                periodLabel = duration.includes("calender") ? "Calendar Year" : "Annual";
            } else if (duration.includes("half")) {
                periodType = "semi-annual";
                periodLabel = "Semi-Annual";
            } else if (duration.includes("quarter")) {
                periodType = "quarterly";
                periodLabel = "Quarterly";
            } else {
                periodType = duration;
                periodLabel = duration.charAt(0).toUpperCase() + duration.slice(1);
            }
        } else if (tracker.periodStartDate && tracker.periodEndDate) {
            // If no duration is specified, try to determine from dates
            const start = new Date(tracker.periodStartDate);
            const end = new Date(tracker.periodEndDate);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();

                if (diffMonths <= 1) {
                    periodType = "monthly";
                    periodLabel = "Monthly";
                } else if (diffMonths >= 11 && diffMonths <= 13) {
                    periodType = "yearly";
                    periodLabel = "Annual";
                } else if (diffMonths >= 5 && diffMonths <= 7) {
                    periodType = "semi-annual";
                    periodLabel = "Semi-Annual";
                } else if (diffMonths >= 2 && diffMonths <= 4) {
                    periodType = "quarterly";
                    periodLabel = "Quarterly";
                }
            }
        }

        return { periodType, periodLabel };
    }

    // Guess category from benefit name
    function benefits_inferCategoryFromTitle(tracker) {
        const name = (tracker.benefitName || "").toLowerCase();

        if (name.includes("hotel") || name.includes("resort") || name.includes("hilton") || name.includes("marriott")) {
            return "Hotel Credits";
        } else if (name.includes("airline") || name.includes("flight") || name.includes("travel") || name.includes("delta")) {
            return "Travel Credits";
        } else if (name.includes("dining") || name.includes("restaurant") || name.includes("food")) {
            return "Dining Credits";
        } else if (name.includes("entertainment") || name.includes("streaming")) {
            return "Entertainment Credits";
        } else if (name.includes("business")) {
            return "Business Credits";
        } else if (name.includes("shop") || name.includes("retail") || name.includes("store")) {
            return "Shopping Credits";
        } else {
            return "Other Benefits";
        }
    }

    // Create enhanced status legend
    function benefits_createStatusKey(statusConfig) {
        const legend = document.createElement('div');
        legend.className = 'status-legend';
        legend.style.cssText = 'display:flex; gap:15px; margin-bottom:25px; justify-content:center; flex-wrap:wrap; background-color:rgba(255,255,255,0.6); border-radius:12px; padding:12px; box-shadow:0 2px 4px rgba(0,0,0,0.05);';

        Object.entries(statusConfig).forEach(([status, { label, color }]) => {
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            legendItem.style.cssText = 'display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; transition:background-color 0.2s ease;';

            legendItem.addEventListener('mouseenter', () => {
                legendItem.style.backgroundColor = 'rgba(0,0,0,0.05)';
            });

            legendItem.addEventListener('mouseleave', () => {
                legendItem.style.backgroundColor = 'transparent';
            });

            const colorDot = document.createElement('div');
            colorDot.className = 'legend-dot';
            colorDot.style.cssText = `width:12px; height:12px; border-radius:50%; background-color:${color}; box-shadow:0 1px 3px rgba(0,0,0,0.1);`;

            const labelSpan = document.createElement('span');
            labelSpan.className = 'legend-label';
            labelSpan.style.cssText = 'color:#333; font-size:14px; font-weight:500;';
            labelSpan.textContent = label;

            legendItem.appendChild(colorDot);
            legendItem.appendChild(labelSpan);
            legend.appendChild(legendItem);
        });

        return legend;
    }

    // Create enhanced accordion item
    function benefits_createExpandableItem(groupObj, statusConfig) {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.style.cssText = `
        border:1px solid #e0e0e0;
        border-radius:12px;
        margin-bottom:16px;
        background-color:#ffffff;
        box-shadow:0 2px 8px rgba(0,0,0,0.08);
        transition:box-shadow 0.2s ease, transform 0.2s ease;
        overflow:hidden;
        `;

        // Apply hover effects
        accordionItem.addEventListener('mouseenter', () => {
            accordionItem.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
            accordionItem.style.transform = 'translateY(-3px)';
        });

        accordionItem.addEventListener('mouseleave', () => {
            accordionItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            accordionItem.style.transform = 'translateY(0)';
        });

        // Tag the item with categories and status for filtering
        if (groupObj.category) {
            accordionItem.setAttribute('data-category', groupObj.category);
        }

        const allStatuses = groupObj.trackers.map(t => t.status);
        allStatuses.forEach(status => {
            accordionItem.setAttribute(`data-has-${status.toLowerCase()}`, 'true');
        });

        // Create header with enhanced UI
        const headerDiv = benefits_createItemHeader(groupObj, statusConfig);

        // Create body with enhanced UI
        const bodyDiv = benefits_createItemContent(groupObj);

        // Store reference to body for toggle functionality
        headerDiv.bodyRef = bodyDiv;
        headerDiv.parentItem = accordionItem;

        accordionItem.appendChild(headerDiv);
        accordionItem.appendChild(bodyDiv);

        return accordionItem;
    }

    // Create enhanced accordion header
    function benefits_createItemHeader(groupObj, statusConfig) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'accordion-header';
        headerDiv.style.cssText = `
        padding:16px 20px;
        cursor:pointer;
        transition:background-color 0.2s ease;
        background-color:#f9f9f9;
        position:relative;
        border-bottom:1px solid transparent;
        `;

        // Add hover and active styles
        headerDiv.addEventListener('mouseenter', () => {
            headerDiv.style.backgroundColor = '#f0f0f0';
        });

        headerDiv.addEventListener('mouseleave', () => {
            if (!headerDiv.classList.contains('active')) {
                headerDiv.style.backgroundColor = '#f9f9f9';
            }
        });

        // Create title section with icons
        const titleSection = document.createElement('div');
        titleSection.style.cssText = 'display:flex; align-items:flex-start; gap:12px; margin-bottom:10px;';

        // Category badge
        const categoryBadge = document.createElement('div');
        categoryBadge.style.cssText = `
        font-size:11px;
        padding:4px 8px;
        background-color:rgba(0,0,0,0.05);
        color:#666;
        border-radius:4px;
        font-weight:500;
        white-space:nowrap;
        align-self:flex-start;
        `;
        categoryBadge.textContent = groupObj.category || 'Other';

        // Title row with category and period
        const titleRow = document.createElement('div');
        titleRow.style.cssText = 'display:flex; justify-content:space-between; align-items:center; width:100%;';

        // Title with icon based on category
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = 'display:flex; align-items:center; gap:8px; flex:1;';

        // Category icon (choose based on category)
        const categoryIcon = benefits_getCategoryIcon(groupObj.category);
        categoryIcon.style.cssText = 'width:24px; height:24px; flex-shrink:0;';

        // Title text
        const titleSpan = document.createElement('span');
        titleSpan.className = 'accordion-title';
        titleSpan.style.cssText = 'font-size:17px; font-weight:600; color:#333;';
        titleSpan.textContent = groupObj.displayName || groupObj.trackers[0].benefitName || "";

        // Create the arrow icon
        const arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        arrowIcon.setAttribute('viewBox', '0 0 24 24');
        arrowIcon.setAttribute('width', '24');
        arrowIcon.setAttribute('height', '24');
        arrowIcon.style.transition = 'transform 0.3s ease';
        arrowIcon.style.flexShrink = '0';
        arrowIcon.style.marginLeft = 'auto';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M7 10l5 5 5-5');
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#888');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        arrowIcon.appendChild(path);

        // Store arrow reference for animation
        headerDiv.arrowRef = arrowIcon;

        // Create right side container for period badge and arrow
        const rightElements = document.createElement('div');
        rightElements.style.cssText = 'display:flex; align-items:center;';

        // Add period badge to right side if available
        if (groupObj.periodLabel) {
            const periodBadge = document.createElement('div');
            periodBadge.style.cssText = `
            font-size:12px;
            padding:4px 10px;
            background-color:rgba(0, 122, 255, 0.08);
            color:var(--ios-blue);
            border-radius:12px;
            font-weight:500;
            white-space:nowrap;
            margin-right:8px;
            `;
            periodBadge.textContent = groupObj.periodLabel;
            rightElements.appendChild(periodBadge);
        }

        // Add arrow to right side
        rightElements.appendChild(arrowIcon);

        // Assemble title container
        titleContainer.appendChild(categoryIcon);
        titleContainer.appendChild(titleSpan);
        titleRow.appendChild(titleContainer);
        titleRow.appendChild(rightElements);

        // Create mini cards for each card's status
        const miniBarDiv = document.createElement('div');
        miniBarDiv.className = 'mini-bar';
        miniBarDiv.style.cssText = 'display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;';

        // Group trackers by card for a cleaner display
        const cardTrackers = {};
        groupObj.trackers.forEach(tracker => {
            cardTrackers[tracker.cardEnding] = tracker;
        });

        // Add card status indicators
        Object.entries(cardTrackers).forEach(([cardEnding, tracker]) => {
            // Get status color from config or use default
            const statusObj = statusConfig[tracker.status] || { color: 'var(--ios-gray)', label: tracker.status };

            const miniCard = document.createElement('div');
            miniCard.className = 'mini-card';
            miniCard.setAttribute('data-status', tracker.status);
            miniCard.style.cssText = `
            display:flex;
            align-items:center;
            gap:6px;
            padding:6px 10px;
            border-radius:8px;
            font-size:13px;
            color:#444;
            background-color:${statusObj.color}15;
            border:1px solid ${statusObj.color}30;
            transition:all 0.2s ease;
            `;

            // Add hover effect to mini cards
            miniCard.addEventListener('mouseenter', () => {
                miniCard.style.transform = 'translateY(-2px)';
                miniCard.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                miniCard.style.backgroundColor = `${statusObj.color}25`;
            });

            miniCard.addEventListener('mouseleave', () => {
                miniCard.style.transform = 'translateY(0)';
                miniCard.style.boxShadow = 'none';
                miniCard.style.backgroundColor = `${statusObj.color}15`;
            });

            // Status indicator dot
            const statusDot = document.createElement('div');
            statusDot.className = 'status-dot';
            statusDot.style.cssText = `width:10px; height:10px; border-radius:50%; background-color:${statusObj.color}; box-shadow:0 1px 2px rgba(0,0,0,0.1);`;

            // Card ending
            const cardEndingSpan = document.createElement('span');
            cardEndingSpan.className = 'card-ending';
            cardEndingSpan.style.cssText = 'font-weight:500;';
            cardEndingSpan.textContent = cardEnding;

            // Add status label
            const statusLabel = document.createElement('span');
            statusLabel.style.cssText = 'font-size:11px; opacity:0.8;';
            statusLabel.textContent = statusObj.label;

            miniCard.appendChild(statusDot);
            miniCard.appendChild(cardEndingSpan);
            miniCard.appendChild(statusLabel);
            miniBarDiv.appendChild(miniCard);
        });

        // Assemble header
        titleSection.appendChild(categoryBadge);
        titleSection.appendChild(titleRow);
        headerDiv.appendChild(titleSection);
        headerDiv.appendChild(miniBarDiv);

        // Add click handler for toggling body with improved animation
        headerDiv.addEventListener('click', () => {
            benefits_toggleItemExpansion(headerDiv);
        });

        return headerDiv;
    }

    // Get category icon based on category
    function benefits_getCategoryIcon(category) {
        const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        iconSvg.setAttribute('viewBox', '0 0 24 24');
        iconSvg.setAttribute('width', '24');
        iconSvg.setAttribute('height', '24');

        let path = '';
        let color = '#666';

        switch ((category || '').toLowerCase()) {
            case 'travel credits':
                path = 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z';
                color = '#2196F3';
                break;

            case 'hotel credits':
                path = 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z';
                color = '#9C27B0';
                break;

            case 'dining credits':
                path = 'M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z';
                color = '#FF5722';
                break;

            case 'entertainment credits':
                path = 'M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z';
                color = '#E91E63';
                break;

            case 'business credits':
                path = 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z';
                color = '#4CAF50';
                break;

            case 'shopping credits':
                path = 'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z';
                color = '#FF9800';
                break;

            case 'digital credits':
                path = 'M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z';
                color = '#00BCD4';
                break;

            case 'airport benefits':
                path = 'M22 16v-2l-8.5-5V3.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5V9L2 14v2l8.5-2.5V19L8 20.5V22l4-1 4 1v-1.5L13.5 19v-5.5L22 16z';
                color = '#3F51B5';
                break;

            default:
                path = 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z';
                color = '#607D8B';
        }

        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', path);
        pathEl.setAttribute('fill', color);
        iconSvg.appendChild(pathEl);

        return iconSvg;
    }

    // Create enhanced accordion body
    function benefits_createItemContent(groupObj) {
        const bodyDiv = document.createElement('div');
        bodyDiv.className = 'accordion-body';
        bodyDiv.style.cssText = 'padding:0 20px; overflow:hidden; max-height:0; transition:max-height 0.4s ease-in-out, padding 0.4s ease-in-out, opacity 0.3s ease;';
        bodyDiv.style.opacity = '0';

        // Create a container for trackers with nicer layout
        const trackersContainer = document.createElement('div');
        trackersContainer.style.cssText = 'display:flex; flex-direction:column; gap:16px; padding-bottom:20px;';

        // Create tracker cards
        groupObj.trackers.forEach(trackerObj => {
            trackersContainer.appendChild(benefits_createProgressCard(trackerObj, groupObj));
        });

        bodyDiv.appendChild(trackersContainer);

        return bodyDiv;
    }

    // Create enhanced tracker card
    function benefits_createProgressCard(trackerObj, groupObj) {
        // Find card details in accounts
        const cardAccount = glb_account.find(acc => acc.account_token === trackerObj.cardToken);

        const trackerCard = document.createElement('div');

        trackerCard.className = 'tracker-card';
        trackerCard.style.cssText = `
        border:1px solid #e6e6e6;
        border-radius:16px;
        padding:16px;
        margin-top:16px;
        background-color:#fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.04);
        transition:all 0.3s ease;
        position:relative;
        overflow:hidden;
        `;

        // Add hover effect
        trackerCard.addEventListener('mouseenter', () => {
            trackerCard.style.transform = 'translateY(-3px)';
            trackerCard.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
        });

        trackerCard.addEventListener('mouseleave', () => {
            trackerCard.style.transform = 'translateY(0)';
            trackerCard.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
        });

        // Add status indicator stripe based on status
        const statusColors = {
            'ACHIEVED': 'var(--ios-green)',
            'IN_PROGRESS': 'var(--ios-blue)',
            'NOT_STARTED': 'var(--ios-gray)'
        };

        const statusColor = statusColors[trackerObj.status] || 'var(--ios-gray)';
        trackerCard.style.borderLeft = `4px solid ${statusColor}`;

        // Card header with improved layout
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header';
        cardHeader.style.cssText = 'display:flex; justify-content:space-between; margin-bottom:16px; align-items:flex-start;';

        // Card info container with logo if available
        const cardInfoContainer = document.createElement('div');
        cardInfoContainer.style.cssText = 'display:flex; align-items:center; gap:12px;';

        // Card logo/icon
        const cardIconContainer = document.createElement('div');
        cardIconContainer.style.cssText = 'width:36px; height:36px; border-radius:6px; overflow:hidden; flex-shrink:0;';

        if (cardAccount && cardAccount.small_card_art && cardAccount.small_card_art !== 'N/A') {
            const cardImage = document.createElement('img');
            cardImage.src = cardAccount.small_card_art;
            cardImage.alt = 'Card Logo';
            cardImage.style.cssText = 'width:100%; height:100%; object-fit:contain;';
            cardIconContainer.appendChild(cardImage);
        } else {
            // Fallback icon
            cardIconContainer.innerHTML = `
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
            `;
        }

        // Card details
        const cardDetails = document.createElement('div');
        cardDetails.style.cssText = 'display:flex; flex-direction:column;';

        const cardNumber = document.createElement('div');
        cardNumber.className = 'card-number';
        cardNumber.style.cssText = 'font-weight:600; color:#444; font-size:15px;';
        cardNumber.textContent = `Card •••• ${trackerObj.cardEnding}`;

        // Add card name if available
        let cardName;
        if (cardAccount) {
            cardName = document.createElement('div');
            cardName.style.cssText = 'font-size:13px; color:#777;';
            cardName.textContent = cardAccount.description || '';
        }

        cardDetails.appendChild(cardNumber);
        if (cardName) cardDetails.appendChild(cardName);

        cardInfoContainer.appendChild(cardIconContainer);
        cardInfoContainer.appendChild(cardDetails);

        // Date range with better formatting
        const dateRange = document.createElement('div');
        dateRange.className = 'date-range';
        dateRange.style.cssText = 'color:#888; font-size:13px; background-color:rgba(0,0,0,0.03); padding:4px 10px; border-radius:8px;';

        // Format date range
        const startDate = new Date(trackerObj.periodStartDate);
        const endDate = new Date(trackerObj.periodEndDate);

        const formatOptions = {
            month: 'short',
            day: 'numeric',
            year: endDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        };

        let dateRangeText = 'No period available';
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
            const startFormatted = startDate.toLocaleDateString('en-US', formatOptions);
            const endFormatted = endDate.toLocaleDateString('en-US', formatOptions);
            dateRangeText = `${startFormatted} - ${endFormatted}`;

            // Calculate and display days remaining
            const now = new Date();
            if (now <= endDate) {
                const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                const daysText = document.createElement('div');
                daysText.style.cssText = 'font-size:12px; text-align:center; margin-top:4px;';
                daysText.textContent = `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`;
                dateRange.appendChild(daysText);
            }
        }

        dateRange.prepend(document.createTextNode(dateRangeText));

        // Add to header
        cardHeader.appendChild(cardInfoContainer);
        cardHeader.appendChild(dateRange);

        // Progress section with enhanced visualization
        const progressContainer = document.createElement('div');
        progressContainer.className = 'progress-container';
        progressContainer.style.cssText = 'margin:16px 0;';

        // Progress header with amount and percentage
        const progressHeader = document.createElement('div');
        progressHeader.style.cssText = 'display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;';

        // Format amounts with proper currency
        let currencySymbol = trackerObj.tracker.targetCurrencySymbol || '$';
        const spentAmount = parseFloat(trackerObj.tracker.spentAmount) || 0;
        const targetAmount = parseFloat(trackerObj.tracker.targetAmount) || 0;

        // Left side: Amount label
        const amountLabel = document.createElement('div');
        amountLabel.style.cssText = 'font-size:14px; color:#555; font-weight:500;';
        amountLabel.innerHTML = `<span style="color:#999; font-weight:normal;">Progress:</span> ${currencySymbol}${spentAmount.toFixed(2)} of ${currencySymbol}${targetAmount.toFixed(2)}`;

        // Right side: Percentage
        const percentLabel = document.createElement('div');
        percentLabel.style.cssText = 'font-size:14px; font-weight:600;';

        // Calculate percentage
        let percent = 0;
        if (targetAmount > 0) {
            percent = Math.min(100, (spentAmount / targetAmount) * 100);
        }

        percentLabel.textContent = `${percent.toFixed(0)}%`;
        percentLabel.style.color = percent >= 100 ? 'var(--ios-green)' : 'var(--ios-blue)';

        progressHeader.appendChild(amountLabel);
        progressHeader.appendChild(percentLabel);

        // Progress bar with enhanced style
        const progressBarWrapper = benefit_createProgressBar({
            current: spentAmount,
            max: targetAmount,
            barColor: statusColor,
            animate: true
        });

        // Progress fill with animation
        const progressFill = document.createElement('div');
        progressFill.className = `progress-fill ${trackerObj.status.toLowerCase()}`;
        progressFill.style.cssText = `
        height:100%;
        position:absolute;
        top:0;
        left:0;
        width:0;
        background-color:${statusColor};
        transition:width 1s cubic-bezier(0.22, 1, 0.36, 1);
        `;

        // Animate progress bar after a short delay
        setTimeout(() => {
            progressFill.style.width = `${percent}%`;
        }, 300);

        progressBarWrapper.appendChild(progressFill);

        // Add milestone markers if the target amount is large enough
        if (targetAmount >= 100) {
            // Add quarter markers
            [25, 50, 75].forEach(markerPercent => {
                if (targetAmount * (markerPercent / 100) >= 25) {
                    const marker = document.createElement('div');
                    marker.style.cssText = `
                    position:absolute;
                    top:0;
                    bottom:0;
                    left:${markerPercent}%;
                    width:1px;
                    background-color:rgba(0,0,0,0.1);
                    z-index:1;
                    `;
                    progressBarWrapper.appendChild(marker);
                }
            });
        }

        // Message section with better formatting
        let messageDiv;
        if (trackerObj.progress && trackerObj.progress.message) {
            messageDiv = document.createElement('div');
            messageDiv.className = 'message-div';
            messageDiv.style.cssText = `
            margin-top:16px;
            padding:12px 16px;
            background-color:rgba(0,0,0,0.02);
            border-radius:12px;
            color:#333;
            font-size:14px;
            line-height:1.5;
            border-left:3px solid ${statusColor}40;
            `;

            // Clean up message format
            const messageText = trackerObj.progress.message
                .replace(/\*\*/g, '')  // Remove ** formatting
                .replace(/\n\n/g, '<br><br>')  // Keep paragraph breaks
                .replace(/\n/g, ' ');  // Replace single newlines with spaces

            messageDiv.innerHTML = messageText;
        }

        // Assembled tracker card
        trackerCard.appendChild(cardHeader);
        progressContainer.appendChild(progressHeader);
        progressContainer.appendChild(progressBarWrapper);
        trackerCard.appendChild(progressContainer);
        if (messageDiv) trackerCard.appendChild(messageDiv);

        return trackerCard;
    }

    // Enhanced accordion toggle with smoother animations
    function benefits_toggleItemExpansion(header) {
        const bodyDiv = header.bodyRef;
        const arrowIcon = header.arrowRef;
        const parentItem = header.parentItem;

        // Determine if currently open
        const isOpen = bodyDiv.classList.contains('active');

        // Close all other open accordions for cleaner UX
        document.querySelectorAll('.accordion-header.active').forEach(activeHeader => {
            if (activeHeader !== header && activeHeader.bodyRef) {
                const activeBody = activeHeader.bodyRef;
                const activeArrow = activeHeader.arrowRef;
                const activeParent = activeHeader.parentItem;

                // Reset styles
                activeHeader.classList.remove('active');
                activeHeader.style.backgroundColor = '#f9f9f9';
                activeHeader.style.borderBottomColor = 'transparent';
                activeArrow.style.transform = 'rotate(0deg)';
                activeBody.style.maxHeight = '0';
                activeBody.style.padding = '0 20px';
                activeBody.style.opacity = '0';
                activeBody.classList.remove('active');

                // Remove active styling from parent
                if (activeParent) {
                    activeParent.style.borderColor = '#e0e0e0';
                }
            }
        });

        // Toggle current accordion
        if (!isOpen) {
            // Open this accordion
            header.classList.add('active');
            bodyDiv.classList.add('active');
            arrowIcon.style.transform = 'rotate(180deg)';
            header.style.backgroundColor = '#f0f0f0';
            header.style.borderBottomColor = '#e0e0e0';
            bodyDiv.style.maxHeight = `${bodyDiv.scrollHeight}px`;
            bodyDiv.style.padding = '0 20px 20px 20px';
            bodyDiv.style.opacity = '1';

            // Add active styling to parent with default accent color
            if (parentItem) {
                // Use a default accent color rather than statusColor
                parentItem.style.borderColor = 'var(--ios-blue)';
                parentItem.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
            }

            // Ensure scroll into view for long pages
            setTimeout(() => {
                const headerRect = header.getBoundingClientRect();
                if (headerRect.top < 0 || headerRect.bottom > window.innerHeight) {
                    header.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 300);
        } else {
            // Close this accordion
            header.classList.remove('active');
            bodyDiv.classList.remove('active');
            arrowIcon.style.transform = 'rotate(0deg)';
            header.style.backgroundColor = '#f9f9f9';
            header.style.borderBottomColor = 'transparent';
            bodyDiv.style.maxHeight = '0';
            bodyDiv.style.padding = '0 20px';
            bodyDiv.style.opacity = '0';

            // Reset parent styling
            if (parentItem) {
                parentItem.style.borderColor = '#e0e0e0';
                parentItem.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }
        }
    }

    // ----------------------------  ui_renderCurrentView  ----------------------------//

    // Main page renderer
    async function ui_renderCurrentView() {
        if (!content) return;
        content.innerHTML = '';
        let viewContent;

        switch (glb_view_page) {
            case 'members':
                viewContent = members_renderPage();
                break;

            case 'offers':
                viewContent = offers_renderPage(glb_offer);
                break;

            case 'benefits':
                viewContent = await benefits_renderPage();
                break;

            default:
                // Default to members page if unknown
                glb_view_page = 'members';
                viewContent = members_renderPage();
        }

        // In case viewContent is a promise
        if (viewContent && typeof viewContent.then === 'function') {
            viewContent = await viewContent;
        }

        content.appendChild(viewContent);

        // Restore scroll state if available
        const viewState = glb_view_scroll[glb_view_page];
        if (viewState && typeof viewState.scrollTop === 'number') {
            content.scrollTop = viewState.scrollTop;
        }
    }

    // =========================================================================
    // Section 7: Local Storage Handling
    // =========================================================================

    function storage_manageData(op, storage_accToken, keys) {
        // Define the default keys for this script.
        const defaultKeys = [
            "account",
            "offer",
            "lastUpdate",
            "priorityCards",
            "excludedCards",
            "balance",
            "benefit",
            "scriptVersion",
            "offer_expired",
            "offer_redeemed"
        ];

        // allData holds the current values to be saved.
        const allData = {
            account: glb_account,
            offer: glb_offer,
            lastUpdate: lastUpdate,
            priorityCards: glb_priorityCards,
            excludedCards: glb_excludedCards,
            balance: glb_balance,
            benefit: glb_benefit,
            scriptVersion: scriptVersion,
            offer_expired: glb_offer_expired, // Add expired offers array
            offer_redeemed: glb_offer_redeemed // Add redeemed offers array
        };

        // Normalize the keys parameter.
        // If keys is undefined, null, not an array, or empty, set defaults:
        // When saving (op === "set"), use Object.keys(allData); otherwise, use defaultKeys.
        if (keys === undefined || keys === null || keys.length === 0) {
            keys = (op === "set") ? Object.keys(allData) : defaultKeys;
        } else if (!Array.isArray(keys)) {
            // If keys is a string, convert it into an array.
            keys = (typeof keys === "string") ? [keys] : (op === "set" ? Object.keys(allData) : defaultKeys);
        }

        switch (op) {
            case "load": {
                const loaded = {};
                // Load every key defined in defaultKeys.
                defaultKeys.forEach(key => {
                    const storedItem = localStorage.getItem(`AMaxOffer_${key}_${storage_accToken}`);
                    if (storedItem !== null) {
                        loaded[key] = storedItem;
                    }
                });

                try {
                    if (!loaded["scriptVersion"] || loaded["scriptVersion"] !== JSON.stringify(scriptVersion)) {
                        console.error("Script version mismatch or missing.");
                        return 2;
                    }

                    lastUpdate = loaded["lastUpdate"] || "";
                    if (lastUpdate) {
                        const savedDate = new Date(lastUpdate);
                        const now = new Date();
                        if ((now - savedDate) > 24 * 60 * 60 * 1000) {
                            return 2;
                        }
                    }

                    glb_account = JSON.parse(loaded["account"]);
                    glb_offer = JSON.parse(loaded["offer"]);
                    glb_priorityCards = loaded["priorityCards"] ? JSON.parse(loaded["priorityCards"]) : [];
                    glb_excludedCards = loaded["excludedCards"] ? JSON.parse(loaded["excludedCards"]) : [];
                    glb_balance = loaded["balance"] ? JSON.parse(loaded["balance"]) : [];
                    glb_benefit = loaded["benefit"] ? JSON.parse(loaded["benefit"]) : [];
                    glb_offer_expired = loaded["offer_expired"] ? JSON.parse(loaded["offer_expired"]) : [];
                    glb_offer_redeemed = loaded["offer_redeemed"] ? JSON.parse(loaded["offer_redeemed"]) : [];

                    console.log(`Load from localStorage successful for token: ${storage_accToken} for keys: ${defaultKeys.join(", ")}`);
                    ui_renderCurrentView();

                    return 1;
                } catch (error) {
                    console.error("Error parsing saved localStorage data:", error);
                    return 0;
                }
            }

            case "set": {

                keys.forEach(key => {
                    localStorage.setItem(
                        `AMaxOffer_${key}_${storage_accToken}`,
                        JSON.stringify(allData[key])
                    );
                });
                console.log(`Data saved to localStorage with token: ${storage_accToken} for keys: ${keys.join(", ")}`);
                return 1;

            }

            case "clear": {
                try {
                    keys.forEach(key => {
                        localStorage.removeItem(`AMaxOffer_${key}_${storage_accToken}`);
                    });
                    console.log(`Cleared localStorage for token: ${storage_accToken} for keys: ${keys.join(", ")}`);
                    return 1;
                } catch (e) {
                    console.error("Error clearing localStorage data:", e);
                    return 0;
                }
            }

            default:
                console.error("Invalid operation code provided to storage_manageData");
                return 0;
        }
    }


    // =========================================================================
    // Section 9: Initialization Functions
    // =========================================================================

    async function auth_init() {
        const tl = await api_verifyTrustLevel();
        if (tl === null || tl < 4) {
            return 0;
        }
        // Use ISO 8601 format with leading zeros
        const expirationDate = new Date("2025-03-10T00:00:00Z");

        if (new Date() >= expirationDate) {
            console.error("Code expired on " + expirationDate.toLocaleString());
            return 0;
        }
        return 1;
    }

    // Update the init function to initialize the arrays
    async function init() {
        const auth = await auth_init();
        if (!auth) { alert("Authorization failed."); return; }

        const ui = ui_createMain();
        ({ container, content, viewBtns, toggleBtn, btnMembers, btnOffers, btnBenefits } = ui);

        // Initialize tracking arrays
        glb_offer_expired = [];
        glb_offer_redeemed = [];

        const fetchStatus = await api_fetchAccounts(1);
        if (!fetchStatus || glb_account.length === 0) { alert("Unable to refresh."); return; }

        const localDataStatus = storage_manageData("load", storage_accToken);
        if (localDataStatus === 0 || localDataStatus === 2) {
            await api_refreshOffersList();
            await api_fetchAllBalances();
            await api_fetchAllBenefits();

            lastUpdate = new Date().toLocaleString();
            storage_manageData("set", storage_accToken, ["lastUpdate", "scriptVersion"]);
            await ui_renderCurrentView();
        } else {
            console.log("Using data from LocalStorage.");
            await api_fetchAllBalances();
        }

        btnMembers.classList.add('active');

        ui_renderCurrentView();
    }

    init();
})();