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
	myApp.alert(message, title, function(){ CloseLoaderPrincipal();  });
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

function AddAuditoria(){
	myApp.showPreloader();
	$$.getJSON(BXL_WWW+'/datos.php?tipo=obtenerSedes',
		function( data ) {
			myApp.hidePreloader();
			var Botones = [];
			$$.each(data, function(i, row){
				var ItemID = row.id;
				var Nombre = row.Nombre;
				Botones.push({
					text: Nombre,
					onClick: function() {
						AddAuditoriaAccion(ItemID, Nombre);
					}
				  });
			});			
			myApp.modal({
				title:  'Seleccione una sede',
				text: '',
				verticalButtons: true,
				buttons: Botones
			});
		}
	);
}
var EnAuditoria = false;
function AddAuditoriaAccion(sede, sedetext){
	myApp.showPreloader();
	EnAuditoria = true;
	$$('#FormAuditoria .accion').val("A");
	$$('.titulo-auditoria').html(sedetext);
	$$('#FormAuditoria .sede').val(sede);
	$$('#FormAuditoria .id').val("");
	
	$$.post(BXL_WWW+'/datos.php?tipo=addAuditoria&sede='+sede, { },
		function( data ) {
			myApp.hidePreloader();
			$$('#ContainerAuditoria').html(data);
			myApp.popup('.popup-auditoria');
		}
	);
}
function EditarAuditoria(id){
	myApp.showPreloader();
	EnAuditoria = true;	
	$$.getJSON(BXL_WWW+'/datos.php?tipo=editAuditoria&id='+id,
		function( data ) {
			$$('#ContainerAuditoria').html(data['html']);
			$$('#FormAuditoria .accion').val("U");
			$$('.titulo-auditoria').html(data['Sede']);
			$$('#FormAuditoria .sede').val(data['hotel_id']);
			$$('#FormAuditoria .id').val(id);
			
			if(data['Foto'] != ''){
				$$('.audi_item_total textarea').val(data['Foto']);
				$$('.audi_item_total .foto').addClass('ok');
			}
			if(data['Comentario'] != ''){
				$$('.audi_item_total2 textarea').val(data['Comentario']);
				$$('.audi_item_total2 .mensaje').addClass('ok');
			}
			if(data['Firma'] != ''){
				$$('.audi_item_total3 textarea').val(data['Firma']);
				$$('.audi_item_total3 .foto').addClass('ok');
			}
			
			myApp.hidePreloader();
			myApp.popup('.popup-auditoria');
		}
	);
}
function CloseAuditoria(){
	showConfirm("¿Desea salir de la auditoría? Se perderán todas las modificaciones.", 'Salir de Auditoría',function(){  
		myApp.closeModal('.popup-auditoria'); 
		EnAuditoria = false;
	},function(){});
}


function ChangeCustomCheck(id) {
	if($$('.audi_item_'+id).hasClass('noaplica')) return;
	if($$('.audi_item_'+id+' .custom_check').hasClass('ok')){
		$$('.audi_item_'+id+' .custom_check').removeClass('ok');
		$$('.audi_item_'+id+' .custom_check').addClass('nm');
		$$('.audi_item_'+id+' .valor').val('50');
	}else if($$('.audi_item_'+id+' .custom_check').hasClass('nm')){
		$$('.audi_item_'+id+' .custom_check').removeClass('nm');
		$$('.audi_item_'+id+' .custom_check').addClass('bad');
		$$('.audi_item_'+id+' .valor').val('0');
	}else if($$('.audi_item_'+id+' .custom_check').hasClass('bad')){
		$$('.audi_item_'+id+' .custom_check').removeClass('bad');
		$$('.audi_item_'+id+' .valor').val('');
	}else{
		$$('.audi_item_'+id+' .custom_check').addClass('ok');
		$$('.audi_item_'+id+' .valor').val('100');
	}
}
function FotoItem(id) {
	if($$('.audi_item_'+id).hasClass('noaplica')) return;
  	navigator.camera.getPicture(function(imageData) {
	  	/*var smallImage = document.getElementById('fotopreview');
	  	smallImage.style.display = 'block';
	  	smallImage.src = "data:image/jpeg;base64," + imageData;*/
        if(imageData != ''){
            $$('.audi_item_'+id+' .img').val("data:image/jpeg;base64,"+imageData);
            $$('.audi_item_'+id+' .foto').addClass('ok');
        }
	}, function(){}, { quality: 50,	destinationType: destinationType.DATA_URL });
}
var MensajeID = 0;
function MensajeItem(id) {
	if($$('.audi_item_'+id).hasClass('noaplica')) return;
	MensajeID = id;
	myApp.pickerModal('.picker-comentario');
	$$('.picker-comentario h4').html($$('.audi_item_'+id+' > .item-inner > .item-title').html());
	$$('.picker-comentario textarea').val();
	$$('.picker-comentario textarea').each(function(index, element) {
        $$(element).val($$('.audi_item_'+id+' .msg').val());
    });
}
function SaveMensajeItem() {
	var mensaje = "";	
	$$('.picker-comentario textarea').each(function(index, element) {
        if($$('.picker-comentario textarea').length-1 == index) mensaje=$$(element).val();
    });
	$$('.audi_item_'+MensajeID+' .msg').val(mensaje);
	$$('.audi_item_'+MensajeID+' .mensaje').addClass('ok');
	if(mensaje == ''){
		$$('.audi_item_'+MensajeID+' .mensaje').removeClass('ok');
	}
	$$('.picker-comentario textarea').each(function(index, element) {
        $$(element).val('');
    });
	myApp.closeModal('.picker-comentario');
	MensajeID = 0;
}

