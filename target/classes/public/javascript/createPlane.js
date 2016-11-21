var planeObj = null;
var planeCookie = getCookie("plane");
var interval = null;

$( document ).ready(function() {
    
	var width = $(window).width();
	var height = $(window).height();
	$("#radar-red").css("height", $( window ).height()-100);
	
	if(planeCookie != "") {
		//$("#showCreateDialog").hide();
		$("#showCreateDialog").attr("disabled", true);
		planeCookie = JSON.parse(planeCookie);
		getPlane(planeCookie.key);
	} 
	
	/************************* Create Plane ***********************/
	$("#showCreateDialog").on("click", function() {
		$('#createPlaneDialog').modal('show'); 
		
		$('body').on('hidden.bs.modal', '#showCreateDialog', function () { // clear form on dialog hide
			 $("#formErrors").html("");
    		 $('#showCreateDialog').get(0).reset();
    		 $(dialog).data('bs.modal', null);
    		 $(dialog).removeData('bs.modal');
		});
	});
	
	$("#createPlaneBtn").on("click", function(e) {
		e.preventDefault();
		
		var errorMessages = validateForm();
		if(errorMessages['messages'].length > 0) {
			displayNotification(errorMessages['type'], errorMessages['messages'], '#formErrors', false);
			return false;
		}
		
		$('#createPlaneDialog').modal('hide');
	
		var data = {'fields':{}};
		
		var flightNumber = $("#flightNumber").val(); // summary
		var heading = parseInt($("#heading").val()); // customfield_13402
		var destination = $("#destination").val(); // customfield_13400
		//var gate = $("#gate").val(); // customfield_13403
		var maxX = 500;
		var minX = 120;
		var maxY = 300;
		var minY = 120;
		var posX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
		var posY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
		var position=posX+":"+posY;
		
		data['fields']['project'] = {'key': 'ATC'};
		data['fields']['issuetype'] = {'name': 'Landing Plane'};
		data['fields']['summary'] = flightNumber;
		data['fields']['customfield_13402'] = heading;
		data['fields']['customfield_13400'] = {'value': destination};
		data['fields']['customfield_13403'] = {'value': 'A1'};
		data['fields']['customfield_13401'] = position;

		if($('#emergency').is(":checked")) {
			data['fields']['priority'] = {'name':'Urgent'};
		}
		data = JSON.stringify(data);
		
		$.ajax({
			type: "POST",
			contentType: "application/json; charset=utf-8",
			url: "http://192.168.180.41:6789/innovasion/api/plane/create",     
			async: true,
			data: data,
			success: function(resp) {
				console.log("success");
				console.log(resp);
				
				var issueKey = resp.key;
				
				var divWidth = $("#radar-red").width();
				var divHeight = $("#radar-red").height();
				var horizontalOffset = (width - height)/2;
				var smallPosX = posX*divHeight/650 + horizontalOffset;
				var smallPosY = posY*divHeight/650;

				var html = "<div class='plane-div' id='" + flightNumber + "' style='position:fixed;left:" + smallPosX + "px;top:" + smallPosY + "px;color:lightgrey'>";
				html += "<div><b>" + flightNumber + "</b></div>";
				html += "<image data-name='" + flightNumber +"' id='plane' width='33px' src='images/plane.png'/></div>";
				$("#radar-red").append(html);
				//$("#showCreateDialog").hide();
				$("#showCreateDialog").attr("disabled", true);

				// animate plane
				var animationElement = $("#plane").parent();
				animateCircle(animationElement, 200, 5, smallPosX, smallPosY);
				
				// set cookie
				var cookie = {};
				cookie['key'] = issueKey;
				cookie['smallPosX'] = smallPosX;
				cookie['smallPosY'] = smallPosY;
				cookie['flightNumber'] = flightNumber;
				setCookie("plane", JSON.stringify(cookie), 1);
			},
			error: function(resp) {
				console.log(resp);
			},
			dataType: "json"               
		});
	});
});

