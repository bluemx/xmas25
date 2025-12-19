const { createApp, ref, onMounted, onUnmounted, computed, watch } = Vue;

/* --- Snow Effect --- */
class SnowEffect {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.initParticles();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initParticles() {
        const particleCount = 100;
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 2 + 1,
                speedY: Math.random() * 1 + 0.5,
                drift: Math.random() * 1 - 0.5
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        
        for (let p of this.particles) {
            p.y += p.speedY;
            p.x += p.drift;

            if (p.y > this.canvas.height) {
                p.y = 0;
                p.x = Math.random() * this.canvas.width;
            }

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }

        requestAnimationFrame(() => this.animate());
    }
}

/* --- Image Sequence Manager --- */
class ImageSequence {
    constructor(canvasConfig, onFrameLoaded) {
        this.canvas = canvasConfig.canvas;
        this.ctx = this.canvas.getContext('2d');
        this.frameCount = 214; // Frames 0 to 213
        this.images = [];
        this.imagesLoaded = 0;
        this.onFrameLoaded = onFrameLoaded;
        this.folder = 'assets/frames';
        this.baseName = 'frame_'; 
        
        this.loadImages();
    }

    loadImages() {
        for (let i = 0; i < this.frameCount; i++) {
            const img = new Image();
            // User specified 'frame_0.avif' to 'frame_213.avif'.
            // Assuming no zero-padding based on 'frame_0'.
            img.src = `${this.folder}/${this.baseName}${i}.avif`;
            
            img.onload = () => {
                this.imagesLoaded++;
                if (this.onFrameLoaded) this.onFrameLoaded(this.imagesLoaded, this.frameCount);
                // Draw first frame immediately
                if (i === 0) this.render(0); 
            };
            
            img.onerror = () => {
                 // console.warn(`Frame ${i} not found.`);
            };

            this.images.push(img);
        }
    }

    render(progress) {
        // Progress 0 to 1
        // Map to index 0 to frameCount-1
        let frameIndex = Math.floor(progress * (this.images.length - 1));
        frameIndex = Math.min(Math.max(frameIndex, 0), this.images.length - 1);
        
        const img = this.images[frameIndex];
        
        // Clear logic
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (img && img.complete) {
            // "Do not deform... Scale to fit height... Keep in center"
            
            // Calculate scale to fit height
            const scale = this.canvas.height / img.height;
            const dw = img.width * scale;
            const dh = this.canvas.height;
            
            // Calculate center position
            const dx = (this.canvas.width - dw) / 2;
            const dy = 0;

            this.ctx.drawImage(img, dx, dy, dw, dh);
        } else {
             // Fallback/Loading state
             this.ctx.fillStyle = '#000';
             this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
             this.ctx.fillStyle = '#fff';
             this.ctx.font = '50px Arial';
             this.ctx.textAlign = 'center';
             this.ctx.fillText(`Frame ${frameIndex}`, this.canvas.width/2, this.canvas.height/2);
        }
    }
}

/* --- Fireworks Effect --- */
class FireworksEffect {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.active = false; // State to track activation
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    explode(x, y) {
        const colors = ['#FFD700', '#FF0000', '#00FFFF', '#00FF00', '#FFFFFF'];
        const count = 30 + Math.random() * 20;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 3 + 1;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                alpha: 1,
                color: color,
                decay: Math.random() * 0.02 + 0.01
            });
        }
    }

    animate() {
        // Use composite operation for light trail effect
        this.ctx.globalCompositeOperation = 'destination-out';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Fade out
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.globalCompositeOperation = 'lighter';
        
        // Auto-spawn logic in loop (Persistent)
        if (this.active && Math.random() < 0.03) {
             const x = Math.random() * this.canvas.width;
             const y = Math.random() * (this.canvas.height * 0.6); 
             this.explode(x, y);
        }
        
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // Gravity
            p.alpha -= p.decay;

            if (p.alpha <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;

        requestAnimationFrame(() => this.animate());
    }
}

