
//let client = require('@notesmore/client');

const axios = require('axios'); 
let login_post = function (){
  
    return new Promise(function(resolve, reject){
        axios.post("http://47.100.213.55:3000/_login",{"id":"ah-new-system","password":"Phe9angu"})
        .then(function (response) {
            resolve(response);
            //console.log(response);
          });
  });
}

let policies_post = function (toket,postData){
    //console.log(postData);
    return new Promise(function(resolve, reject){
        axios({
            method: 'post',
            url: 'http://47.100.213.55:3000/starr-cn/ah-new/_bulk',
            headers: {'authorization': 'Bearer '+toket},
            data:postData
        })
        .then(function (response) {
            //console.log(response.data.items[0]);
            resolve(response);
            //console.log(response);
          })
        .catch(console.error);
  });
}
let get_policies = function (toket,startId,limit){
    return new Promise(function(resolve, reject){
        axios.get("http://agency.starrchina.cn/homes/esPolicies?limit="+limit+"&startId="+startId)
        .then(function (response) {
            policies_post(toket,response.data);
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


// client.login('easylink-new','eweasn-ylkni', ()=>{
//     const {Collection} = client;
//     Collection.get('starr-cn', 'ah-new', (collection) => {
//         function doBulk(patch, callback){
//             collection.bulk(patch, (err, result)=>{

//             });
//         }

//         axios.get('http://agency.starrchina.cn/homes/esPolicies?startId=0&limit=1').then((response)=>{
//             console.log(response);
//             let patch = null ;
//             doBulk(patch, ()=>{

//                 doBulk();
//             });
//         });
//     });
// });


