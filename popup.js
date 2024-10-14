document.addEventListener('DOMContentLoaded', function() {
    const toolButtons = [
        'colorPalette',
        'typography',
        'accessibility',
        'performance',
        'gridLayout',
        'designSystem',
        'contrastAnalyzer',
        'imageOptimizer',
        'a11yAuditor',
        'seoAnalyzer'
    ];

    document.getElementById('exportDesignSystemPDF').addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'exportDesignSystemPDF'}, function(response) {
                if (chrome.runtime.lastError) {
                    console.error('Error exporting design system:', chrome.runtime.lastError.message);
                    document.getElementById('result').innerHTML = 'An error occurred while exporting the design system. Please try again.';
                }
            });
        });
    });    
    
    toolButtons.forEach(button => {
        document.getElementById(button).addEventListener('click', function() {
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: button}, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error('Error executing action:', button, chrome.runtime.lastError.message);
                        document.getElementById('result').innerHTML = 'An error occurred. Please try again.';
                    } else if (response && response.result) {
                        document.getElementById('result').innerHTML = response.result;
                        if (button === 'colorPicker') {
                            window.close();
                        }
                    } else if (response && response.error) {
                        document.getElementById('result').innerHTML = `Error: ${response.error}`;
                    } else {
                        document.getElementById('result').innerHTML = 'No response received. Please try again.';
                    }
                });
            });
        });
    });

    // Tab switching
    document.getElementById('toolsTab').addEventListener('click', function(e) {
        e.preventDefault();
        showTab('tools');
    });

    document.getElementById('resourcesTab').addEventListener('click', function(e) {
        e.preventDefault();
        showTab('resources');
    });

    document.getElementById('uiResourcesTab').addEventListener('click', function(e) {
        e.preventDefault();
        showResourceTab('ui');
    });

    document.getElementById('uxResourcesTab').addEventListener('click', function(e) {
        e.preventDefault();
        showResourceTab('ux');
    });

    // Initialize resources
    loadResources('ui');
    loadResources('ux');

    // Initially show tools tab
    showTab('tools');
    showResourceTab('ui');
});

function showTab(tabName) {
    document.getElementById('toolsContent').style.display = tabName === 'tools' ? 'grid' : 'none';
    document.getElementById('resourcesContent').style.display = tabName === 'resources' ? 'block' : 'none';
    document.getElementById('toolsTab').classList.toggle('bg-blue-600', tabName === 'tools');
    document.getElementById('resourcesTab').classList.toggle('bg-blue-600', tabName === 'resources');
}

function showResourceTab(tabName) {
    document.getElementById('uiResources').style.display = tabName === 'ui' ? 'block' : 'none';
    document.getElementById('uxResources').style.display = tabName === 'ux' ? 'block' : 'none';
    document.getElementById('uiResourcesTab').classList.toggle('bg-blue-600', tabName === 'ui');
    document.getElementById('uxResourcesTab').classList.toggle('bg-blue-600', tabName === 'ux');
}

function loadResources(category) {
    const resources = {
        ui: {
            'Color': [
                { name: 'Coolors', url: 'https://coolors.co/' },
                { name: 'Adobe Color', url: 'https://color.adobe.com/' },
                { name: 'ColorHunt', url: 'https://colorhunt.co/' }
            ],
            'Typography': [
                { name: 'Google Fonts', url: 'https://fonts.google.com/' },
                { name: 'FontPair', url: 'https://fontpair.co/' },
                { name: 'Typewolf', url: 'https://www.typewolf.com/' }
            ],
            'Icons': [
                { name: 'Feather Icons', url: 'https://feathericons.com/' },
                { name: 'Font Awesome', url: 'https://fontawesome.com/' },
                { name: 'Material Icons', url: 'https://material.io/resources/icons/' }
            ]
        },
        ux: {
            'Principles': [
                { name: 'Laws of UX', url: 'https://lawsofux.com/' },
                { name: 'UX Principles', url: 'https://uxplanet.org/fundamental-principles-of-ux-design-f1b7475bee65' },
                { name: 'Nielsen Norman Group', url: 'https://www.nngroup.com/articles/ten-usability-heuristics/' }
            ],
            'Research': [
                { name: 'UX Booth', url: 'https://www.uxbooth.com/categories/research/' },
                { name: 'UX Mastery', url: 'https://uxmastery.com/topics/research/' },
                { name: 'Just in Mind', url: 'https://www.justinmind.com/blog/category/ux-research/' }
            ],
            'Accessibility': [
                { name: 'A11Y Project', url: 'https://a11yproject.com/' },
                { name: 'WebAIM', url: 'https://webaim.org/' },
                { name: 'Accessibility Developer Guide', url: 'https://www.accessibility-developer-guide.com/' }
            ]
        }
    };

    let html = `
        <div class="mb-4">
            <input type="text" id="search${category.toUpperCase()}" placeholder="Search ${category.toUpperCase()} resources..." class="w-full p-2 border rounded bg-gray-700 text-white">
        </div>
    `;

    for (const [subCategory, sites] of Object.entries(resources[category])) {
        html += `<h3 class="text-xl font-bold mb-2 text-blue-300">${subCategory}</h3>`;
        html += '<div class="grid grid-cols-2 gap-4 mb-4">';
        for (const site of sites) {
            html += `
                <a href="${site.url}" target="_blank" class="flex items-center p-2 bg-gray-700 rounded shadow hover:bg-blue-600 text-white transition duration-300 ease-in-out transform hover:scale-105">
                    <img src="https://www.google.com/s2/favicons?domain=${site.url}" alt="${site.name} favicon" class="mr-2">
                    <span>${site.name}</span>
                </a>
            `;
        }
        html += '</div>';
    }

    document.getElementById(`${category}Resources`).innerHTML = html;

    document.getElementById(`search${category.toUpperCase()}`).addEventListener('input', function() {
        filterResources(category);
    });
}

function filterResources(category) {
    const searchTerm = document.getElementById(`search${category.toUpperCase()}`).value.toLowerCase();
    const resources = document.getElementById(`${category}Resources`).querySelectorAll('a');

    resources.forEach(resource => {
        const name = resource.textContent.toLowerCase();
        const isVisible = name.includes(searchTerm);
        resource.style.display = isVisible ? 'flex' : 'none';
    });
}