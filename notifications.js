function stop_loading_screen(){
    document.getElementById("loading").style.display = "none";
    document.getElementById("main").style.display = "block";
  }

  function start_loading_screen(){
    document.getElementById("loading").style.display = "block";
    document.getElementById("main").style.display = "none";
  }

  function error_notification(msg){
    document.getElementById("error_content").innerText = msg;
    document.getElementById("red-alert").style.display = "block";
    setTimeout(()=>document.getElementById("red-alert").style.display = "none", 3000);
  }

  function success_notification(msg){
    document.getElementById("success_content").innerText = msg;
    document.getElementById("green-alert").style.display = "block";
    setTimeout(()=>document.getElementById("green-alert").style.display = "none", 3000);
  }