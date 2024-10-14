let colorPickerEnabled = false;

function extractColorPalette() {
    const colors = new Set();
    const elements = document.getElementsByTagName('*');
    for (let element of elements) {
        const color = window.getComputedStyle(element).color;
        const backgroundColor = window.getComputedStyle(element).backgroundColor;
        if (color !== 'rgb(0, 0, 0)') colors.add(color);
        if (backgroundColor !== 'rgba(0, 0, 0, 0)') colors.add(backgroundColor);
    }
    return Array.from(colors).map(color => 
        `<div class="flex items-center mb-2">
            <div class="w-6 h-6 mr-2" style="background-color: ${color};"></div>
            <span>${color}</span>
        </div>`
    ).join('');
}

function analyzeTypography() {
    const fontInfo = new Map();
    const elements = document.getElementsByTagName('*');
    
    for (let element of elements) {
        if (element.childNodes.length === 1 && element.childNodes[0].nodeType === Node.TEXT_NODE) {
            const style = window.getComputedStyle(element);
            const key = `${style.fontFamily}|${style.fontSize}|${style.fontWeight}|${style.lineHeight}`;
            
            if (!fontInfo.has(key)) {
                fontInfo.set(key, {
                    fontFamily: style.fontFamily,
                    fontSize: style.fontSize,
                    fontWeight: style.fontWeight,
                    lineHeight: style.lineHeight,
                    example: element.textContent.trim().substring(0, 50)
                });
            }
        }
    }
    
    return `
        <div class="space-y-6">
            <h3 class="text-xl font-bold mb-4">Typography Analysis</h3>
            ${Array.from(fontInfo.values()).map(info => `
                <div class="bg-gray-800 p-4 rounded">
                    <p class="mb-2" style="font-family: ${info.fontFamily}; font-size: ${info.fontSize}; font-weight: ${info.fontWeight}; line-height: ${info.lineHeight};">
                        ${info.example}
                    </p>
                    <ul class="list-disc pl-5 space-y-1">
                        <li>Font Family: ${info.fontFamily}</li>
                        <li>Font Size: ${info.fontSize} (${getFontSizeCategory(info.fontSize)})</li>
                        <li>Font Weight: ${info.fontWeight} (${getFontWeightCategory(info.fontWeight)})</li>
                        <li>Line Height: ${info.lineHeight} (${getLineHeightCategory(info.lineHeight)})</li>
                    </ul>
                    <p class="mt-2 text-sm text-gray-400">
                        ${getTypographyRecommendation(info)}
                    </p>
                </div>
            `).join('')}
        </div>
    `;
}

function getFontSizeCategory(fontSize) {
    const size = parseFloat(fontSize);
    if (size < 12) return "Very Small";
    if (size < 16) return "Small";
    if (size < 24) return "Medium";
    if (size < 32) return "Large";
    return "Very Large";
}

function getFontWeightCategory(fontWeight) {
    const weight = parseInt(fontWeight);
    if (weight < 400) return "Light";
    if (weight < 600) return "Regular";
    if (weight < 700) return "Semi-Bold";
    return "Bold";
}

function getLineHeightCategory(lineHeight) {
    const height = parseFloat(lineHeight);
    if (height < 1.2) return "Tight";
    if (height < 1.5) return "Normal";
    if (height < 1.8) return "Relaxed";
    return "Loose";
}

function getTypographyRecommendation(info) {
    let recommendations = [];
    if (parseFloat(info.fontSize) < 16) {
        recommendations.push("Consider increasing the font size for better readability on smaller screens.");
    }
    if (parseFloat(info.lineHeight) < 1.5) {
        recommendations.push("Increasing line height might improve readability for longer text blocks.");
    }
    return recommendations.length > 0 ? recommendations.join(" ") : "No specific recommendations. The typography appears to follow good practices.";
}


