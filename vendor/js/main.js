new Promise(function(resolve) {// Дожидаемся загрузки страницы
	if(document.radyState === 'complite'){
		resolve();
	} else {
		window.onload = resolve;
	}
}).then(function() {// Инициализируем приложение и запрашиваем разрешение
	return new Promise(function(resolve, reject) {
		VK.init({
        apiId: 5374137 
	    });

		VK.Auth.login(function(res) {
			if(res.session){
				resolve();
			} else {
				reject(new Error('Не удалось авторизоваться'));
			}
		},2);
	});
}).then(function() {// Берем список ID друзей и передаем его в виде строки в следующий THEN();
	return new Promise(function(resolve,reject) {
		// if(localStorage.right_col || localStorage.left_col){

		// } else {
			VK.api('friends.get',{},function(res) {
				if(res.error){
					reject(new Error(res.error.error_msg));
				} else {
					resolve(res.response.join(','));
				}
			});
		// }
			
	});
}).then(function(friends) {//Берем имя, фамилию и адрес фото каждого друга и передаем в виде строки в localStorage;
	return new Promise(function(resolve, reject){
		VK.api("users.get", {user_ids:friends,fields:'photo_100'}, function(res) {
		    if(res.error){
				reject(new Error(res.error.error_msg));
			} else {
				localStorage.setItem('mainArr',JSON.stringify(res.response));
				resolve();
			}
		}); 
	});
}).then(function() {// Выводим списокт друзей
	return new Promise(function(resolve, reject){
		    
		servant.render(JSON.parse(localStorage.mainArr),'mainList','left_col',resolve);

	});

}).then(function() {// Добавляем обработчики событий
	var left_col   = document.getElementById('left_col'),
		right_col  = document.getElementById('right_col'), 
		ul_right   = document.getElementById('selected_friends'),
		ul_left    = document.getElementById('mainList'),
		left_inp   = document.getElementById('left_inp'),
		right_inp  = document.getElementById('right_inp'),
		mainArr    = JSON.parse(localStorage.mainArr),
		save       = document.getElementById('save');
		var id = '';
		var selectedArr = [];

// ПЕРЕТАСКИВАНИЕ НАЧАЛО
var dragstart = function(e) {
	if(e.target.tagName === 'LI'){
		 id = e.target.id;

		e.dataTransfer.setData("text/html",e.target.outerHTML);
		localStorage.setItem(e.target.id, servant.find(e.target.id));
	}
};

var dragover = function(e) {
	e.preventDefault();
};

	left_col.addEventListener('dragstart',dragstart);
	right_col.addEventListener('dragstart',dragstart);

	left_col.addEventListener('dragover',dragover);
	right_col.addEventListener('dragover',dragover);	


	right_col.addEventListener('drop',function(e) {	

		servant.relocate(mainArr,selectedArr,id);
		servant.render(mainArr,'mainList','left_col');
		servant.render(selectedArr,'selected_friends','right_col');

		if(left_inp.value){ left_inp.dispatchEvent(new Event('keyup')); }

	});

	left_col.addEventListener('drop',function(e) {	

		servant.relocate(selectedArr,mainArr,id);
		servant.render(mainArr,'mainList','left_col');
		servant.render(selectedArr,'selected_friends','right_col');
		
		if(right_inp.value){ right_inp.dispatchEvent(new Event('keyup')); }

	});


// ПЕРЕТАСКИВАНИЕ КОНЕЦ

// КЛИКИ НАЧАЛО

	left_col.addEventListener('click',function(e) {
		if(e.target.classList.contains('cross')){
			var id = e.target.parentNode.parentNode.id;

			servant.relocate(mainArr,selectedArr,id);
			servant.render(mainArr,'mainList','left_col');
			servant.render(selectedArr,'selected_friends','right_col');

			if(left_inp.value){ left_inp.dispatchEvent(new Event('keyup')); }
			if(right_inp.value){ right_inp.dispatchEvent(new Event('keyup')); }
		}
	});

	right_col.addEventListener('click',function(e) {
		if(e.target.classList.contains('cross')){
			var id = e.target.parentNode.parentNode.id;

			servant.relocate(selectedArr,mainArr,id);
			servant.render(mainArr,'mainList','left_col');
			servant.render(selectedArr,'selected_friends','right_col');

			if(left_inp.value){ left_inp.dispatchEvent(new Event('keyup')); }
			if(right_inp.value){ right_inp.dispatchEvent(new Event('keyup')); }
		}
	});

// КЛИКИ КОНЕЦ
// INPUT НАЧАЛО

	left_inp.addEventListener('keyup',function(e) {
		var newArr = [];
		if(e.target.value){
			servant.match(mainArr,newArr,e.target.value);
			servant.render(newArr,'mainList','left_col');
		} else {
			servant.render(mainArr,'mainList','left_col');
		}
			
	});

	right_inp.addEventListener('keyup',function(e) {
		var newArr = [];
		if(e.target.value){
			servant.match(selectedArr,newArr,e.target.value);
			servant.render(newArr,'friends_list','right_col');
		} else {
			servant.render(selectedArr,'friends_list','right_col');
		}
			
	});
		

// INPUT КОНЕЦ

// СОХРАНЕНИЕ НАЧАЛО

 save.addEventListener('click',function(e) {
 	var fromRight = JSON.stringify(selectedArr);
 	var fromLeft  = JSON.stringify(mainArr);
 	localStorage.right_col = fromRight;
 	localStorage.left_col = fromLeft;
 })

// СОХРАНЕНИЕ КОНЕЦ

})//then

.catch(function(e) {
        alert('Ошибка: ' + e.message);
    });



var servant =  (function ( ) {
	var privat = {
		render:function(arr,id,parent,resolve) {
			var sourse   = document.getElementById('friends-template').innerHTML,
			    template = Handlebars.compile(sourse),
			    html     = template({'friends':arr,'id':id});

		    document.getElementById(parent).innerHTML = html;

		    if(resolve){
		    	resolve();
		    }
		},
		find: function(ID) {

			var arr = JSON.parse(localStorage.mainArr);
			for(var i = 0, len = arr.length; i < len; i++){

				if(arr[i].uid == ID){ return JSON.stringify(arr[i]); }
			}

		},
		relocate:function (from,to,ID) {
			var index;
			for(var i = 0, len = from.length; i < len; i++){
				if(from[i].uid == ID){
					to.push(from[i]);
					index = i; 
				} 
			}
			from.splice(index,1);
		},
		match:function(from,to,string) {
			
			from.forEach(function(item, i) {
				if(item.first_name.toLowerCase().indexOf(string.toLowerCase()) !== -1 || item.last_name.toLowerCase().indexOf(string.toLowerCase()) !== -1){
					to.push(item);
				}
			})
			
		}
	}	
		
    return {
    	render    : privat.render,
    	find      : privat.find,
    	relocate  : privat.relocate,
    	match     : privat.match
};
}());