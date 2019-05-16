import jwtDecode from 'jwt-decode';

export default {
  get token() {
    let token = localStorage.getItem('token');
    if (token) {
      let decodedToken = jwtDecode(token),
        time = new Date().getTime() / 1000;
      if (time < decodedToken.exp) {
        return token;
      }
    }
    return null;
  },
  set token(value) {
    localStorage.setItem('token', value)
  },
  isSidebarNavCollapse: false,
  currentDomainId: null,
  crumbList: []
}