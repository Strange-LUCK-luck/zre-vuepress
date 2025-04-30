<template>
    <div class="container" :style="{ width: this.isMobile ? boxWidth + 'px' : '100vw', height: this.isMobile ? boxHeight + 'px' : '100vh' }">
        <div class="video-box" ref="loading_box" :style="{ width: boxWidth + 'px', height: boxHeight + 'px' }">
            <canvasRender class="canvas_box" ref="canvas_render" :height="boxHeight" :width="boxWidth" v-if="progress === 100 && isThreeLoaded" :class="{ first: progress === 100 }"></canvasRender>
            <div class="loading-content" :data-progress="progress">
                <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" :style="{ display: progress === 100 ? 'none' : 'block' }">
                    <defs>
                        <mask id="fanMask">
                            <rect width="200" height="200" fill="black"></rect>
                            <path :d="backPath" fill="white"></path>
                        </mask>
                    </defs>
                    <image href="../../../.vuepress/public/mihoyo/空月之歌/loading-center.png" width="200" height="200" mask="url(#fanMask)"></image>
                </svg>
                <span class="loading-progress">{{ progress }}%</span>
            </div>
        </div>
    </div>
</template>

<script>
import canvasRender from "./canvas.vue";
const swiper_urls = [
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_1.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_2.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_3.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_4.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_5.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_6.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_7.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_8.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_9.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_10.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_11.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_bg.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/swiper_bg_select.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/bg.jpg"),
    require("../../../.vuepress/public/mihoyo/空月之歌/streamer.png"),
];
const bg_urls = [require("../../../.vuepress/public/mihoyo/空月之歌/point_tint.png")];
const star_compass_urls = [
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_phone_niequan_b.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_c_2.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_d_2.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_phone_quan_a.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_top.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_a.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_d.png"),
];
export default {
    name: "index", // 这个名字推荐：大写字母开头驼峰法命名
    dicts: [], //数据字典this.dict.type[name]调用
    components: { canvasRender },
    directives: {},
    mixins: [],
    data() {
        return {
            isMobile: false, // 判断是否手机
            boxWidth: 0, //div宽度
            boxHeight: 0, //div高度
            rootFontPx: 0, //rem大小
            progress: 0, //加载进度
            imgNodes: {},
            isThreeLoaded: false,
        };
    },
    computed: {
        backPath() {
            const progress = this.progress;
            // 计算终点坐标
            const endX = 100 + 100 * Math.sin((progress * Math.PI) / 50);
            const endY = 100 - 100 * Math.cos((progress * Math.PI) / 50);
            return `M100,100 v-100 A 100 100 0 1 1 ${endX} ${endY} Z`;
        },
    },
    watch: {},
    created() {},
    mounted() {
        this.loadThree();
        this.onResize();
        window.addEventListener("resize", this.onResize);
        window.addEventListener("orientationchange", this.onResize);

        this.loadImagesWithProgress();
    },
    activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
    beforeCreate() {}, //生命周期 - 创建之前
    beforeMount() {}, //生命周期 - 挂载之前
    beforeUpdate() {}, //生命周期 - 更新之前
    updated() {}, //生命周期 - 更新之后
    beforeDestroy() {
        window.removeEventListener("resize", this.onResize);
        window.removeEventListener("orientationchange", this.onResize);
    }, //生命周期 - 销毁之前
    destroyed() {}, //生命周期 - 销毁完成
    methods: {
        // 加载three.js
        loadThree() {
            // 创建 script 元素
            const script = document.createElement("script");
            script.src = "https://cdn.jsdelivr.net/npm/three@latest/build/three.min.js";
            script.type = "text/javascript";
            script.onload = () => {
                this.isThreeLoaded = true; // 脚本加载完成后，允许渲染子组件
                this.renderChildren();
            };
            script.onerror = (err) => {
                console.error("Error loading Three.js:", err);
            };
            document.head.appendChild(script);
            document.body.style.background = `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAABlBMVEUAAAAICAhtdupNAAAAG0lEQVQI12NIYGD4AEJABggwMzCwN4AQM4gHAEmsA7V6aMfAAAAAAElFTkSuQmCC) repeat center center`;
            document.body.style.backgroundSize = "0.1rem 0.1rem";
            document.body.style.color = "#333";
        },
        // 判断是不是手机端
        detectMobile() {
            this.isMobile = /Android|webOS|iPhone|iPod|BlackBerry|Mobile/i.test(navigator.userAgent);
        },
        // 手机端给body翻转
        applyBodyRotation() {
            if (this.isMobile) {
                const vh = window.innerHeight;
                document.body.style.margin = "0px";
                document.body.style.transform = "rotate(90deg)";
                document.body.style.transformOrigin = "center center";
                document.body.style.position = "fixed";
                document.body.style.top = (vh - this.boxHeight) / 2 + "px";
                document.body.style.left = "-" + (this.boxWidth - this.boxHeight) / 2 + "px";
                document.body.style.width = this.boxWidth + "px";
                document.body.style.height = this.boxHeight + "px";
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.transform = "";
                document.body.style.position = "";
                document.body.style.width = "";
                document.body.style.height = "";
                document.body.style.overflow = "";
            }
        },
        // 宽高动态变化
        onResize() {
            this.detectMobile();
            // 1. 视口宽高，旋转后要对调
            const vw = window.innerWidth;
            const vh = window.innerHeight;
            const cw = this.isMobile ? vh : vw;
            const ch = this.isMobile ? vw : vh;

            // 2. 算出最大 2560:1271 区域
            const ratio = 2083.33 / 900;
            let w, h;
            if (cw / ch > ratio) {
                h = ch;
                w = h * ratio;
            } else {
                w = cw;
                h = w / ratio;
            }
            this.boxWidth = this.isMobile ? cw : w;
            this.boxHeight = this.isMobile ? ch : h;
            this.applyBodyRotation();

            // 3. 根据 boxWidth 动态设置根字体，1600px 对应 19.2rem
            const baseWidth = 1600;
            const baseFontPx = 19.2;
            const person = baseWidth / baseFontPx;
            this.rootFontPx = (w / baseWidth) * person;
            document.documentElement.style.fontSize = this.rootFontPx + "px";
        },
        // 加载图片
        loadImagesWithProgress() {
            let swiper = new Array(10);
            let swiperBg = new Array(2);
            let starCompass = new Array(6);
            let backImg = new Array(6);
            const swiperURL = swiper_urls;
            const bg = bg_urls;
            const star_compass = star_compass_urls;
            const length = swiperURL.length + bg.length + star_compass.length;
            let count = 0;
            swiperURL.forEach((item, index) => {
                const img = new Image();
                img.onload = () => {
                    if (index <= 10) {
                        swiper.splice(index, 1, this.getBaseURI(img));
                    } else if (index === 11) {
                        swiperBg.splice(0, 1, this.getBaseURI(img));
                    } else if (index === 11) {
                        swiperBg.splice(1, 1, this.getBaseURI(img));
                    }
                    count += 1;
                    this.progress = Math.round((count / length) * 100);
                    this.renderChildren();
                };
                img.src = item;
            });
            bg.forEach((item, index) => {
                const img = new Image();
                img.onload = () => {
                    backImg.splice(index, 1, this.getBaseURI(img));
                    count += 1;
                    this.progress = Math.round((count / length) * 100);
                    this.renderChildren();
                };
                img.src = item;
            });
            star_compass.forEach((item, index) => {
                const img = new Image();
                img.onload = () => {
                    starCompass.splice(index, 1, this.getBaseURI(img));
                    count += 1;
                    this.progress = Math.round((count / length) * 100);
                    this.renderChildren();
                };
                img.src = item;
            });
            this.imgNodes = {
                backImg,
                starCompass,
                swiper,
                swiperBg,
            };
        },
        // 判断是否渲染
        renderChildren() {
            console.log("this.boxWidth,this.boxHeight :>> ", this.boxWidth, this.boxHeight);
            if (this.progress === 100 && this.isThreeLoaded) {
                if (window.THREE) {
                    setTimeout(() => {
                        this.canvasRender();
                    }, 0);
                } else {
                    setTimeout(() => {
                        this.renderChildren();
                    }, 0);
                }
            }
        },
        // 渲染图片
        canvasRender() {
            // 星星
            this.$refs.canvas_render.loadingStart();
            // 旋转盘
            const starCompass = this.imgNodes.starCompass || [];
            const swiperBg = this.imgNodes.swiperBg || [];
            starCompass.forEach((image, index) => {
                let item = this.getRenderConfig("starCompass", index);
                item.src = image;
                if (index === 5) {
                    item.iconList = this.imgNodes.swiper
                        .filter((node, iconIndex) => iconIndex < 3)
                        .map((node, iconIndex) => {
                            const newNode = this.getRenderConfig("swiper", iconIndex);
                            newNode.icon = node;
                            newNode.background = swiperBg[0];
                            newNode.backgroundSelect = swiperBg[1];
                            return newNode;
                        });
                } else if (index === 6) {
                    item.iconList = this.imgNodes.swiper
                        .filter((node, iconIndex) => iconIndex >= 3)
                        .map((node, iconIndex) => {
                            const newNode = this.getRenderConfig("swiper", iconIndex + 3);
                            newNode.icon = node;
                            newNode.background = swiperBg[0];
                            newNode.backgroundSelect = swiperBg[1];
                            return newNode;
                        });
                }
                this.$refs.canvas_render.addImageObject(item);
            });
        },
        // 获取渲染配置
        getRenderConfig(type, index) {
            let width, height, animate, x, y, z, rotate, layer, radius, startAngle;
            if (type === "starCompass") {
                x = -(this.boxHeight / 7.9);
                y = this.boxHeight / 3.95;
                if (index === 5) {
                    width = this.boxHeight * 0.55;
                    animate = (img, dt) => {
                        img.rotation.z += 0.0006;
                    };
                } else if (index === 1) {
                    width = this.boxHeight * 0.605;
                    animate = (img, dt) => {
                        img.rotation.z -= 0.0005;
                    };
                } else if (index === 6) {
                    ///
                    width = this.boxHeight * 0.875;
                    animate = (img, dt) => {
                        img.rotation.z += 0.0005;
                    };
                } else if (index === 2) {
                    width = this.boxHeight * 0.825;
                    animate = (img, dt) => {
                        img.rotation.z -= 0.0004;
                    };
                } else if (index === 0) {
                    width = this.boxHeight * 0.066;
                    animate = (img, dt) => {};
                } else if (index === 3) {
                    width = this.boxHeight * 1.122;
                    animate = (img, dt) => {
                        img.rotation.z += 0.00055;
                    };
                } else if (index === 4) {
                    width = this.boxHeight * 0.242;
                    y = this.boxHeight / 3.95 + 1;
                    animate = (img, dt) => {
                        img.position.x = 0.5;
                    };
                }
                rotate = {
                    x: -79,
                    y: -10,
                    z: 0,
                };
                height = width;
                layer = index;
            } else if (type === "backImg") {
                width = this.boxWidth * 1.2;
                height = this.boxHeight * 1.2;
                rotate = {
                    x: -30,
                    y: 0,
                    z: 0,
                };
            } else if (type === "swiper") {
                width = this.boxHeight/15.8;
                height = this.boxHeight/15.8;
                if (index < 3) {
                    const r = this.boxHeight * 0.275 - 100;
                    const degree = (360 / 3) * index;
                    const radian = degree * (Math.PI / 180);
                    x = r * Math.cos(radian);
                    y = r * Math.sin(radian);
                    z = 20;
                } else {
                    const r = this.boxHeight * 0.4375 - 50;
                    const degree = (360 / 8) * (index - 3);
                    const radian = degree * (Math.PI / 180);
                    x = r * Math.cos(radian);
                    y = r * Math.sin(radian);
                    z = 20;
                }
                animate = (img, dt) => {
                    img.rotation.y += 0.0006;
                };
            }
            return {
                src: "",
                iconList: [],
                width,
                height,
                animate,
                x,
                y,
                z,
                rotate,
                layer,
                radius,
                startAngle,
            };
        },
        // img转换成baseURL
        getBaseURI(img) {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            const dataURI = canvas.toDataURL("image/png"); // 可改为 'image/jpeg'
            return dataURI;
        },
    },
};
</script>
<style scoped>
.container {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}
.video-box {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: translate(-50%, -50%);
}
.loading-content {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 2.9rem;
    height: 2.9rem;
    transform: translate(-50%, -50%);
    animation: loading_show 1s;
    z-index: 10;
}
.canvas_box {
    z-index: 5;
}
.first {
    z-index: 99;
}
.loading-content::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.2;
    background: url(../../../.vuepress/public/mihoyo/空月之歌/loading.png) no-repeat center;
    background-size: contain;
}
.loading-content[data-progress="100"]:before {
    opacity: 0;
}
.loading-content[data-progress="100"] .loading-progress {
    opacity: 0;
}
.loading-progress {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    text-align: center;
    color: #fff;
    margin-top: 0.35rem;
    font-size: 0.16rem;
}
.loading-content svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
@keyframes loading_show {
    0% {
        opacity: 0;
    }
}
</style>
<style>
html {
    height: 100%;
}
body {
    height: 100%;
}
</style>