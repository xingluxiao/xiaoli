// ==========================================
// --- 全屏配置 (自动获取屏幕大小) ---
// ==========================================
let CANVAS_WIDTH = window.innerWidth;
let CANVAS_HEIGHT = window.innerHeight;
let CANVAS_CENTER_X = CANVAS_WIDTH / 2;
let CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;

// 响应窗口大小变化（比如手机横屏时自动调整）
window.onresize = function() {
    CANVAS_WIDTH = window.innerWidth;
    CANVAS_HEIGHT = window.innerHeight;
    CANVAS_CENTER_X = CANVAS_WIDTH / 2;
    CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
};

const IMAGE_ENLARGE = 11;
const HEART_COLOR = "#ff69b4"; 
const PI = Math.PI;
const LOVE_TEXT = "I LOVE XiaoLI"; 
const GENERATE_FRAME = 30; 
const MAIN_POINTS_COUNT = 500; 

// 烟花颜色库
const FIREWORK_COLORS = [
    '255, 0, 0', '255, 220, 0', '0, 255, 255', 
    '255, 0, 255', '50, 255, 50', '255, 100, 0', '255, 255, 255'
];

let fireworks = []; 

const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
// 初始化画布大小
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ==========================================
// --- 爱心数学函数 ---
// ==========================================

function heart_function(t, shrink_ratio = IMAGE_ENLARGE) {
    const sin = Math.sin;
    const cos = Math.cos;
    let x = 17 * (sin(t) ** 3);
    let y = -(16 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t));
    x *= shrink_ratio; y *= shrink_ratio;
    x += CANVAS_CENTER_X; y += CANVAS_CENTER_Y;
    return {x: x, y: y};
}

function scatter_inside(x, y, beta = 0.15) {
    const ratio_x = -beta * Math.log(Math.random());
    const ratio_y = -beta * Math.log(Math.random());
    const dx = ratio_x * (x - CANVAS_CENTER_X);
    const dy = ratio_y * (y - CANVAS_CENTER_Y);
    return { x: x - dx, y: y - dy };
}

function curve(p) {
    return 2 * (2 * Math.sin(4 * p)) / (2 * PI);
}

function calc_position(x, y, ratio) {
    const force = 1 / (((x - CANVAS_CENTER_X) ** 2 + (y - CANVAS_CENTER_Y) ** 2) ** 0.520);
    const dx = ratio * force * (x - CANVAS_CENTER_X) + (Math.random() - 0.5) * 2;
    const dy = ratio * force * (y - CANVAS_CENTER_Y) + (Math.random() - 0.5) * 2;
    return {x: x - dx, y: y - dy};
}

// ==========================================
// --- 烟花粒子系统 ---
// ==========================================

class FireworkParticle {
    constructor(x, y, colorRGB) {
        this.x = x; this.y = y;
        this.oldX = x; this.oldY = y;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 16 + 4; 
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.12; 
        this.friction = 0.96; 
        this.colorRGB = colorRGB;
        this.alpha = 1;
        this.decay = Math.random() * 0.01 + 0.005; 
        this.lineWidth = Math.random() * 2 + 0.5;
        this.flicker = Math.random() < 0.5;
    }

    update() {
        this.oldX = this.x; this.oldY = this.y;
        this.vx *= this.friction; this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx; this.y += this.vy;
        this.alpha -= this.decay;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.moveTo(this.oldX, this.oldY);
        ctx.lineTo(this.x, this.y);
        let currentAlpha = this.alpha;
        if (this.flicker && Math.random() > 0.9) {
            currentAlpha = 1; 
            ctx.lineWidth = this.lineWidth + 2; 
        } else {
            ctx.lineWidth = this.lineWidth;
        }
        ctx.strokeStyle = `rgba(${this.colorRGB}, ${currentAlpha})`;
        ctx.stroke();
    }
}

