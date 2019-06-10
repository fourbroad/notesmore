import client from 'api/client'

let {User, Profile, Domain, Meta, Action} = client;

export default {

  async LOGIN({state, commit, dispatch}, {userId, password}){
    return client.login(userId, password).then(token=>{
      commit('SET_TOKEN', token);
      return token;
    });
  },

  async LOGOUT({state, commit, dispatch}, userId, password){
    return client.logout().then(()=>commit('CLEAR_TOKEN'));
  },

  async FETCH_CURRENTUSER({state, commit}) {
    return User.get().then(user => {
      commit('SET_CURRENTUSER', user);
      return user;
    });
  },

  async FETCH_PROFILE({state, dispatch, commit}) {
    function fetchProfile(currentUser){
      return Profile.get(state.currentDomainId, currentUser.id, {refresh: true}).then( profile => {
        commit('SET_PROFILE', profile);
        return profile;
      });
    }
    if(state.currentUser){
      return fetchProfile(state.currentUser);
    } else {
      return dispatch('FETCH_CURRENTUSER').then((currentUser)=>{
        return fetchProfile(currentUser);
      });
    }
  },

  async FETCH_FAVORITES({state, dispatch, commit}) {
    function fetchFavorites(ids){
      if(_.isEmpty(ids)){
        commit('SET_FAVORITES',[]);
        return Promise.resolve([]);
      }
      return Domain.mgetDocuments(state.currentDomainId, ids).then( favorites => {
        commit('SET_FAVORITES', favorites);
        return favorites;
      });
    }
    if(state.profile){
      return fetchFavorites(state.profile.favorites);
    }else{
      return dispatch('FETCH_PROFILE').then(profile => {
        return fetchFavorites(profile.favorites);
      });
    }
  },

  async TOGGLE_FAVORITE({state, commit, dispatch}, favorite) {
    let {profile} = state, patch, index = _.findIndex(profile.favorites, f => _.isEqual(f, favorite));
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
    return profile.patch({ patch: patch }).then(profile => {
      commit('SET_PROFILE', profile);
      return dispatch('FETCH_FAVORITES');
    });
  },

  async FETCH_METAS({state, commit, dispatch}) {
    let {profile, currentDomainId, currentUser} = state;
    function fetchMetas(profile){
      return Meta.find(currentDomainId, {size:1000}).then(result => {
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
        return metas;
      });
    }

    if(profile){
      return fetchMetas(profile);
    }else{
      return dispatch('FETCH_PROFILE').then((profile)=>{
        return fetchMetas(profile);
      });
    }    
  },

  async FETCH_ACTIONS({state, commit, dispatch}, document){
    let {domainId, _meta} = document;
    if (_meta.actions) {
      return Action.mget(domainId, actIds).then(result=>result.actions);
    } else {
      return Meta.get(domainId, _meta.metaId||'.meta').then(meta=>Action.mget(domainId, meta.actions).then(result=>result.actions));
    }
  }

}