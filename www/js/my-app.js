var myApp = new Framework7({
	 swipePanel: 'left',
	 cache: false,
	 modalUsernamePlaceholder:'DNI',
	 modalPasswordPlaceholder:'Contraseña',
	 modalButtonOk:'Aceptar',
	 modalButtonCancel: 'Cancelar'
});

var BXL_WWW = 'http://intranet.elshowdelmono.com.ar';
var BXL_TITLE = 'El Show Del Mono';

function showMessage(message, title, callbackOk){
	title = title || BXL_TITLE;
	myApp.alert(message, title, callbackOk);
}
function showConfirm(message, title, callbackOk, callbackCancel){
	title = title || BXL_TITLE;
	myApp.confirm(message, title, callbackOk, callbackCancel);
}

var $$ = Dom7;

$$.ajaxSetup({
	xhrFields: {
		withCredentials: true
	},
    crossDomain: true
});

var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

var EnAuditoria = false;
function AddAuditoria(){
	EnAuditoria = true;
	myApp.popup('.popup-auditoria');
}
function CloseAuditoria(){
	showConfirm("¿Desea salir de la auditoría? Se perderán todas las modificaciones.", 'Salir de Auditoría',function(){  myApp.closeModal('.popup-auditoria'); },function(){});
}

function onPhotoFileSuccess(imageData) {
  alert("onPhotoFileSuccess was called. imageData: "+imageData);
  // Get image handle
  console.log(JSON.stringify(imageData));

  // Get image handle
  //
  var largeImage = document.getElementById('largeImage');
  // Unhide image elements
  //
  largeImage.style.display = 'block';
  document.getElementById('uploadpicbtn').style.display="block";
  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  largeImage.src = imageData;
  uploadimgdata=imageData;
}
// Called when a photo is successfully retrieved
//
function onPhotoURISuccess(imageURI) {
  alert("onPhotoURISuccess was called. imageuri: "+imageURI);
  // Uncomment to view the image file URI
  // console.log(imageURI);
  // Get image handle
  //
  var largeImage = document.getElementById('largeImage');
  // Unhide image elements
  //
  largeImage.style.display = 'block';
  document.getElementById('uploadpicbtn').style.display="block";
  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //

//custom code to fix image uri
  if (imageURI.substring(0,21)=="content://com.android") {
    photo_split=imageURI.split("%3A");
    imageURI="content://media/external/images/media/"+photo_split[1];
  }

  largeImage.src = imageURI;
  document.getElementById('uploadpicbtn').style.display="block";

uploadimgdata=imageURI;
}

function capturePhotoWithFile() {
    navigator.camera.getPicture(onPhotoFileSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
}

// A button will call this function
//
function getPhoto(source) {
  alert("getphoto was called. source= "+source);
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
    destinationType: destinationType.FILE_URI,
    sourceType: source });
}
// Called if something bad happens.
//
function onFail(message) {
  alert('Failed because: ' + message);
}

$$(document).on('deviceready', function() {
	if(typeof navigator !== 'undefined' && typeof navigator.camera !== 'undefined'){
   		pictureSource = navigator.camera.PictureSourceType;
   		destinationType = navigator.camera.DestinationType;
	}
	  
	document.addEventListener("backbutton", function (e) { 
		e.preventDefault(); 
		
		if(EnAuditoria){
			CloseAuditoria();
			return false;
		}
		
		if (mainView.activePage.name === 'index' || mainView.activePage.name === 'control_lista') {
			showConfirm("Desea salir de la aplicación?", 'Salir',function(){  navigator.app.exitApp(); },function(){});
		} else {
			mainView.router.back();
		}
		$$('#MainToolbar .link').removeClass('active');
		$$('#MainToolbar .link.'+mainView.activePage.name).addClass('active');
		return false;
	}, false ); 
	$$('.view-main .navbar').show();
	//if($$('.view-main .toolbar').html() != '') $$('.view-main .toolbar').show();
	testLogin();
});

myApp.onPageInit('cuenta', function (page) {
	myApp.closePanel();
})

myApp.onPageInit('registro', function (page) {
	myApp.closePanel();
})

