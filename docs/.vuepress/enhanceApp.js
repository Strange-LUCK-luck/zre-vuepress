
import { Button, Input, Message } from 'element-ui'
import 'element-ui/lib/theme-chalk/button.css'
import 'element-ui/lib/theme-chalk/input.css'

export default ({ Vue }) => {
    Vue.use(Button)
    Vue.use(Input)

    // 全局挂载 Message（这种使用方式不同于组件）
    Vue.prototype.$message = Message
}