var FirmaID = 0;
var firma_canvas = document.getElementById("firma_canvas");
document.getElementById("firma_canvas").width = ($$(window).width() < $$(window).height()) ? $$(window).width() : $$(window).height();
document.getElementById("firma_canvas").style.width = ($$(window).width() < $$(window).height()) ? $$(window).width()+'px' : $$(window).height()+'px';
var signaturePad = new SignaturePad(firma_canvas, {
  backgroundColor: 'rgba(255, 255, 255, 1)',
  penColor: 'rgb(0, 0, 0)'
});
function LimpiarFirma(){
	signaturePad.clear();
}
function Firma(id) {
	if($$('.audi_item_'+id).hasClass('noaplica')) return;
	FirmaID = id;
	var imgfirma = $$('.audi_item_'+FirmaID+' .img').val();
	if(imgfirma) signaturePad.fromDataURL(imgfirma, {ratio: 1});
	myApp.pickerModal('.picker-firma');
}
function SaveFirmaItem() {
	$$('.audi_item_'+FirmaID+' .img').val(signaturePad.toDataURL("image/jpeg"));
	$$('.audi_item_'+FirmaID+' .foto').addClass('ok');
	if(signaturePad.isEmpty()){
		$$('.audi_item_'+FirmaID+' .foto').removeClass('ok');
		$$('.audi_item_'+FirmaID+' .img').val('');
	}
	myApp.closeModal('.picker-firma');
	FirmaID = 0;	
	signaturePad.clear();
}

function MasOpciones(id){	
	myApp.modal({
		title:  'Item de auditoría',
		text: $$('.audi_item_'+id+' > .item-inner > .item-title').html(),
		buttons: [
		  {
			text: 'Aplica',
			onClick: function() {
				$$('.audi_item_'+id).removeClass('noaplica');
			}
		  },
		  {
			text: 'No Aplica',
			onClick: function() {
				$$('.audi_item_'+id+' .valor').val('NA');
				$$('.audi_item_'+id+' textarea').val('');
				$$('.audi_item_'+id+' .foto').removeClass('ok');
				$$('.audi_item_'+id+' .mensaje').removeClass('ok');
				$$('.audi_item_'+id+' .custom_check').removeClass('ok');
				$$('.audi_item_'+id+' .custom_check').removeClass('nm');
				$$('.audi_item_'+id+' .custom_check').removeClass('bad');
				$$('.audi_item_'+id).addClass('noaplica');
			}
		  }
		]
	});
}

function EnviarAuditoria(){
	var Listo = true;
	$$('.audi_item .valor').each(function(index, element) {
        if($$(element).val() == '') Listo = false;
    });
	if(!Listo){
		showMessage('Faltan completar items','Auditoría',function(){});
		return;
	}
	if($$('.audi_item_total textarea').val() == ''){
		showConfirm("¿Desea enviar la auditoría sin foto?", 'Auditoría',function(){  
			EnviarAuditoriaAccion();
		},function(){});
		return;
	}else if($$('.audi_item_total2 textarea').val() == ''){
		showConfirm("¿Desea enviar la auditoría sin comentarios?", 'Auditoría',function(){  
			EnviarAuditoriaAccion();
		},function(){});
		return;
	}else if($$('.audi_item_total3 textarea').val() == ''){
		showMessage('Debe firmar la auditoría para enviarla','Auditoría',function(){});
		return;
	}
	EnviarAuditoriaAccion();
}

