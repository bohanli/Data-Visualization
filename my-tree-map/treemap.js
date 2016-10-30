function Treemap(params)
{
	this.canvas = params.canvas;
	this.data = params.data;

}

Treemap.prototype =
{
	size: function(elem)
	{
		if( 'size' in elem )
			return elem.size;
		else
		{
			var sum = 0;

			for( var i = 0; i < elem.children.length; i++ )
				sum = sum + this.size(elem.children[i]);

			return sum;
		}
	},

	bfs: function(d, f)
	{
		var elem;
		var t = this;
/*		f(d);
		for( var i = 0; i < d.children.length; i++ )
			f(d.children[i]);*/


		queue = new Queue(300);
		queue.enque(d);
		while( !queue.isEmpty() )
		{
			elem = queue.deque();
			f(elem);
			if( "children" in elem )
			{
				elem.children.sort(function(a,b){return t.size(a)<t.size(b)?1:-1});
				for( var i = 0; i < elem.children.length; i++ )
				{
					console.log("bfs ",i);
					queue.enque(elem.children[i]);
				}				
			}

					
		}

	},

	run: function()
	{
		var data = this.data;
		var colorSet = 
		["#f7acbc",
		"#d71345",
		"#f26522",
		"#905d1d",
		"#ffd400",
		"#7fb80e",
		"#007d65",
		"#008792",
		"#6950a1",
		"#1b315e",
		"#007947"
		]

		var j = Math.floor( Math.random() * colorSet.length )
		for( var i = 0; i < data.children.length; i++ )
		{
			data.children[i].color = colorSet[(j++)%colorSet.length];
			this.bfs(data.children[i], function(e)
			{
				e.color = data.children[i].color;
			})

			//data.children[i].color = colorSet[(j++)%colorSet.length];
		}

		this.alloc();
		this.render();
	},


	alloc: function()
	{
		var canvas = this.canvas;
		var data = this.data;

		data.x = 0;
		data.y = 0;
		data.width = canvas.width;
		data.height = canvas.height;

		var t = this;
		var k = 1.0 * data.width * data.height / t.size( data );
		this.bfs(data, function(e){ 
			if( "children" in e )
			{
				//var k = 1.0 * e.width * e.height / t.size( e );

				var mode = 0; // 0: vertical, 1: horizontal
				var startIdx = 0;
				var endIdx = 0;
				//console.log(e.width);
				var bound = {x: e.x, y: e.y, width: e.width, height: e.height};

				//aspect-ratio
				var arLast = 0;
				var arLast2 = 0;
				var arNow = 0;
				var arNow2 = 0;
				var sumSize = 0;

				for( var i = 0; i < e.children.length; i++ )
				{

					console.log(e.children[i]);

					if( mode == 0 ) // vertical
					{
						sumSize = sumSize + t.size( e.children[i] );

						arLast = arNow;
						arLast2 = arNow2;
						var w = k * sumSize / bound.height;
						var arNow = k * t.size( e.children[i] ) / ( w * w );

						if( arNow > 1 )
							arNow = 1 / arNow;

						var arNow2 = k * t.size( e.children[startIdx] ) / ( w * w );

						if( arNow2 > 1 )
							arNow2 = 1 / arNow2;

						if( arNow < arLast || arNow2 < arLast2 || i == e.children.length - 1 )
						{
							if( i == e.children.length - 1 )
							{
								endIdx = i;
							}
							else
							{
								sumSize = sumSize - t.size( e.children[i] );
							}
							
							var w = k * sumSize / bound.height;

							e.children[startIdx].x = bound.x;
							e.children[startIdx].y = bound.y;
							e.children[startIdx].width = w;
							e.children[startIdx].height = 1.0 * bound.height * t.size( e.children[startIdx] ) / sumSize;

							console.log("w ",w);

							for( var j = startIdx + 1; j <= endIdx; j++ )
							{
								e.children[j].x = bound.x;
								e.children[j].y = e.children[j - 1].y + e.children[j - 1].height;
								e.children[j].width = w;
								e.children[j].height = 1.0 * bound.height * t.size( e.children[j] ) / sumSize;
							}
							mode = 1;

							bound.x = bound.x + w;
							bound.width = bound.width - w;

							startIdx = endIdx = i;
							arLast = arNow = arLast2 = arNow2 = 0;
							sumSize = 0;
							if( i != e.children.length - 1 )
								i = i - 1;
						}
						else
							endIdx = i;
					}
					else // horizontal
					{
						sumSize = sumSize + t.size( e.children[i] );

						arLast = arNow;
						arLast2 = arNow2;

						arLast = arNow;
						var h = k * sumSize / bound.width;

						var arNow = k * t.size( e.children[i] ) / ( h * h );

						if( arNow > 1 )
							arNow = 1 / arNow;

						var arNow2 = k * t.size( e.children[startIdx] ) / ( h * h );

						if( arNow2 > 1 )
							arNow2 = 1 / arNow2;

						if( arNow < arLast || arNow2 < arLast2 || i == e.children.length - 1 )
						{
							if( i == e.children.length - 1 )
							{
								endIdx = i;
							}
							else
							{
								sumSize = sumSize - t.size( e.children[i] );
							}

							var h = k * sumSize / bound.width;

							e.children[startIdx].x = bound.x;
							e.children[startIdx].y = bound.y;
							e.children[startIdx].width = 1.0 * bound.width * t.size( e.children[startIdx] ) / sumSize;
							e.children[startIdx].height = h;
							for( var j = startIdx + 1; j <= endIdx; j++ )
							{
								e.children[j].x = e.children[j - 1].x + e.children[j - 1].width;
								e.children[j].y = bound.y;
								e.children[j].width = 1.0 * bound.width * t.size( e.children[j] ) / sumSize;
								e.children[j].height = h;
							}
							mode = 0;

							bound.y = bound.y + h;
							bound.height = bound.height - h;

							startIdx = endIdx = i;
							arLast = arNow = arLast2 = arNow2 = 0;
							sumSize = 0;

							if( i != e.children.length - 1 )
								i = i - 1;
						}
						else
							endIdx = i;
					}
				}
			}	
		});

	},

	render: function()
	{
		var canvas = this.canvas;
		var data = this.data;

		var ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		this.bfs(data, function(e){
			

			ctx.beginPath();
			ctx.lineWidth="1";
			ctx.strokeStyle="white";
			ctx.rect(e.x, e.y, e.width, e.height);
			ctx.stroke();
			
			if( "color" in e )
			{
				ctx.fillStyle = e.color;
				ctx.fillRect(e.x, e.y, e.width, e.height);				
			}

			if( "size" in e )
			{
				ctx.fillStyle = "white";
				ctx.fillText(e.name, e.x, e.y+10);				
			}


			console.log(e.name, e.x, e.y, e.width, e.height);
			
		})
	}

}




function Queue(capacity)
{
	this.capacity = capacity;
	this.array = [];
	this.head = 0;
	this.tail = -1;;

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