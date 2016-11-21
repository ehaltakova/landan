(function ($) { 
	
	/**
	 * Air Traffic Control
	 */
	$.ATC = function() {
		var self = this;
		this.interval = null;
		this.planes = {}; 
		this.runningAnimations = [];
		
		var $rad = $('#rad'),
        deg = 0;
		(function rotate() {    
	        $rad.css({ transform: 'rotate(' + deg + 'deg)'});
	        setTimeout(function() {
	            ++deg;
	            rotate();
	        }, 20);
	    })();
		 
		this.getPlanes();
		this.startUpdatingRadarScreen();
	};

    $.ATC.prototype = {
    	
    	getPlanes: function() {
    		
    		//this.testJiraDirectRequest()
    		
    		var self = this;
    		this.planes = {};
    		waitingToLand = 0;
    		
    		// TODO: call get planes WS directly from JIRA
    		$.ajax({
    			type: "POST",
    			contentType: "application/json; charset=utf-8",
    			url: "http://192.168.180.41:6789/innovasion/api/planes",     
    			async: true,
    			data: '',
    			success: function(resp) {
    				console.log(resp);
        			for(var i=0; i<resp.issues.length; i++) {
        				var issue = resp.issues[i];
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
        				var plane = new $.Plane(issue.id, issue.key, name, type, priority, gate, gateStr, position, status, destination, heading, lastUpdated);
        				self.planes[name] = plane;
        			}
        			self.drawPlanes();
    			},
    			error: function(resp) {
    				console.log(resp);
    			},
    			dataType: "json"               
    		});
    	},
    	
    	drawPlanes: function() {
    		    		
    		var self = this;
    		for(var name in this.planes) {
				var plane = this.planes[name];
				var posX = plane.left;
				var posY = plane.top;
				var html = "<div class='plane-div' id='" + plane.name + "' style='position:fixed;left:" + posX + "px;top:" + posY + "px;color:lightgrey'>";
				html += "<div id='flight_" + plane.name + "'><b>" + plane.name + "</b></div>";
				html += "<image data-name='" + plane.name +"' class='plane' width='28px' src='images/plane.png'/></div>";
				$("#radar").append(html);
			}
		
			// add animation
    		var counter = 1;
			$(".plane").each(function() {
				var planeElement = this;
				var animationElement = $(this).parent();
				var planeName = $(this).data("name");
				var plane = self.planes[planeName];
				if(plane.priority == "Urgent") {
					$("#flight_" + plane.name).css("color", "#f24045");
				}
				
				if(plane.status == "Open") {
					var startx = animationElement.position().left;
					var starty = animationElement.position().top;
					var delay = 250*counter;
					counter++;
					setTimeout(function(){
						animateCircle(animationElement, 3500+delay, 50, startx, starty);
					}, 0);			
				}
				
				if(plane.status == "Open") {
					// handle landing
					$(this).click(function(e) {
						self.stopUpdatingRadarScreen();
						$(this).popover({ 
			    			'title': '<span style="font-size:14px;" class="label label-primary ">'+plane.name+'</span><span class="cancel-img"><image id="cancel" src="images/cancel.png"></span>', 
			    			'html' : true,
						    'content': function() {
						    	var html = '<table class="plane-details"><tbody>' +
						    				  '<tr><td><span class="property-name label label-default">Heading:</span></td><td><span class="property-value">  ' + plane.heading + '</span></td></tr>' +
						    				  '<tr><td><span class="property-name label label-default">Destination:</span></td><td><span class="property-value">  ' + plane.destination + '</span></td></tr>' + 
						    				'</tbody></table>';
								html += 	'<div>Gate:<select id="gate"><option value="A1" selected>A1</option><option value="B1">B1</option><option value="B2">B2</option><option value="B3">B3</option></select></div>';
								html += 	'<button id="land' + plane.name + '" class="land btn btn-info">Land</button>';
								return html;
						    },
			    			'container':"body"
			    		}).on('show.bs.popover', function(currentPlaneElement, currentPlane) { 
			        		$('body').off().on('click', '.land', function() { 
			        			var selectedGate = $("#gate").val();
		        				self.land(currentPlaneElement, currentPlane, selectedGate);
			        			$(currentPlaneElement).popover('destroy');
			        			$(".popover").popover().hide();
			         		});
			        		$('body').on('click', '#cancel', function() { 
			        			self.startUpdatingRadarScreen();
			        			$(currentPlaneElement).popover('destroy');
			        			$(".popover").popover().hide();
			         		});
			    		}(planeElement, plane)).popover('show');
					});
				} else if(plane.status == "Landing") {
					self.stopUpdatingRadarScreen();
					self.land(planeElement, plane, plane.gateStr);
				} else if(plane.status == "Landed") {
					
				}
			});
    	},
    	
    	updatePlanes: function() {
    		var self = this;
    		waitingToLand = 0;
    		
    		var newPlanes = [];
    		// TODO: call get planes WS directly from JIRA
    		$.ajax({
    			type: "POST",
    			contentType: "application/json; charset=utf-8",
    			url: "http://192.168.180.41:6789/innovasion/api/planes",     
    			async: true,
    			data: '',
    			success: function(resp) {
    				console.log(resp);
        			for(var i=0; i<resp.issues.length; i++) {
        				var issue = resp.issues[i];
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
        				var plane = new $.Plane(issue.id, issue.key, name, type, priority, gate, gateStr, position, status, destination, heading, lastUpdated);
        				if(self.planes[name] == null) {
        					newPlanes.push(plane);
        				} else {
        					// take care for Landing and Landed for the updated
        					if(plane.status == "Landing") {
            					self.stopUpdatingRadarScreen();
            					self.land($(".plane[data-name='" + plane.name +"']"), plane, plane.gateStr);
            				} else if(plane.status == "Landed") {
            					
            				}
        				}
        				self.planes[name] = plane;
        			}
        			
        			// add new
            		for(var name in newPlanes) {
        				var newPlane = newPlanes[name];
        				var posX = newPlane.left;
        				var posY = newPlane.top;
        				var html = "<div class='plane-div' id='" + newPlane.name + "' style='position:fixed;left:" + posX + "px;top:" + posY + "px;color:lightgrey'>";
        				html += "<div id='flight_" + newPlane.name + "'><b>" + newPlane.name + "</b></div>";
        				html += "<image data-name='" + newPlane.name +"' class='plane' width='28px' src='images/plane.png'/></div>";
        				$("#radar").append(html);
        				
        				// add animation to the new
        				var counter = 1;
        				var animationElement = $("#"+newPlane.name);
        				if(newPlane.status == "Open") {
        					var startx = animationElement.position().left;
        					var starty = animationElement.position().top;
        					var delay = 250*counter;
        					counter++;
        					setTimeout(function(){
        						animateCircle(animationElement, 3500+delay, 50, startx, starty);
        					}, 0);	
        					
        					// attach popover
        					var planeImg = $(".plane[data-name='" + newPlane.name +"']");
        					console.log("aaaaaaaaaaaaaa");
        					console.log(planeImg);
        					$(".plane[data-name='" + newPlane.name +"']").click(function(e) {
        						console.log("Click!");
        						self.stopUpdatingRadarScreen();
        						$(this).popover({ 
        			    			'title': '<span style="font-size:14px;" class="label label-primary ">'+newPlane.name+'</span><span class="cancel-img"><image id="cancel" src="images/cancel.png"></span>', 
        			    			'html' : true,
        						    'content': function() {
        						    	var html = '<table class="plane-details"><tbody>' +
        						    				  '<tr><td><span class="property-name label label-default">Heading:</span></td><td><span class="property-value">  ' + newPlane.heading + '</span></td></tr>' +
        						    				  '<tr><td><span class="property-name label label-default">Destination:</span></td><td><span class="property-value">  ' + newPlane.destination + '</span></td></tr>' + 
        						    				'</tbody></table>';
        								html += 	'<div>Gate:<select id="gate"><option value="A1" selected>A1</option><option value="B1">B1</option><option value="B2">B2</option><option value="B3">B3</option></select></div>';
        								html += 	'<button id="land' + newPlane.name + '" class="land btn btn-info">Land</button>';
        								return html;
        						    },
        			    			'container':"body"
        			    		}).on('show.bs.popover', function(currentPlaneElement, currentPlane) { 
        			        		$('body').off().on('click', '.land', function() { 
        			        			var selectedGate = $("#gate").val();
        		        				self.land(currentPlaneElement, currentPlane, selectedGate);
        			        			$(currentPlaneElement).popover('destroy');
        			        			$(".popover").popover().hide();
        			         		});
        			        		$('body').on('click', '#cancel', function() { 
        			        			self.startUpdatingRadarScreen();
        			        			$(currentPlaneElement).popover('destroy');
        			        			$(".popover").popover().hide();
        			         		});
        			    		}(planeImg, newPlane)).popover('show');
        					});
        				} else if(plane.status == "Landing") {
        					self.stopUpdatingRadarScreen();
        					self.land(planeImg, newPlane, newPlane.gateStr);
        				} else if(plane.status == "Landed") {
        					
        				}
        			}
            		
            		// update emergency status
            		$(".plane").each(function() {
        				var plName = $(this).data("name");
        				var pl = self.planes[plName];
        				if(pl.priority == "Urgent") {
        					$("#flight_" + pl.name).css("color", "#f24045");
        				}
            		});
    			},
    			error: function(resp) {
    				console.log(resp);
    			},
    			dataType: "json"               
    		});
    	},
    	
    	startUpdatingRadarScreen: function() {
    		var self = this;
			if(this.runningAnimations.length == 0 && this.interval == null) {
				this.interval = setInterval(function() {
			        self.updatePlanes();
			    }, 4500);
			}
    	},
    	
    	stopUpdatingRadarScreen: function() {
    		clearInterval(this.interval);
			this.interval = null;
    	},
   
    	land: function(element, plane, selectedGate) {
    		if(selectedGate != "") {
    			plane.gateStr = selectedGate;
        		plane.gate = getGate(selectedGate);
    		} else {
    			selectedGate = plane.gateStr;
    		}
    		// update status
    		this.changeStatus(plane, "11", selectedGate, 'Landing'); // -> Landing
    		
    		// draw animation
    		var self = this;
    		var animationElement = $(element).parent();
			animationElement.stop();
			// TODO: calculate speed according to current position
			var currentLeft = animationElement.position().left;
			var currentTop = animationElement.position().top;
			var addX = 0; //Math.floor(Math.random() * (40 - 20 + 1) + 20);
			var addY = 0; //Math.floor(Math.random() * (40 - 20 + 1) + 20);	
			self.runningAnimations.push(plane.name);
			animationElement.animate({
				left : 70 + addX + 'px',
				top : (height-205) - addY + 'px'
			}, 4500, function() {
				setTimeout(function() {
					animationElement.animate({
						left : 450 + addX + 'px',
						top : (height-172) - addY +  'px'
					}, 4500, function() {
			    		self.changeStatus(plane, "21", plane.gateStr, 'Landed'); // -> Landed
						setTimeout(function() {
							var gate = plane.gate;
							animationElement.animate({
								left : gate.left + addX + 'px', //500 + addX + 'px',
								top : (gate.top + addY) + "px" //(height-150) - addY +  'px'
							}, 3500, function() {
								setTimeout(function() {
						    		self.changeStatus(plane, "31", plane.gateStr, 'Closed'); // -> Dock and Close
									self.planes[plane.name] = null;
									delete self.planes[plane.name];
									animationElement.remove();
									var index = self.runningAnimations.indexOf(plane.name);
									self.runningAnimations.splice(index, 1);
									self.startUpdatingRadarScreen();
								}, 5000);
							});
						}, 3000);
					});
				}, 1000);
			});
    	},
    	
    	changeStatus: function(plane, transition, gate, statusName) {
    		// update status
    		$.ajax({
    			type: "POST",
    			contentType: "application/json; charset=utf-8",
    			url: "http://192.168.180.41:6789/innovasion/api/plane/change",     
    			async: true,
    			data: '{"key":"' + plane.key + '", "transition" : "' + transition +'", "gate": "' + gate + '"}',
    			success: function(resp) {
       				plane.status = statusName;
    			},
    			error: function(resp) {
    				// TODO: ?!
    				if(statusName) {
        				plane.status = statusName;
    				}
    			},
    			dataType: "json"               
    		});
    	},
    	
    	testJiraDirectRequest: function() {
    		var query = "project=ATC&type='Landing Plane'&status not in ('Closed', 'Landed', 'Landing')";
    		$.ajax({
    			type: "POST",
    			contentType: "application/json; charset=utf-8",
    			url: "https://experts.nemetschek.bg/test-jira/rest/api/2/search",     
    			async: true,
    			beforeSend: function(xhr){xhr.setRequestHeader('Authorization', 'Basic RWxpdHphIEhhbHRha292YTpob21xNGU5OA==');},
    			data: '{"jql":"' + query + '"}',
    			success: function(resp) {
    			},
    			error: function(resp) {
    				console.log(resp);
    			},
    			dataType: "json"               
    		});
    	}
    };
    
	$.Plane = function(id, key, name, type, priority, gate, gateStr, coordinates, status, destination, heading, lastUpdated) {
		this.id = id;
		this.key = key;
		this.name = name; 
		this.priority = priority;
		this.gateStr = gateStr;
		this.gate = gate;
		this.type = type;
		this.left = coordinates.split(":")[0]; 
		this.top = coordinates.split(":")[1]; 
		this.status = status; 
		this.destination = destination;
		this.heading = heading;
		this.lastUpdated = lastUpdated;
	};

}(jQuery));

function animateCircle(element, speed, radius, startx, starty, phi) {
	if (!phi) {
		phi = 0
	};
	var int = 2 * (Math.PI) / speed;
	phi = (phi >= 2 * (Math.PI)) ? 0 : (phi + int);
	var $m = startx - radius * Math.cos(phi);
	var $n = starty - radius * Math.sin(phi);
	element.animate({
		left : $m + 'px',
		top : $n + 'px'
	}, 1, function() {
		animateCircle.call(this, element, speed, radius, startx, starty, phi);
	});

};

var offsetX = 10;
var offsetY= 10;
var width = 650 + offsetX;
var height = 650 + offsetY;

var busyGates = [];
function getGate(gateStr) {
	var gate = {};
	switch(gateStr) {
		case "B2":
			gate = {"left":370, "top":540};
			break;
		case "B3":
			gate = {"left":228, "top":545};
			break;
		case "A1":
			gate = {"left":135, "top":530};
			break;
		case "B1":
			gate = {"left":558, "top":513};
			break;
		default:
			gate = {"left":370, "top":540};
	}
	return gate;
}

