// --- 配置参数 ---
const CANVAS_WIDTH = 840;
const CANVAS_HEIGHT = 680;
const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
const IMAGE_ENLARGE = 11;
const HEART_COLOR = "hotpink"; 
const PI = Math.PI;

// 可以在这里修改你想显示的文字
const LOVE_TEXT = "I LOVE 李淑婷"; 

const GENERATE_FRAME = 30; 
const MAIN_POINTS_COUNT = 500; 

// 获取 Canvas 和绘图上下文
const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// --- 数学函数 (保持不变) ---
function heart_function(t, shrink_ratio = IMAGE_ENLARGE) {
    const sin = Math.sin;
    const cos = Math.cos;
    let x = 17 * (sin(t) ** 3);
    let y = -(16 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t));
    x = x * shrink_ratio + CANVAS_CENTER_X;
    y = y * shrink_ratio + CANVAS_CENTER_Y;
    return {x: x, y: y};
}

function curve(p) {
    return 2 * (2 * Math.sin(4 * p)) / (2 * PI);
}

function calc_position(x, y, ratio) {
    const dx_center = x - CANVAS_CENTER_X;
    const dy_center = y - CANVAS_CENTER_Y;
    const distance_sq = dx_center * dx_center + dy_center * dy_center;
    if (distance_sq < 1e-6) return {x, y}; 
    const force = 1 / (distance_sq ** 0.420);
    const dx = ratio * force * dx_center + (Math.random() - 0.5) * 0.3; 
    const dy = ratio * force * dy_center + (Math.random() - 0.5) * 0.3;
    return {x: x - dx, y: y - dy};
}

// ------------------------------------

let frame = 0;

function draw() {
    // 1. 绘制背景
    ctx.shadowBlur = 0; 
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; 
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 计算当前帧进度
    const p = frame / (GENERATE_FRAME / 2) * PI; 
    const ratio = 10 * curve(p); 
    const halo_radius = 4 + 6 * (1 + curve(p));
    
    // --- 重新开启发光效果 ---
    ctx.shadowColor = HEART_COLOR;
    ctx.fillStyle = HEART_COLOR;
    
    // 2. 绘制光晕粒子 
    ctx.shadowBlur = 5; 
    const halo_number = 3000 + 4000 * Math.abs(curve(p) ** 2);
    
    for (let i = 0; i < halo_number * 0.2; i++) { 
        const t = Math.random() * 2 * PI;
        let {x, y} = heart_function(t, -15); 
        const dx_center = x - CANVAS_CENTER_X;
        const dy_center = y - CANVAS_CENTER_Y;
        const distance = Math.sqrt(dx_center * dx_center + dy_center * dy_center);
        const force = -1 / (distance ** 1.2);
        const shrink_dx = halo_radius * force * dx_center;
        const shrink_dy = halo_radius * force * dy_center;
        x -= shrink_dx; y -= shrink_dy;
        x += Math.random() * 60 - 30; y += Math.random() * 60 - 30;
        const size = Math.random() < 0.33 ? 2 : 1; 
        ctx.fillRect(x, y, size, size);
    }

    // 3. 绘制主爱心和扩散粒子
    ctx.shadowBlur = 3; 
    for (let i = 0; i < MAIN_POINTS_COUNT; i++) {
        const t = (i / MAIN_POINTS_COUNT) * 2 * PI;
        let {x, y} = heart_function(t, IMAGE_ENLARGE);
        let pos = calc_position(x, y, ratio);
        let size = Math.floor(Math.random() * 3) + 1;
        ctx.fillRect(pos.x, pos.y, size, size);
        for (let j = 0; j < 30; j++) { 
            let dx = (Math.random() - 0.5) * 40; 
            let dy = (Math.random() - 0.5) * 40;
            let diffusion_pos = calc_position(pos.x + dx, pos.y + dy, ratio * 0.3); 
            let d_size = Math.floor(Math.random() * 2) + 1; 
            ctx.fillRect(diffusion_pos.x, diffusion_pos.y, d_size, d_size);
        }
    }

    // --- 4. 绘制文字 (位置改为正中心，颜色改为白色以突出显示) ---
    // 修改为 22px 的字体
    ctx.font = "bold 22px 'Arial', sans-serif"; 
    ctx.textAlign = "center";    
    ctx.textBaseline = "middle"; 
    
    // 文字颜色设为白色，发光保持粉色
    ctx.fillStyle = "#FFFFFF";  
    ctx.shadowColor = HEART_COLOR;
    ctx.shadowBlur = 10;
    
    // 使用 CANVAS_CENTER_Y 直接在垂直居中位置绘制
    ctx.fillText(LOVE_TEXT, CANVAS_CENTER_X, CANVAS_CENTER_Y);

    // 5. 更新帧数并请求下一帧
    frame = (frame + 1) % GENERATE_FRAME;
    requestAnimationFrame(draw);
}

// 启动动画
draw();