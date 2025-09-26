class LiquidGlass {
    constructor() {
        this.glassBar = document.getElementById('glassBar');
        this.isDragging = false;
        this.currentX = 0;
        this.currentY = 0;
        this.initialX = 0;
        this.initialY = 0;
        this.xOffset = 0;
        this.yOffset = 0;
        
        this.init();
    }
    
    init() {
        // Add event listeners for mouse events
        this.glassBar.addEventListener('mousedown', this.dragStart.bind(this));
        document.addEventListener('mousemove', this.dragMove.bind(this));
        document.addEventListener('mouseup', this.dragEnd.bind(this));
        
        // Add event listeners for touch events (mobile support)
        this.glassBar.addEventListener('touchstart', this.dragStart.bind(this));
        document.addEventListener('touchmove', this.dragMove.bind(this));
        document.addEventListener('touchend', this.dragEnd.bind(this));
        
        // Prevent default drag behavior
        this.glassBar.addEventListener('dragstart', (e) => e.preventDefault());
        
        // Add smooth hover effects
        this.addHoverEffects();
        
        // Initialize position
        this.setInitialPosition();
    }
    
    setInitialPosition() {
        // Don't set initial position here since CSS already handles it
        // This allows the CSS positioning to work properly
        const rect = this.glassBar.getBoundingClientRect();
        this.xOffset = rect.left;
        this.yOffset = rect.top;
    }
    
    dragStart(e) {
        // Handle both mouse and touch events
        const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;
        
        this.initialX = clientX - this.xOffset;
        this.initialY = clientY - this.yOffset;
        
        if (e.target === this.glassBar || this.glassBar.contains(e.target)) {
            this.isDragging = true;
            this.glassBar.classList.add('dragging');
            
            // Add liquid effect during drag
            this.addLiquidEffect();
        }
    }
    
    dragMove(e) {
        if (this.isDragging) {
            e.preventDefault();
            
            // Handle both mouse and touch events
            const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
            const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;
            
            this.currentX = clientX - this.initialX;
            this.currentY = clientY - this.initialY;
            
            // Constrain movement within viewport
            this.currentX = Math.max(0, Math.min(this.currentX, window.innerWidth - this.glassBar.offsetWidth));
            this.currentY = Math.max(0, Math.min(this.currentY, window.innerHeight - this.glassBar.offsetHeight));
            
            this.xOffset = this.currentX;
            this.yOffset = this.currentY;
            
            this.setTransform(this.currentX, this.currentY);
        }
    }
    
    dragEnd() {
        this.initialX = this.currentX;
        this.initialY = this.currentY;
        
        this.isDragging = false;
        this.glassBar.classList.remove('dragging');
        
        // Add settling animation
        this.addSettleEffect();
    }
    
    setTransform(x, y) {
        this.glassBar.style.transform = `translate(${x}px, ${y}px)`;
    }
    
    addLiquidEffect() {
        // Add a temporary liquid animation class
        this.glassBar.classList.add('liquid-active');
        
        // Create flowing particles
        this.createFlowingParticles();
        
        setTimeout(() => {
            this.glassBar.classList.remove('liquid-active');
        }, 300);
    }
    
    addSettleEffect() {
        // Add a subtle bounce effect when releasing
        this.glassBar.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        setTimeout(() => {
            this.glassBar.style.transition = '';
        }, 300);
    }
    
    addHoverEffects() {
        this.glassBar.addEventListener('mouseenter', () => {
            this.glassBar.style.transform += ' scale(1.02)';
        });
        
        this.glassBar.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.glassBar.style.transform = this.glassBar.style.transform.replace(' scale(1.02)', '');
            }
        });
    }
    
    createRipple(x, y) {
        // Ripple effect removed to clean up the interface
    }
    
    createFlowingParticles() {
        // Particle effects removed for cleaner interface
    }
}

// Initialize the liquid glass effect when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new LiquidGlass();
    
    // Add additional CSS animations dynamically
    const style = document.createElement('style');
    style.textContent = `
        .liquid-active .glass-surface {
            animation: liquid-pulse 0.3s ease-in-out;
        }
        
        @keyframes liquid-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.01); }
        }
        
        .glass-bar {
            will-change: transform;
        }
        
        .glass-surface {
            will-change: background, border-color, box-shadow;
        }
    `;
    
    document.head.appendChild(style);
});

// Add window resize handler to maintain proper positioning
window.addEventListener('resize', () => {
    const glassBar = document.getElementById('glassBar');
    if (glassBar) {
        const rect = glassBar.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            glassBar.style.transform = `translate(${window.innerWidth - glassBar.offsetWidth}px, ${rect.top}px)`;
        }
        if (rect.bottom > window.innerHeight) {
            glassBar.style.transform = `translate(${rect.left}px, ${window.innerHeight - glassBar.offsetHeight}px)`;
        }
    }
});