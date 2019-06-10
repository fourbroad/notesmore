import client from 'api/client'

let {Meta, Domain, Collection, View, Page, Form, Role, Profile, Group, User, Document, Action} = client;

export default {

  async LOGIN({state, commit, dispatch}, {userId, password}){
    return client.login(userId, password).then(token=>{
      commit('SET_TOKEN', token);
      return token;
    });
  },

  async LOGOUT({state, commit, dispatch}){
    return client.logout().then(()=>commit('CLEAR_TOKEN'));
  },

  async FETCH_DOCUMENT({state, commit, dispatch}, {domainId, collectionId, documentId}){
    switch (collectionId) {
      case ".metas":
        return Meta.get(domainId, documentId);
      case ".domains":
        return Domain.get(documentId);
      case ".collections":
        return Collection.get(domainId, documentId);
      case ".views":
        return View.get(domainId, documentId);
      case ".pages":
        return Page.get(domainId, documentId);
      case ".forms":
        return Form.get(domainId, documentId);
      case ".roles":
        return Role.get(domainId, documentId);
      case ".profiles":
        return Profile.get(domainId, documentId)
      case ".groups":
        return Group.get(domainId, documentId);
      case ".users":
        return User.get(documentId);
      case ".actions":
        return Action.get(domainId, documentId);
      default:
        return Document.get(domainId, collectionId, documentId);
    }    
  },

  async NEW_DOCUMENT({state, commit, dispatch}, {domainId, metaId}){
    return Meta.get(domainId, metaId).then(meta => {
      let collectionId = meta.container.id, doc, docData = {};
      _.merge(docData, {_meta: {metaId: metaId, iconClass:meta._meta.iconClass}}, _.cloneDeep(meta.defaultValue));
      switch(collectionId){
        case '.metas':
          return new Meta(domainId, docData, true);
        case '.domains':
          return new Domain(docData, true);
        case '.collections':
          return new Collection(domainId, docData, true);
        case '.views':
          return new View(domainId, docData, true);
        case '.pages':
          return new Page(domainId, docData, true);
        case '.forms':
          return new Form(domainId, docData, true);
        case '.roles':
          return new Role(domainId, docData, true);
        case '.profiles':
          return new Profile(domainId, docData, true);
        case '.groups':
          return new Group(domainId, docData, true);
        case '.users':
          return new User(docData, true);
        case '.actions':
          return new Action(domainId, docData, true);
        default:
          return new Document(domainId, collectionId, docData, true);
      }
    });
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

  async FETCH_META({state, commit, dispatch},{domainId, metaId}) {
    return Meta.get(domainId, metaId);
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

  async FETCH_ACTION({state, commit, dispatch}, {domainId, actionId}){
    return Action.get(domainId, actionId);
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