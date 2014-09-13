/**
 * preload.js v0.1.0
 * by Won J. You
 * Wrapper class for imageLoaded
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 */

( function( window ) {
	
	'use strict';
	
	//element is the preloader element
	//settings is an object that contains optional choices from the user such as a callback function
	function Preloader(element, settings) {
		
		this.defaults = {
				autoHide: true,  //should the preloader automatically disappear
				waitForAnimation: false, //should we wait until the preloader has completed its animation before calling onComplete
				callback: function(){}
			};
		
		this.el = element;
		this.$preloader = $(element);
		this.settings = $.extend( {}, this.defaults, settings );
		this.checkInterval = null; // our checkInterval
		this.progressCount = 0;
		this.total = 0;

		console.log(this.settings.autoHide);
		
		this._init();
	}
	
	Preloader.prototype = {
			
			_init: function(){

				this.isDone = false; //are we done loading yet
				this.loadElements = this.settings.images;  //the images to preload
				this.total = this.loadElements.length;  // total number of images to load
				this.waitForAnimation = this.settings.waitForAnimation;
				this.autoHide = this.settings.autoHide;
			},
			
			checkReady: function(){
				
				var self = this;
				if ( this.isDone ) {
				
					if (this.waitForAnimation){
						console.log('waiting for animation');
						//if we are waiting for the load animation, then trigger a loop to check
						if (this.checkInterval == null){
							this.checkInterval = setInterval(function(){self.checkAnimation();}, 30);
						}
					}
					else{
						this.onComplete();
					}					
				}
			},

			onComplete: function(){

				if (this.autoHide){
					this.hide();
				}
				
				this.reset();
				this.settings.callback();	
			},
			
			checkAnimation: function(){
				var self = this;
				var loadPercent = parseFloat(this.$preloader.css("width"))/$(window).width();
				
				//console.log("load percentage: " + loadPercent);
				
				if(loadPercent >= 1){
					this.onComplete();
				}
			},
			
			reset: function(){
				console.log("Preloader: reset called");
				this.isDone = false;
				this.progressCount=0;
				this.total = 0;
				
				clearInterval(this.checkInterval);
				this.checkInterval = null;
				
				delete this.imgLoader;
			},
			
			setImages: function (images){
				console.log("Preloader: setImages called");
				console.log("images: " + images);
				this.loadElements = images;
				this.total = this.loadElements.length;				
			},
			
			start: function(){
				console.log('\nPreloader: start called');
				var self = this;
				
				this.show();
				
				this.imgLoader = new imagesLoaded( this.loadElements );
				
				this.imgLoader.on( 'done', function() {
					self.isDone = true;
					self.checkReady();
				});
				
				this.imgLoader.on( 'progress', function(){self.update();});

			},
			
			show: function (callback) {
			  this.$preloader.css({"display": 'block', "width":"0px"});
			},

			hide: function (callback) {
			  this.$preloader.css({"display":"none"});
			},

			update: function( loader, image ) {
				
				this.progressCount++;
				var progress = this.progressCount/this.total;
				this.updateProgress(progress);
					
				if ( this.progressCount >= this.total ) {
				  console.log('finished loading everything');
				  this.isAllProgressed = true;
				  this.checkReady();
				}
			},
			
			updateProgress: function(progress) {
			  //console.log('progress: ' + progress);
			  if (progress > 1 || progress < 0) {
				throw 'Progress value should be a number between 0 and 1';
			  }

			  this.$preloader.css({ width: (100 * progress) + '%' });
			}
	};
	

	// add to global namespace
	window.Preloader = Preloader;

})( window );