mainCountArr = [];
idtoExpertName = [];
mainarr = [];
topBuys = [];
topSells = [];
topHolds = [];
historicalRatings = [];
function fetchExpertNames() {
	$.ajax({
        type: "GET",
        url: url1,
        dataType: "text",
        success: function(data) {
        	var result = $.csv.toArrays(data);
        	result.splice(0, 1);
        	result.forEach(function(res) {        		
        		 var tokens = res[0].split("\t");        		
   	        	 id = tokens[0];
   	        	 name = tokens[1];		         
   		         idtoExpertName.push({id:id, name:name});	         	        
	   	    });
        	fetchOverallCounts();
        }
     });
}

function fetchOverallCounts() {
	$.ajax({
        type: "GET",
        url: url2,
        dataType: "text",
        success: function(data) {
        	var result = $.csv.toArrays(data);
        	result.splice(0, 1);
        	result.forEach(function(res) {
        		var tokens = res[0].split("\t");
        			 id = tokens[0];
		        	 comments = tokens[1];
			         company_code = tokens[2];
			         sentiment = tokens[3];
			         target = tokens[4];
			         //Populate top comments
			         var foundComment = $.grep(mainCountArr, function(e){ return e.id == id; });
		        	 if (foundComment.length > 0) {
		        		 foundComment[0].value ++;
		        	 } else {
		        		 var expert = $.grep(idtoExpertName, function(e){ return e.id == id; });
		        		 if (expert.length > 0) {
		        			 mainCountArr.push({id:id, label:expert[0].name, value:1});
		        		 }
		        	 }
		        	 
		        	 //Populate top buys
		        	 var foundBuy = $.grep(topBuys, function(e){ return e.label == company_code; });
		        	 if (foundBuy.length > 0 && sentiment == "buy") {
		        		 foundBuy[0].value ++;
		        	 } else if (sentiment == "buy"){
		        		 topBuys.push({id:id, label:company_code, comments:comments, target:target, value:1});
		        	 }		        	 
		        	 
		        	//Populate top sells
		        	 var foundSell = $.grep(topSells, function(e){ return e.label == company_code; });
		        	 if (foundSell.length > 0 && sentiment == "sell") {
		        		 foundSell[0].value ++;
		        	 } else if (sentiment == "sell"){
		        		 topSells.push({id:id, label:company_code, comments:comments, target:target, value:1});
		        	 }
		        	 
		        	//Populate top holds
		        	 var foundHold = $.grep(topHolds, function(e){ return e.label == company_code; });
		        	 if (foundHold.length > 0 && sentiment == "hold") {
		        		 foundHold[0].value ++;
		        	 } else if (sentiment == "hold"){
		        		 topHolds.push({id:id, label:company_code, comments:comments, target:target, value:1});
		        	 }
		        	 
			         mainarr.push({id:id, comments:comments, company_code:company_code, sentiment:sentiment, target:target});
        	  	});
        	        	
        	var pie = new d3pie("pieChart", {
        	    "header": {
        	        "title": {
        	            "text": "Today's comments",
        	            "fontSize": 22,
        	            "font": "verdana"
        	        },
        	        "titleSubtitlePadding": 12
        	    },
        	    "size": {
        	        "canvasHeight": 250,
        	        "canvasWidth": 400,
        	        "pieInnerRadius": "12%",
        	        "pieOuterRadius": "88%"
        	    },
        	    "data": {
        	        "content": mainCountArr
        	    },
        	    "labels": {
        	        "outer": {
        	            "pieDistance": 32
        	        },
        	        "inner": {
        	            "format": "value"
        	        },
        	        "mainLabel": {
        	            "font": "verdana"
        	        },
        	        "percentage": {
        	            "color": "#e1e1e1",
        	            "font": "verdana",
        	            "decimalPlaces": 0
        	        },
        	        "value": {
        	            "color": "#e1e1e1",
        	            "font": "verdana"
        	        },
        	        "lines": {
        	            "enabled": true,
        	            "color": "#cccccc"
        	        },
        	        "truncation": {
        	            "enabled": true
        	        }
        	    },
        	    "effects": {
        	        "pullOutSegmentOnClick": {
        	            "effect": "linear",
        	            "speed": 400,
        	            "size": 8
        	        }
        	    },
        	    callbacks: {
        			onClickSegment: function(a) {
        				document.getElementById("expertTable").innerHTML = "";
        				document.getElementById("tableCaption").innerHTML = "Today's comments";
        				var expert = $.grep(mainarr, function(e){ return e.id == a.data.id; });
        				var html = "<table border=1 cellpadding = 10 cellspacing = 5><tr><th>Expert</th><th>Comments</th><th>Target</th></tr>";
        				expert.forEach(function(ex) {
        					var exp = $.grep(idtoExpertName, function(e){ return e.id == ex.id; });
        					html+= "<tr><td>" + exp[0].name + "</td>";
        					html+= "<td>" + ex.comments + "</td>";
        					html+= "<td>" + ex.target + "</td></tr>";
        				});
        				html+= "</table>"
        				$("#expertTable").append(html);
        			}
        		}
        	});
        	
        	fetchTopBuyCounts();
     	    fetchTopSellCounts();
     	    fetchTopHoldCounts();
        }
     });
}