function getPlane(key) {
	$.ajax({
		type: "GET",
		contentType: "application/json; charset=utf-8",
		url: "http://192.168.180.41:6789/innovasion/api/plane/" + key,     
		async: true,
		success: function(resp) {
			console.log("success get planes");
			console.log(resp);
			var issue = resp;
			var fields = issue.fields;
			var name = fields.summary;
			var gate = getGate(fields.customfield_13403.value);
			var gateStr = fields.customfield_13403.value;
			var type = fields.issuetype.name;
			var position = fields.customfield_13401;
			var status = fields.status.name
			var destination = fields.customfield_13400.value;
			var heading = fields.customfield_13402;
			var lastUpdated = fields.updated;
			var priority = fields.priority.name;
			planeObj = new $.Plane(issue.id, issue.key, name, type, priority, gate, gateStr, position, status, destination, heading, lastUpdated);
			console.log(planeObj);
			if(planeObj.status == 'Open') {
				var html = "<div class='plane-div' id='" + planeCookie['flightNumber'] + "' style='position:fixed;left:" + planeCookie.smallPosX + "px;top:" + planeCookie.smallPosY + "px;color:lightgrey'>";
				html += "<div><b>" + planeCookie.flightNumber + "</b></div>";
				html += "<image data-name='" + planeCookie.flightNumber +"' id='plane' width='33px' src='images/plane.png'/></div>";
				$("#radar-red").append(html);
				//$("#showCreateDialog").hide();
				$("#showCreateDialog").attr("disabled", true);

				// animate plane
				var animationElement = $("#plane").parent();
				animateCircle(animationElement, 200, 5, planeCookie.smallPosX, planeCookie.smallPosY);
				
			} else if(planeObj.status == 'Landing') {
				$('#showLandingDialog').modal('show'); 
				$(document).on('show.bs.modal', '.modal', centerModal);
			    $(window).on("resize", function () {
			        $('.modal:visible').each(centerModal);
			    });
			} else {
				 
				$("#showCreateDialog").attr("disabled", false);
				$("#plane").stop();
				$("#plane").parent().remove();
				$('#showLandingDialog').modal('hide');
				clearCookie("plane");
			}
		
			
			console.log("set interval");
			interval = setInterval(function() {
		        updatePlane(planeCookie.key);
		    }, 1500);
		},
		error: function(resp) {
			console.log(resp);
		},
		dataType: "json"               
	});
}

function updatePlane(key) {
	console.log("update!");
	$.ajax({
		type: "GET",
		contentType: "application/json; charset=utf-8",
		url: "http://192.168.180.41:6789/innovasion/api/plane/" + key,     
		async: true,
		success: function(resp) {
			console.log("success");
			console.log(resp);
			var issue = resp;
			var fields = issue.fields;
			var name = fields.summary;
			var gate = getGate(fields.customfield_13403.value);
			var gateStr = fields.customfield_13403.value;
			var type = fields.issuetype.name;
			var position = fields.customfield_13401;
			var status = fields.status.name
			var destination = fields.customfield_13400.value;
			var heading = fields.customfield_13402;
			var lastUpdated = fields.updated;
			var priority = fields.priority.name;
			planeObj = new $.Plane(issue.id, issue.key, name, type, priority, gate, gateStr, position, status, destination, heading, lastUpdated);
			console.log(planeObj);
			if(planeObj.status == 'Open') {
				$("#showCreateDialog").attr("disabled", true);
			} else if(planeObj.status == 'Landing') {
				$('#showLandingDialog').modal('show'); 
				$(document).on('show.bs.modal', '.modal', centerModal);
			    $(window).on("resize", function () {
			        $('.modal:visible').each(centerModal);
			    });
			} else {
				$("#showCreateDialog").attr("disabled", false);
				$("#plane").stop();
				$("#plane").parent().remove();
				$('#showLandingDialog').modal('hide');
				clearCookie("plane");
			}
		},
		error: function(resp) {
			console.log(resp);
		},
		dataType: "json"               
	});
}