/* --- Cookie Physics Gallery --- */
class CookiePhysics {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d'); // Direct canvas context for rendering
        // High-DPI support for crisper rendering on mobile/retina
        this.dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
        // Logical render size in CSS pixels
        this.renderWidth = canvas.clientWidth;
        this.renderHeight = canvas.clientHeight;
        // Set internal canvas resolution to match device pixel ratio
        this.canvas.width = Math.floor(this.renderWidth * this.dpr);
        this.canvas.height = Math.floor(this.renderHeight * this.dpr);
        // Scale drawing to CSS pixel coordinates
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        // Prefer high quality smoothing for images
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        this.cookieBodies = new Map(); // Track cookie URL -> body mapping
        this.cookieImages = new Map(); // Cache loaded images

        // Determine cookie size factor based on viewport (mobile vs desktop)
        this.sizeFactor = (typeof window !== 'undefined' && window.innerWidth < 768) ? 0.32 : 0.16;

        // Create boundaries (invisible walls)
        const wallOptions = { isStatic: true };
        const ground = Matter.Bodies.rectangle(this.renderWidth / 2, this.renderHeight, this.renderWidth, 20, wallOptions);
        const leftWall = Matter.Bodies.rectangle(0, this.renderHeight / 2, 20, this.renderHeight, wallOptions);
        const rightWall = Matter.Bodies.rectangle(this.renderWidth, this.renderHeight / 2, 20, this.renderHeight, wallOptions);
        
        Matter.World.add(this.world, [ground, leftWall, rightWall]);

        // Mouse control for dragging - Create with explicit options
        const mouse = Matter.Mouse.create(this.canvas, {
            element: this.canvas
        });
        mouse.pixelRatio = window.devicePixelRatio;
        
