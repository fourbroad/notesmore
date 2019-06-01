import client from 'api/client'

export default {
  async FETCH_PROFILE({state, commit, rootState}) {
    let {Profile, currentUser} = client;
    return new Promise((resolve, reject) => {
      Profile.get(state.currentDomainId, currentUser.id, {refresh: true}, (err, profile) => {
        if(err) return reject(err);
        commit('SET_PROFILE', profile);
        resolve(profile);
      });
    });
  },
  async FETCH_FAVORITES({state, dispatch, commit, rootState}) {
    let {Domain} = client;

    function fetchFavorites(ids){
      return new Promise((resolve, reject)=>{
        if(_.isEmpty(ids)){
          return resolve([]);
        }
        Domain.mgetDocuments(state.currentDomainId, ids, (err, favorites)=>{
          if(err) return reject(err);
          commit('SET_FAVORITES', favorites);
          resolve(favorites);
        });
      });
    }
    if(state.profile){
      return fetchFavorites(state.profile.favorites);
    }else{
      return dispatch('FETCH_PROFILE').then((profile)=>{
        return fetchFavorites(profile.favorites);
      });
    }
  },
  async TOGGLE_FAVORITE({state, commit, dispatch, rootState}, favorite) {
    let {profile} = state, patch,
      index = _.findIndex(profile.favorites, f => _.isEqual(f, favorite));
      if (index >= 0) {
        patch = [{
          op: 'remove',
          path: '/favorites/' + index
        }];
      } else {
        patch = [!_.isEmpty(profile.favorites) ? {
          op: 'add',
          path: '/favorites/-',
          value: {
            domainId: favorite.domainId,
            collectionId: favorite.collectionId,
            id: favorite.id
          }
        } : {
          op: 'add',
          path: '/favorites',
          value: [{
            domainId: favorite.domainId,
            collectionId: favorite.collectionId,
            id: favorite.id
          }]
        }];
      }
      return new Promise((resolve, reject)=>{
        profile.patch({ patch: patch }, (err, profile) => {
          if (err) return reject(err);
          commit('SET_PROFILE', profile);
          dispatch('FETCH_FAVORITES');
        });
      });
  },
  async FETCH_METAS({state, commit, dispatch, rootState}) {
    let {Meta, currentUser} = client, {profile, currentDomainId} = state;
    function fetchMetas(profile){
      return new Promise((resolve, reject) => {
        Meta.find(currentDomainId, {size:1000}, (err, result) => {
          if(err) return reject(err);
          let metas = _.reduce(result.metas, (metas, meta) => {
            let permissions = _.at(meta, 'acl.create')[0];
            if (!permissions
              || _.intersection(profile.roles, permissions.roles).length > 0 
              || _.intersection(profile.groups, permissions.groups).length > 0 
              || (permissions.users && permissions.users.indexOf(currentUser.id) >= 0)) {
              metas.push(meta);
            }
            return metas;
          },[]);
          commit('SET_METAS', metas);
          resolve(metas);
        });
      });
    }

    if(profile){
      return fetchMetas(profile);
    }else{
      return dispatch('FETCH_PROFILE').then((profile)=>{
        return fetchMetas(profile);
      });
    }    
  }
}