function fetchTopBuyCounts() {
	var pie = new d3pie("topBuys", {
	    "header": {
	        "title": {
	            "text": "Top Buys",
	            "fontSize": 22,
	            "font": "verdana"
	        },
	        "titleSubtitlePadding": 12
	    },
	    "size": {
	        "canvasHeight": 250,
	        "canvasWidth": 390,
	        "pieInnerRadius": "12%",
	        "pieOuterRadius": "88%"
	    },
	    "data": {
	        "content": topBuys
	    },
	    "labels": {
	        "outer": {
	            "pieDistance": 32
	        },
	        "inner": {
	            "format": "value"
	        },
	        "mainLabel": {
	            "font": "verdana"
	        },
	        "percentage": {
	            "color": "#e1e1e1",
	            "font": "verdana",
	            "decimalPlaces": 0
	        },
	        "value": {
	            "color": "#e1e1e1",
	            "font": "verdana"
	        },
	        "lines": {
	            "enabled": true,
	            "color": "#cccccc"
	        },
	        "truncation": {
	            "enabled": true
	        }
	    },
	    "effects": {
	        "pullOutSegmentOnClick": {
	            "effect": "linear",
	            "speed": 400,
	            "size": 8
	        }
	    },
	    callbacks: {
			onClickSegment: function(a) {
				document.getElementById("expertTable").innerHTML = "";
				document.getElementById("tableCaption").innerHTML = "Top Buys";
				var scrip = $.grep(topBuys, function(e){ return e.label == a.data.label; });
				var html = "<table border=1 cellpadding = 10 cellspacing = 5><tr><th>Expert</th><th>Comments</th><th>Target</th></tr>";
				scrip.forEach(function(ex) {	        					
					var exp = $.grep(idtoExpertName, function(e){ return e.id == ex.id; });
					if (ex.label = a.data.label) {
						html+= "<tr><td>" + "<a href='stock/experts.html?exp_id=" + exp[0].id + "&scrip=" + ex.label + " ' target='_blank'>" + exp[0].name + "</td>";
    					html+= "<td>" + ex.comments + "</td>";
    					html+= "<td>" + ex.target + "</td></tr>";
					}
				});
				html+= "</table>"
				$("#expertTable").append(html);
			}
		}
	});
}

function fetchTopSellCounts() {	         
     var pie = new d3pie("topSells", {
    	    "header": {
    	        "title": {
    	            "text": "Top Sells",
    	            "fontSize": 22,
    	            "font": "verdana"
    	        },
    	        "titleSubtitlePadding": 12
    	    },
    	    "size": {
    	        "canvasHeight": 250,
    	        "canvasWidth": 390,
    	        "pieInnerRadius": "12%",
    	        "pieOuterRadius": "88%"
    	    },
    	    "data": {
    	        "content": topSells
    	    },
    	    "labels": {
    	        "outer": {
    	            "pieDistance": 32
    	        },
    	        "inner": {
    	            "format": "value"
    	        },
    	        "mainLabel": {
    	            "font": "verdana"
    	        },
    	        "percentage": {
    	            "color": "#e1e1e1",
    	            "font": "verdana",
    	            "decimalPlaces": 0
    	        },
    	        "value": {
    	            "color": "#e1e1e1",
    	            "font": "verdana"
    	        },
    	        "lines": {
    	            "enabled": true,
    	            "color": "#cccccc"
    	        },
    	        "truncation": {
    	            "enabled": true
    	        }
    	    },
    	    "effects": {
    	        "pullOutSegmentOnClick": {
    	            "effect": "linear",
    	            "speed": 400,
    	            "size": 8
    	        }
    	    },
    	    callbacks: {
    			onClickSegment: function(a) {
    				document.getElementById("expertTable").innerHTML = "";
    				document.getElementById("tableCaption").innerHTML = "Top Sels";
    				var scrip = $.grep(topSells, function(e){ return e.label == a.data.label; });
    				var html = "<table border=1 cellpadding = 10 cellspacing = 5><tr><th>Expert</th><th>Comments</th><th>Target</th></tr>";
    				scrip.forEach(function(ex) {	        					
    					var exp = $.grep(idtoExpertName, function(e){ return e.id == ex.id; });
    					if (ex.label = a.data.label) {
    						html+= "<tr><td>" + "<a href='../html/stockChart.html?exp_id="+ exp[0].id +"&scrip="+ ex.label +"' target='_blank'>" + exp[0].name + "</td>";
        					html+= "<td>" + ex.comments + "</td>";
        					html+= "<td>" + ex.target + "</td></tr>";
    					}
    				});
    				html+= "</table>"
    				$("#expertTable").append(html);
    			}
    		}
    	});
}

