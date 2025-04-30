<template>
    <canvas id="mihoyo_canvas" ref="canvas" :width="width" :height="height" class="three-canvas"></canvas>
</template>

<script>
export default {
    name: "ThreejsCanvas",
    props: {
        width: { type: Number, default: 800 },
        height: { type: Number, default: 600 },
        imageSrc: { type: String, default: null },
        enableControls: { type: Boolean, default: true },
    },
    data() {
        return {
            scene: null,
            camera: null,
            renderer: null,
            controls: null,
            meshes: [], // 存放所有动态添加的网格
            animationId: null,
            // 星星
            starGeo: null,
            starMat: null,
            stars: null,
            // 图标
            iconGroup: [],
            raycaster: null,
            mouse: null,
            hoveredGroup: null,
        };
    },
    mounted() {
        this.initThree();
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("click", this.onClick);
        this.animate();
    },
    beforeDestroy() {
        cancelAnimationFrame(this.animationId);
        window.addEventListener("mousemove", this.onMouseMove);
        window.addEventListener("click", this.onClick);
        this.renderer.dispose();
    },
    methods: {
        // 单位转换
        worldToPx(h_world) {
            const fovRad = (90 * Math.PI) / 180;
            const distance = Math.abs(this.camera.position.z - 0); // plane 在 z=0
            return (h_world * this.height) / (2 * Math.tan(fovRad / 2) * distance);
        },
        // 单位转换
        pxToWorld(h_px) {
            const fovRad = (90 * Math.PI) / 180;
            const distance = Math.abs(this.camera.position.z - 0);
            return (h_px * 2 * Math.tan(fovRad / 2) * distance) / this.height;
        },
        // 初始化场景
        initThree() {
            const canvas = document.querySelector("#mihoyo_canvas");
            this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);

            // 先导入或用 Math.PI
            const degToRad = (deg) => (deg * Math.PI) / 180;
            // PerspectiveCamera(垂直视角度数，)相机视角
            this.camera = new THREE.PerspectiveCamera(90, this.width / this.height, 0.1, 2000);
            this.camera.position.set(0, 3 / 5, 5 / 5);
            this.camera.rotation.set(degToRad(-30), 0, 0);
            this.camera.lookAt(0, 0, 0);
            // 场景对象
            this.scene = new THREE.Scene();
            // 背景
            new THREE.TextureLoader().load(require("../../../.vuepress/public/mihoyo/空月之歌/bg.jpg"), (tex) => {
                tex.encoding = THREE.sRGBEncoding; // 可选：校正色彩空间
                this.scene.background = tex;
            });

            const canvasPNG = this.getCanvas(1080, 0.6);
            const circleTexture = new THREE.CanvasTexture(canvasPNG);
            const spriteMat = new THREE.SpriteMaterial({
                map: circleTexture,
                transparent: true, // 纹理本身就含 alpha
                depthWrite: false, // 不写入深度缓存
                depthTest: true, // （可选）是否进行深度测试；一般留 true，让同层之间也能做遮挡
            });
            const circleSprite = new THREE.Sprite(spriteMat);
            circleSprite.scale.set(10, 10, 10);
            this.scene.add(circleSprite);
            // 交互
            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();
            // 渲染
            this.renderer.render(this.scene, this.camera);

            // this.animate()
        },
        /**
         * 动态添加图片对象
         * options = { src, x, y, z, width, height, rotationSpeed }
         */
        addImageObject(options) {
            const loader = new THREE.TextureLoader();
            loader.load(options.src, (texture) => {
                // —— 1. 色彩空间校正 ——
                // 如果你的原图是 sRGB 色域，则要让渲染器与材质都使用 sRGB 编码
                this.renderer.outputEncoding = THREE.sRGBEncoding;
                texture.encoding = THREE.sRGBEncoding;

                // —— 2. 启用 MIPMAP（多级贴图）并设置合适的滤波 ——
                // MIPMAP 在远距离或缩小时会自动切换到更合适的贴图级别，减少锯齿
                texture.generateMipmaps = true;
                // 放大时用线性插值（平滑）
                texture.magFilter = THREE.LinearFilter;
                // 缩小时用 MIPMAP 最近邻或线性：
                // THREE.LinearMipMapNearestFilter 会在 mipmap 级别间做最近邻，在单级内做线性
                texture.minFilter = THREE.LinearMipMapNearestFilter;

                // —— 3. 启用各向异性过滤 ——
                // 在斜视角度下各向异性过滤能显著提升清晰度
                const maxAniso = this.renderer.capabilities.getMaxAnisotropy();
                texture.anisotropy = maxAniso;

                // 3. 创建平面几何体与材质
                const w = this.pxToWorld(options.width);
                const h = this.pxToWorld(options.height);
                const geometry = new THREE.PlaneGeometry(w, h);

                const material = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true, // 打开透明通道
                    depthWrite: false, // 不写入深度缓存
                    depthTest: true, // （可选）是否进行深度测试；一般留 true，让同层之间也能做遮挡
                });
                // 注意：如果图片含透明通道，可加 transparent: true

                // 4. 创建 Mesh 并加入场景
                const rotate = options.rotate;
                const mesh = new THREE.Mesh(geometry, material);

                // 初始 scale 为 0
                mesh.scale.set(0, 0, 0);
                // 记录出现动画的开始时间和持续时长
                mesh.userData.appearStart = performance.now();
                mesh.userData.appearDuration = 2000 - 200 * this.meshes.length; // 单位 ms，比如 0.5s
                mesh.userData.targetScale = new THREE.Vector3(1, 1, 1);
                // 新增：设置 mesh 位置
                mesh.position.set(this.pxToWorld(options.x || 0), this.pxToWorld(options.y || 0), this.pxToWorld(options.z || 0));
                // 旋转
                if (rotate) {
                    const degToRad = (deg) => (deg * Math.PI) / 180;
                    mesh.rotation.set(
                        degToRad(rotate.x), // x 轴 90°
                        degToRad(rotate.y), // y 轴 45°
                        degToRad(rotate.z) // z 轴 0°
                    );
                }
                // 4) 分层：小数字先画，大数字后画
                //    例如：底图 layer=0；人物 layer=1；UI layer=2
                mesh.renderOrder = options.layer || 0;

                mesh.userData.animate = options.animate;
                if (options.iconList && options.iconList.length) {
                    this.addIcon(options.iconList, mesh);
                }
                this.meshes.push(mesh);
                this.scene.add(mesh);
                this.renderer.render(this.scene, this.camera);
            });
        },
        // 加载星星
        loadingStart() {
            const starCount = 2000 * 3;
            const radius = 500;

            const geometry = new THREE.BufferGeometry();
            const positions = new Float32Array(starCount * 3);
            const sizes = new Float32Array(starCount);

            for (let i = 0; i < starCount; i++) {
                // 随机球面分布
                const theta = Math.random() * 2 * Math.PI;
                const phi = Math.acos(2 * Math.random() - 1);
                const r = radius;

                positions[3 * i + 0] = r * Math.sin(phi) * Math.cos(theta);
                positions[3 * i + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[3 * i + 2] = r * Math.cos(phi);

                // 初始 size
                sizes[i] = Math.random() * 2 + 1;
            }

            geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

            // PointsMaterial 支持 vertexSizes 需打开 sizeAttenuation
            const material = new THREE.PointsMaterial({
                size: 1, // 基础大小，会被 attribute * sizeAttenuation 影响
                sizeAttenuation: true,
                transparent: true,
                opacity: 1,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexColors: false, // 我们不需要颜色，只更新 size
            });

            this.starGeo = geometry;
            this.starMat = material;
            this.stars = new THREE.Points(geometry, material);
            this.scene.add(this.stars);
        },
        /**
         * 批量添加图标的方法
         * @param {Array} iconDataList - 图标数据列表，每项包含 { icon, backImg, callback }
         * @param {Number} radius - 圆环布局的半径
         * @param {Number} startAngle - 起始角度（单位：度）
         */
        addIcon(iconDataList, mesh) {
            // 遍历图标数据列表，为每个图标创建平面
            iconDataList.forEach((data, index) => {
                const { width, height, x, y, z } = data;
                // a. 加载默认状态纹理和悬停状态纹理
                const icon = new THREE.TextureLoader().load(data.icon);
                const background = new THREE.TextureLoader().load(require("../../../.vuepress/public/mihoyo/空月之歌/swiper_bg.png"));
                const backgroundSelect = new THREE.TextureLoader().load(data.backgroundSelect);

                // 创建 SpriteMaterial，使精灵永远面向相机
                // 1 默认背景
                const spriteDefault = new THREE.SpriteMaterial({
                    map: background,
                    transparent: true,
                    depthWrite: false, // 不写入深度缓存
                    depthTest: true, // （可选）是否进行深度测试；一般留 true，让同层之间也能做遮挡
                });
                const defaultBgSprite = new THREE.Sprite(spriteDefault);
                defaultBgSprite.scale.set(this.pxToWorld(width), this.pxToWorld(height), 1);
                // 2. 悬停背景（select），初始隐藏
                const selBgMat = new THREE.SpriteMaterial({
                    map: backgroundSelect,
                    transparent: true,
                    opacity: 0.5,
                    depthWrite: false, // 不写入深度缓存
                    depthTest: true, // （可选）是否进行深度测试；一般留 true，让同层之间也能做遮挡
                });
                const hoverBgSprite = new THREE.Sprite(selBgMat);
                hoverBgSprite.scale.set(this.pxToWorld(width), this.pxToWorld(height), 1);
                hoverBgSprite.visible = false;
                // 3 图标中心
                const spriteIcon = new THREE.SpriteMaterial({
                    map: icon,
                    transparent: true,
                    depthWrite: false, // 不写入深度缓存
                    depthTest: true, // （可选）是否进行深度测试；一般留 true，让同层之间也能做遮挡
                });
                const iconSprite = new THREE.Sprite(spriteIcon);
                iconSprite.scale.set(this.pxToWorld(width * 0.9), this.pxToWorld(height * 0.9), 1);

                // 设置图标初始尺寸 (可根据实际图片比例微调)/背景
                const canvas = this.getCanvas(240, 0.7);
                const circleTexture = new THREE.CanvasTexture(canvas);
                const spriteMat = new THREE.SpriteMaterial({
                    map: circleTexture,
                    transparent: true, // 纹理本身就含 alpha
                    depthWrite: false, // 不写入深度缓存
                    depthTest: true, // （可选）是否进行深度测试；一般留 true，让同层之间也能做遮挡
                });
                const circleSprite = new THREE.Sprite(spriteMat);
                circleSprite.scale.set(this.pxToWorld(width * 0.8), this.pxToWorld(height * 0.8), 1);

                // 4. 把三者组合到一个 Group
                const iconGroup = new THREE.Group();
                iconGroup.add(circleSprite);
                iconGroup.add(defaultBgSprite);
                iconGroup.add(hoverBgSprite);
                iconGroup.add(iconSprite);
                // 图片位置
                iconGroup.position.set(this.pxToWorld(x || 0), this.pxToWorld(y || 0), this.pxToWorld(z || 0));
                iconGroup.userData = data;
                // 初始整体 scale 为 0
                iconGroup.scale.set(0, 0, 0);
                // 记录 appear 动画
                iconGroup.userData.appearStart = performance.now();
                iconGroup.userData.appearDuration = 2000; // ms
                iconGroup.userData.targetScale = new THREE.Vector3(1, 1, 1);
                // 给图片新增icon
                this.iconGroup.push(iconGroup);
                mesh.add(iconGroup);
                this.renderer.render(this.scene, this.camera);
            });
        },
        // 动画函数
        animate() {
            this.animationId = requestAnimationFrame(this.animate);
            // 环绕旋转
            if (this.stars) {
                this.stars.rotation.y -= 0.0001;
            }

            // 星星闪烁
            if (this.starGeo) {
                const sizes = this.starGeo.attributes.size.array;
                for (let i = 0; i < sizes.length; i++) {
                    // 在 [0.5, 2.5] 之间抖动
                    sizes[i] = 1 + Math.sin(performance.now() * 0.002 + i) * Math.random();
                }
                this.starGeo.attributes.size.needsUpdate = true;
            }

            // 更新所有 mesh 的动画
            this.meshes.forEach((mesh) => {
                this.activeAnimate(mesh, this.camera);
            });
            this.renderer.render(this.scene, this.camera);
        },
        // 递归执行动画
        activeAnimate(node, camera) {
            const now = performance.now();

            // —— 出现动画插值 ——
            if (node.userData.appearStart != null) {
                const t0 = node.userData.appearStart;
                const d = node.userData.appearDuration;
                const u = Math.min((now - t0) / d, 1); // [0,1]
                const target = node.userData.targetScale;
                // 线性插值 scale
                node.scale.set(target.x * u, target.y * u, target.z * u);
                if (u >= 1) {
                    // 完成后，清理标记
                    delete node.userData.appearStart;
                    delete node.userData.appearDuration;
                    delete node.userData.targetScale;
                }
            }

            if (node.userData.animate) {
                node.userData.animate(node, camera);
            }
            if (node.children && node.children.length) {
                node.children.forEach((item, index) => {
                    this.activeAnimate(item, camera);
                });
            }
        },
        // 获取背景滤镜
        getCanvas(sizeNum, opacity) {
            const size = sizeNum || 240; // 纹理分辨率
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            const ctx = canvas.getContext("2d");

            // 清空并绘制半透明圆
            ctx.clearRect(0, 0, size, size);
            ctx.fillStyle = `rgba(0,0,0,${opacity || 0.5})`; // 白色 50% 透明
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.fill();
            return canvas;
        },
        onMouseMove(event) {
            // 1. 计算鼠标归一化坐标
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            // 2. 射线检测所有 iconGroup 中的 sprite（假设 iconSprite 在 group.children 索引最后）
            this.raycaster.setFromCamera(this.mouse, this.camera);
            const intersects = [];
            this.iconGroup.forEach((group) => {
                group.children.forEach((child) => {
                    if (child instanceof THREE.Sprite) {
                        intersects.push(...this.raycaster.intersectObject(child));
                    }
                });
            });

            // 3. 还原上一个悬停状态
            if (this.hoveredGroup) {
                const { children } = this.hoveredGroup;
                // children: [circleSprite, defaultBgSprite, hoverBgSprite, iconSprite]
                children[2].visible = false; // 关闭 hoverBgSprite
                children[3].scale.copy(children[3].userData.baseScale); // 恢复 iconSprite 缩放
                this.hoveredGroup = null;
                document.body.style.cursor = "";
            }

            // 4. 如果有命中，激活新的悬停
            if (intersects.length) {
                const hit = intersects[0].object;
                const group = hit.parent; // Sprite 的 parent 就是 iconGroup
                const [, defaultBg, hoverBg, iconSprite] = group.children;
                // 记录 iconSprite 原始大小
                if (!iconSprite.userData.baseScale) {
                    iconSprite.userData.baseScale = iconSprite.scale.clone();
                }
                hoverBg.visible = true;
                iconSprite.scale.copy(iconSprite.userData.baseScale).multiplyScalar(1.2);
                this.hoveredGroup = group;
                document.body.style.cursor = "pointer";
            }
        },
        onClick() {},
    },
};
</script>

<style scoped>
.three-canvas {
    width: 100% !important;
    height: 100% !important;
    display: block;
}
</style>
