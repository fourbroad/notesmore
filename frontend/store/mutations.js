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
  SET_PROFILE(state, profile) {
    state.profile = profile
  },
  SET_FAVORITES(state, favorites) {
    state.favorites = favorites
  },
  CLEAR_FAVORITES(state) {
    state.favorites = []
  },
  SET_FAVORITESOPENED(state, opened){
    state.favoritesOpened = opened
  },
  SET_METAS(state, metas) {
    state.metas = metas
  },
}