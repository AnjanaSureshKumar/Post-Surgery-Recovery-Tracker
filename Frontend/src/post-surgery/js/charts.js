// Charts and data visualization
class Charts {
    static initRecoveryChart() {
        const canvas = document.getElementById('recoveryChartCanvas');
        if (!canvas) {
            console.log('Recovery chart canvas not found');
            return;
        }

        console.log('Initializing recovery chart...');
        const ctx = canvas.getContext('2d');
        const data = Storage.getRecoveryData();

        // Set canvas size
        canvas.width = canvas.offsetWidth;
        canvas.height = 200;

        this.drawRecoveryChart(ctx, data, canvas.width, canvas.height);
        console.log('Recovery chart drawn successfully');
    }

    static drawRecoveryChart(ctx, data, width, height) {
        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Chart dimensions
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Data processing
        const dates = data.map(d => d.date);
        const painLevels = data.map(d => d.painLevel);
        const energyLevels = data.map(d => d.energyLevel);

        // Scales
        const xScale = chartWidth / (dates.length - 1);
        const yScale = chartHeight / 10; // Scale for 1-10 range

        // Draw background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw grid lines
        ctx.strokeStyle = '#f0f0f0';
        ctx.lineWidth = 1;

        // Horizontal grid lines
        for (let i = 0; i <= 10; i++) {
            const y = padding + (10 - i) * yScale;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Vertical grid lines
        for (let i = 0; i < dates.length; i++) {
            const x = padding + i * xScale;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }

        // Draw pain level line
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        painLevels.forEach((pain, i) => {
            const x = padding + i * xScale;
            const y = padding + (10 - pain) * yScale;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw energy level line
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        energyLevels.forEach((energy, i) => {
            const x = padding + i * xScale;
            const y = padding + (10 - energy) * yScale;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();

        // Draw data points
        painLevels.forEach((pain, i) => {
            const x = padding + i * xScale;
            const y = padding + (10 - pain) * yScale;
            
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        energyLevels.forEach((energy, i) => {
            const x = padding + i * xScale;
            const y = padding + (10 - energy) * yScale;
            
            ctx.fillStyle = '#4CAF50';
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw axes
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 2;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.stroke();

        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();

        // Y-axis labels
        ctx.fillStyle = '#666666';
        ctx.font = '12px Inter';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        
        for (let i = 0; i <= 10; i++) {
            const y = padding + (10 - i) * yScale;
            ctx.fillText(i.toString(), padding - 10, y);
        }

        // X-axis labels (simplified - show every other date)
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        dates.forEach((date, i) => {
            if (i % 2 === 0) { // Show every other date
                const x = padding + i * xScale;
                const shortDate = new Date(date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                });
                ctx.fillText(shortDate, x, height - padding + 10);
            }
        });

        // Legend
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Pain level legend
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(padding, 10, 15, 3);
        ctx.fillStyle = '#333333';
        ctx.fillText('Pain Level', padding + 25, 12);

        // Energy level legend
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(padding + 120, 10, 15, 3);
        ctx.fillStyle = '#333333';
        ctx.fillText('Energy Level', padding + 145, 12);
    }

    static createProgressChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.width = options.width || 400;
        canvas.height = options.height || 200;
        
        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        this.drawProgressChart(ctx, data, canvas.width, canvas.height, options);
    }

    static drawProgressChart(ctx, data, width, height, options) {
        // Implementation for progress/bar charts
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        // Draw bars
        const barWidth = chartWidth / data.length * 0.8;
        const barSpacing = chartWidth / data.length * 0.2;
        const maxValue = Math.max(...data.map(d => d.value));

        data.forEach((item, i) => {
            const x = padding + i * (barWidth + barSpacing);
            const barHeight = (item.value / maxValue) * chartHeight;
            const y = height - padding - barHeight;

            // Draw bar
            ctx.fillStyle = options.color || '#4CAF50';
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw label
            ctx.fillStyle = '#333333';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(item.label, x + barWidth / 2, height - padding + 20);

            // Draw value
            ctx.fillText(item.value.toString(), x + barWidth / 2, y - 10);
        });
    }

    static createPieChart(containerId, data, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const canvas = document.createElement('canvas');
        canvas.width = options.width || 300;
        canvas.height = options.height || 300;
        
        container.innerHTML = '';
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        this.drawPieChart(ctx, data, canvas.width, canvas.height, options);
    }

    static drawPieChart(ctx, data, width, height, options) {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = -Math.PI / 2; // Start from top

        const colors = options.colors || ['#4CAF50', '#2196F3', '#FFC107', '#FF9800', '#9C27B0'];

        data.forEach((item, i) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;

            // Draw slice
            ctx.fillStyle = colors[i % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);

            ctx.fillStyle = '#ffffff';
            ctx.font = '12px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.label, labelX, labelY);

            currentAngle += sliceAngle;
        });
    }

    // Utility function to generate trend data
    static generateTrendData(days = 7, trend = 'improving') {
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);

            let value;
            if (trend === 'improving') {
                value = Math.max(1, 8 - (days - i) * 0.8 + Math.random() * 2);
            } else if (trend === 'stable') {
                value = 5 + Math.random() * 2 - 1;
            } else {
                value = 3 + (days - i) * 0.3 + Math.random() * 2;
            }

            data.push({
                date: date.toISOString().split('T')[0],
                value: Math.round(value * 10) / 10
            });
        }

        return data;
    }

    // Update existing charts with new data
    static updateRecoveryChart() {
        this.initRecoveryChart();
    }
}