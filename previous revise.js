// ==UserScript==
// @name         AMaxOffer
// @version      3.0.3
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

    const scriptVersion = "3.0.3";

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
        
        /* Header refresh button */
        .header-refresh-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 8px 16px;
            background-color: rgba(0, 122, 255, 0.1);
            color: var(--ios-blue);
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            gap: 6px;
            margin-left: 10px;
        }
        
        .header-refresh-btn:hover {
            background-color: rgba(0, 122, 255, 0.2);
            transform: scale(1.05);
        }
        
        .header-refresh-btn:active {
            transform: scale(0.98);
        }
        
        .header-refresh-btn svg {
            width: 16px;
            height: 16px;
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
    let glb_view_page = "members";  // Possible: "members", "offers", "benefits"
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
    let refreshStatusEl = null;     // Reference to the status element


    let content, viewBtns, toggleBtn, container, btnMembers, btnOffers, btnBenefits, refreshBtn;

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
        const btnMembers = createButton('Members', () => switchView('members', btnMembers));
        const btnOffers = createButton('Offers', () => switchView('offers', btnOffers));
        const btnBenefits = createButton('Benefits', () => switchView('benefits', btnBenefits));

        // Create refresh button
        refreshBtn = createButton('', async () => {
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
        }, {
            className: 'header-refresh-btn'
        });

        // Add refresh icon
        refreshBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"></path>
        </svg>
        Refresh Data`;

        refreshBtn.style.display = 'none';

        // Status element for refresh operations
        refreshStatusEl = document.createElement('div');
        refreshStatusEl.className = 'refresh-status';
        refreshStatusEl.id = 'refresh-status';
        refreshStatusEl.style.display = 'none';

        const viewBtns = createEl('div', {
            className: 'amaxoffer-nav',
            children: [btnMembers, btnOffers, btnBenefits, refreshBtn, refreshStatusEl]
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

        return { container, content, viewBtns, toggleBtn, btnMembers, btnOffers, btnBenefits, refreshBtn };
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
        refreshBtn.style.display = glb_view_mini ? 'none' : 'flex';
        refreshStatusEl.style.display = glb_view_mini ? 'none' : 'block';

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
        [btnMembers, btnOffers, btnBenefits].forEach(btn => {
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
                return a.favorite ? -1 * glb_offerSortState.direction : 1 * glb_offerSortState.direction;
            }

            const numericColumns = ["reward", "threshold", "percentage"];

            if (numericColumns.includes(key)) {
                const numA = parseNumericValue(a[key] || "");
                const numB = parseNumericValue(b[key] || "");

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

        saveCurrentScrollState();

        const container = document.getElementById('offers-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(renderOffers_table());
        } else {
            // If we're in grid view, update the display container
            const displayContainer = document.getElementById('offers-display-container');
            if (displayContainer) {
                displayContainer.innerHTML = "";
                const displayMode = localStorage.getItem('amaxoffer_offers_display') || 'table';
                if (displayMode === 'grid') {
                    displayContainer.appendChild(renderOffers_grid());
                } else {
                    displayContainer.appendChild(renderOffers_table());
                }
            }
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

            // Add highlight class if needed
            if (shouldHighlightItem(item)) {
                row.classList.add('ios-highlight-row');
            }

            // Alternate row styling
            if (item._index % 2 === 1) {
                row.style.backgroundColor = 'var(--ios-secondary-bg)';
            }

            // Hover effect
            row.addEventListener('mouseenter', () => {
                row.style.backgroundColor = 'rgba(242, 242, 247, 0.85)';
            });

            row.addEventListener('mouseleave', () => {
                if (item._index % 2 === 1) {
                    row.style.backgroundColor = 'var(--ios-secondary-bg)';
                } else {
                    row.style.backgroundColor = '';
                }

                if (shouldHighlightItem(item)) {
                    row.classList.add('ios-highlight-row');
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

            const emptyStateContainer = document.createElement('div');
            emptyStateContainer.className = 'ios-empty-state-container';

            const emptyStateIcon = document.createElement('div');
            emptyStateIcon.className = 'ios-empty-state-icon';
            emptyStateIcon.innerHTML = `
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
            `;

            const emptyStateTitle = document.createElement('div');
            emptyStateTitle.className = 'ios-empty-state-title';
            emptyStateTitle.textContent = 'No Items Found';

            const emptyStateMessage = document.createElement('div');
            emptyStateMessage.className = 'ios-empty-state-message';
            emptyStateMessage.textContent = 'Try adjusting your search or filters';

            const resetButton = document.createElement('button');
            resetButton.className = 'ios-empty-button';
            resetButton.textContent = 'Reset Filters';
            resetButton.addEventListener('click', handleResetFilters);

            emptyStateContainer.appendChild(emptyStateIcon);
            emptyStateContainer.appendChild(emptyStateTitle);
            emptyStateContainer.appendChild(emptyStateMessage);
            emptyStateContainer.appendChild(resetButton);

            emptyCell.appendChild(emptyStateContainer);
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        }

        // Helper function: Reset filters
        function handleResetFilters() {
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
                if (typeof window.renderPage === 'function') {
                    window.renderPage();
                }
            }
        }

        // Helper function: Determine whether to highlight item
        function shouldHighlightItem(item) {
            // For accounts tab - check for merchant search match
            if (item.display_account_number && window.glb_filters?.memberMerchantSearch) {
                if (!window.glb_filters.memberMerchantSearch || window.glb_filters.memberMerchantSearch.trim().length === 0) {
                    return false;
                }

                const searchTerm = window.glb_filters.memberMerchantSearch.trim().toLowerCase();
                return window.glb_offer?.some(offer => {
                    if (offer.name.toLowerCase().includes(searchTerm)) {
                        return (Array.isArray(offer.eligibleCards) && offer.eligibleCards.includes(item.display_account_number)) ||
                            (Array.isArray(offer.enrolledCards) && offer.enrolledCards.includes(item.display_account_number));
                    }
                    return false;
                });
            }

            return false;
        }