function createExplosion(x, y) {
    const particleCount = 220; 
    let colorRGB;
    if (Math.random() < 0.3) {
        colorRGB = '255, 255, 255';
    } else {
        colorRGB = FIREWORK_COLORS[Math.floor(Math.random() * FIREWORK_COLORS.length)];
    }
    for (let i = 0; i < particleCount; i++) {
        fireworks.push(new FireworkParticle(x, y, colorRGB));
    }
}

// ------------------------------------

let frame = 0;

function draw() {
    ctx.globalCompositeOperation = 'source-over'; 
    ctx.shadowBlur = 0; 
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)'; 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 烟花触发概率
    if (Math.random() < 0.04) {
        let ex = Math.random() * CANVAS_WIDTH;
        let ey = Math.random() * CANVAS_HEIGHT * 0.8;
        // 简单的防遮挡，如果在中心文字附近，就移到两边
        if (Math.abs(ex - CANVAS_CENTER_X) < 150 && Math.abs(ey - CANVAS_CENTER_Y) < 150) {
             ex = Math.random() < 0.5 ? 150 : CANVAS_WIDTH - 150;
        }
        createExplosion(ex, ey);
    }

    const p = frame / (GENERATE_FRAME / 2) * PI; 
    const ratio = 10 * curve(p); 
    const halo_radius = 4 + 6 * (1 + curve(p));
    
    ctx.shadowColor = HEART_COLOR;
    ctx.fillStyle = HEART_COLOR;
    
    // 光晕
    ctx.shadowBlur = 5; 
    const halo_number = 3000 + 4000 * Math.abs(curve(p) ** 2);
    for (let i = 0; i < halo_number * 0.15; i++) { 
        const t = Math.random() * 2 * PI;
        let {x, y} = heart_function(t, -15); 
        const dx_center = x - CANVAS_CENTER_X;
        const dy_center = y - CANVAS_CENTER_Y;
        const distance = Math.sqrt(dx_center * dx_center + dy_center * dy_center);
        const force = -1 / (distance ** 1.2);
        x -= halo_radius * force * dx_center; y -= halo_radius * force * dy_center;
        x += (Math.random() - 0.5) * 60; y += (Math.random() - 0.5) * 60;
        const size = Math.random() < 0.3 ? 1.5 : 0.8; 
        ctx.fillRect(x, y, size, size);
    }

    // 主爱心
    ctx.shadowBlur = 3; 
    for (let i = 0; i < MAIN_POINTS_COUNT; i++) {
        const t = (i / MAIN_POINTS_COUNT) * 2 * PI;
        let {x, y} = heart_function(t); 
        let pos = calc_position(x, y, ratio);
        let size = Math.random() * 2 + 0.5;
        ctx.fillRect(pos.x, pos.y, size, size);
        for (let j = 0; j < 3; j++) { 
             let scatter = scatter_inside(x, y, 0.05);
             let diffusion_pos = calc_position(scatter.x, scatter.y, ratio);
             ctx.fillRect(diffusion_pos.x, diffusion_pos.y, 1, 1);
        }
    }
    
    // 内部填充
    for (let k = 0; k < 4000; k++) {
         const t = Math.random() * 2 * PI;
         let {x, y} = heart_function(t); 
         let scatter = scatter_inside(x, y, 0.18); 
         let pos = calc_position(scatter.x, scatter.y, ratio);
         ctx.fillRect(pos.x, pos.y, 0.8, 0.8);
    }

    // 文字
    ctx.font = "bold 22px 'Arial', sans-serif"; 
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; 
    ctx.fillStyle = "#FFFFFF"; ctx.shadowColor = HEART_COLOR; ctx.shadowBlur = 10;
    ctx.fillText(LOVE_TEXT, CANVAS_CENTER_X, CANVAS_CENTER_Y);

    // 绘制烟花
    ctx.globalCompositeOperation = 'lighter'; 
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].draw(ctx);
        if (fireworks[i].alpha <= 0) fireworks.splice(i, 1);
    }
    ctx.globalCompositeOperation = 'source-over';

    frame = (frame + 1) % GENERATE_FRAME;
    requestAnimationFrame(draw);
}

draw();
