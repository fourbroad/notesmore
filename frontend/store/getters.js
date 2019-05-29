export default {
  localeFavorites(state, getters) {
    return _.reduce(state.favorites, (lfs, f)=>{
      lfs.push(f.get(state.locale))
      return lfs;
    }, []);
  },
  localeCurrentUser(state) {
    return state.currentUser && state.currentUser.get(state.locale);
  },
  localeMetas(state) {
    return _.reduce(state.metas, (localeMetas, meta)=>{
      localeMetas.push(meta.get(state.locale));
      return localeMetas;
    },[]);
  }
}