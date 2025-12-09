// LYRIN Translator App - JavaScript Functionality
class TranslatorApp {
    constructor() {
        this.sourceLanguage = 'en';
        this.targetLanguage = 'fil';
        this.sourceText = '';
        this.targetText = '';
        this.isTranslating = false;
        this.speechSynthesis = window.speechSynthesis;
        this.recognition = null;
        this.isListening = false;
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupLanguageMappings();
    }

    setupLanguageMappings() {
        this.languageMap = {
            'en': 'English',
            'fil': 'Filipino',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese'
        };
    }

    bindEvents() {
        // Source text input
        const sourceTextArea = document.getElementById('sourceText');
        sourceTextArea.addEventListener('input', (e) => {
            this.sourceText = e.target.value;
            this.debounceTranslate();
        });

        // Language changes
        const sourceLanguageSelect = document.getElementById('sourceLanguage');
        const targetLanguageSelect = document.getElementById('targetLanguage');
        
        sourceLanguageSelect.addEventListener('change', (e) => {
            this.sourceLanguage = e.target.value;
            this.translate();
        });

        targetLanguageSelect.addEventListener('change', (e) => {
            this.targetLanguage = e.target.value;
            this.translate();
        });

        // Swap button
        const swapButton = document.getElementById('swapButton');
        swapButton.addEventListener('click', () => {
            this.swapLanguages();
        });

        // Speech and voice controls
        this.setupSpeechControls();

        // Sidebar icon interactions
        this.setupSidebarInteractions();

        // Logo click → always show Language Translator
        const logoLink = document.querySelector('.logo-link');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                // Ensure translator section becomes visible even if user is on another tab
                e.preventDefault();
                this.showSectionByIndex(0);
                const translator = document.getElementById('section-translator');
                if (translator && typeof translator.scrollIntoView === 'function') {
                    translator.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
                // Keep the URL hash in sync
                try { history.replaceState(null, '', '#section-translator'); } catch (_) {}
            });
        }
    }

    
    setupSidebarInteractions() {
        const sidebarIcons = document.querySelectorAll('.sidebar-icon');
        sidebarIcons.forEach((icon, index) => {
            icon.addEventListener('click', () => {
                this.showSectionByIndex(index);
            });
        });
    }

    showSectionByIndex(index) {
        // Sections: 0=translator, 1=learning, 2=dictionary, 3=quiz
        const sections = [
            document.getElementById('section-translator'),
            document.getElementById('section-learning'),
            document.getElementById('section-dictionary'),
            document.getElementById('section-quiz')
        ];

        // Toggle visibility
        sections.forEach((section, i) => {
            if (!section) return;
            section.style.display = i === index ? 'flex' : 'none';
        });

        // Update active icon
        const icons = document.querySelectorAll('.sidebar-icon');
        icons.forEach((icon, i) => {
            if (i === index) {
                icon.classList.add('active');
            } else {
                icon.classList.remove('active');
            }
        });

        // Focus source text when translator is shown
        if (index === 0) {
            const st = document.getElementById('sourceText');
            if (st) st.focus();
        }
    }

    focusSourceText() {
        document.getElementById('sourceText').focus();
        this.showMessage('Language Translator: Type in the left panel and translation will appear on the right. Use the swap button to switch languages.', 'info');
    }

    showHelp() {
        this.showMessage('Help: Type in the left panel and translation will appear on the right. Use the swap button to switch languages.', 'info');
    }

    showTrophy() {
        this.showMessage('Achievement unlocked: You\'re using LYRIN Translator! 🏆', 'success');
    }

    showBook() {
        this.showMessage('Book: "Nothing lasts forever, we can change the future" - LYRIN', 'info');
    }

    setupSpeechControls() {
        // Microphone button for voice input
        const sourceMic = document.getElementById('sourceMic');
        sourceMic.addEventListener('click', () => {
            this.startVoiceInput();
        });

        // Speaker buttons for text-to-speech
        const sourceSpeaker = document.getElementById('sourceSpeaker');
        const targetSpeaker = document.getElementById('targetSpeaker');
        
        sourceSpeaker.addEventListener('click', () => {
            this.speakText(this.sourceText, this.sourceLanguage);
        });

        targetSpeaker.addEventListener('click', () => {
            this.speakText(this.targetText, this.targetLanguage);
        });

        // Copy button for target text
        const targetCopy = document.getElementById('targetCopy');
        targetCopy.addEventListener('click', () => {
            this.copyToClipboard(this.targetText);
        });

        // Initialize speech recognition
        this.initSpeechRecognition();
    }

    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.getLanguageCode(this.sourceLanguage);

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.sourceText = transcript;
                document.getElementById('sourceText').value = transcript;
                this.translate();
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.showError('Voice input failed. Please try again.');
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateMicButton();
            };
        }
    }

    startVoiceInput() {
        if (!this.recognition) {
            this.showError('Voice input not supported in this browser.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        } else {
            this.recognition.lang = this.getLanguageCode(this.sourceLanguage);
            this.recognition.start();
            this.isListening = true;
        }
        this.updateMicButton();
    }

    updateMicButton() {
        const micBtn = document.getElementById('sourceMic');
        if (this.isListening) {
            micBtn.style.background = '#ef4444';
            micBtn.style.color = 'white';
        } else {
            micBtn.style.background = '';
            micBtn.style.color = '';
        }
    }

    speakText(text, language) {
        if (!text.trim()) {
            this.showError('No text to speak.');
            return;
        }

        if (this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.getLanguageCode(language);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        utterance.onstart = () => {
            this.showMessage('Speaking...', 'info');
        };

        utterance.onend = () => {
            this.showMessage('Speech completed.', 'success');
        };

        utterance.onerror = (event) => {
            this.showError('Speech synthesis failed.');
        };

        this.speechSynthesis.speak(utterance);
    }

    copyToClipboard(text) {
        if (!text.trim()) {
            this.showError('No text to copy.');
            return;
        }

        navigator.clipboard.writeText(text).then(() => {
            this.showMessage('Text copied to clipboard!', 'success');
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showMessage('Text copied to clipboard!', 'success');
        });
    }

    getLanguageCode(language) {
        const languageMap = {
            'en': 'en-US',
            'fil': 'fil-PH',
            'es': 'es-ES',
            'fr': 'fr-FR',
            'de': 'de-DE',
            'ja': 'ja-JP',
            'ko': 'ko-KR',
            'zh': 'zh-CN'
        };
        return languageMap[language] || 'en-US';
    }

    debounceTranslate() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.translate();
        }, 500);
    }

    async translate() {
        if (!this.sourceText.trim()) {
            this.updateTargetText('');
            return;
        }

        if (this.sourceLanguage === this.targetLanguage) {
            this.updateTargetText(this.sourceText);
            return;
        }

        this.showLoading(true);
        
        try {
            const translatedText = await this.callLibreTranslateAPI();
            this.updateTargetText(translatedText);
            this.hideLoading();
        } catch (error) {
            console.error('Translation error:', error);
            this.showError('Translation failed. Please check your internet connection and try again.');
            this.hideLoading();
        }
    }

    async callLibreTranslateAPI() {
        // Use MyMemory API for reliable translation
        try {
            // Map our language codes to MyMemory API codes
            const languageMap = {
                'en': 'en',
                'fil': 'tl',  // Filipino
                'es': 'es',
                'fr': 'fr',
                'de': 'de',
                'it': 'it',
                'pt': 'pt',
                'ja': 'ja',
                'ko': 'ko',
                'zh': 'zh',
                'ru': 'ru',
                'ar': 'ar',
                'hi': 'hi',
                'id': 'id',
                'th': 'th',
                'vi': 'vi',
                'nl': 'nl',
                'el': 'el',
                'tr': 'tr',
                'sv': 'sv'
            };
            
            const sourceLang = languageMap[this.sourceLanguage] || this.sourceLanguage;
            const targetLang = languageMap[this.targetLanguage] || this.targetLanguage;
            
            // Use the MyMemory API
            const translatedText = await translateText(this.sourceText, sourceLang, targetLang);
            
            // Check if it's an error message
            if (translatedText.startsWith('Error:')) {
                console.log('MyMemory API error:', translatedText);
                throw new Error(translatedText);
            }
            
            return translatedText;
            
        } catch (error) {
            console.error('Translation API error:', error);
            throw error;
        }
    }


    swapLanguages() {
        // Swap language selections
        const sourceSelect = document.getElementById('sourceLanguage');
        const targetSelect = document.getElementById('targetLanguage');
        
        const tempSourceLang = sourceSelect.value;
        const tempTargetLang = targetSelect.value;
        
        sourceSelect.value = tempTargetLang;
        targetSelect.value = tempSourceLang;
        
        // Update internal state
        this.sourceLanguage = tempTargetLang;
        this.targetLanguage = tempSourceLang;
        
        // Swap text content
        const sourceTextArea = document.getElementById('sourceText');
        const targetTextArea = document.getElementById('targetText');
        
        const tempSourceText = sourceTextArea.value;
        const tempTargetText = targetTextArea.value;
        
        sourceTextArea.value = tempTargetText;
        targetTextArea.value = tempSourceText;
        
        // Update internal state
        this.sourceText = tempTargetText;
        this.targetText = tempSourceText;
        
        // Add visual feedback
        this.animateSwap();
    }

    animateSwap() {
        const swapButton = document.getElementById('swapButton');
        swapButton.style.transform = 'scale(0.9)';
        setTimeout(() => {
            swapButton.style.transform = 'scale(1)';
        }, 150);
    }

    updateTargetText(text) {
        const targetTextArea = document.getElementById('targetText');
        targetTextArea.value = text;
        this.targetText = text;
    }

    showLoading(show) {
        const loadingMessage = document.getElementById('loadingMessage');
        if (show) {
            loadingMessage.style.display = 'flex';
        } else {
            loadingMessage.style.display = 'none';
        }
    }

    hideLoading() {
        this.showLoading(false);
    }

    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        
        errorText.textContent = message;
        errorMessage.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 5000);
    }

    showMessage(message, type = 'info') {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type === 'success' ? 'success-message' : 'info-message'}`;
        messageEl.innerHTML = `
            <iconify-icon icon="mdi:${type === 'success' ? 'check-circle' : 'information'}"></iconify-icon>
            <span>${message}</span>
        `;
        
        // Add styles for new message types
        if (type === 'success') {
            messageEl.style.background = '#f0fdf4';
            messageEl.style.color = '#166534';
            messageEl.style.border = '1px solid #bbf7d0';
        } else {
            messageEl.style.background = '#eff6ff';
            messageEl.style.color = '#1e40af';
            messageEl.style.border = '1px solid #93c5fd';
        }
        
        document.body.appendChild(messageEl);
        
        // Auto-hide after 4 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 4000);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TranslatorApp();
});

// Add some utility functions for better UX
document.addEventListener('DOMContentLoaded', () => {
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to translate
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const sourceText = document.getElementById('sourceText');
            if (document.activeElement === sourceText) {
                sourceText.blur();
            }
        }
        
        // Escape to clear messages
        if (e.key === 'Escape') {
            const messages = document.querySelectorAll('.message');
            messages.forEach(msg => {
                if (msg.style.display !== 'none') {
                    msg.style.display = 'none';
                }
            });
        }
    });

    // Add smooth scrolling for better UX
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add loading state management
    let isOnline = navigator.onLine;
    
    window.addEventListener('online', () => {
        isOnline = true;
        if (!isOnline) {
            const app = new TranslatorApp();
            app.showMessage('Connection restored! You can now translate.', 'success');
        }
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        const app = new TranslatorApp();
        app.showError('No internet connection. Please check your network.');
    });
});
