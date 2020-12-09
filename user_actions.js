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
            div.innerHTML = `
        <button class="btn btn-success mr-2" data-toggle="modal" data-target="#login_show">Sign In</button>
        <button class="btn btn-success mr-2" data-toggle="modal" data-target="#register_show">Register</button>
        `;
        return;
        }
        if(response["status"] != 200){ 
            div.innerHTML = `
            <button class="btn btn-success mr-2" data-toggle="modal" data-target="#login_show">Sign In</button>
            <button class="btn btn-success mr-2" data-toggle="modal" data-target="#register_show">Register</button>
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
       <b>${result["name"]}</b>
       <div><button onclick="logout()" style="border: 0px; background-color: white; font-size: 20px;">Logout</button></div>
       </div>
       </div>
     </div>
       `;
    }
    else{
        div.innerHTML = `
        <button class="btn btn-success mr-2" data-toggle="modal" data-target="#login_show">Sign In</button>
        <button class="btn btn-success mr-2" data-toggle="modal" data-target="#register_show">Register</button>
        `;
    }
}

check();

async function login(){
    details = {
        "email":document.getElementById('sign_email').value,
        "password":document.getElementById('sign_password').value
    }
    start_loading_screen();
    try{
        let response = await fetch(host+"login",{ 
        method: 'POST', 
        headers: { 
            'Content-Type':  
                'application/json;charset=utf-8' 
        }, 
        body: JSON.stringify(details) 
        })
        let result = await response.json()
        $('#login_show').modal('hide');
        if(response['status']!=200)
            error_notification(result['detail']);
        else{
            sessionStorage.setItem("token_id", result["token"]);
            document.getElementById("form_sign").reset();
            check();
        } 
    }
    catch(error){
        $('#login_show').modal('hide');
        error_notification("Something Went Wrong");
    } 
    setTimeout(stop_loading_screen, 3000) 
  }

  async function register(){
    details = {
        "email":document.getElementById('register_email').value,
        "password":document.getElementById('register_password').value,
        "name": document.getElementById('register_name').value,
        "role": document.getElementById('register_role').value,
    }
    start_loading_screen();
    try{
        let response = await fetch(host+"create_user",{ 
        method: 'POST', 
        headers: { 
            'Content-Type':  
                'application/json;charset=utf-8' 
        }, 
        body: JSON.stringify(details) 
        })
        let result = await response.json()
        $('#register_show').modal('hide');
        if(response['status']!=200)
            error_notification(result['detail']);
        else{
            success_notification(result["detail"])
            sessionStorage.setItem("token_id", result["token"]);
            document.getElementById("form_register").reset();
        } 
    }
    catch(error){
        $('#register_show').modal('hide');
        error_notification("Something Went Wrong");
    } 
    stop_loading_screen(); 
  }

  function logout(){
    sessionStorage.removeItem("token_id");
    check();
  }

  async function create_topic(){
    details = {
        "topic":document.getElementById('topic_name').value,
        "content":document.getElementById('topic_content').value,
        "category": document.getElementById('topic_type').value,
    }
    start_loading_screen();
    try{
        let response = await fetch(host+"create_topic",{ 
        method: 'POST', 
        headers: { 
            'Content-Type':  
                'application/json;charset=utf-8' ,
            "Authorization": sessionStorage.getItem("token_id"),
        }, 
        body: JSON.stringify(details) 
        })
        let result = await response.json()
        $('#create_topic').modal('hide');
        if(response['status']!=200)
            error_notification(result['detail']);
        else{
            success_notification(result["detail"])
            document.getElementById("create_form_topic").reset();
            topics();
        } 
    }
    catch(error){
        $('#create_topic').modal('hide');
        error_notification("Something Went Wrong");
    } 
    stop_loading_screen(); 
  }

  async function topics(){
    let response = await fetch(host+"retrive_topics",{
        headers: { 
            'Content-Type':  
                'application/json;charset=utf-8',
            "Authorization": sessionStorage.getItem("token_id"),
        },
    });
    if(response.status != 200){
        error_notification("Unabel Fetch Posts");
        return;
    }
    let result = await response.json();
    result = result["result"];
    let topics = document.getElementById("topics");
    topics.innerHTML = "";
    result.forEach((item)=>{
        let time_diff = parseInt((new Date() - new Date(item["created"]))/1000);
        if(time_diff < 60)
            msg = `Created ${time_diff} Seconds ago`
        else if(+(time_diff/60) < 60)
            msg = `Created ${parseInt(time_diff/60)} Minutes ago`
        else if(+(time_diff/3600) < 60)
            msg = `Created ${parseInt(time_diff/3600)} Hours ago`
        else
            msg = `Created ${parseInt(time_diff/(3600*24))} Days ago`
        topics.innerHTML += `
        <div class="row ml-5">
            <div class="col-12">
                <hr/>
                <a href="./posts.html?id=${item["_id"]}" target="_blank">
                <div class="topic_type">
                ${item["category"]}
                </div>
                <div style="color: black;">
                <b>${item["topic"]} - </b>
                <span>${item["content"].slice(0, 200)+"  ........"}</span>
                </div>
                <div class="topicBy">
                    <span >By: </span>
                    <span id="by">${item["by"]}</span>
                    <span class="separator">·</span>
                    <span >${msg}</span>
                </div>
                </a>
            </div>
        </div>
        `
    })
  }

  async function list_posts(){
      
      let topic_words = document.getElementById('topic_search').value;
      let topic=`\"${topic_words}\"`;
      topic_words.split(" ").forEach((item)=>{
          topic += " " + item;
      })
      let details = {
        topic,
    }
      let st = document.getElementById('topic_st').value;
      let ed = document.getElementById('topic_ed').value;
      let limit = document.getElementById('topic_limit').value;
      if(st)
        details["st"] = new Date(st);
      if(ed)
        details["ed"] = new Date(ed);
      if(limit)
        details["limit"] = limit;
    console.log(details)
    start_loading_screen();
    try{
        let response = await fetch(host+"list_posts",{ 
        method: 'POST', 
        headers: { 
            'Content-Type':  
                'application/json;charset=utf-8' ,
            "Authorization": sessionStorage.getItem("token_id"),
        }, 
        body: JSON.stringify(details) 
        })
        let result = await response.json()
        stop_loading_screen(); 
        if(response['status']!=200)
            error_notification(result['detail']+" or No Date");
        else if(result["result"].length == 0)
            error_notification("No Date for the search");
        else{
            success_notification(result["detail"])
            create_html(result["result"])
            $('#search_list').modal('show');
        } 
    }
    catch(error){
        error_notification("Something Went Wrong");
        stop_loading_screen(); 
    }
  }

  function create_html(result){
      console.log("dssda")
    let topics = document.getElementById("search_list_content");
    topics.innerHTML = "";
    console.log(topics, result);
    result.forEach((item)=>{
        let time_diff = parseInt((new Date() - new Date(item["created"]))/1000);
        if(time_diff < 60)
            msg = `Created ${time_diff} Seconds ago`
        else if(+(time_diff/60) < 60)
            msg = `Created ${parseInt(time_diff/60)} Minutes ago`
        else if(+(time_diff/3600) < 60)
            msg = `Created ${parseInt(time_diff/3600)} Hours ago`
        else
            msg = `Created ${parseInt(time_diff/(3600*24))} Days ago`
        topics.innerHTML += `
        <div class="row">
            <div class="col-12">
                <a href="./posts.html?id=${item["_id"]}" target="_blank">
                <div class="topic_type">
                ${item["category"]}
                </div>
                <div style="color: black;">
                <b>${item["topic"]} - </b>
                <span>${item["content"].slice(0, 150)+"  ....."}</span>
                </div>
                <div class="topicBy">
                    <span >By: </span>
                    <span id="by">${item["by"]}</span>
                    <span class="separator">·</span>
                    <span >${msg}</span>
                </div>
                </a>
                <hr/>
            </div>
        </div>
        `
    })
  }

  topics()