        const mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.08,
                render: { visible: false }
            }
        });
        
        Matter.World.add(this.world, mouseConstraint);
        
        // Store references
        this.mouseConstraint = mouseConstraint;
        this.mouse = mouse;

        // Start engine (no Matter.Render - use custom canvas rendering)
        this.runner = Matter.Runner.create();
        Matter.Runner.run(this.runner, this.engine);
        this.setupTouchSupport();
        this.animate();
    }

    setupTouchSupport() {
        // Handle touch events to update mouse position for Matter.js
        this.canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.mouse.position = { x, y };
            this.mouse.mousedown = true;
            e.preventDefault();
        });

        this.canvas.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            this.mouse.position = { x, y };
            e.preventDefault();
        });

        this.canvas.addEventListener('touchend', (e) => {
            this.mouse.mousedown = false;
            e.preventDefault();
        });

        // Add mouse tracking for desktop
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.mouse.position = { x, y };
        });

        this.canvas.addEventListener('mousedown', () => {
            this.mouse.mousedown = true;
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.mousedown = false;
        });
    }

    addCookie(imageUrl, isUserCookie = false) {
        // Check if already added
        if (this.cookieBodies.has(imageUrl)) return;

        // Cookie size factor (responsive): based on CSS render width
        const size = this.renderWidth * this.sizeFactor;
        const x = Math.random() * (this.renderWidth - size * 2) + size;
        const y = -size; // Start above canvas

        // Create gingerbread person star shape (approximation)
        const scale = size / 160;
        const vertices = [
            { x: 0, y: -70 * scale },      // Head top
            { x: 25 * scale, y: -50 * scale }, // Head right
            { x: 40 * scale, y: -20 * scale }, // Right arm out
            { x: 25 * scale, y: 0 },           // Right shoulder
            { x: 30 * scale, y: 40 * scale },  // Right body
            { x: 20 * scale, y: 70 * scale },  // Right leg
            { x: 0, y: 80 * scale },           // Bottom center
            { x: -20 * scale, y: 70 * scale }, // Left leg
            { x: -30 * scale, y: 40 * scale }, // Left body
            { x: -25 * scale, y: 0 },          // Left shoulder
            { x: -40 * scale, y: -20 * scale },// Left arm out
            { x: -25 * scale, y: -50 * scale },// Head left
        ];

        const cookie = Matter.Bodies.fromVertices(x, y, vertices, {
            restitution: 0.4,
            friction: 0.5,
            density: 0.001
        });

        // Store metadata for rendering
        cookie.isUserCookie = isUserCookie;
        cookie.imageUrl = imageUrl;
        cookie.size = size;

        // Load and cache image - use direct Image loading (works with cross-origin)
        if (!this.cookieImages.has(imageUrl)) {
            const img = new Image();
            img.onload = () => {
                this.cookieImages.set(imageUrl, img);
            };
            img.onerror = () => {
                console.warn(`Failed to load image: ${imageUrl}`);
                // Mark as failed so we skip it in render, placeholder will show instead
            };
            img.src = imageUrl;
        }

        Matter.World.add(this.world, cookie);
        this.cookieBodies.set(imageUrl, cookie);
    }

    animate() {
        // Clear canvas (use logical render size in CSS pixels)
        this.ctx.clearRect(0, 0, this.renderWidth, this.renderHeight);

        // Render all cookie bodies and check boundaries
        const bodies = Matter.Composite.allBodies(this.world);
        for (let body of bodies) {
            if (!body.imageUrl) continue; // Skip walls/ground

            const pos = body.position;
            const radius = body.circleRadius;
            const margin = radius * 2; // Safety margin

            // Check if cookie is outside viewport and return it
            if (pos.x < -margin || pos.x > this.renderWidth + margin || 
                pos.y < -margin || pos.y > this.renderHeight + margin) {
                // Reset position to a random X at top
                const marginX = body.size;
                const randomX = Math.random() * (this.renderWidth - marginX * 2) + marginX;
                const newY = -radius * 2;
                Matter.Body.setPosition(body, { x: randomX, y: newY });
                Matter.Body.setVelocity(body, { x: 0, y: 0 });
                Matter.Body.setAngularVelocity(body, 0);
            }

            const img = this.cookieImages.get(body.imageUrl);
            const hasValidImage = img && img.complete && img.naturalWidth > 0;

            const angle = body.angle;
            const halfSize = body.size / 2;

            this.ctx.save();
            this.ctx.translate(pos.x, pos.y);
            this.ctx.rotate(angle);

            // Draw cookie with image if available, otherwise placeholder
            if (hasValidImage) {
                try {
                    this.ctx.drawImage(img, -halfSize, -halfSize, body.size, body.size);
                } catch (e) {
                    // If drawImage fails (CORS/tainted canvas), draw placeholder star
                    this.ctx.fillStyle = 'rgba(200, 100, 50, 0.8)';
                    this.ctx.beginPath();
                    body.vertices.forEach((vertex, i) => {
                        const localX = vertex.x - body.position.x;
                        const localY = vertex.y - body.position.y;
                        if (i === 0) this.ctx.moveTo(localX, localY);
                        else this.ctx.lineTo(localX, localY);
                    });
                    this.ctx.closePath();
                    this.ctx.fill();
                }
            } else {
                // Draw placeholder cookie immediately if image isn't loaded
                this.ctx.fillStyle = 'rgba(200, 100, 50, 0.8)';
                this.ctx.beginPath();
                body.vertices.forEach((vertex, i) => {
                    const localX = vertex.x - body.position.x;
                    const localY = vertex.y - body.position.y;
                    if (i === 0) this.ctx.moveTo(localX, localY);
                    else this.ctx.lineTo(localX, localY);
                });
                this.ctx.closePath();
                this.ctx.fill();
            }

            this.ctx.restore();
        }

        requestAnimationFrame(() => this.animate());
    }

    resize(width, height) {
        // Update logical render size (CSS pixels)
        this.renderWidth = width;
        this.renderHeight = height;
        // Update internal resolution for current DPR
        this.dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
        this.canvas.width = Math.floor(this.renderWidth * this.dpr);
        this.canvas.height = Math.floor(this.renderHeight * this.dpr);
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    destroy() {
        // Stop the runner
        if (this.runner) {
            Matter.Runner.stop(this.runner);
        }
        Matter.Engine.clear(this.engine);
        this.cookieImages.clear();
        this.cookieBodies.clear();
    }
}

