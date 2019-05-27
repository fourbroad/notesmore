import client from 'lib/client'
import _ from 'lodash'

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
    let profile = state.profile, patch,
      oldFavorites = _.cloneDeep(profile.favorites),
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
  }
}