var mySwiper1 = myApp.swiper('.swiper-1', {
  pagination: '.swiper-1 .swiper-pagination',
  paginationHide: false,
  paginationClickable: true,
  nextButton: '.swiper-button-next',
  prevButton: '.swiper-button-prev',
});

myApp.onPageAfterAnimation('index', function (page){
	//mainView.showToolbar(false);
	//mainView.hideToolbar(true);
})

var XAP_init = false;
var Categorias = [];
var Turnos = [];
var Departamentos = [];
function HomeBloquesResize(){
	var height = $$(window).height() - $$('.navbar').height();
	height = ((height-45)/2);
	var font_size_h = (height * 0.5);
	var font_size_w = (($$(window).width() / 2) - 30) * 0.5;
	if(font_size_h > font_size_w) var fsize = font_size_w; else var fsize = font_size_h;
	$$('.bloquehome').css('height',height+'px');
	$$('.bloquehome i').css('line-height',(height-15)+'px');
	$$('.bloquehome i').css('font-size',fsize+'px');
	$$('.bloquehome span').css('margin-top',((fsize/2)-5)+'px');
}
$$(window).on('resize orientationchange', function (e) {	
	HomeBloquesResize();
});
$$(document).on('pageInit', function (e) {
	HomeBloquesResize();	
	if(!XAP_init){
		$$.getJSON(BXL_WWW+'/datos.php?tipo=datos_info', function (json) {
			Categorias = [];
			$$.each(json['categorias'], function (index, row) {
				Categorias.push(row);
			});
			Turnos = [];
			$$.each(json['turnos'], function (index, row) {
				Turnos.push(row);
			});
			Departamentos = [];
			$$.each(json['departamentos'], function (index, row) {
				Departamentos.push(row);
			});
		});
		XAP_init = true;
	}
	
    var page = e.detail.page;
	
    if (page.name === 'index') {
		testLogin();
		if(IniciadoSesion){
			if(SesionDatos['Tipo'] != 'STAFF'){
			//console.log(SesionDatos);
				setTimeout(function(){
					mainView.router.load({url:'control_lista.html'});
				}, 100);
				return;
			}
			GetEventos();
		}
		//mainView.showToolbar(true);
		//$$('#MainToolbar').html('');
	}else{
		//mainView.showToolbar(true);
		//mainView.hideToolbar(true);
	}
	
	$$('#MainToolbar .link').removeClass('active');
	$$('#MainToolbar .link.'+page.name).addClass('active');
	
    if (page.name === 'cuenta') {
		$$.getJSON(BXL_WWW+'/datos.php?tipo=cuenta', function (json) {
			console.log(json);
			$$('#Datos_Nombre').html(json['Nombre']);
			//$$('#Datos_DNI').html(json['DNI']);
			$$('#Datos_DNI').html(json['DNI']);
			$$('#Datos_Email').html(json['Email']);
			$$('#Datos_Horas').html('<input type="number" onChange="CambiarHoras(this.value);" value="'+json['Horas']+'">');
			//$$('#Datos_Puntos').html(parseInt(json['Puntos'])-parseInt(json['Canjes']));
		});
	}
	
    if (page.name === 'control_lista') {
	}
	
    if (page.name === 'puestos') {
		myApp.popup('.popup-getting-started');
		GetProductos();
	}
		
    if (page.name === 'historial') {
		GetHistorial();
	}
		
    if (page.name === 'calendario') {
		GetCalendario();
		//mainView.hideToolbar(false);
		//mainView.showToolbar(true);
		//$$('#MainToolbar').html($$('.calendar-toolbar').html());
		//$$('#MainToolbar').show();
	}
	
	myApp.closePanel();
})

function CloseLoaderPrincipal(){
	myApp.closeModal('.popup-getting-started');
}

function Registrarme() {
    //verificamos conexion y servidores
	$$.post(BXL_WWW+"/registro_usuario.php", {
			Nombre:document.getElementById('formreg_name').value,
			Tel:document.getElementById('formreg_tel').value,
			DNI:document.getElementById('formreg_dni').value,
			Email:document.getElementById('formreg_mail').value,
			Clave:document.getElementById('formreg_pass').value
		},
		function( data ) {
        	if (data == 'OK') {
				showMessage('¡Se registró con exito en El Show Del Mono!','Registro',function(){});
				login(document.getElementById('formreg_mail').value, document.getElementById('formreg_pass').value);
			}else{
				showMessage(data,'Error',function(){});
			}
		}
	);
}

