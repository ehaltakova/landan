(function ($) { 
	
	/**
	 * Air Traffic Control
	 */
	$.ATC = function() {
		this.interval = setInterval(function() {
	        console.log("repeat");
	    }, 4000);
		this.planes = []; 
		this.getPlanes();
	};

    $.ATC.prototype = {
    	
    	getPlanes: function() {
    		// TODO: call get planes WS
    		var names = ['FR6301', 'LH1702', 'UA9246', 'W64332', 'W67032', 'RY1332', 'LH3341', 'BG0301',]
    		for(var i=0; i<8; i++) {
				this.planes.push(new $.Plane(names[i], generateRandomCoordinates(), 'open'));
			}
    		this.drawPlanes();
    	},
    	
    	addPlane: function() {
    		var balloonObject = this.wireDiagram.balloons[this.id]; // get the UI object corresponding to te balloon actor
    		balloonObject.setValue(this.value, false); 
    	},
    	
    	drawPlanes: function() {
    		
    		var self = this;
    		
    		var html = "";
    		for(var i=0; i< this.planes.length; i++) {
				var plane = this.planes[i];
				html += "<div id='" + plane.name + "' style='position:fixed;left:" + plane.left + "px;top:" + plane.top + "px;color:lightgrey'>";
				html += "<div><b>" + plane.name + "</b></div>";
				html += "<image class='plane' width='37px' src='images/plane.png'/></div>";
			}
			$("#radar").html(html);
			
			$(".plane").each(function(image) {
				var animationElement = $(this).parent();
				var startx = animationElement.position().left;
				var starty = animationElement.position().top;
				animateCircle(animationElement, 125, 5, startx, starty);
			});

			// land
			$(".plane").click(function(e) {
				clearInterval(self.interval);
				self.interval = null;
				var plane = this;
				$(this).popover({ 
	    			'title': "Choose Action:", 
	    			'html' : true,
				    'content': function() {
						return $("#landPopover").html();
				    },
	    			'container':"body"
	    		}).on('show.bs.popover', function(currentPlane) { 
	        		$('body').off().on('click', '#land', function() { 
	        			self.land(currentPlane);
	        			$(currentPlane).popover('destroy');
	        			$(".popover").popover().hide();
	         		});
	        		$('body').on('click', '#cancel', function() { 
	        			$(currentPlane).popover('destroy');
	        			$(".popover").popover().hide();
	        			if(self.interval == null) {
		        			self.interval = setInterval(function() {
		        		        console.log("repeat");
		        		    }, 4000);
	        			}
	         		});
	    		}(plane)).popover('show');
			});
    	},
    	
    	drawPlane: function() {
    		
    	},
    	
    	checkForNewPlanes: function() {
    		setInterval(function(){ alert("Hello"); }, 4000);
    	},
    	
    	land: function(element) {
    		
    		$.ajax({
    			type: "POST",
    			contentType: "application/json; charset=utf-8",
    			url: "https://experts.nemetschek.bg/test-jira/rest/auth/1/session",     
    			async: true,
    			data: '{ "username": "Elitza Haltakova", "password": "homq4e98" }',
    			success: function(resp) {
        			console.log(resp);
    			},
    			error: function(resp) {
    				console.log(resp);
    			},
    			dataType: "json"               
    		});
    		
    		var self = this;
    		var animationElement = $(element).parent();
			animationElement.stop();
			animationElement.animate({
				left : (width-100) + 'px',
				top : (height/2) + 'px'
			}, 2000, function() {
				setTimeout(function() {
					animationElement.animate({
						left : (offsetX + 30) + 'px',
						top : (height-150) + 'px'
					}, 2500, function() {
						// TODO: call WS to change status
						setTimeout(function() {
							animationElement.animate({
								left : (width + 100) + 'px',
								top : (height-100) + 'px'
							}, 1500, function() {
								// TODO: call WS to land the plane
								if(self.interval == null) {
									self.interval = setInterval(function() {
								        console.log("repeat");
								    }, 4000);
								}
							});
						}, 2500);
					});
				}, 200);
			});
    	}
    	
    };
    
	$.Plane = function(name, coordinates, status) {
		this.name = name; // title
		this.left = coordinates.split("&")[0]; // description
		this.top = coordinates.split("&")[1]; // description
		this.status = status; // status
	};

}(jQuery));

function generateRandomCoordinates() {
	var left = Math.floor(Math.random() * (1300 - 30 + 1) + 30);
	var top = Math.floor(Math.random() * (700 - 10 + 1) + 10);
	return left+"&"+top;
}

function animateCircle(element, speed, radius, startx, starty, phi) {
	if (!phi) {
		phi = 0
	}
	;
	var int = 2 * (Math.PI) / speed;
	phi = (phi >= 2 * (Math.PI)) ? 0 : (phi + int);
	var $m = startx - radius * Math.cos(phi);
	var $n = starty - radius * Math.sin(phi);
	element.animate({
		left : $m + 'px',
		top : $n + 'px'
	}, 1, function() {
		animateCircle.call(this, element, speed, radius, startx, starty, phi)
	});

};