const axios = require('axios'); 
const jwtDecode = require('jwt-decode');
let login_post = function (){
  
    // return new Promise(function(resolve, reject){
     return axios.post("http://47.100.213.55:3000/_login",{"id":"ah-old-system","password":"zegoo7Ze"});
        // .then(function (response) {
        //     resolve(response.items);
        //     //console.log(response);
        //   });
//   });
}

let policies_post = function (toket,postData){ 
    // return new Promise(function(resolve, reject){
        return axios({
            method: 'post',
            url: 'http://47.100.213.55:3000/starr-cn/ah-old/_bulk',
            headers: {'authorization': 'Bearer '+global.token},
            data:postData
        })
        .then(function (response) {
            //resolve(response);
           // console.log(response.data.items[0]);
            return response;
          })
        .catch(console.error);
//   });
}
let get_policies = function (toket,startId,limit){
    // return new Promise(function(resolve, reject){
        return axios.get("http://dicc.ins24.com/ah/esPolicies?limit="+limit+"&startId="+startId)
        .then(function (response) {
           
            if(response.data.length){
                policies_post(toket,response.data);
                if(response.data.length < limit){
                    setTimeout(() => {
                        login(response.data[response.data.length-1].id,limit);
                        //get_policies(toket,response.data[response.data.length-1].id,limit);
                    }, 30000);
                }else{ 
                    login(response.data[response.data.length-1].id,limit);
                    //get_policies(toket,response.data[response.data.length-1].id,limit); 
                }
                
            }else{
                setTimeout(() => {
                    login(response.data[response.data.length-1].id,limit);
                    //get_policies(toket,response.data[response.data.length-1].id,limit);
                }, 30000);
                
            }
            //resolve(response);
          });
//   });
}

global.token='';
let login = async function(startId,limit){
    if(!global.token){
        let body = await login_post();
        global.token=body.data;
    }else{
        //console.log(jwtDecode(global.token));
        let decodedToken = jwtDecode(global.token), time = new Date().getTime()/1000;
        if(((time - decodedToken.iat) > (decodedToken.exp-decodedToken.iat)*2/3)) {
            let bodyData = await login_post();
            global.token=bodyData.data;
        }
    }
    get_policies(global.token,startId,limit);
}
login(0,100);
