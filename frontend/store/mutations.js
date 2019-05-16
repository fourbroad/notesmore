export default {
    LOGIN_IN(state, token) {
        state.token = token
    },
    LOGIN_OUT(state) {
        state.token = ''
    },
    toggleNavCollapse(state) {
        state.isSidebarNavCollapse = !state.isSidebarNavCollapse
    },
    setCrumbList(state, list) {
        state.crumbList = list
    }
}