<template>
    <div class="container" :style="{ width: this.isMobile ? boxWidth + 'px' : '100vw', height: this.isMobile ? boxHeight + 'px' : '100vh' }">
        <div class="video-box" ref="loading_box" :style="{ width: boxWidth + 'px', height: boxHeight + 'px' }">
            <canvasRender class="canvas_box" ref="canvas_render" :height="boxHeight" :width="boxWidth" :focalLength="boxWidth" :class="{ first: progress === 100 }"></canvasRender>
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
];
const bg_urls = [
    require("../../../.vuepress/public/mihoyo/空月之歌/streamer.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_a.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_c_2.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_d.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_d_2.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_e.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_top.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_lp_xiaopan.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_phone_niequan_b.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/p2_phone_quan_a.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/point_tint.png"),
    require("../../../.vuepress/public/mihoyo/空月之歌/bg.jpg"),
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
            imgNodes: [],
            imgNodes_2: [],
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

            // 2. 算出最大 16:9 区域
            const ratio = 16 / 9;
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
            let loadingList = [];
            let loadingList_2 = [];
            const list = swiper_urls;
            const list_2 = bg_urls;
            const length = list.length + list_2.length;
            loadingList.length = list.length;
            let count = 0;
            list.forEach((item, index) => {
                const img = new Image();
                img.onload = () => {
                    count += 1;
                    this.progress = Math.round((count / length) * 100);
                    if (this.progress === 100) {
                        this.canvasRender();
                    }
                };
                img.src = item;
                loadingList.splice(index, 1, img);
            });
            list_2.forEach((item, index) => {
                const img = new Image();
                img.onload = () => {
                    count += 1;
                    this.progress = Math.round((count / length) * 100);
                    if (this.progress === 100) {
                        this.canvasRender();
                    }
                };
                img.src = item;
                loadingList_2.splice(index, 1, img);
            });
            this.imgNodes = loadingList;
            this.imgNodes_2 = loadingList_2;
        },
        // 渲染图片
        canvasRender() {
            const imgList = this.imgNodes_2;
            imgList.forEach((image, index) => {
                if ([4, 2, 1, 3].includes(index)) {
                    let imageWidth = this.boxWidth * 0.5;
                    let animate = (img, dt) => {};
                    let onMouseEnter = (img) => {};
                    let onMouseLeave = (img) => {};
                    if (index === 4) {
                        imageWidth = this.boxWidth * 0.5;
                        animate = (img, dt) => {
                            img.rotation += 0.005;
                        };
                    } else if (index === 3) {
                        imageWidth = this.boxWidth * 0.5;
                        animate = (img, dt) => {
                            img.rotation -= 0.0025;
                        };
                    } else if (index === 1) {
                        imageWidth = this.boxWidth * 0.3;
                        animate = (img, dt) => {
                            img.rotation -= 0.005;
                        };
                    } else if (index === 2) {
                        imageWidth = this.boxWidth * 0.38;
                        animate = (img, dt) => {
                            img.rotation += 0.006;
                        };
                    }
                    const item = {
                        img: image,
                        x: (this.boxWidth - imageWidth) / 2,
                        y: (this.boxHeight - imageWidth) / 2,
                        z: 0,
                        width: imageWidth,
                        height: imageWidth,
                        rotation: 0,
                        rotateX: 45,
                        rotateY: 0,
                        animate,
                        onMouseEnter,
                        onMouseLeave,
                    };
                    this.$refs.canvas_render.addImageObject(item);
                }
            });
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
    background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKAQMAAAC3/F3+AAAABlBMVEUAAAAICAhtdupNAAAAG0lEQVQI12NIYGD4AEJABggwMzCwN4AQM4gHAEmsA7V6aMfAAAAAAElFTkSuQmCC) repeat center center;
    background-size: 0.1rem 0.1rem;
    color: #333;
}
</style>