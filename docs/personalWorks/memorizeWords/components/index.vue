<template>
    <div ></div>
</template>

<script>
export default {
    name: "word", // 这个名字推荐：大写字母开头驼峰法命名
    dicts: [], //数据字典this.dict.type[name]调用
    components: {},
    directives: {},
    mixins: [],
    data() {
        return {};
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
    methods: {},
};
</script>
<style lang='scss' scoped>
</style>