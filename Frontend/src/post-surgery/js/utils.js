// Utility functions and helpers
class Utils {
    // Date formatting utilities
    static formatDate(date, format = 'short') {
        const d = new Date(date);
        
        const options = {
            short: { month: 'short', day: 'numeric' },
            long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
            time: { hour: '2-digit', minute: '2-digit' },
            datetime: { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit' 
            }
        };
        
        return d.toLocaleDateString('en-US', options[format] || options.short);
    }

    static formatTime(time) {
        const [hours, minutes] = time.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    static getTimeFromNow(date) {
        const now = new Date();
        const target = new Date(date);
        const diffMs = target.getTime() - now.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const diffHours = Math.round(diffMs / 3600000);
        const diffDays = Math.round(diffMs / 86400000);

        if (Math.abs(diffMins) < 60) {
            return diffMins === 0 ? 'now' : 
                   diffMins > 0 ? `in ${diffMins} minutes` : `${Math.abs(diffMins)} minutes ago`;
        } else if (Math.abs(diffHours) < 24) {
            return diffHours > 0 ? `in ${diffHours} hours` : `${Math.abs(diffHours)} hours ago`;
        } else {
            return diffDays > 0 ? `in ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
        }
    }

    // Form validation utilities
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        return password && password.length >= 6;
    }

    static validateRequired(value) {
        return value && value.trim().length > 0;
    }

    static validateForm(formData, rules) {
        const errors = {};
        
        for (const [field, rule] of Object.entries(rules)) {
            const value = formData[field];
            
            if (rule.required && !this.validateRequired(value)) {
                errors[field] = `${field} is required`;
                continue;
            }
            
            if (rule.email && value && !this.validateEmail(value)) {
                errors[field] = 'Please enter a valid email address';
            }
            
            if (rule.password && value && !this.validatePassword(value)) {
                errors[field] = 'Password must be at least 6 characters long';
            }
            
            if (rule.minLength && value && value.length < rule.minLength) {
                errors[field] = `${field} must be at least ${rule.minLength} characters long`;
            }
            
            if (rule.maxLength && value && value.length > rule.maxLength) {
                errors[field] = `${field} must be no more than ${rule.maxLength} characters long`;
            }
        }
        
        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    // DOM utilities
    static createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    }

    static addEventListeners(selectors, eventType, handler) {
        const elements = typeof selectors === 'string' 
            ? document.querySelectorAll(selectors)
            : selectors;
            
        elements.forEach(element => {
            element.addEventListener(eventType, handler);
        });
    }

    static showElement(selector) {
        const element = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        if (element) element.classList.remove('hidden');
    }

    static hideElement(selector) {
        const element = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        if (element) element.classList.add('hidden');
    }

    static toggleElement(selector) {
        const element = typeof selector === 'string' 
            ? document.querySelector(selector) 
            : selector;
        if (element) element.classList.toggle('hidden');
    }

    // Data processing utilities
    static calculateAverage(numbers) {
        if (!numbers || numbers.length === 0) return 0;
        const sum = numbers.reduce((a, b) => a + b, 0);
        return Math.round((sum / numbers.length) * 10) / 10;
    }

    static calculatePercentage(value, total) {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    }

    static groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    static sortBy(array, key, direction = 'asc') {
        return [...array].sort((a, b) => {
            let aVal = a[key];
            let bVal = b[key];
            
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }
            
            if (direction === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
    }

    // Recovery calculation utilities
    static calculateRecoveryProgress(daysSinceSurgery, expectedRecoveryDays = 30) {
        const progress = Math.min((daysSinceSurgery / expectedRecoveryDays) * 100, 100);
        return Math.round(progress);
    }

    static calculatePainTrend(painLevels) {
        if (!painLevels || painLevels.length < 2) return 'stable';
        
        const recent = painLevels.slice(-5); // Last 5 entries
        const average = this.calculateAverage(recent);
        const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
        const secondHalf = recent.slice(Math.floor(recent.length / 2));
        
        const firstAvg = this.calculateAverage(firstHalf);
        const secondAvg = this.calculateAverage(secondHalf);
        
        const difference = firstAvg - secondAvg;
        
        if (difference > 1) return 'improving';
        if (difference < -1) return 'worsening';
        return 'stable';
    }

    static getMoodEmoji(mood) {
        const moodEmojis = {
            'very-sad': '😢',
            'sad': '😞',
            'neutral': '😐',
            'happy': '😊',
            'very-happy': '😄'
        };
        return moodEmojis[mood] || '😐';
    }

    static getMoodColor(mood) {
        const moodColors = {
            'very-sad': '#ef4444',
            'sad': '#f97316',
            'neutral': '#6b7280',
            'happy': '#22c55e',
            'very-happy': '#16a34a'
        };
        return moodColors[mood] || '#6b7280';
    }

    // File utilities
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
    }

    static isImageFile(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
        return imageExtensions.includes(this.getFileExtension(filename).toLowerCase());
    }

    static isPdfFile(filename) {
        return this.getFileExtension(filename).toLowerCase() === 'pdf';
    }

    // URL utilities
    static getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    static setQueryParam(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    }

    // Device detection
    static isMobile() {
        return window.innerWidth <= 768;
    }

    static isTablet() {
        return window.innerWidth > 768 && window.innerWidth <= 1024;
    }

    static isDesktop() {
        return window.innerWidth > 1024;
    }

    // Debounce utility
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle utility
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Copy to clipboard
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            Notifications.success('Copied to clipboard');
            return true;
        } catch (err) {
            console.error('Failed to copy: ', err);
            Notifications.error('Failed to copy to clipboard');
            return false;
        }
    }

    // Generate unique ID
    static generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    // Color utilities
    static hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    static rgbToHex(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    // Animation utilities
    static animateValue(element, start, end, duration, callback) {
        const startTime = performance.now();
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (end - start) * progress;
            
            if (callback) {
                callback(current);
            } else if (element) {
                element.textContent = Math.round(current);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    }
}