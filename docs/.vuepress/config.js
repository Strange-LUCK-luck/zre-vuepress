module.exports = {
    title: '奇缘网',
    description: '这是关于技术的网站',
    themeConfig: {
        nav: [
            { text: '首页', link: '/' },
            { text: '开发', items: [{ text: 'nodejs版本隔离', link: '/article/node-environment.html' }] },
            { text: '作品', items: [{ text: 'mohoyo空月之歌', link: '/mihoyo/moon/' }] },
            { text: '友情链接', link: 'https://www.ghostangel909.cn' }
        ],
        sidebar: {
            '/article/': [{ title: 'nodejs版本隔离', path: 'node-environment' }]
        },
        other: {
            email: 'ronge@aliyun.com',
            time: '2024-2029',
            icp: '粤ICP备2025406902号-1',
            mps: "粤公网安备44030002006837号"
        }
    }
}