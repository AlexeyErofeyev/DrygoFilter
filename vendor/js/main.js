new Promise(function(resolve) {// Дожидаемся загрузки строници
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
		},2)
	})
}).then(function() {// Берем список ID друзей и передаем его в виде строки в следующий THEN();
	return new Promise(function(resolve,reject) {
		VK.api('friends.get',{},function(res) {
			if(res.error){
				reject(new Error(res.error.error_msg));
			} else {
				resolve(res.response.join(','));
			}
		})
	})
}).then(function(friends) {//Берем имя, фамилию и адрес фото каждого друга и передаем в виде массива в следующий THEN();
	return new Promise(function(resolve, reject){
		VK.api("users.get", {user_ids:friends,fields:'photo_100'}, function(res) {
		    if(res.error){
				reject(new Error(res.error.error_msg));
			} else {
				resolve(res.response);
			}
		}); 
	})
}).then(function(arr) {// Выводим списокт друзей
	return new Promise(function(resolve, reject){
		var sourse   = document.getElementById('friends-template').innerHTML,
		    template = Handlebars.compile(sourse),
		    html     = template({'friends':arr});
		    
		document.getElementById('mainList').innerHTML = html;

	})
})

.catch(function(e) {
        alert('Ошибка: ' + e.message);
    });