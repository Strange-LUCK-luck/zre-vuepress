<template>
    <canvas id="mihoyo-canvas" ref="canvas" :width="width" :height="height" @mousemove="onMouseMove" @mouseleave="onMouseLeave"></canvas>
</template>

<script>
export default {
    name: "Canvas",
    props: {
        width: {
            type: Number,
            default: 800,
        },
        height: {
            type: Number,
            default: 600,
        },
        autoStart: {
            type: Boolean,
            default: true,
        },
        // 透视距离，用于 3D 缩放计算
        focalLength: {
            type: Number,
            default: 500,
        },
    },
    data() {
        return {
            ctx: null,
            objects: [], // 存放所有渲染对象
            rafId: null,
            lastTime: 0,
            mousePos: { x: 0, y: 0 },
        };
    },
    mounted() {
        this.ctx = this.$refs.canvas.getContext("2d");
        if (this.autoStart) {
            this.lastTime = performance.now();
            this.loop(this.lastTime);
        }
    },
    beforeDestroy() {
        cancelAnimationFrame(this.rafId);
    },
    methods: {
        /**
         * 添加一个渲染对象
         * obj = { img: Image|URL, x, y, z, width, height, rotation, animate, onMouseEnter, onMouseLeave }
         */
        addImageObject(obj) {
            const record = {
                x: obj.x || 0,
                y: obj.y || 0,
                z: obj.z || 0,
                width: obj.width || 100,
                height: obj.height || 100,
                rotation: obj.rotation || 0, // 旋转弧度
                rotateX: obj.rotateX || 0,
                rotateY: obj.rotateY || 0,
                animate: typeof obj.animate === "function" ? obj.animate : null,
                animateInterval: typeof obj.animateInterval === "number" ? obj.animateInterval : 16, // 默认约 60fps
                lastAnimateTime: 0,
                onMouseEnter: typeof obj.onMouseEnter === "function" ? obj.onMouseEnter : null,
                onMouseLeave: typeof obj.onMouseLeave === "function" ? obj.onMouseLeave : null,
                isHover: false,
                img: null,
            };
            if (typeof obj.img === "string") {
                const image = new Image();
                image.onload = () => {
                    record.img = image;
                };
                image.src = obj.img;
            } else {
                record.img = obj.img;
            }
            this.objects.push(record);
            return record;
        },

        // 渲染循环
        loop(now) {
            const dt = now - this.lastTime;
            this.lastTime = now;

            this.objects.forEach((o) => {
                if (o.animate) {
                    if (!o.lastAnimateTime) o.lastAnimateTime = now;
                    if (now - o.lastAnimateTime >= o.animateInterval) {
                        o.animate(o, now - o.lastAnimateTime);
                        o.lastAnimateTime = now;
                    }
                }
            });

            this.renderAll();
            this.rafId = requestAnimationFrame(this.loop);
        },

        // 渲染所有对象，支持 3D 缩放 & 旋转
        renderAll() {
            const ctx = this.ctx;
            const { width, height, focalLength } = this;

            ctx.clearRect(0, 0, width, height);
            const centerX = width / 2;
            const centerY = height / 2;

            // 设置倾斜角度（以弧度为单位）
            const angle = (30 * Math.PI) / 180; // 30 度转换为弧度

            // 保存初始状态
            ctx.save();

            // 平移画布使原点居中
            ctx.translate(centerX, centerY);

            // 绘制原始坐标轴（红色虚线）
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.moveTo(-width / 2, 0);
            ctx.lineTo(width / 2, 0);
            ctx.stroke(); // X 轴

            ctx.strokeStyle = "blue";
            ctx.beginPath();
            ctx.moveTo(0, -height / 2);
            ctx.lineTo(0, height / 2);
            ctx.stroke(); // Y 轴

            // 恢复线型
            ctx.setLineDash([]);

            // 应用变换（X 轴倾斜）
            ctx.transform(1, 0, Math.tan(angle), 1, 0, 0);

            // 绘制变换后的坐标轴（实线）
            ctx.strokeStyle = "green";
            ctx.beginPath();
            ctx.moveTo(-width / 2, 0);
            ctx.lineTo(width / 2, 0);
            ctx.stroke(); // 变换后的 X 轴

            ctx.strokeStyle = "purple";
            ctx.beginPath();
            ctx.moveTo(0, -height / 2);
            ctx.lineTo(0, height / 2);
            ctx.stroke(); // 变换后的 Y 轴

            // 恢复初始状态
            ctx.restore();

            this.objects
                .slice()
                .sort((a, b) => a.z - b.z)
                .forEach((o) => {
                    if (!o.img) return;
                    // 计算透视缩放
                    const scale = focalLength / (focalLength + o.z);
                    const sw = o.width * scale;
                    const sh = o.height * scale;
                    // // 投影屏幕坐标
                    // const sx = centerX + (o.x - centerX) * scale;
                    // const sy = centerY + (o.y - centerY) * scale;

                    // ctx.save();
                    // ctx.translate(sx + sw / 2, sy + sh / 2);

                    // const rad = ((o.rotateX || 0) * Math.PI) / 180;
                    // const radY = ((o.rotateY || 0) * Math.PI) / 180;
                    // ctx.transform(1, 0, Math.tan(rad), 1, 0, 0);
                    // ctx.transform(1, Math.tan(radY), 0, 1, 0, 0);
                    // ctx.rotate(o.rotation);
                    // ctx.drawImage(o.img, -sw / 2, -sh / 2, sw, sh);
                    // ctx.restore();

                });
        },

        onMouseMove(event) {
            const rect = this.$refs.canvas.getBoundingClientRect();
            const mx = event.clientX - rect.left;
            const my = event.clientY - rect.top;
            const { width, height, focalLength } = this;
            const centerX = width / 2;
            const centerY = height / 2;

            this.objects.forEach((o) => {
                const scale = focalLength / (focalLength + o.z);
                const sw = o.width * scale;
                const sh = o.height * scale;
                const sx = centerX + (o.x - centerX) * scale;
                const sy = centerY + (o.y - centerY) * scale;
                const inside = mx >= sx && mx <= sx + sw && my >= sy && my <= sy + sh;

                if (inside && !o.isHover) {
                    o.isHover = true;
                    o.onMouseEnter && o.onMouseEnter(o);
                } else if (!inside && o.isHover) {
                    o.isHover = false;
                    o.onMouseLeave && o.onMouseLeave(o);
                }
            });
        },

        onMouseLeave() {
            this.objects.forEach((o) => {
                if (o.isHover) {
                    o.isHover = false;
                    o.onMouseLeave && o.onMouseLeave(o);
                }
            });
        },
    },
};
</script>

<style scoped>
#mihoyo-canvas {
    position: absolute;
    left: 0;
    top: 0;
    width: 100% !important;
    height: 100% !important;
    visibility: visible;
}
</style>