function EnviarClaveNueva(){
	$$.post( BXL_WWW+"/cambiarclave.php", {Clave:$$('#Datos_ClaveVieja').val(), Clave2:$$('#Datos_ClaveNueva').val()},
		function( data ) {
        	if (data == 'OK') {
				showMessage("Contraseña cambiada correctamente",'Informacion',function(){});
				mainView.router.load({url:'index.html', reload: true});
			}else{
				showMessage(data,'Error',function(){});
			}
		}
	);
}

var IniciadoSesion = false;
var SesionDatos = {};
function login(strU, strP) {
    //verificamos conexion y servidores
	$$.post( BXL_WWW+"/login.php", {Email:strU, Clave:strP},
		function( data ) {
        	if (data == 'ERROR') {
				CloseLoaderPrincipal();
				MostrarModalLogin('Los datos no son correctos.<br/>');
			}else{				
				SesionDatos = JSON.parse(data);
				
				myApp.closeModal('.login-screen', false);
				var estrU = CryptoJS.AES.encrypt(strU, "strU");
				var estrP = CryptoJS.AES.encrypt(strP, "strP");
				window.localStorage.setItem("estru", estrU);
				window.localStorage.setItem("estrp", estrP);
				IniciadoSesion = true;
								
				if(SesionDatos['Tipo'] == 'STAFF'){
					$$('.only_staff').show();
					$$('.only_emp').hide();
					mainView.router.load({url:'index.html'});
				}else{
					mainView.router.load({url:'control_lista.html'});
					$$('.only_staff').hide();
					$$('.only_emp').show();
				}
				ConfigPush();
				CloseLoaderPrincipal();
				if(IniciadoSesion){
					//console.log('TraerEventos');
					GetEventos();
				}
				if(SesionDatos['ClaveCambiada'] == 'N') showMessage('Recuerde cambiar su contraseña','Informacion',function(){});
			}
		}
	);
}
function LogOut() {
	myApp.popup('.popup-getting-started');
	window.localStorage.clear();
	IniciadoSesion = false;
	mainView.router.load({url:'index.html', reload: true});
}

var LoginModal;
function MostrarModalLogin(salida){
	$$('.login-message').html(salida);
	myApp.loginScreen('.login-screen');
	/*
	myApp.loginScreen(salida+'Si no está registrado puede registrarse haciendo click <a href="registro.html" onclick="myApp.closeModal(LoginModal)">AQUÍ</a>', 'Iniciar sesión', function (username, password) {
		login(username, password);
	}, function(){ MostrarModalLogin(salida); });
	*/
}
function doLogin(){
	myApp.popup('.popup-getting-started');
	login($$('#login-user').val(), $$('#login-pass').val());
}

function testLogin(){
	if(IniciadoSesion) return;
	var estru = window.localStorage.getItem("estru");
	var estrp = window.localStorage.getItem("estrp");
	if ((estru != null && estru != '') && (estrp != null && estrp != '')) {
		var dstru = CryptoJS.AES.decrypt(estru, "strU");
		var dstrp = CryptoJS.AES.decrypt(estrp, "strP");
		login(dstru.toString(CryptoJS.enc.Utf8), dstrp.toString(CryptoJS.enc.Utf8)); 		
	}else{
		CloseLoaderPrincipal();
		MostrarModalLogin('');
	}
}