function checkAccessibility() {
    const issues = [];
    
    // Check for alt text on images
    const images = document.getElementsByTagName('img');
    for (let img of images) {
        if (!img.alt) issues.push(`Image missing alt text: ${img.src}`);
    }
    
    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastHeadingLevel = 0;
    headings.forEach(heading => {
        const currentLevel = parseInt(heading.tagName[1]);
        if (currentLevel - lastHeadingLevel > 1) {
            issues.push(`Improper heading structure: ${heading.tagName} follows ${lastHeadingLevel ? `H${lastHeadingLevel}` : 'no heading'}`);
        }
        lastHeadingLevel = currentLevel;
    });
    
    // Check for color contrast (simplified)
    const elements = document.getElementsByTagName('*');
    for (let element of elements) {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        if (color === backgroundColor) {
            issues.push(`Potential low contrast: ${element.tagName} with color ${color} on background ${backgroundColor}`);
        }
    }
    
    // Check for form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (!input.id || !document.querySelector(`label[for="${input.id}"]`)) {
            issues.push(`Form control missing associated label: ${input.tagName}${input.id ? ` with id "${input.id}"` : ''}`);
        }
    });
    
    // Check for ARIA attributes
    const ariaElements = document.querySelectorAll('[role], [aria-*]');
    ariaElements.forEach(el => {
        const role = el.getAttribute('role');
        if (role && !['button', 'link', 'checkbox', 'radio', 'tab', 'tabpanel', 'menu', 'menuitem', 'dialog', 'alert', 'alertdialog', 'banner', 'navigation', 'main', 'complementary', 'form', 'search', 'article', 'document'].includes(role)) {
            issues.push(`Potentially incorrect ARIA role: "${role}" on ${el.tagName}`);
        }
    });
    
    return issues.length > 0 ? 
        `<h3 class="text-lg font-bold mb-2">Accessibility Issues:</h3>
        <ul class="list-disc pl-5">
            ${issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>` : 
        '<p class="text-green-500">No major accessibility issues found</p>';
}

function analyzePerformance() {
    const resources = performance.getEntriesByType('resource');
    const totalSize = resources.reduce((total, resource) => total + resource.transferSize, 0);
    const loadTime = performance.now();
    
    // Analyze resource types
    const resourceTypes = resources.reduce((acc, resource) => {
        const type = resource.initiatorType;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});
    
    // Check for render-blocking resources
    const renderBlockingResources = resources.filter(resource => 
        (resource.initiatorType === 'script' || resource.initiatorType === 'link') &&
        resource.renderBlockingStatus === 'blocking'
    );
    
    // We'll use PerformanceObserver for LCP in a separate function
    
    return `
        <div class="space-y-4">
            <div>
                <h3 class="text-lg font-bold mb-2">General Performance:</h3>
                <p><strong>Total resources:</strong> ${resources.length}</p>
                <p><strong>Total size:</strong> ${(totalSize / 1024 / 1024).toFixed(2)} MB</p>
                <p><strong>Load time:</strong> ${loadTime.toFixed(2)} ms</p>
            </div>
            <div>
                <h3 class="text-lg font-bold mb-2">Resource Types:</h3>
                <ul class="list-disc pl-5">
                    ${Object.entries(resourceTypes).map(([type, count]) => 
                        `<li>${type}: ${count}</li>`
                    ).join('')}
                </ul>
            </div>
            <div>
                <h3 class="text-lg font-bold mb-2">Render-blocking Resources:</h3>
                <p>${renderBlockingResources.length} render-blocking resources found.</p>
            </div>
            <div>
                <h3 class="text-lg font-bold mb-2">Largest Resources:</h3>
                <ul class="list-disc pl-5">
                    ${resources.sort((a, b) => b.transferSize - a.transferSize).slice(0, 5).map(resource => 
                        `<li>${resource.name.split('/').pop()} - ${(resource.transferSize / 1024).toFixed(2)} KB</li>`
                    ).join('')}
                </ul>
            </div>
        </div>
    `;
}

function checkAccessibility() {
    const issues = [];
    
    // Check for alt text on images
    const images = document.getElementsByTagName('img');
    for (let img of images) {
        if (!img.alt) issues.push(`Image missing alt text: ${img.src}`);
    }
    
    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastHeadingLevel = 0;
    headings.forEach(heading => {
        const currentLevel = parseInt(heading.tagName[1]);
        if (currentLevel - lastHeadingLevel > 1) {
            issues.push(`Improper heading structure: ${heading.tagName} follows ${lastHeadingLevel ? `H${lastHeadingLevel}` : 'no heading'}`);
        }
        lastHeadingLevel = currentLevel;
    });
    
    // Check for color contrast (simplified)
    const elements = document.getElementsByTagName('*');
    for (let element of elements) {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const backgroundColor = style.backgroundColor;
        if (color === backgroundColor) {
            issues.push(`Potential low contrast: ${element.tagName} with color ${color} on background ${backgroundColor}`);
        }
    }
    
    // Check for form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        if (!input.id || !document.querySelector(`label[for="${input.id}"]`)) {
            issues.push(`Form control missing associated label: ${input.tagName}${input.id ? ` with id "${input.id}"` : ''}`);
        }
    });
    
    // Check for ARIA attributes (modified selector)
    const ariaElements = document.querySelectorAll('[role], [aria-label], [aria-labelledby], [aria-hidden]');
    ariaElements.forEach(el => {
        const role = el.getAttribute('role');
        if (role && !['button', 'link', 'checkbox', 'radio', 'tab', 'tabpanel', 'menu', 'menuitem', 'dialog', 'alert', 'alertdialog', 'banner', 'navigation', 'main', 'complementary', 'form', 'search', 'article', 'document'].includes(role)) {
            issues.push(`Potentially incorrect ARIA role: "${role}" on ${el.tagName}`);
        }
    });
    
    return issues.length > 0 ? 
        `<h3 class="text-lg font-bold mb-2">Accessibility Issues:</h3>
        <ul class="list-disc pl-5">
            ${issues.map(issue => `<li>${issue}</li>`).join('')}
        </ul>` : 
        '<p class="text-green-500">No major accessibility issues found</p>';
}


