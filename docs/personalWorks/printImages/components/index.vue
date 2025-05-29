<template>
    <div class="flex">
        <div class="box">
            <upload class="upload-demo" drag action="" multiple :before-upload="uploadImages">
                <i class="el-icon-upload"></i>
                <h5>点击/拖拽选取图片</h5>
            </upload>
        </div>
    </div>
</template>

<script>
import upload from "element-ui/lib/upload";
import "element-ui/lib/theme-chalk/upload.css";
import "element-ui/lib/theme-chalk/icon.css";
import { VxeTable } from "vxe-table";
export default {
    name: "PrintImageComponent", // 这个名字推荐：大写字母开头驼峰法命名
    dicts: [], //数据字典this.dict.type[name]调用
    components: {
        upload,
    },
    directives: {},
    mixins: [],
    data() {
        return {
            imageList: [],
            time: null,
            A4W: this.cmToPx(21),
            A4H: this.cmToPx(29.7),
        };
    },
    computed: {},
    watch: {},
    created() {},
    mounted() {},
    activated() {}, //如果页面有keep-alive缓存功能，这个函数会触发
    beforeCreate() {}, //生命周期 - 创建之前
    beforeMount() {}, //生命周期 - 挂载之前
    beforeUpdate() {}, //生命周期 - 更新之前
    updated() {}, //生命周期 - 更新之后
    beforeDestroy() {}, //生命周期 - 销毁之前
    destroyed() {}, //生命周期 - 销毁完成
    methods: {
        cmToPx(cm) {
            const dpi = 96;
            return (cm * dpi) / 2.54;
        },
        uploadImages(e) {
            this.imageList.push(e);
            this.initImages();
        },
        initImages() {
            if (this.time) {
                clearTimeout(this.time);
            }
            this.time = setTimeout(async () => {
                const { froSide, reSide } = this.classification(this.imageList);
                const froResult = await this.getImageDom(froSide);
                const reResult = await this.getImageDom(reSide);
                const ratio = froResult.ratio;
                const { style, content } = this.getPrintContent(ratio, froResult.imgList, reResult.imgList);
                this.print(content, style);
            }, 1500);
        },
        //
        getPrintContent(ratio, froList, reList) {
            if (ratio > 1) {
                const DomWidth = this.A4W / 2;
                const DomHeight = DomWidth / ratio;
                let content = "";
                const forStr = this.htmlContent(DomHeight, froList, DomWidth, 2);
                const reStr = this.htmlContent(DomHeight, reList, DomWidth, 2);
                for (let index = 0; index < forStr.length; index++) {
                    const element = forStr[index];
                    const node = reStr[index];
                    content += `${element}<div class="page-break"></div>${node}<div class="page-break"></div>`;
                }
                let style = `
                @media print {
            .page-break {
            display: block;
            page-break-before: always;
            }
            }
            `;
                return { style, content };
            } else {
                const DomWidth = this.A4W / 3;
                const DomHeight = DomWidth / ratio;
                let content = "";
                const forStr = this.htmlContent(DomHeight, froList, DomWidth, 3);
                const reStr = this.htmlContent(DomHeight, reList, DomWidth, 3);
                for (let index = 0; index < forStr.length; index++) {
                    const element = forStr[index];
                    const node = reStr[index];
                    if (content) {
                        content += `<div class="page-break"></div>${element}<div class="page-break"></div><div style="direction: rtl">${node}</div>`;
                    } else {
                        content = `${element}<div class="page-break"><div style="direction: rtl">${node}</div>`;
                    }
                }
                let style = `
                @media print {
            .page-break {
            display: block;
            page-break-before: always;
            }
            }
            `;
                return { style, content };
            }
        },
        htmlContent(height, list, width, num) {
            const maxLength = Math.floor(this.A4H / height) * num;
            console.log("maxLength :>> ", maxLength);
            const imageObj = {};
            let prop = 0;
            for (let index = 0; index < list.length; index++) {
                const element = list[index];
                prop = Math.ceil((index + 1) / maxLength);
                if (imageObj[prop]) {
                    imageObj[prop] += `<img src="${element.src}" width="${width * 0.9 || ""}" height="${height * 0.9 || ""}">`;
                } else {
                    imageObj[prop] = `<img src="${element.src}" width="${width * 0.9 || ""}" height="${height * 0.9 || ""}">`;
                }
            }
            return Object.values(imageObj);
        },
        // 获取图片Dom列表
        getImageDom(list) {
            return new Promise((resolve, reject) => {
                const listLength = list.length;
                let load = 0;
                let ratio = 1;
                let newList = [];
                newList.length = listLength;
                list.forEach((node, index) => {
                    const reader = new FileReader();
                    reader.onload = function (evt) {
                        const img = new Image();
                        img.onload = function () {
                            const width = img.width;
                            const height = img.height;
                            ratio = width / height;
                            load += 1;
                            newList.splice(index, 1, img);
                            if (load === listLength) {
                                resolve({ ratio, imgList: newList });
                            }
                        };
                        img.src = evt.target.result;
                    };
                    reader.readAsDataURL(node);
                });
            });
        },
        // 分正反
        classification(list = []) {
            if (Array.isArray(list)) {
                let froSide = new Map();
                let reSide = new Map();
                list.forEach((item) => {
                    const name = item.name.split(".")[0];
                    const sing = name.slice(-1);
                    if (sing === "-") {
                        reSide.set(name.replace("-", ""), item);
                    } else {
                        froSide.set(name, item);
                    }
                });
                return {
                    froSide: [...froSide.values()],
                    reSide: [...reSide.values()],
                };
            } else {
                return {};
            }
        },
        // 打印
        print(content, style) {
            const win = window.open("", "_self");
            win.document.write(`
  <html>
    <head><style>${style}</style></head>
    <body onload="window.print(); window.location.reload();">
      ${content}
    </body>
  </html>
`);
            win.document.close();
        },
    },
};
</script>
<style scoped>
html,
body {
    width: 100%;
    height: 100%;
}
.flex {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}
.box {
    margin-top: 3rem;
}
</style>