function ConfigPush(){
	try{
		var push = PushNotification.init({
			"android": {
				"senderID": "925542413455",
				"forceShow": true
			},
			"ios": {
				"senderID": "925542413455",
				alert: "true",
				badge: true,
				sound: 'true',
				"forceShow": true
			}
		});
		push.on('registration', function(data) {
			var oldRegId = localStorage.getItem('registrationId');
			if (oldRegId !== data.registrationId) {
				// Save new registration ID
				localStorage.setItem('registrationId', data.registrationId);
				// Post registrationId to your app server as the value has changed
			}
			$$.post( BXL_WWW+"/datos.php?tipo=register", {id:data.registrationId});
		});
		push.on('error', function(e) { console.log("push error = " + e.message); });
		push.on('notification', function(data) {
			if(typeof data.additionalData !== 'undefined'){
				var tipo = '';
				if(typeof data.additionalData.tipo !== 'undefined') tipo = data.additionalData.tipo;
				if(tipo != ''){
					if(data.title == 'Asignado a puesto'){
						mainView.router.load({url:'historial.html', reload: true});
					}else if(data.title == 'Nuevo puesto de trabajo'){
						mainView.router.load({url:'puestos.html', reload: true});
					}else if(data.title == 'Respondieron tu consulta'){
						mainView.router.load({url:'index.html', reload: true});
					}else{
						mainView.router.load({url:'index.html', reload: true});
						showMessage(data.message,data.title,function(){});
					}
				}
			}
	   });
	}
	catch(err) {
		console.log(err)
	}
}

function FiltrarPorEmpresa(){
	var empresa = $$('#FiltroEmpresa').val();
	if(empresa == 'todas'){
		$$('.producto_item').show();
	}else{
		$$('.producto_item').hide();
		$$('.prod_empresa_'+empresa).show();
	}
}

