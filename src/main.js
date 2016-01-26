/*
	Filar v0.0.1
	author: Joseph Thomas
	Date:	Jan 17, 2016
*/



//Every 3 bytes is encoded as 4 bytes of base64
//Thus, the chunk size must be a multiple of 4
	
var CHUNK_SIZE	=	3600;


/*
*	Filar Constructor
*	
*	@param	{JSON Object}	options
*		@key	{Integer}	maxSize	-	The max file size, uploadeable, need to check on server side too 
*
*	@return {Filar Object}
*/

function Filar(options){
	this.maxSize	=	options.maxSize||10E6	//set the default max size as 10MB
	
	return this;
};


/*
*	Filar	attachImage	-	allows an element to recieve image uploads
*	
*	@param	{String}	id	- the HTML id of the element
*	@param	{Function}	callback	-	the callback
*		@param	{JSON Object}	data
*			@key	{String}	full	-	the full amount of base64 for resiszing
*			@key	{JSON Object}	header	-	a header to upload it to the server (see the objectfor more info)
*			@key	{Array}	chunks	-	a bunch of chunks
*/

Filar.prototype.attachImage	=	function(id,callbacks){

	var _element	=	document.getElementById(id);

	//The input is set to visible and set in front of the element. 
	//So, people beleieve they're clicking on an image
	var _input	=	document.createElement('input');
	this.setInput(_input,_element);

	//When something changes, it means someone's tryna upload something
	_input.addEventListener('change',function(){
		//This is not a multifile uploader
		var _file	=	_input.files[0];
		if(_file.type.match('image.*')){ /*Make sure it's an image*/
			
			var _reader	=	new FileReader();
			
			_reader.onload	=	function(e){
				console.log(e.target);
				callbacks.done&&callbacks.done(e.target.result);
			}
			
			_reader.readAsDataURL(_file);
		}else{
//			Tell the user it's not a real image
			callbacks.error&&callbacks.error({code:1,error:'Not Image'});
		}
	});







		
//	Add the image to the element
	
//		Read the uploaded image and send to callback
	
}

Filar.prototype.attachFile	=	function(id,callbacks){
	var _this	=	this;
	
	var _element	=	document.getElementById(id);
//	Create the file input 
	var _input	=	document.createElement('input');
//	Add the image to the element
	this.setInput(_input,_element);
	
//		Read the uploaded image and send to callback
	_input.addEventListener('change',function(){
		
		var _file	=	_input.files[0];
		var _reader	=	new FileReader();

		_reader.onload	=	function(e){
			//Return a proper chunked version to the user
			callbacks.done&&callbacks.done(
				_this.chunk(_file,e.target.result)
			);
		}

		_reader.readAsDataURL(_file);
		
	});
	
}

Filar.prototype.setInput	=	function(input,element){
	//	make sure the input has the basic properties
	input.type	=	'file';
	input.accept	=	"image/*";
	
	//	make the input exactly the same as the element
	input.style.opacity	=	'0';
	input.style.position	=	'absolute';
	input.style.cursor	=	this.getStyle(element,'cursor');
	input.style.height	=	this.getStyle(element,'height');
	input.style.width		=	this.getStyle(element,'width');
	input.style.top		=	this.getStyle(element,'top');
	input.style.left		=	this.getStyle(element,'left');
	input.style.bottom		=	this.getStyle(element,'bottom');
	input.style.right		=	this.getStyle(element,'right');
	input.style.margin		=	this.getStyle(element,'margin');
	input.style.borderRadius	=	this.getStyle(element,'borderRadius');
	input.style.zIndex	=	10000;
			
	console.log(element,input);
	element.parentNode.insertBefore(input,element);
}


Filar.prototype.getStyle	=	function(el,styleProp){
//	You can only get percentage CSS values when the element is not displayed
	el.style.display	=	'none';
    if (el.currentStyle)
        var y = el.currentStyle[styleProp];
    else if (window.getComputedStyle)
        var y = document.defaultView.getComputedStyle(el,null).getPropertyValue(styleProp);
	el.style.display	=	'block';
    return y;
}

Filar.prototype.chunk	=	function(file,base64){
	var	_headerData	=	{
		fileName:file.name,
		fileSize:file.size,
		chunkSize:CHUNK_SIZE,
		chunkAmount:0,
		fileType:file.type,
		fileExtension:''
	};
	
	var _chunkData	=	{
		header:_headerData,	//Because objects are passed by reference
		data:[]
	};
	
	
	//The only place the extension is in the name
	var _nameArray	=	file.name.split('.');
	//Incase the file has no extension
	if(_nameArray.length>1){
		_headerData.fileExtension	=	_nameArray[_nameArray.length-1];
	}
	_headerData.name	=	_nameArray[0];
	
	//this is the actual data 8utifdhgfdouaw8e
	var _base64Raw	=	base64.split(',')[1];
	
	
	
	
	var	_numChunks	=	parseInt(base64.length/CHUNK_SIZE);
	_headerData.chunkAmount	=	_numChunks;
	//get rid of this if the chunk size is bigger than the string itself
	if(_numChunks===0){
		_chunkData.data	=	[base64];
		return _chunkData;		
	}
	
	for(var i = 0;i<_numChunks;i++){
		_chunkData.data.push(
			_base64Raw.substr(
				(i*CHUNK_SIZE),	//start at the chunk
				CHUNK_SIZE	// It's only as big as the chunk, substr will reconcile overflow.
			)
		);
	}
	return _chunkData;
}
