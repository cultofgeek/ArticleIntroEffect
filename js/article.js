
(function() {

	// detect if IE : from http://stackoverflow.com/a/16657946		
	var ie = (function(){
		var undef,rv = -1; // Return value assumes failure.
		var ua = window.navigator.userAgent;
		var msie = ua.indexOf('MSIE ');
		var trident = ua.indexOf('Trident/');

		if (msie > 0) {
			// IE 10 or older => return version number
			rv = parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
		} 
		else if (trident > 0) {
			// IE 11 (or newer) => return version number
			var rvNum = ua.indexOf('rv:');
			rv = parseInt(ua.substring(rvNum + 3, ua.indexOf('.', rvNum)), 10);
		}

		return ((rv > -1) ? rv : undef);
	}());
			
	var docElem = window.document.documentElement,
		scrollVal,
		isRevealed, 
		noscroll, 
		isAnimating,
		container = document.getElementById( 'container' ),
		trigger = container.querySelector( 'button.trigger' ),
		contentData;				
		
	// disable/enable scroll (mousewheel and keys) from http://stackoverflow.com/a/4770179					
	// left: 37, up: 38, right: 39, down: 40,
	// spacebar: 32, pageup: 33, pagedown: 34, end: 35, home: 36
	var keys = [32, 37, 38, 39, 40], wheelIter = 0;
				
	function scrollY() {
		return window.pageYOffset || docElem.scrollTop;
	}
		
	// refreshing the page...
	var pageScroll = scrollY();				
	noscroll = pageScroll === 0;	
		
	
	function navigateRight(){
		direction = 'next';
		$('.next').click();
	}
	
	function navigateLeft(){
		direction = 'prev';
		$('.prev').click();
	}

	function preventDefault(e) {
		e = e || window.event;
		if (e.preventDefault)
			e.preventDefault();
		e.returnValue = false;  
	}

	function keydown(e) {
		for (var i = keys.length; i--;) {
			if (e.keyCode === keys[i]) {
				preventDefault(e);
				return;
			}
		}
	}

	function touchmove(e) {
		preventDefault(e);
	}

	function wheel(e) {
		// for IE 
		//if( ie ) {
			//preventDefault(e);
		//}
	}

	function disable_scroll() {
		window.onmousewheel = document.onmousewheel = wheel;
		document.onkeydown = keydown;
		document.body.ontouchmove = touchmove;
	}

	function enable_scroll() {
		window.onmousewheel = document.onmousewheel = document.onkeydown = document.body.ontouchmove = null;  
	}
		
	function scrollPage() {

		scrollVal = scrollY();
		
		if ( noscroll && !ie ) {
			if ( scrollVal < 0 ) return false;
			// keep it that way
			window.scrollTo( 0, 0 );
		}

		if ( $(container).hasClass( 'notrans' ) ) {
			$(container).removeClass( 'notrans' );
			return false;
		}

		if ( isAnimating ) {
			return false;
		}
		
		if ( scrollVal <= 0 && isRevealed ) {
			toggle(0);
		}
		else if( scrollVal > 0 && !isRevealed ){
			toggle(1);
		}

	}
	
	function scrollTop(){
		$("html, body").animate({ scrollTop: 0 }, "fast");
	}
	
	//allow the user to return to the full bleed image with the mousewheel
	function testTop(){
			
		var e = window.event || e; // old IE support
	
		if (e == null || e == undefined){
			return;
		}
		
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		
		if( delta >= 0 && isRevealed ) {
				toggle(0);
		}
	}

	function toggle( reveal ) {
		isAnimating = true;
		
		if( reveal ) {
			$(container).addClass( 'modify' );
		}
		else {
			noscroll = true;
			disable_scroll();
			$(container).removeClass( 'modify' );
		}

		// simulating the end of the transition:
		setTimeout( function() {
						isRevealed = !isRevealed;
						isAnimating = false;
						if( reveal ) {
							noscroll = false;
							enable_scroll();
						}
		}, 600 );
	}
	
	function updateContent( id ){
		console.log("updateContent called");
		console.log("received: " + id);
		
		var prevID = id-1;
		var nextID = id+1;
		var total = contentData.sections.length;

		if (prevID < 0){
			prevID = total - 1;
		}
	
		if (nextID >= total){
			nextID = 0;
		}
		
		//console.log("prevID: " + prevID);
		//console.log("nextID: " + nextID);
		
		$(".title h1").html(contentData.sections[id].title);
		$(".title p.subline").html(contentData.sections[id].subhead);
		
		$(".content div").html(contentData.sections[id].content);
		
		$("#previewLeft h3").html(contentData.sections[prevID].previewText);
		$("#previewRight h3").html(contentData.sections[nextID].previewText);
		
		$("#prevThumb").attr('src', contentData.sections[prevID].thumb);
		$("#nextThumb").attr('src', contentData.sections[nextID].thumb);
		
		var html = "by <strong>" + contentData.sections[id].author + 
		           "</strong> &#8212; Posted on <strong>" + contentData.sections[id].date + "</strong>";
		$("#author").html(html);
		
		$("#nextTitle").html(contentData.sections[nextID].title);
		$("#readBg").attr('src', contentData.sections[nextID].image);
	}
	
	function initImages(){
		console.log("initImages called");
	
		var total = contentData.sections.length;
		//console.log("total: " + total);
	
		var html = "";

		for ( var i=0; i<total; i++ ){
			console.log("image: " + contentData.sections[i].image);
			html += ("<img src=\"" + contentData.sections[i].image + "\" alt=\"Background image\"/>");					
		}
		
		$(".bg-img").html(html);
	}
	
	function animIn(){
		//$(".title").css({"opacity": 1});
		$(".title").fadeIn();
		$("#prevThumb").fadeIn();
		$("#nextThumb").fadeIn();					
	}
	
	function animOut(){
		//$(".title").css({"opacity": 0});
		$(".title").fadeOut();
		$("#prevThumb").fadeOut();
		$("#nextThumb").fadeOut();
	}
				
	function init(){
		console.log("init called");
					
		$('.bg-img').maximage({
						   cycleOptions: {
								speed: 500,
								pause: 1,
								timeout: 0,
								pager:  '#nav', 
								prev: '.prev',
								next: '.next',
								pagerAnchorBuilder: function(idx, slide) { 
									return '<li><a href="#">idx</a></li>'; 
								},
								before: function(curr, next, options){
									animOut();
								},
								after: function(curr, next, options){
									var index = options.currSlide;
									
									updateContent(index);
									animIn();
								}
							}
						}
		);
		
		$("#nextTitle").on("click", function(){
										navigateRight(); scrollTop();
										});
		
		$(document.documentElement).keyup(function(event) {
			var direction = null;
			if (event.keyCode == 37) {
				navigateLeft();
			} 
			else if (event.keyCode == 39) {
				navigateRight();
			}
			
		});
			
		disable_scroll();
		
		if ( pageScroll ) {
			isRevealed = true;
			$(container).addClass( 'notrans' );
			$(container).addClass( 'modify' );
		}

		// IE9, Chrome, Safari, Opera
		window.addEventListener("mousewheel", testTop, false);
		// Firefox
		window.addEventListener("DOMMouseScroll", testTop, false);
		window.addEventListener( 'scroll', scrollPage );
		trigger.addEventListener( 'click', function() { toggle( 'reveal' ); } );			
			
	}
			
	$.ajax({
			url: "data/slides.json",
			async: false, 
			dataType: "json",
			success: function (data) {
						contentData = data;
						initImages();
						updateContent(0);
						init();
					}
			});

})();