function GetProductos(){
	$$('.productos_lista').empty();
	$$.getJSON(BXL_WWW+'/datos.php?tipo=productos', function (json) {
		//console.log(json);
		var html = '';
		$$.each(json, function (index, row) {
			html += '<div id="prod_'+row.id+'" class="producto_item" categorias="'+row.Categorias+'">\
				<div class="card">\
                <div class="card-header">';
             /*html += '<div class="avatar">\
                    	<div class="circle-'+row.Estado+'"></div>\
                    </div>';*/
             html += '<div class="user flex-column">\
                        <div class="name">'+row.Cargo+' para '+row.Tipo+' en '+row.Sede+'</div>\
                        <div class="time">'+row.FechaYHora+'</div>\
                    </div>\
                </div>\
                <div class="card-content">\
                    <div class="text">Debes estar a las '+row.HoraPresencia+'</div>\
                </div>\
                <div class="card-footer flex-row">';
				
                html += '<a href="#" onclick="ProductoCanjear('+row.id+',\'A\')" class="tool flex-rest-width link"><i class="f7-icons">check</i> <span class="text">Aceptar puesto</span></a>';			
                html += '<a href="#" onclick="ProductoCanjear('+row.id+',\'R\')" class="tool flex-rest-width link"><i class="f7-icons">close</i> <span class="text">Rechazar puesto</span></a>';			
            html += '</div>\
            	</div>\
			</div>';			
		}); 
		$$('.productos_lista').html(html);
		CloseLoaderPrincipal();
	});
}
function EnviarConsulta(id,elm){
	var consulta = $$(elm).parent().find('textarea').val();
	if(consulta == ''){		
			showMessage("Debe escribir una consulta",'Error',function(){});
			return;
	}
	$$('.btn_consulta').remove();
	$$.post(BXL_WWW+"/datos.php?tipo=enviar_consulta", {id:id, msg:consulta},
		function( data ) {
			showMessage(data,'Consulta Enviada',function(){});
			GetEventos();
		}
	);
}
function GetEventos(){
	$$('.ProximosEventos').empty();
	$$.getJSON(BXL_WWW+'/datos.php?tipo=proximos', function (json) {
		//console.log(json);
		var html = '';
		$$.each(json, function (index, row) {
			html += '<div class="card facebook-card">'+
                     	'<div class="card-header no-border">'+
                        	'<div class="facebook-name">'+row.Cargo+' para '+row.Tipo+' en '+row.Sede+'</div>'+
                            '<div class="facebook-date">'+row.FechaYHora+'</div>'+
                        '</div>'+
                		'<div class="card-content">'+
                    		'<div class="text">Debes estar a las '+row.HoraPresencia+'</div>'+
							'<hr/>'+
                    		'<div class="consultas">'+
								row.Consultas+
								'<div class="item-input"><textarea style="border-radius:5px; width:100%; padding: 5px; box-sizing: border-box;" placeholder="Realizar una consulta"></textarea></div>'+
								'<a class="button right btn_consulta" href="#" onclick="EnviarConsulta('+row.evento_id+', this)">Enviar consulta</a>'+
							'</div>'+
                		'</div>'+
                        '<div class="card-footer no-border flex-row">'+
                        	'<a href="#" onclick="PedirReemplazo('+row.id+')" class="tool flex-rest-width link">Pedir reemplazo</a>'+
                        '</div>'+
                    '</div>';			
		}); 
		$$('.ProximosEventos').html(html);
		CloseLoaderPrincipal();
	});
}
function contains(obj, a) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === obj) {
            return true;
        }
    }
    return false;
}
function ProductoVerMas(id){
	var html = $$('#prod_'+id).html();
	$$('.popup-producto .contenido').html(html);
	$$('.popup-producto .contenido .card-footer').remove();
	//$$('.popup-producto .canjear').attr('onclick','ProductoCanjear('+id+')');
		
	var empresas_html = '<ul>';
	$$.each(Categorias, function (index, row) {
		var categorias = $$('#prod_'+id).attr("categorias").split(",");
		//console.log(categorias);
		if(contains(row.id, categorias)){
			empresas_html += '<li><a href="#" onclick="ProductoCanjear('+id+','+row.id+')" class="item-link list-button">'+row.Nombre+'</a></li>';
		}
	});
	empresas_html += '<li><a href="#" onclick="ProductoCanjear('+id+',\'0\')" class="item-link list-button">No estoy interesado</a></li>';
	empresas_html += '</ul>';
	$$('#PostularmePor').html(empresas_html);
		
	myApp.popup('.popup-producto');
}
function ProductoCanjear(id, categoria){
	if(categoria == 'A'){
		showConfirm('¿Esta seguro que desea aceptar el puesto?', 'Aceptar Puesto',function(){ProductoCanjearAction(id, categoria)},function(){});
	}else{
		showConfirm('¿Esta seguro que desea rechazar el puesto?', 'Rechazar Puesto',function(){ProductoCanjearAction(id, categoria)},function(){});
	}
}
function PedirReemplazo(id){
	showConfirm('¿Esta seguro que desea renunciar al puesto y pedir un reemplazo?', 'Pedir Reemplazo',function(){
		$$.getJSON(BXL_WWW+'/datos.php?tipo=reemplazo&id='+id, function (json) {
			if(json != 'OK'){
				showMessage(json['msg'],'Error',function(){});
			}else{
				showMessage('Recibimos su pedido de reemplazo!','Confirmación',function(){});
			}
			//myApp.closeModal('.popup-producto', false);
			//mainView.router.load({url:'puestos.html', reload: true});
			mainView.router.load({url:'index.html', reload: true});
		});
	},function(){});
}
function ProductoCanjearAction(id, categoria){
	$$.getJSON(BXL_WWW+'/datos.php?tipo=postularme&id='+id+'&categoria='+categoria, function (json) {
		if(json != 'OK'){
			showMessage(json['msg'],'Error',function(){});
		}else{
			if(categoria == 'A') showMessage('El puesto se aceptó con éxito!','Confirmación',function(){});
			if(categoria == 'R') showMessage('El puesto se rechazó correctamente!','Confirmación',function(){});
		}
		//myApp.closeModal('.popup-producto', false);
		//mainView.router.load({url:'puestos.html', reload: true});
		mainView.router.load({url:'puestos.html', reload: true});
	});
}

function GetHistorial(){
	$$.getJSON(BXL_WWW+'/datos.php?tipo=historial', function (json) {
		//console.log(json);
		var html = '';
		$$.each(json, function (index, row) {
			var Postulado = parseInt(row.Postulado) || 0;
			html += '<div id="prod_'+row.id+'" class="producto_item" categorias="'+row.Categorias+'">\
				<div class="card">\
                <div class="card-header">';
             html += '<div class="avatar">\
                    	<div class="circle-'+row.Estado+'"></div>\
                    </div>';
             html += '<div class="user flex-column">\
                        <div class="name">'+row.Departamento+'</div>\
                        <div class="time">'+row.Fecha+' - <b>'+row.Turno+'</b></div>\
                    </div>\
                </div>\
                <div class="card-content">\
                    <div class="text">'+row.Descripcion+'</div>\
                </div>\
            	</div>\
			</div>';			
		}); 
		$$('.historial_lista').html(html);
	});
}

