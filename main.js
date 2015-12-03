var c = [], interval;
			var cartoonToggle = true;
			var maskToggle = false;
			var pixelateToggle = false;
			var globalBrightLevel = 64;
			var globalImageThreshold = 64;
			var globalPixelSize = 6;
			
			var cpRed = 0;
			var cpGreen = 0;
			var cpBlue = 0;
			
			var processor = {
			
				timerCallback : function()
				{
					if(this.video.paused || this.video.ended)
						return;
					this.computeFrame();
					var self = this;
					setTimeout(function () {self.timerCallback();}, 0);	
				},

				//Acts as the setup function
				doLoad: function()
				{
					this.video = document.getElementById("videotag");
					//this.width = 480;
					//this.height = 320;
					
					//this.datasource = document.getElementById("hiddencanvas")
						//									.getContext('2d');
					this.c1 = document.getElementById("c1");
					this.ctx = this.c1.getContext("2d");
					this.c2 = document.getElementById("c2");;
					this.ctx2 = this.c2.getContext("2d");
					var self = this;
					
					this.video.addEventListener("play", function() {
						self.width = self.video.videoWidth;
						self.height = self.video.videoHeight;
						self.timerCallback();
					}, false);
					
					this.c1.addEventListener("mousedown", function(e){
						//	colorPicker(e);
						var mouseX = e.clientX;
						var mouseY = e.clientY;
						var content = document.getElementById("c1").getContext("2d");
						var pickedColor = content.getImageData(mouseX, mouseY, 1, 1);
						
						cpRed = pickedColor.data[0];
						cpGreen = pickedColor.data[1];
						cpBlue = pickedColor.data[2];
						}, false);
				},
				
				
				//This acts as the update function
				computeFrame: function() 
				{
					var frame, l, colorset;
					var r, g, b, a, range, i;
					this.ctx.drawImage(this.video, 0, 0, c1.width, c1.height);
					frame = this.ctx.getImageData(0, 0, this.width, this.height);
					frame2 = this.ctx.getImageData(0, 0, this.width, this.height);
					frame3 = this.ctx.getImageData(0, 0, this.width, this.height);

					L = frame.data.length / 4;
					
					
					//this.desaturate(frame);
					//this.edgeDetect(frame);
					//this.invert(frame);
					//this.blur(frame);
					//this.sharpen(frame);
					if(maskToggle == true)
						this.mask(frame);
						
					if(pixelateToggle == true)
						this.pixelate(frame, globalPixelSize);
					//this.threshold(frame);
					
					//this.bwThreshold(frame);
					
					//Uses frame2 = threshold, frame3 = edgeDetect -> bwThreshold
					//onto frame, which displays cartoon from frame2 and frame3
					if(cartoonToggle == true)
						this.cartoonDrawing(frame, frame2, frame3);
						
					
					this.ctx.putImageData(frame, 0, 0);
					
					return;
				},
				
				
				threshold: function(frame, imageThreshold)
				{
					for(i = 0; i < L; i++)
					{
						r = frame.data[i * 4 + 0];
						g = frame.data[i * 4 + 1];
						b = frame.data[i * 4 + 2];
						
						while(r != 0 && r % (imageThreshold / 2) != 0)
							r--;
						while(g != 0 && g % (imageThreshold / 2) != 0)
							g--;
						while(b != 0 && b % (imageThreshold / 2) != 0)
							b--;
						
						frame.data[i * 4 + 0] = r;
						frame.data[i * 4 + 1] = g;
						frame.data[i * 4 + 2] = b;
					}
				},
				
				bwThreshold: function(frame, brightLevel)
				{
					for(var i = 0; i < L; i++)
					{
						r = frame.data[i * 4 + 0];
						g = frame.data[i * 4 + 1];
						b = frame.data[i * 4 + 2];
						
						if(r * 0.65 > brightLevel || g * 0.22 > brightLevel
							|| b * 0.13 > brightLevel)
						{
							r = 255;
							g = 255;
							b = 255;
						}
						else
						{
							r = 0;
							g = 0;
							b = 0;
						}					
							
						frame.data[i * 4 + 0] = r;
						frame.data[i * 4 + 1] = g;
						frame.data[i * 4 + 2] = b;
					}
				},
				
				desaturate: function(frame)
				{
					for (i = 0; i < L; i++)
					{
						r = frame.data[i * 4 + 0];
						g = frame.data[i * 4 + 1];
						b = frame.data[i * 4 + 2];
						
						//Calculate brightness and set it on a 0..2 scale
						range = Math.floor(((0.65 * r) + (0.22 * g) + (0.13 * b)));
						
						frame.data[i * 4 + 0] = range;
						frame.data[i * 4 + 1] = range;
						frame.data[i * 4 + 2] = range;
						frame.data[i * 4 + 3] = 255;
					}
				},
				
				invert: function(frame)
				{
					for(var i = 0; i < frame.data.length - 4 - frame.width * 4; i++)
					{
						if((i & 3) < 3)
							frame.data[i] = 255 - frame.data[i];
					}
				},
				
				cartoonDrawing: function(frame, frame2, frame3)
				{
					this.threshold(frame2 , globalImageThreshold);
					this.edgeDetect(frame3);
					this.bwThreshold(frame3, globalBrightLevel);
					
					for(var i = 0; i < L; i++)
					{
						frame.data[i * 4 + 0] = frame2.data[i * 4 + 0] - frame3.data[i * 4 + 0];
						frame.data[i * 4 + 1] = frame2.data[i * 4 + 1] - frame3.data[i * 4 + 1];
						frame.data[i * 4 + 2] = frame2.data[i * 4 + 2] - frame3.data[i * 4 + 2];
					}
				},
				
				mask: function(frame)
				{
					var framet = this.ctx.getImageData(0, 0, this.width, this.height);
					var L = frame.data.length / 4;
					
					for (var i = 0; i < L; i++)
					{
						var r = frame.data[i * 4 + 0];
						var g = frame.data[i * 4 + 1];
						var b = frame.data[i * 4 + 2];
						
						//if (g > 100 && r > 100 && b > 100)
						if(r >= cpRed - 10 && r <= cpRed + 10)
							if(g >= cpGreen - 10 && g <= cpGreen + 10)
								if(b >= cpBlue - 10 && b <= cpBlue + 10)
									frame.data[i * 4 + 3] = 0;
					}
					
				},
				
				blur: function(frame)
				{
					var v = 1.0/2.0;
					var kernal = [[v,v,v],[v,v,v],[v,v,v]];
					var framet = this.datasource.getImageData(0, 0, this.width, this.height);
					var length = frame.width * frame.height * 4;
					var widthValue = frame.width * 4;
					
					for(var i = 1; i < (frame.data.length - 1)/4; i++)
					{
						
						r = (v * frame.data[(i - frame.width - 1) * 4 + 0])
							+(v * frame.data[(i - frame.width) * 4 + 0])
							+(v * frame.data[(i - frame.width + 1) * 4 + 0])
							+(v * frame.data[(i - 1) * 4 + 0])
							+(v * frame.data[(i) * 4 + 0])
							+(v * frame.data[(i + 1) * 4 + 0])
							+(v * frame.data[(i + frame.width - 1) * 4 + 0])
							+(v * frame.data[(i + frame.width) * 4 + 0])
							+(v * frame.data[(i + frame.width + 1) * 4 + 0]);
						
						g = (v * frame.data[(i - frame.width - 1) * 4 + 1])
							+(v * frame.data[(i - frame.width) * 4 + 1])
							+(v * frame.data[(i - frame.width + 1) * 4 + 1])
							+(v * frame.data[(i - 1) * 4 + 1])
							+(v * frame.data[(i) * 4 + 1])
							+(v * frame.data[(i + 1) * 4 + 1])
							+(v * frame.data[(i + frame.width - 1) * 4 + 1])
							+(v * frame.data[(i + frame.width) * 4 + 1])
							+(v * frame.data[(i + frame.width + 1) * 4 + 1]);
						
						b = (v * frame.data[(i - frame.width - 1) * 4 + 2])
							+(v * frame.data[(i - frame.width) * 4 + 2])
							+(v * frame.data[(i - frame.width + 1) * 4 + 2])
							+(v * frame.data[(i - 1) * 4 + 2])
							+(v * frame.data[(i) * 4 + 2])
							+(v * frame.data[(i + 1) * 4 + 2])
							+(v * frame.data[(i + frame.width - 1) * 4 + 2])
							+(v * frame.data[(i + frame.width) * 4 + 2])
							+(v * frame.data[(i + frame.width + 1) * 4 + 2]);
							
							
						frame.data[i * 4 + 0] = r;
						frame.data[i * 4 + 1] = g;
						frame.data[i * 4 + 2] = b;
					}
				},
				
				pixelate: function(frame, pixelSize)
				{
					var framet = this.ctx.getImageData(0,0, this.width, this.height);
					var length = frame.width * frame.height * 4;
					var widthValue = frame.width * 4;
					var level = 1;
					for(var i = 0; i < frame.data.length / 4; i++)
					{
						if(i % pixelSize == 0)
						{
							r = frame.data[i * 4 + 0];
							g = frame.data[i * 4 + 1];
							b = frame.data[i * 4 + 2];
						}
						
						for(var j = 0; j < pixelSize; j++)
						{
							frame.data[((i + (frame.width * j)) * 4) + 0] = r;
							frame.data[((i + (frame.width * j)) * 4) + 1] = g;
							frame.data[((i + (frame.width * j)) * 4) + 2] = b;		
						}
					
						if(i == frame.width * level)
						{
							i += frame.width * (pixelSize - 1);
							level += pixelSize + 1;
						}
					}
				},
				
				sharpen: function(frame)
				{
					//var v = 1;
					//var kernal = [[v,v,v],[v,v,v],[v,v,v]];
					var framet = this.datasource.getImageData(0, 0, this.width, this.height);
					var length = frame.width * frame.height * 4;
					var widthValue = frame.width * 4;
					
					for(var i = 1; i < (frame.data.length - 1)/4; i++)
					{
						
						r = (-1 * frame.data[(i - frame.width - 1) * 4 + 0])
							+(-1 * frame.data[(i - frame.width) * 4 + 0])
							+(-1 * frame.data[(i - frame.width + 1) * 4 + 0])
							+(-1 * frame.data[(i - 1) * 4 + 0])
							+(9 * frame.data[(i) * 4 + 0])
							+(-1 * frame.data[(i + 1) * 4 + 0])
							+(-1 * frame.data[(i + frame.width - 1) * 4 + 0])
							+(-1 * frame.data[(i + frame.width) * 4 + 0])
							+(-1 * frame.data[(i + frame.width + 1) * 4 + 0]);
						
						g = (-1 * frame.data[(i - frame.width - 1) * 4 + 1])
							+(-1 * frame.data[(i - frame.width) * 4 + 1])
							+(-1 * frame.data[(i - frame.width + 1) * 4 + 1])
							+(-1 * frame.data[(i - 1) * 4 + 1])
							+(9 * frame.data[(i) * 4 + 1])
							+(-1 * frame.data[(i + 1) * 4 + 1])
							+(-1 * frame.data[(i + frame.width - 1) * 4 + 1])
							+(-1 * frame.data[(i + frame.width) * 4 + 1])
							+(-1 * frame.data[(i + frame.width + 1) * 4 + 1]);
						
						b = (-1 * frame.data[(i - frame.width - 1) * 4 + 2])
							+(-1 * frame.data[(i - frame.width) * 4 + 2])
							+(-1 * frame.data[(i - frame.width + 1) * 4 + 2])
							+(-1 * frame.data[(i - 1) * 4 + 2])
							+(9 * frame.data[(i) * 4 + 2])
							+(-1 * frame.data[(i + 1) * 4 + 2])
							+(-1 * frame.data[(i + frame.width - 1) * 4 + 2])
							+(-1 * frame.data[(i + frame.width) * 4 + 2])
							+(-1 * frame.data[(i + frame.width + 1) * 4 + 2]);
								
						framet.data[i * 4 + 0] = r;
						framet.data[i * 4 + 1] = g;
						framet.data[i * 4 + 2] = b;
					}
					
					for(var i = 1; i < (frame.data.length - 1)/4; i++)
					{
						frame.data[i * 4 + 0] = framet.data[i * 4 + 0];
						frame.data[i * 4 + 1] = framet.data[i * 4 + 1];
						frame.data[i * 4 + 2] = framet.data[i * 4 + 2];
					}
				},
				
				edgeDetect: function(frame)
				{
					for(var i = 0; i < frame.data.length - 4 - frame.width * 4; i++)
					{
						if((i & 3) < 3)
							frame.data[i] = Math.abs(frame.data[i + 4 + frame.width * 4] - frame.data[i]) * 10;
					}
				},
				
			};
			
			function colorPicker(event)
			{
					/*var mouseX = event.clientX;
					var mouseY = event.clientY;
					pickedColor = ctx.getImageData(mouseX, mouseY, 1, 1);
					
					cpRed = pickedColor.data[0];
					cpGreen = pickedColor.data[1];
					cpBlue = pickedColor.data[2];
					*/
					Console.log("Pixel Color Red:" + pickedColor.data[0]);
					Console.log("Pixel Color Green:" + pickedColor.data[1]);
					Console.log("Pixel Color Blue:" + pickedColor.data[2]);
			}
			
			function validateForm()
			{
			
				var x = document.getElementById("videoName").value;
				var w = document.getElementById("videoWidth").value;
				var h = document.getElementById("videoHeight").value;
				
				
				var cartoonBright = document.getElementById("inputCartoonBrightness").value;
				var cartoonThresh = document.getElementById("inputCartoonThreshold").value;
				var pixelatePixelSize = document.getElementById("inputPixelSize").value;
				if(x == null || x == "")
				{
					document.getElementById("videoName").value = "lol.mp4";
					x = "lol.mp4";
				}
				if(w == null || w == 0)
				{
					w = 480;
				}
				
				if(h == null || h == 0)
				{
					h = 320;
				}
				
				if(cartoonBright == null)
					cartoonBright = 64;
				
				if(cartoonThresh == null)
					cartoonThresh = 64;
				
				if(pixelatePixelSize == null)
					pixelatePixelSize = 6;
				
				globalBrightLevel = parseInt(cartoonBright);
				globalImageThreshold = parseInt(cartoonThresh);
				globalPixelSize = parseInt(pixelatePixelSize);
				//document.getElementById("videotag").width = w;
				//document.getElementById("videotag").height = h;
				c1.width = w;
				c1.height = h;
				document.getElementById("c2").width = w;
				document.getElementById("c2").height = h;
				document.getElementById('videotag').src = x;
				return true;
			}
			
			function toggleDefault()
			{
				cartoonToggle = false;
				pixelateToggle = false;
				maskToggle = false;
			}
			
			function toggleCartoon()
			{
				cartoonToggle = true;
				pixelateToggle = false;
				maskToggle = false;
			}
			
			function togglePixelate()
			{
				pixelateToggle = true;
				cartoonToggle = false;
				maskToggle = false;
			}
			
			function toggleMask()
			{
				maskToggle = true;
				pixelateToggle = false;
				cartoonToggle = false;
			}
			
