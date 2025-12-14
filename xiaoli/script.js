// --- 配置参数 ---
const CANVAS_WIDTH = 840;
const CANVAS_HEIGHT = 680;
const CANVAS_CENTER_X = CANVAS_WIDTH / 2;
const CANVAS_CENTER_Y = CANVAS_HEIGHT / 2;
const IMAGE_ENLARGE = 11;
const HEART_COLOR = "#ff69b4"; // 使用更亮丽的 HotPink
const PI = Math.PI;

const LOVE_TEXT = "I LOVE 李淑婷"; 
const GENERATE_FRAME = 30; 
const MAIN_POINTS_COUNT = 500; 

const canvas = document.getElementById('heartCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// --- 核心数学函数 (升级版) ---

// 1. 基础心形生成
function heart_function(t, shrink_ratio = IMAGE_ENLARGE) {
    const sin = Math.sin;
    const cos = Math.cos;
    let x = 17 * (sin(t) ** 3);
    let y = -(16 * cos(t) - 5 * cos(2 * t) - 2 * cos(3 * t) - cos(4 * t));
    
    // 放大
    x *= shrink_ratio;
    y *= shrink_ratio;
    
    // 移到中心
    x += CANVAS_CENTER_X;
    y += CANVAS_CENTER_Y;
    
    return {x: x, y: y};
}

// 2. 内部散射 (核心升级：李洵效果的关键)
// 使用对数分布，让粒子产生“拉丝”和向内渗透的质感
function scatter_inside(x, y, beta = 0.15) {
    const ratio_x = -beta * Math.log(Math.random());
    const ratio_y = -beta * Math.log(Math.random());
    
    const dx = ratio_x * (x - CANVAS_CENTER_X);
    const dy = ratio_y * (y - CANVAS_CENTER_Y);
    
    return {
        x: x - dx,
        y: y - dy
    };
}

// 3. 跳动曲线
function curve(p) {
    return 2 * (2 * Math.sin(4 * p)) / (2 * PI);
}

// 4. 粒子抖动
function calc_position(x, y, ratio) {
    const force = 1 / (((x - CANVAS_CENTER_X) ** 2 + (y - CANVAS_CENTER_Y) ** 2) ** 0.520);
    
    const dx = ratio * force * (x - CANVAS_CENTER_X) + (Math.random() - 0.5) * 2;
    const dy = ratio * force * (y - CANVAS_CENTER_Y) + (Math.random() - 0.5) * 2;
    
    return {x: x - dx, y: y - dy};
}

// ------------------------------------

let frame = 0;

function draw() {
    // 1. 清除背景 (防止变粉)
    ctx.shadowBlur = 0; 
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // 这里的透明度控制拖尾长短
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 计算动画进度
    const p = frame / (GENERATE_FRAME / 2) * PI; 
    const ratio = 10 * curve(p); 
    const halo_radius = 4 + 6 * (1 + curve(p));
    
    // --- 开启发光 ---
    ctx.shadowColor = HEART_COLOR;
    ctx.fillStyle = HEART_COLOR;
    
    // 2. 绘制光晕 (Halo)
    ctx.shadowBlur = 5; 
    const halo_number = 3000 + 4000 * Math.abs(curve(p) ** 2);
    
    for (let i = 0; i < halo_number * 0.15; i++) { 
        const t = Math.random() * 2 * PI;
        let {x, y} = heart_function(t, -15); 
        
        // 光晕收缩逻辑
        const dx_center = x - CANVAS_CENTER_X;
        const dy_center = y - CANVAS_CENTER_Y;
        const distance = Math.sqrt(dx_center * dx_center + dy_center * dy_center);
        const force = -1 / (distance ** 1.2);
        
        x -= halo_radius * force * dx_center; 
        y -= halo_radius * force * dy_center;
        
        // 随机散开
        x += (Math.random() - 0.5) * 60; 
        y += (Math.random() - 0.5) * 60;
        
        const size = Math.random() < 0.3 ? 1.5 : 0.8; 
        ctx.fillRect(x, y, size, size);
    }

    // 3. 绘制主爱心 (核心层)
    ctx.shadowBlur = 3; 
    for (let i = 0; i < MAIN_POINTS_COUNT; i++) {
        const t = (i / MAIN_POINTS_COUNT) * 2 * PI;
        let {x, y} = heart_function(t); // 原始轮廓

        // A. 轮廓点
        let pos = calc_position(x, y, ratio);
        let size = Math.random() * 2 + 0.5;
        ctx.fillRect(pos.x, pos.y, size, size);
        
        // B. 内部粒子 (使用 scatter_inside 产生纹理)
        for (let j = 0; j < 3; j++) { // 边缘稍微散一下
             let scatter = scatter_inside(x, y, 0.05);
             let diffusion_pos = calc_position(scatter.x, scatter.y, ratio);
             ctx.fillRect(diffusion_pos.x, diffusion_pos.y, 1, 1);
        }
    }
    
    // 4. 绘制内部填充 (填充层 - 增加厚重感)
    // 随机取样点并在内部散射，让爱心看起来是实心的
    for (let k = 0; k < 4000; k++) {
         const t = Math.random() * 2 * PI;
         let {x, y} = heart_function(t); 
         // 强力向内散射
         let scatter = scatter_inside(x, y, 0.18); 
         let pos = calc_position(scatter.x, scatter.y, ratio);
         
         // 粒子更细小，像粉尘一样
         ctx.fillRect(pos.x, pos.y, 0.8, 0.8);
    }

    // --- 5. 绘制文字 ---
    ctx.font = "bold 22px 'Arial', sans-serif"; 
    ctx.textAlign = "center";    
    ctx.textBaseline = "middle"; 
    ctx.fillStyle = "#FFFFFF";  
    ctx.shadowColor = HEART_COLOR;
    ctx.shadowBlur = 10;
    ctx.fillText(LOVE_TEXT, CANVAS_CENTER_X, CANVAS_CENTER_Y);

    frame = (frame + 1) % GENERATE_FRAME;
    requestAnimationFrame(draw);
}

draw();
