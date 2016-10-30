function CollapsibleTree(params)
{
	this.svg = params.svg;
	this.data = params.data;

	this.ballSize = 10;
	this.padding = 2;
}

CollapsibleTree.prototype = 
{
	bfs: function(d, f)
	{
		(function(){
		var elem;
		var t = this;

		queue = new Queue(200);
		queue.enque(d);
		while( !queue.isEmpty() )
		{
			elem = queue.deque();
			f(elem);
			if( "children" in elem )
			{
				for( var i = 0; i < elem.children.length; i++ )
				{
					queue.enque(elem.children[i]);
				}				
			}		
		}
		})()
	},


	maxDepth: function(e, d)
	{
		var m = d;

		if( "children" in e )
		{
			for( var i = 0; i < e.children.length; i++ )
			{
				var t = this.maxDepth(e.children[i], d + 1);
				if( t > m )
					m = t;
			}
		}
		return m;
	},


	depth: function(e, aim, d)
	{
		var rst;

		if( e == aim )
		{
			return d;
		}
		else
		{
			if( "children" in e )
			{
				for( var i = 0; i < e.children.length; i++ )
				{
					var t = this.depth(e.children[i], aim, d + 1 );
					if( t >= 0 )
						return t;
				}
			}
			return -1;
		}
	},

	parent: function()
	{
		this.bfs(this.data, function(e)
		{
			if( "children" in e )
			{
				for( var i = 0; i < e.children.length; i++ )
				{
					e.children[i].prt = e;
					e.children[i].idx = i;
				}
			}
		})
	},

	bfsPos: function(root, initY)
	{
		var dx = this.dx;
		var dy = this.dy;

		this.bfs(root, function(e)
		{
			if( e.show == 1 )
			{
				e.x = 10 + ( 2 * e.d + 1 ) * dx;
				if( e.name != root.name && "prt" in e )
					e.y = e.prt.y + ( e.idx - e.prt.children.length / 2 + 0.5) * dy;
				else
					e.y = initY; //canvas.height / 2;
			}
		})		
	},

	layout: function()
	{
		var this_ = this;

		this.bfsPos(this.data, this.svg.getAttribute("height") / 2.0 / 2);

		var lastElem;
		var depthNow = this.totalDepth;
		var sumDy, lastDy;
		for( var i = this.totalDepth - 1; i >= 0; i-- )
		{
			this.bfs(this.data, function(e)
			{
				if( e.d != i || e.show != 1 )
					return;

				if( "children" in e && e.children[0].show == 1 )
				{
					e.y = ( e.children[0].y + e.children[e.children.length-1].y ) / 2;
				}

				if( e.d != depthNow )
				{
					depthNow = e.d;
					sumDy = 0;
				}
				else
				{
					if( lastElem != undefined && e.y - lastElem.y < this_.dy / 3  )
					{

						if( "children" in e && e.children[0].show == 1 )
						{	
							sumDy = lastElem.y + this_.dy - e.y;
							for( var j = 0; j < e.children.length; j++ )
							{
								e.children[j].y = e.children[j].y + sumDy;
							}
						}
						if( "prt" in lastElem && lastElem.prt.name == e.name )
							e.y = lastElem.y + this_.dy;
						else
							e.y = lastElem.y + 2 * this_.dy;
					}
				}
				lastElem = e;
			})
		}

		var minY = 0;
		var maxY = this.svg.getAttribute("height") / 2.0;

		this.bfs(this.data, function(e){
			if( e.y < minY )
				minY = e.y;
			else if( e.y > maxY )
				maxY = e.y;
		})


		this.bfs(this.data, function(e){
			e.y = ( e.y - minY ) / ( maxY - minY ) * 0.95 * this.svg.getAttribute("height") / 2.0 + 0.05 * this.svg.getAttribute("height") / 2.0 / 2;
		})
	},



	nearest: function(p)
	{
		var minDist = 10000;
		var this_ = this;
		//var rst = {};
		var rst = null;

		this.bfs(this.data, function(e)
		{
			if( e.show == 1 )
			{
				if( -this_.ballSize < p.x - e.x && 
					p.x - e.x < this_.ballSize &&
					-this_.ballSize < p.y - e.y && 
					p.y - e.y < this_.ballSize)
				{
					rst = e;
				}
			}
		})

		return rst;
	},

	run: function()
	{
		var data = this.data;
		var canvas = this.canvas;
		var this_ = this;

		this.totalDepth = this.maxDepth(data, 0) + 1;
		this.parent();

		this.bfs(data, function(e)
		{
			e.d = this_.depth(this_.data, e, 0);
			//e.show = -1;
			e.show = -1;
		})

		data.show = 1;

		this.dx = 1.0 * this.svg.getAttribute("width") / ( this.totalDepth * 2 + 1 );
		this.dy = 50;
		this.dy2 = 2 * this.dy;

		this.layout();
		this.render();


		$("#disp").click(function(e)
		{
//			console.log(e.toElement);

			var pos = jQuery(this).offset();
			var p = {};

			p.x = e.pageX - pos.left;
			p.y = e.pageY - pos.top;

			var clkPoint = this_.nearest(p);
			
			if( clkPoint == undefined )
			{
				return;
			}
				

			if( "children" in clkPoint )
			{
				if( clkPoint.children[0].show == -1 )
				{
					for( var i = 0; i < clkPoint.children.length; i++ )
					{
						clkPoint.children[i].show = 1;
					}					
				}
				else
				{
					this_.bfs(clkPoint, function(e)
					{
						if( "children" in e )
						{
							for( var i = 0; i < e.children.length; i++ )
							{
								e.children[i].show = -1;
							}						
						}
					})
				}
			}
			

			this_.layout();
			this_.render();
			
		});
	},

	render: function()
	{
		var data = this.data;

		var ballSize = this.ballSize;
		var padding = this.padding;

		var dur = "0.5s";

		//this.svg.innerHTML = " ";

		var _t = this;

		//for( it = 1; it <= 10; it++ )
		var it = 0;
		var N = 20;
		var timerId = setInterval(function()
		{
			_t.bfs(data, function(e){

				if( e.show == 1 )
				{
					
					if( it == 0 )
					{
						e.src = {};
						e.dst = {};

						var gg = document.getElementById(e.name);
						if( gg != null )
						{
							var pp = {};
							pp.px = +gg.getAttribute("px");
							pp.py = +gg.getAttribute("py");

							//if( pp.px == e.x && pp.py == e.y )
							//{
							//	e.dst.x = e.x;
							//	e.dst.y = e.y;
							//	e.skip = 1;
							//}
							//else
							//{
							//	e.skip = 0;
							//}

							e.src.x = pp.px;
							e.src.y = pp.py;
						}
						else if( "prt" in e )
						{
							e.src.x = e.prt.dst.x;
							e.src.y = e.prt.dst.y;			
						}
						else
						{
							e.src.x = e.x;
							e.src.y = e.y;
						}
					}
					//else if( e.skip == 1 )
					//{
					//	return;
					//}

					e.dst.x = e.src.x + ( e.x - e.src.x ) * it / N;
					e.dst.y = e.src.y + ( e.y - e.src.y ) * it / N;

					// draw line
					if( "prt" in e && e.skip != 1 )
					{	

						if( e.prt.dst != undefined )
						{
							//console.log(e.prt.dst)
							var d = "M" + e.prt.dst.x + " " + e.prt.dst.y + " ";
							d = d + "C" + ((2/3.0)*e.prt.dst.x + (1/3.0)*e.dst.x) + " " + e.prt.dst.y + " ";
							d = d + ((1/3.0)*e.prt.dst.x + (2/3.0)*e.dst.x) + " " + e.dst.y + " ";
							d = d + e.dst.x + " " + e.dst.y + " ";							
						}
						else
						{
							var d = "M" + e.prt.x + " " + e.prt.y + " ";
							d = d + "C" + ((2/3.0)*e.prt.x + (1/3.0)*e.x) + " " + e.prt.y + " ";
							d = d + ((1/3.0)*e.prt.x + (2/3.0)*e.dst.x) + " " + e.dst.y + " ";
							d = d + e.dst.x + " " + e.dst.y + " ";
						}


						//console.log(d);

						var line = document.getElementById(e.name+"_line");
						if( line == null )
						{
							var line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
							line.setAttribute("id", e.name+"_line");
							line.setAttribute("stroke", "#a1a3a6");
							line.setAttribute("fill", "none");
							line.setAttribute("d", d);

							_t.svg.appendChild(line);							
						}
						else
						{
							line.setAttribute("d", d);							
						}

					}

					var g = document.getElementById(e.name);
					if( g == null )
					{
						var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
						g.setAttribute("id", e.name);
						g.setAttribute("px", e.x);
						g.setAttribute("py", e.y);

						var tmpStr = 'translate(' + e.dst.x + ',' + e.dst.y + ')';
						g.setAttribute('transform', tmpStr);


						// draw ball
						var ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
						ball.setAttribute("r", ballSize / 2);
						ball.setAttribute("stroke", "#2a5caa");
						ball.setAttribute("stroke-width", padding);

						if( "children" in e && e.children[0].show == -1 )
							ball.setAttribute("fill", "#76becc");
						else
							ball.setAttribute("fill", "#ffffff");
						
						g.appendChild(ball);

						// draw name
						var text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
						text.setAttribute('x', ballSize / 2);
						text.setAttribute('y', ballSize / 2);
						text.setAttribute('fill', "black");
						text.setAttribute('font-family', 'consolas');
						text.setAttribute('font-size', 5);
						text.innerHTML = e.name;

						g.appendChild(text);

						_t.svg.appendChild(g);
					}
					else
					{
						//console.log(g);
						var tmpStr = 'translate(' + e.dst.x + ',' + e.dst.y + ')';
						g.setAttribute('transform', tmpStr);
					}
				}
				else
				{
					var gg = document.getElementById(e.name);
					var lline = document.getElementById(e.name+"_line");
					if( gg != null)
					{
						if( "prt" in e && it != N )
						{
							e.dst = {};
							e.dst.x = e.prt.x + ( e.x - e.prt.x ) * ( N - it ) / N;
							e.dst.y = e.prt.y + ( e.y - e.prt.y ) * ( N - it ) / N;
							var tmpStr = 'translate(' + e.dst.x + ',' + e.dst.y + ')';
							gg.setAttribute('transform', tmpStr);
						}
						else
						{
							_t.svg.removeChild(gg);
						}						
					}

					if( lline != null )
						_t.svg.removeChild(lline);

				}
			})
			it++;
			if( it > N )
			{
				clearInterval( timerId );
				timerId = null;
				return;
			}
		},2);

	}
}

function Queue(capacity)
{
	this.capacity = capacity;
	this.array = [];
	this.head = 0;
	this.tail = -1;

	this.size = 0;
}

Queue.prototype = 
{
	enque: function(elem)
	{
		this.tail = ( this.tail + 1 ) % this.capacity;
		this.array[this.tail] = elem;	
		this.size = this.size + 1;
	},

	deque: function()
	{
		var elem = {};

		if( this.size > 0 )
		{
			elem = this.array[this.head];
			this.head = ( this.head + 1 ) % this.capacity;
			this.size = this.size - 1;
		}
		return elem;
	},

	isEmpty: function()
	{
		return (this.size == 0);
	}
}