//grid
function analyzeGridLayout() {
    const gridElements = Array.from(document.querySelectorAll('*')).filter(el => 
        getComputedStyle(el).display === 'grid' || getComputedStyle(el).display === 'inline-grid'
    );
    const flexElements = Array.from(document.querySelectorAll('*')).filter(el => 
        getComputedStyle(el).display === 'flex' || getComputedStyle(el).display === 'inline-flex'
    );

    let gridAnalysis = '';
    let flexAnalysis = '';

    gridElements.forEach((element, index) => {
        const style = getComputedStyle(element);
        gridAnalysis += `
            <div class="mb-4 bg-gray-600 p-4 rounded">
                <h3 class="font-semibold">Grid Element ${index + 1}</h3>
                <p>Display: ${style.display}</p>
                <p>Grid Template Columns: ${style.gridTemplateColumns}</p>
                <p>Grid Template Rows: ${style.gridTemplateRows}</p>
                <p>Grid Gap: ${style.gap}</p>
            </div>
        `;
    });

    flexElements.forEach((element, index) => {
        const style = getComputedStyle(element);
        flexAnalysis += `
            <div class="mb-4 bg-gray-600 p-4 rounded">
                <h3 class="font-semibold">Flex Element ${index + 1}</h3>
                <p>Display: ${style.display}</p>
                <p>Flex Direction: ${style.flexDirection}</p>
                <p>Justify Content: ${style.justifyContent}</p>
                <p>Align Items: ${style.alignItems}</p>
            </div>
        `;
    });

    return `
        <div class="space-y-6">
            <h2 class="text-xl font-bold">Grid & Layout Analysis</h2>
            <div>
                <h3 class="text-lg font-semibold">Grid Layouts</h3>
                ${gridAnalysis || '<p>No grid layouts found on this page.</p>'}
            </div>
            <div>
                <h3 class="text-lg font-semibold">Flex Layouts</h3>
                ${flexAnalysis || '<p>No flex layouts found on this page.</p>'}
            </div>
        </div>
    `;
}
//design system
function documentDesignSystem() {
    const designSystem = {
        colors: extractColorPalette(),
        typography: analyzeTypography(),
        spacing: analyzeSpacing(),
        components: analyzeComponents()
    };

    return `
        <div class="space-y-6">
            <h2 class="text-xl font-bold">Design System Documentation</h2>
            <div>
                <h3 class="text-lg font-semibold">Color Palette</h3>
                ${designSystem.colors}
            </div>
            <div>
                ${designSystem.typography}
            </div>
            <div>
                <h3 class="text-lg font-semibold">Spacing</h3>
                ${designSystem.spacing}
            </div>
            <div>
                <h3 class="text-lg font-semibold">Common Components</h3>
                ${designSystem.components}
            </div>
        </div>
    `;
}

function analyzeComponents() {
    const components = [
        {selector: 'button', name: 'Buttons'},
        {selector: 'input[type="text"]', name: 'Text Inputs'},
        {selector: 'select', name: 'Dropdowns'},
        {selector: 'a', name: 'Links'}
    ];

    return components.map(comp => {
        const elements = document.querySelectorAll(comp.selector);
        if (elements.length === 0) return '';
        const firstElement = elements[0];
        const style = window.getComputedStyle(firstElement);
        return `
            <div class="mb-4 bg-gray-100 p-4 rounded">
                <h4 class="font-semibold">${comp.name}</h4>
                <div class="mb-2">${firstElement.outerHTML}</div>
                <p>Font: ${style.fontFamily}</p>
                <p>Size: ${style.fontSize}</p>
                <p>Color: ${style.color}</p>
                <p>Background: ${style.backgroundColor}</p>
            </div>
        `;
    }).join('');
}