function drawLanding() {
	
	var divWidth = $("#radar-red").width();
	var divHeight = $("#radar-red").height();
	var horizontalOffset = (width - divWidth)/2;
	var verticalOffset = (height - divHeight)/2;
	
	var animationElement = $("#plane").parent();
	animationElement.stop();
	var currentLeft = animationElement.position().left;
	var currentTop = animationElement.position().top;
	//self.runningAnimations.push(plane.name);
	
	var smallPosX = 70*divHeight/650 + horizontalOffset;
	var smallPosY = (650-205)*divHeight/650 + verticalOffset;
	
	animationElement.animate({
		left : smallPosX + 'px',
		top : smallPosY + 'px'
	}, 4500, function() {
		setTimeout(function() {
			smallPosX = 450*divHeight/650 + horizontalOffset;
			smallPosY = (650-172)*divHeight/650 + verticalOffset;
			animationElement.animate({
				left : smallPosX + 'px',
				top : smallPosY + 'px'
			}, 4500, function() {
				var gate = planeObj.gate;
				smallPosX = gate.left*divHeight/650 + horizontalOffset;
				smallPosY = gate.right*divHeight/650 + verticalOffset;
	    		//self.changeStatus(plane, "21", plane.gateStr, 'Landed'); // -> Landed
				setTimeout(function() {
					animationElement.animate({
						left : smallPosX + 'px', //500 + addX + 'px',
						top : smallPosY + "px" //(height-150) - addY +  'px'
					}, 3500);
				}, 5000);
			});
		}, 1000);
	});
}

function drawLanded() {
	
	var gate = planeObj.gate;
	
	var divWidth = $("#radar-red").width();
	var divHeight = $("#radar-red").height();
	var horizontalOffset = (width - divWidth)/2;
	var verticalOffset = (height - divHeight)/2;
	var smallPosX = gate.left*divHeight/650 + horizontalOffset;
	var smallPosY = gate.top*divHeight/650 + verticalOffset;

	var html = "<div class='plane-div' id='" + planeObj.name + "' style='position:fixed;left:" + smallPosX + "px;top:" + smallPosY + "px;color:lightgrey'>";
	html += "<div><b>" + planeObj.name + "</b></div>";
	html += "<image data-name='" + planeObj.name +"' id='plane' width='33px' src='images/plane.png'/></div>";
	$("#radar-red").append(html);
}

function validateForm() {
	
	var errorMessages = {'type' : 'danger', 'messages': []};
	var flightNumber = $("#flightNumber").val().trim();
	var heading = $("#heading").val().trim();
	var gate = $("#gate").val(); 
	var destination = $("#destination").val();
	
	// check for flightNumber
	if(flightNumber == null || flightNumber == "") {
		errorMessages['messages'].push("Flight number should not be empty.\n");
    } else {
    	var regex = new RegExp("^[A-Z]{2}[0-9]{4}$");
    	console.log(flightNumber);
    	console.log(regex.test(flightNumber))
        if(!regex.test(flightNumber)) {
        	errorMessages['messages'].push("Flight number should consist of two CAPITAL letters followed by 4 digits.\n");
        }
    }
	
	// check for heading
	if(heading == null || heading == "") {
		errorMessages['messages'].push("Heading should not be empty.\n");
    } else {
    	var regex = new RegExp("^[0-9]{3}$"); 
        if(!regex.test(heading)) {
        	errorMessages['messages'].push("Heading should be 3-digit number.\n");
        }
    }
	return errorMessages;
}

function setCookie(name, value, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expireDate = d.toUTCString();
	var expires = 'expires=' + expireDate;
	if(value != '') {
		var content = JSON.parse(value);
		content['expireDate'] = expireDate;
		value = JSON.stringify(content); // add the expiration date to the cookie value itself
	}
	document.cookie = name + '=' + escape(value) + '; ' + expires;
}

function clearCookie(name) {
	setCookie(name, '', 1);
}

function getCookie(cookieName) {
	var name = cookieName + '=';
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1);
		if (c.indexOf(name) == 0) return unescape(c.substring(name.length, c.length));
	}
	return '';
}

function displayNotification(type, messages, selector, insertBefore) {
	var html = '<div class="alert alert-'+ type + ' alert-dismissable">' +
 					'<button type="button" class="close" data-dismiss="alert" aria-hidden="true">' + 
 						'&times;' + 
 					'</button>';
	for(var i=0; i<messages.length; i++) {
		html += "<div>"+messages[i]+'</div>';
	}
	html += '</div>';
	if(insertBefore) {
		$(selector).before(html);
	} else {
		$(selector).html(html);
	}
}

function centerModal() {
    $(this).css('display', 'block');
    var $dialog  = $(this).find("#showLandingDialog"),
    offset       = ($(window).height() - $dialog.height()) / 2,
    bottomMargin = parseInt($dialog.css('marginBottom'), 10);

    // Make sure you don't hide the top part of the modal w/ a negative margin if it's longer than the screen height, and keep the margin equal to the bottom margin of the modal
    if(offset < bottomMargin) offset = bottomMargin;
    $dialog.css("margin-top", offset);
}