function HistorialVerMas(id){
	var html = $$('#histo_'+id).html();
	$$('.popup-historial .contenido').html(html);
	$$('.popup-historial .contenido .card-footer').remove();
	$$('.popup-historial .descripcion_larga').show();
	myApp.popup('.popup-historial');
}
function CambiarHoras(val){
	$$.get(BXL_WWW+'/datos.php?tipo=horas&val='+val);
}

var monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto' , 'Septiembre' , 'Octubre', 'Noviembre', 'Diciembre'];
var calendarInline;
function GetCalendario(){
	calendarInline = myApp.calendar({
		container: '#calendar-inline-container',
		value: [new Date()],
		weekHeader: false,
		toolbarTemplate: 
			'<div class="toolbar calendar-custom-toolbar">' +
				'<div class="toolbar-inner">' +
					'<div class="left">' +
						'<a href="#" class="link icon-only"><i class="icon icon-back"></i></a>' +
					'</div>' +
					'<div class="center"></div>' +
					'<div class="right">' +
						'<a href="#" class="link icon-only"><i class="icon icon-forward"></i></a>' +
					'</div>' +
				'</div>' +
			'</div>',
		onOpen: function (p) {
			console.log(p);
			$$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
			$$('.calendar-custom-toolbar .left .link').on('click', function () {
				calendarInline.prevMonth();
			});
			$$('.calendar-custom-toolbar .right .link').on('click', function () {
				calendarInline.nextMonth();
			});
			$$('#PuestoFecha').html('Hoy');
		},
		onDayClick: function (p, dayContainer, year, month, day) {
			var Hoy = new Date();
			if(Hoy.getDay() == day && Hoy.getMonth() == month && Hoy.getFullYear() == year){
				$$('#PuestoFecha').html('Hoy');
			}else{
				$$('#PuestoFecha').html(day+'/'+(parseInt(month)+1)+'/'+year);
			}
		},
		onMonthYearChangeStart: function (p) {
			$$('.calendar-custom-toolbar .center').text(monthNames[p.currentMonth] +', ' + p.currentYear);
		}
	});    
}
function PostularmeCalendario(){
	var date = new Date(calendarInline.value);
	var day = date.getDate();
	if(day < 10) day = '0'+day;
	var month = (date.getMonth()+1);
	if(month < 10) month = '0'+month;
	var year = date.getFullYear();
	
	$$('#Postularme_Fecha').val(year+'-'+month+'-'+day);
	
	$$('.postularme_fecha').html(day+'/'+month+'/'+year);	
	
	var html = '';
	$$.each(Categorias, function (index, row) {
		html += '<option value="'+row.id+'">'+row.Nombre+'</option>';
	});
	$$('#Postularme_Categoria').html(html);
	
	var html = '';
	$$.each(Departamentos, function (index, row) {
		html += '<option value="'+row.id+'">'+row.Nombre+'</option>';
	});
	$$('#Postularme_Departamento').html(html);
	
	var html = '';
	$$.each(Turnos, function (index, row) {
		html += '<option value="'+row.id+'">'+row.Nombre+' ('+row.Horarios+')</option>';
	});
	$$('#Postularme_Turno').html(html);
	
	myApp.popup('.popup-postularme');
}
function EnviarSolicitud(){	
	myApp.popup('.popup-getting-started');
	$$.post(BXL_WWW+"/datos.php?tipo=enviar_solicitud", {
			Fecha:document.getElementById('Postularme_Fecha').value,
			Categoria:document.getElementById('Postularme_Categoria').value,
			Departamento:document.getElementById('Postularme_Departamento').value,
			Turno:document.getElementById('Postularme_Turno').value,
			Descripcion:document.getElementById('Postularme_Descripcion').value
		},
		function( data ) {
        	if (data == 'OK') {
				myApp.closeModal('.popup-postularme', false);
				CloseLoaderPrincipal();
			}else{
				showMessage(data,'Error',function(){});
			}
		}
	);
}