function analyzeSpacing() {
    const spacingValues = new Set();
    const elements = document.getElementsByTagName('*');
    for (let element of elements) {
        const style = window.getComputedStyle(element);
        ['margin', 'padding'].forEach(prop => {
            ['Top', 'Right', 'Bottom', 'Left'].forEach(side => {
                spacingValues.add(style[prop + side]);
            });
        });
    }
    return `
        <ul class="list-disc pl-5">
            ${Array.from(spacingValues).map(value => `<li>${value}</li>`).join('')}
        </ul>
    `;
}

function analyzeComponents() {
    const components = [
        {selector: 'button', name: 'Buttons'},
        {selector: 'input[type="text"]', name: 'Text Inputs'},
        {selector: 'select', name: 'Dropdowns'},
        {selector: 'a', name: 'Links'}
    ];

    return components.map(comp => {
        const elements = document.querySelectorAll(comp.selector);
        if (elements.length === 0) return '';
        const firstElement = elements[0];
        const style = window.getComputedStyle(firstElement);
        return `
            <div class="mb-4">
                <h4 class="font-semibold">${comp.name}</h4>
                <p>Font: ${style.fontFamily}</p>
                <p>Size: ${style.fontSize}</p>
                <p>Color: ${style.color}</p>
                <p>Background: ${style.backgroundColor}</p>
            </div>
        `;
    }).join('');
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'exportDesignSystemPDF') {
        const designSystemHTML = documentDesignSystem();
        const blob = new Blob([`
            <html>
                <head>
                    <title>Design System</title>
                    <style>
                        body { font-family: Arial, sans-serif; }
                        .color-sample { display: inline-block; width: 20px; height: 20px; margin-right: 10px; }
                    </style>
                </head>
                <body>
                    ${designSystemHTML}
                </body>
            </html>
        `], {type: 'text/html'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'design_system.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});


// New advanced tools

function contrastAnalyzer() {
    const elements = document.querySelectorAll('*');
    let results = '<h3 class="text-xl font-bold mb-4">Contrast Analyzer</h3>';

    elements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        if (color !== 'rgb(0, 0, 0)' && bgColor !== 'rgba(0, 0, 0, 0)') {
            const contrast = calculateContrast(color, bgColor);
            const rating = getContrastRating(contrast);
            results += `
                <div class="mb-2 flex items-center">
                    <span style="color: ${color}; background-color: ${bgColor};" class="px-2 py-1 rounded">Sample Text</span>
                    <span class="ml-2">Contrast Ratio: ${contrast.toFixed(2)}</span>
                    <span class="ml-2 ${rating.color}">${rating.label}</span>
                </div>
            `;
        }
    });

    results += `
    <div class="mt-4">
        <h4 class="font-semibold">WCAG 2.1 Contrast Guidelines:</h4>
        <p>AAA (Enhanced): 7:1 for normal text, 4.5:1 for large text</p>
        <p>AA (Minimum): 4.5:1 for normal text, 3:1 for large text</p>
    </div>
`;

return results;
}


function calculateContrast(color1, color2) {
    const rgb1 = color1.match(/\d+/g).map(Number);
    const rgb2 = color2.match(/\d+/g).map(Number);
    const l1 = 0.2126 * rgb1[0] + 0.7152 * rgb1[1] + 0.0722 * rgb1[2];
    const l2 = 0.2126 * rgb2[0] + 0.7152 * rgb2[1] + 0.0722 * rgb2[2];
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function getContrastRating(ratio) {
    if (ratio >= 7) return { label: 'Excellent', color: 'text-green-500' };
    if (ratio >= 4.5) return { label: 'Good', color: 'text-blue-500' };
    if (ratio >= 3) return { label: 'Fair', color: 'text-yellow-500' };
    return { label: 'Poor', color: 'text-red-500' };
}

function seoAnalyzer() {
    let results = '<h3 class="text-xl font-bold mb-4">Advanced SEO Analyzer</h3>';

    // Check title
    const title = document.querySelector('title');
    const titleText = title ? title.textContent : 'Not found';
    results += `<p>Title: ${titleText} (${titleText.length} characters)</p>`;
    if (titleText.length < 50 || titleText.length > 60) {
        results += '<p class="text-yellow-500">Title length should be between 50-60 characters for optimal SEO.</p>';
    }

    // Check meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const descriptionContent = metaDescription ? metaDescription.getAttribute('content') : 'Not found';
    results += `<p>Meta Description: ${descriptionContent} (${descriptionContent.length} characters)</p>`;
    if (descriptionContent.length < 120 || descriptionContent.length > 160) {
        results += '<p class="text-yellow-500">Meta description should be between 120-160 characters for optimal SEO.</p>';
    }

    // Check headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headingCounts = {h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0};
    headings.forEach(heading => headingCounts[heading.tagName.toLowerCase()]++);
    results += '<h4 class="font-bold mt-4">Heading Structure:</h4>';
    for (let i = 1; i <= 6; i++) {
        results += `<p>H${i} tags: ${headingCounts['h'+i]}</p>`;
    }
    if (headingCounts.h1 !== 1) {
        results += '<p class="text-red-500">There should be exactly one H1 tag on the page.</p>';
    }

    // Check for images without alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    results += `<p>Images without alt text: ${imagesWithoutAlt.length}</p>`;
    if (imagesWithoutAlt.length > 0) {
        results += '<p class="text-yellow-500">All images should have descriptive alt text for better SEO and accessibility.</p>';
    }

    // Check for internal and external links
    const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="' + window.location.origin + '"]');
    const externalLinks = document.querySelectorAll('a[href^="http"]:not([href^="' + window.location.origin + '"])');
    results += `<p>Internal links: ${internalLinks.length}</p>`;
    results += `<p>External links: ${externalLinks.length}</p>`;

    // Check page load speed (Note: This is a very basic check and not entirely accurate)
    const loadTime = performance.now() / 1000;
    results += `<p>Estimated page load time: ${loadTime.toFixed(2)} seconds</p>`;
    if (loadTime > 3) {
        results += '<p class="text-yellow-500">Page load time might be too long. Consider optimizing for better performance.</p>';
    }

    return results;
}

function imageOptimizer() {
    const images = document.querySelectorAll('img');
    let results = '<h3 class="text-xl font-bold mb-4">Image Optimizer</h3>';

    images.forEach(img => {
        const size = img.naturalWidth * img.naturalHeight * 4 / 1024 / 1024; // Rough estimate of size in MB
        results += `
            <div class="mb-2">
                <img src="${img.src}" style="max-width: 100px; max-height: 100px;">
                <span class="ml-2">Estimated size: ${size.toFixed(2)} MB</span>
                ${size > 1 ? '<span class="text-red-500 ml-2">Consider optimizing</span>' : ''}
            </div>
        `;
    });

    return results;
}

function a11yAuditor() {
    let results = '<h3 class="text-xl font-bold mb-4">Accessibility Auditor</h3>';
    
    // Check for alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    results += `<p>Images without alt text: ${imagesWithoutAlt.length}</p>`;

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach(heading => {
        const currentLevel = parseInt(heading.tagName[1]);
        if (currentLevel - previousLevel > 1) {
            results += `<p>Improper heading structure: ${heading.tagName} follows H${previousLevel}</p>`;
        }
        previousLevel = currentLevel;
    });

    // More checks can be added here

    return results;
}

// New advanced tools


// Message listener
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    try {
        switch(request.action) {
            case 'colorPalette':
                sendResponse({result: extractColorPalette()});
                break;
            case 'typography':
                sendResponse({result: analyzeTypography()});
                break;
                case 'responsiveDesignChecker':
                    sendResponse({result: responsiveDesignChecker()});
                    break;
            case 'accessibility':
                sendResponse({result: checkAccessibility()});
                break;
            case 'performance':
                sendResponse({result: analyzePerformance()});
                break;
            case 'gridLayout':
                sendResponse({result: analyzeGridLayout()});
                break;
            case 'designSystem':
                sendResponse({result: documentDesignSystem()});
                break;
            case 'contrastAnalyzer':
                sendResponse({result: contrastAnalyzer()});
                break;
            case 'imageOptimizer':
                sendResponse({result: imageOptimizer()});
                break;
            case 'a11yAuditor':
                sendResponse({result: a11yAuditor()});
                break;
            case 'seoAnalyzer':
                sendResponse({result: seoAnalyzer()});
                break;
            default:
                sendResponse({error: 'Unknown action'});
        }
    } catch (error) {
        console.error('Error in content script:', error.message);
        sendResponse({error: error.message});
    }
    return true;  // Keeps the message channel open for asynchronous responses
});