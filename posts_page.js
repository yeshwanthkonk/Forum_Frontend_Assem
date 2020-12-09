var host = "https://tech-forum-yesh.herokuapp.com/"
let div = document.getElementById('nav_user_status');
async function check(){
    let token = sessionStorage.getItem("token_id");
    let response;
    if(token){
        try{
            response = await fetch(host+"check_status",{
                headers:{
                    "Authorization": token,
                }
            })
        }
        catch(err){
            window.location.href = "./index.html";
        return;
        }
        if(response["status"] != 200){
            div.innerHTML = `
        <a class="btn btn-success mr-2" href="./index.html">Go Home to Login</a>
        `;
        return;
        }
        let result = await response.json();
       div.innerHTML = `
       <div class="dropdown">
       <button type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="border: 0px;">
       <img
       src="https://icons.iconarchive.com/icons/alecive/flatwoken/256/Apps-User-Online-icon.png"
       width="40"
       height="40"
       class="d-inline-block align-top"
       alt=""
       loading="lazy"/>
       </button>
       <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
       <div class="dropdown-item">
       Me:<br/>
       <b>${result["name"]}</b><br/>
       <div><button onclick="logout()" style="border: 0px; background-color: white; font-size: 20px;">Logout</button></div>
       </div>
       </div>
     </div>
       `;
    }
    else{
        div.innerHTML = `
        <a class="btn btn-success mr-2" href="./index.html">Go Home to Login</a>
        `;
    }
}

check();

async function topic_detail(){
    start_loading_screen();
    let response = await fetch(host+"topic",{
        method: "POST",
        headers: { 
            'Content-Type':  
                'application/json;charset=utf-8',
            "Authorization": sessionStorage.getItem("token_id"),
        },
        body:JSON.stringify({"id": id}),
    });
    if(response.status != 200){
        let topic = document.getElementById("post_detail");
        topic.innerHTML = "<img src='https://assets.prestashop2.com/sites/default/files/styles/blog_750x320/public/blog/2019/10/banner_error_404.jpg'>";
        error_notification("Unabel Fetch Posts");
        return;
    }
    let result = await response.json();
    result = result["result"];
    let topic = document.getElementById("post_detail");
    let msg = get_time_diff(result["created"]);
    topic.innerHTML = `
    <h1 class="display-5" style="text-align: center;">Topic-${result["topic"]}</h1>
    <div class="topicBy" style="text-align: center; font-size: 125%;">
        <span >By: </span>
        <span id="by">${result["by"]}</span>
        <span class="separator">·</span>
        <span >${msg}</span>
    </div>
    <div style="text-align: center;">
        <hr/>
        <div class="row">
            <div class="col-12 col-md-10">
                ${result["content"]}
            </div>
            <div class="col-12 col-md-2">
                <button class="btn btn-success" data-toggle="modal" data-target="#replies_show" style="background-color: #65bb12;">Post Reply</button>
            </div>
        </div>
    </div>
    
    `;
    console.log(topic)
    replies();
    stop_loading_screen();
  }

  function get_time_diff(time){
    let time_diff = parseInt((new Date() - new Date(time))/1000);
    if(time_diff < 60)
        msg = `Created ${time_diff} Seconds ago`
    else if(+(time_diff/60) < 60)
        msg = `Created ${parseInt(time_diff/60)} Minutes ago`
    else if(+(time_diff/3600) < 60)
        msg = `Created ${parseInt(time_diff/3600)} Hours ago`
    else
        msg = `Created ${parseInt(time_diff/(3600*24))} Days ago`
    return msg;
  }

  async function replies(){

    let response = await fetch(host+"retrive_replies",{
        method: "POST",
        headers: { 
            'Content-Type':  
                'application/json;charset=utf-8',
            "Authorization": sessionStorage.getItem("token_id"),
        },
        body: JSON.stringify({"id": id})
    });
    if(response.status != 200){
        error_notification("Unabel Fetch Posts");
        return;
    }
    let result = await response.json();
    result = result["result"];
    let topic = document.getElementById("post_detail");
    console.log(result)
    result.forEach((item)=>{
        let msg = get_time_diff(item["created"]);
        topic.innerHTML += `
        <div class="row ml-5">
            <div class="col-12">
                <hr/>
                <div style="color: black;">
                <span id=${item["_id"]}>${item["content"]} </span>
                <span>
                <button style="font-size:24px; border: 0px; background-color: white;" value=${item["_id"]} onclick="delete_reply(this);"}><i class='fas fa-trash-alt'></i></button>
                </span>
                </div>
                <div class="topicBy">
                    <span >By: </span>
                    <span id="by">${item["by"]}</span>
                    <span class="separator">·</span>
                    <span >${msg}</span>
                    <span > - </span>
                    <span>
                    <button style="font-size:24px; border: 0px; background-color: white;" value=${item["_id"]} onclick="show_edit(this);"><i class='fas fa-edit'></i></button>
                </span>
                </div>
            </div>
        </div>
        `
    })
  }

  async function create_reply(){
        details = {
            "post_id": id,
            "content":document.getElementById('reply_content').value,
        }
        start_loading_screen();
        try{
            let response = await fetch(host+"create_reply",{ 
            method: 'POST', 
            headers: { 
                'Content-Type':  
                    'application/json;charset=utf-8' ,
                "Authorization": sessionStorage.getItem("token_id"),
            }, 
            body: JSON.stringify(details) 
            })
            let result = await response.json()
            $('#replies_show').modal('hide');
            if(response['status']!=200)
                error_notification(result['detail']);
            else{
                success_notification(result["detail"])
                document.getElementById("form_reply").reset();
                topic_detail();
            } 
        }
        catch(error){
            $('#replies_show').modal('hide');
            error_notification("Something Went Wrong");
        } 
        stop_loading_screen(); 
  }

  async function edit_reply(node){
    
    details = {
        "id": node.value,
        "content":document.getElementById('edit_content').value,
    }
    try{
        let response = await fetch(host+"edit_reply",{ 
        method: 'PUT', 
        headers: { 
            'Content-Type':  
                'application/json;charset=utf-8' ,
            "Authorization": sessionStorage.getItem("token_id"),
        }, 
        body: JSON.stringify(details) 
        })
        let result = await response.json()
        $('#edit_show').modal('hide');
        if(response['status']!=200)
            error_notification(result['detail']);
        else{
            success_notification(result["detail"])
            document.getElementById("edit_form").reset();
            topic_detail();
        } 
    }
    catch(error){
        console.log(error)
        $('#edit_show').modal('hide');
        error_notification("Something Went Wrong");
    } 
  }

  function show_edit(node){
      console.log(node.value)
    document.getElementById('edit_content').value = document.getElementById(node.value).innerText;
    $('#edit_show').modal('show');
    document.getElementById("edit_form").value = node.value;
  }

  async function delete_reply(node){
    try{
        var confirmed = confirm("Are you sure, to delete!\nAction unreverted.");
        if(!confirmed){
            return;
        }
        let response = await fetch(host+"delete_reply",{ 
        method: 'DELETE', 
        headers: { 
            'Content-Type':  
                'application/json;charset=utf-8' ,
            "Authorization": sessionStorage.getItem("token_id"),
        }, 
        body: JSON.stringify({'id': node.value}) 
        })
        let result = await response.json()
        if(response['status']!=200)
            error_notification(result['detail']);
        else{
            success_notification(result["detail"])
            topic_detail();
        } 
    }
    catch(error){
        console.log(error);
        error_notification("Something Went Wrong");
    } 
  }
  function logout(){
    sessionStorage.removeItem("token_id");
    check();
  }

  topic_detail()