function fetchTopHoldCounts() {	         
     var pie = new d3pie("topHolds", {
    	    "header": {
    	        "title": {
    	            "text": "Top Holds",
    	            "fontSize": 22,
    	            "font": "verdana"
    	        },
    	        "titleSubtitlePadding": 12
    	    },
    	    "size": {
    	        "canvasHeight": 250,
    	        "canvasWidth": 390,
    	        "pieInnerRadius": "12%",
    	        "pieOuterRadius": "88%"
    	    },
    	    "data": {
    	        "content": topHolds
    	    },
    	    "labels": {
    	        "outer": {
    	            "pieDistance": 32
    	        },
    	        "inner": {
    	            "format": "value"
    	        },
    	        "mainLabel": {
    	            "font": "verdana"
    	        },
    	        "percentage": {
    	            "color": "#e1e1e1",
    	            "font": "verdana",
    	            "decimalPlaces": 0
    	        },
    	        "value": {
    	            "color": "#e1e1e1",
    	            "font": "verdana"
    	        },
    	        "lines": {
    	            "enabled": true,
    	            "color": "#cccccc"
    	        },
    	        "truncation": {
    	            "enabled": true
    	        }
    	    },
    	    "effects": {
    	        "pullOutSegmentOnClick": {
    	            "effect": "linear",
    	            "speed": 400,
    	            "size": 8
    	        }
    	    },
    	    callbacks: {
    			onClickSegment: function(a) {
    				document.getElementById("expertTable").innerHTML = "";
    				document.getElementById("tableCaption").innerHTML = "Top Sels";
    				var scrip = $.grep(topHolds, function(e){ return e.label == a.data.label; });
    				var html = "<table border=1 cellpadding = 10 cellspacing = 5><tr><th>Expert</th><th>Comments</th><th>Target</th></tr>";
    				scrip.forEach(function(ex) {	        					
    					var exp = $.grep(idtoExpertName, function(e){ return e.id == ex.id; });
    					if (ex.label = a.data.label) {
    						html+= "<tr><td>" + "<a href='stockChart.html?exp_id="+ exp[0].id +"&scrip="+ ex.label +"' target='_blank'>" + exp[0].name + "</td>";

        					html+= "<td>" + ex.comments + "</td>";
        					html+= "<td>" + ex.target + "</td></tr>";
    					}
    				});
    				html+= "</table>"
    				$("#expertTable").append(html);
    			}
    		}
    	});
}

function searchScrip() {
	var search = document.getElementById("scripSearch").value;	
	if (search != "") {
		var input = {buy:0, sell:0, hold:0};
		var buyCount=0, sellCount=0, holdCount=0;
		mainarr.forEach(function(e) {
			if (e.sentiment == "buy" && e.company_code == search) {
				buyCount++;
			} else if(e.sentiment == "sell" && e.company_code == search) {
				sellCount++;
			} else  if(e.sentiment == "hold" && e.company_code == search) {
				holdCount++;
			}
		});
		
		var data = [{y:buyCount, label:"Buy"}, {y:sellCount, label:"Sell"}, {y:holdCount, label:"Hold"}];
		
		var chart = new CanvasJS.Chart("chartContainer",
	    {
	      title:{
	        text: "Stock Calls"    
	      },
	      animationEnabled: true,
	      axisY: {
	        title: "No. of calls"
	      },
	      theme: "theme2",
	      data: [
	      {        
	        type: "column",        
	        dataPoints: data
	      }   
	      ]
	    });
		
	    chart.render();
	} else {
		document.getElementById("chartContainer").innerHTML = "Please enter a scrip!";
	}	
}

function populateHistoricalRatings() {
	//alert("Reached here");
	var expert_id = getParameterByName("exp_id");
	var scrip = getParameterByName("scrip");
	
	if (historicalRatings.length == 0) {
		$.ajax({
	        type: "GET",
	        url: url3,
	        dataType: "text",
	        success: function(data) {
	        	var result = $.csv.toArrays(data);
	        	result.splice(0, 1);
	        	result.forEach(function(res) {	        		 
	        		 var tokens = res[0].split("\t");
	        		 if (tokens[1] == expert_id && tokens[4] == scrip){
	        			 date = getDate(tokens[2]);
		   	        	 rating = tokens[8];		         
		   		         
		   	        	 historicalRatings.push({x:date, y:Number(rating)});
	        		 }	        		 
		   	    });
	        	//historicalRatings.push();
	        	drawHistoricalRatingChart();
	        }
	     });
	} else {
		drawHistoricalRatingChart();
	}
}

function getDate(value) {
	var tokens = value.split("-");
	return new Date(Number(tokens[0]), Number(tokens[2]) - 1, Number(tokens[1]));
}

function drawHistoricalRatingChart() {
	alert('Hello')
	var chart = new CanvasJS.Chart("chartContainer",
		    {
		      theme: "theme2",
		      title:{
		        text: "Historical Rating Chart"
		      },
		      animationEnabled: true,
		      axisX: {
		        valueFormatString: "YYYY",
		        interval: 1,
		        intervalType: "year"
		        
		      },
		      axisY:{
		        includeZero: true
		        
		      },
		      data: [
		      {        
		        type: "scatter",
		        lineThickness: 3,        
		        dataPoints: historicalRatings
		      }		      
		      ]
		    });

		chart.render();
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
