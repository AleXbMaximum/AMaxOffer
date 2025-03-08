// ==UserScript==
// @name         AMaxOffer
// @version      3.9
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

    const storageOpVersion = "3.0";

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
            /* Base colors */
            --ios-blue: #007AFF;
            --ios-dark-blue: #0062CC;
            --ios-green: rgb(32, 169, 69);
            --ios-orange: rgb(215, 129, 0);
            --ios-red: rgb(215, 49, 38);
            --ios-gray: rgb(142, 142, 147);
            
            /* Background colors */
            --ios-background: rgba(255, 255, 255, 0.8);
            --ios-secondary-bg: rgba(249, 249, 251, 0.6);
            --ios-light-gray: rgba(142, 142, 147, 0.1);
            
            /* Text colors */
            --ios-text-primary: #1c1c1e;
            --ios-text-secondary: #2c2c2e;
            
            /* Common properties */
            --ios-border: rgba(230, 230, 230, 0.7);
            --ios-radius: 18px;
            --ios-table-border-radius: 8px;
            --ios-font: 'AmexFont', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            
            /* Gradients */
            --ios-title-gradient: linear-gradient(45deg, #4CAF50, #2196F3);
            --ios-button-gradient: linear-gradient(45deg, rgb(84,99,86), rgb(27,66,29));
            --ios-header-bg: linear-gradient(to right, rgba(245, 245, 247, 0.9), rgba(235, 235, 242, 0.85));
            
            /* Shadows */
            --ios-shadow-sm: 0 2px 6px rgba(0, 0, 0, 0.06);
            --ios-shadow-md: 0 5px 16px rgba(0, 0, 0, 0.1);
            --ios-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
            
            /* Animation timings */
            --ios-anim-fast: 0.2s;
            --ios-anim-medium: 0.3s;
            --ios-anim-slow: 0.5s;
            
            /* Status colors */
            --ios-status-active-bg: rgba(52, 199, 89, 0.15);
            --ios-status-pending-bg: rgba(255, 149, 0, 0.15);
            --ios-status-inactive-bg: rgba(255, 59, 48, 0.15);
            
            /* Table styles */
            --ios-table-cell-padding: 10px 14px;
            --ios-table-row-hover: rgba(0, 0, 0, 0.04);
            --ios-table-header-font-size: 12px;
            --ios-table-cell-font-size: 13px;
            
            /* Highlight colors */
            --ios-highlight-bg: rgba(255, 204, 0, 0.2);
            --ios-highlight-border: rgba(255, 204, 0, 0.8);
            --ios-highlight-hover: rgba(255, 204, 0, 0.25);
            
            /* Empty state */
            --ios-empty-padding: 60px 20px;
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
            height: 80vh !important;
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
        
        /* Common Table Styles */
        .ios-table{
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-family: var(--ios-font);
            border-radius: var(--ios-table-border-radius);
            overflow: hidden;
            background-color: var(--ios-background);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            box-shadow: var(--ios-shadow-sm);
            border: 1px solid var(--ios-border);
        }
        
        .ios-table-head{
            background: var(--ios-header-bg);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            position: sticky;
            top: 0;
            z-index: 10;
        }
        
        .ios-table th{
            padding: var(--ios-table-cell-padding);
            font-weight: 600;
            color: var(--ios-text-primary);
            border-bottom: 1px solid rgba(60, 60, 67, 0.12);
            text-align: left;
        }
        
        .ios-table th.sortable{
            cursor: pointer;
            position: relative;
            padding-right: 28px;
        }
        
        .ios-table tr{
            transition: background-color 0.2s ease;
        }
        
        .ios-table tr:nth-child(even){
            background-color: var(--ios-secondary-bg);
        }
        
        .ios-table tr:hover{
            background-color: var(--ios-table-row-hover);
        }
        
        .ios-table td{
            padding: var(--ios-table-cell-padding);
            color: var(--ios-text-secondary);
            border-bottom: 1px solid rgba(60, 60, 67, 0.04);
            vertical-align: middle;
        }
        
        /* Status pills */
        .ios-status{
            display: inline-block;
            padding: 5px 10px;
            border-radius: 16px;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .ios-status.active, .ios-status.success{
            background-color: var(--ios-status-active-bg);
            color: var(--ios-green);
            border: 1px solid rgba(52, 199, 89, 0.25);
        }
        
        .ios-status.pending {
            background-color: var(--ios-status-pending-bg);
            color: var(--ios-orange);
            border: 1px solid rgba(255, 149, 0, 0.25);
        }
        
        .ios-status.inactive, .ios-status.failed, .ios-status.canceled {
            background-color: var(--ios-status-inactive-bg);
            color: var(--ios-red);
            border: 1px solid rgba(255, 59, 48, 0.25);
        }
              
        /* Empty state */
        .ios-empty-state{
            padding: var(--ios-empty-padding);
            text-align: center;
        }
        
        /* Search input */
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
        
        /* Animation keyframes */
        @keyframes fadeIn { 
            0% { opacity: 0; } 
            100% { opacity: 1; }
        }
        
        @keyframes slideIn { 
            0% { transform: translateY(20px); opacity: 0; } 
            100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes bounce { 
            0%, 100% { transform: scale(1); } 
            50% { transform: scale(1.05); }
        }
        
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); }
        }   

        @keyframes iosBounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.3); }
    }

        .ios-sort-animation {
        animation: iosBounce 0.3s ease;
    }
        
        /* Responsive design */
        @media (max-width: 768px) {
            .amaxoffer-container {
                width: 95%;
                left: 2.5%;
            }
            
            .summary-header,
            .button-container {
                flex-direction: column; align-items: stretch;
            }
        }
        `;
        document.head.appendChild(style);
    };

    // Call this function to add the global styles at the beginning
    addGlobalStyle();

    function addOptimizedAnimations() {
        const style = document.createElement('style');
        style.textContent = `
        /* Hardware-accelerated animations */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
    
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(10px); }
        }
    
        @keyframes pulse {
            0% { background-color: transparent; }
            30% { background-color: rgba(0, 122, 255, 0.1); }
            100% { background-color: transparent; }
        }
    
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    
        /* Hardware acceleration classes */
        .hw-accelerated {
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
        }
    
        /* Animation utility classes */
        .animate-fade-in {
            animation: fadeIn 0.3s ease forwards;
        }
    
        .animate-fade-out {
            animation: fadeOut 0.3s ease forwards;
        }
    
        .animate-pulse {
            animation: pulse 1s ease;
        }
    
        /* Virtual scrolling optimization */
        .virtual-table-wrapper {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
        }
    
        .virtual-table thead th {
            will-change: transform;
        }
    
        /* Optimize common elements */
        .ios-table {
            contain: content;
        }
    
        .ios-table tbody tr {
            contain: layout style;
        }
        `;

        document.head.appendChild(style);
    }

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

        modal: {
            overlay: ` position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); z-index: 10001; display: flex; justify-content: center; align-items: center; transition: opacity 0.3s ease; `,
            container: ` background-color: #fff; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); width: 90%; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; transform: translateY(40px) scale(0.95); opacity: 0; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); `,
            header: ` padding: 20px; border-bottom: 1px solid rgba(0,0,0,0.08); position: relative; display: flex; justify-content: space-between; align-items: center; `,
            title: ` margin: 0; font-size: 1.3rem; font-weight: 600; color: var(--ios-text-primary); `,
            closeButton: ` background: rgba(0,0,0,0.05); border: none; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; position: absolute; top: 16px; right: 16px; transition: all 0.2s ease; color: #666; z-index: 5; `,
            content: ` padding: 20px; overflow-y: auto; flex: 1; `,
            tabContainer: ` display: flex; border-bottom: 1px solid rgba(0,0,0,0.1); padding: 0 20px; background-color: #f8f8f8; `,
            tab: ` padding: 12px 20px; background: none; border: none; border-bottom: 3px solid transparent; font-size: 15px; font-weight: 500; color: #555; cursor: pointer; transition: all 0.2s ease; margin-right: 8px; `,
            tabActive: ` border-bottom-color: var(--ios-blue); color: var(--ios-blue); `
        },

        // Card list styles
        cardList: {
            container: ` display: flex; flex-direction: column; gap: 24px; margin-bottom: 16px;  `,
            sectionHeader: ` display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;  `,
            sectionTitle: ` margin: 0; font-size: 16px; font-weight: 600;  `,
            cardCount: ` font-size: 14px; color: var(--ios-gray);  `,
            grid: ` display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px;  `,
            emptyMessage: ` grid-column: 1 / -1; padding: 16px; text-align: center; background-color: rgba(0,0,0,0.02); border-radius: 10px; color: var(--ios-gray); font-size: 14px;  `,
            item: ` background-color: white; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); padding: 12px; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s ease;  `
        },

        // Badge styles (expanded)
        badges: {
            // Existing styles...
            statusPill: {
                eligible: ` border-radius: 16px; background-color: rgba(0, 122, 255, 0.1); color: var(--ios-blue); border: 1px solid rgba(0, 122, 255, 0.2); padding: 5px 12px; font-weight: 600;     font-size: 13px;  display: inline-flex;  align-items: center;  gap: 4px; `, enrolled: `  border-radius: 16px;  background-color: rgba(52, 199, 89, 0.1);  color: var(--ios-green);  border: 1px solid rgba(52, 199, 89, 0.2);  padding: 5px 12px;  font-weight: 600;  font-size: 13px;  display: inline-flex;  align-items: center;  gap: 4px; `
            }
        },
        glassMorphism: {
            card: ` background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: var(--ios-radius); border: 1px solid rgba(255, 255, 255, 0.3); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);  `,
            modal: ` background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 20px 80px rgba(0, 0, 0, 0.2);  `,
            navbar: ` background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-bottom: 1px solid rgba(230, 230, 230, 0.5);  `
        },

        // Beautiful gradient styles
        gradients: {
            primary: 'linear-gradient(135deg, #4CAF50, #2196F3)',
            success: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
            warning: 'linear-gradient(135deg, #FF9800, #FFC107)',
            danger: 'linear-gradient(135deg, #F44336, #FF5722)',
            blue: 'linear-gradient(135deg, #2196F3, #03A9F4)',
            purple: 'linear-gradient(135deg, #9C27B0, #673AB7)',
            dark: 'linear-gradient(135deg, #424242, #212121)'
        },

        // Refined animations
        animations: {
            fadeInUp: 'animation: fadeInUp 0.3s ease forwards;',
            fadeInDown: 'animation: fadeInDown 0.3s ease forwards;',
            scaleIn: 'animation: scaleIn 0.3s ease forwards;',
            pulse: 'animation: pulse 2s infinite;'
        },

        // Enhanced shadow styles
        shadows: {
            sm: 'box-shadow: 0 2px 6px rgba(0,0,0,0.05);',
            md: 'box-shadow: 0 5px 15px rgba(0,0,0,0.08);',
            lg: 'box-shadow: 0 10px 25px rgba(0,0,0,0.12);',
            xl: 'box-shadow: 0 15px 35px rgba(0,0,0,0.18);'
        },

        // Beautiful hover effects
        hoverEffects: {
            lift: ` transition: transform 0.2s ease, box-shadow 0.2s ease; &:hover {  transform: translateY(-4px);  box-shadow: 0 8px 20px rgba(0,0,0,0.1); }  `,
            glow: ` transition: box-shadow 0.2s ease; &:hover {  box-shadow: 0 0 16px rgba(0, 122, 255, 0.5); }  `,
            scale: ` transition: transform 0.2s ease; &:hover { transform: scale(1.05); }  `
        },

        cards: {
            stats: ` background-color: white; border-radius: 16px; padding: 16px 20px; min-width: 140px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); display: flex; flex-direction: column; align-items: center; transition: transform 0.2s ease;  `,
            offer: ` background-color: white; border-radius: 12px;  border: 1px solid rgba(0,0,0,0.08); padding: 16px; transition: all 0.2s ease; display: flex; gap: 14px;  `,
            benefit: ` border: 1px solid #e6e6e6; border-radius: 16px; padding: 16px; margin-top: 16px; background-color: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: all 0.3s ease; position: relative; overflow: hidden;  `
        },

        // Progress components
        progress: {
            container: `margin: 16px 0;`,
            bar: ` height: 12px; border-radius: 8px; background-color: #f0f0f0; position: relative; overflow: hidden; border: 1px solid #ddd; width: 100%; box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);  `,
            fill: ` height: 100%; position: absolute; top: 0; left: 0; transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);  `
        },

        // Accordion components
        accordion: {
            item: ` border: 1px solid #e0e0e0; border-radius: 12px; margin-bottom: 16px; background-color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: box-shadow 0.2s ease, transform 0.2s ease; overflow: hidden;  `,
            header: ` padding: 16px 20px; cursor: pointer; transition: background-color 0.2s ease; background-color: #f9f9f9; position: relative; border-bottom: 1px solid transparent;  `,
            body: ` padding: 0 20px; overflow: hidden; max-height: 0; transition: max-height 0.4s ease-in-out, padding 0.4s ease-in-out, opacity 0.3s ease; opacity: 0;  `
        },

        // Status mapping
        status: {
            achieved: { color: 'var(--ios-green)', bgColor: 'rgba(52, 199, 89, 0.15)', borderColor: 'rgba(52, 199, 89, 0.25)' },
            inProgress: { color: 'var(--ios-blue)', bgColor: 'rgba(0, 122, 255, 0.15)', borderColor: 'rgba(0, 122, 255, 0.25)' },
            notStarted: { color: 'var(--ios-gray)', bgColor: 'rgba(142, 142, 147, 0.15)', borderColor: 'rgba(142, 142, 147, 0.25)' },
            active: { color: 'var(--ios-green)', bgColor: 'rgba(52, 199, 89, 0.15)', borderColor: 'rgba(52, 199, 89, 0.25)' },
            pending: { color: 'var(--ios-orange)', bgColor: 'rgba(255, 149, 0, 0.15)', borderColor: 'rgba(255, 149, 0, 0.25)' },
            canceled: { color: 'var(--ios-red)', bgColor: 'rgba(255, 59, 48, 0.15)', borderColor: 'rgba(255, 59, 48, 0.25)' }
        },

        // Enhanced table cells
        tableCells: {
            index: `font-family: var(--ios-font); font-size: 13px;`,
            card: `font-weight: 500; color: #1c1c1e; font-size: 14px; padding: 4px 8px; border-radius: 6px; background-color: rgba(0,0,0,0.03); display: inline-block;`,
            name: `max-width: 170px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500; font-size: 13px;`,
            money: `font-variant-numeric: tabular-nums; font-weight: 600; text-align: right;`,
            description: `font-size: 13px; color: var(--ios-text-secondary); max-width: 220px; max-height: 60px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; line-height: 1.3;`
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
    const API_pendingBalance = "https://global.americanexpress.com/api/servicing/v1/financials/transaction_summary?status=pending";
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


    const FilterManager = (() => {
        // Default filter state
        const defaultFilters = {
            memberStatus: "Active",
            memberCardtype: "all",
            offerFav: false,
            offerMerchantSearch: "",
            memberMerchantSearch: "",
            offerCardEnding: "",
            enrollmentStatus: null,
            eligibleOnly: false,
            enrolledOnly: false,
            customFilter: null
        };

        // Current filters state
        const filters = { ...defaultFilters };

        // Filter query cache
        const filterCache = {
            members: { lastQuery: null, result: null },
            offers: { lastQuery: null, result: null }
        };

        function createFilterHash(view, filterState) {
            return JSON.stringify({
                view,
                filters: Object.entries(filterState)
                    .filter(([key]) =>
                        (view === 'members' && (key.startsWith('member') || key === 'customFilter')) ||
                        (view === 'offers' && (!key.startsWith('member') || key === 'customFilter'))
                    )
                    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
            });
        }

        return {
            getFilters() {
                return { ...filters };
            },

            setFilters(updates) {
                Object.assign(filters, updates);

                const affectsMembers = Object.keys(updates).some(k =>
                    k.startsWith('member') || k === 'customFilter'
                );
                const affectsOffers = Object.keys(updates).some(k =>
                    !k.startsWith('member') || k === 'customFilter'
                );

                if (affectsMembers) filterCache.members.lastQuery = null;
                if (affectsOffers) filterCache.offers.lastQuery = null;

                return this;
            },

            resetFilters(specificFilters = null) {
                if (specificFilters) {
                    specificFilters.forEach(key => {
                        if (key in defaultFilters) {
                            filters[key] = defaultFilters[key];
                        }
                    });
                } else {
                    Object.assign(filters, defaultFilters);
                }

                filterCache.members.lastQuery = null;
                filterCache.offers.lastQuery = null;

                return this;
            },

            getFilteredMembers() {
                const hash = createFilterHash('members', filters);
                if (filterCache.members.lastQuery === hash) {
                    return filterCache.members.result;
                }

                const filtered = glb_account.filter(acc => {
                    const statusMatch = filters.memberStatus === 'all' ||
                        acc.account_status?.trim().toLowerCase() === filters.memberStatus.toLowerCase();
                    if (!statusMatch) return false;

                    const typeMatch = filters.memberCardtype === 'all' ||
                        acc.relationship === filters.memberCardtype;
                    if (!typeMatch) return false;

                    if (filters.memberMerchantSearch) {
                        const term = filters.memberMerchantSearch.toLowerCase();

                        const accountMatches =
                            (acc.account_token || '').toLowerCase().includes(term) ||
                            (acc.embossed_name || '').toLowerCase().includes(term) ||
                            (acc.description || '').toLowerCase().includes(term);

                        const offerMatches = glb_offer.some(offer => {
                            const nameMatch = (offer.name || '').toLowerCase().includes(term);
                            const eligMatch = Array.isArray(offer.eligibleCards) &&
                                offer.eligibleCards.includes(acc.account_token);
                            const enrollMatch = Array.isArray(offer.enrolledCards) &&
                                offer.enrolledCards.includes(acc.account_token);

                            return nameMatch && (eligMatch || enrollMatch);
                        });

                        if (!accountMatches && !offerMatches) return false;
                    }

                    if (typeof filters.customFilter === 'function') {
                        return filters.customFilter(acc);
                    }

                    return true;
                });

                filterCache.members.lastQuery = hash;
                filterCache.members.result = filtered;

                return filtered;
            },

            getFilteredOffers() {
                const hash = createFilterHash('offers', filters);
                if (filterCache.offers.lastQuery === hash) {
                    return filterCache.offers.result;
                }

                const filtered = glb_offer.filter(offer => {
                    if (filters.offerFav && !offer.favorite) return false;

                    if (filters.offerMerchantSearch) {
                        const term = filters.offerMerchantSearch.toLowerCase();
                        if (!(offer.name || '').toLowerCase().includes(term)) return false;
                    }

                    if (filters.offerCardEnding) {
                        const relevantAccounts = glb_account.filter(acc =>
                            acc.cardEnding?.includes(filters.offerCardEnding)
                        ).map(acc => acc.account_token);

                        const isRelevant =
                            offer.eligibleCards?.some(token => relevantAccounts.includes(token)) ||
                            offer.enrolledCards?.some(token => relevantAccounts.includes(token));

                        if (!isRelevant) return false;
                    }

                    if (filters.enrollmentStatus === 'fully') {
                        const eligible = offer.eligibleCards?.length || 0;
                        const enrolled = offer.enrolledCards?.length || 0;
                        if (eligible + enrolled === 0 || enrolled !== eligible + enrolled) return false;
                    } else if (filters.enrollmentStatus === 'pending') {
                        const eligible = offer.eligibleCards?.length || 0;
                        const enrolled = offer.enrolledCards?.length || 0;
                        if (eligible + enrolled === 0 || enrolled === eligible + enrolled) return false;
                    }

                    if (filters.eligibleOnly && (offer.eligibleCards?.length || 0) === 0) return false;
                    if (filters.enrolledOnly && (offer.enrolledCards?.length || 0) === 0) return false;

                    if (typeof filters.customFilter === 'function') {
                        return filters.customFilter(offer);
                    }

                    return true;
                });

                filterCache.offers.lastQuery = hash;
                filterCache.offers.result = filtered;

                return filtered;
            }
        };
    })();

    //  5) MISCELLANEOUS 
    let lastUpdate = "";        // Last time data was fetched
    let runInBatchesLimit = 100; // Concurrency limit when enrolling in batches
    let storage_accToken = "";       // Suffix for the token to avoid conflicts
    let btnRefresh, refreshStatusEl;

    let content, viewBtns, toggleBtn, container, btnMembers, btnOffers, btnBenefits;


    // =========================================================================
    // Section 3: General Helper Functions
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


    function util_parseNumber(str) {
        if (str === undefined || str === null || str === '' || str === 'N/A') return 0;
        if (typeof str === 'number') return str;
        const cleanedStr = String(str).replace(/[$,]/g, '');
        if (cleanedStr.includes('%')) {
            return parseFloat(cleanedStr.replace(/%/g, '')) || 0;
        }
        const parsed = parseFloat(cleanedStr);
        return parsed;
    }



    // util_debounce function for input events
    function util_debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

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
                innerHTML: content, disabled
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
            callback = () => { }
        } = options;

        return ui_createElement('div', {
            styleString: `
                display:flex; flex-direction:column; align-items:center; 
                justify-content:center; padding:80px 20px; text-align:center; 
                background-color:rgba(0,0,0,0.02); border-radius:16px; 
                margin:20px 0;
            `,
            children: [
                // Icon
                ui_createElement('div', {
                    styleString: 'margin-bottom:24px; width:100px; height:100px; display:flex; align-items:center; justify-content:center;',
                    props: {
                        innerHTML: `<svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5">${iconSvg}</svg>`
                    }
                }),

                // Title
                ui_createElement('div', {
                    text: title,
                    styleString: 'font-size:18px; font-weight:600; margin-bottom:12px; color:#1c1c1e;'
                }),

                // Message
                ui_createElement('div', {
                    text: message,
                    styleString: 'font-size:14px; color:var(--ios-gray); max-width:400px; margin:0 auto 24px;'
                }),

                // Button
                ui_createElement('button', {
                    text: buttonText,
                    styleString: `
                        padding:10px 20px; background-color:var(--ios-blue); 
                        color:white; border:none; border-radius:10px; 
                        font-size:14px; font-weight:500; cursor:pointer; 
                        box-shadow:0 2px 8px rgba(0, 122, 255, 0.3); 
                        transition:all 0.2s ease;
                    `,
                    events: {
                        mouseenter: e => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 12px rgba(0, 122, 255, 0.4)';
                        },
                        mouseleave: e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 122, 255, 0.3)';
                        },
                        click: callback
                    }
                })
            ]
        });
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

    function ui_createModal(config = {}) {
        const {
            id = 'modal-overlay',
            width = '800px',
            title = '',
            onClose = () => { }
        } = config;

        // Remove existing modal with the same ID
        const existing = document.getElementById(id);
        if (existing) existing.remove();

        // Create overlay
        const overlay = ui_createElement('div', {
            props: { id },
            styleString: UI_STYLES.modal.overlay
        });

        // Create modal container
        const modal = ui_createElement('div', {
            styleString: UI_STYLES.modal.container + `max-width: ${width};`
        });

        // Create header with title and close button
        const header = ui_createElement('div', {
            styleString: UI_STYLES.modal.header
        });

        if (title) {
            const titleEl = ui_createElement('h3', {
                text: title,
                styleString: UI_STYLES.modal.title
            });
            header.appendChild(titleEl);
        }

        // Close button
        const closeBtn = ui_createElement('button', {
            props: {
                innerHTML: `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
                `
            },
            styleString: UI_STYLES.modal.closeButton,
            events: {
                mouseenter: (e) => {
                    e.target.style.backgroundColor = 'rgba(0,0,0,0.1)';
                    e.target.style.color = '#333';
                },
                mouseleave: (e) => {
                    e.target.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    e.target.style.color = '#666';
                },
                click: () => {
                    // Fade out animation
                    modal.style.transform = 'translateY(40px) scale(0.95)';
                    modal.style.opacity = '0';
                    overlay.style.opacity = '0';

                    // Remove after animation completes
                    setTimeout(() => {
                        overlay.remove();
                        onClose();
                    }, 300);
                }
            }
        });

        header.appendChild(closeBtn);
        modal.appendChild(header);

        // Create content container
        const content = ui_createElement('div', {
            styleString: UI_STYLES.modal.content
        });

        modal.appendChild(content);
        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Animate in
        setTimeout(() => {
            overlay.style.opacity = '1';
            modal.style.transform = 'translateY(0) scale(1)';
            modal.style.opacity = '1';
        }, 10);

        return {
            overlay,
            modal,
            header,
            content,
            closeBtn
        };
    }

    // Core table renderer with iOS styling and smaller text
    function ui_renderDataTable(headers, colWidths, items, cellRenderer, sortHandler, sortableKeys) {
        // Create main table with explicit styling using CSS variables
        const tableElement = document.createElement('table');
        tableElement.className = 'ios-table';
        tableElement.style.cssText = `
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            font-size: var(--ios-table-cell-font-size);
            color: var(--ios-text-secondary);
            border-radius: var(--ios-table-border-radius);
            overflow: hidden;
            box-shadow: var(--ios-shadow-sm);
            border: var(--ios-border-light);
            background-color: var(--ios-background);
            display: table;
        `;

        // Create header
        const thead = document.createElement('thead');
        thead.className = 'ios-table-head';
        thead.style.cssText = `
            background: var(--ios-header-bg);
            border-bottom: var(--ios-border-light);
            position: sticky;
            top: 0;
            z-index: 10;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
        `;

        const headerRow = document.createElement('tr');

        headers.forEach(headerItem => {
            const th = document.createElement('th');
            th.textContent = headerItem.label;
            th.style.cssText = `
                padding: var(--ios-table-cell-padding);
                font-size: var(--ios-table-header-font-size);
                font-weight: 600;
                color: var(--ios-text-secondary);
                text-align: center;
                vertical-align: middle;
                border-right: var(--ios-border-light);
            `;

            // Apply column width if specified
            if (colWidths && colWidths[headerItem.key]) {
                th.style.width = colWidths[headerItem.key];
            }

            // Add sort functionality
            if (sortableKeys && sortableKeys.includes(headerItem.key) && sortHandler) {
                th.className = 'sortable';
                th.setAttribute('data-sort-key', headerItem.key);
                th.style.position = 'relative';
                th.style.paddingRight = '28px';
                th.style.cursor = 'pointer';

                // Create sort button
                const sortButton = document.createElement('div');
                sortButton.className = 'ios-sort-button';
                sortButton.style.cssText = `
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;

                // Create sort indicator with SVG
                const sortIcon = document.createElement('div');
                sortIcon.className = 'ios-sort-indicator';
                sortIcon.style.cssText = `
                    width: 8px;
                    height: 8px;
                    transition: all var(--ios-anim-fast) ease;
                    opacity: 0.4;
                `;

                // Set current sort state
                const isActive = window.glb_memberSortState?.key === headerItem.key ||
                    window.glb_offerSortState?.key === headerItem.key;
                const direction = isActive ?
                    (window.glb_memberSortState?.key === headerItem.key ?
                        window.glb_memberSortState.direction :
                        window.glb_offerSortState?.direction) :
                    1;

                if (isActive) {
                    sortIcon.classList.add('active');
                    sortIcon.style.opacity = '1';
                    sortIcon.classList.add(direction === 1 ? 'asc' : 'desc');
                    sortIcon.innerHTML = direction === 1 ?
                        `<svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 0L8 8H0z" fill="var(--ios-blue)"/></svg>` :
                        `<svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 8L0 0H8z" fill="var(--ios-blue)"/></svg>`;
                } else {
                    sortIcon.innerHTML =
                        `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--ios-gray)" stroke-width="1">
                            <path d="M4 1v6M1 4h6"/>
                        </svg>`;
                }

                sortButton.appendChild(sortIcon);
                th.appendChild(sortButton);

                // Handle click for sorting
                th.addEventListener('click', () => {
                    sortHandler(headerItem.key);

                    // Reset all indicators
                    th.closest('tr').querySelectorAll('.ios-sort-indicator').forEach(icon => {
                        icon.classList.remove('active', 'asc', 'desc');
                        icon.style.opacity = '0.4';
                        icon.innerHTML = `<svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="var(--ios-gray)" stroke-width="1">
                            <path d="M4 1v6M1 4h6"/>
                        </svg>`;
                    });

                    // Update with animation
                    setTimeout(() => {
                        const updatedDirection = (window.glb_memberSortState?.key === headerItem.key)
                            ? window.glb_memberSortState.direction
                            : window.glb_offerSortState?.direction;

                        sortIcon.classList.add('active');
                        sortIcon.style.opacity = '1';
                        sortIcon.classList.add(updatedDirection === 1 ? 'asc' : 'desc');
                        sortIcon.innerHTML = updatedDirection === 1 ?
                            `<svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 0L8 8H0z" fill="var(--ios-blue)"/></svg>` :
                            `<svg width="8" height="8" viewBox="0 0 8 8"><path d="M4 8L0 0H8z" fill="var(--ios-blue)"/></svg>`;

                        // Add animation class
                        sortIcon.classList.add('ios-sort-animation');
                        setTimeout(() => sortIcon.classList.remove('ios-sort-animation'), 300);
                    }, 0);
                });
            }

            headerRow.appendChild(th);
        });

        thead.appendChild(headerRow);
        tableElement.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');

        // Handle empty state
        if (!items || items.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = headers.length;
            emptyCell.className = 'ios-empty-state';
            emptyCell.style.cssText = `
                padding: var(--ios-empty-padding);
                text-align: center;
                color: var(--ios-gray);`;

            const emptyStateDiv = document.createElement('div');
            emptyStateDiv.className = 'ios-empty-state-container';
            emptyStateDiv.innerHTML = `
                <div class="ios-empty-state-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ios-gray)" stroke-width="1.5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <div class="ios-empty-state-title">No Items Found</div>
                <div class="ios-empty-state-message">Try adjusting your search or filters</div>`;

            emptyCell.appendChild(emptyStateDiv);
            emptyRow.appendChild(emptyCell);
            tbody.appendChild(emptyRow);
        } else {
            // Create rows
            items.forEach((item, idx) => {
                const row = document.createElement('tr');
                row.style.cssText = `transition: background-color var(--ios-anim-fast) ease;`;

                if (idx % 2 === 1) {
                    row.style.backgroundColor = 'var(--ios-secondary-bg)';
                }

                // Check for highlighting
                function shouldHighlightItem(item) {
                    if (!glb_filters?.memberMerchantSearch) return { shouldHighlight: false };

                    const searchTerm = glb_filters.memberMerchantSearch.trim().toLowerCase();
                    if (!searchTerm) return { shouldHighlight: false };

                    // Check direct matches
                    const accountMatches =
                        item.account_token.toLowerCase().includes(searchTerm) ||
                        (item.embossed_name && item.embossed_name.toLowerCase().includes(searchTerm)) ||
                        (item.description && item.description.toLowerCase().includes(searchTerm));

                    if (accountMatches) return { shouldHighlight: true, matchType: 'account' };

                    // Check related offers
                    const matchingEnrolledOffers = glb_offer?.filter(offer => {
                        const nameMatch = offer.name.toLowerCase().includes(searchTerm);
                        const isEnrolled = Array.isArray(offer.enrolledCards) &&
                            offer.enrolledCards.includes(item.account_token);
                        return nameMatch && isEnrolled;
                    });

                    const matchingEligibleOffers = glb_offer?.filter(offer => {
                        const nameMatch = offer.name.toLowerCase().includes(searchTerm);
                        const isEligible = Array.isArray(offer.eligibleCards) &&
                            offer.eligibleCards.includes(item.account_token);
                        return nameMatch && isEligible;
                    });

                    return {
                        shouldHighlight: matchingEnrolledOffers.length > 0 || matchingEligibleOffers.length > 0,
                        matchType: matchingEnrolledOffers.length > 0 ? 'enrolled' :
                            (matchingEligibleOffers.length > 0 ? 'eligible' : null),
                        matchingEnrolledOffers,
                        matchingEligibleOffers
                    };
                }

                if (glb_view_page === "members" && glb_filters?.memberMerchantSearch) {
                    const highlightData = shouldHighlightItem(item);

                    if (highlightData.shouldHighlight) {
                        row.classList.add('ios-highlight-row');
                        row.dataset.highlighted = 'true';

                        // Apply different highlight styles based on match type
                        if (highlightData.matchType === 'enrolled') {
                            // Green highlight for enrolled offers
                            row.style.backgroundColor = 'rgba(52, 199, 89, 0.15)';
                            row.style.borderLeft = '3px solid rgba(52, 199, 89, 0.6)';
                        } else if (highlightData.matchType === 'eligible') {
                            // Blue highlight for eligible offers
                            row.style.backgroundColor = 'rgba(0, 122, 255, 0.15)';
                            row.style.borderLeft = '3px solid rgba(0, 122, 255, 0.6)';
                        } else {
                            // Default yellow highlight for direct account matches
                            row.style.backgroundColor = 'var(--ios-highlight-bg)';
                            row.style.borderLeft = '3px solid var(--ios-highlight-border)';
                        }

                        // Store match data for tooltips or additional UI features
                        if (highlightData.matchingEnrolledOffers?.length > 0) {
                            row.dataset.matchedEnrolledOffers = highlightData.matchingEnrolledOffers.length;
                        }
                        if (highlightData.matchingEligibleOffers?.length > 0) {
                            row.dataset.matchedEligibleOffers = highlightData.matchingEligibleOffers.length;
                        }
                    }
                }

                // Update mouse event listeners to preserve highlight colors
                row.addEventListener('mouseenter', () => {
                    if (row.dataset.highlighted === 'true') {
                        // Make hover slightly darker but preserve the color type
                        if (row.dataset.matchedEnrolledOffers) {
                            row.style.backgroundColor = 'rgba(52, 199, 89, 0.25)';
                        } else if (row.dataset.matchedEligibleOffers) {
                            row.style.backgroundColor = 'rgba(0, 122, 255, 0.25)';
                        } else {
                            row.style.backgroundColor = 'var(--ios-highlight-hover)';
                        }
                    } else {
                        row.style.backgroundColor = 'var(--ios-table-row-hover)';
                    }
                });

                row.addEventListener('mouseleave', () => {
                    if (row.dataset.highlighted === 'true') {
                        // Restore original highlight color
                        if (row.dataset.matchedEnrolledOffers) {
                            row.style.backgroundColor = 'rgba(52, 199, 89, 0.15)';
                        } else if (row.dataset.matchedEligibleOffers) {
                            row.style.backgroundColor = 'rgba(0, 122, 255, 0.15)';
                        } else {
                            row.style.backgroundColor = 'var(--ios-highlight-bg)';
                        }
                    } else {
                        row.style.backgroundColor = idx % 2 === 1 ? 'var(--ios-secondary-bg)' : '';
                    }
                });

                // Create cells
                headers.forEach(headerItem => {
                    const td = document.createElement('td');
                    td.style.cssText = `
                        padding: var(--ios-table-cell-padding);
                        border-bottom: var(--ios-border-light);
                        vertical-align: middle;
                        text-align: center;
                    `;

                    // Apply column width if specified
                    if (colWidths && colWidths[headerItem.key]) {
                        td.style.width = colWidths[headerItem.key];
                        td.style.maxWidth = colWidths[headerItem.key];
                    }

                    try {
                        // Get content using cell renderer
                        const content = cellRenderer(item, headerItem);

                        // Handle different types of content
                        if (content instanceof Node) {
                            td.appendChild(content);
                        } else if (typeof content === 'string') {
                            // Format currency
                            if (/^\$?\d+(\.\d{2})?$/.test(content)) {
                                const span = document.createElement('span');
                                span.className = 'ios-currency';
                                span.style.cssText = `
                                    font-variant-numeric: tabular-nums;
                                    font-weight: 500;
                                    text-align: center;
                                `;
                                span.textContent = content;
                                td.appendChild(span);
                            }
                            // Format status indicators
                            else if (['active', 'inactive', 'pending', 'completed', 'failed', 'success', 'canceled'].includes(content.toLowerCase())) {
                                const statusSpan = document.createElement('span');
                                statusSpan.className = `ios-status ${content.toLowerCase()}`;
                                statusSpan.textContent = content;

                                let statusStyle = '';
                                if (['active', 'success'].includes(content.toLowerCase())) {
                                    statusStyle = `
                                        background-color: var(--ios-status-active-bg);
                                        color: var(--ios-green);
                                        border: 1px solid rgba(52, 199, 89, 0.25);
                                    `;
                                } else if (content.toLowerCase() === 'pending') {
                                    statusStyle = `
                                        background-color: var(--ios-status-pending-bg);
                                        color: var(--ios-orange);
                                        border: 1px solid rgba(255, 149, 0, 0.25);
                                    `;
                                } else {
                                    statusStyle = `
                                        background-color: var(--ios-status-inactive-bg);
                                        color: var(--ios-red);
                                        border: 1px solid rgba(255, 59, 48, 0.25);
                                    `;
                                }

                                statusSpan.style.cssText = `
                                    display: inline-flex;
                                    align-items: center;
                                    justify-content: center;
                                    padding: 4px 10px;
                                    border-radius: 12px;
                                    font-size: 12px;
                                    font-weight: 500;
                                    ${statusStyle}
                                `;
                                td.appendChild(statusSpan);
                            }
                            // Regular text content
                            else {
                                td.textContent = content || '';
                            }
                        } else {
                            td.textContent = content || '';
                        }
                    } catch (error) {
                        console.error('Error rendering cell:', error);
                        td.textContent = 'Error';
                    }

                    row.appendChild(td);
                });

                tbody.appendChild(row);
            });
        }

        tableElement.appendChild(tbody);
        return tableElement;
    }

    // Build the UI container with a custom font, header with title and navigation buttons, and a content area.
    function ui_createMain() {

        // Create the main container with better positioning
        const container = ui_createElement('div', {
            props: { id: 'card-utility-overlay' },
            className: 'amaxoffer-container amaxoffer-minimized',
            styleString: `
                left: 25px;
                top: 25px;
                opacity: 0;
                transform: scale(0.95);
                transition: opacity 0.3s ease, transform 0.3s ease, width 0.3s ease, height 0.3s ease;
            `
        });

        // Title element
        const title = ui_createElement('span', {
            text: 'AMaxOffer',
            className: 'amaxoffer-title'
        });

        // Navigation buttons
        const btnMembers = ui_createBtn_v1('Members', () => ui_changeTab('members', btnMembers));
        const btnOffers = ui_createBtn_v1('Offers', () => ui_changeTab('offers', btnOffers));
        const btnBenefits = ui_createBtn_v1('Benefits', () => ui_changeTab('benefits', btnBenefits));

        // Navigation container with centered positioning
        const viewBtns = ui_createElement('div', {
            className: 'amaxoffer-nav',
            children: [btnMembers, btnOffers, btnBenefits],
            styleString: 'display:none; position:absolute; left:50%; transform:translateX(-50%); z-index:1;'
        });

        // Create refresh button with SVG icon
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
                    storage_manageData("set", storage_accToken, ["lastUpdate", "storageOpVersion"]);

                    refreshStatusEl.textContent = "Refresh complete.";
                    setTimeout(() => refreshStatusEl.textContent = "", 3000);

                    await SmartRenderer.renderCurrentView();
                } catch (e) {
                    console.error('Error refreshing data:', e);
                    refreshStatusEl.textContent = "Error refreshing data.";
                }
            },
            customStyle: 'display:none; align-items:center; justify-content:center;'
        });

        // Create status element
        refreshStatusEl = ui_createElement('div', {
            className: 'refresh-status',
            props: { id: 'refresh-status' },
            styleString: 'font-size:12px; color:#8e8e93; margin-right:8px; display:none;'
        });

        // Toggle button with SVG icon
        const toggleBtn = ui_createElement('button', {
            className: 'amaxoffer-toggle-btn',
            props: {
                innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>'
            },
            events: {
                click: ui_toggleMinimize,
                mouseenter: e => {
                    e.target.style.backgroundColor = '#f0f0f0';
                    e.target.style.borderColor = '#aaa';
                },
                mouseleave: e => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.borderColor = '#ccc';
                }
            }
        });

        // Right-side controls
        const rightControls = ui_createElement('div', {
            styleString: 'display:flex; align-items:center; justify-content:flex-end; margin-left:auto;',
            children: [refreshStatusEl, btnRefresh, toggleBtn]
        });

        // Header with improved position styling
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

        // Add window resize handler
        window.addEventListener('resize', ui_handleWindowResize);

        // Make the header draggable
        ui_makeDraggable(header, container);

        // Fade in the container
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'scale(1)';
        }, 50);

        return { container, content, viewBtns, toggleBtn, btnMembers, btnOffers, btnBenefits };
    }

    // Make an element draggable by tracking mouse movement.
    const ui_makeDraggable = (handle, container) => {
        let shiftX = 0, shiftY = 0;
        let latestX = 0, latestY = 0;
        let animationFrameId = null;

        const updatePosition = () => {
            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Calculate new position
            let newLeft = latestX - shiftX;
            let newTop = latestY - shiftY;

            // Get container size
            const rect = container.getBoundingClientRect();
            const isExpanded = container.classList.contains('amaxoffer-expanded');

            // Keep container within viewport when expanded
            if (isExpanded) {
                newLeft = Math.max(5, Math.min(viewportWidth - rect.width - 5, newLeft));
                newTop = Math.max(5, Math.min(viewportHeight - rect.height - 5, newTop));
            }

            // Apply position
            container.style.transition = 'none'; // Disable transition during drag
            container.style.left = `${newLeft}px`;
            container.style.top = `${newTop}px`;
            animationFrameId = null;
        };

        const onMouseMove = e => {
            e.preventDefault(); // Prevent text selection
            latestX = e.clientX;
            latestY = e.clientY;

            // Use requestAnimationFrame for smoother animation
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updatePosition);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            // Cancel any pending animation
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            // Reset transition
            setTimeout(() => {
                container.style.transition = 'all 0.3s ease';
            }, 0);

            // Change cursor back
            handle.style.cursor = 'grab';
            document.body.style.cursor = 'default';
        };

        handle.addEventListener('mousedown', e => {
            e.preventDefault();

            // Get container position
            const rect = container.getBoundingClientRect();
            shiftX = e.clientX - rect.left;
            shiftY = e.clientY - rect.top;

            // Change cursor during drag
            handle.style.cursor = 'grabbing';
            document.body.style.cursor = 'grabbing';

            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });
    };

    const ui_handleWindowResize = () => {
        // Only adjust if expanded
        if (!container.classList.contains('amaxoffer-expanded')) return;

        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Get current position
        const rect = container.getBoundingClientRect();

        // Ensure container stays within viewport
        let newLeft = parseFloat(container.style.left);
        let newTop = parseFloat(container.style.top);

        if (rect.right > viewportWidth) {
            newLeft = Math.max(5, viewportWidth - rect.width - 5);
        }

        if (rect.bottom > viewportHeight) {
            newTop = Math.max(5, viewportHeight - rect.height - 5);
        }

        // Apply new position if needed
        if (newLeft !== parseFloat(container.style.left)) {
            container.style.left = `${newLeft}px`;
        }

        if (newTop !== parseFloat(container.style.top)) {
            container.style.top = `${newTop}px`;
        }
    };

    // Toggle the minimized/expanded state of the UI container.
    const ui_toggleMinimize = () => {
        glb_view_mini = !glb_view_mini;

        // Get viewport dimensions for responsive sizing
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Update UI visibility
        content.style.display = glb_view_mini ? 'none' : 'block';
        viewBtns.style.display = glb_view_mini ? 'none' : 'flex';
        btnRefresh.style.display = glb_view_mini ? 'none' : 'flex';
        refreshStatusEl.style.display = glb_view_mini ? 'none' : 'block';

        // Use SVG icons for better appearance
        toggleBtn.innerHTML = glb_view_mini ?
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>' :
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/></svg>';

        if (glb_view_mini) {
            container.classList.add('amaxoffer-minimized');
            container.classList.remove('amaxoffer-expanded');
        } else {
            container.classList.remove('amaxoffer-minimized');
            container.classList.add('amaxoffer-expanded');

            // Ensure container stays within viewport
            const rect = container.getBoundingClientRect();
            if (rect.right > viewportWidth || rect.bottom > viewportHeight) {
                container.style.left = `${Math.max(5, (viewportWidth - rect.width) / 2)}px`;
                container.style.top = `${Math.max(5, (viewportHeight - rect.height) / 2)}px`;
            }
        }

        // Use a more reliable method to trigger render after expansion
        if (!glb_view_mini) {
            const renderAfterTransition = () => {
                SmartRenderer.renderCurrentView();
                container.removeEventListener('transitionend', renderAfterTransition);
            };

            container.addEventListener('transitionend', renderAfterTransition);

            // Fallback if transition doesn't fire
            setTimeout(() => {
                SmartRenderer.renderCurrentView();
            }, 350);
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
        SmartRenderer.renderCurrentView();
    };

    // Save the current scroll position for the active view.
    const ui_saveScrollPos = () => {
        if (content) {
            glb_view_scroll[glb_view_page].scrollTop = content.scrollTop;
        }
    };

    function ui_returnLogo(logoUrl, altText) {
        if (logoUrl && logoUrl !== "N/A") {
            return ui_createElement('div', {
                styleString: 'display:flex; justify-content:center; align-items:center; height:50px;',
                children: [
                    ui_createElement('img', {
                        props: { src: logoUrl, alt: altText || "Logo" },
                        styleString: 'max-width:50px; max-height:50px; border-radius:6px; transition:transform 0.2s ease;',
                        events: {
                            mouseenter: e => e.target.style.transform = 'scale(1.15)',
                            mouseleave: e => e.target.style.transform = 'scale(1)'
                        }
                    })
                ]
            });
        }

        return ui_createElement('div', {
            styleString: 'display:flex; justify-content:center; align-items:center; height:50px;',
            children: [
                ui_createElement('div', {
                    props: { innerHTML: '<svg width="24" height="24" viewBox="0 0 24 24" fill="#ccc"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>' },
                    styleString: 'width:40px; height:40px; display:flex; align-items:center; justify-content:center; background:#f5f5f5; border-radius:6px;'
                })
            ]
        });
    }


    function ui_createReactiveFilter(container, options = {}) {
        const {
            searchPlaceholder = 'Search...',
            onSearch = () => { },
            initialValue = '',
            onFilterChange = null,
            debounceDelay = 200 // Add debounce delay parameter with default 300ms
        } = options;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'ios-search-container';
        searchContainer.style.cssText = 'position:relative; width:100%; max-width:300px;';

        // Create search input
        const input = document.createElement('input');
        input.className = 'ios-search-input';
        input.type = 'text';
        input.placeholder = searchPlaceholder;
        input.value = initialValue;
        input.style.cssText = UI_STYLES.controls.search;

        // Add icon
        const searchIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        searchIcon.setAttribute('width', '16');
        searchIcon.setAttribute('height', '16');
        searchIcon.setAttribute('viewBox', '0 0 24 24');
        searchIcon.style.cssText = 'color:var(--ios-blue); opacity:0.6; position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none;';

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z');
        path.setAttribute('fill', 'currentColor');
        searchIcon.appendChild(path);

        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.innerHTML = '×';
        clearButton.style.cssText = 'position:absolute; right:30px; top:50%; transform:translateY(-50%); background:none; border:none; font-size:18px; cursor:pointer; color:#999; display:none;';

        // Create debounced update function
        let debounceTimeout;

        const triggerFilterChange = (value) => {
            if (onFilterChange) {
                onFilterChange(value);
            } else {
                SmartRenderer.renderCurrentView(true);
            }
        };

        // Handle input with debounce
        input.addEventListener('input', function () {
            const searchValue = this.value.toLowerCase();

            // Update filter state immediately
            glb_filters.memberMerchantSearch = searchValue;
            glb_filters.offerMerchantSearch = searchValue;

            // Show/hide clear button immediately
            clearButton.style.display = searchValue ? 'block' : 'none';

            // Call the search handler
            onSearch(searchValue);

            // Show visual feedback that something is happening
            searchIcon.style.color = 'var(--ios-orange)';

            // Debounce the actual filtering/rendering
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                triggerFilterChange(searchValue);
                searchIcon.style.color = 'var(--ios-blue)';
            }, debounceDelay);
        });

        // Clear button functionality
        clearButton.addEventListener('click', () => {
            input.value = '';
            glb_filters.memberMerchantSearch = '';
            glb_filters.offerMerchantSearch = '';
            clearButton.style.display = 'none';

            // Clear any pending debounce
            clearTimeout(debounceTimeout);

            // Immediately trigger update for clearing
            triggerFilterChange('');
            input.focus();
        });

        searchContainer.appendChild(input);
        searchContainer.appendChild(searchIcon);
        searchContainer.appendChild(clearButton);
        container.appendChild(searchContainer);

        return {
            container: searchContainer,
            input: input,
            getValue: () => input.value.toLowerCase(),
            setValue: (val) => {
                input.value = val;
                clearButton.style.display = val ? 'block' : 'none';
            }
        };
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

        SmartRenderer.markChanged('members');
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
        // Store reference to current offers for comparison
        const oldOffers = [...(Array.isArray(glb_offer) ? glb_offer : [])];
        const newOfferMap = new Map();
        const stats = { newCount: 0, expiredCount: 0, redeemedCount: 0 };

        // Helper function to check if offer should be skipped
        function shouldSkipOffer(offerName) {
            const skipPatterns = [
                "Your FICO&#174", "The Hotel Collection", "3X on Amex Travel",
                "Flexible Business Credit", "Apple Pay", "More Coffee",
                "More Travel", "Send Money to Friends", "Considering a Big Purchase"
            ];
            return skipPatterns.some(pattern =>
                offerName.toLowerCase().includes(pattern.toLowerCase())
            );
        }

        // Get active accounts
        const activeAccounts = glb_account.filter(acc =>
            acc.account_status?.trim().toLowerCase() === "active"
        );

        // Fetch offers for all active accounts concurrently
        const results = await Promise.all(
            activeAccounts.map(acc => api_fetchOfferList(acc.account_token))
        );

        // Process all offers
        activeAccounts.forEach((account, idx) => {
            const offers = results[idx] || [];

            offers.forEach(offer => {
                const sourceId = offer.source_id;
                if (!sourceId) return;

                if (shouldSkipOffer(offer.name || "")) return;

                let offerInfo;
                if (newOfferMap.has(sourceId)) {
                    offerInfo = newOfferMap.get(sourceId);
                } else {
                    const details = offers_parseDescription(offer.short_description || "");

                    offerInfo = {
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

                    newOfferMap.set(sourceId, offerInfo);

                    // Count new offers
                    if (!oldOffers.some(o => o.source_id === sourceId)) {
                        stats.newCount++;
                    }
                }

                // Update eligible/enrolled cards
                if (offer.status === "ELIGIBLE" &&
                    !offerInfo.eligibleCards.includes(account.account_token)) {
                    offerInfo.eligibleCards.push(account.account_token);
                } else if (offer.status === "ENROLLED" &&
                    !offerInfo.enrolledCards.includes(account.account_token)) {
                    offerInfo.enrolledCards.push(account.account_token);
                }
            });
        });

        // Process changes and preserve attributes from old offers
        api_processOfferUpdates(oldOffers, newOfferMap, stats);

        // Update card offer counts
        updateCardOfferCounts();

        // Save to storage
        storage_manageData("set", storage_accToken, ["account", "offer", "offer_expired", "offer_redeemed"]);

        // Mark offers view as changed
        SmartRenderer.markChanged('offers');

        return stats;

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
    }

    function api_processOfferUpdates(oldOffers, newOfferMap, stats) {
        // Create map for old offers
        const oldOfferMap = new Map();
        oldOffers.forEach(offer => {
            if (offer.source_id) oldOfferMap.set(offer.source_id, offer);
        });

        // Initialize tracking arrays if needed
        if (!Array.isArray(glb_offer_expired)) glb_offer_expired = [];
        if (!Array.isArray(glb_offer_redeemed)) glb_offer_redeemed = [];

        // Process all new offers
        for (const [sourceId, newOffer] of newOfferMap.entries()) {
            const oldOffer = oldOfferMap.get(sourceId);

            // Preserve attributes from old offer if it exists
            if (oldOffer) {
                // Preserve favorite status and details
                newOffer.favorite = oldOffer.favorite || false;
                newOffer.terms = oldOffer.terms || null;
                newOffer.long_description = oldOffer.long_description || null;
                newOffer.location = oldOffer.location || null;
                newOffer.cta = oldOffer.cta || null;
            }
        }

        // Process expired offers
        for (const [sourceId, oldOffer] of oldOfferMap.entries()) {
            if (!newOfferMap.has(sourceId)) {
                stats.expiredCount++;

                // Add to expired offers list
                const expiredOffer = { ...oldOffer, expiredDate: new Date().toISOString() };
                glb_offer_expired.push(expiredOffer);
            }
        }

        // Process redeemed offers
        for (const [sourceId, oldOffer] of oldOfferMap.entries()) {
            const newOffer = newOfferMap.get(sourceId);
            if (newOffer && Array.isArray(oldOffer.enrolledCards)) {
                // Find cards that were enrolled but aren't anymore
                const redeemedCards = oldOffer.enrolledCards.filter(token => {
                    const stillEnrolled = newOffer.enrolledCards.includes(token);
                    const cardActive = glb_account.some(acc =>
                        acc.account_token === token &&
                        acc.account_status?.trim().toLowerCase() === "active"
                    );

                    return !stillEnrolled && cardActive;
                });

                // Record redemptions
                if (redeemedCards.length > 0) {
                    stats.redeemedCount += redeemedCards.length;

                    glb_offer_redeemed.push({
                        source_id: sourceId,
                        offerId: newOffer.offerId,
                        name: newOffer.name,
                        redeemedCards: redeemedCards,
                        redeemedDate: new Date().toISOString()
                    });
                }
            }
        }

        // Update global offers with new data
        glb_offer = Array.from(newOfferMap.values());
    }

    function updateCardOfferCounts() {
        // Reset counters
        glb_account.forEach(acc => {
            acc.eligibleOffers = 0;
            acc.enrolledOffers = 0;
        });

        // Update counters based on offer data
        glb_offer.forEach(offer => {
            // Count eligible offers
            if (Array.isArray(offer.eligibleCards)) {
                offer.eligibleCards.forEach(token => {
                    const acc = glb_account.find(a => a.account_token === token);
                    if (acc) acc.eligibleOffers = (acc.eligibleOffers || 0) + 1;
                });
            }

            // Count enrolled offers
            if (Array.isArray(offer.enrolledCards)) {
                offer.enrolledCards.forEach(token => {
                    const acc = glb_account.find(a => a.account_token === token);
                    if (acc) acc.enrolledOffers = (acc.enrolledOffers || 0) + 1;
                });
            }
        });
    }



    async function api_fetchAccountBalance(accountToken) {
        if (!accountToken) {
            console.error("Account token is required");
            return null;
        }
        try {
            const balancesUrl = API_balance;
            const pTransactionUrl = API_pendingBalance;

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

        SmartRenderer.markChanged('benefits')

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
        // Tracking counters
        let totalAttempts = 0;
        let successCount = 0;
        const errors = [];

        // Create enrollment tasks
        const tasks = createEnrollmentTasks(offerSourceId, accountToken);

        // Execute tasks in batches with concurrency control
        const batchSize = Math.min(runInBatchesLimit, 25); // Reasonable default
        const results = [];

        for (let i = 0; i < tasks.length; i += batchSize) {
            const batch = tasks.slice(i, i + batchSize);
            const batchPromises = batch.map(task => executeTask(task));

            // Wait for current batch to complete
            const batchResults = await Promise.allSettled(batchPromises);

            // Process results
            batchResults.forEach((result, index) => {
                totalAttempts++;

                if (result.status === 'fulfilled' && result.value.result) {
                    successCount++;
                } else {
                    const taskInfo = batch[index];
                    const errorMsg = result.reason?.message ||
                        (result.value?.explanationMessage || 'Unknown error');
                    errors.push({ offer: taskInfo.offerName, card: taskInfo.cardEnding, error: errorMsg });
                }

                results.push(result.status === 'fulfilled' ? result.value : {
                    result: false,
                    error: result.reason?.message || 'Task failed'
                });
            });
        }

        // Refresh offer list to update state
        await api_refreshOffersList();

        // Return statistics
        return {
            total: totalAttempts,
            success: successCount,
            errors: errors,
            results: results
        };

        // Helper to create enrollment tasks
        function createEnrollmentTasks(offerSourceId, accountToken) {
            const tasks = [];

            // Filter eligible offers
            const eligibleOffers = glb_offer.filter(offer => {
                if (offerSourceId && offer.source_id !== offerSourceId) return false;
                if (offer.category === "DEFAULT") return false;
                return true;
            });

            // Create enrollment tasks
            eligibleOffers.forEach(offer => {
                // For each eligible card
                offer.eligibleCards.forEach(cardToken => {
                    // Filter by requested account token if provided
                    if (accountToken && cardToken !== accountToken) return;

                    // Get matching account
                    const account = glb_account.find(acc =>
                        acc.account_token === cardToken &&
                        acc.account_status?.trim().toLowerCase() === "active"
                    );

                    if (account && !glb_excludedCards.includes(account.account_token)) {
                        tasks.push({
                            offerId: offer.offerId,
                            sourceId: offer.source_id,
                            offerName: offer.name,
                            accountToken: account.account_token,
                            cardEnding: account.cardEnding,
                            isPriority: glb_priorityCards.includes(account.account_token)
                        });
                    }
                });
            });

            // Sort tasks: priority cards first
            tasks.sort((a, b) => {
                if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
                return 0;
            });

            return tasks;
        }

        // Helper to execute a single enrollment task
        async function executeTask(task) {
            // Add delay for non-priority cards
            if (!task.isPriority) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }

            try {
                // Perform enrollment
                const result = await api_enrollInOffer(task.accountToken, task.offerId);

                // Update offer data on success
                if (result.result) {
                    updateOfferEnrollment(task.sourceId, task.accountToken);
                }

                return result;
            } catch (error) {
                return {
                    offerId: task.offerId,
                    accountToken: task.accountToken,
                    result: false,
                    explanationMessage: error.message || "Error occurred"
                };
            }
        }

        // Helper to update offer enrollment status
        function updateOfferEnrollment(sourceId, accountToken) {
            const offer = glb_offer.find(o => o.source_id === sourceId);
            if (!offer) return;

            // Remove from eligible
            const eligibleIndex = offer.eligibleCards.indexOf(accountToken);
            if (eligibleIndex !== -1) {
                offer.eligibleCards.splice(eligibleIndex, 1);
            }

            // Add to enrolled if not already there
            if (!offer.enrolledCards.includes(accountToken)) {
                offer.enrolledCards.push(accountToken);
            }
        }
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
                statItem.addEventListener('click', () => {
                    // Apply the filter action
                    filterAction();

                    const tableContainer = document.getElementById('members-table-container');
                    if (tableContainer) {
                        tableContainer.innerHTML = "";
                        tableContainer.appendChild(members_renderTable());
                    }
                });
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

        SmartRenderer.renderCurrentView();
    }

    // Streamlined filter bar with enhanced search
    function members_renderFilterBar() {
        const filtersCard = document.createElement('div');
        filtersCard.style.cssText = UI_STYLES.containers.card + ' margin-bottom:8px;';

        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px;';

        // Create reactive search with direct update callback
        const searchFilter = ui_createReactiveFilter(searchContainer, {
            searchPlaceholder: 'Search members or offers...',
            initialValue: glb_filters.memberMerchantSearch || '',
            onFilterChange: (value) => {
                // Force immediate table update with highlighting
                const tableContainer = document.getElementById('members-table-container');
                if (tableContainer) {
                    tableContainer.innerHTML = "";
                    tableContainer.appendChild(members_renderTable());
                }
            }
        });

        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.textContent = 'Reset Filters';
        resetButton.style.cssText = 'padding:10px 16px; border:none; border-radius:8px; background:rgba(0,0,0,0.05); cursor:pointer;';
        resetButton.addEventListener('click', () => {
            searchFilter.setValue('');
            glb_filters.memberMerchantSearch = '';
            glb_filters.memberStatus = 'Active';
            glb_filters.memberCardtype = 'all';
            SmartRenderer.renderCurrentView(true);
        });

        searchContainer.appendChild(resetButton);
        filtersCard.appendChild(searchContainer);

        return filtersCard;
    }

    // Optimized members table renderer
    function members_renderTable() {
        const headers = [
            { label: "Index", key: "cardIndex" },
            { label: "Logo", key: "small_card_art" },
            { label: "Ending", key: "cardEnding" },
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

        // Cell renderer with organized handlers for each column type
        const cellRenderer = (item, headerItem) => {
            const key = headerItem.key;

            if (key === 'small_card_art') {
                return ui_returnLogo(item.small_card_art, item.description || "Card Logo");
            }

            // Cell rendering methods organized by column type
            const renderers = {
                small_card_art: () => {
                    if (item.small_card_art && item.small_card_art !== 'N/A') {
                        return ui_createElement('div', {
                            styleString: 'display:flex; justify-content:center; align-items:center; height:40px;',
                            children: [
                                ui_createElement('img', {
                                    props: { src: item.small_card_art, alt: "Card Logo" },
                                    styleString: 'max-width:40px; max-height:40px; border-radius:4px; transition:transform 0.2s ease;',
                                    events: {
                                        mouseenter: e => e.target.style.transform = 'scale(1.15)',
                                        mouseleave: e => e.target.style.transform = 'scale(1)'
                                    }
                                })
                            ]
                        });
                    }
                    return 'N/A';
                },

                cardIndex: () => {
                    const [mainIndex, subIndex] = util_parseCardIndex(item.cardIndex);
                    return ui_createElement('span', {
                        styleString: UI_STYLES.tableCells.index,
                        props: {
                            innerHTML: subIndex ?
                                `<strong>${mainIndex}</strong>-${subIndex}` :
                                `<strong>${mainIndex}</strong>`
                        }
                    });
                },

                cardEnding: () => {
                    return ui_createElement('div', {
                        text: item[key],
                        styleString: UI_STYLES.tableCells.card
                    });
                },

                embossed_name: () => {
                    return ui_createElement('div', {
                        text: item[key],
                        styleString: UI_STYLES.tableCells.name,
                        props: { title: item[key] }
                    });
                },

                account_setup_date: () => {
                    return (item[key] && item[key] !== 'N/A') ?
                        util_formatDate(item[key]) : 'N/A';
                },

                eligibleOffers: () => createOfferBadge(item[key], 'eligible', item.account_token),
                enrolledOffers: () => createOfferBadge(item[key], 'enrolled', item.account_token),

                relationship: () => {
                    if (item.relationship === "SUPP") {
                        const parentCardNum = members_getParentCardNumber(item);
                        return ui_createElement('div', {
                            styleString: 'display:flex; flex-direction:column; align-items:center; gap:2px;',
                            children: [
                                ui_createElement('span', {
                                    text: 'SUPP',
                                    styleString: 'font-size:12px; color:var(--ios-blue); font-weight:600;'
                                }),
                                ui_createElement('span', {
                                    text: `→ ${parentCardNum}`,
                                    styleString: 'font-size:11px; color:var(--ios-gray);'
                                })
                            ]
                        });
                    }

                    return ui_createElement('span', {
                        text: 'BASIC',
                        styleString: 'font-size:12px; font-weight:600; color:var(--ios-green);'
                    });
                },

                account_status: () => {
                    const status = item[key].toLowerCase();
                    const statusStyle = UI_STYLES.status[status] || UI_STYLES.status.pending;

                    return ui_createElement('span', {
                        text: item[key],
                        styleString: `
                            display:inline-block; padding:4px 10px; border-radius:12px; 
                            font-size:12px; font-weight:600; text-transform:capitalize;
                            background-color:${statusStyle.bgColor}; 
                            color:${statusStyle.color}; 
                            border:1px solid ${statusStyle.borderColor};
                        `
                    });
                },

                pending: () => createFinancialValue(item, 'debits_credits_payments_total_amount'),
                remainingStaBal: () => createFinancialValue(item, 'remaining_statement_balance_amount'),
                StatementBalance: () => createFinancialValue(item, 'statement_balance_amount'),

                priority: () => createToggleSwitch(item, 'priority'),
                exclude: () => createToggleSwitch(item, 'exclude')
            };

            // Use the appropriate handler or default
            return renderers[key] ? renderers[key]() : (util_cleanValue(item[key]) || '');
        };

        // Helper function for offer badges
        function createOfferBadge(count, type, accountToken) {
            const parsedCount = parseInt(count || 0);
            const container = ui_createElement('div', {
                styleString: 'height:32px; display:flex; align-items:center; justify-content:center;'
            });

            if (parsedCount > 0) {
                const isEligible = type === 'eligible';
                const statusStyle = isEligible ? UI_STYLES.status.inProgress : UI_STYLES.status.active;
                const icon = isEligible ?
                    `<svg width="12" height="12" viewBox="0 0 24 24" fill="${statusStyle.color}" style="margin-right:4px"><path d="M9.5 16.5v-9l7 4.5-7 4.5z"/></svg>` :
                    `<svg width="12" height="12" viewBox="0 0 24 24" fill="${statusStyle.color}" style="margin-right:4px"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>`;

                return ui_createElement('button', {
                    className: isEligible ? 'eligible-badge' : 'enrolled-badge',
                    props: { innerHTML: icon + parsedCount },
                    styleString: `
                        border-radius:16px; 
                        background-color:${statusStyle.bgColor}; 
                        color:${statusStyle.color}; 
                        border:1px solid ${statusStyle.borderColor}; 
                        padding:5px 12px; 
                        font-weight:600; 
                        font-size:13px; 
                        cursor:pointer; 
                        transition:all 0.2s ease; 
                        display:flex; 
                        align-items:center; 
                        justify-content:center; 
                        min-width:40px;
                        margin:0 auto;
                    `,
                    events: {
                        mouseover: e => {
                            e.target.style.transform = 'scale(1.05) translateY(-2px)';
                            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                        },
                        mouseout: e => {
                            e.target.style.transform = 'scale(1) translateY(0)';
                            e.target.style.boxShadow = 'none';
                        },
                        click: e => members_popCard(accountToken, type)
                    }
                });
            }

            // Zero count indicator
            return ui_createElement('span', {
                text: '0',
                styleString: 'color:var(--ios-gray); font-size:13px; font-weight:400; opacity:0.6; text-align:center; display:block;'
            });
        }

        // Helper function for financial values
        function createFinancialValue(item, fieldName) {
            if (item.relationship === "BASIC") {
                if (item.financialData) {
                    const value = item.financialData[fieldName];
                    const sanitizedValue = util_cleanValue(value);
                    const numValue = parseFloat(sanitizedValue);

                    return ui_createElement('div', {
                        styleString: `
                            ${UI_STYLES.tableCells.money}
                            font-weight:${numValue > 0 ? '600' : '400'}; 
                            color:${numValue > 0 ? '#1c1c1e' : '#8e8e93'};
                            text-align:center;
                            display:block;
                            margin:0 auto;
                        `,
                        text: numValue.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            minimumFractionDigits: 2
                        })
                    });
                }

                // Loading spinner for data being fetched
                return ui_createElement('div', {
                    className: 'loading-spinner',
                    styleString: 'width:16px; height:16px; border:2px solid rgba(0, 122, 255, 0.2); border-top:2px solid var(--ios-blue); border-radius:50%; margin:0 auto; animation:spin 1s linear infinite;'
                });
            }
            return "";
        }

        function createToggleSwitch(account, type) {
            const isChecked = type === 'priority'
                ? glb_priorityCards.includes(account.account_token)
                : glb_excludedCards.includes(account.account_token);

            const color = type === 'priority' ? 'var(--ios-blue)' : 'var(--ios-red)';

            return ui_createElement('div', {
                styleString: 'display:flex; justify-content:center; align-items:center;',
                children: [
                    ui_createElement('div', {
                        styleString: `
                            display:inline-block; position:relative; width:36px; height:22px; 
                            border-radius:11px; cursor:pointer; transition:background-color 0.3s ease; 
                            box-shadow:0 1px 3px rgba(0,0,0,0.1) inset; 
                            background-color:${isChecked ? color : '#e9e9ea'};
                            margin:0 auto;
                        `,
                        children: [
                            ui_createElement('div', {
                                styleString: `
                                    position:absolute; width:18px; height:18px; border-radius:9px; 
                                    background-color:#ffffff; box-shadow:0 1px 3px rgba(0, 0, 0, 0.15); 
                                    top:2px; left:${isChecked ? '16px' : '2px'}; transition:left 0.3s ease;
                                `
                            })
                        ],
                        props: {
                            title: type === 'priority' ? 'Priority Card (Enroll First)' : 'Exclude Card (Skip Enrollment)'
                        },
                        events: {
                            click: e => {
                                const newState = !isChecked;
                                const toggle = e.currentTarget;
                                const knob = toggle.firstChild;

                                // Update visual state
                                knob.style.left = newState ? '16px' : '2px';
                                toggle.style.backgroundColor = newState ? color : '#e9e9ea';

                                // Update data state
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
                            }
                        }
                    })
                ]
            });
        }

        // Define sortable columns
        const sortableKeys = [
            "cardIndex", "cardEnding", "embossed_name", "relationship",
            "account_setup_date", "account_status", "StatementBalance", "pending",
            "remainingStaBal", "eligibleOffers", "enrolledOffers"
        ];

        // Create and return the table
        return ui_renderDataTable(headers, colWidths, filteredAccounts, cellRenderer, members_sortTable, sortableKeys);
    }

    // Enhanced render for the offer-on-card popup
    function members_popCard(accountToken, offerType) {
        const account = glb_account.find(acc => acc.account_token === accountToken);
        if (!account) return;

        const { overlay, content, closeBtn } = ui_createModal({
            id: 'card-offers-modal',
            width: '800px',
            title: 'Card Offers',
            onClose: () => { }
        });

        // Set fixed height for modal content
        content.style.maxHeight = '75vh';
        content.style.overflowY = 'auto';

        // Add offer type badge to header
        content.parentNode.appendChild(ui_createBadge({
            value: offerType === 'eligible' ? 'Eligible' : 'Enrolled',
            color: offerType === 'eligible' ? 'var(--ios-blue)' : 'var(--ios-green)',
            customStyle: 'position:absolute; top:20px; right:50px;'
        }));

        // Add card info section
        content.appendChild(createCardInfoSection(account));

        // Get relevant offers
        const relevantOffers = getOffersForCard(account, offerType);

        // Content area
        const contentArea = ui_createElement('div', {
            styleString: UI_STYLES.text.body
        });

        // Add "Enroll All" button for eligible offers
        if (offerType === 'eligible' && relevantOffers.length > 0) {
            contentArea.appendChild(createEnrollAllButton(accountToken));
        }

        // Create offers list
        const offersList = ui_createElement('div', {
            styleString: 'display:flex; flex-direction:column; gap:12px;'
        });

        if (relevantOffers.length === 0) {
            offersList.appendChild(createEmptyOffersMessage(offerType));
        } else {
            // Create offer cards
            relevantOffers
                .sort((a, b) => a.name.localeCompare(b.name))
                .forEach(offer => {
                    offersList.appendChild(createOfferCard(offer, accountToken, offerType));
                });
        }

        contentArea.appendChild(offersList);
        content.appendChild(contentArea);

        // Functions for card components
        function createCardInfoSection(account) {
            return ui_createElement('div', {
                styleString: `${UI_STYLES.containers.flexRow} margin-bottom:16px;`,
                children: [
                    // Card logo if available
                    ui_returnLogo(account.small_card_art, account.description),

                    // Card details
                    ui_createElement('div', {
                        styleString: 'flex:1;',
                        children: [
                            ui_createElement('div', {
                                text: account.description || 'Card',
                                styleString: UI_STYLES.text.subtitle
                            }),
                            ui_createElement('div', {
                                text: `${account.cardEnding} - ${account.embossed_name || ''}`,
                                styleString: 'font-size:15px; color:#666;'
                            })
                        ]
                    })
                ].filter(Boolean)
            });
        }

        function getOffersForCard(account, type) {
            return type === 'eligible'
                ? glb_offer.filter(offer => Array.isArray(offer.eligibleCards) && offer.eligibleCards.includes(account.account_token))
                : glb_offer.filter(offer => Array.isArray(offer.enrolledCards) && offer.enrolledCards.includes(account.account_token));
        }

        function createEnrollAllButton(accountToken) {
            return ui_createBtn_v2({
                label: 'Enroll All Offers',
                icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>',
                type: 'primary',
                fullWidth: true,
                size: 'large',
                customStyle: 'margin-bottom:20px;',
                onClick: async (e) => {
                    const btn = e.currentTarget;
                    btn.innerHTML = '<div class="loading-spinner" style="width:18px;height:18px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></div>Enrolling...';
                    btn.disabled = true;
                    btn.style.opacity = '0.8';

                    try {
                        await api_batchEnrollOffers(null, accountToken);

                        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>Enrolled Successfully';
                        btn.style.backgroundColor = 'var(--ios-green)';

                        setTimeout(() => {
                            closeBtn.click();
                            SmartRenderer.renderCurrentView();
                        }, 1500);
                    } catch (err) {
                        console.error('Error enrolling all:', err);

                        btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>Error: Try Again';
                        btn.style.backgroundColor = 'var(--ios-red)';

                        setTimeout(() => {
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            btn.style.backgroundColor = 'var(--ios-blue)';
                            btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>Enroll All Offers';
                        }, 2000);
                    }
                }
            });
        }

        function createEmptyOffersMessage(type) {
            return ui_createElement('div', {
                styleString: 'text-align:center; padding:30px 20px; background-color:rgba(0,0,0,0.02); border-radius:12px;',
                children: [
                    ui_createElement('div', {
                        props: { innerHTML: '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="8" y1="12" x2="16" y2="12"></line></svg>' },
                        styleString: 'margin-bottom:16px;'
                    }),
                    ui_createElement('div', {
                        text: `No ${type} offers found for this card.`,
                        styleString: 'font-size:15px; color:#666;'
                    })
                ]
            });
        }

        function createOfferCard(offer, accountToken, offerType) {
            return ui_createElement('div', {
                styleString: `${UI_STYLES.cards.offer} background-color:${offer.favorite ? 'rgba(255, 149, 0, 0.05)' : 'white'};`,
                events: {
                    mouseenter: e => {
                        e.target.style.backgroundColor = offer.favorite ? 'rgba(255, 149, 0, 0.1)' : 'rgba(0,0,0,0.02)';
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = UI_STYLES.utils.shadow;
                    },
                    mouseleave: e => {
                        e.target.style.backgroundColor = offer.favorite ? 'rgba(255, 149, 0, 0.05)' : 'white';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                    }
                },
                children: [
                    // Logo
                    offer.logo && offer.logo !== 'N/A' ? ui_createElement('div', {
                        styleString: 'width:48px; height:48px; display:flex; align-items:center; justify-content:center; flex-shrink:0;',
                        children: [
                            ui_createElement('img', {
                                props: { src: offer.logo, alt: offer.name },
                                styleString: 'max-width:100%; max-height:100%; border-radius:6px;'
                            })
                        ]
                    }) : null,

                    // Offer content
                    ui_createElement('div', {
                        styleString: 'flex:1; min-width:0;',
                        children: [
                            // Title with favorite indicator
                            ui_createElement('div', {
                                styleString: `${UI_STYLES.containers.flexRow} gap:6px; margin-bottom:4px;`,
                                children: [
                                    offer.favorite ? ui_createElement('span', {
                                        text: '★',
                                        styleString: 'color:#ff9500; font-size:14px;'
                                    }) : null,
                                    ui_createElement('div', {
                                        text: offer.name,
                                        styleString: `${UI_STYLES.text.value} ${UI_STYLES.utils.truncate}`
                                    })
                                ].filter(Boolean)
                            }),

                            // Description
                            ui_createElement('div', {
                                text: shortenDescription(offer.short_description),
                                styleString: 'font-size:13px; color:#666; line-height:1.4; margin-bottom:8px;',
                                props: { title: offer.short_description }
                            }),

                            // Metric badges
                            ui_createElement('div', {
                                styleString: `${UI_STYLES.containers.flexRow} flex-wrap:wrap; gap:8px;`,
                                children: [
                                    ui_createBadge({ label: 'Spend', value: offer.threshold, color: 'var(--ios-gray)' }),
                                    ui_createBadge({ label: 'Reward', value: offer.reward, color: 'var(--ios-green)' }),
                                    ui_createBadge({ label: 'Rate', value: offer.percentage, color: 'var(--ios-blue)' }),
                                    ui_createBadge({ label: 'Expires', value: util_formatDate(offer.expiry_date), color: 'var(--ios-orange)' })
                                ].filter(Boolean)
                            })
                        ]
                    }),

                    // Enroll button for eligible offers
                    offerType === 'eligible' ? createEnrollButton(offer, accountToken) : null
                ].filter(Boolean)
            });
        }

        function shortenDescription(desc) {
            if (!desc) return 'No description available';
            return desc.length > 100 ? desc.substring(0, 100) + '...' : desc;
        }

        function createEnrollButton(offer, accountToken) {
            return ui_createElement('button', {
                props: {
                    innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>',
                    title: 'Enroll in this offer'
                },
                styleString: `
                    background-color: rgba(0, 122, 255, 0.1);
                    color: var(--ios-blue);
                    border: none;
                    border-radius: 50%;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    align-self: center;
                    flex-shrink: 0;
                    ${UI_STYLES.utils.transition}
                `,
                events: {
                    mouseenter: e => {
                        e.target.style.backgroundColor = 'var(--ios-blue)';
                        e.target.style.color = 'white';
                        e.target.style.transform = 'scale(1.1)';
                    },
                    mouseleave: e => {
                        e.target.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                        e.target.style.color = 'var(--ios-blue)';
                        e.target.style.transform = 'scale(1)';
                    },
                    click: async e => {
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        const originalHTML = btn.innerHTML;

                        btn.innerHTML = '<div class="loading-spinner" style="width:14px;height:14px;border:2px solid rgba(0,122,255,0.3);border-top:2px solid var(--ios-blue);border-radius:50%;animation:spin 1s linear infinite;"></div>';
                        btn.style.pointerEvents = 'none';

                        try {
                            const res = await api_enrollInOffer(accountToken, offer.offerId);

                            if (res.result) {
                                handleEnrollSuccess(btn, offer, accountToken);
                            } else {
                                handleEnrollFailure(btn, originalHTML);
                            }
                        } catch (error) {
                            console.error('Error enrolling offer:', error);
                            handleEnrollFailure(btn, originalHTML);
                        }
                    }
                }
            });
        }

        function handleEnrollSuccess(btn, offer, accountToken) {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>';
            btn.style.backgroundColor = 'var(--ios-green)';
            btn.style.color = 'white';

            // Update offer data
            const idx = offer.eligibleCards.indexOf(accountToken);
            if (idx !== -1) offer.eligibleCards.splice(idx, 1);
            if (!offer.enrolledCards.includes(accountToken)) offer.enrolledCards.push(accountToken);

            // Animate card away
            const offerCard = btn.closest('div');
            if (offerCard) {
                offerCard.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                offerCard.style.transform = 'translateX(100%)';
                offerCard.style.opacity = '0';

                setTimeout(() => {
                    offerCard.remove();
                    // Refresh the view if no offers remain
                    if (offersList.childElementCount === 0) {
                        members_popCard(accountToken, offerType);
                    }
                }, 500);
            }
        }

        function handleEnrollFailure(btn, originalHTML) {
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
            btn.style.backgroundColor = 'var(--ios-red)';
            btn.style.color = 'white';

            setTimeout(() => {
                btn.innerHTML = originalHTML;
                btn.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                btn.style.color = 'var(--ios-blue)';
                btn.style.pointerEvents = 'auto';
            }, 2000);
        }
    }

    function members_sortTable(key) {
        if (glb_memberSortState.key === key) {
            glb_memberSortState.direction *= -1;
        } else {
            glb_memberSortState.key = key;
            glb_memberSortState.direction = 1;
        }

        const numericColumns = ['StatementBalance', 'pending', 'remainingStaBal', 'eligibleOffers', 'enrolledOffers', 'days_past_due'];

        glb_account.sort((a, b) => {
            if (key === 'cardIndex') {
                const [aMain, aSub] = util_parseCardIndex(a.cardIndex);
                const [bMain, bSub] = util_parseCardIndex(b.cardIndex);
                if (aMain === bMain) {
                    return glb_memberSortState.direction * (aSub - bSub);
                }
                return glb_memberSortState.direction * (aMain - bMain);
            }
            else if (numericColumns.includes(key)) {
                const numA = util_parseNumber(a[key]);
                const numB = util_parseNumber(b[key]);
                return glb_memberSortState.direction * (numA - numB);
            }
            else if (key === 'account_setup_date') {
                const dateA = a[key] ? new Date(a[key]) : new Date(0);
                const dateB = b[key] ? new Date(b[key]) : new Date(0);
                return glb_memberSortState.direction * (dateA - dateB);
            }
            else {
                const valA = a[key] || "";
                const valB = b[key] || "";
                return glb_memberSortState.direction * valA.toString().localeCompare(valB.toString());
            }
        });

        ui_saveScrollPos();
        const container = document.getElementById('members-table-container');
        if (container) {
            container.innerHTML = "";
            container.appendChild(members_renderTable());
        }
    }



    //-------------------------------------------------------------------------

    /* Memoized offer filtering with cache invalidation and virtual table management*/

    function getFilteredOffers() {
        // Simply filter the offers based on current filters
        return glb_offer.filter(offer => {
            // Filter by favorites
            if (glb_filters.offerFav && !offer.favorite) return false;

            // Filter by merchant search
            if (glb_filters.offerMerchantSearch) {
                const searchTerm = glb_filters.offerMerchantSearch.toLowerCase();
                if (!offer.name.toLowerCase().includes(searchTerm)) return false;
            }

            // Filter by card ending
            if (glb_filters.offerCardEnding) {
                const matchingAccounts = glb_account.filter(acc =>
                    acc.cardEnding.includes(glb_filters.offerCardEnding)
                ).map(acc => acc.account_token);

                const isEligible = offer.eligibleCards?.some(token => matchingAccounts.includes(token));
                const isEnrolled = offer.enrolledCards?.some(token => matchingAccounts.includes(token));

                if (!isEligible && !isEnrolled) return false;
            }

            // Filter by enrollment status
            if (glb_filters.enrollmentStatus === 'fully') {
                const eligible = offer.eligibleCards?.length || 0;
                const enrolled = offer.enrolledCards?.length || 0;
                if (eligible + enrolled === 0 || enrolled !== eligible + enrolled) return false;
            } else if (glb_filters.enrollmentStatus === 'pending') {
                const eligible = offer.eligibleCards?.length || 0;
                const enrolled = offer.enrolledCards?.length || 0;
                if (eligible + enrolled === 0 || enrolled === eligible + enrolled) return false;
            }

            // Filter by eligibility
            if (glb_filters.eligibleOnly && (offer.eligibleCards?.length || 0) === 0) return false;
            if (glb_filters.enrolledOnly && (offer.enrolledCards?.length || 0) === 0) return false;

            // Custom filter
            if (glb_filters.customFilter && typeof glb_filters.customFilter === 'function') {
                if (!glb_filters.customFilter(offer)) return false;
            }

            return true;
        });
    }




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
        displayContainer.appendChild(offers_renderTableView());

        // Tab click handlers
        currentTab.addEventListener('click', () => {
            currentTab.style.backgroundColor = 'var(--ios-blue)';
            currentTab.style.color = 'white';
            historyTab.style.backgroundColor = 'transparent';
            historyTab.style.color = 'var(--ios-text-secondary)';

            displayContainer.innerHTML = '';
            displayContainer.appendChild(offers_renderTableView());
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
        containerDiv.appendChild(offers_renderControlBar());
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
                statItem.addEventListener('click', () => {
                    // Apply the filter action
                    filterAction();

                    const displayContainer = document.getElementById('offers-display-container');
                    if (displayContainer) {
                        displayContainer.innerHTML = "";
                        displayContainer.appendChild(offers_renderTableView());
                    }
                });
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
            SmartRenderer.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Favorites', stats.favoriteOffers, ICONS.FAVORITE, '255, 149, 0', () => {
            offers_resetAllFilters();
            glb_filters.offerFav = true;
            SmartRenderer.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Expiring Soon', stats.expiringSoon, ICONS.EXPIRING, '244, 67, 54', () => {
            offers_resetAllFilters();
            glb_filters.customFilter = offers_expiringFilter();
            SmartRenderer.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Pending Enrollment', stats.distinctNotFullyEnrolled, ICONS.PENDING, '255, 204, 0', () => {
            offers_resetAllFilters();
            glb_filters.enrollmentStatus = 'pending';
            SmartRenderer.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Total Eligible', stats.totalEligible, ICONS.ELIGIBLE, '142, 142, 147', () => {
            offers_resetAllFilters();
            glb_filters.eligibleOnly = true;
            SmartRenderer.renderCurrentView();
        }));

        statsBar.appendChild(createStatItem('Total Enrolled', stats.totalEnrolled, ICONS.TOTAL, '50, 173, 230', () => {
            offers_resetAllFilters();
            glb_filters.enrolledOnly = true;
            SmartRenderer.renderCurrentView();
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

    // control bar with better organization
    function offers_renderControlBar() {
        const filterCard = document.createElement('div');
        filterCard.style.cssText = UI_STYLES.containers.card + ' display:flex; flex-wrap:wrap; gap:16px; margin-bottom:8px; align-items:center;';

        // Create left container for enroll button
        const container_EnrollAllBtn = document.createElement('div');
        container_EnrollAllBtn.style.cssText = 'display:flex; flex-wrap:wrap; gap:12px; flex:1; align-items:center;';
        const enrollAllBtn = ui_createBtn_v2({
            label: 'Enroll All Offers',
            icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>',
            onClick: async () => {
                try {
                    await api_batchEnrollOffers();
                    SmartRenderer.renderCurrentView();
                } catch (e) {
                    console.error('Error enrolling all:', e);
                }
            },
            bgColor: 'var(--ios-green)',
            size: 'large',
            fullWidth: true,
            maxWidth: '200px'
        });
        container_EnrollAllBtn.appendChild(enrollAllBtn);
        filterCard.appendChild(container_EnrollAllBtn);

        // Create right container with search controls
        const searchContainer = document.createElement('div');
        searchContainer.style.cssText = 'display:flex; gap:12px; align-items:center; flex-wrap:wrap; flex:1; justify-content:flex-end;';

        // Add merchant search with reactive updates
        const merchantSearchContainer = document.createElement('div');
        merchantSearchContainer.style.cssText = 'flex:1; min-width:180px; max-width:300px;';

        const reactiveSearch = ui_createReactiveFilter(merchantSearchContainer, {
            searchPlaceholder: 'Search merchants...',
            initialValue: glb_filters.offerMerchantSearch || '',
            onFilterChange: (value) => {
                // Update filter and invalidate cache
                glb_filters.offerMerchantSearch = value;

                // Force immediate table update
                const container = document.getElementById('offers-table-container') ||
                    document.getElementById('offers-display-container');
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(offers_renderTableView());
                }
            }
        });
        searchContainer.appendChild(merchantSearchContainer);

        // Card ending filter (add reactive behavior here too)
        const cardSearchContainer = document.createElement('div');
        cardSearchContainer.style.cssText = 'position:relative; min-width:150px; max-width:200px; flex:0.7;';

        const cardFilter = ui_createReactiveFilter(cardSearchContainer, {
            searchPlaceholder: 'Card ending...',
            initialValue: glb_filters.offerCardEnding || '',
            onFilterChange: (value) => {
                glb_filters.offerCardEnding = value;

                const container = document.getElementById('offers-table-container') ||
                    document.getElementById('offers-display-container');
                if (container) {
                    container.innerHTML = '';
                    container.appendChild(offers_renderTableView());
                }
            }
        });
        searchContainer.appendChild(cardSearchContainer);

        // Reset button
        const resetButton = ui_createBtn_v2({
            label: 'Reset Filters',
            type: 'secondary',
            onClick: () => {
                // Reset all filter inputs
                reactiveSearch.setValue('');
                cardFilter.setValue('');
                offers_resetAllFilters();
                SmartRenderer.renderCurrentView(true);
            }
        });
        searchContainer.appendChild(resetButton);

        filterCard.appendChild(searchContainer);
        return filterCard;
    }


    function getProcessedOffers() {
        // Apply filters
        const filteredOffers = glb_offer.filter(offer => {
            if (glb_filters.offerFav && !offer.favorite) return false;

            if (glb_filters.offerMerchantSearch) {
                const searchTerm = glb_filters.offerMerchantSearch.toLowerCase();
                if (!offer.name.toLowerCase().includes(searchTerm)) return false;
            }

            if (glb_filters.offerCardEnding) {
                const matchingAccounts = glb_account.filter(acc =>
                    acc.cardEnding.includes(glb_filters.offerCardEnding)
                ).map(acc => acc.account_token);

                const isEligible = offer.eligibleCards?.some(token => matchingAccounts.includes(token));
                const isEnrolled = offer.enrolledCards?.some(token => matchingAccounts.includes(token));

                if (!isEligible && !isEnrolled) return false;
            }

            if (glb_filters.enrollmentStatus === 'fully') {
                const eligible = offer.eligibleCards?.length || 0;
                const enrolled = offer.enrolledCards?.length || 0;
                if (eligible + enrolled === 0 || enrolled !== eligible + enrolled) return false;
            } else if (glb_filters.enrollmentStatus === 'pending') {
                const eligible = offer.eligibleCards?.length || 0;
                const enrolled = offer.enrolledCards?.length || 0;
                if (eligible + enrolled === 0 || enrolled === eligible + enrolled) return false;
            }

            if (glb_filters.eligibleOnly && (offer.eligibleCards?.length || 0) === 0) return false;
            if (glb_filters.enrolledOnly && (offer.enrolledCards?.length || 0) === 0) return false;
            if (glb_filters.customFilter && typeof glb_filters.customFilter === 'function') {
                if (!glb_filters.customFilter(offer)) return false;
            }

            return true;
        });

        // Process the filtered offers with TableDataProcessor
        return TableDataProcessor.processTableData('offers-table', filteredOffers, {
            processFunctions: {
                // Pre-compute favorite cell
                favorite: offer => {
                    const buttonHtml = offer.favorite ?
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff9500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' :
                        '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';

                    return `<div style="display:flex; justify-content:center; align-items:center;">${buttonHtml}</div>`;
                },

                // Pre-compute logo cell
                logo: offer => {
                    const logoElement = ui_returnLogo(offer.logo, offer.name);
                    return `<div style="display:flex; justify-content:center; align-items:center;">${logoElement.outerHTML}</div>`;
                },

                // Pre-compute achievement type
                achievement_type: offer => {
                    const achievementType = offer.achievement_type;
                    const text = achievementType === "STATEMENT_CREDIT" ? "Cash" :
                        achievementType === "MEMBERSHIP_REWARDS" ? "MR" : achievementType;

                    const color = achievementType === "STATEMENT_CREDIT" ? '#2e7d32' :
                        achievementType === "MEMBERSHIP_REWARDS" ? '#1976d2' : '#2c3e50';

                    return `<div style="font-weight:500; font-size:13px; color:${color}; text-align:center;">${text}</div>`;
                },

                // Pre-compute category
                category: offer => {
                    if (offer.category && offer.category !== "N/A") {
                        const cat = offer.category.toString().toLowerCase().trim();
                        const categoryMap = {
                            "default": { icon: "🔰", color: "#9e9e9e" },
                            "dining": { icon: "🍽️", color: "#d32f2f" },
                            "entertainment": { icon: "🎭", color: "#7b1fa2" },
                            "services": { icon: "⚙️", color: "#616161" },
                            "shopping": { icon: "🛍️", color: "#1976d2" },
                            "travel": { icon: "✈️", color: "#0288d1" }
                        };

                        const config = categoryMap[cat] || { icon: "•", color: "#757575" };
                        return `<div style="display:flex; align-items:center; justify-content:center; gap:6px;">
                                <span>${config.icon}</span>
                                <span style="color:${config.color}; font-size:13px;">${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                              </div>`;
                    }
                    return '<div style="text-align:center;">N/A</div>';
                },

                redemption_types: offer => {
                    const types = (offer.redemption_types || "").toLowerCase();

                    // Define SVG icons
                    const icons = {
                        online: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1976d2" stroke-width="2"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"/></svg>',
                        instore: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d32f2f" stroke-width="2"><path d="M3 3h18v18H3zM3 9h18M9 21V9"/></svg>',
                        both: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7b1fa2" stroke-width="2"><path d="M20 7h-7l-3 3-3-3H3v13h17z"/><path d="M7 7V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3"/></svg>'
                    };

                    // Determine which icon to use
                    let icon = '';
                    if (types.includes('online') && types.includes('instore')) {
                        icon = icons.both;
                    } else if (types.includes('online')) {
                        icon = icons.online;
                    } else if (types.includes('instore')) {
                        icon = icons.instore;
                    }

                    // Create element with appropriate styling and tooltip
                    return icon ? `<div style="display:flex; justify-content:center;" title="${offer.redemption_types}">${icon}</div>` :
                        `<span style="font-size:12px; color:#777;">${offer.redemption_types || ""}</span>`;
                },

                // Pre-compute expiry
                expiry_date: offer => {
                    if (offer.expiry_date && offer.expiry_date !== 'N/A') {
                        const d = new Date(offer.expiry_date);
                        if (!isNaN(d)) {
                            const now = new Date();
                            const daysUntilExpiry = Math.floor((d - now) / (1000 * 60 * 60 * 24));

                            return `<div style="display:flex; flex-direction:column; align-items:center;">
                          <span style="font-size:13px;">${util_formatDate(offer.expiry_date)}</span>
                          <span style="font-size:${daysUntilExpiry > 30 ? '11px' : '12px'}; color:${daysUntilExpiry < 0 ? 'var(--ios-red)' :
                                    daysUntilExpiry <= 30 ? 'var(--ios-orange)' : 'var(--ios-gray)'
                                };">${daysUntilExpiry < 0 ? 'Expired' : `${daysUntilExpiry} days left`}</span>
                        </div>`;
                        }
                    }
                    return 'N/A';
                },

                // Pre-compute card badges
                eligibleCards: offer => {
                    const count = offer.eligibleCards?.length || 0;
                    if (count > 0) {
                        return `<div style="display:flex; justify-content:center; align-items:center;"><button class="eligible-badge" style="border-radius:16px; background-color:rgba(0, 122, 255, 0.1); color:var(--ios-blue); border:1px solid rgba(0, 122, 255, 0.25); padding:5px 12px; font-weight:600; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M20 12v6M16 20h8M4 20h2M14 4h6M20 8V4M4 4h2M4 16h2M4 12h2M4 8h2"/>
                                  <circle cx="10" cy="12" r="8" stroke-dasharray="2 2"/>
                                </svg>
                                ${count}
                              </button></div>`;
                    }
                    return `<div style="color:rgba(0,0,0,0.3); text-align:center;">0</div>`;
                },

                enrolledCards: offer => {
                    const count = offer.enrolledCards?.length || 0;
                    if (count > 0) {
                        return `<div style="display:flex; justify-content:center; align-items:center;"><button class="enrolled-badge" style="border-radius:16px; background-color:rgba(52, 199, 89, 0.1); color:var(--ios-green); border:1px solid rgba(52, 199, 89, 0.25); padding:5px 12px; font-weight:600; font-size:13px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px;">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                  <path d="M22 4L12 14.01l-3-3"/>
                                </svg>
                                ${count}
                              </button></div>`;
                    }
                    return `<div style="color:rgba(0,0,0,0.3); text-align:center;">0</div>`;
                },

                // Pre-compute formatted values
                threshold: offer => renderFormattedValue(offer.threshold, '#1c1c1e'),
                reward: offer => renderFormattedValue(offer.reward, 'var(--ios-green)'),
                percentage: offer => renderFormattedValue(offer.percentage, 'var(--ios-blue)'),


                // Pre-compute description
                short_description: offer => {
                    return `<div style="font-size:13px; color:var(--ios-text-secondary); max-width:220px; max-height:60px; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; line-height:1.3;">${offer.short_description || 'No description available'}</div>`;
                }
            },
            sortState: glb_offerSortState
        });
        function renderFormattedValue(value, color) {
            if (value && value !== 'N/A') {
                return `<div style="font-variant-numeric:tabular-nums; font-weight:600; text-align:center; color:${color};">${value}</div>`;
            }
            return '<div style="text-align:center;"></div>';
        }

    }

    // Updated render function that uses getProcessedOffers
    function offers_renderTableView() {
        // Get processed offers
        const processedOffers = getProcessedOffers();

        // Handle empty state
        if (processedOffers.length === 0) {
            return ui_createEmptyState(document.createElement('div'), {
                title: 'No Offers Found',
                message: glb_filters.offerFav ? 'No favorite offers found' :
                    glb_filters.offerMerchantSearch ? `No offers match "${glb_filters.offerMerchantSearch}"` :
                        'No offers available',
                buttonText: 'Reset Filters',
                callback: () => {
                    offers_resetAllFilters();
                    SmartRenderer.renderCurrentView();
                }
            });
        }

        // Define table headers and column widths
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

        // Cell renderer that handles pre-processed cells
        const cellRenderer = (offer, headerItem) => {
            const key = headerItem.key;
            const processedKey = `__processed_${key}`;

            // Use pre-processed value if available
            if (offer[processedKey] !== undefined) {
                const content = offer[processedKey];

                if (key === 'favorite') {
                    const favoriteButton = document.createElement('button');
                    favoriteButton.innerHTML = content;
                    favoriteButton.style.cssText = 'background:none; border:none; cursor:pointer; padding:5px; border-radius:50%; transition:all 0.2s ease;';

                    // Add event listeners for hover effects
                    favoriteButton.addEventListener('mouseenter', () => {
                        favoriteButton.style.transform = 'scale(1.2)';
                        favoriteButton.style.backgroundColor = 'rgba(0,0,0,0.05)';
                    });

                    favoriteButton.addEventListener('mouseleave', () => {
                        favoriteButton.style.transform = 'scale(1)';
                        favoriteButton.style.backgroundColor = 'transparent';
                    });

                    // Add click handler to toggle favorite status
                    favoriteButton.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent row click from triggering
                        offers_toggleFavorite(offer);
                    });

                    return favoriteButton;
                }

                // Handle HTML string
                if (typeof content === 'string' && content.trim().startsWith('<')) {
                    const wrapper = document.createElement('div');
                    wrapper.innerHTML = content;
                    return wrapper.firstChild || wrapper;
                }

                return content;
            }

            // Fallback for any unprocessed cells
            if (key === 'name') {
                return ui_createElement('div', {
                    text: offer.name,
                    styleString: 'max-width:170px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; font-weight:500; font-size:13px; color:var(--ios-text-primary); padding:8px 4px; font-weight:600; font-size:14px;',
                    props: { title: offer.name }
                });
            }

            // Return raw value for any other fields
            return offer[key] || 'N/A';
        };

        // Define sortable columns
        const sortableKeys = [
            "favorite", "name", "achievement_type", "category",
            "expiry_date", "threshold", "reward", "percentage",
            "eligibleCards", "enrolledCards"
        ];

        // Create the table
        const tableElement = ui_renderDataTable(headers, colWidths, processedOffers, cellRenderer, offers_sortTable, sortableKeys);

        // Make rows clickable
        setTimeout(() => {
            tableElement.querySelectorAll('tbody tr').forEach((row, index) => {
                if (index < processedOffers.length) {
                    row.style.cursor = 'pointer';
                    row.addEventListener('click', () => {
                        offers_popCard(processedOffers[index].offerId);
                    });
                }
            });
        }, 0);

        return tableElement;
    }

    function offers_toggleFavorite(offer) {
        // Toggle favorite status
        offer.favorite = !offer.favorite;

        const originalOffer = glb_offer.find(o => o.offerId === offer.offerId);
        if (originalOffer) {
            originalOffer.favorite = offer.favorite;
        }
        // Update pre-processed favorite icon 
        const isFavorite = offer.favorite;
        offer.__processed_favorite = isFavorite ?
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="#ff9500"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>' :
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';

        // Update TableDataProcessor data
        const favoriteBtn = event.target.closest('button');
        if (favoriteBtn) {
            favoriteBtn.innerHTML = offer.__processed_favorite;

            // Add animation effect
            favoriteBtn.classList.add('ios-sort-animation');
            setTimeout(() => favoriteBtn.classList.remove('ios-sort-animation'), 300);
        }

        // Save to localStorage
        storage_manageData("set", storage_accToken, ["offer"]);

        // Update stats to reflect favorite changes
        const statsBar = document.querySelector('.amaxoffer-content > div > div:first-child');
        if (statsBar) {
            const favoriteStats = statsBar.querySelectorAll('div')[1];
            if (favoriteStats) {
                const countElement = favoriteStats.querySelector('div > div:first-child');
                if (countElement) {
                    const favoriteCount = glb_offer.filter(o => o.favorite).length;
                    countElement.textContent = favoriteCount;
                }
            }
        }
    }

    // Simplified sort function that updates state and triggers re-render
    function offers_sortTable(key) {
        // Update sort state
        if (glb_offerSortState.key === key) {
            glb_offerSortState.direction *= -1;
        } else {
            glb_offerSortState.key = key;
            glb_offerSortState.direction = (key === "favorite") ? -1 : 1;
        }

        // Save scroll position and update UI
        ui_saveScrollPos();
        const displayContainer = document.getElementById('offers-display-container');
        if (displayContainer) {
            displayContainer.innerHTML = "";
            displayContainer.appendChild(offers_renderTableView());
        }
    }

    // Data processor without caching
    const TableDataProcessor = {
        processTableData(tableId, rawData, options = {}) {
            const {
                processFunctions = {},
                computeDerivedFields = [],
                sortState = null,
                filterFn = null
            } = options;

            // Apply filter if needed
            let processedItems = filterFn ? rawData.filter(filterFn) : [...rawData];

            // Apply sorting
            if (sortState && sortState.key) {
                const numericColumns = ['threshold', 'reward', 'percentage', 'eligibleCards', 'enrolledCards'];

                processedItems.sort((a, b) => {
                    if (numericColumns.includes(sortState.key)) {
                        const numA = util_parseNumber(a[sortState.key]);
                        const numB = util_parseNumber(b[sortState.key]);
                        return sortState.direction * (numA - numB);
                    } else if (sortState.key === "favorite") {
                        if (a.favorite === b.favorite) return 0;
                        return a.favorite ? -1 * sortState.direction : 1 * sortState.direction;
                    } else if (sortState.key === "expiry_date") {
                        const dateA = a[sortState.key] ? new Date(a[sortState.key]) : new Date(0);
                        const dateB = b[sortState.key] ? new Date(b[sortState.key]) : new Date(0);
                        return sortState.direction * (dateA - dateB);
                    } else {
                        const valA = String(a[sortState.key] || "");
                        const valB = String(b[sortState.key] || "");
                        return sortState.direction * valA.localeCompare(valB);
                    }
                });
            }

            // Process items with additional functions if provided
            return processedItems.map(item => {
                const result = { ...item };

                if (computeDerivedFields.length > 0) {
                    computeDerivedFields.forEach(deriveFn => {
                        Object.assign(result, deriveFn(item));
                    });
                }

                Object.entries(processFunctions).forEach(([key, processFn]) => {
                    result[`__processed_${key}`] = processFn(item);
                });

                return result;
            });
        }
    };

    // Enhanced enrollment card modal
    function offers_popCard(offerId) {
        const offer = glb_offer.find(o => o.offerId === offerId);
        if (!offer) return;

        const { overlay, content, closeBtn } = ui_createModal({
            id: 'offer-details-modal',
            width: '800px',
            title: offer.name,
            onClose: () => { }
        });

        content.style.maxHeight = '75vh';
        content.style.overflowY = 'auto';

        // Create tabs container and content areas
        const tabContainer = ui_createElement('div', {
            styleString: UI_STYLES.modal.tabContainer
        });

        const tabContents = setupTabs(['Cards', 'Details', 'Terms'], tabContainer);

        // Add offer header with details
        const headerInfo = createOfferHeaderInfo(offer);
        content.appendChild(headerInfo);
        content.appendChild(tabContainer);

        // Add content containers
        Object.values(tabContents).forEach(el => content.appendChild(el));

        // Populate tabs
        populateCardsTab(tabContents.cards, offer);
        populateDetailsTab(tabContents.details, offer);
        populateTermsTab(tabContents.terms, offer);

        document.body.appendChild(overlay);

        // Helper function to setup tabs
        function setupTabs(tabNames, container) {
            const contents = {};

            tabNames.forEach((name, index) => {
                // Create tab button
                const tab = ui_createElement('button', {
                    text: name,
                    styleString: `${UI_STYLES.modal.tab} ${index === 0 ? UI_STYLES.modal.tabActive : ''}`,
                    events: {
                        click: e => {
                            // Deactivate all tabs
                            Array.from(e.target.parentNode.children).forEach(btn => {
                                btn.style.borderBottomColor = 'transparent';
                                btn.style.color = '#555';
                            });

                            // Activate this tab
                            e.target.style.borderBottomColor = 'var(--ios-blue)';
                            e.target.style.color = 'var(--ios-blue)';

                            // Show selected content
                            Object.keys(contents).forEach(key => {
                                contents[key].style.display = key === name.toLowerCase() ? 'block' : 'none';
                            });
                        }
                    }
                });
                container.appendChild(tab);

                // Create content container
                contents[name.toLowerCase()] = ui_createElement('div', {
                    styleString: `padding:20px; display:${index === 0 ? 'block' : 'none'};`
                });
            });

            return contents;
        }

        // Create offer header with logo and details
        function createOfferHeaderInfo(offer) {
            return ui_createElement('div', {
                styleString: `${UI_STYLES.containers.flexRow} padding:16px 20px; border-bottom:1px solid rgba(0,0,0,0.08);`,
                children: [
                    ui_returnLogo(offer.logo, offer.name),

                    // Offer details
                    ui_createElement('div', {
                        styleString: 'flex:1;',
                        children: [
                            ui_createElement('div', {
                                text: offer.short_description || 'No description available',
                                styleString: 'font-size:14px; color:var(--ios-text-secondary); line-height:1.4; margin-top:4px;'
                            }),
                            ui_createElement('div', {
                                styleString: `${UI_STYLES.containers.flexRow} flex-wrap:wrap; gap:8px; margin-top:12px;`,
                                children: [
                                    ui_createBadge({ label: 'Spend', value: offer.threshold, color: 'var(--ios-gray)' }),
                                    ui_createBadge({ label: 'Reward', value: offer.reward, color: 'var(--ios-green)' }),
                                    ui_createBadge({ label: 'Rate', value: offer.percentage, color: 'var(--ios-blue)' }),
                                    ui_createBadge({ label: 'Expires', value: util_formatDate(offer.expiry_date), color: 'var(--ios-orange)' })
                                ].filter(Boolean)
                            })
                        ]
                    })
                ].filter(Boolean)
            });
        }

        // Cards tab content
        function populateCardsTab(container, offer) {
            // Add "Enroll All" button for eligible offers
            if (offer.eligibleCards.length > 0) {
                container.appendChild(ui_createBtn_v2({
                    label: `Enroll All Eligible Cards (${offer.eligibleCards.length})`,
                    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>',
                    type: 'primary',
                    fullWidth: true,
                    customStyle: 'margin-bottom:16px;',
                    onClick: async (e) => handleEnrollAll(e, offer)
                }));
            }

            // Create combined table with all cards
            const allCards = [
                ...offer.eligibleCards.map(token => ({ token, status: 'eligible' })),
                ...offer.enrolledCards.map(token => ({ token, status: 'enrolled' }))
            ];

            // Add table header
            container.appendChild(ui_createElement('h3', {
                text: `Cards (${allCards.length})`,
                styleString: UI_STYLES.text.subtitle
            }));

            // Create and add cards table
            container.appendChild(createCardsTable(allCards, offer));
        }

        // Handle enrollment of all cards for an offer
        async function handleEnrollAll(e, offer) {
            const btn = e.currentTarget;
            btn.innerHTML = '<div class="loading-spinner" style="width:20px;height:20px;border:2px solid rgba(255,255,255,0.3);border-top:2px solid white;border-radius:50%;animation:spin 1s linear infinite;margin-right:8px;"></div>Enrolling...';
            btn.disabled = true;

            try {
                // Save eligible tokens before enrollment
                const eligibleTokens = [...offer.eligibleCards];

                // Perform enrollment
                await api_batchEnrollOffers(offer.source_id);

                // Update button state
                btn.innerHTML = '✓ All Cards Enrolled';
                btn.style.backgroundColor = 'var(--ios-green)';

                // Update offer data
                offer.eligibleCards = [];
                eligibleTokens.forEach(token => {
                    if (!offer.enrolledCards.includes(token)) {
                        offer.enrolledCards.push(token);
                    }
                });

                // Update table UI
                updateTableAfterEnrollment();
            } catch (err) {
                console.error('Error:', err);
                btn.innerHTML = '× Error - Try Again';
                btn.style.backgroundColor = 'var(--ios-red)';

                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = `Enroll All Eligible Cards (${offer.eligibleCards.length})`;
                    btn.style.backgroundColor = 'var(--ios-blue)';
                }, 2000);
            }

            // Update UI after enrollment
            function updateTableAfterEnrollment() {
                const table = tabContents.cards.querySelector('table');
                if (!table) return;

                // Update rows
                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const actionCell = row.querySelector('td:last-child');
                    const actionBtn = actionCell?.querySelector('button');

                    if (actionBtn && actionBtn.textContent === 'Enroll') {
                        // Update button
                        actionBtn.innerHTML = 'Enrolled';
                        actionBtn.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
                        actionBtn.style.color = 'var(--ios-green)';
                        actionBtn.disabled = true;

                        // Highlight row briefly
                        row.style.transition = 'background-color 1.5s ease';
                        row.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
                        setTimeout(() => row.style.backgroundColor = '', 1500);
                    }
                });
            }
        }

        // Create cards table
        function createCardsTable(cardItems, offer) {
            const headers = [
                { label: "Index", key: "cardIndex" },
                { label: "Card", key: "card" },
                { label: "Card Ending", key: "cardEnding" },
                { label: "Name", key: "name" },
                { label: "Type", key: "type" },
                { label: "Action", key: "action" }
            ];

            const colWidths = {
                cardIndex: "60px",
                card: "60px",
                cardEnding: "100px",
                name: "180px",
                type: "80px",
                action: "80px"
            };

            // Map card tokens to table items
            const items = cardItems.map(item => {
                const account = glb_account.find(acc => acc.account_token === item.token);
                if (!account) return null;

                return {
                    _token: item.token,
                    _account: account,
                    status: item.status,
                    cardEnding: account.cardEnding,
                    name: account.embossed_name || '',
                    type: account.relationship || '',
                    card: account.small_card_art || '',
                    cardIndex: account.cardIndex || ''
                };
            }).filter(Boolean);

            // Sort: eligible first, then by cardIndex
            items.sort((a, b) => {
                if (a.status !== b.status) {
                    return a.status === 'eligible' ? -1 : 1;
                }

                const [aMain, aSub] = util_parseCardIndex(a.cardIndex);
                const [bMain, bSub] = util_parseCardIndex(b.cardIndex);

                if (aMain === bMain) {
                    return aSub - bSub;
                }
                return aMain - bMain;
            });

            // Cell renderer for table
            const cellRenderer = (item, header) => {
                const key = header.key;

                switch (key) {
                    case 'card':
                        return ui_returnLogo(item.card, `Card ${item.cardEnding}`);

                    case 'cardIndex':
                        const [mainIndex, subIndex] = util_parseCardIndex(item.cardIndex);
                        return ui_createElement('span', {
                            styleString: UI_STYLES.tableCells.index,
                            props: {
                                innerHTML: subIndex ?
                                    `<strong>${mainIndex}</strong>-${subIndex}` :
                                    `<strong>${mainIndex}</strong>`
                            }
                        });

                    case 'action':
                        return item.status === 'eligible' ?
                            createEnrollButton(item, offer) :
                            createEnrolledLabel();

                    default:
                        return item[key] || '';
                }
            };

            return ui_renderDataTable(headers, colWidths, items, cellRenderer);

            // Create enroll button for eligible card
            function createEnrollButton(item, offer) {
                return ui_createElement('button', {
                    text: 'Enroll',
                    styleString: `
                        padding: 4px 10px;
                        background-color: rgba(0, 122, 255, 0.1);
                        color: var(--ios-blue);
                        border: none;
                        border-radius: 8px;
                        font-size: 12px;
                        cursor: pointer;
                        transition: all 0.2s ease;
                    `,
                    events: {
                        mouseenter: e => {
                            e.target.style.backgroundColor = 'rgba(0, 122, 255, 0.2)';
                        },
                        mouseleave: e => {
                            e.target.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                        },
                        click: async e => {
                            await handleSingleEnrollment(e, item._token, offer);
                        }
                    }
                });
            }

            // Create enrolled label
            function createEnrolledLabel() {
                return ui_createElement('span', {
                    text: 'Enrolled',
                    styleString: `
                        display: inline-block;
                        padding: 4px 10px;
                        background-color: rgba(52, 199, 89, 0.1);
                        color: var(--ios-green);
                        border-radius: 8px;
                        font-size: 12px;
                    `
                });
            }

            // Handle enrollment of a single card
            async function handleSingleEnrollment(e, token, offer) {
                const btn = e.target;
                const originalHTML = btn.innerHTML;

                btn.innerHTML = '<div class="spinner" style="width:10px;height:10px;border:1px solid rgba(0,122,255,0.3);border-top:1px solid var(--ios-blue);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto;"></div>';
                btn.disabled = true;

                try {
                    const result = await api_enrollInOffer(token, offer.offerId);

                    if (result.result) {
                        // Success
                        btn.innerHTML = '✓';
                        btn.style.backgroundColor = 'var(--ios-green)';
                        btn.style.color = 'white';

                        // Update offer data
                        const idx = offer.eligibleCards.indexOf(token);
                        if (idx !== -1) offer.eligibleCards.splice(idx, 1);
                        if (!offer.enrolledCards.includes(token)) {
                            offer.enrolledCards.push(token);
                        }

                        // Update the row
                        const row = btn.closest('tr');
                        if (row) {
                            btn.innerHTML = 'Enrolled';
                            btn.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
                            btn.style.color = 'var(--ios-green)';
                            btn.disabled = true;

                            // Highlight row briefly
                            row.style.transition = 'background-color 1.5s ease';
                            row.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
                            setTimeout(() => row.style.backgroundColor = '', 1500);
                        }

                        // Update enroll all button if needed
                        updateEnrollAllButton();
                    } else {
                        handleEnrollmentError(btn, originalHTML);
                    }
                } catch (error) {
                    console.error('Error enrolling card:', error);
                    handleEnrollmentError(btn, originalHTML);
                }
            }

            // Update enroll all button based on remaining eligible cards
            function updateEnrollAllButton() {
                const enrollAllBtn = tabContents.cards.querySelector('button');
                if (!enrollAllBtn) return;

                if (offer.eligibleCards.length === 0) {
                    enrollAllBtn.innerHTML = 'All Cards Enrolled';
                    enrollAllBtn.style.background = 'var(--ios-green)';
                    enrollAllBtn.disabled = true;
                } else {
                    enrollAllBtn.innerHTML = `Enroll All Eligible Cards (${offer.eligibleCards.length})`;
                }
            }

            // Handle enrollment error
            function handleEnrollmentError(btn, originalHTML) {
                btn.innerHTML = '×';
                btn.style.backgroundColor = 'var(--ios-red)';
                btn.style.color = 'white';

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.style.backgroundColor = 'rgba(0, 122, 255, 0.1)';
                    btn.style.color = 'var(--ios-blue)';
                    btn.disabled = false;
                }, 2000);
            }
        }

        // Details tab content
        function populateDetailsTab(container, offer) {
            if (!offer.long_description && !offer.terms) {
                container.appendChild(ui_createBtn_v2({
                    label: 'Load Detailed Information',
                    type: 'primary',
                    customStyle: 'margin:40px auto; display:block;',
                    onClick: async e => loadDetailedInfo(e, offer)
                }));
            } else if (offer.long_description) {
                container.appendChild(ui_createElement('h3', {
                    text: 'Offer Details',
                    styleString: UI_STYLES.text.subtitle
                }));

                container.appendChild(ui_createElement('div', {
                    text: offer.long_description,
                    styleString: 'font-size:15px; line-height:1.6; color:#333; padding:16px; background-color:rgba(0,0,0,0.02); border-radius:12px;'
                }));
            } else {
                container.appendChild(ui_createElement('div', {
                    text: 'No detailed description available for this offer.',
                    styleString: 'text-align:center; padding:30px; color:#888; background-color:rgba(0,0,0,0.02); border-radius:12px;'
                }));
            }

            // Load detailed information
            async function loadDetailedInfo(e, offer) {
                const btn = e.currentTarget;
                btn.textContent = 'Loading...';
                btn.disabled = true;

                try {
                    const account = glb_account.find(acc =>
                        acc.account_status?.trim().toLowerCase() === "active" &&
                        (offer.eligibleCards?.includes(acc.account_token) || offer.enrolledCards?.includes(acc.account_token))
                    );

                    if (account) {
                        const details = await api_fetchOfferDetails(account.account_token, offer.offerId);

                        if (details && (details.terms || details.long_description)) {
                            // Update offer data
                            offer.terms = details.terms;
                            offer.long_description = details.long_description;
                            storage_manageData("set", storage_accToken, ["offer"]);

                            // Update UI
                            populateDetailsTab(container, offer);
                            populateTermsTab(tabContents.terms, offer);
                        } else {
                            throw new Error("No detailed information available");
                        }
                    } else {
                        throw new Error("No active card found for this offer");
                    }
                } catch (error) {
                    btn.textContent = 'Unable to Load Details';
                    setTimeout(() => {
                        btn.textContent = 'Try Again';
                        btn.disabled = false;
                    }, 2000);
                }
            }
        }

        // Terms tab content
        function populateTermsTab(container, offer) {
            if (!offer.terms) {
                container.appendChild(ui_createElement('div', {
                    text: 'No terms and conditions available for this offer.',
                    styleString: 'text-align:center; padding:40px 20px; color:#666; background-color:rgba(0,0,0,0.02); border-radius:12px;'
                }));
            } else {
                container.appendChild(ui_createElement('div', {
                    props: { innerHTML: offer.terms },
                    styleString: 'font-size:14px; line-height:1.6; color:#333; padding:16px; background-color:rgba(0,0,0,0.02); border-radius:12px;'
                }));
            }
        }
    }


    //----------------------------  Benefits Page  ----------------------------//

    // Improved benefits page rendering with better state management and UI rendering
    async function benefits_renderPage() {
        // Ensure we have benefit data
        if (!glb_benefit || glb_benefit.length === 0) {
            await api_fetchAllBenefits();
        }

        const containerDiv = ui_createElement('div', {
            styleString: `${UI_STYLES.pageContainer} max-width:1000px; margin:0 auto;`
        });

        // Process all data once before rendering
        const { groupedBenefits, sortedBenefitGroups, statusCounts } = benefits_processAndGroup(glb_benefit);

        // Add benefits overview
        containerDiv.appendChild(benefits_renderStatsSummary(statusCounts));

        // Create status legend
        const statusLegendConfig = {
            'ACHIEVED': { label: 'Completed', color: UI_STYLES.status.achieved.color },
            'IN_PROGRESS': { label: 'In Progress', color: UI_STYLES.status.inProgress.color },
            'NOT_STARTED': { label: 'Not Started', color: UI_STYLES.status.notStarted.color }
        };
        containerDiv.appendChild(benefits_createStatusKey(statusLegendConfig));

        // Handle empty state
        if (sortedBenefitGroups.length === 0) {
            containerDiv.appendChild(createEmptyState());
        } else {
            // Add filter controls
            containerDiv.appendChild(benefits_createFilters());

            // Create benefit accordions
            const accordionContainer = ui_createElement('div', {
                className: 'accordion-container',
                styleString: 'display:flex; flex-direction:column; gap:16px;'
            });

            // Add each benefit group as an accordion item
            sortedBenefitGroups.forEach(groupObj => {
                accordionContainer.appendChild(benefits_createExpandableItem(groupObj, statusLegendConfig));
            });

            containerDiv.appendChild(accordionContainer);
        }

        return containerDiv;

        // Create empty state for no benefits
        function createEmptyState() {
            return ui_createElement('div', {
                styleString: 'text-align:center; padding:40px 20px; background-color:rgba(0,0,0,0.02); border-radius:12px; margin-top:20px;',
                children: [
                    ui_createElement('div', {
                        props: {
                            innerHTML: `
                            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#8e8e93" stroke-width="1.5">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        `},
                        styleString: 'margin-bottom:20px;'
                    }),
                    ui_createElement('h3', {
                        text: 'No Benefits Found',
                        styleString: 'font-size:18px; font-weight:600; margin-bottom:12px; color:#333;'
                    }),
                    ui_createElement('p', {
                        text: 'No benefits are currently available for your cards.',
                        styleString: 'color:#666; margin-bottom:24px;'
                    }),
                    ui_createBtn_v2({
                        label: 'Refresh Benefits',
                        type: 'primary',
                        onClick: async () => {
                            await api_fetchAllBenefits();
                            SmartRenderer.renderCurrentView();
                        }
                    })
                ]
            });
        }
    }

    // Enhanced benefits overview with statistics
    function benefits_renderStatsSummary(statusCounts) {
        const statsContainer = ui_createElement('div', {
            styleString: 'display:flex; flex-wrap:wrap; gap:16px; margin-bottom:24px; justify-content:center;'
        });

        // Define stats data
        const stats = [
            {
                label: 'Total Benefits',
                value: statusCounts.total || 0,
                color: 'var(--ios-blue)',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 12h2v5H7v-5zm4-7h2v12h-2V5zm4 4h2v8h-2v-8z"/></svg>'
            },
            {
                label: 'Completed',
                value: statusCounts.achieved || 0,
                color: UI_STYLES.status.achieved.color,
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>'
            },
            {
                label: 'In Progress',
                value: statusCounts.inProgress || 0,
                color: UI_STYLES.status.inProgress.color,
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/></svg>'
            },
            {
                label: 'Not Started',
                value: statusCounts.notStarted || 0,
                color: UI_STYLES.status.notStarted.color,
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M11 7h2v6h-2zm0 8h2v2h-2z"/></svg>'
            }
        ];

        // Create stat cards
        stats.forEach(stat => {
            statsContainer.appendChild(ui_createElement('div', {
                styleString: `${UI_STYLES.cards.stats} border-top:3px solid ${stat.color};`,
                events: {
                    mouseenter: e => e.target.style.transform = 'translateY(-4px)',
                    mouseleave: e => e.target.style.transform = 'translateY(0)'
                },
                children: [
                    ui_createElement('div', {
                        props: { innerHTML: stat.icon },
                        styleString: `margin-bottom:10px; color:${stat.color};`
                    }),
                    ui_createElement('div', {
                        text: stat.value,
                        styleString: `font-size:32px; font-weight:700; color:${stat.color}; margin-bottom:8px;`
                    }),
                    ui_createElement('div', {
                        text: stat.label,
                        styleString: 'font-size:14px; color:#666; text-align:center;'
                    })
                ]
            }));
        });

        return statsContainer;
    }

    function benefits_createStatusKey(statusConfig) {
        return ui_createElement('div', {
            styleString: 'display:flex; gap:15px; margin-bottom:25px; justify-content:center; flex-wrap:wrap; background-color:rgba(255,255,255,0.6); border-radius:12px; padding:12px; box-shadow:0 2px 4px rgba(0,0,0,0.05);',
            children: Object.entries(statusConfig).map(([status, { label, color }]) =>
                ui_createElement('div', {
                    styleString: 'display:flex; align-items:center; gap:8px; padding:8px 12px; border-radius:8px; transition:background-color 0.2s ease;',
                    events: {
                        mouseenter: e => e.target.style.backgroundColor = 'rgba(0,0,0,0.05)',
                        mouseleave: e => e.target.style.backgroundColor = 'transparent'
                    },
                    children: [
                        ui_createElement('div', {
                            styleString: `width:12px; height:12px; border-radius:50%; background-color:${color}; box-shadow:0 1px 3px rgba(0,0,0,0.1);`
                        }),
                        ui_createElement('span', {
                            text: label,
                            styleString: 'color:#333; font-size:14px; font-weight:500;'
                        })
                    ]
                })
            )
        });
    }

    function benefits_createFilters() {
        return ui_createElement('div', {
            styleString: `
                display:flex; flex-wrap:wrap; gap:12px; margin-bottom:20px;
                padding:16px; background-color:rgba(255,255,255,0.6);
                border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05);
                align-items:center;
            `,
            children: [
                // Search input
                createSearchInput(),
                // Status filter
                createStatusFilter(),
                // Card filter
                createCardFilter(),
                // Reset button
                createResetButton()
            ]
        });

        function createSearchInput() {
            const searchWrapper = ui_createElement('div', {
                styleString: 'position:relative; flex:1; min-width:200px;'
            });

            const searchInput = ui_createElement('input', {
                props: {
                    type: 'text',
                    placeholder: 'Search benefits...'
                },
                styleString: `
                    width:100%; padding:10px 12px; padding-left:36px;
                    border-radius:8px; border:1px solid #ddd;
                    font-size:14px; outline:none; transition:all 0.2s ease;
                `,
                events: {
                    focus: e => {
                        e.target.style.boxShadow = '0 0 0 2px rgba(0, 122, 255, 0.2)';
                        e.target.style.borderColor = 'var(--ios-blue)';
                    },
                    blur: e => {
                        e.target.style.boxShadow = 'none';
                        e.target.style.borderColor = '#ddd';
                    },
                    input: util_debounce(() => applyFilters(), 300)
                }
            });

            searchWrapper.appendChild(searchInput);
            searchWrapper.appendChild(ui_createElement('div', {
                props: {
                    innerHTML: `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    `
                },
                styleString: 'position:absolute; top:50%; left:12px; transform:translateY(-50%);'
            }));

            return searchWrapper;
        }

        function createStatusFilter() {
            return ui_createElement('select', {
                styleString: `
                    padding:10px 12px; border-radius:8px; border:1px solid #ddd;
                    font-size:14px; outline:none; background-color:white; cursor:pointer;
                `,
                children: [
                    { value: 'all', label: 'All Statuses' },
                    { value: 'ACHIEVED', label: 'Completed' },
                    { value: 'IN_PROGRESS', label: 'In Progress' },
                    { value: 'NOT_STARTED', label: 'Not Started' }
                ].map(option =>
                    ui_createElement('option', {
                        props: { value: option.value },
                        text: option.label
                    })
                ),
                events: {
                    change: () => applyFilters()
                }
            });
        }

        function createCardFilter() {
            // Get unique card endings
            const cardNumbers = [...new Set(glb_benefit.map(benefit => benefit.cardEnding))];

            return ui_createElement('select', {
                styleString: `
                    padding:10px 12px; border-radius:8px; border:1px solid #ddd;
                    font-size:14px; outline:none; background-color:white; cursor:pointer;
                `,
                children: [
                    { value: 'all', label: 'All Cards' },
                    ...cardNumbers.map(card => ({ value: card, label: `Card ending ${card}` }))
                ].map(option =>
                    ui_createElement('option', {
                        props: { value: option.value },
                        text: option.label
                    })
                ),
                events: {
                    change: () => applyFilters()
                }
            });
        }

        function createResetButton() {
            return ui_createElement('button', {
                text: 'Reset Filters',
                styleString: `
                    padding:10px 16px; border-radius:8px; border:none;
                    background-color:rgba(142, 142, 147, 0.1); color:var(--ios-text-secondary);
                    font-size:14px; cursor:pointer; transition:all 0.2s ease;
                `,
                events: {
                    mouseenter: e => e.target.style.backgroundColor = 'rgba(142, 142, 147, 0.2)',
                    mouseleave: e => e.target.style.backgroundColor = 'rgba(142, 142, 147, 0.1)',
                    click: () => {
                        // Reset all input elements
                        const searchInput = document.querySelector('.accordion-container ~ div input');
                        const statusFilter = document.querySelector('.accordion-container ~ div select:nth-of-type(1)');
                        const cardFilter = document.querySelector('.accordion-container ~ div select:nth-of-type(2)');

                        if (searchInput) searchInput.value = '';
                        if (statusFilter) statusFilter.value = 'all';
                        if (cardFilter) cardFilter.value = 'all';

                        applyFilters();
                    }
                }
            });
        }

        function applyFilters() {
            const searchInput = document.querySelector('.accordion-container ~ div input');
            const statusFilter = document.querySelector('.accordion-container ~ div select:nth-of-type(1)');
            const cardFilter = document.querySelector('.accordion-container ~ div select:nth-of-type(2)');

            const searchTerm = searchInput?.value.toLowerCase() || '';
            const selectedStatus = statusFilter?.value || 'all';
            const selectedCard = cardFilter?.value || 'all';

            // Apply filters to all accordion items
            document.querySelectorAll('.accordion-item').forEach(item => {
                const titleText = item.querySelector('.accordion-title')?.textContent.toLowerCase() || '';

                // Status filter
                const hasStatus = selectedStatus === 'all' ||
                    item.querySelector(`.mini-card[data-status="${selectedStatus}"]`);

                // Card filter
                const hasCard = selectedCard === 'all' ||
                    Array.from(item.querySelectorAll('.card-ending'))
                        .some(el => el.textContent === selectedCard);

                // Text search filter
                const matchesSearch = searchTerm === '' || titleText.includes(searchTerm);

                // Show/hide based on all filters
                item.style.display = (matchesSearch && hasStatus && hasCard) ? 'block' : 'none';
            });
        }
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
                box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);  `
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
                transition: width ${animate ? '1s cubic-bezier(0.22, 1, 0.36, 1)' : '0s'};  `
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

    // Create enhanced accordion item
    function benefits_createExpandableItem(groupObj, statusConfig) {
        const accordionItem = ui_createElement('div', {
            className: 'accordion-item',
            styleString: UI_STYLES.accordion.item,
            events: {
                mouseenter: e => {
                    e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
                    e.target.style.transform = 'translateY(-3px)';
                },
                mouseleave: e => {
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                    e.target.style.transform = 'translateY(0)';
                }
            },
            props: { 'data-category': groupObj.category || 'Other' }
        });

        // Add data attributes for filtering
        groupObj.trackers.forEach(tracker => {
            accordionItem.setAttribute(`data-has-${tracker.status.toLowerCase()}`, 'true');
        });

        // Create header
        const headerDiv = ui_createElement('div', {
            className: 'accordion-header',
            styleString: UI_STYLES.accordion.header
        });

        // Create body with content
        const bodyDiv = ui_createElement('div', {
            className: 'accordion-body',
            styleString: UI_STYLES.accordion.body
        });

        // Add header content
        headerDiv.appendChild(createHeaderContent(groupObj, statusConfig));

        // Add arrow indicator
        const arrowIcon = createArrowIcon();
        headerDiv.appendChild(arrowIcon);

        // Add body content with tracker cards
        bodyDiv.appendChild(createBodyContent(groupObj));

        // Store references for toggle functionality
        headerDiv.bodyRef = bodyDiv;
        headerDiv.arrowRef = arrowIcon;
        headerDiv.parentItem = accordionItem;

        // Add click handler
        headerDiv.addEventListener('click', () => {
            benefits_toggleItemExpansion(headerDiv);
        });

        accordionItem.appendChild(headerDiv);
        accordionItem.appendChild(bodyDiv);

        return accordionItem;

        // Create header content with title, category, indicators
        function createHeaderContent(groupObj, statusConfig) {
            return ui_createElement('div', {
                styleString: 'display:flex; flex-direction:column; gap:10px;',
                children: [
                    // Title section with category badge
                    ui_createElement('div', {
                        styleString: `${UI_STYLES.containers.flexRow} gap:12px;`,
                        children: [
                            // Category badge
                            ui_createElement('div', {
                                text: groupObj.category || 'Other',
                                styleString: 'font-size:11px; padding:4px 8px; background-color:rgba(0,0,0,0.05); color:#666; border-radius:4px; font-weight:500; align-self:flex-start;'
                            }),

                            // Title with icon
                            ui_createElement('div', {
                                styleString: `${UI_STYLES.containers.flexRow} flex:1;`,
                                children: [
                                    benefits_getCategoryIcon(groupObj.category),
                                    ui_createElement('span', {
                                        className: 'accordion-title',
                                        text: groupObj.displayName || groupObj.trackers[0].benefitName || "",
                                        styleString: 'font-size:17px; font-weight:600; color:#333;'
                                    })
                                ]
                            }),

                            // Period badge
                            groupObj.periodLabel ? ui_createElement('div', {
                                text: groupObj.periodLabel,
                                styleString: 'font-size:12px; padding:4px 10px; background-color:rgba(0,122,255,0.08); color:var(--ios-blue); border-radius:12px; font-weight:500;'
                            }) : null
                        ].filter(Boolean)
                    }),

                    // Card status indicators
                    ui_createElement('div', {
                        className: 'mini-bar',
                        styleString: 'display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;',
                        children: createStatusIndicators(groupObj, statusConfig)
                    })
                ]
            });
        }

        // Create arrow icon for accordions
        function createArrowIcon() {
            const arrowIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            arrowIcon.setAttribute('viewBox', '0 0 24 24');
            arrowIcon.setAttribute('width', '24');
            arrowIcon.setAttribute('height', '24');
            arrowIcon.style.cssText = 'transition:transform 0.3s ease; position:absolute; right:20px; top:20px;';

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', 'M7 10l5 5 5-5');
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', '#888');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            path.setAttribute('stroke-linejoin', 'round');

            arrowIcon.appendChild(path);
            return arrowIcon;
        }

        // Create status indicators for each card
        function createStatusIndicators(groupObj, statusConfig) {
            // Group trackers by card for cleaner display
            const cardTrackers = {};
            groupObj.trackers.forEach(tracker => {
                cardTrackers[tracker.cardEnding] = tracker;
            });

            // Create indicators
            return Object.entries(cardTrackers).map(([cardEnding, tracker]) => {
                const statusKey = tracker.status === 'ACHIEVED' ? 'achieved' :
                    tracker.status === 'IN_PROGRESS' ? 'inProgress' : 'notStarted';
                const statusStyle = UI_STYLES.status[statusKey];

                return ui_createElement('div', {
                    className: 'mini-card',
                    styleString: `
                        display:flex; align-items:center; gap:6px; padding:6px 10px;
                        border-radius:8px; font-size:13px; color:#444;
                        background-color:${statusStyle.bgColor};
                        border:1px solid ${statusStyle.borderColor};
                        transition:all 0.2s ease;
                    `,
                    props: { 'data-status': tracker.status },
                    events: {
                        mouseenter: e => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 2px 6px rgba(0,0,0,0.08)';
                        },
                        mouseleave: e => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }
                    },
                    children: [
                        // Status dot
                        ui_createElement('div', {
                            styleString: `width:10px; height:10px; border-radius:50%; background-color:${statusStyle.color}; box-shadow:0 1px 2px rgba(0,0,0,0.1);`
                        }),
                        // Card ending
                        ui_createElement('span', {
                            className: 'card-ending',
                            text: cardEnding,
                            styleString: 'font-weight:500;'
                        }),
                        // Status label
                        ui_createElement('span', {
                            text: statusConfig[tracker.status]?.label || tracker.status,
                            styleString: 'font-size:11px; opacity:0.8;'
                        })
                    ]
                });
            });
        }

        // Create body content with tracker cards
        function createBodyContent(groupObj) {
            return ui_createElement('div', {
                styleString: 'display:flex; flex-direction:column; gap:16px; padding-bottom:20px;',
                children: groupObj.trackers.map(tracker =>
                    benefits_createProgressCard(tracker, groupObj)
                )
            });
        }
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


    // Create enhanced tracker card
    function benefits_createProgressCard(trackerObj, groupObj) {
        // Find card details in accounts
        const cardAccount = glb_account.find(acc => acc.cardEnding === trackerObj.cardEnding);

        // Determine status style
        const statusKey = trackerObj.status === 'ACHIEVED' ? 'achieved' :
            trackerObj.status === 'IN_PROGRESS' ? 'inProgress' : 'notStarted';
        const statusStyle = UI_STYLES.status[statusKey];

        const trackerCard = ui_createElement('div', {
            className: 'tracker-card',
            styleString: `${UI_STYLES.cards.benefit} border-left: 4px solid ${statusStyle.color};`,
            events: {
                mouseenter: e => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                },
                mouseleave: e => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }
            }
        });

        // Add card header
        trackerCard.appendChild(createCardHeader(trackerObj, cardAccount));

        // Add progress section
        trackerCard.appendChild(createProgressSection(trackerObj, statusStyle.color));

        // Add message section if available
        if (trackerObj.progress && trackerObj.progress.message) {
            trackerCard.appendChild(createMessageSection(trackerObj, statusStyle.color));
        }

        return trackerCard;

        // Helper function to create card header with logo and date range
        function createCardHeader(tracker, account) {
            const cardHeader = ui_createElement('div', {
                styleString: 'display:flex; justify-content:space-between; margin-bottom:16px; align-items:flex-start;'
            });

            // Card info with logo
            const cardInfoContainer = ui_createElement('div', {
                styleString: 'display:flex; align-items:center; gap:12px;'
            });

            // Use ui_returnLogo for caching and consistent rendering
            const logoContainer = ui_createElement('div', {
                styleString: 'width:36px; height:36px; border-radius:6px; overflow:hidden; flex-shrink:0; display:flex; align-items:center; justify-content:center;'
            });

            // Get either the logo or a placeholder through the caching mechanism
            const logoElement = ui_returnLogo(
                account?.small_card_art,
                account?.description || `Card ${tracker.cardEnding}`
            );

            // Adjust size to fit our container
            logoElement.style.height = '36px';
            logoElement.querySelector('img')?.setAttribute('style', 'max-width:36px; max-height:36px; object-fit:contain;');

            logoContainer.appendChild(logoElement);

            // Card details text
            const cardDetails = ui_createElement('div', {
                styleString: 'display:flex; flex-direction:column;'
            });

            cardDetails.appendChild(ui_createElement('div', {
                className: 'card-number',
                text: `Card •••• ${tracker.cardEnding}`,
                styleString: 'font-weight:600; color:#444; font-size:15px;'
            }));

            if (account) {
                cardDetails.appendChild(ui_createElement('div', {
                    text: account.description || '',
                    styleString: 'font-size:13px; color:#777;'
                }));
            }

            cardInfoContainer.appendChild(logoContainer);
            cardInfoContainer.appendChild(cardDetails);

            // Date range
            const dateRange = createDateRange(tracker);

            cardHeader.appendChild(cardInfoContainer);
            cardHeader.appendChild(dateRange);

            return cardHeader;
        }

        // Helper function to create date range badge
        function createDateRange(tracker) {
            const dateRange = ui_createElement('div', {
                styleString: 'color:#888; font-size:13px; background-color:rgba(0,0,0,0.03); padding:4px 10px; border-radius:8px;'
            });

            // Format date range
            const startDate = new Date(tracker.periodStartDate);
            const endDate = new Date(tracker.periodEndDate);

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

                // Add days remaining
                const now = new Date();
                if (now <= endDate) {
                    const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
                    dateRange.appendChild(ui_createElement('div', {
                        text: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} left`,
                        styleString: 'font-size:12px; text-align:center; margin-top:4px;'
                    }));
                }
            }

            dateRange.prepend(document.createTextNode(dateRangeText));
            return dateRange;
        }

        // Helper function to create progress section
        function createProgressSection(tracker, statusColor) {
            // Format values
            const currencySymbol = tracker.tracker?.targetCurrencySymbol || '$';
            const spentAmount = parseFloat(tracker.tracker?.spentAmount) || 0;
            const targetAmount = parseFloat(tracker.tracker?.targetAmount) || 0;

            // Calculate percentage
            const percent = targetAmount > 0 ? Math.min(100, (spentAmount / targetAmount) * 100) : 0;

            const progressContainer = ui_createElement('div', {
                styleString: UI_STYLES.progress.container
            });

            // Progress header with amounts and percentage
            const progressHeader = ui_createElement('div', {
                styleString: 'display:flex; justify-content:space-between; margin-bottom:10px; align-items:center;'
            });

            // Amount label
            progressHeader.appendChild(ui_createElement('div', {
                props: {
                    innerHTML: `<span style="color:#999; font-weight:normal;">Progress:</span> ${currencySymbol}${spentAmount.toFixed(2)} of ${currencySymbol}${targetAmount.toFixed(2)}`
                },
                styleString: 'font-size:14px; color:#555; font-weight:500;'
            }));

            // Percentage
            progressHeader.appendChild(ui_createElement('div', {
                text: `${percent.toFixed(0)}%`,
                styleString: `font-size:14px; font-weight:600; color:${percent >= 100 ? 'var(--ios-green)' : 'var(--ios-blue)'};`
            }));

            progressContainer.appendChild(progressHeader);

            // Progress bar
            progressContainer.appendChild(benefit_createProgressBar({
                current: spentAmount,
                max: targetAmount,
                barColor: statusColor,
                height: '12px',
                animate: true
            }));

            return progressContainer;
        }

        // Helper function to create message section
        function createMessageSection(tracker, statusColor) {
            return ui_createElement('div', {
                props: {
                    innerHTML: tracker.progress.message
                        .replace(/\*\*/g, '')  // Remove ** formatting
                        .replace(/\n\n/g, '<br><br>')  // Keep paragraph breaks
                        .replace(/\n/g, ' ')  // Replace single newlines with spaces
                },
                styleString: `
                    margin-top:16px;
                    padding:12px 16px;
                    background-color:rgba(0,0,0,0.02);
                    border-radius:12px;
                    color:#333;
                    font-size:14px;
                    line-height:1.5;
                    border-left:3px solid ${statusColor}40;
                `
            });
        }
    }

    // Enhanced accordion toggle with smoother animations
    function benefits_toggleItemExpansion(header) {
        const bodyDiv = header.bodyRef;
        const arrowIcon = header.arrowRef;
        const parentItem = header.parentItem;

        // Determine current state
        const isOpen = bodyDiv.classList.contains('active');

        // First close all other open accordions for cleaner UX
        document.querySelectorAll('.accordion-header.active').forEach(activeHeader => {
            if (activeHeader !== header && activeHeader.bodyRef) {
                // Reset previous active item
                const prevBody = activeHeader.bodyRef;
                const prevArrow = activeHeader.arrowRef;
                const prevParent = activeHeader.parentItem;

                // Update classes
                activeHeader.classList.remove('active');
                prevBody.classList.remove('active');

                // Reset styles
                activeHeader.style.backgroundColor = '#f9f9f9';
                activeHeader.style.borderBottomColor = 'transparent';
                prevArrow.style.transform = 'rotate(0deg)';
                prevBody.style.maxHeight = '0';
                prevBody.style.padding = '0 20px';
                prevBody.style.opacity = '0';

                // Reset parent styling
                if (prevParent) {
                    prevParent.style.borderColor = '#e0e0e0';
                    prevParent.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }
            }
        });

        // Toggle current accordion with improved animation
        if (!isOpen) {
            // Open this accordion
            header.classList.add('active');
            bodyDiv.classList.add('active');

            // Animate transitions
            arrowIcon.style.transform = 'rotate(180deg)';
            header.style.backgroundColor = '#f0f0f0';
            header.style.borderBottomColor = '#e0e0e0';

            // Set max height to content height for animation
            bodyDiv.style.maxHeight = `${bodyDiv.scrollHeight}px`;
            bodyDiv.style.padding = '0 20px 20px 20px';
            bodyDiv.style.opacity = '1';

            // Apply active styling to parent
            if (parentItem) {
                parentItem.style.borderColor = 'var(--ios-blue)';
                parentItem.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
            }

            // Scroll item into view if needed
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

            // Animate transitions
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




    const SmartRenderer = (() => {
        const state = {
            currentView: null,
            lastScrollPositions: {},
            pendingRender: false
        };

        const viewCache = {
            offers: { element: null, timestamp: 0 },
            members: { element: null, timestamp: 0 },
            benefits: { element: null, timestamp: 0 }
        };

        // Track which data has been modified since last render
        const dataModified = {
            offers: false,
            members: false,
            benefits: false
        };

        function createLoader() {
            return ui_createElement('div', {
                styleString: 'display:flex; justify-content:center; align-items:center; height:200px;',
                children: [
                    ui_createElement('div', {
                        styleString: 'width:40px; height:40px; border:3px solid rgba(0,122,255,0.2); border-top:3px solid var(--ios-blue); border-radius:50%; animation:spin 1s linear infinite;'
                    })
                ]
            });
        }

        return {
            markChanged(component) {
                if (dataModified.hasOwnProperty(component)) {
                    dataModified[component] = true;
                    viewCache[component].element = null;
                }
            },

            renderCurrentView(forceRender = false) {
                if (!content || state.pendingRender) return;

                state.pendingRender = true;

                // Save current scroll position
                if (state.currentView && content.scrollTop) {
                    state.lastScrollPositions[state.currentView] = content.scrollTop;
                }

                const isNewView = state.currentView !== glb_view_page;
                const needsUpdate = forceRender || isNewView ||
                    dataModified[glb_view_page] ||
                    !viewCache[glb_view_page].element;

                // Show loader if this will be a full render
                if (needsUpdate) {
                    content.innerHTML = '';
                    content.appendChild(createLoader());
                }

                // Update tracking
                state.currentView = glb_view_page;

                // Defer rendering to next tick for better UI responsiveness
                setTimeout(async () => {
                    try {
                        if (needsUpdate) {
                            let viewContent;

                            switch (glb_view_page) {
                                case 'members':
                                    viewContent = members_renderPage();
                                    dataModified.members = false;
                                    break;
                                case 'offers':
                                    viewContent = offers_renderPage();
                                    dataModified.offers = false;
                                    break;
                                case 'benefits':
                                    viewContent = await benefits_renderPage();
                                    dataModified.benefits = false;
                                    break;
                                default:
                                    viewContent = members_renderPage();
                                    dataModified.members = false;
                            }

                            // Handle async content
                            if (viewContent instanceof Promise) {
                                viewContent = await viewContent;
                            }

                            // Update cache
                            viewCache[glb_view_page] = {
                                element: viewContent,
                                timestamp: Date.now()
                            };

                            // Update DOM
                            content.innerHTML = '';
                            content.appendChild(viewContent);
                        } else {
                            // Use cached view
                            content.innerHTML = '';
                            content.appendChild(viewCache[glb_view_page].element);
                        }

                        // Restore scroll position
                        const savedScrollTop = state.lastScrollPositions[glb_view_page];
                        if (savedScrollTop) {
                            content.scrollTop = savedScrollTop;
                        }
                    } catch (error) {
                        console.error('Render error:', error);
                        content.innerHTML = `<div style="color:var(--ios-red);padding:20px;text-align:center">
                            Error rendering view: ${error.message}</div>`;
                    } finally {
                        state.pendingRender = false;
                    }
                }, 0);
            }
        };
    })();




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
            "storageOpVersion",
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
            storageOpVersion: storageOpVersion,
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
                    if (!loaded["storageOpVersion"] || loaded["storageOpVersion"] !== JSON.stringify(storageOpVersion)) {
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

                    console.log(`Load cookie: ${storage_accToken}, key: ${defaultKeys.join(", ")}`);
                    SmartRenderer.renderCurrentView();

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
                console.log(`Set cookie: ${storage_accToken}, key: ${keys.join(", ")}`);
                return 1;

            }

            case "clear": {
                try {
                    keys.forEach(key => {
                        localStorage.removeItem(`AMaxOffer_${key}_${storage_accToken}`);
                    });
                    console.log(`Cleared cookie: ${storage_accToken}, keys: ${keys.join(", ")}`);
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
        const expirationDate = new Date("2025-03-15T00:00:00Z");

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

        // Add optimized animations first
        addOptimizedAnimations();

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
            storage_manageData("set", storage_accToken, ["lastUpdate", "storageOpVersion"]);
            SmartRenderer.renderCurrentView(true);
        } else {
            console.log("Using data from LocalStorage.");
            await api_fetchAllBalances();
            SmartRenderer.renderCurrentView();
        }

        btnMembers.classList.add('active');
    }

    init();
})();