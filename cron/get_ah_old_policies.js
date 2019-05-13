const axios = require('axios'); 
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
            headers: {'authorization': 'Bearer '+toket},
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
                        get_policies(toket,response.data[response.data.length-1].id,limit);
                    }, 30000);
                }else{ 
                    get_policies(toket,response.data[response.data.length-1].id,limit); 
                }
                
            }else{
                setTimeout(() => {
                    get_policies(toket,response.data[response.data.length-1].id,limit);
                }, 30000);
                
            }
            //resolve(response);
          });
//   });
}

let login = async function(){
    let body = await login_post();
    //console.log(body.data);
    get_policies(body.data,0,100);
}
login();