/* --- Vue App --- */
createApp({
    setup() {
        const scrollProgress = ref(0); // 0 to 1
        const sequenceCanvas = ref(null);
        let sequenceManager = null;
        let fireworks = null;
        
        // Loader State
        const isReady = ref(false);
        const hasStarted = ref(false);
        const loadingProgress = ref(0);
        const cardStyle = ref({});
        const isGalletizateOpen = ref(false);
        // New refs for modal animation
        const postalSceneStyle = ref({ transform: 'translateY(0)' });
        const galletizateStyle = ref({ transform: 'translateY(100%)' });

        // Functions to open/close the Galletizate (no longer modal)
        const openGalletizate = () => {
            isGalletizateOpen.value = true;
            // Initialize physics when section appears
            setTimeout(() => {
                initPhysicsGallery();
            }, 150);
        };
        const closeGalletizate = () => {
            isGalletizateOpen.value = false;
            // Clean up physics when closing
            if (cookiePhysics) {
                cookiePhysics.destroy();
                cookiePhysics = null;
            }
            if (cookiePollingInterval) {
                clearInterval(cookiePollingInterval);
                cookiePollingInterval = null;
            }
        };
        
        // Overlay visibility Logic
        const showText1 = computed(() => scrollProgress.value >= 0.7 * 0.9);
        const showText2 = computed(() => scrollProgress.value >= 0.75 * 0.9);
        const showLogo = computed(() => scrollProgress.value >= 0.8 * 0.9);
        
        // Show button at 100% scroll
        const showGalletizateButton = computed(() => scrollProgress.value >= 0.99 && hasStarted.value);

        const updateScroll = (scrollTop) => {
            const docHeight = document.body.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            
            const rawProgress = scrollTop / docHeight;
            
            // Phase 1: Video Playback (0% to 90% of scroll)
            const videoPhase = 0.9;
            if (rawProgress <= videoPhase) {
                const videoProgress = rawProgress / videoPhase;
                scrollProgress.value = videoProgress;
                
                if (sequenceManager) {
                    sequenceManager.render(videoProgress);
                }
                
                // Slide Up Logic - Postal stays fixed on screen, scrolls out as user progresses
                // No transform needed since postal-scene is position: fixed
                postalSceneStyle.value = { transform: 'translateY(0)' };
                
                // Galletizate moves up (Enter) from below viewport to center
                if (hasStarted.value) {
                    const galletizateOffset = 100 * (1 - videoProgress);
                    galletizateStyle.value = { transform: `translateY(${galletizateOffset}vh)` };
                }
            }

            // Trigger Fireworks randomly if video part > 70%
            // Relative to raw it's 0.7 * 0.9 = 0.63
            if (rawProgress > 0.63) {
                 if (fireworks) fireworks.active = true;
            }
        };

        const audioLoaded = ref(false);
        const isPlaying = ref(false);
        const audioProgress = ref(0);
        let audio = null;
        let lenis = null; // Defined here to be accessible

        const initAudio = () => {
            audio = new Audio('assets/musicbg.mp3');
            audio.loop = true;
            
            audio.addEventListener('canplaythrough', () => {
                audioLoaded.value = true;
            });

            audio.addEventListener('timeupdate', () => {
                if(audio.duration) {
                    audioProgress.value = (audio.currentTime / audio.duration) * 100;
                }
            });
        };

        const toggleAudio = () => {
            if(!audio) return;
            if(audio.paused) {
                audio.play().then(() => {
                    isPlaying.value = true;
                }).catch(e => console.log("Audio play blocked", e));
            } else {
                audio.pause();
                isPlaying.value = false;
            }
        };
        
        const startExperience = () => {
            hasStarted.value = true;
            toggleAudio(); // Start music
            
            // Unlock Scroll
            document.body.classList.remove('no-scroll');
            document.documentElement.classList.remove('no-scroll');
            window.scrollTo(0,0); // Force top for safety
            
            if(lenis) lenis.start();

            // Initial render call to ensure logic flows
            updateScroll(window.scrollY);
        };


        const seekAudio = (e) => {
            if(!audio) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const width = rect.width;
            const percentage = x / width;
            audio.currentTime = percentage * audio.duration;
        };

        const fileInput = ref(null);
        const userPhoto = ref(null);
        const isSending = ref(false); // Used for button disable
        const isCooking = ref(false); // Used for video view
        const cookieResult = ref(null); // Used for result view
        const physicsCanvas = ref(null); // Physics canvas element
        const allCookies = ref([]); // All cookies from API
        
        let cookiePhysics = null;
        let cookiePollingInterval = null;
        
        // Always show physics gallery in natural scroll layout
        const showPhysicsGallery = computed(() => true);
        
        // Reactive viewport width for mobile/desktop adjustments
        const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1024);
        const updateViewportWidth = () => {
            if (typeof window !== 'undefined') {
                viewportWidth.value = window.innerWidth;
            }
        };

        // Physics area height: mobile 400px, desktop 600px
        const physicsHeight = computed(() => {
            return viewportWidth.value < 768 ? '400px' : '600px';
        });
        
        // Removed showGalletizate ref as it's not used in template anymore (style binding used)

        const triggerFileInput = () => {
             fileInput.value.click();
        };

        // Compress image to max 800px and reduce quality for web
        const compressImage = (dataUrl) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    // Calculate scaled dimensions (max 800px, maintain aspect ratio)
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 800;
                    
                    if (width > height) {
                        if (width > maxSize) {
                            height = Math.round((height * maxSize) / width);
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width = Math.round((width * maxSize) / height);
                            height = maxSize;
                        }
                    }
                    
                    // Create canvas and draw scaled image
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to JPEG with 75% quality for web optimization
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                    resolve(compressedDataUrl);
                };
                img.src = dataUrl;
            });
        };

        const handleFileUpload = async (event) => {
            const file = event.target.files[0];
            if (!file) return;
            if (!file.type.match('image.*')) {
                alert('Por favor sube una imagen válida.');
                return;
            }
            const reader = new FileReader();
            reader.onload = async (e) => {
                // Compress image before setting it
                const compressed = await compressImage(e.target.result);
                userPhoto.value = compressed;
            };
            reader.readAsDataURL(file);
        };

        const fetchAllCookies = async () => {
            try {
                const response = await fetch('https://galletizate.ealbinu.workers.dev/all');
                if (!response.ok) throw new Error('Failed to fetch cookies');
                
                const data = await response.json();
                const previousCount = allCookies.value.length;
                
                // Only add new cookies to physics world (don't re-add existing ones)
                if (cookiePhysics) {
                    data.forEach(cookie => {
                        // Only add if we haven't seen this URL before
                        if (!cookiePhysics.cookieBodies.has(cookie.url)) {
                            cookiePhysics.addCookie(cookie.url, false);
                        }
                    });
                }
                
                allCookies.value = data;
                console.log(`Fetched ${data.length} cookies (${data.length - previousCount} new)`);
            } catch (error) {
                console.error('Error fetching cookies:', error);
            }
        };

        const initPhysicsGallery = () => {
            if (!physicsCanvas.value) return;
            
            // Set canvas size
            const container = physicsCanvas.value.parentElement;
            physicsCanvas.value.width = container.clientWidth;
            physicsCanvas.value.height = container.clientHeight;
            
            // Initialize physics
            cookiePhysics = new CookiePhysics(physicsCanvas.value);
            
            // Fetch and add all cookies
            fetchAllCookies();
            
            // Start polling every 10 seconds
            cookiePollingInterval = setInterval(fetchAllCookies, 10000);
        };

        const sendImage = async () => {
            if (!userPhoto.value) return;
            isSending.value = true;
            isCooking.value = true;
            
            try {
                const response = await fetch('https://galletizate.ealbinu.workers.dev/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ image_base64: userPhoto.value })
                });
                
                if (!response.ok) throw new Error('Network response was not ok');
                
                const data = await response.json();
                
                if (data.rembg_url) {
                    cookieResult.value = data.rembg_url;
                    
                    // Play Oven Sound
                    const ovenSound = new Audio('assets/oven.mp3');
                    ovenSound.volume = 0.8;
                    ovenSound.play().catch(e => console.log("Oven sound play failed", e));
                    
                    // Add user's cookie to existing physics world (falls from top)
                    if (cookiePhysics) {
                        setTimeout(() => {
                            cookiePhysics.addCookie(data.rembg_url, true);
                        }, 500);
                    }
                    
                } else {
                    throw new Error('No image returned');
                }
            } catch (error) {
                console.error("Error generating cookie:", error);
                alert("Hubo un error al generar tu galleta. Por favor intenta de nuevo.");
            } finally {
                isCooking.value = false;
                isSending.value = false;
            }
        };
        
        const resetGalletizate = () => {
             userPhoto.value = null;
             cookieResult.value = null;
             isCooking.value = false;
             
             // Don't reset physics - keep it running
             
             if(fileInput.value) fileInput.value.value = '';
        };

        onMounted(() => {
            document.body.classList.add('no-scroll'); // Lock scroll initially
            document.documentElement.classList.add('no-scroll');
            
            new SnowEffect('snow-canvas');
            fireworks = new FireworksEffect('fireworks-canvas');
            
            initAudio();

            // Set up intersection observer for physics gallery
            const observerOptions = {
                root: null,
                rootMargin: '0px',
                threshold: 0.1
            };

            const physicsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && physicsCanvas.value) {
                        // Reload physics when entering viewport
                        if (cookiePhysics) {
                            cookiePhysics.destroy();
                            cookiePhysics = null;
                        }
                        setTimeout(() => {
                            initPhysicsGallery();
                        }, 150);
                    }
                });
            }, observerOptions);

            // Watch for physics canvas to appear
            const checkForPhysicsCanvas = setInterval(() => {
                if (physicsCanvas.value) {
                    const parent = physicsCanvas.value.parentElement;
                    if (parent && document.contains(parent)) {
                        try {
                            physicsObserver.observe(parent);
                        } catch (e) {
                            console.warn('Physics observer failed:', e);
                        }
                    }
                    clearInterval(checkForPhysicsCanvas);
                }
            }, 500);

            // Init Image Sequence
            if (sequenceCanvas.value) {
                sequenceManager = new ImageSequence({
                    canvas: sequenceCanvas.value
                }, (loaded, total) => {
                    loadingProgress.value = (loaded / total) * 100;
                    if (loaded === total) {
                        setTimeout(() => {
                             isReady.value = true;
                        }, 500); 
                    }
                });
            }

            // Initialize Lenis
            lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smooth: true
            });
            // Allow native scrolling; do not stop Lenis

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            lenis.on('scroll', (e) => {
                updateScroll(e.scroll);
            });
            
            // Initial render
            window.scrollTo(0, 0); // Ensure at top
            updateScroll(0);

            // Track viewport width changes
            window.addEventListener('resize', updateViewportWidth);
            updateViewportWidth();
        });

        onUnmounted(() => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', updateViewportWidth);
            }
        });

        return {
            sequenceCanvas,
            scrollProgress,
            showText1,
            showText2,
            showLogo,
            cardStyle,
            postalSceneStyle,
            
            // Loader
            isReady,
            hasStarted,
            loadingProgress,
            startExperience,
            
            // Audio
            audioLoaded,
            isPlaying,
            audioProgress,
            toggleAudio,
            seekAudio,

            // Galletizate
            fileInput,
            triggerFileInput,
            handleFileUpload,
            userPhoto,
            sendImage,
            isSending,
            isCooking,
            cookieResult,
            resetGalletizate,
            physicsCanvas,
            showPhysicsGallery,
            physicsHeight,
            isGalletizateOpen,
            showGalletizateButton,
            openGalletizate,
            closeGalletizate
        };
    }
}).mount('#app');
