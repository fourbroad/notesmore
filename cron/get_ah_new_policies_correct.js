
//let client = require('@notesmore/client');

const axios = require('axios'); 
let login_post = function (){
  
    return new Promise(function(resolve, reject){
        axios.post("http://47.100.213.55:3000/_login",{"id":"ah-new-system-endorse","password":"Eew2Eeke"})
        .then(function (response) {
            resolve(response);
            //console.log(response);
          });
  });
}

let policies_post = function (toket,id,postData){
  
    return new Promise(function(resolve, reject){
        axios({
            method: 'post',
            url: 'http://47.100.213.55:3000/starr-cn/ah-new/'+id+'/_bulk',
            headers: {'authorization': 'Bearer '+toket},
            data:postData
        })
        .then(function (response) {
            resolve(response);
            //console.log(response);
          })
        .catch(console.error);
  });
}
let get_policies = function (toket,startId,limit){
    return new Promise(function(resolve, reject){
        axios.get("http://agency.starrchina.cn/homes/esCorrect?limit="+limit+"&startId="+startId)
        .then(function (response) {console.log(response);
            if(response.data.length){
                for (let i = 0;i<response.data.length;i++){
                    policies_post(toket,response.data[i].targetId,response.data[i]);
                }
            }
            if(response.data.length){
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
  });
}

let login = async function(){
    let body = await login_post();
    //console.log(body.data);
    get_policies(body.data,0,100);
}
login();

