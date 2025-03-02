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
            background-color: rgba(255, 204, 0, 0.1) !important;
            border-left: 4px solid rgba(255, 204, 0, 0.8);
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
    let glb_benefit = [];
    let glb_balance = {};
    let glb_priorityCards = [];
    let glb_excludedCards = [];

    //  2) VIEW / UI STATES
    let glb_view_page = "summary";  // Possible: "summary", "members", "offers", "benefits"
    let glb_view_mini = true;       // Whether the main container is collapsed
    const glb_view_scroll = {
        summary: { scrollTop: 0 },
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


    let content, viewBtns, toggleBtn, container, btnSummary, btnMembers, btnOffers, btnBenefits;

    // =========================================================================
    // Section 3: UI Elements Creation
    // =========================================================================

    // Utility to create an element with optional properties.
    const createEl = (tag, { text = '', className = '', styles = {}, props = {}, children = [] } = {}) => {
        const el = document.createElement(tag);
        if (text) el.textContent = text;
        if (className) el.className = className;
        Object.assign(el.style, styles);
        Object.entries(props).forEach(([key, value]) => (el[key] = value));
        children.forEach(child => el.appendChild(child));
        return el;
    };

    // Helper to create a button with default styling and hover effects.
    const createButton = (label, onClick, { className = '', styles = {} } = {}) => {
        const btn = createEl('button', {
            text: label,
            className: className || 'amaxoffer-nav-button',
            styles
        });
        btn.addEventListener('click', onClick);
        return btn;
    };

    // Build the UI container with a custom font, header with title and navigation buttons, and a content area.
    const buildUI = () => {
        // Create the main container
        const container = createEl('div', {
            props: { id: 'card-utility-overlay' },
            className: 'amaxoffer-container amaxoffer-minimized'
        });

        // Title element.
        const title = createEl('span', {
            text: 'AMaxOffer',
            className: 'amaxoffer-title'
        });

        // Navigation buttons for different views.
        const btnSummary = createButton('Summary', () => switchView('summary', btnSummary));
        const btnMembers = createButton('Members', () => switchView('members', btnMembers));
        const btnOffers = createButton('Offers', () => switchView('offers', btnOffers));

        const btnBenefits = createButton('Benefits', () => switchView('benefits', btnBenefits));

        const viewBtns = createEl('div', {
            className: 'amaxoffer-nav',
            children: [btnSummary, btnMembers, btnOffers, btnBenefits]
        });
        viewBtns.style.display = 'none';

        // Toggle button for minimizing/expanding the container.
        const toggleBtn = createButton('➕', toggleMinimize, {
            className: 'amaxoffer-toggle-btn'
        });

        // Header containing the title, navigation buttons, and toggle button.
        const header = createEl('div', {
            props: { id: 'card-utility-header' },
            className: 'amaxoffer-header',
            children: [title, viewBtns, toggleBtn]
        });

        // Main content area.
        const content = createEl('div', {
            props: { id: 'card-utility-content' },
            className: 'amaxoffer-content',
            text: 'Loading...'
        });
        content.style.display = 'none';

        container.append(header, content);
        document.body.appendChild(container);

        // Make the header draggable.
        makeDraggable(header, container);

        return { container, content, viewBtns, toggleBtn, btnSummary, btnMembers, btnOffers, btnBenefits };
    };

    // Make an element draggable by tracking mouse movement.
    const makeDraggable = (handle, container) => {
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
    const toggleMinimize = () => {
        glb_view_mini = !glb_view_mini;
        content.style.display = glb_view_mini ? 'none' : 'block';
        viewBtns.style.display = glb_view_mini ? 'none' : 'flex';
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
                    renderPage();
                    container.removeEventListener('transitionend', onTransitionEnd);
                }
            });
        }
    };

    // Switch between views, update button styles, and trigger re-rendering.
    const switchView = (view, activeBtn) => {
        saveCurrentScrollState();
        glb_view_page = view;
        [btnSummary, btnMembers, btnOffers, btnBenefits].forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
        renderPage();
    };

    // Save the current scroll position for the active view.
    const saveCurrentScrollState = () => {
        if (content) {
            glb_view_scroll[glb_view_page].scrollTop = content.scrollTop;
        }
    };


    // =========================================================================
    // Section 3.5: Anti Idle & Session Extender
    // =========================================================================


    const EventListenerManager = (() => {
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

    EventListenerManager.removeVisibilityListeners();
    EventListenerManager.startSessionExtender(60000);

    // =========================================================================
    // Section 4: General Helper Functions
    // =========================================================================


    function formatDate(dateStr, roundUp = false) {
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


    function sanitizeValue(val) {
        if (val === "N/A" || val === null || val === undefined || val === "" || val === 0) {
            return "0";
        }
        return val;
    }


    // Parse card index into main and sub-index components
    function parseCardIndex(indexStr) {
        if (!indexStr) return [0, 0];
        const parts = indexStr.split('-');
        const main = parseInt(parts[0], 10) || 0;
        const sub = parts.length > 1 ? (parseInt(parts[1], 10) || 0) : 0;
        return [main, sub];
    }


    // Parse a numeric value from a string, cleaning common symbols
    function parseNumericValue(str) {
        if (!str) return NaN;
        const cleaned = str.replace(/[$,%]/g, '').replace(/\s*back\s*/i, '').trim();
        return parseFloat(cleaned) || NaN;
    }


    // Run tasks in batches to control concurrency
    async function runInBatches(tasks, limit) {
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
    function getBasicAccountEndingForSuppAccount(suppAccount) {
        const parts = suppAccount.cardIndex.split('-');
        if (parts.length > 1) {
            const mainIndex = parts[0];
            // Find the basic account whose cardIndex equals mainIndex and has relationship "BASIC"
            const basicAccount = glb_account.find(acc => acc.cardIndex === mainIndex && acc.relationship === "BASIC");
            if (basicAccount) {
                return basicAccount.display_account_number;
            }
        }
        return "N/A";
    }


    // Utility to sort the account data based on a key
    function sort_memberTab(key) {
        if (glb_memberSortState.key === key) {
            glb_memberSortState.direction *= -1;
        } else {
            glb_memberSortState.key = key;
            glb_memberSortState.direction = 1;
        }
        if (key === 'cardIndex') {
            glb_account.sort((a, b) => {
                const [aMain, aSub] = parseCardIndex(a.cardIndex);
                const [bMain, bSub] = parseCardIndex(b.cardIndex);
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
        saveCurrentScrollState();
        const container = document.getElementById('members-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(renderMembers_table());
        }
    }


    // Utility to sort the offer data based on a key
    function sort_offerTab(key) {
        if (glb_offerSortState.key === key) {
            glb_offerSortState.direction *= -1;
        } else {
            glb_offerSortState.key = key;
            glb_offerSortState.direction = (key === "favorite") ? -1 : 1;
        }
        glb_offer.sort((a, b) => {
            if (key === "favorite") {
                if (a.favorite === b.favorite) return 0;
                return a.favorite ? -1 : 1;
            }
            const numericColumns = ["reward", "threshold", "percentage"];
            const valA = a[key] || "";
            const valB = b[key] || "";
            if (numericColumns.includes(key)) {
                const numA = parseNumericValue(valA);
                const numB = parseNumericValue(valB);
                if (isNaN(numA) && isNaN(numB)) {
                    return glb_offerSortState.direction * valA.localeCompare(valB);
                } else if (isNaN(numA)) {
                    return 1 * glb_offerSortState.direction;
                } else if (isNaN(numB)) {
                    return -1 * glb_offerSortState.direction;
                }
                return glb_offerSortState.direction * (numA - numB);
            } else if (key === "eligibleCards" || key === "enrolledCards") {
                const lenA = Array.isArray(valA) ? valA.length : 0;
                const lenB = Array.isArray(valB) ? valB.length : 0;
                return glb_offerSortState.direction * (lenA - lenB);
            } else {
                return glb_offerSortState.direction * valA.toString().localeCompare(valB.toString());
            }
        });
        saveCurrentScrollState();

        const container = document.getElementById('offers-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(renderOffers_table());
        }
    }


    // Utility to parse offer details from the description
    function parseOfferDetails(description = "") {
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


    // Merge the old favorites with the new offer data
    function mergeFavorites(newOfferMap) {
        const oldFavorites = {};
        if (glb_offer && Array.isArray(glb_offer)) {
            glb_offer.forEach(o => {
                if (o.source_id) {
                    oldFavorites[o.source_id] = o.favorite === true;
                }
            });
        }
        for (const sid in newOfferMap) {
            if (oldFavorites.hasOwnProperty(sid)) {
                newOfferMap[sid].favorite = oldFavorites[sid];
            }
        }
    }


    // =========================================================================
    // Section 5: Data Fetching Functions
    // =========================================================================

    async function get_accounts(readonly = false) {
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
                    display_account_number: item.account?.display_account_number || 'N/A',
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
                            display_account_number: supp.account?.display_account_number || 'N/A',
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
                localStorageHandler("set", storage_accToken, ["account"]);
            }
            return true;
        }
    }


    async function fetchRequest_offer(accountToken) {
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


    async function get_offers() {
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
            const offers = await fetchRequest_offer(acc.account_token);
            offers.forEach(offer => {
                const sourceId = offer.source_id;
                if (!sourceId) return;
                const offerName = (offer.name || "").toLowerCase();
                if (skipPatterns.some(pattern => offerName.includes(pattern.toLowerCase()))) {
                    return;
                }
                if (!offerInfoTable[sourceId]) {
                    const details = parseOfferDetails(offer.short_description || "");
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
                    if (!offerInfoTable[sourceId].eligibleCards.includes(acc.display_account_number)) {
                        offerInfoTable[sourceId].eligibleCards.push(acc.display_account_number);
                    }
                } else if (offer.status === "ENROLLED") {
                    if (!offerInfoTable[sourceId].enrolledCards.includes(acc.display_account_number)) {
                        offerInfoTable[sourceId].enrolledCards.push(acc.display_account_number);
                    }
                }
            });
        }));
        mergeFavorites(offerInfoTable);
        glb_account.forEach(acc => {
            acc.eligibleOffers = 0;
            acc.enrolledOffers = 0;
        });
        Object.values(offerInfoTable).forEach(offer => {
            if (Array.isArray(offer.eligibleCards)) {
                offer.eligibleCards.forEach(card => {
                    const acc = glb_account.find(a => a.display_account_number === card);
                    if (acc) acc.eligibleOffers = (acc.eligibleOffers || 0) + 1;
                });
            }
            if (Array.isArray(offer.enrolledCards)) {
                offer.enrolledCards.forEach(card => {
                    const acc = glb_account.find(a => a.display_account_number === card);
                    if (acc) acc.enrolledOffers = (acc.enrolledOffers || 0) + 1;
                });
            }
        });

        // Refresh the offer data and re-render the UI.
        if (offerInfoTable && typeof offerInfoTable === 'object') {
            glb_offer = Object.values(offerInfoTable);
            localStorageHandler("set", storage_accToken, ["offer"]);
        }
    }


    async function fetchRequest_balance(accountToken) {
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


    async function get_balance() {
        const basicAccounts = glb_account.filter(acc => acc.relationship === "BASIC");
        try {
            await Promise.all(basicAccounts.map(async (acc) => {
                if (!acc.financialData) {
                    acc.financialData = await fetchRequest_balance(acc.account_token);
                }
            }));

            localStorageHandler("set", storage_accToken, ["account"]);
        } catch (error) {
            return;
        }

    }


    async function fetchRequest_benefit(accountToken, locale = "en-US", limit = "ALL") {
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


    async function get_benefit() {
        const basicAccounts = glb_account.filter(acc => acc.relationship === "BASIC");
        let newTrackers = [];
        await Promise.all(basicAccounts.map(async (acc) => {
            const trackers = await fetchRequest_benefit(acc.account_token);
            if (Array.isArray(trackers)) {
                trackers.forEach(tracker => {
                    // Attach the BASIC card's display number so we know which card the tracker is for
                    tracker.cardEnding = acc.display_account_number;
                    // Ensure numeric values for spent and target amounts
                    tracker.spentAmount = parseFloat(tracker.spentAmount) || 0;
                    tracker.targetAmount = parseFloat(tracker.targetAmount) || 0;
                    newTrackers.push(tracker);
                });
            }
        }));

        if (Array.isArray(newTrackers)) {
            glb_benefit = newTrackers;
            localStorageHandler("set", storage_accToken, "benefit");
        }

    }



    async function get_trustLevel() {
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


    async function fetchGet_enrollOffer(accountToken, offerIdentifier) {
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


    async function get__batchEnrollOffer(offerSourceId, accountNumber) {
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
            const cardNumber = account.display_account_number;
            offer.eligibleCards = offer.eligibleCards.filter(c => c !== cardNumber);
            if (!offer.enrolledCards.includes(cardNumber)) {
                offer.enrolledCards.push(cardNumber);
            }
        };

        // Build tasks: for each offer, for each eligible card, find active matching accounts.
        eligibleOffers.forEach(offer => {
            offer.eligibleCards.forEach(card => {
                const matchingAccounts = glb_account.filter(acc =>
                    acc.display_account_number === card &&
                    acc.account_status?.trim().toLowerCase() === "active" &&
                    (!accountNumber || acc.display_account_number === accountNumber)
                );
                matchingAccounts.forEach(account => {
                    tasks.push(async () => {
                        totalEnrollAttempts++;
                        const cardNumber = account.display_account_number;

                        if (glb_excludedCards.includes(cardNumber)) {
                            console.log(`Skipping card ${cardNumber} as it is excluded.`);
                            return { offerId: offer.offerId, accountToken: account.account_token, result: false, explanationMessage: "Card excluded" };
                        }
                        // Delay for non-priority cards.
                        if (!glb_priorityCards.includes(cardNumber)) {
                            await delay(500);
                        }
                        try {
                            const enrollResult = await fetchGet_enrollOffer(account.account_token, offer.offerId);
                            if (enrollResult.result) {
                                successfulEnrollments++;
                                console.log(`Enroll "${offer.name}" on card ${cardNumber} successful`);
                                updateOfferEnrollment(offer, account);
                                return { offerId: offer.offerId, accountToken: account.account_token, result: true };
                            } else {
                                console.log(`Enroll "${offer.name}" on card ${cardNumber} failed. Reason: ${enrollResult.explanationMessage || "No explanation provided."}`);
                                return {
                                    offerId: offer.offerId,
                                    accountToken: account.account_token,
                                    result: false,
                                    explanationMessage: enrollResult.explanationMessage
                                };
                            }
                        } catch (err) {
                            console.log(`Enroll "${offer.name}" on card ${cardNumber} errored:`, err);
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
        const enrollmentResults = await runInBatches(tasks, runInBatchesLimit);
        await get_offers();

        if (totalEnrollAttempts > 0) {
            const successRate = ((successfulEnrollments / totalEnrollAttempts) * 100).toFixed(2);
            console.log(`Enrollment success rate: ${successfulEnrollments}/${totalEnrollAttempts} (${successRate}%)`);
        } else {
            console.log('No enrollment attempts were made.');
        }
        return enrollmentResults;
    }


    async function runInBatches(tasks, limit) {
        const results = [];
        let i = 0;
        while (i < tasks.length) {
            const chunk = tasks.slice(i, i + limit);
            const chunkResults = await Promise.all(chunk.map(fn => fn()));
            results.push(...chunkResults);
            i += limit;
        }
        return results;
    }


    // =========================================================================
    // Section 6: UI Rendering Functions
    // =========================================================================


    // Core table renderer with iOS styling and smaller text
    function renderTable(headers, colWidths, items, cellRenderer, sortHandler, sortableKeys) {
        const tableElement = document.createElement('table');
        tableElement.className = 'ios-table';
        tableElement.style.fontSize = '13px';
        tableElement.style.borderCollapse = 'separate';
        tableElement.style.borderSpacing = '0';

        // Build header with improved styling
        const thead = document.createElement('thead');
        thead.className = 'ios-table-head';
        thead.style.background = 'var(--ios-header-bg)';
        thead.style.borderBottom = '1px solid rgba(60, 60, 67, 0.2)';
        thead.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.05)';
        thead.style.position = 'sticky';
        thead.style.top = '0';
        thead.style.zIndex = '10';

        const headerRow = document.createElement('tr');

        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.textContent = headerItem.label;
            th.style.fontSize = '13px';
            th.style.padding = '12px 14px';
            th.style.fontWeight = '600';
            th.style.color = 'var(--ios-text-primary)';
            th.style.letterSpacing = '-0.01em';
            th.style.textAlign = 'center';
            th.style.borderBottom = '1px solid rgba(60, 60, 67, 0.12)';
            th.style.verticalAlign = 'middle';

            if (colWidths[headerItem.key]) {
                th.style.width = colWidths[headerItem.key];
            }

            // Add sort functionality with improved styling
            if (sortableKeys && sortableKeys.includes(headerItem.key) && sortHandler) {
                th.className = 'sortable';
                th.setAttribute('data-sort-key', headerItem.key);
                th.style.paddingRight = '22px';
                th.style.position = 'relative';
                th.style.cursor = 'pointer';
                th.style.transition = 'background-color 0.2s ease';

                // Add hover effect to sortable headers
                th.addEventListener('mouseenter', () => {
                    th.style.backgroundColor = 'rgba(0, 0, 0, 0.02)';
                });
                th.addEventListener('mouseleave', () => {
                    th.style.backgroundColor = 'transparent';
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

                sortButton.appendChild(sortIcon);
                th.appendChild(sortButton);

                // Handle click event
                th.addEventListener('click', () => {
                    // Reset all headers
                    headerRow.querySelectorAll('.sortable').forEach(header => {
                        const btn = header.querySelector('.ios-sort-button');
                        if (btn) {
                            btn.className = 'ios-sort-button';
                            btn.querySelector('span').textContent = '•';
                        }
                    });

                    // Update current header
                    const currentSort = th.getAttribute('data-sort-direction') || 'none';
                    if (currentSort === 'none' || currentSort === 'desc') {
                        th.setAttribute('data-sort-direction', 'asc');
                        sortIcon.textContent = '↑';
                        sortButton.classList.add('asc');
                    } else {
                        th.setAttribute('data-sort-direction', 'desc');
                        sortIcon.textContent = '↓';
                        sortButton.classList.add('desc');
                    }

                    // Call the sort handler
                    sortHandler(headerItem.key);
                });
            }

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        tableElement.appendChild(thead);

        // Helper: determine whether to highlight the account row
        function shouldHighlightAccount(acc) {
            if (!glb_filters.memberMerchantSearch || glb_filters.memberMerchantSearch.trim().length === 0) {
                return false;
            }
            const searchTerm = glb_filters.memberMerchantSearch.trim().toLowerCase();
            return glb_offer.some(offer => {
                if (offer.name.toLowerCase().includes(searchTerm)) {
                    return (Array.isArray(offer.eligibleCards) && offer.eligibleCards.includes(acc.display_account_number)) ||
                        (Array.isArray(offer.enrolledCards) && offer.enrolledCards.includes(acc.display_account_number));
                }
                return false;
            });
        }

        // Build table body
        const tbody = document.createElement('tbody');

        if (items.length === 0) {
            // Create empty state
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = headers.length;
            emptyCell.className = 'ios-empty-state';

            emptyCell.innerHTML = `
        <div class="ios-empty-state-container">
            <div class="ios-empty-state-icon">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            </div>
            <div class="ios-empty-state-title">No Items Found</div>
            <div class="ios-empty-state-message">Try adjusting your search or filters</div>
            <button class="ios-empty-button">Reset Filters</button>
        </div>
    `;

            // Add reset filters functionality
            const resetButton = emptyCell.querySelector('.ios-empty-button');
            resetButton.addEventListener('click', () => {
                if (typeof glb_filters !== 'undefined') {
                    // Reset all relevant filters
                    if (glb_filters.memberMerchantSearch) {
                        glb_filters.memberMerchantSearch = '';
                    }

                    if (glb_filters.offerMerchantSearch) {
                        glb_filters.offerMerchantSearch = '';
                    }
                    if (glb_filters.offerCardEnding) {
                        glb_filters.offerCardEnding = '';
                    }
                    if (glb_filters.offerFav) {
                        glb_filters.offerFav = false;
                    }

                    if (glb_filters.memberStatus !== 'Active') {
                        glb_filters.memberStatus = 'Active';
                    }
                    if (glb_filters.memberCardtype !== 'all') {
                        glb_filters.memberCardtype = 'all';
                    }

                    // Refresh the view
                    if (typeof renderPage === 'function') {
                        renderPage();
                    }
                }
            });

            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            // Render rows with data
            items.forEach((item, idx) => {
                const row = document.createElement('tr');

                // Add highlight class if needed
                if (shouldHighlightAccount(item)) {
                    row.classList.add('ios-highlight-row');
                }

                headers.forEach((headerItem) => {
                    const td = document.createElement('td');
                    td.style.fontSize = '13px'; // Smaller cell text
                    td.style.padding = '10px 14px'; // Reduced padding (from 16px 14px)

                    if (colWidths[headerItem.key]) {
                        td.style.width = colWidths[headerItem.key];
                        td.style.maxWidth = colWidths[headerItem.key];
                        td.style.whiteSpace = 'normal';
                        td.style.wordWrap = 'break-word';
                    }

                    // Use the provided cellRenderer
                    const content = cellRenderer(item, headerItem);

                    if (content instanceof Node) {
                        // For Node elements like images, ensure they're centered
                        if (content.tagName === 'IMG') {
                            content.style.display = 'block';
                            content.style.margin = '0 auto';
                        } else if (content.tagName === 'BUTTON' || content.tagName === 'INPUT') {
                            // Center buttons and inputs
                            content.style.margin = '0 auto';
                            content.style.display = 'block';
                        }
                        // Apply smaller font size to buttons and inputs
                        if (content.tagName === 'BUTTON' || content.tagName === 'INPUT') {
                            content.style.fontSize = '12px'; // Smaller button/input text
                        }
                        td.appendChild(content);
                    } else if (typeof content === 'string') {
                        // Format currency
                        if (/^\$?\d+(\.\d{2})?$/.test(content)) {
                            const span = document.createElement('span');
                            span.className = 'ios-currency';
                            span.textContent = content;
                            span.style.fontSize = '13px'; // Smaller currency text
                            td.appendChild(span);
                        }
                        // Handle status-like text
                        else if (['active', 'inactive', 'pending', 'completed', 'failed', 'success', 'canceled'].includes(content.toLowerCase())) {
                            const statusSpan = document.createElement('span');
                            statusSpan.className = `ios-status ${content.toLowerCase()}`;
                            statusSpan.textContent = content;
                            statusSpan.style.fontSize = '12px'; // Smaller status text
                            td.appendChild(statusSpan);
                        }
                        // Regular text content
                        else {
                            td.textContent = content || '';
                        }
                    } else {
                        td.textContent = content || '';
                    }

                    row.appendChild(td);
                });

                tbody.appendChild(row);
            });
        }

        tableElement.appendChild(tbody);
        return tableElement;
    }

    // iOS-styled search input component with updated styling
    function createSearchInput(placeholder, value, callback) {
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.width = '100%';
        container.style.minWidth = '180px';
        container.style.maxWidth = '250px';
        container.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.03)';
        container.style.borderRadius = '10px';

        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        input.value = value || '';
        input.style.width = '100%';
        input.style.padding = '10px 32px 10px 12px';
        input.style.borderRadius = '10px';
        input.style.border = '1px solid var(--ios-border)';
        input.style.backgroundColor = 'rgba(250, 250, 250, 0.7)';
        input.style.fontSize = '13px';
        input.style.fontFamily = 'var(--ios-font)';
        input.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05) inset';
        input.style.transition = 'all 0.2s ease';

        input.addEventListener('focus', () => {
            input.style.outline = 'none';
            input.style.borderColor = 'var(--ios-blue)';
            input.style.boxShadow = '0 0 0 2px rgba(0, 122, 255, 0.08)';
        });

        input.addEventListener('blur', () => {
            input.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05) inset';
            input.style.borderColor = 'var(--ios-border)';
        });

        // Search icon
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('width', '16');
        icon.setAttribute('height', '16');
        icon.setAttribute('viewBox', '0 0 24 24');
        icon.style.position = 'absolute';
        icon.style.right = '12px';
        icon.style.top = '50%';
        icon.style.transform = 'translateY(-50%)';
        icon.style.color = 'var(--ios-blue)';
        icon.style.opacity = '0.6';
        icon.style.pointerEvents = 'none';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z');
        path.setAttribute('fill', 'currentColor');
        icon.appendChild(path);

        // Define debounce function
        function debounce(func, wait) {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        }

        // Add event listener with debounce
        input.addEventListener('input', debounce(() => {
            callback(input.value.trim());
        }, 300));

        container.appendChild(input);
        container.appendChild(icon);

        return container;
    }

    // Summary page renderer
    async function renderSummary_page() {
        // Compute offer statistics using reduce
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

        // Compute financial stats for BASIC accounts with financialData
        const { totalBalance, totalPending, totalRemaining } = glb_account
            .filter(acc => acc.relationship === "BASIC" && acc.financialData)
            .reduce((fin, acc) => {
                fin.totalBalance += parseFloat(acc.financialData.statement_balance_amount) || 0;
                fin.totalPending += parseFloat(acc.financialData.debits_credits_payments_total_amount) || 0;
                fin.totalRemaining += parseFloat(acc.financialData.remaining_statement_balance_amount) || 0;
                return fin;
            }, { totalBalance: 0, totalPending: 0, totalRemaining: 0 });

        const numAccounts = glb_account.length;
        const updateTime = lastUpdate || "Never";

        // Create main container with iOS-style
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'summary-container';

        // Header: Title with iOS-style typography and Last Updated badge
        const header = document.createElement('div');
        header.className = 'summary-header';

        const title = document.createElement('h2');
        title.className = 'summary-title';
        title.textContent = 'Account Overview';

        const updateBadge = document.createElement('div');
        updateBadge.className = 'update-badge';
        updateBadge.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" style="margin-right: 6px; fill: #007AFF;">
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-13v5l4.4 2.6.6-1-3.6-2.1V7H11z"/>
        </svg>
        Last Updated: ${updateTime}
    `;

        header.appendChild(title);
        header.appendChild(updateBadge);
        summaryDiv.appendChild(header);

        // Status element for refresh operations
        const refreshStatusEl = document.createElement('div');
        refreshStatusEl.className = 'refresh-status';
        refreshStatusEl.id = 'refresh-status';

        // Create icons for stat cards
        const iconColors = {
            card: '52, 199, 89', // iOS green
            balance: '255, 149, 0', // iOS orange
            pending: '0, 122, 255', // iOS blue
            remain: '255, 45, 85', // iOS red
            enrolled: '88, 86, 214', // iOS purple
            pending_enroll: '255, 204, 0', // iOS yellow
            eligible: '142, 142, 147', // iOS gray
            total: '50, 173, 230' // iOS teal
        };

        // Icons in iOS style
        const cardIcon = `<svg width="24" height="24" viewBox="0 0 24 24" style="fill: rgb(${iconColors.card});">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
    </svg>`;

        const balanceIcon = `<svg width="24" height="24" viewBox="0 0 24 24" style="fill: rgb(${iconColors.balance});">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
    </svg>`;

        const pendingIcon = `<svg width="24" height="24" viewBox="0 0 24 24" style="fill: rgb(${iconColors.pending});">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm-1-14v7l5.2 3.2.8-1.3-4.5-2.7V6H11z"/>
    </svg>`;

        const remainIcon = `<svg width="24" height="24" viewBox="0 0 24 24" style="fill: rgb(${iconColors.remain});">
        <path d="M16 6v8h3v4h2V6c0-1.1-.9-2-2-2H7L7 6h9zM3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10zm2-8h6v8H5v-8z"/>
    </svg>`;

        const enrolledIcon = `<svg width="24" height="24" viewBox="0 0 24 24" style="fill: rgb(${iconColors.enrolled});">
        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
    </svg>`;

        const pendingEnrollIcon = `<svg width="24" height="24" viewBox="0 0 24 24" style="fill: rgb(${iconColors.pending_enroll});">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14h2v2h-2v-2zm1-10c-2.76 0-5 2.24-5 5h2c0-1.65 1.35-3 3-3s3 1.35 3 3c0 1.65-1.35 3-3 3v2c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
    </svg>`;

        const eligibleIcon = `<svg width="24" height="24" viewBox="0 0 24 24" style="fill: rgb(${iconColors.eligible});">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-5h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2s-2 .89-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1zm1.5-6c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v1h-3v-1z"/>
    </svg>`;

        const totalIcon = `<svg width="24" height="24" viewBox="0 0 24 24" style="fill: rgb(${iconColors.total});">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 14H9v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zM3 7h18v2H3V7zm4 6H5v-2h2v2zm4 0H9v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z"/>
    </svg>`;

        // Create a helper function to create stat items
        function createStatItem(label, value, color, icon) {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';

            const statContainer = document.createElement('div');
            statContainer.className = 'stat-container';

            const iconContainer = document.createElement('div');
            iconContainer.className = 'icon-container';
            iconContainer.style.backgroundColor = `rgba(${color}, 0.1)`;
            iconContainer.innerHTML = icon;

            const statValue = document.createElement('div');
            statValue.className = 'stat-value';
            statValue.style.color = `rgb(${color})`;
            statValue.textContent = value;

            statContainer.appendChild(iconContainer);
            statContainer.appendChild(statValue);

            const statLabel = document.createElement('div');
            statLabel.className = 'stat-label';
            statLabel.textContent = label;

            statItem.appendChild(statContainer);
            statItem.appendChild(statLabel);

            return statItem;
        }

        const statsContainer = document.createElement('div');
        statsContainer.className = 'stats-container';
        statsContainer.id = 'statsContainer';

        // Create stats row
        const statsRow = document.createElement('div');
        statsRow.className = 'stats-row';

        // Add all stat items to the row
        statsRow.appendChild(createStatItem('Card Amount on Login', `${numAccounts}`, iconColors.card, cardIcon));
        statsRow.appendChild(createStatItem('Total Balance', `${Math.round(totalBalance)}`, iconColors.balance, balanceIcon));
        statsRow.appendChild(createStatItem('Total Pending Charge', `${Math.round(totalPending)}`, iconColors.pending, pendingIcon));
        statsRow.appendChild(createStatItem('Remain Statement', `${Math.round(totalRemaining)}`, iconColors.remain, remainIcon));
        statsRow.appendChild(createStatItem('Offers Fully Enrolled', distinctFullyEnrolled, iconColors.enrolled, enrolledIcon));
        statsRow.appendChild(createStatItem('Offers Pending Enrollment', distinctNotFullyEnrolled, iconColors.pending_enroll, pendingEnrollIcon));
        statsRow.appendChild(createStatItem('Total Eligible Offers', totalEligible, iconColors.eligible, eligibleIcon));
        statsRow.appendChild(createStatItem('Total Enrolled Offers', totalEnrolled, iconColors.total, totalIcon));

        statsContainer.appendChild(statsRow);
        summaryDiv.appendChild(statsContainer);

        // Button container with status text and buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';

        // Create action buttons container
        const actionButtonsContainer = document.createElement('div');
        actionButtonsContainer.className = 'action-buttons';

        // Helper to create iOS-style buttons
        function createActionButton(text, icon, onClick, color = 'var(--ios-blue)') {
            const btn = document.createElement('button');
            btn.className = 'ios-button';
            btn.style.backgroundColor = color;
            btn.innerHTML = `${icon} ${text}`;
            btn.addEventListener('click', onClick);
            return btn;
        }

        // iOS-style icon for refresh button
        const refreshIcon = `<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24">
        <path d="M17.65 6.35A7.95 7.95 0 0 0 12 4C7.58 4 4 7.58 4 12s3.58 8 8 8a7.94 7.94 0 0 0 6.65-3.65l-1.42-1.42A5.973 5.973 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
    </svg>`;

        // iOS-style icon for enroll button
        const enrollIcon = `<svg style="width:20px;height:20px;fill:white" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>`;

        const refreshBtn = createActionButton('Refresh Data', refreshIcon, async () => {
            try {
                refreshStatusEl.textContent = "Refreshing accounts...";
                await get_accounts();
                refreshStatusEl.textContent = "Refreshing offers...";
                await get_offers();
                refreshStatusEl.textContent = "Refreshing balances...";
                await get_balance();
                refreshStatusEl.textContent = "Refreshing benefits...";
                await get_benefit();
                lastUpdate = new Date().toLocaleString();
                localStorageHandler("set", storage_accToken, ["lastUpdate", "scriptVersion"]);
                refreshStatusEl.textContent = "Refresh complete.";
                await renderPage();
            } catch (e) {
                console.error('Error refreshing data:', e);
                refreshStatusEl.textContent = "Error refreshing data.";
            }
        });

        const enrollBtn = createActionButton('Enroll All', enrollIcon, async () => {
            try {
                await get__batchEnrollOffer();
                renderPage();
            } catch (e) {
                console.error('Error enrolling all:', e);
            }
        }, 'var(--ios-green)');

        // Add status text and both buttons to action buttons container
        actionButtonsContainer.append(refreshStatusEl, refreshBtn, enrollBtn);

        // Add action buttons container to button container
        buttonContainer.appendChild(actionButtonsContainer);
        summaryDiv.appendChild(buttonContainer);

        return summaryDiv;
    }

    // Improved Members filter bar with iOS styling
    function renderMembers_filterBar() {
        const filtersCard = document.createElement('div');
        filtersCard.style.background = 'var(--ios-background)';
        filtersCard.style.backdropFilter = 'blur(8px)';
        filtersCard.style.WebkitBackdropFilter = 'blur(8px)';
        filtersCard.style.borderRadius = '14px';
        filtersCard.style.padding = '16px 20px';
        filtersCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        filtersCard.style.display = 'flex';
        filtersCard.style.gap = '16px';
        filtersCard.style.flexWrap = 'wrap';
        filtersCard.style.width = '100%';
        filtersCard.style.boxSizing = 'border-box';
        filtersCard.style.border = '1px solid var(--ios-border)';
        filtersCard.style.marginBottom = '16px';
        filtersCard.style.alignItems = 'center';

        // Status Filter Container
        const statusFilterDiv = document.createElement('div');
        statusFilterDiv.style.display = 'flex';
        statusFilterDiv.style.alignItems = 'center';
        statusFilterDiv.style.gap = '8px';
        statusFilterDiv.style.padding = '6px 12px';
        statusFilterDiv.style.backgroundColor = 'rgba(250, 250, 250, 0.5)';
        statusFilterDiv.style.borderRadius = '10px';
        statusFilterDiv.style.border = '1px solid var(--ios-border)';

        const statusFilterLabel = document.createElement('label');
        statusFilterLabel.textContent = 'Status:';
        statusFilterLabel.style.fontSize = '13px';
        statusFilterLabel.style.fontWeight = '500';
        statusFilterLabel.style.color = 'var(--ios-text-secondary)';
        statusFilterLabel.style.fontFamily = 'var(--ios-font)';

        const statusFilterSelect = document.createElement('select');
        statusFilterSelect.id = 'status-filter';
        statusFilterSelect.style.border = 'none';
        statusFilterSelect.style.backgroundColor = 'transparent';
        statusFilterSelect.style.fontSize = '13px';
        statusFilterSelect.style.fontFamily = 'var(--ios-font)';
        statusFilterSelect.style.color = 'var(--ios-text-primary)';
        statusFilterSelect.style.padding = '2px 4px';
        statusFilterSelect.style.borderRadius = '6px';
        statusFilterSelect.style.appearance = 'none';
        statusFilterSelect.style.backgroundImage = 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5%22%20stroke%3D%22%23777%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")';
        statusFilterSelect.style.backgroundRepeat = 'no-repeat';
        statusFilterSelect.style.backgroundPosition = 'right 4px center';
        statusFilterSelect.style.backgroundSize = '14px';
        statusFilterSelect.style.paddingRight = '20px';
        statusFilterSelect.style.cursor = 'pointer';

        const optionAll = document.createElement('option');
        optionAll.value = 'all';
        optionAll.textContent = 'All';
        const optionActive = document.createElement('option');
        optionActive.value = 'Active';
        optionActive.textContent = 'Active';
        const optionCanceled = document.createElement('option');
        optionCanceled.value = 'Canceled';
        optionCanceled.textContent = 'Canceled';

        statusFilterSelect.appendChild(optionAll);
        statusFilterSelect.appendChild(optionActive);
        statusFilterSelect.appendChild(optionCanceled);
        statusFilterSelect.value = glb_filters.memberStatus;

        statusFilterSelect.addEventListener('change', () => {
            glb_filters.memberStatus = statusFilterSelect.value;
            renderPage();
        });

        statusFilterDiv.appendChild(statusFilterLabel);
        statusFilterDiv.appendChild(statusFilterSelect);

        // Type Filter Container
        const typeFilterDiv = document.createElement('div');
        typeFilterDiv.style.display = 'flex';
        typeFilterDiv.style.alignItems = 'center';
        typeFilterDiv.style.gap = '8px';
        typeFilterDiv.style.padding = '6px 12px';
        typeFilterDiv.style.backgroundColor = 'rgba(250, 250, 250, 0.5)';
        typeFilterDiv.style.borderRadius = '10px';
        typeFilterDiv.style.border = '1px solid var(--ios-border)';

        const typeFilterLabel = document.createElement('label');
        typeFilterLabel.textContent = 'Type:';
        typeFilterLabel.style.fontSize = '13px';
        typeFilterLabel.style.fontWeight = '500';
        typeFilterLabel.style.color = 'var(--ios-text-secondary)';
        typeFilterLabel.style.fontFamily = 'var(--ios-font)';

        const typeFilterSelect = document.createElement('select');
        typeFilterSelect.id = 'type-filter';
        typeFilterSelect.style.border = 'none';
        typeFilterSelect.style.backgroundColor = 'transparent';
        typeFilterSelect.style.fontSize = '13px';
        typeFilterSelect.style.fontFamily = 'var(--ios-font)';
        typeFilterSelect.style.color = 'var(--ios-text-primary)';
        typeFilterSelect.style.padding = '2px 4px';
        typeFilterSelect.style.borderRadius = '6px';
        typeFilterSelect.style.appearance = 'none';
        typeFilterSelect.style.backgroundImage = 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2214%22%20height%3D%2214%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M7%2010l5%205%205-5%22%20stroke%3D%22%23777%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E")';
        typeFilterSelect.style.backgroundRepeat = 'no-repeat';
        typeFilterSelect.style.backgroundPosition = 'right 4px center';
        typeFilterSelect.style.backgroundSize = '14px';
        typeFilterSelect.style.paddingRight = '20px';
        typeFilterSelect.style.cursor = 'pointer';

        const typeOptionAll = document.createElement('option');
        typeOptionAll.value = 'all';
        typeOptionAll.textContent = 'All';
        const typeOptionBasic = document.createElement('option');
        typeOptionBasic.value = 'BASIC';
        typeOptionBasic.textContent = 'BASIC';
        const typeOptionSupp = document.createElement('option');
        typeOptionSupp.value = 'SUPP';
        typeOptionSupp.textContent = 'SUPP';

        typeFilterSelect.appendChild(typeOptionAll);
        typeFilterSelect.appendChild(typeOptionBasic);
        typeFilterSelect.appendChild(typeOptionSupp);
        typeFilterSelect.value = glb_filters.memberCardtype;

        typeFilterSelect.addEventListener('change', () => {
            glb_filters.memberCardtype = typeFilterSelect.value;
            renderPage();
        });

        typeFilterDiv.appendChild(typeFilterLabel);
        typeFilterDiv.appendChild(typeFilterSelect);

        // Offer Search
        const offerSearchContainer = document.createElement('div');
        offerSearchContainer.style.display = 'flex';
        offerSearchContainer.style.alignItems = 'center';
        offerSearchContainer.style.gap = '8px';
        offerSearchContainer.style.flex = '1';
        offerSearchContainer.style.minWidth = '200px';
        offerSearchContainer.style.maxWidth = '450px';

        const offerSearchLabel = document.createElement('label');
        offerSearchLabel.textContent = 'Search:';
        offerSearchLabel.style.fontSize = '13px';
        offerSearchLabel.style.fontWeight = '500';
        offerSearchLabel.style.color = 'var(--ios-text-secondary)';
        offerSearchLabel.style.fontFamily = 'var(--ios-font)';

        // Use the updated createSearchInput
        const searchInputContainer = createSearchInput(
            'Search offers...',
            glb_filters.memberMerchantSearch,
            val => {
                glb_filters.memberMerchantSearch = val.toLowerCase();
                renderPage();
            }
        );
        searchInputContainer.style.flex = '1';

        // Reset button next to search bar
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.style.padding = '8px 16px';
        resetButton.style.borderRadius = '10px';
        resetButton.style.border = 'none';
        resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.1)';
        resetButton.style.color = 'var(--ios-text-secondary)';
        resetButton.style.fontSize = '13px';
        resetButton.style.fontWeight = '500';
        resetButton.style.cursor = 'pointer';
        resetButton.style.transition = 'all 0.2s ease';
        resetButton.style.fontFamily = 'var(--ios-font)';
        resetButton.style.marginLeft = '8px';

        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.2)';
        });

        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.1)';
        });

        resetButton.addEventListener('click', () => {
            statusFilterSelect.value = 'Active';
            typeFilterSelect.value = 'all';
            searchInputContainer.querySelector('input').value = '';
            glb_filters.memberStatus = 'Active';
            glb_filters.memberCardtype = 'all';
            glb_filters.memberMerchantSearch = '';
            renderPage();
        });

        offerSearchContainer.appendChild(offerSearchLabel);
        offerSearchContainer.appendChild(searchInputContainer);
        offerSearchContainer.appendChild(resetButton);

        // No standalone reset button here anymore as it's next to search

        filtersCard.appendChild(statusFilterDiv);
        filtersCard.appendChild(typeFilterDiv);
        filtersCard.appendChild(offerSearchContainer);

        return filtersCard;
    }

    // Members table
    function renderMembers_table() {
        const headers = [
            { label: "Index", key: "cardIndex" },
            { label: "Logo", key: "small_card_art" },
            { label: "Ending", key: "display_account_number" },
            { label: "User", key: "embossed_name" },
            { label: "Type", key: "relationship" },
            { label: "Opening", key: "account_setup_date" },
            { label: "Status", key: "account_status" },
            { label: "Balance", key: "StatementBalance" },
            { label: "Pending", key: "pending" },
            { label: "RemStBl", key: "remainingStaBal" },
            { label: "Eligible", key: "eligibleOffers" },
            { label: "Enrolled", key: "enrolledOffers" },
            { label: "Priority", key: "priority" },
            { label: "Exclude", key: "exclude" }
        ];

        const colWidths = {
            cardIndex: "50px",
            small_card_art: "60px",
            display_account_number: "70px",
            embossed_name: "180px",
            relationship: "80px",
            account_setup_date: "100px",
            account_status: "80px",
            StatementBalance: "90px",
            pending: "90px",
            remainingStaBal: "90px",
            eligibleOffers: "80px",
            enrolledOffers: "80px",
            priority: "70px",
            exclude: "70px"
        };

        // Filter accounts by status and type
        const filteredAccounts = glb_account.filter(acc => {
            const statusMatch = glb_filters.memberStatus === 'all' ||
                acc.account_status.trim().toLowerCase() === glb_filters.memberStatus.toLowerCase();
            const typeMatch = glb_filters.memberCardtype === 'all' ||
                acc.relationship === glb_filters.memberCardtype;
            return statusMatch && typeMatch;
        });

        // Define cell rendering logic for members table
        const cellRenderer = (item, headerItem) => {
            const key = headerItem.key;
            if (key === 'small_card_art') {
                if (item.small_card_art && item.small_card_art !== 'N/A') {
                    const img = document.createElement('img');
                    img.src = item.small_card_art;
                    img.alt = "Card Logo";
                    img.style.maxWidth = "40px";
                    img.style.maxHeight = "40px";
                    return img;
                }
                return sanitizeValue('N/A');
            } else if (key === 'eligibleOffers' || key === 'enrolledOffers') {
                const count = parseInt(item[key] || 0);

                // Create container for consistent height
                const container = document.createElement('div');
                container.style.height = '28px';  // Fixed height for all badges
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';

                if (count > 0) {
                    const btn = document.createElement('button');
                    btn.textContent = count;
                    btn.className = 'ios-counter-badge';

                    // iOS-style badging
                    btn.style.borderRadius = '14px';
                    btn.style.backgroundColor = key === 'eligibleOffers' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.1)';
                    btn.style.color = key === 'eligibleOffers' ? 'var(--ios-blue)' : 'var(--ios-green)';
                    btn.style.border = `1px solid ${key === 'eligibleOffers' ? 'rgba(0, 122, 255, 0.2)' : 'rgba(52, 199, 89, 0.2)'}`;
                    btn.style.padding = '4px 10px';
                    btn.style.fontWeight = '500';
                    btn.style.fontSize = '13px';
                    btn.style.fontFamily = 'var(--ios-font)';
                    btn.style.cursor = 'pointer';
                    btn.style.transition = 'all 0.2s ease';
                    btn.style.height = '28px';  // Match container height
                    btn.style.boxSizing = 'border-box';
                    // FIX: Add vertical alignment styles
                    btn.style.display = 'flex';
                    btn.style.alignItems = 'center';
                    btn.style.justifyContent = 'center';
                    btn.style.lineHeight = '1';

                    btn.addEventListener('mouseover', () => {
                        btn.style.backgroundColor = key === 'eligibleOffers' ? 'rgba(0, 122, 255, 0.15)' : 'rgba(52, 199, 89, 0.15)';
                        btn.style.transform = 'translateY(-1px)';
                    });

                    btn.addEventListener('mouseout', () => {
                        btn.style.backgroundColor = key === 'eligibleOffers' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.1)';
                        btn.style.transform = 'translateY(0)';
                    });

                    btn.addEventListener('click', () => {
                        renderMembers_offerOnCard(item.display_account_number,
                            (key === 'eligibleOffers') ? 'eligible' : 'enrolled');
                    });
                    container.appendChild(btn);
                } else {
                    // For zero count, return a disabled-looking badge with same height
                    const span = document.createElement('span');
                    span.textContent = '0';
                    span.className = 'ios-counter-badge-disabled';
                    span.style.borderRadius = '14px';
                    span.style.backgroundColor = 'rgba(142, 142, 147, 0.1)';
                    span.style.color = 'var(--ios-gray)';
                    span.style.border = '1px solid rgba(142, 142, 147, 0.2)';
                    span.style.padding = '4px 10px';
                    span.style.fontWeight = '500';
                    span.style.fontSize = '13px';
                    span.style.fontFamily = 'var(--ios-font)';
                    span.style.height = '28px';  // Match container height
                    span.style.boxSizing = 'border-box';
                    // FIX: Change from inline-flex to flex and add vertical alignment
                    span.style.display = 'flex';
                    span.style.alignItems = 'center';
                    span.style.justifyContent = 'center';
                    span.style.lineHeight = '1';
                    container.appendChild(span);
                }

                return container;
            } else if (key === 'pending' || key === 'remainingStaBal' || key === 'StatementBalance') {
                if (item.relationship === "BASIC") {
                    if (item.financialData) {
                        if (key === 'pending') {
                            return sanitizeValue(item.financialData.debits_credits_payments_total_amount);
                        } else if (key === 'remainingStaBal') {
                            return sanitizeValue(item.financialData.remaining_statement_balance_amount);
                        } else if (key === 'StatementBalance') {
                            return sanitizeValue(item.financialData.statement_balance_amount);
                        }
                    }
                    return "Loading...";
                }
                return ""; // Return empty string for non-BASIC cards
            }
            else if (key === 'relationship') {
                if (item.relationship === "SUPP") {
                    return getBasicAccountEndingForSuppAccount(item);
                }
                return sanitizeValue(item[key]);
            }
            else if (key === 'priority') {
                const toggle = createIOSToggle(
                    glb_priorityCards.includes(item.display_account_number),
                    (checked) => {
                        if (checked) {
                            if (!glb_priorityCards.includes(item.display_account_number)) {
                                glb_priorityCards.push(item.display_account_number);
                            }
                        } else {
                            glb_priorityCards = glb_priorityCards.filter(num => num !== item.display_account_number);
                        }
                        localStorageHandler("set", storage_accToken, ["priorityCards"]);
                    },
                    'priority'
                );
                return toggle;
            } else if (key === 'exclude') {
                const toggle = createIOSToggle(
                    glb_excludedCards.includes(item.display_account_number),
                    (checked) => {
                        if (checked) {
                            if (!glb_excludedCards.includes(item.display_account_number)) {
                                glb_excludedCards.push(item.display_account_number);
                            }
                        } else {
                            glb_excludedCards = glb_excludedCards.filter(num => num !== item.display_account_number);
                        }
                        localStorageHandler("set", storage_accToken, ["excludedCards"]);
                    },
                    'exclude'
                );
                return toggle;
            } else if (key === 'account_status') {
                return item[key]; // Will be styled by renderTable's status handling
            }
            return sanitizeValue(item[key]);
        };

        // Define the sortable keys for members table
        const sortableKeys = [
            "cardIndex", "small_card_art", "display_account_number", "embossed_name",
            "relationship", "account_setup_date", "account_status", "StatementBalance",
            "pending", "remainingStaBal", "eligibleOffers", "enrolledOffers"
        ];

        const tableElement = renderTable(headers, colWidths, filteredAccounts, cellRenderer, sort_memberTab, sortableKeys);
        const containerDiv = document.createElement('div');
        containerDiv.appendChild(tableElement);
        return containerDiv;

        function createIOSToggle(isChecked, onChange, type = 'priority') {
            // Create container
            const container = document.createElement('div');
            container.style.display = 'inline-block';
            container.style.position = 'relative';
            container.style.width = '36px';
            container.style.height = '22px';
            container.style.borderRadius = '11px';
            container.style.cursor = 'pointer';
            container.style.transition = 'background-color 0.3s ease';

            // Set correct colors based on type and state
            const backgroundColor = isChecked
                ? (type === 'priority' ? 'var(--ios-blue)' : 'var(--ios-red)')
                : '#e9e9ea';
            container.style.backgroundColor = backgroundColor;

            // Create toggle knob
            const knob = document.createElement('div');
            knob.style.position = 'absolute';
            knob.style.width = '18px';
            knob.style.height = '18px';
            knob.style.borderRadius = '9px';
            knob.style.backgroundColor = '#ffffff';
            knob.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.15)';
            knob.style.top = '2px';
            knob.style.left = isChecked ? '16px' : '2px';
            knob.style.transition = 'left 0.3s ease';

            // Function to update visual state
            const updateVisualState = (checked) => {
                knob.style.left = checked ? '16px' : '2px';
                container.style.backgroundColor = checked
                    ? (type === 'priority' ? 'var(--ios-blue)' : 'var(--ios-red)')
                    : '#e9e9ea';
            };

            // Add click event
            container.addEventListener('click', () => {
                isChecked = !isChecked;
                updateVisualState(isChecked);
                if (onChange) onChange(isChecked);
            });

            // Assemble the toggle
            container.appendChild(knob);

            // Add tooltip
            container.title = type === 'priority' ? 'Priority Card' : 'Exclude Card';

            return container;
        }
    }

    // Members offer on card popup
    function renderMembers_offerOnCard(accountNumber, offerType) {
        // Create the overlay with backdrop blur
        const overlay = document.createElement('div');
        overlay.id = 'offer-details-overlay';
        overlay.style.cssText = `
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
    `;

        // Modern popup container
        const popup = document.createElement('div');
        popup.style.cssText = `
        background: #ffffff;
        border-radius: 12px;
        padding: 24px;
        width: 90%;
        max-width: 400px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        position: relative;
    `;

        overlay.appendChild(popup);

        // ───────── Top row: Title and Close Button ─────────
        const topRow = document.createElement('div');
        topRow.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid #eee;
    `;

        const leftTitle = document.createElement('h3');
        leftTitle.textContent = `Offers ${offerType} for card ending ${accountNumber}`;
        leftTitle.style.cssText = `
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        background: linear-gradient(45deg, #2c3e50, #4CAF50);
        -webkit-background-clip: text;
        color: transparent;
    `;

        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        color: #666;
        cursor: pointer;
        padding: 4px;
        transition: all 0.2s ease;
    `;
        closeBtn.addEventListener('mouseover', () => {
            closeBtn.style.color = '#ff4444';
        });
        closeBtn.addEventListener('mouseout', () => {
            closeBtn.style.color = '#666';
        });
        closeBtn.addEventListener('click', () => {
            overlay.remove();
        });

        topRow.appendChild(leftTitle);
        topRow.appendChild(closeBtn);
        popup.appendChild(topRow);

        // ───────── Content Area ─────────
        const contentDiv = document.createElement('div');
        contentDiv.style.cssText = `
        font-size: 14px;
        line-height: 1.4;
    `;
        popup.appendChild(contentDiv);

        // Determine relevant offers based on offerType
        let relevantOffers = [];
        if (offerType === 'eligible') {
            relevantOffers = glb_offer.filter(offer =>
                Array.isArray(offer.eligibleCards) &&
                offer.eligibleCards.includes(accountNumber)
            );
        } else if (offerType === 'enrolled') {
            relevantOffers = glb_offer.filter(offer =>
                Array.isArray(offer.enrolledCards) &&
                offer.enrolledCards.includes(accountNumber)
            );
        }

        if (relevantOffers.length === 0) {
            contentDiv.textContent = `No ${offerType} offers found for card ${accountNumber}.`;
        } else {
            relevantOffers.forEach(offer => {
                const offerPara = document.createElement('p');
                offerPara.style.cssText = `
                margin: 6px 0;
                font-size: 14px;
                color: #333;
            `;
                offerPara.textContent = offer.name;
                contentDiv.appendChild(offerPara);
            });
        }

        document.body.appendChild(overlay);
    }

    // Members page container
    function renderMembers_page() {
        const containerDiv = document.createElement('div');
        containerDiv.style.display = 'flex';
        containerDiv.style.flexDirection = 'column';
        containerDiv.style.gap = '16px';
        containerDiv.style.padding = '16px';
        containerDiv.style.maxWidth = '1300px';
        containerDiv.style.margin = '0 auto';
        containerDiv.style.fontFamily = "'Inter', system-ui, sans-serif";

        return containerDiv;
    }


    function renderOffers_searchBar() {
        const filterCard = document.createElement('div');
        filterCard.style.background = 'var(--ios-background)';
        filterCard.style.backdropFilter = 'blur(8px)';
        filterCard.style.WebkitBackdropFilter = 'blur(8px)';
        filterCard.style.borderRadius = '14px';
        filterCard.style.padding = '16px 20px';
        filterCard.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
        filterCard.style.display = 'flex';
        filterCard.style.gap = '16px';
        filterCard.style.flexWrap = 'wrap';
        filterCard.style.width = '100%';
        filterCard.style.boxSizing = 'border-box';
        filterCard.style.border = '1px solid var(--ios-border)';
        filterCard.style.marginBottom = '16px';
        filterCard.style.alignItems = 'center';

        // Favorites Toggle with iOS styling
        const favContainer = document.createElement('div');
        favContainer.style.display = 'flex';
        favContainer.style.alignItems = 'center';
        favContainer.style.backgroundColor = 'rgba(0, 122, 255, 0.08)';
        favContainer.style.padding = '6px 12px';
        favContainer.style.borderRadius = '10px';
        favContainer.style.border = '1px solid rgba(0, 122, 255, 0.15)';
        favContainer.style.transition = 'all 0.2s ease';

        const favCheckbox = document.createElement('input');
        favCheckbox.type = 'checkbox';
        favCheckbox.checked = glb_filters.offerFav;
        favCheckbox.style.cursor = 'pointer';
        favCheckbox.style.accentColor = 'var(--ios-blue)';
        favCheckbox.style.marginRight = '8px';
        favCheckbox.style.height = '16px';
        favCheckbox.style.width = '16px';

        favCheckbox.addEventListener('change', () => {
            glb_filters.offerFav = favCheckbox.checked;
            if (favCheckbox.checked) {
                favContainer.style.backgroundColor = 'rgba(0, 122, 255, 0.15)';
            } else {
                favContainer.style.backgroundColor = 'rgba(0, 122, 255, 0.08)';
            }
            renderPage();
        });

        const favLabel = document.createElement('label');
        favLabel.textContent = "Show Favorites Only";
        favLabel.style.fontSize = '13px';
        favLabel.style.cursor = 'pointer';
        favLabel.style.fontWeight = '500';
        favLabel.style.color = 'var(--ios-text-secondary)';
        favLabel.style.fontFamily = 'var(--ios-font)';

        favContainer.appendChild(favCheckbox);
        favContainer.appendChild(favLabel);

        favContainer.addEventListener('mouseenter', () => {
            if (!favCheckbox.checked) {
                favContainer.style.backgroundColor = 'rgba(0, 122, 255, 0.12)';
            }
        });

        favContainer.addEventListener('mouseleave', () => {
            if (!favCheckbox.checked) {
                favContainer.style.backgroundColor = 'rgba(0, 122, 255, 0.08)';
            }
        });

        // Custom search input for merchants
        const merchantSearchContainer = document.createElement('div');
        merchantSearchContainer.style.position = 'relative';
        merchantSearchContainer.style.flex = '1';
        merchantSearchContainer.style.minWidth = '200px';
        merchantSearchContainer.style.maxWidth = '300px';

        const merchantSearchInput = document.createElement('input');
        merchantSearchInput.type = 'text';
        merchantSearchInput.placeholder = 'Search merchants...';
        merchantSearchInput.value = glb_filters.offerMerchantSearch || '';
        merchantSearchInput.style.width = '100%';
        merchantSearchInput.style.padding = '10px 32px 10px 12px';
        merchantSearchInput.style.borderRadius = '10px';
        merchantSearchInput.style.border = '1px solid var(--ios-border)';
        merchantSearchInput.style.backgroundColor = 'rgba(250, 250, 250, 0.7)';
        merchantSearchInput.style.fontSize = '13px';
        merchantSearchInput.style.fontFamily = 'var(--ios-font)';
        merchantSearchInput.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05) inset';
        merchantSearchInput.style.transition = 'all 0.2s ease';

        merchantSearchInput.addEventListener('focus', () => {
            merchantSearchInput.style.outline = 'none';
            merchantSearchInput.style.borderColor = 'var(--ios-blue)';
            merchantSearchInput.style.boxShadow = '0 0 0 2px rgba(0, 122, 255, 0.08)';
        });

        merchantSearchInput.addEventListener('blur', () => {
            merchantSearchInput.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05) inset';
            merchantSearchInput.style.borderColor = 'var(--ios-border)';
        });

        // Search icon
        const merchantSearchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        merchantSearchIcon.setAttribute('width', '16');
        merchantSearchIcon.setAttribute('height', '16');
        merchantSearchIcon.setAttribute('viewBox', '0 0 24 24');
        merchantSearchIcon.style.position = 'absolute';
        merchantSearchIcon.style.right = '12px';
        merchantSearchIcon.style.top = '50%';
        merchantSearchIcon.style.transform = 'translateY(-50%)';
        merchantSearchIcon.style.color = 'var(--ios-blue)';
        merchantSearchIcon.style.opacity = '0.6';
        merchantSearchIcon.style.pointerEvents = 'none';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z');
        path.setAttribute('fill', 'currentColor');
        merchantSearchIcon.appendChild(path);

        merchantSearchContainer.appendChild(merchantSearchInput);
        merchantSearchContainer.appendChild(merchantSearchIcon);

        // Debounce function for search input
        const debounce = (func, wait) => {
            let timeout;
            return function (...args) {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        };

        // Add event listener with debounce
        merchantSearchInput.addEventListener('input', debounce(() => {
            glb_filters.offerMerchantSearch = merchantSearchInput.value.toLowerCase();
            renderPage();
        }, 300));

        // Card ending search input
        const cardSearchContainer = document.createElement('div');
        cardSearchContainer.style.position = 'relative';
        cardSearchContainer.style.flex = '1';
        cardSearchContainer.style.minWidth = '150px';
        cardSearchContainer.style.maxWidth = '200px';

        const cardSearchInput = document.createElement('input');
        cardSearchInput.type = 'text';
        cardSearchInput.placeholder = 'Card ending...';
        cardSearchInput.value = glb_filters.offerCardEnding || '';
        cardSearchInput.style.width = '100%';
        cardSearchInput.style.padding = '10px 32px 10px 12px';
        cardSearchInput.style.borderRadius = '10px';
        cardSearchInput.style.border = '1px solid var(--ios-border)';
        cardSearchInput.style.backgroundColor = 'rgba(250, 250, 250, 0.7)';
        cardSearchInput.style.fontSize = '13px';
        cardSearchInput.style.fontFamily = 'var(--ios-font)';
        cardSearchInput.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05) inset';
        cardSearchInput.style.transition = 'all 0.2s ease';

        cardSearchInput.addEventListener('focus', () => {
            cardSearchInput.style.outline = 'none';
            cardSearchInput.style.borderColor = 'var(--ios-blue)';
            cardSearchInput.style.boxShadow = '0 0 0 2px rgba(0, 122, 255, 0.08)';
        });

        cardSearchInput.addEventListener('blur', () => {
            cardSearchInput.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05) inset';
            cardSearchInput.style.borderColor = 'var(--ios-border)';
        });

        // Card icon
        const cardIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        cardIcon.setAttribute('width', '16');
        cardIcon.setAttribute('height', '16');
        cardIcon.setAttribute('viewBox', '0 0 24 24');
        cardIcon.style.position = 'absolute';
        cardIcon.style.right = '12px';
        cardIcon.style.top = '50%';
        cardIcon.style.transform = 'translateY(-50%)';
        cardIcon.style.color = 'var(--ios-blue)';
        cardIcon.style.opacity = '0.6';
        cardIcon.style.pointerEvents = 'none';

        const cardPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        cardPath.setAttribute('d', 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z');
        cardPath.setAttribute('fill', 'currentColor');
        cardIcon.appendChild(cardPath);

        cardSearchContainer.appendChild(cardSearchInput);
        cardSearchContainer.appendChild(cardIcon);

        // Add event listener with debounce
        cardSearchInput.addEventListener('input', debounce(() => {
            glb_filters.offerCardEnding = cardSearchInput.value;
            renderPage();
        }, 300));

        // Reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset';
        resetButton.style.padding = '8px 16px';
        resetButton.style.borderRadius = '10px';
        resetButton.style.border = 'none';
        resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.1)';
        resetButton.style.color = 'var(--ios-text-secondary)';
        resetButton.style.fontSize = '13px';
        resetButton.style.fontWeight = '500';
        resetButton.style.cursor = 'pointer';
        resetButton.style.transition = 'all 0.2s ease';
        resetButton.style.fontFamily = 'var(--ios-font)';

        resetButton.addEventListener('mouseenter', () => {
            resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.2)';
        });

        resetButton.addEventListener('mouseleave', () => {
            resetButton.style.backgroundColor = 'rgba(142, 142, 147, 0.1)';
        });

        resetButton.addEventListener('click', () => {
            merchantSearchInput.value = '';
            cardSearchInput.value = '';
            favCheckbox.checked = false;
            glb_filters.offerMerchantSearch = '';
            glb_filters.offerCardEnding = '';
            glb_filters.offerFav = false;
            favContainer.style.backgroundColor = 'rgba(0, 122, 255, 0.08)';
            renderPage();
        });

        filterCard.appendChild(favContainer);
        filterCard.appendChild(merchantSearchContainer);
        filterCard.appendChild(cardSearchContainer);
        filterCard.appendChild(resetButton);

        return filterCard;
    }

    // Offers table
    function renderOffers_table() {
        // Filter offers based on search criteria.
        const filteredOffers = glb_offer.filter(o => {
            if (glb_filters.offerFav && !o.favorite) return false;
            if (glb_filters.offerMerchantSearch && !o.name.toLowerCase().includes(glb_filters.offerMerchantSearch)) return false;
            if (glb_filters.offerCardEnding) {
                const eligible = Array.isArray(o.eligibleCards) && o.eligibleCards.includes(glb_filters.offerCardEnding);
                const enrolled = Array.isArray(o.enrolledCards) && o.enrolledCards.includes(glb_filters.offerCardEnding);
                if (!eligible && !enrolled) return false;
            }
            return true;
        });

        const headers = [
            { label: "❤️", key: "favorite" },
            { label: "Logo", key: "logo" },
            { label: "Offer", key: "name" },
            { label: "Type", key: "achievement_type" },
            { label: "Cat", key: "category" },
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
            favorite: "40px",
            logo: "70px",
            name: "180px",
            achievement_type: "70px",
            category: "40px",
            expiry_date: "120px",
            redemption_types: "80px",
            short_description: "230px",
            threshold: "90px",
            reward: "90px",
            percentage: "80px",
            eligibleCards: "80px",
            enrolledCards: "80px"
        };


        // Define cell rendering logic for offers table
        const cellRenderer = (item, headerItem) => {
            const key = headerItem.key;
            if (key === 'logo') {
                if (item.logo && item.logo !== "N/A") {
                    const img = document.createElement('img');
                    img.src = item.logo;
                    img.alt = "Offer Logo";
                    img.style.maxWidth = "60px";
                    img.style.maxHeight = "60px";
                    return img;
                }
                return 'N/A';
            } else if (key === 'achievement_type') {
                let value = item.achievement_type;
                if (value === "STATEMENT_CREDIT") {
                    value = "Cash";
                } else if (value === "MEMBERSHIP_REWARDS") {
                    value = "MR";
                }
                return value;
            } else if (key === 'category') {
                if (item.category && item.category !== "N/A") {
                    const cat = item.category.toString().toLowerCase().trim();
                    // Map full names to an emoji (or short text)
                    const categoryMap = {
                        "default": "🔰",
                        "dining": "🍽️",
                        "entertainment": "🎭",
                        "services": "⚙️",
                        "shopping": "🛍️",
                        "travel": "✈️"
                    };
                    return categoryMap[cat] || (cat.charAt(0).toUpperCase() + cat.slice(1));
                }
                return 'N/A';
            } else if (key === 'redemption_types') {
                if (item.redemption_types && item.redemption_types !== "N/A") {
                    let parts = item.redemption_types.toString().split(",");
                    let abbreviatedParts = parts.map(val => {
                        let trimmed = val.trim().toLowerCase();
                        if (trimmed.includes("instore")) return "🏬";
                        if (trimmed.includes("online")) return "🌐";
                        // Fallback: take the first three letters in uppercase
                        return trimmed.toUpperCase().slice(0, 3);
                    });
                    return abbreviatedParts.join("");
                }
                return "N/A";
            } else if (key === 'expiry_date') {
                if (item.expiry_date && item.expiry_date !== 'N/A') {
                    const d = new Date(item.expiry_date);
                    if (!isNaN(d)) {
                        const yy = d.getFullYear().toString().slice(-2);
                        const mm = String(d.getMonth() + 1).padStart(2, '0');
                        const dd = String(d.getDate()).padStart(2, '0');
                        return `${mm}-${dd}-${yy}`;
                    }
                    return 'N/A';
                }
                return 'N/A';
            } else if (key === 'favorite') {
                const chk = document.createElement('input');
                chk.type = 'checkbox';
                chk.checked = item.favorite === true;
                chk.style.cursor = 'pointer';
                chk.addEventListener('change', () => {
                    item.favorite = chk.checked;
                    localStorageHandler("set", storage_accToken, ["offer"]);
                });
                return chk;
            } else if (key === 'eligibleCards' || key === 'enrolledCards') {
                const cards = Array.isArray(item[key]) ? item[key] : [];
                const count = cards.length;

                // Create container for consistent height across all counts
                const container = document.createElement('div');
                container.style.height = '28px';  // Fixed height for all badges
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.justifyContent = 'center';

                if (count > 0) {
                    const btn = document.createElement('button');
                    btn.textContent = count;
                    btn.className = 'ios-counter-badge';

                    // iOS-style badging
                    btn.style.borderRadius = '14px';
                    btn.style.backgroundColor = key === 'eligibleCards' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.1)';
                    btn.style.color = key === 'eligibleCards' ? 'var(--ios-blue)' : 'var(--ios-green)';
                    btn.style.border = `1px solid ${key === 'eligibleCards' ? 'rgba(0, 122, 255, 0.2)' : 'rgba(52, 199, 89, 0.2)'}`;
                    btn.style.padding = '4px 10px';
                    btn.style.fontWeight = '500';
                    btn.style.fontSize = '13px';
                    btn.style.fontFamily = 'var(--ios-font)';
                    btn.style.cursor = 'pointer';
                    btn.style.transition = 'all 0.2s ease';
                    btn.style.height = '28px';  // Match container height
                    btn.style.boxSizing = 'border-box';
                    // FIX: Add vertical alignment styles
                    btn.style.display = 'flex';
                    btn.style.alignItems = 'center';
                    btn.style.justifyContent = 'center';
                    btn.style.lineHeight = '1';

                    btn.addEventListener('mouseover', () => {
                        btn.style.backgroundColor = key === 'eligibleCards' ? 'rgba(0, 122, 255, 0.15)' : 'rgba(52, 199, 89, 0.15)';
                        btn.style.transform = 'translateY(-1px)';
                    });

                    btn.addEventListener('mouseout', () => {
                        btn.style.backgroundColor = key === 'eligibleCards' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(52, 199, 89, 0.1)';
                        btn.style.transform = 'translateY(0)';
                    });

                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        renderOffers_enrollCard(item.offerId);
                    });
                    container.appendChild(btn);
                } else {
                    // For zero count, return a disabled-looking badge with same height
                    const span = document.createElement('span');
                    span.textContent = '0';
                    span.className = 'ios-counter-badge-disabled';
                    span.style.borderRadius = '14px';
                    span.style.backgroundColor = 'rgba(142, 142, 147, 0.1)';
                    span.style.color = 'var(--ios-gray)';
                    span.style.border = '1px solid rgba(142, 142, 147, 0.2)';
                    span.style.padding = '4px 10px';
                    span.style.fontWeight = '500';
                    span.style.fontSize = '13px';
                    span.style.fontFamily = 'var(--ios-font)';
                    span.style.height = '28px';  // Match container height
                    span.style.boxSizing = 'border-box';
                    // FIX: Change from inline-flex to flex and add vertical alignment
                    span.style.display = 'flex';
                    span.style.alignItems = 'center';
                    span.style.justifyContent = 'center';
                    span.style.lineHeight = '1';
                    container.appendChild(span);
                }

                return container;
            }

            return item[key];
        };

        // Define the sortable keys for offers table
        const sortableKeysOffers = [
            "favorite", "logo", "name", "achievement_type", "category",
            "expiry_date", "redemption_types", "short_description", "threshold",
            "reward", "percentage", "eligibleCards", "enrolledCards"
        ];

        const tableElement = renderTable(headers, colWidths, filteredOffers, cellRenderer, sort_offerTab, sortableKeysOffers);
        const containerDiv = document.createElement('div');
        containerDiv.appendChild(tableElement);
        return containerDiv;
    }

    // Offers enrollment card modal
    async function renderOffers_enrollCard(offerId) {
        // Remove existing overlay
        const overlayId = 'offer-details-overlay';
        const existing = document.getElementById(overlayId);
        if (existing) existing.remove();

        // Get offer data
        const offer = glb_offer.find(o => o.offerId === offerId);
        const offerName = offer ? offer.name : 'Unknown Offer';

        // Create overlay and popup
        const overlay = document.createElement('div');
        overlay.id = overlayId;
        overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); z-index: 10000;
      display: flex; justify-content: center; align-items: center;
    `;
        const popup = document.createElement('div');
        popup.style.cssText = `
      background: #fff; border-radius: 12px; padding: 24px; width: 90%; max-width: 440px;
      max-height: 90vh; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.15); position: relative;
    `;
        // Header
        const header = document.createElement('div');
        header.style.cssText = `display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #eee;`;
        const title = document.createElement('h3');
        title.textContent = offerName;
        title.style.cssText = `margin: 0; font-size: 1.2rem; font-weight: 600;
      background: linear-gradient(45deg, #2c3e50, #4CAF50); -webkit-background-clip: text; color: transparent;`;
        const closeBtn = createIconButton('×', () => { overlay.remove(); saveCurrentScrollState(); renderPage(); });
        closeBtn.style.cssText += 'font-size:1.5rem; color:#666; padding:4px;';
        header.append(title, closeBtn);
        popup.appendChild(header);

        if (offer) {
            if (offer.eligibleCards?.length) {
                const enrollAll = createIconButton('Enroll All Cards', async () => {
                    console.log(`Calling batch enrollment for "${offerName}" (source_id: ${offer.source_id}).`);
                    const results = await get__batchEnrollOffer(offer.source_id);
                    results.forEach(r => {
                        if (r.offerId !== offerId) return;
                        const acc = glb_account.find(a => a.account_token === r.accountToken);
                        if (!acc) return;
                        const cardEnd = acc.display_account_number;

                        if (r.result) {
                            const idx = offer.eligibleCards.indexOf(cardEnd);
                            if (idx !== -1) offer.eligibleCards.splice(idx, 1);
                            if (!offer.enrolledCards.includes(cardEnd)) offer.enrolledCards.push(cardEnd);
                        }
                        const cardElem = document.getElementById(`offerCard_${offerId}_${cardEnd}`);
                        if (cardElem) {
                            cardElem.style.backgroundColor = r.result ? '#c0ffc0' : '#ffc0c0';
                            setTimeout(() => cardElem.style.backgroundColor = r.result ? '#e8f5e9' : '#e3f2fd', 3000);
                        }
                    });
                    setTimeout(() => renderOffers_enrollCard(offerId), 3000);
                }, 'plus');
                enrollAll.style.cssText += `
          width: 100%; margin: 0 0 20px 0; background: linear-gradient(45deg, rgb(84,99,86), rgb(27,66,29));
          color: white; border-radius: 8px; font-weight: 500;
        `;
                popup.appendChild(enrollAll);
            }
            // Card Sections
            popup.appendChild(createSection('Eligible Cards', offer.eligibleCards, offerId, false, offer));
            popup.appendChild(createSection('Enrolled Cards', offer.enrolledCards, offerId, true, offer));
        } else {
            popup.appendChild(createErrorElement('Offer not found'));
        }
        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // --- Helper Functions ---
        function createSection(label, cards, offerId, enrolled, offer) {
            const section = document.createElement('div');
            section.style.marginBottom = '24px';
            const secTitle = document.createElement('h4');
            secTitle.textContent = label;
            secTitle.style.cssText = `margin: 0 0 12px 0; color: ${enrolled ? '#4CAF50' : '#2196F3'}; font-size: 0.95rem;`;
            const grid = document.createElement('div');
            grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px;';
            const sortedCards = [...cards].sort((a, b) => {
                const accA = glb_account.find(acc => acc.display_account_number === a);
                const accB = glb_account.find(acc => acc.display_account_number === b);
                const [aMain, aSub] = parseCardIndex(accA?.cardIndex);
                const [bMain, bSub] = parseCardIndex(accB?.cardIndex);
                return aMain - bMain || aSub - bSub;
            });
            sortedCards.forEach(cardEnd => grid.appendChild(createCard(cardEnd, offerId, enrolled, offer)));
            section.append(secTitle, grid);
            return section;
        }

        function createCard(cardEnd, offerId, enrolled, offer) {
            const card = document.createElement('div');
            card.id = `offerCard_${offerId}_${cardEnd}`;
            card.textContent = cardEnd;
            card.style.cssText = `
        padding: 8px; border-radius: 6px; text-align: center; font-size: 0.85rem;
        transition: all 0.2s ease; background-color: ${enrolled ? '#e8f5e9' : '#e3f2fd'};
        ${!enrolled ? 'cursor: pointer;' : ''}
      `;
            if (!enrolled) {
                card.onclick = async () => {
                    const acc = glb_account.find(a => a.display_account_number === cardEnd);
                    if (!acc) { console.log(`Account not found for card: ${cardEnd}`); return; }
                    const res = await fetchGet_enrollOffer(acc.account_token, offerId);
                    if (res.result) {
                        console.log(`Enrollment successful for card ${cardEnd}, offer "${offerName}"`);
                        const idx = offer.eligibleCards.indexOf(cardEnd);
                        if (idx !== -1) offer.eligibleCards.splice(idx, 1);
                        if (!offer.enrolledCards.includes(cardEnd)) offer.enrolledCards.push(cardEnd);
                    } else {
                        console.log(`Enrollment failed for card ${cardEnd}, offer "${offerName}"`);
                    }
                    card.style.backgroundColor = res.result ? '#c0ffc0' : '#ffc0c0';
                    setTimeout(() => card.style.backgroundColor = res.result ? '#e8f5e9' : '#e3f2fd', 3000);
                    setTimeout(() => renderOffers_enrollCard(offerId), 3000);
                };
                card.onmouseover = () => card.style.transform = 'translateY(-2px)';
                card.onmouseout = () => card.style.transform = 'none';
            }
            return card;
        }

        function createIconButton(text, handler, iconType) {
            const btn = document.createElement('button');
            btn.textContent = text;
            if (iconType) {
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('width', '16');
                svg.setAttribute('height', '16');
                const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                p.setAttribute('fill', 'currentColor');
                p.setAttribute('d', iconType === 'plus'
                    ? 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z'
                    : 'M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z');
                svg.appendChild(p);
                btn.prepend(svg);
            }
            btn.onclick = handler;
            btn.style.cssText = 'display:flex; align-items:center; gap:8px; padding:12px; border:none; cursor:pointer; transition: transform 0.2s ease;';
            btn.onmouseover = () => btn.style.transform = 'scale(1.05)';
            btn.onmouseout = () => btn.style.transform = 'none';
            return btn;
        }

        function createErrorElement(msg) {
            const err = document.createElement('div');
            err.textContent = msg;
            err.style.cssText = 'padding:16px; background:#ffebee; border-radius:8px; color:#c62828; display:flex; align-items:center; gap:8px;';
            return err;
        }
    }

    // Offers page container
    function renderOffers_page() {
        const containerDiv = document.createElement('div');
        containerDiv.style.display = 'flex';
        containerDiv.style.flexDirection = 'column';
        containerDiv.style.gap = '16px';
        containerDiv.style.padding = '16px';
        containerDiv.style.maxWidth = '1300px';
        containerDiv.style.margin = '0 auto';
        containerDiv.style.fontFamily = "'Inter', system-ui, sans-serif";
        return containerDiv;
    }

    // Benefits page renderer
    async function renderBenefits() {
        if (!glb_benefit || glb_benefit.length === 0) {
            await get_benefit();
        }

        const containerDiv = document.createElement('div');
        containerDiv.className = 'benefits-container';
        const groupedBenefits = groupBenefits(glb_benefit);
        const sortedBenefitGroups = sortBenefitGroups(groupedBenefits);

        // Define statusLegendConfig here, making it accessible to all helper functions
        const statusLegendConfig = {
            'ACHIEVED': { label: 'Completed', color: 'var(--ios-green)' },
            'IN_PROGRESS': { label: 'In Progress', color: 'var(--ios-blue)' }
        };

        const legend = createStatusLegend(statusLegendConfig); // Pass statusLegendConfig
        containerDiv.appendChild(legend);

        if (sortedBenefitGroups.length === 0) {
            const emptyState = createEmptyState();
            containerDiv.appendChild(emptyState);
        } else {
            sortedBenefitGroups.forEach(groupObj => {
                const accordionItem = createAccordionItem(groupObj, statusLegendConfig); // Pass statusLegendConfig
                containerDiv.appendChild(accordionItem);
            });
        }

        return containerDiv;

        // --- Helper Functions ---

        function groupBenefits(benefits) {
            const grouped = {};
            benefits.forEach(trackerObj => {
                const key = trackerObj.benefitId;
                grouped[key] = grouped[key] || [];
                grouped[key].push(trackerObj);
            });
            return grouped;
        }

        function getGroupSortData(trackerGroup) {
            const benefitSortMapping = {
                "200-afc-tracker": { order: 1, newName: "$200 Platinum Flight Credit" },
                "$200-airline-statement-credit": { order: 2, newName: "$200 Aspire Flight Credit" },
                "$400-hilton-aspire-resort-credit": { order: 3, newName: "$400 Hilton Aspire Resort Credit" },
                "$240 flexible business credit": { order: 4, newName: "$240 Flexible Business Credit" },
                "saks-platinum-tracker": { order: 5, newName: "$100 Saks Credit" },
                "$120 dining credit for gold card": { order: 6, newName: "$120 Dining Credit (Gold)" },
                "$84 dunkin' credit": { order: 7, newName: "$84 Dunkin' Credit" },
                "$100 resy credit": { order: 8, newName: "$100 Resy Credit" },
                "hotel-credit-platinum-tracker": { order: 9, newName: "$200 FHR" },
                "digital entertainment": { order: 10, newName: "$20 Digital Entertainment" },
                "$199 clear plus credit": { order: 11, newName: "$199 CLEAR Plus Credit" },
                "walmart+ monthly membership credit": { order: 12, newName: "Walmart+ Membership Credit" },
                "earn free night rewards": { order: 13, newName: "Earn Free Night Rewards" },
                "bd04b359-cc6b-4981-bd6f-afb9456eb9ea": { order: 14, newName: "Unlimited Delta Sky Club Access" },
                "delta-sky-club-visits-platinum": { order: 15, newName: "Delta Sky Club Access Pass" }
            };

            const firstTracker = trackerGroup[0];
            const benefitIdKey = (firstTracker.benefitId || "").toLowerCase().trim();
            const benefitNameKey = (firstTracker.benefitName || "").toLowerCase().trim();
            const sortData = benefitSortMapping[benefitIdKey] || benefitSortMapping[benefitNameKey];

            if (!sortData) {
                return { order: Infinity, displayName: firstTracker.benefitName || "" };
            }
            return { order: sortData.order, displayName: sortData.newName || firstTracker.benefitName || "" };
        }

        function sortBenefitGroups(groupedBenefits) {
            const groupArray = Object.entries(groupedBenefits).map(([key, group]) => {
                const sortInfo = getGroupSortData(group);
                return { key, trackers: group, order: sortInfo.order, displayName: sortInfo.displayName };
            });

            groupArray.sort((a, b) => {
                if (a.order !== b.order) return a.order - b.order;
                return (a.displayName || "").localeCompare(b.displayName || "");
            });
            return groupArray;
        }

        function createStatusLegend(statusLegendConfig) {
            const legend = document.createElement('div');
            legend.className = 'status-legend';

            Object.entries(statusLegendConfig).forEach(([status, { label, color }]) => {
                const legendItem = document.createElement('div');
                legendItem.className = 'legend-item';

                const colorDot = document.createElement('div');
                colorDot.className = 'legend-dot';
                colorDot.style.backgroundColor = color;

                const labelSpan = document.createElement('span');
                labelSpan.className = 'legend-label';
                labelSpan.textContent = label;

                legendItem.appendChild(colorDot);
                legendItem.appendChild(labelSpan);
                legend.appendChild(legendItem);
            });
            return legend;
        }

        function createEmptyState() {
            const emptyState = document.createElement('div');
            emptyState.className = 'ios-empty-state';

            const emptyStateContainer = document.createElement('div');
            emptyStateContainer.className = 'ios-empty-state-container';

            const emptyStateIcon = document.createElement('div');
            emptyStateIcon.className = 'ios-empty-state-icon';
            emptyStateIcon.innerHTML = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--ios-gray)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>`;

            const emptyStateTitle = document.createElement('div');
            emptyStateTitle.className = 'ios-empty-state-title';
            emptyStateTitle.textContent = 'No Benefits Found';

            const emptyStateMessage = document.createElement('div');
            emptyStateMessage.className = 'ios-empty-state-message';
            emptyStateMessage.textContent = 'No benefits are available to display at this time.';

            emptyStateContainer.appendChild(emptyStateIcon);
            emptyStateContainer.appendChild(emptyStateTitle);
            emptyStateContainer.appendChild(emptyStateMessage);
            emptyState.appendChild(emptyStateContainer);

            return emptyState;
        }

        function createAccordionItem(groupObj, statusLegendConfig) {
            const accordionItem = document.createElement('div');
            accordionItem.className = 'accordion-item';

            const headerDiv = createAccordionHeader(groupObj, statusLegendConfig);
            const bodyDiv = createAccordionBody(groupObj.trackers, statusLegendConfig);

            accordionItem.appendChild(headerDiv);
            accordionItem.appendChild(bodyDiv);

            return accordionItem;
        }

        function createAccordionHeader(groupObj, statusLegendConfig) {
            const headerDiv = document.createElement('div');
            headerDiv.className = 'accordion-header';

            const titleRow = createHeaderTitleRow(groupObj);
            const miniBarDiv = createMiniBar(groupObj.trackers, statusLegendConfig);

            headerDiv.appendChild(titleRow);
            headerDiv.appendChild(miniBarDiv);

            headerDiv.addEventListener('click', () => {
                toggleAccordionBody(headerDiv, headerDiv.nextElementSibling);
            });

            return headerDiv;
        }

        function createHeaderTitleRow(groupObj) {
            const titleRow = document.createElement('div');
            titleRow.className = 'title-row';

            const titleSpan = document.createElement('span');
            titleSpan.className = 'accordion-title';
            const durationText = groupObj.trackers[0].trackerDuration || (groupObj.trackers[0].tracker && groupObj.trackers[0].tracker.trackerDuration) || "";
            titleSpan.textContent = (groupObj.displayName || groupObj.trackers[0].benefitName || "") + (durationText ? ` (${durationText})` : "");

            const arrowIcon = createArrowIcon();

            titleRow.appendChild(titleSpan);
            titleRow.appendChild(arrowIcon);
            return titleRow;
        }

        function createArrowIcon() {
            const arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            arrowIcon.setAttribute('viewBox', '0 0 24 24');
            arrowIcon.setAttribute('width', '20');
            arrowIcon.setAttribute('height', '20');
            arrowIcon.style.transition = 'transform 0.3s ease';
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M7 10l5 5 5-5');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', 'var(--ios-gray)');
            path.setAttribute('stroke-width', '2');
            arrowIcon.appendChild(path);
            return arrowIcon;
        }

        function createMiniBar(trackersGroup, statusLegendConfig) {
            const miniBarDiv = document.createElement('div');
            miniBarDiv.className = 'mini-bar';

            trackersGroup.forEach(trackerObj => {
                const miniCard = document.createElement('div');
                miniCard.className = 'mini-card';

                // Apply iOS styling to mini card background
                const statusColor = statusLegendConfig[trackerObj.status]?.color || 'var(--ios-gray)';
                miniCard.style.backgroundColor = `${statusColor}15`;
                miniCard.style.border = `1px solid ${statusColor}40`;

                const statusDot = document.createElement('div');
                statusDot.className = 'status-dot';
                statusDot.style.backgroundColor = statusColor;

                const cardEnding = document.createElement('span');
                cardEnding.className = 'card-ending';
                cardEnding.textContent = trackerObj.cardEnding;

                miniCard.appendChild(statusDot);
                miniCard.appendChild(cardEnding);
                miniBarDiv.appendChild(miniCard);
            });
            return miniBarDiv;
        }

        function createAccordionBody(trackersGroup, statusLegendConfig) {
            const bodyDiv = document.createElement('div');
            bodyDiv.className = 'accordion-body';

            trackersGroup.forEach(trackerObj => {
                const trackerCard = createTrackerCard(trackerObj, statusLegendConfig);
                bodyDiv.appendChild(trackerCard);
            });

            return bodyDiv;
        }

        function createTrackerCard(trackerObj, statusLegendConfig) {
            const trackerCard = document.createElement('div');
            trackerCard.className = 'tracker-card';

            const cardHeader = createCardHeader(trackerObj);
            const progressContainer = createProgressBar(trackerObj, statusLegendConfig);

            trackerCard.appendChild(cardHeader);
            trackerCard.appendChild(progressContainer);

            if (trackerObj.progress && trackerObj.progress.message) {
                const messageDiv = createMessageDiv(trackerObj.progress.message);
                trackerCard.appendChild(messageDiv);
            }
            return trackerCard;
        }

        function createCardHeader(trackerObj) {
            const cardHeader = document.createElement('div');
            cardHeader.className = 'card-header';

            const cardNumber = document.createElement('div');
            cardNumber.className = 'card-number';
            cardNumber.textContent = `Card: •••• ${trackerObj.cardEnding}`;

            const dateRange = document.createElement('div');
            dateRange.className = 'date-range';
            const startFormatted = trackerObj.periodStartDate ? formatDate(trackerObj.periodStartDate, true) : "";
            const endFormatted = trackerObj.periodEndDate ? formatDate(trackerObj.periodEndDate, true) : "";
            const dateRangeText = (startFormatted && endFormatted) ? `${startFormatted} - ${endFormatted}` : "No period available";
            dateRange.textContent = dateRangeText;

            cardHeader.appendChild(cardNumber);
            cardHeader.appendChild(dateRange);
            return cardHeader;
        }

        function createProgressBar(trackerObj, statusLegendConfig) {
            const progressContainer = document.createElement('div');
            progressContainer.className = 'progress-container';

            const progressText = document.createElement('div');
            progressText.className = 'progress-text';

            const progressLabel = document.createElement('span');
            progressLabel.className = 'progress-label';
            progressLabel.textContent = 'Progress:';

            const progressAmount = document.createElement('span');
            progressAmount.className = 'progress-amount';
            const spent = parseFloat(trackerObj.tracker.spentAmount).toFixed(2);
            const target = parseFloat(trackerObj.tracker.targetAmount).toFixed(2);
            progressAmount.textContent = `${trackerObj.tracker.targetCurrencySymbol || ''}${spent} / ${trackerObj.tracker.targetCurrencySymbol || ''}${target}`;

            progressText.appendChild(progressLabel);
            progressText.appendChild(progressAmount);

            const progressBarWrapper = document.createElement('div');
            progressBarWrapper.className = 'progress-bar-wrapper';

            let percent = 0;
            const targetAmountNum = parseFloat(trackerObj.tracker.targetAmount);
            const spentAmountNum = parseFloat(trackerObj.tracker.spentAmount);
            if (targetAmountNum > 0) {
                percent = (spentAmountNum / targetAmountNum) * 100;
                if (percent > 100) percent = 100;
            }

            const progressFill = document.createElement('div');
            progressFill.className = `progress-fill ${trackerObj.status.toLowerCase() === 'achieved' ? 'achieved' : 'in-progress'}`;
            progressFill.style.width = percent + '%';

            progressBarWrapper.appendChild(progressFill);

            progressContainer.appendChild(progressText);
            progressContainer.appendChild(progressBarWrapper);
            return progressContainer;
        }

        function createMessageDiv(messageContent) {
            const message = document.createElement('div');
            message.className = 'message-div';
            message.innerHTML = messageContent;
            return message;
        }

        function toggleAccordionBody(header, bodyDiv) {
            const arrowIcon = header.querySelector('svg');
            const isOpen = bodyDiv.style.maxHeight !== '0px' && bodyDiv.style.maxHeight !== '';

            arrowIcon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';

            if (!isOpen) {
                bodyDiv.style.maxHeight = bodyDiv.scrollHeight + 'px';
                bodyDiv.style.padding = '0 16px 16px 16px';
            } else {
                bodyDiv.style.maxHeight = '0';
                bodyDiv.style.padding = '0 16px';
            }
        }
    }

    // Main page renderer
    async function renderPage() {
        content.innerHTML = '';
        let viewContent;

        switch (glb_view_page) {
            case 'members':
                viewContent = renderMembers_page();
                viewContent.appendChild(renderMembers_filterBar());
                {
                    const container = document.createElement('div');
                    container.id = 'members-table-container';
                    container.appendChild(renderMembers_table());
                    viewContent.appendChild(container);
                }
                break;

            case 'offers':
                viewContent = renderOffers_page(glb_offer);
                viewContent.appendChild(renderOffers_searchBar());
                {
                    const container = document.createElement('div');
                    container.id = 'offers-table-container';
                    container.appendChild(renderOffers_table());
                    viewContent.appendChild(container);
                }
                break;

            case 'summary':
                viewContent = renderSummary_page();
                break;

            case 'benefits':
                viewContent = await renderBenefits();
                break;

            default:
                viewContent = document.createElement('div');
                viewContent.textContent = 'Unknown view';
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

    function localStorageHandler(op, storage_accToken, keys) {
        // Define the default keys for this script.
        const defaultKeys = [
            "account",
            "offer",
            "lastUpdate",
            "priorityCards",
            "excludedCards",
            "balance",
            "benefit",
            "scriptVersion"
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
            scriptVersion: scriptVersion
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
                    if (!loaded["scriptVersion"] || JSON.parse(loaded["scriptVersion"]) !== scriptVersion) {
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

                    console.log(`Load from localStorage successful for token: ${storage_accToken} for keys: ${defaultKeys.join(", ")}`);
                    renderPage();

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
                console.error("Invalid operation code provided to localStorageHandler");
                return 0;
        }
    }


    // =========================================================================
    // Section 9: Initialization Functions
    // =========================================================================

    async function authorizeInit() {

        const tl = await get_trustLevel();
        if (tl === null || tl < 3) {
            return 0;
        }
        const expirationDate = new Date("2025-03-26T00:00:00Z");
        if (new Date() >= expirationDate) {
            console.error("Code expired on " + expirationDate.toLocaleString());
            return 0;
        }
        return 1;
    }

    async function init() {
        const auth = await authorizeInit();
        if (!auth) { alert("Authorization failed."); return; }

        const ui = buildUI();
        ({ container, content, viewBtns, toggleBtn, btnSummary, btnMembers, btnOffers, btnBenefits } = ui);

        const fetchStatus = await get_accounts(1);
        if (!fetchStatus || glb_account.length === 0) { alert("Unable to refresh."); return; }

        const localDataStatus = localStorageHandler("load", storage_accToken);
        if (localDataStatus === 0 || localDataStatus === 2) {
            await get_offers();
            await get_balance();
            await get_benefit();

            lastUpdate = new Date().toLocaleString();
            localStorageHandler("set", storage_accToken, ["lastUpdate", "scriptVersion"]);
            await renderPage();

        } else {
            console.log("Using data from LocalStorage.");
            await get_balance();
        }

        if (glb_view_page === 'members') {
            renderPage();
        }
    }

    init();
})();