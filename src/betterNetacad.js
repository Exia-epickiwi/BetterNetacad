$(function(){
  //Stockage des lessons validés
  var checkedLessons = [];
  //Si la touche ctrl est appuyée
  var isCtrlPressed = false;
  //Variables de base
  var $content = $("#content");
  var $menu = $content.find("#page-footer .page-menu");
  var $pageContent = $content.find("#page-content");
  //Ajout du bouton de plein ecran
  $menu.prepend("<button type='button' id='page-menu-fullscreen-button' title='Plein écran'>Plein Ecran</button>");
  var $fullscreenButton = $menu.find("#page-menu-fullscreen-button");
  //Ajout du bouton de validation
  $menu.prepend("<button type='button' id='page-menu-check-button' title='Valider et passer au suivant'>Valider</button>");
  var $checkButton = $menu.find("#page-menu-check-button");
  //Ajout du bouton de continue
  $("#menu .menu-buttons").append('<button type="button" class="menu-button" id="menu-continue" title="Continuer le cour"><div class="menu-button-icon"></div><div class="menu-button-box"><div class="menu-button-label">Continuer le cour</div></div></button>');
  var $continueButton = $("#menu .menu-buttons").find("#menu-continue");
  //Chargement des cookies
  chrome.storage.local.get("checked",function(res){
    if(res.checked){
      checkedLessons = [];
      for(var i = 0; i<res.checked.length; i++){
        checkedLessons.push(new Lesson(res.checked[i].code));
      }
    }
  });
  //Ajout de l'evenement Continuer
  $continueButton.on("click",function(e){
    var lesson = getLastLesson();
    startLesson(lesson);
    $("#page-menu-next-button").click();
  });
  //Ajout de l'evenement plein ecran
  $fullscreenButton.on("click",function(e){
    if($content.hasClass("fullscreen")){
      $content.removeClass("fullscreen");
      $fullscreenButton.removeClass("ch-enabled");
      if(isCtrlPressed){
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }else{
      $content.addClass("fullscreen");
      $fullscreenButton.addClass("ch-enabled");
      if(isCtrlPressed){
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        }
      }
    }
  });
  //Ajout de l'evenement checked
  $checkButton.on("click",function(){
    var lesson = getCurrentLesson();
    var index = indexOfLesson(lesson);
    if(index == -1){
      checkedLessons.push(lesson);
      $checkButton.addClass("selected");
      $("#page-menu-next-button").click();
    } else {
      checkedLessons.splice(index,1);
      $checkButton.removeClass("selected");
    }
    saveChecked();
  });
  //Evenement de changement de page
  $pageContent.on("DOMSubtreeModified",function(e){
    var lesson = getCurrentLesson();
    if(lesson && indexOfLesson(lesson) == -1){
      $checkButton.removeClass("selected");
    } else {
      $checkButton.addClass("selected");
    }
  });
  //Ecoute des touches
  $(document).on("keydown",function(e){
    console.log("Keydown",e);
    switch(e.keyCode){
      case 17:
        isCtrlPressed = true;
        break;
      case 39:
        $("#page-menu-next-button").click();
        break;
      case 37:
        $("#page-menu-previous-button").click();
        break;
      case 70:
        $("#page-menu-fullscreen-button").click();
        break;
      case 32:
        $("#page-menu-check-button").click();
        break;
      case 66:
        $("#page-menu-bookmark-button").click();
        break;
      case 67:
        $("#page-menu-transcript-button").click();
        break;
    }
  });
  //Ecoute des touches
  $(document).on("keyup",function(e){
    if(e.keyCode == 17){
      isCtrlPressed = true;
    }
  });

  $("#frame").contents().find("body").on("keydown",function(e){
    console.log(e);
  });
  //Fonction de recuperation du code lesson
  function getCurrentLesson(){
    if($pageContent.find("iframe").length > 0 && $pageContent.find("iframe").attr("src")){
      var lessonString = $pageContent.find("iframe").attr("src").replace(/^.+\/(.+).html$/,"$1");
      var code = lessonString.split(".");
      for(var i = 0; i<code.length; i++){
        code[i] = parseInt(code[i]);
      }
      return new Lesson(code);
    } else {
      return null;
    }
  }
  //Fonction de verification des lessons
  function indexOfLesson(lesson){
    for(var i = 0; i<checkedLessons.length; i++){
      if(checkedLessons[i].compare(lesson)){
        return i;
      }
    }
    return -1;
  }
  //Cookie save
  function saveChecked(){
    chrome.storage.local.set({"checked":checkedLessons},function(){
      console.info(checkedLessons.length+" checked lessons saved");
    });
  }
  //Recuperation de la dernière lecon
  function getLastLesson(){
    var last = null;
    for(var i = 0; i<checkedLessons.length; i++){
      if(last == null || checkedLessons[i].isHightThan(last)){
        last = checkedLessons[i];
      }
    }
    return last;
  }
  //Lancement d'une lecon
  function startLesson(lesson){
    var code = lesson.getCode();
    $("a[href='#"+code+"'].Page").get(0).click();
  }
});

function Lesson(code){
  this.code = code;
  this.compare = function(lesson){
    for(var i = 0; i<this.code.length && i<lesson.code.length; i++){
      if(this.code[i] != lesson.code[i]){
        return false;
      }
    }
    return true;
  };
  this.isHightThan = function(lesson){
    for(var i = 0; i<this.code.length; i++){
      if(this.code[i] > lesson.code[i]){
        return true;
      } else if(this.code[i] < lesson.code[i]){
        return false;
      }
    }
    console.log("");
    return true;
  };
  this.getCode = function(){
    var result = "";
    for(var i = 0; i<this.code.length; i++){
      result += this.code[i];
      if(i < this.code.length-1){
        result += ".";
      }
    }
    return result;
  };
}