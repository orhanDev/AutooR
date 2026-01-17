
(function() {
    'use strict';
    
    function makeAutooROrange() {
        const processedClass = 'autoor-orange-processed';
        const black = '#000000';
        const orange = '#ff7a00';
        const logoHTML = `<span style="color: ${black};">Aut</span><span style="color: ${orange};">o</span><span style="color: ${orange};">o</span><span style="color: ${black};">R</span>`;
        const footerLogoHTML = `<span style="color: #ffffff;">Aut</span><span style="color: ${orange};">o</span><span style="color: ${orange};">o</span><span style="color: #ffffff;">R</span>`;
        
        function normalizeProcessed() {

            document.querySelectorAll('.' + processedClass).forEach(el => {
                el.innerHTML = el.innerHTML.replace(/AutooR/g, logoHTML);
                el.classList.remove(processedClass);
            });

            const spans = Array.from(document.querySelectorAll('span')).filter(el => {
                if (el.childElementCount > 0) return false;
                const txt = el.textContent || '';
                if (!txt.includes('AutooR')) return false;
                const color = (el.style && el.style.color || '').toLowerCase();
                return color.includes('#ff7a00') || color.includes('#7d0011') || color.includes('orange');
            });
            spans.forEach(el => {
                el.innerHTML = el.innerHTML.replace(/AutooR/g, logoHTML);
            });

            const footers = document.querySelectorAll('footer');
            footers.forEach(footer => {
                const nodes = footer.querySelectorAll('p, span, div, a');
                nodes.forEach(el => {
                    const html = el.innerHTML;
                    if (html && html.includes('AutooR')) {
                        el.innerHTML = html.replace(/AutooR/g, footerLogoHTML);
                    }
                });
            });
        }
        
        function processNode(node) {

            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'SCRIPT' || 
                    node.tagName === 'STYLE' || 
                    node.closest('script') ||
                    node.closest('style')) {
                    return;
                }
            }

            if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;
                if (text && text.includes('AutooR')) {
                    const parent = node.parentNode;
                    if (parent) {
                        const newHTML = text.replace(/AutooR/g, logoHTML);
                        
                        if (newHTML !== text) {
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = newHTML;
                            const fragment = document.createDocumentFragment();
                            while (tempDiv.firstChild) {
                                fragment.appendChild(tempDiv.firstChild);
                            }
                            parent.replaceChild(fragment, node);
                            parent.classList.add(processedClass);
                        }
                    }
                }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                const children = Array.from(node.childNodes);
                children.forEach(child => processNode(child));
            }
        }
        
        if (document.body) {
            normalizeProcessed();
            
            const walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            return node.textContent && node.textContent.includes('AutooR') ? 
                                NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                        }
                        return NodeFilter.FILTER_REJECT;
                    }
                }
            );
            
            const nodes = [];
            let node;
            while (node = walker.nextNode()) {
                nodes.push(node);
            }
            
            nodes.forEach(n => processNode(n));
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            makeAutooROrange();

            setTimeout(makeAutooROrange, 500);
            setTimeout(makeAutooROrange, 1000);
        });
    } else {
        makeAutooROrange();
        setTimeout(makeAutooROrange, 500);
        setTimeout(makeAutooROrange, 1000);
    }

    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            let shouldProcess = false;
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.includes('AutooR')) {
                            shouldProcess = true;
                        } else if (node.nodeType === Node.ELEMENT_NODE && node.textContent && node.textContent.includes('AutooR')) {
                            shouldProcess = true;
                        }
                    });
                }
            });
            if (shouldProcess) {
                setTimeout(makeAutooROrange, 100);
            }
        });
        
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        }
    }
})();