function EnviarAuditoriaAccion(){
	GuardarAuditoriaAjax('Y');
}
function GuardarAuditoria(){
	GuardarAuditoriaAjax('N');
}
function GuardarAuditoriaAjax(Finalizada){	
	myApp.showPreloader();
	$$('.popup-auditoria .Finalizada').val(Finalizada);
	$$.post(BXL_WWW+'/datos.php?tipo=saveAuditoria', myApp.formToData('#FormAuditoria'),
		function( data ) {
			myApp.hidePreloader(); 
			myApp.closeModal('.popup-auditoria');
			mainView.router.load({url:'control_lista.html', reload: true});
		}
	);
}

function GetAuditorias(){
	myApp.showPreloader();
	$$('#tab_audit_pendientes').empty();
	$$('#tab_audit_finalizadas').empty();
	$$.getJSON(BXL_WWW+'/datos.php?tipo=Auditorias', function (json) {
		console.log(json);
		var html_P = '';
		var html_F = '';
		$$.each(json, function (index, row) {
			var html = '';
			var onclick = 'EditarAuditoria('+row.id+')';
			if(row.Finalizada == 'Y') onclick = '';
			html += '<div onclick="'+onclick+'">\
				<div class="card">\
                <div class="card-header">\
					<div class="user" style="width:100%;">\
			 			<div style="float:right; color: #c02222;">'+row.Completado+'/'+row.Items+'</div>\
                        <div class="name" style="font-size: 20px;">'+row.Sede+'</div>\
                        <div class="time">'+row.Fecha+'</div>\
                    </div>\
                </div>\
                <div class="card-content">\
                    <div class="text">Usuario: '+row.NombreCompleto+'</div>\
                </div>\
            	</div>\
			</div>';	
			if(row.Finalizada == 'Y'){
				html_F += html;
			}else{
				html_P += html;
			}
		});
		
		$$('#tab_audit_pendientes').html(html_P);
		$$('#tab_audit_finalizadas').html(html_F);
		myApp.hidePreloader();
	});
}

var pictureSource;
var destinationType;
$$(document).on('deviceready', function() {	  
	if(typeof navigator.camera !== 'undefined'){
        pictureSource=navigator.camera.PictureSourceType;
        destinationType=navigator.camera.DestinationType;
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
		//lista_auditorias
		GetAuditorias();
	}
	
    if (page.name === 'puestos') {
		myApp.showPreloader();
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
	myApp.hidePreloader();
	$$('.modal-overlay').remove();
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
        //console.log(data);
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
                    GetConfirmaciones();
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
					if(data.title == 'Confirme asistencia'){
						mainView.router.load({url:'index.html', reload: true});
                        GetConfirmaciones();
					}else if(data.title == 'Asignado a puesto'){
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


function GetConfirmaciones(){
	$$.getJSON(BXL_WWW+'/datos.php?tipo=confirmaciones', function (json) {
		$$.each(json, function (index, row) {
          myApp.modal({
            title:  'Confirmación de asistencia',
            text: 'Confirma su asistencia para el '+row.Tipo+' en '+row.Sede+' mañana a las '+row.HoraPresencia,
            buttons: [
              {
                text: 'Confirmar',
                onClick: function() {
                    $$.post(BXL_WWW+"/datos.php?tipo=confirmaAsistencia", {id:row.id, confirma:'Y'},
                        function( data ) {
                            showMessage('Confirmación enviada','Confirmación Enviada',function(){});
                            GetConfirmaciones();
                        }
                    );
                }
              },
              {
                text: 'Rechazar',
                onClick: function() {
                    $$.post(BXL_WWW+"/datos.php?tipo=confirmaAsistencia", {id:row.id, confirma:'C'},
                        function( data ) {
                            showMessage('Confirmación enviada','Confirmación Enviada',function(){});
                            GetConfirmaciones();
                        }
                    );
                }
              }
            ]
          })
		}); 
	});
}

function GetProductos(){
	$$('.productos_lista').empty();
	$$.getJSON(BXL_WWW+'/datos.php?tipo=productos', function (json) {
		//console.log(json);
		var html = '';
		$$.each(json, function (index, row) {
			html += '<div id="prod_'+row.id+'" fecha="'+row.FechaOFI+'" tipo="'+row.Tipo+'" cargo="'+row.Cargo+'" sede="'+row.Sede+'" class="producto_item" categorias="'+row.Categorias+'">\
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
			if(categoria == 'A'){ 
                showMessage('El puesto se aceptó con éxito!','Confirmación',function(){});
                
                var tipo = $$("#prod_"+id+"").attr('tipo');
                var fecha = $$("#prod_"+id+"").attr('fecha');
                var sede = $$("#prod_"+id+"").attr('sede');
                var cargo = $$("#prod_"+id+"").attr('cargo');
                var text = $$("#prod_"+id+" .text").text();
                var startDate = new Date(fecha);
                window.plugins.calendar.createEvent(cargo+" para "+tipo,sede,text,startDate,startDate,function(){},function(){});
            }
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